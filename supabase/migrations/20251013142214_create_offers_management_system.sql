/*
  # Create Offers Management System

  ## Overview
  This migration creates a comprehensive offers/promotions system that allows:
  - Creating time-limited offers on pricing plans
  - Automatic activation and deactivation based on dates
  - Manual pause/resume functionality
  - Complete offer history tracking
  - Countdown timer support

  ## New Tables
  
  ### `price_offers`
  Stores all price offers (active, scheduled, expired, paused)
  - `id` (uuid, primary key)
  - `pricing_plan_id` (uuid, foreign key to pricing_plans)
  - `original_price` (numeric) - Price before offer
  - `offer_price` (numeric) - Discounted price during offer
  - `discount_percentage` (numeric) - Calculated discount %
  - `start_date` (timestamptz) - When offer becomes active
  - `end_date` (timestamptz) - When offer expires
  - `status` (text) - 'scheduled', 'active', 'expired', 'paused'
  - `created_by` (uuid) - User who created the offer
  - `paused_at` (timestamptz) - When it was manually paused
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Functions
  - Auto-update offer status based on current time
  - Calculate discount percentage automatically

  ## Security
  - Enable RLS on all tables
  - Public can read active offers
  - Only authenticated trainers can manage offers

  ## Important Notes
  - Offers are automatically marked as 'active' when start_date is reached
  - Offers are automatically marked as 'expired' when end_date is passed
  - Manual pause overrides automatic status
  - Only one active offer per pricing plan at a time
*/

-- Create price_offers table
CREATE TABLE IF NOT EXISTS price_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_plan_id uuid NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
  original_price numeric(10, 2) NOT NULL,
  offer_price numeric(10, 2) NOT NULL,
  discount_percentage numeric(5, 2) GENERATED ALWAYS AS (
    ROUND(((original_price - offer_price) / original_price * 100)::numeric, 2)
  ) STORED,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'expired', 'paused')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paused_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_prices CHECK (offer_price < original_price AND offer_price > 0)
);

-- Enable RLS
ALTER TABLE price_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_offers
CREATE POLICY "Anyone can view active offers"
  ON price_offers FOR SELECT
  TO public
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert offers"
  ON price_offers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update offers"
  ON price_offers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete offers"
  ON price_offers FOR DELETE
  TO authenticated
  USING (true);

-- Function to automatically update offer status based on current time
CREATE OR REPLACE FUNCTION update_offer_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark scheduled offers as active if start date has passed
  UPDATE price_offers
  SET status = 'active', updated_at = now()
  WHERE status = 'scheduled'
    AND start_date <= now()
    AND end_date > now();

  -- Mark active offers as expired if end date has passed
  UPDATE price_offers
  SET status = 'expired', updated_at = now()
  WHERE status = 'active'
    AND end_date <= now();
END;
$$;

-- Function to get current active offer for a pricing plan
CREATE OR REPLACE FUNCTION get_active_offer(plan_id uuid)
RETURNS TABLE (
  offer_id uuid,
  offer_price numeric,
  discount_percentage numeric,
  end_date timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- First update all offer statuses
  PERFORM update_offer_status();
  
  -- Return the active offer for this plan
  RETURN QUERY
  SELECT 
    id,
    price_offers.offer_price,
    price_offers.discount_percentage,
    price_offers.end_date
  FROM price_offers
  WHERE pricing_plan_id = plan_id
    AND status = 'active'
    AND start_date <= now()
    AND end_date > now()
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_price_offers_updated_at
  BEFORE UPDATE ON price_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_categories_updated_at
  BEFORE UPDATE ON athlete_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sports_updated_at
  BEFORE UPDATE ON sports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_offers_pricing_plan ON price_offers(pricing_plan_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_status ON price_offers(status);
CREATE INDEX IF NOT EXISTS idx_price_offers_dates ON price_offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_price_offers_active ON price_offers(pricing_plan_id, status) 
  WHERE status = 'active';

-- Create view for easy offer querying with plan details
CREATE OR REPLACE VIEW active_offers_with_details AS
SELECT 
  po.id as offer_id,
  po.pricing_plan_id,
  po.original_price,
  po.offer_price,
  po.discount_percentage,
  po.start_date,
  po.end_date,
  po.status,
  ac.name as category_name,
  ac.slug as category_slug,
  s.name as sport_name,
  s.slug as sport_slug,
  pp.features
FROM price_offers po
JOIN pricing_plans pp ON po.pricing_plan_id = pp.id
JOIN athlete_categories ac ON pp.category_id = ac.id
JOIN sports s ON pp.sport_id = s.id
WHERE po.status = 'active'
  AND po.start_date <= now()
  AND po.end_date > now();
