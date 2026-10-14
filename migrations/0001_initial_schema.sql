-- EduBari central website — PostgreSQL schema (replaces the old MySQL schema_mysql.sql).
--
-- Applied by `npm run db:migrate` (scripts/db-migrate.js) inside one transaction.
-- Never edit this file after it has been applied anywhere: add a new numbered migration instead.
--
-- Conventions
--   * ids are VARCHAR(36) UUID strings (same values as the MySQL data, so imports keep every link)
--   * every timestamp is TIMESTAMPTZ; updated_at is maintained by the set_updated_at() trigger
--   * MySQL ENUMs became VARCHAR + CHECK constraints, JSON columns became JSONB

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Admin users (only admins can sign in to this website)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,              -- "scrypt$salt$hash" (legacy SHA-256 hex upgraded on login)
  role        VARCHAR(50)  NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX users_email_lower_key ON users (LOWER(email));

-- ---------------------------------------------------------------------------
-- Clients (schools / teachers using EduBari)
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
  id             VARCHAR(36)  PRIMARY KEY,
  client_name    VARCHAR(255) NOT NULL,
  domain         VARCHAR(255) NOT NULL UNIQUE,
  phone          VARCHAR(50),
  logo_url       TEXT,
  status         VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  client_type    VARCHAR(20)  NOT NULL DEFAULT 'single_teacher' CHECK (client_type IN ('single_teacher', 'school_erp')),
  erp_api_token  VARCHAR(64)  UNIQUE,
  erp_secret     VARCHAR(64),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Subscription plans
