-- LISTIVO PostgreSQL Schema Foundation (Phase 1)
-- Requires uuid-ossp extension for uuid generation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'owner', 'admin', 'user'
  plan VARCHAR(50) NOT NULL DEFAULT 'free', -- 'lifetime_free', 'free', 'starter', 'pro'
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'trialing'
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(50),
  gstin VARCHAR(50),
  pickup_address TEXT,
  pickup_pincode VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 3. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- 4. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  marketplace VARCHAR(50) NOT NULL DEFAULT 'meesho',
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  brand VARCHAR(100) DEFAULT '',
  material VARCHAR(100) DEFAULT '',
  description TEXT DEFAULT '',
  gst_rate NUMERIC(5, 2) DEFAULT 12.00,
  hsn_code VARCHAR(20) DEFAULT '',
  weight_grams INTEGER DEFAULT 300,
  length_cm NUMERIC(6, 2),
  width_cm NUMERIC(6, 2),
  height_cm NUMERIC(6, 2),
  default_price NUMERIC(10, 2) DEFAULT 0.00,
  mrp NUMERIC(10, 2) DEFAULT 0.00,
  return_policy TEXT DEFAULT '',
  care_instructions TEXT DEFAULT '',
  sku_prefix VARCHAR(50) DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- 5. TEMPLATE ATTRIBUTES TABLE
CREATE TABLE IF NOT EXISTS template_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  label VARCHAR(150) NOT NULL,
  attribute_value TEXT DEFAULT '',
  field_type VARCHAR(50) DEFAULT 'text',
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_template_attributes_template_id ON template_attributes(template_id);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  marketplace VARCHAR(50) DEFAULT 'meesho',
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) DEFAULT '',
  material VARCHAR(100) DEFAULT '',
  description TEXT DEFAULT '',
  mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5, 2) DEFAULT 12.00,
  hsn_code VARCHAR(20) DEFAULT '',
  weight_grams INTEGER DEFAULT 300,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'INCOMPLETE', 'READY', 'EXPORTED'
  variants_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  color VARCHAR(50) DEFAULT '',
  size VARCHAR(50) DEFAULT '',
  stock INTEGER DEFAULT 0,
  price NUMERIC(10, 2) DEFAULT 0.00,
  mrp NUMERIC(10, 2) DEFAULT 0.00,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- 8. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- 9. CSV IMPORTS TABLE
CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  total_rows INTEGER DEFAULT 0,
  valid_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_csv_imports_user_id ON csv_imports(user_id);

-- 10. CSV ERRORS TABLE
CREATE TABLE IF NOT EXISTS csv_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID NOT NULL REFERENCES csv_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  column_name VARCHAR(100),
  error_message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'ERROR', -- 'ERROR', 'WARNING'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_csv_errors_import_id ON csv_errors(import_id);

-- 11. KEYWORD SEARCHES TABLE
CREATE TABLE IF NOT EXISTS keyword_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keyword_searches_user_id ON keyword_searches(user_id);

-- 12. GENERATED CONTENT TABLE
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_type VARCHAR(50) NOT NULL, -- 'title', 'description', 'smart_listing', 'keywords'
  input_params JSONB NOT NULL,
  output_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);

-- 13. IMAGE JOBS TABLE
CREATE TABLE IF NOT EXISTS image_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  job_type VARCHAR(50) DEFAULT 'bg_removal',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_image_jobs_user_id ON image_jobs(user_id);

-- 14. CALCULATOR PRESETS TABLE
CREATE TABLE IF NOT EXISTS calculator_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculator_presets_user_id ON calculator_presets(user_id);

-- 15. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- 16. EXTENSION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS extension_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  extension_version VARCHAR(20),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extension_sessions_user_id ON extension_sessions(user_id);
