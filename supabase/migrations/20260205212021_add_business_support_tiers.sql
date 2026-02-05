/*
  # Add Business Support Tiers and Payment Options

  ## Overview
  This migration adds support for Business Support membership tiers (Bronze, Silver, Gold)
  and flexible payment options (annual packages, monthly support, one-time contributions).

  ## Changes to Tables
  
  ### membership_applications
  - Add `business_support_tier` - Track the chosen tier (bronze, silver, gold, monthly, one_time)
  - Add `custom_amount` - Store custom donation amounts
  - Add `payment_frequency` - Track payment frequency (annual, monthly, one_time)
  
  ### members
  - Add `business_support_tier` - Active support tier for the member
  - Add `custom_amount` - Active custom amount
  - Add `payment_frequency` - Active payment frequency
  - Add `next_renewal_date` - Track next renewal for monthly subscriptions

  ## Security
  - Existing RLS policies will apply
  - No new policies needed as these are additional fields on existing tables
*/

-- Add business support fields to membership_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' AND column_name = 'business_support_tier'
  ) THEN
    ALTER TABLE membership_applications 
    ADD COLUMN business_support_tier text CHECK (
      business_support_tier IS NULL OR 
      business_support_tier IN ('bronze', 'silver', 'gold', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' AND column_name = 'custom_amount'
  ) THEN
    ALTER TABLE membership_applications 
    ADD COLUMN custom_amount numeric CHECK (custom_amount IS NULL OR custom_amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE membership_applications 
    ADD COLUMN payment_frequency text CHECK (
      payment_frequency IS NULL OR 
      payment_frequency IN ('annual', 'monthly', 'one_time')
    );
  END IF;
END $$;

-- Add business support fields to members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'business_support_tier'
  ) THEN
    ALTER TABLE members 
    ADD COLUMN business_support_tier text CHECK (
      business_support_tier IS NULL OR 
      business_support_tier IN ('bronze', 'silver', 'gold', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'custom_amount'
  ) THEN
    ALTER TABLE members 
    ADD COLUMN custom_amount numeric CHECK (custom_amount IS NULL OR custom_amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE members 
    ADD COLUMN payment_frequency text CHECK (
      payment_frequency IS NULL OR 
      payment_frequency IN ('annual', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'next_renewal_date'
  ) THEN
    ALTER TABLE members 
    ADD COLUMN next_renewal_date date;
  END IF;
END $$;