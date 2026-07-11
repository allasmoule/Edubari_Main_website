-- =============================================================================
-- SQL SCHEMA FOR SUPABASE POSTGRESQL DATABASE (Edubari Central Website)
-- This master script creates all tables, constraints, functions, triggers,
-- and seeds the entire database in ONE SINGLE CLICK.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =============================================================================

--------------------------------------------------------------------------------
-- 0. CLEAN RESET BLOCK (Drops all tables cascadingly to support 1-click redeployments)
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.domain_ai_transactions CASCADE;
DROP TABLE IF EXISTS public.domain_ai_credits CASCADE;
DROP TABLE IF EXISTS public.ai_purchase_requests CASCADE;
DROP TABLE IF EXISTS public.ai_packages CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.work_proofs CASCADE;
DROP TABLE IF EXISTS public.subscription_requests CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. CLIENTS TABLE (SaaS Tenants)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL, -- Match APP_DOMAIN in edubari instances
    phone VARCHAR(50), 
    logo_url TEXT, 
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON public.clients(domain);

--------------------------------------------------------------------------------
-- 2. SUBSCRIPTION PLANS TABLE (For standard SaaS packages)
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.plans CASCADE;
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL, -- e.g. 365 for yearly, 30 for monthly
    max_students INTEGER NOT NULL,
    max_instructors INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    features TEXT[] NOT NULL, -- Array of plan features
    plan_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'business', 'enterprise'
    max_batches INTEGER DEFAULT 1,
    monthly_ai_credits INTEGER DEFAULT 0,
    show_branding BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    feature_gates JSONB DEFAULT '{}'::jsonb,
    old_price NUMERIC(10, 2),
    price_label VARCHAR(255),
    duration VARCHAR(100),
    description TEXT,
    popular BOOLEAN DEFAULT false,
    badge VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS TABLE (Tenants subscription logs)
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- 3.5. SUBSCRIPTION REQUESTS TABLE (Public signups)
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.subscription_requests CASCADE;
CREATE TABLE public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_domain VARCHAR(255) NOT NULL,
    address TEXT,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    selected_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    selected_plan_name VARCHAR(255),
    selected_plan_duration INTEGER,
    selected_plan_price NUMERIC(10, 2),
    verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 4. WORK PROOFS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

--------------------------------------------------------------------------------
-- 5. BLOG POSTS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

--------------------------------------------------------------------------------
-- 6. CONTACT MESSAGES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

--------------------------------------------------------------------------------
-- 7. BANNERS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    subtitle TEXT,
    image TEXT NOT NULL,
    alt VARCHAR(255),
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 8. AI SUBSCRIPTION PACKAGES TIER TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    validity_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    highlight BOOLEAN DEFAULT FALSE,
    currency VARCHAR(10) DEFAULT 'BDT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 9. AI PURCHASE TRANSACTIONS & MANUAL REVIEW QUEUE (bKash/Nagad Reviews)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL, -- School subdomain (e.g. school1.edubari.bd)
    package_id UUID REFERENCES public.ai_packages(id),
    user_name VARCHAR(255),
    user_phone VARCHAR(50),
    credits INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BDT',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

--------------------------------------------------------------------------------
-- 10. DOMAIN ACTIVE AI CREDIT LEDGER (Stores active shared credit balance per tenant)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domain_ai_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'school1.edubari.bd'
    remaining_credits INT NOT NULL DEFAULT 0 CHECK (remaining_credits >= 0),
    total_credits_purchased INT NOT NULL DEFAULT 0 CHECK (total_credits_purchased >= 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT domain_credits_expiry_check CHECK (
        (remaining_credits = 0 AND expires_at IS NULL) OR 
        (remaining_credits > 0 AND expires_at IS NOT NULL)
    )
);

--------------------------------------------------------------------------------
-- 11. DOMAIN AI TRANSACTION LEDGER (Tracks usage by feature and teacher)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domain_ai_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL,
    teacher_id UUID NOT NULL, -- The specific teacher who used the credit
    teacher_name VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'usage', 'expiry', 'refund')),
    feature VARCHAR(50) NOT NULL CHECK (feature IN ('presentation', 'question_maker', 'batch_cover', 'billing')),
    amount INT NOT NULL, -- e.g. -1 for generation, +50 for package purchase
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimize queries using indexes
CREATE INDEX IF NOT EXISTS idx_domain_credits ON public.domain_ai_credits(domain);
CREATE INDEX IF NOT EXISTS idx_domain_transactions ON public.domain_ai_transactions(domain);