-- ---------------------------------------------------------------------------
CREATE TABLE plans (
  id                  VARCHAR(36)    PRIMARY KEY,
  plan_name           VARCHAR(255)   NOT NULL,
  plan_type           VARCHAR(20)    NOT NULL DEFAULT 'single_teacher' CHECK (plan_type IN ('single_teacher', 'school_erp')),
  duration_days       INTEGER        NOT NULL,
  max_students        INTEGER        NOT NULL,
  max_instructors     INTEGER        NOT NULL,
  price               NUMERIC(10, 2) NOT NULL,
  features            JSONB          NOT NULL DEFAULT '[]'::jsonb,
  plan_tier           VARCHAR(50)    DEFAULT 'free',
  max_batches         INTEGER        DEFAULT 1,
  monthly_ai_credits  INTEGER        DEFAULT 0,
  show_branding       BOOLEAN        DEFAULT TRUE,
  is_active           BOOLEAN        DEFAULT TRUE,
  sort_order          INTEGER        DEFAULT 0,
  feature_gates       JSONB,
  old_price           NUMERIC(10, 2),
  price_label         VARCHAR(255),
  duration            VARCHAR(100),
  description         TEXT,
  popular             BOOLEAN        DEFAULT FALSE,
  badge               VARCHAR(100),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Subscriptions (one row per term; exactly one is_current row per client)
-- ---------------------------------------------------------------------------
CREATE TABLE subscriptions (
  id              VARCHAR(36) PRIMARY KEY,
  client_id       VARCHAR(36) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_id         VARCHAR(36) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  start_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date        TIMESTAMPTZ NOT NULL,
  grace_end_date  TIMESTAMPTZ NOT NULL,
  is_current      BOOLEAN     NOT NULL DEFAULT TRUE,
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subscriptions_client_idx ON subscriptions (client_id);
CREATE INDEX subscriptions_plan_idx ON subscriptions (plan_id);
-- A school can never have two "current" subscriptions (the old MySQL schema allowed it)
CREATE UNIQUE INDEX subscriptions_one_current_per_client ON subscriptions (client_id) WHERE is_current;

-- ---------------------------------------------------------------------------
-- School ERP connections (heartbeat tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE erp_connections (
  id                 VARCHAR(36)  PRIMARY KEY,
  client_id          VARCHAR(36)  NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  domain             VARCHAR(255) NOT NULL,
  erp_api_token      VARCHAR(64)  NOT NULL UNIQUE,
  laravel_version    VARCHAR(20),
  erp_version        VARCHAR(50),
  last_ping_at       TIMESTAMPTZ,
  connection_status  VARCHAR(20)  DEFAULT 'pending' CHECK (connection_status IN ('connected', 'disconnected', 'pending')),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX erp_connections_client_idx ON erp_connections (client_id);
CREATE INDEX erp_connections_domain_idx ON erp_connections (domain);

-- ---------------------------------------------------------------------------
-- School ERP subscription payments (bKash / Nagad gateway, or recorded by an admin)
-- ---------------------------------------------------------------------------
CREATE TABLE subscription_payments (
  id                  VARCHAR(36)    PRIMARY KEY,
  client_id           VARCHAR(36)    NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_id             VARCHAR(36)    REFERENCES plans(id) ON DELETE SET NULL,
  subscription_id     VARCHAR(36),
  method              VARCHAR(10)    NOT NULL CHECK (method IN ('bkash', 'nagad', 'manual')),
  source              VARCHAR(10)    NOT NULL DEFAULT 'gateway' CHECK (source IN ('gateway', 'admin')),
  channel             VARCHAR(30),
  periods             INTEGER        NOT NULL DEFAULT 1,
  amount              NUMERIC(10, 2) NOT NULL,
  currency            CHAR(3)        NOT NULL DEFAULT 'BDT',
  status              VARCHAR(10)    NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'completed', 'failed', 'cancelled')),
  merchant_invoice    VARCHAR(40)    NOT NULL UNIQUE,
  gateway_payment_id  VARCHAR(100)   UNIQUE,
  trx_id              VARCHAR(100)   UNIQUE,
  payer_reference     VARCHAR(100),
  return_url          VARCHAR(500),
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  recorded_by         VARCHAR(36),
  note                VARCHAR(500),
  failure_reason      VARCHAR(255),
  gateway_response    TEXT,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX subscription_payments_client_idx ON subscription_payments (client_id, created_at);
CREATE INDEX subscription_payments_status_idx ON subscription_payments (status);

-- ---------------------------------------------------------------------------
-- Security throttles shared by every server instance
-- ---------------------------------------------------------------------------
CREATE TABLE admin_login_attempts (
  ip        VARCHAR(64) PRIMARY KEY,
  attempts  INTEGER     NOT NULL DEFAULT 0,
  reset_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE erp_request_nonces (
  nonce_key   VARCHAR(160) PRIMARY KEY,
  expires_at  TIMESTAMPTZ  NOT NULL
);
CREATE INDEX erp_request_nonces_expiry_idx ON erp_request_nonces (expires_at);

-- ---------------------------------------------------------------------------
-- Orders from the public pricing / checkout pages
-- ---------------------------------------------------------------------------
CREATE TABLE subscription_requests (
  id                      VARCHAR(36)    PRIMARY KEY,
  institution_name        VARCHAR(255)   NOT NULL,
  full_name               VARCHAR(255)   NOT NULL,
  email                   VARCHAR(255)   NOT NULL,
  phone                   VARCHAR(50),
  preferred_domain        VARCHAR(255)   NOT NULL,
  address                 TEXT,
  payment_method          VARCHAR(50),
  transaction_id          VARCHAR(100)   UNIQUE,   -- NULL when the customer gave none (many NULLs allowed)
  selected_plan_id        VARCHAR(36)    REFERENCES plans(id) ON DELETE SET NULL,
  selected_plan_name      VARCHAR(255),
  selected_plan_duration  INTEGER,
  selected_plan_price     NUMERIC(10, 2),
  verified                BOOLEAN        NOT NULL DEFAULT FALSE,
  submitted_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX subscription_requests_submitted_idx ON subscription_requests (submitted_at DESC);

-- ---------------------------------------------------------------------------
-- Website content
-- ---------------------------------------------------------------------------
CREATE TABLE work_proofs (
  id           VARCHAR(36)  PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  image_url    TEXT,
  client_name  VARCHAR(255),
  project_url  TEXT,
  order_index  INTEGER      DEFAULT 1,
  active       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id           VARCHAR(36)  PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  category     VARCHAR(100) NOT NULL DEFAULT 'General',
  cover_image  TEXT,
  excerpt      TEXT,
  content      TEXT         NOT NULL,
  author_name  VARCHAR(100) DEFAULT 'Admin',
  read_time    VARCHAR(50)  DEFAULT '5 min read',
  tags         JSONB,
  active       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_messages (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  subject     VARCHAR(255),
  message     TEXT         NOT NULL,
  read        BOOLEAN      DEFAULT FALSE,
  response    TEXT,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE banners (
  id           VARCHAR(36)  PRIMARY KEY,
  title        VARCHAR(255),
  subtitle     TEXT,
  image        TEXT         NOT NULL,
  alt          VARCHAR(255),
  order_index  INTEGER      DEFAULT 1,
  active       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
  id           VARCHAR(36)  PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  image_url    TEXT,
  order_index  INTEGER      DEFAULT 1,
  active       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE feature_videos (
  id             VARCHAR(36)  PRIMARY KEY,
  feature_title  VARCHAR(255) NOT NULL UNIQUE,
  video_url      TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE collected_leads (
  id          VARCHAR(36)  PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- AI credits
-- ---------------------------------------------------------------------------
CREATE TABLE ai_packages (
  id             VARCHAR(36)    PRIMARY KEY,
  name           VARCHAR(255)   NOT NULL,
  credits        INTEGER        NOT NULL,
  price          NUMERIC(10, 2) NOT NULL,
  validity_days  INTEGER        DEFAULT 30,
  is_active      BOOLEAN        DEFAULT TRUE,
  highlight      BOOLEAN        DEFAULT FALSE,
  currency       VARCHAR(10)    DEFAULT 'BDT',
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_purchase_requests (
  id              VARCHAR(36)    PRIMARY KEY,
  domain          VARCHAR(255)   NOT NULL,
  package_id      VARCHAR(36)    REFERENCES ai_packages(id) ON DELETE SET NULL,
  package_name    VARCHAR(255),
  user_name       VARCHAR(255),
  user_phone      VARCHAR(50),
  credits         INTEGER        NOT NULL,
  price           NUMERIC(10, 2) NOT NULL,
  currency        VARCHAR(10)    DEFAULT 'BDT',
  payment_method  VARCHAR(50),
  transaction_id  VARCHAR(100)   UNIQUE,
  status          VARCHAR(10)    DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
);

CREATE TABLE domain_ai_credits (
  id                       VARCHAR(36)  PRIMARY KEY,
  domain                   VARCHAR(255) NOT NULL UNIQUE,
  remaining_credits        INTEGER      NOT NULL DEFAULT 0,
  total_credits_purchased  INTEGER      NOT NULL DEFAULT 0,
  expires_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE domain_ai_transactions (
  id            VARCHAR(36)  PRIMARY KEY,
  domain        VARCHAR(255) NOT NULL,
  teacher_id    VARCHAR(36)  NOT NULL,
  teacher_name  VARCHAR(255),
  type          VARCHAR(10)  NOT NULL CHECK (type IN ('purchase', 'usage', 'expiry', 'refund')),
  feature       VARCHAR(20)  NOT NULL CHECK (feature IN ('presentation', 'question_maker', 'batch_cover', 'billing')),
  amount        INTEGER      NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX domain_ai_transactions_domain_idx ON domain_ai_transactions (domain);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'clients', 'plans', 'subscriptions', 'erp_connections', 'subscription_payments',
    'work_proofs', 'blog_posts', 'banners', 'team_members', 'feature_videos', 'domain_ai_credits'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t || '_set_updated_at', t);
  END LOOP;
END $$;
