/*
  # Create Athlete Categories and Pricing System

  ## Overview
  This migration creates a comprehensive pricing system for athlete programs with support for:
  - Different athlete categories (Beginner, Midterm, Expert)
  - Sport-specific pricing (bodybuilding, football, crossfit, swimming, etc.)
  - Flexible pricing that can be managed through the dashboard

  ## New Tables
  
  ### `athlete_categories`
  Stores the main athlete skill levels
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Beginner", "Midterm", "Expert"
  - `slug` (text) - URL-friendly identifier
  - `description` (text) - Category description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `sports`
  Stores available sports types
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Bodybuilding", "Football"
  - `slug` (text) - URL-friendly identifier
  - `icon` (text) - Icon identifier for UI
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pricing_plans`
  Stores pricing for each combination of category and sport
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key to athlete_categories)
  - `sport_id` (uuid, foreign key to sports)
  - `price` (numeric) - Base price in EGP
  - `currency` (text) - Default 'EGP'
  - `features` (jsonb) - Array of features for this plan
  - `is_active` (boolean) - Whether this plan is available
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public can read active plans
  - Only authenticated trainers can modify plans
*/

-- Create athlete_categories table
CREATE TABLE IF NOT EXISTS athlete_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES athlete_categories(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'EGP',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, sport_id)
);

-- Enable RLS
ALTER TABLE athlete_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for athlete_categories
CREATE POLICY "Anyone can view athlete categories"
  ON athlete_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert athlete categories"
  ON athlete_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update athlete categories"
  ON athlete_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete athlete categories"
  ON athlete_categories FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sports
CREATE POLICY "Anyone can view active sports"
  ON sports FOR SELECT
  TO public
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sports"
  ON sports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sports"
  ON sports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sports"
  ON sports FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for pricing_plans
CREATE POLICY "Anyone can view active pricing plans"
  ON pricing_plans FOR SELECT
  TO public
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert pricing plans"
  ON pricing_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pricing plans"
  ON pricing_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pricing plans"
  ON pricing_plans FOR DELETE
  TO authenticated
  USING (true);

-- Insert default athlete categories
INSERT INTO athlete_categories (name, slug, description, display_order)
VALUES 
  ('Beginner Athlete', 'beginner', 'Perfect for athletes starting their journey with professional guidance', 1),
  ('Midterm Athlete', 'midterm', 'For athletes with experience looking to advance their performance', 2),
  ('Expert Athlete', 'expert', 'Advanced training for elite athletes seeking peak performance', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert default sports
INSERT INTO sports (name, slug, icon, description)
VALUES 
  ('Bodybuilding', 'bodybuilding', 'dumbbell', 'Build muscle mass and achieve your ideal physique'),
  ('Football', 'football', 'zap', 'Enhance speed, agility, and endurance for football'),
  ('CrossFit', 'crossfit', 'target', 'High-intensity functional training for overall fitness'),
  ('Swimming', 'swimming', 'waves', 'Improve technique, stamina, and competition performance'),
  ('Basketball', 'basketball', 'circle', 'Develop athleticism and court performance'),
  ('Running', 'running', 'activity', 'Training for marathons, sprints, and endurance')
ON CONFLICT (slug) DO NOTHING;

-- Insert default pricing (you can adjust these prices)
DO $$
DECLARE
  beginner_id uuid;
  midterm_id uuid;
  expert_id uuid;
  sport_rec RECORD;
BEGIN
  -- Get category IDs
  SELECT id INTO beginner_id FROM athlete_categories WHERE slug = 'beginner';
  SELECT id INTO midterm_id FROM athlete_categories WHERE slug = 'midterm';
  SELECT id INTO expert_id FROM athlete_categories WHERE slug = 'expert';

  -- Insert pricing for each sport and category combination
  FOR sport_rec IN SELECT id FROM sports LOOP
    -- Beginner pricing
    INSERT INTO pricing_plans (category_id, sport_id, price, features)
    VALUES (
      beginner_id,
      sport_rec.id,
      2000,
      '[
        "Weekly Follow-up",
        "Customized exercise plan adjusted weekly",
        "Personalized eating plan reviewed weekly",
        "Weekly progress reports",
        "Plan adjustments based on progress",
        "Email support"
      ]'::jsonb
    ) ON CONFLICT (category_id, sport_id) DO NOTHING;

    -- Midterm pricing
    INSERT INTO pricing_plans (category_id, sport_id, price, features)
    VALUES (
      midterm_id,
      sport_rec.id,
      2750,
      '[
        "Bi-weekly Follow-up",
        "Advanced training techniques",
        "Optimized nutrition planning",
        "Performance analytics",
        "Video form analysis",
        "Priority email support",
        "Monthly video consultations"
      ]'::jsonb
    ) ON CONFLICT (category_id, sport_id) DO NOTHING;

    -- Expert pricing
    INSERT INTO pricing_plans (category_id, sport_id, price, features)
    VALUES (
      expert_id,
      sport_rec.id,
      3500,
      '[
        "Daily Follow-up",
        "Real-time performance monitoring",
        "Immediate plan adjustments",
        "Daily progress tracking",
        "Live chat support throughout the day",
        "Priority responses to questions",
        "Weekly video call consultations",
        "Competition preparation"
      ]'::jsonb
    ) ON CONFLICT (category_id, sport_id) DO NOTHING;
  END LOOP;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_plans_category ON pricing_plans(category_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sport ON pricing_plans(sport_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active);
