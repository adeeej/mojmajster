-- MojMajster Database Schema

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'wrench',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Masters
CREATE TYPE master_status AS ENUM ('pending', 'approved', 'rejected', 'banned');

CREATE TABLE masters (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Kysuce',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  service_radius_km INT NOT NULL DEFAULT 30,
  languages TEXT[] NOT NULL DEFAULT '{SK}',
  ico TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  status master_status NOT NULL DEFAULT 'pending',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_masters_category ON masters(category_id);
CREATE INDEX idx_masters_status ON masters(status);
CREATE INDEX idx_masters_city ON masters(city);
CREATE INDEX idx_masters_user ON masters(user_id);

-- Master Photos
CREATE TABLE master_photos (
  id SERIAL PRIMARY KEY,
  master_id INT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_photos_master ON master_photos(master_id);

-- Reviews
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  master_id INT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_master ON reviews(master_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Leads
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  master_id INT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_master ON leads(master_id);

-- Analytics Events
CREATE TYPE event_type AS ENUM ('profile_view', 'phone_click', 'lead_sent');

CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  master_id INT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_master ON analytics_events(master_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);

-- Seed categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Murár', 'murar', 'brick-wall'),
  ('Strechár', 'strechar', 'home'),
  ('Kominár', 'kominar', 'flame'),
  ('Elektrikár', 'elektrikar', 'zap'),
  ('Inštalatér', 'instalater', 'droplets'),
  ('Maliar', 'maliar', 'paintbrush'),
  ('Obkladač', 'obkladac', 'square'),
  ('Stolár', 'stolar', 'tree-pine'),
  ('Zámočník', 'zamocnik', 'lock'),
  ('Podlahár', 'podlahar', 'layers'),
  ('Klampiar', 'klampiar', 'wrench'),
  ('Kúrenár', 'kurenar', 'thermometer'),
  ('Záhradník', 'zahradnik', 'flower'),
  ('Zatepľovač', 'zateplovac', 'shield'),
  ('Stavebná firma', 'stavebna-firma', 'building');

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Masters: public read for approved, owners can edit their own
CREATE POLICY "Approved masters are viewable by everyone" ON masters FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own master profile" ON masters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own master profile" ON masters FOR UPDATE USING (auth.uid() = user_id);

-- Master Photos: public read for approved masters
CREATE POLICY "Photos of approved masters are viewable" ON master_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM masters WHERE masters.id = master_photos.master_id AND (masters.status = 'approved' OR masters.user_id = auth.uid()))
);
CREATE POLICY "Users can manage their own photos" ON master_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM masters WHERE masters.id = master_photos.master_id AND masters.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own photos" ON master_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM masters WHERE masters.id = master_photos.master_id AND masters.user_id = auth.uid())
);

-- Reviews: public read for approved
CREATE POLICY "Approved reviews are viewable" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Leads: masters can read their own leads
CREATE POLICY "Masters can view their leads" ON leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM masters WHERE masters.id = leads.master_id AND masters.user_id = auth.uid())
);
CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (true);

-- Analytics: insert by anyone, read by master owner
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Masters can view their analytics" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM masters WHERE masters.id = analytics_events.master_id AND masters.user_id = auth.uid())
);

-- Admin function (create a service role for admin operations)
-- Admin operations should use supabase service role key on server side

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER masters_updated_at
  BEFORE UPDATE ON masters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add experience fields to masters
ALTER TABLE masters ADD COLUMN IF NOT EXISTS year_founded INT;
ALTER TABLE masters ADD COLUMN IF NOT EXISTS completed_projects INT;
-- response_rate: 0-100, updated when master marks leads as answered. Only shown when response_rate_count >= 3.
ALTER TABLE masters ADD COLUMN IF NOT EXISTS response_rate INT;
ALTER TABLE masters ADD COLUMN IF NOT EXISTS response_rate_count INT NOT NULL DEFAULT 0;

-- Add response tracking to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- View for master with average rating
CREATE OR REPLACE VIEW masters_with_ratings AS
SELECT
  m.*,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(r.id) as review_count
FROM masters m
LEFT JOIN reviews r ON r.master_id = m.id AND r.status = 'approved'
GROUP BY m.id;
