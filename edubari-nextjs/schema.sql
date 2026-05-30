-- SQL Schema for Supabase PostgreSQL Database (Edubari Main Website)
-- This script contains table definitions, constraints, triggers for updated_at, and billing configurations.
-- Run these commands in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql).

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------
-- 1. CLIENTS TABLE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL, -- Match APP_DOMAIN in edubari instances
    phone VARCHAR(50), -- Added phone column
    logo_url TEXT, -- Added logo_url column
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON public.clients(domain);

----------------------------------------------------
-- 2. PLANS TABLE
----------------------------------------------------
-- Drop existing public.plans if transitioning to the multi-tenant plan schema
DROP TABLE IF EXISTS public.plans CASCADE;

CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL, -- e.g. 365 for yearly, 30 for monthly
    max_students INTEGER NOT NULL,
    max_instructors INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    features TEXT[] NOT NULL, -- Array of plan features
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

----------------------------------------------------
-- 3. SUBSCRIPTIONS TABLE
----------------------------------------------------
-- Drop existing public.subscriptions if transitioning to multi-tenant schema
DROP TABLE IF EXISTS public.subscriptions CASCADE;

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT true,
    payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Constraint: Only one current subscription can exist per client at a time
CREATE UNIQUE INDEX IF NOT EXISTS unique_current_subscription ON public.subscriptions (client_id) WHERE (is_current = true);

----------------------------------------------------
-- 4. WORK PROOFS TABLE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    client_name VARCHAR(255),
    project_url TEXT,
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

----------------------------------------------------
-- 5. BLOG POSTS TABLE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_name VARCHAR(100) DEFAULT 'Admin',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

----------------------------------------------------
-- 6. CONTACT MESSAGES TABLE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    response TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

----------------------------------------------------
-- 7. BANNERS TABLE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    subtitle TEXT,
    image TEXT NOT NULL,
    alt VARCHAR(255),
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

----------------------------------------------------
-- TRIGGERS & RLS CONFIG
----------------------------------------------------

-- Disable RLS to allow direct serverless administrative API access
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_proofs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;

-- Helper to automatically update "updated_at" timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_work_proofs_updated_at ON public.work_proofs;
CREATE TRIGGER set_work_proofs_updated_at
    BEFORE UPDATE ON public.work_proofs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_banners_updated_at ON public.banners;
CREATE TRIGGER set_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------
-- SEED DATA (Billing Plans Setup)
----------------------------------------------------
-- Seed Plans
INSERT INTO public.plans (id, plan_name, duration_days, max_students, max_instructors, price, features)
VALUES 
('d5d992f0-583d-4c3e-9bf2-78d10b7f8df1', 'Basic Plan', 30, 200, 10, 1500.00, ARRAY['Smart Student Profiles', 'Basic SMS Alerts', 'Fees Management', 'Attendance Tracker']),
('e8b093f1-694e-5d4f-acf3-89e21c8f9ef2', 'Standard Plan', 365, 1000, 50, 45000.00, ARRAY['All Basic Features', 'Advanced Exam Reports', 'Unlimited SMS Alerts', 'Interactive Mobile App Demo', 'Premium Support'])
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Active Client
INSERT INTO public.clients (id, client_name, domain, status)
VALUES ('fa778899-aabb-ccdd-eeff-001122334455', 'EduBari Demo School', 'demo.edubari.bd', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Active Subscription for the Sample Client (valid for 1 year with a 7-day grace period)
INSERT INTO public.subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
VALUES (
    'aa112233-4455-6677-8899-bbccddeeff00',
    'fa778899-aabb-ccdd-eeff-001122334455',
    'e8b093f1-694e-5d4f-acf3-89e21c8f9ef2',
    timezone('utc'::text, now()),
    timezone('utc'::text, now() + interval '365 days'),
    timezone('utc'::text, now() + interval '372 days'),
    true,
    'paid'
)
ON CONFLICT (id) DO NOTHING;

----------------------------------------------------
-- SEED ADMIN USER CREDENTIAL IN SUPABASE AUTH
----------------------------------------------------
-- Email: asifrabetul@gmail.com | Password: 123456
DO $$
DECLARE
  user_id UUID := '3dfd52ed-c3e8-4973-997f-906169626880';
  email_address VARCHAR := 'asifrabetul@gmail.com';
  pwd_hash VARCHAR := '$2a$10$wKzNn4EagUj.w6yK/Xm4.uz1PqQj1tW3VdJ/Wl9UqC248X26ZzUre';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = email_address) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      email_change_token_current,
      is_sso_user,
      is_anonymous
    )
    VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      email_address,
      pwd_hash,
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Asif Rabetul", "email_verified": true}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      NULL,
      NULL,
      '',
      '',
      '',
      FALSE,
      FALSE
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      user_id,
      jsonb_build_object(
        'sub', user_id::text,
        'email', email_address,
        'email_verified', true
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;
