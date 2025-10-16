/*
  # Initial Database Schema Setup

  ## Overview
  This migration sets up the complete database structure for the fitness coaching platform with proper security and relationships.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'client' or 'trainer'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. `client_registrations`
  Stores client registration data from the Join Now form
  - `id` (uuid, primary key) - Unique registration ID
  - `user_id` (uuid, foreign key) - Links to profiles.id (nullable for pre-auth registrations)
  - `full_name` (text) - Client's full name
  - `email` (text) - Client's email address
  - `phone` (text) - Client's phone number
  - `age` (integer) - Client's age
  - `weight` (numeric) - Current weight in kg
  - `height` (numeric) - Height in cm
  - `goal_weight` (numeric) - Target weight in kg
  - `fitness_goal` (text) - Primary fitness goal
  - `activity_level` (text) - Current activity level
  - `dietary_preferences` (text) - Dietary restrictions/preferences
  - `medical_conditions` (text) - Relevant medical information
  - `status` (text) - Registration status: 'pending', 'approved', 'active', 'inactive'
  - `created_at` (timestamptz) - Registration submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `client_progress`
  Tracks client progress over time
  - `id` (uuid, primary key) - Unique progress entry ID
  - `client_id` (uuid, foreign key) - Links to profiles.id
  - `weight` (numeric) - Current weight measurement
  - `notes` (text) - Progress notes or observations
  - `recorded_at` (timestamptz) - When measurement was taken
  - `created_at` (timestamptz) - Entry creation timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### profiles table:
  1. Users can view their own profile
  2. Users can update their own profile
  3. Trainers can view all client profiles
  
  #### client_registrations table:
  1. Anyone can insert (for initial registration)
  2. Users can view their own registrations
  3. Trainers can view all registrations
  4. Trainers can update any registration (for approval/management)
  
  #### client_progress table:
  1. Clients can view their own progress
  2. Clients can insert their own progress entries
  3. Trainers can view all client progress
  4. Trainers can insert progress for any client

  ## Important Notes
  - All timestamps use `timestamptz` for timezone awareness
  - Foreign key constraints ensure data integrity
  - Indexes added for performance on frequently queried columns
  - Default values set for timestamps and status fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'trainer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create client_registrations table
CREATE TABLE IF NOT EXISTS client_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 150),
  weight numeric(5,2) NOT NULL CHECK (weight > 0),
  height numeric(5,2) NOT NULL CHECK (height > 0),
  goal_weight numeric(5,2) CHECK (goal_weight > 0),
  fitness_goal text NOT NULL,
  activity_level text NOT NULL,
  dietary_preferences text DEFAULT '',
  medical_conditions text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_registrations ENABLE ROW LEVEL SECURITY;

-- Create client_progress table
CREATE TABLE IF NOT EXISTS client_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight numeric(5,2) NOT NULL CHECK (weight > 0),
  notes text DEFAULT '',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_client_registrations_user_id ON client_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_client_registrations_email ON client_registrations(email);
CREATE INDEX IF NOT EXISTS idx_client_registrations_status ON client_registrations(status);
CREATE INDEX IF NOT EXISTS idx_client_progress_client_id ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_recorded_at ON client_progress(recorded_at);

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Trainers can view all client profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'client' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

-- RLS Policies for client_registrations table
CREATE POLICY "Anyone can insert registration"
  ON client_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own registrations"
  ON client_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view all registrations"
  ON client_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update registrations"
  ON client_registrations FOR UPDATE
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

-- RLS Policies for client_progress table
CREATE POLICY "Clients can view own progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own progress"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Trainers can view all progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can insert progress for clients"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_registrations_updated_at
  BEFORE UPDATE ON client_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();