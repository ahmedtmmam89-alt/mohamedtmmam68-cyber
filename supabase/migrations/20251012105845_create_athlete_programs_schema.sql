/*
  # Athlete Programs and Payment System

  ## Overview
  Creates tables for athlete training programs with manual payment confirmation system.

  ## New Tables
  
  ### 1. `athlete_programs`
  Stores all available athlete training programs
  - `id` (uuid, primary key) - Unique program ID
  - `name` (text) - Program name (e.g., "Bodybuilding", "Running")
  - `gender` (text) - Target gender: 'male' or 'female'
  - `category` (text) - Program tier: 'normal', 'advanced', 'premium'
  - `duration_weeks` (integer) - Program duration in weeks
  - `description` (text) - Short program description
  - `price` (integer) - Price in Egyptian Pounds
  - `offer_price` (integer, nullable) - Discounted price if applicable
  - `file_url` (text) - URL to the downloadable program file
  - `is_active` (boolean) - Whether program is available for purchase
  - `created_at` (timestamptz) - Program creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `program_purchases`
  Tracks all program purchase requests and payment confirmations
  - `id` (uuid, primary key) - Unique purchase ID
  - `user_id` (uuid, foreign key, nullable) - Links to profiles.id
  - `program_id` (uuid, foreign key) - Links to athlete_programs.id
  - `customer_name` (text) - Buyer's name
  - `customer_email` (text) - Buyer's email
  - `payment_method` (text) - Payment method used
  - `payment_proof_url` (text) - URL to uploaded payment screenshot
  - `status` (text) - Purchase status: 'pending', 'approved', 'rejected'
  - `admin_notes` (text) - Admin notes for approval/rejection
  - `approved_by` (uuid, foreign key, nullable) - Trainer who approved
  - `approved_at` (timestamptz, nullable) - Approval timestamp
  - `created_at` (timestamptz) - Purchase request timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  
  #### athlete_programs table:
  1. Anyone can view active programs
  2. Only trainers can insert/update/delete programs
  
  #### program_purchases table:
  1. Anyone can insert purchase requests
  2. Users can view their own purchases
  3. Trainers can view all purchases
  4. Trainers can update purchase status (approve/reject)

  ## Important Notes
  - Prices stored in Egyptian Pounds (EGP)
  - Manual payment confirmation workflow
  - Admin approval required before file access
  - Payment proof stored as URL (uploaded to storage)
*/

-- Create athlete_programs table
CREATE TABLE IF NOT EXISTS athlete_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  category text NOT NULL CHECK (category IN ('normal', 'advanced', 'premium')),
  duration_weeks integer NOT NULL CHECK (duration_weeks > 0 AND duration_weeks <= 52),
  description text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  offer_price integer CHECK (offer_price > 0),
  file_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE athlete_programs ENABLE ROW LEVEL SECURITY;

-- Create program_purchases table
CREATE TABLE IF NOT EXISTS program_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  program_id uuid NOT NULL REFERENCES athlete_programs(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('instapay', 'vodafone_cash', 'bank_transfer')),
  payment_proof_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text DEFAULT '',
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE program_purchases ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_athlete_programs_gender ON athlete_programs(gender);
CREATE INDEX IF NOT EXISTS idx_athlete_programs_category ON athlete_programs(category);
CREATE INDEX IF NOT EXISTS idx_athlete_programs_is_active ON athlete_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_program_purchases_user_id ON program_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_program_id ON program_purchases(program_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_status ON program_purchases(status);
CREATE INDEX IF NOT EXISTS idx_program_purchases_customer_email ON program_purchases(customer_email);

-- RLS Policies for athlete_programs table
CREATE POLICY "Anyone can view active programs"
  ON athlete_programs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Trainers can insert programs"
  ON athlete_programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update programs"
  ON athlete_programs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can delete programs"
  ON athlete_programs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

-- RLS Policies for program_purchases table
CREATE POLICY "Anyone can insert purchase request"
  ON program_purchases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own purchases"
  ON program_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR customer_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Trainers can view all purchases"
  ON program_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update purchases"
  ON program_purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_athlete_programs_updated_at
  BEFORE UPDATE ON athlete_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_purchases_updated_at
  BEFORE UPDATE ON program_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial athlete programs
INSERT INTO athlete_programs (name, gender, category, duration_weeks, description, price, offer_price) VALUES
-- Male Normal Programs
('Bodybuilding - Normal', 'male', 'normal', 8, 'Build muscle mass and strength with proven bodybuilding techniques', 2000, 150),
('Running - Normal', 'male', 'normal', 6, 'Improve endurance and running performance for beginners', 2000, 150),
('Boxing - Normal', 'male', 'normal', 8, 'Learn boxing fundamentals and boost cardiovascular fitness', 2000, 150),
('CrossFit - Normal', 'male', 'normal', 6, 'Functional fitness training for overall athletic performance', 2000, 150),

-- Male Advanced Programs
('Bodybuilding - Advanced', 'male', 'advanced', 10, 'Advanced muscle building with periodization and progressive overload', 600, 350),
('Running - Advanced', 'male', 'advanced', 8, 'Marathon and half-marathon training with advanced techniques', 600, 350),
('Boxing - Advanced', 'male', 'advanced', 10, 'Competition-level boxing training with sparring techniques', 600, 350),
('CrossFit - Advanced', 'male', 'advanced', 8, 'High-intensity CrossFit programming for experienced athletes', 600, 350),

-- Male Premium Programs
('Bodybuilding - Premium', 'male', 'premium', 12, 'Elite bodybuilding program with nutrition and supplement guidance', 3500, 700),
('Running - Premium', 'male', 'premium', 12, 'Ultra-marathon training with personalized coaching support', 3500, 700),
('Boxing - Premium', 'male', 'premium', 12, 'Professional boxing training with fight preparation', 3500, 700),
('CrossFit - Premium', 'male', 'premium', 12, 'Competition prep with Olympic lifting and gymnastics focus', 3500, 700),

-- Female Normal Programs
('Bodybuilding - Normal', 'female', 'normal', 8, 'Tone and sculpt your body with effective resistance training', 2000, 150),
('Running - Normal', 'female', 'normal', 6, 'Start your running journey with safe and effective training', 2000, 150),
('Boxing - Normal', 'female', 'normal', 8, 'Empowering boxing training for fitness and self-defense', 2000, 150),
('CrossFit - Normal', 'female', 'normal', 6, 'Build strength and confidence with functional fitness', 2000, 150),

-- Female Advanced Programs
('Bodybuilding - Advanced', 'female', 'advanced', 10, 'Advanced body sculpting and competitive physique training', 600, 350),
('Running - Advanced', 'female', 'advanced', 8, 'Long-distance running with performance optimization', 600, 350),
('Boxing - Advanced', 'female', 'advanced', 10, 'Advanced boxing skills with competitive sparring', 600, 350),
('CrossFit - Advanced', 'female', 'advanced', 8, 'Advanced functional fitness with Olympic lifts', 600, 350),

-- Female Premium Programs
('Bodybuilding - Premium', 'female', 'premium', 12, 'Elite physique development with complete nutrition planning', 3500, 700),
('Running - Premium', 'female', 'premium', 12, 'Elite running program with race strategy and recovery', 3500, 700),
('Boxing - Premium', 'female', 'premium', 12, 'Professional boxing training with fight camp preparation', 3500, 700),
('CrossFit - Premium', 'female', 'premium', 12, 'Competition-ready CrossFit with personalized coaching', 3500, 700);