--------------------------------------------------------------------------------
-- 12. TEAM MEMBERS TABLE (About Page)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 13. FEATURE VIDEOS TABLE (Home Page Demo Videos)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feature_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_title VARCHAR(255) UNIQUE NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 14. COLLECTED LEADS TABLE (Newsletter)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collected_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- DATABASE PROCEDURES & TRIGGERS
--------------------------------------------------------------------------------

-- Trigger helper to automatically update "updated_at" timestamps
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

DROP TRIGGER IF EXISTS set_domain_ai_credits_updated_at ON public.domain_ai_credits;
CREATE TRIGGER set_domain_ai_credits_updated_at
    BEFORE UPDATE ON public.domain_ai_credits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_team_members_updated_at ON public.team_members;
CREATE TRIGGER set_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_feature_videos_updated_at ON public.feature_videos;
CREATE TRIGGER set_feature_videos_updated_at
    BEFORE UPDATE ON public.feature_videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Safe credit increment transaction RPC function called by central API server
CREATE OR REPLACE FUNCTION public.add_domain_credits(
  target_domain VARCHAR,
  credits_to_add INT,
  validity_days INT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.domain_ai_credits (domain, remaining_credits, total_credits_purchased, expires_at)
  VALUES (
    target_domain, 
    credits_to_add, 
    credits_to_add, 
    NOW() + (validity_days || ' days')::INTERVAL
  )
  ON CONFLICT (domain) DO UPDATE SET
    remaining_credits = domain_ai_credits.remaining_credits + credits_to_add,
    total_credits_purchased = domain_ai_credits.total_credits_purchased + credits_to_add,
    expires_at = COALESCE(domain_ai_credits.expires_at, NOW()) + (validity_days || ' days')::INTERVAL,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- DISABLE RLS (Bypasses Row-Level Security for central serverless REST operations)
--------------------------------------------------------------------------------
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_proofs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_ai_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_ai_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_leads DISABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- SEED DATA (Plan setups, mock configurations, and default packages)
--------------------------------------------------------------------------------

-- Seed Standard SaaS Plans
INSERT INTO public.plans (id, plan_name, duration_days, max_students, max_instructors, price, features, plan_tier, max_batches, monthly_ai_credits, show_branding, is_active, sort_order, feature_gates)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'EDUBARI Free', 365, 20, 1, 0.00, ARRAY['Limited Personal Website', 'Personal Profile', 'Limited Student Management', '1 Batch Management', 'Basic Class & Exam System', 'Basic Attendance', 'Basic Payment Tracking', 'Limited Online Class', 'Limited AI Presentation Maker', 'Powered by EDUBARI Branding', '2 AI Credits / Month'], 'free', 1, 2, TRUE, TRUE, 1, '{"personal_website": true, "online_class": true, "recorded_class": false, "ai_presentation": true, "ai_presentation_limited": true, "guardian_portal": false, "advanced_analytics": false, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": false, "student_performance": false, "assignment_system": false, "payment_tracking": true}'::jsonb),
('f0000000-0000-0000-0000-000000000002', 'EDUBARI Starter', 30, 100, 1, 250.00, ARRAY['Personal Digital Academy', 'Personal Website & Profile', 'Student & Batch Management', 'Monthly Payment & Due Tracking', 'Online & Recorded Class', 'Exam, Result & Assignment', 'Auto Attendance', 'AI Presentation Maker', 'Student Performance Tracking', 'Course Management', '10 AI Credits / Month'], 'starter', 5, 10, FALSE, TRUE, 2, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": false, "advanced_analytics": false, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true}'::jsonb),
('f0000000-0000-0000-0000-000000000003', 'EDUBARI Professional', 30, 300, 1, 350.00, ARRAY['Starter Plan-এর সকল সুবিধা', 'অধিক Student & Batch', 'Advanced Student Analytics', 'Guardian Portal', 'Smart Payment Tracking', 'Advanced AI Tools', 'Personal Branded Platform', 'Online + Offline Class', 'Advanced Reports & Analytics', 'Priority Support', '15 AI Credits / Month'], 'professional', 15, 15, FALSE, TRUE, 3, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": false, "salary_management": false, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true}'::jsonb),
('f0000000-0000-0000-0000-000000000004', 'EDUBARI Business', 30, 500, 10, 550.00, ARRAY['Multiple Teacher Management', 'Student & Batch Management', 'Batch-wise Payment System', 'Teacher Activity Tracking', 'Student Performance Tracking', 'Guardian Portal & Notification', 'Teacher Salary Management', 'Online + Offline Class', 'Exam, Assignment & Result', 'AI Presentation Maker', 'Branded Website & Platform', 'Advanced Analytics', '30 AI Credits / Month'], 'business', 30, 30, FALSE, TRUE, 4, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": true, "salary_management": true, "custom_branding": false, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true}'::jsonb),
('f0000000-0000-0000-0000-000000000005', 'EDUBARI Enterprise', 30, 2000, 50, 700.00, ARRAY['Complete Institution Management', 'Multiple Teacher & Student Management', 'Department & Campus Management', 'Teacher Class Tracking', 'Auto Attendance System', 'Student Performance Analytics', 'Guardian Monitoring', 'Payment & Salary Management', 'AI-Powered Education Tools', 'Custom Website & App', 'Central Digital Dashboard', 'Upazila & District Level Monitoring', 'Advanced Analytics & Reports', 'Dedicated Support', 'Custom Development & Integration', '50 AI Credits / Month'], 'enterprise', 999, 50, FALSE, TRUE, 5, '{"personal_website": true, "online_class": true, "recorded_class": true, "ai_presentation": true, "ai_presentation_limited": false, "guardian_portal": true, "advanced_analytics": true, "multi_teacher": true, "salary_management": true, "custom_branding": true, "course_management": true, "student_performance": true, "assignment_system": true, "payment_tracking": true, "payment_tracking_advanced": true, "custom_development": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Standard Active Clients (For local & live tenant testing)
INSERT INTO public.clients (id, client_name, domain, phone, status)
VALUES 
('c1000000-0000-0000-0000-000000000001', 'AVA School & College', 'ava.edubari.bd', '+8801700000001', 'active'),
('c1000000-0000-0000-0000-000000000002', 'School 1 Demo', 'school1.edubari.bd', '+8801700000002', 'active'),
('c1000000-0000-0000-0000-000000000003', 'Asif Rabetul Personal Domain', 'asifrabetul.com', '+8801700000003', 'active'),
('c1000000-0000-0000-0000-000000000101', 'Local Testing Environment', 'localhost', '+8801700000000', 'active'),
('c1000000-0000-0000-0000-000000000102', 'Local Loopback Environment', '127.0.0.1', '+8801700000000', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Client Subscriptions
INSERT INTO public.subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', NOW(), NOW() + INTERVAL '365 days', NOW() + INTERVAL '372 days', TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '37 days', TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', NOW(), NOW() + INTERVAL '365 days', NOW() + INTERVAL '372 days', TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000101', 'c1000000-0000-0000-0000-000000000101', 'f0000000-0000-0000-0000-000000000005', NOW(), NOW() + INTERVAL '365 days', NOW() + INTERVAL '372 days', TRUE, 'paid'),
('a1000000-0000-0000-0000-000000000102', 'c1000000-0000-0000-0000-000000000102', 'f0000000-0000-0000-0000-000000000005', NOW(), NOW() + INTERVAL '365 days', NOW() + INTERVAL '372 days', TRUE, 'paid')
ON CONFLICT (id) DO NOTHING;

-- Seed AI Credits for the domains
INSERT INTO public.domain_ai_credits (domain, remaining_credits, total_credits_purchased, expires_at)
VALUES
('ava.edubari.bd', 500, 500, NOW() + INTERVAL '365 days'),
('school1.edubari.bd', 150, 150, NOW() + INTERVAL '365 days'),
('asifrabetul.com', 1000, 1000, NOW() + INTERVAL '365 days'),
('localhost', 1000, 1000, NOW() + INTERVAL '365 days'),
('127.0.0.1', 1000, 1000, NOW() + INTERVAL '365 days')
ON CONFLICT (domain) DO NOTHING;

-- Seed default AI package plans (Starter, Pro, Power Packs)
INSERT INTO public.ai_packages (id, name, credits, price, validity_days, is_active, highlight, currency)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Starter Pack', 5, 99.00, 30, TRUE, FALSE, 'BDT'),
  ('b0000000-0000-0000-0000-000000000002', 'Pro Pack', 10, 179.00, 30, TRUE, TRUE, 'BDT'),
  ('b0000000-0000-0000-0000-000000000003', 'Power Pack', 20, 299.00, 30, TRUE, FALSE, 'BDT')
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- SEED ADMIN USER CREDENTIAL IN SUPABASE AUTH
--------------------------------------------------------------------------------
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
