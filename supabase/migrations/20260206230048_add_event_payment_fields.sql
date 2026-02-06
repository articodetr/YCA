/*
  # Add payment fields to event registrations

  1. Modified Tables
    - `event_registrations`
      - `payment_status` (text) - Payment status: pending, paid, failed
      - `payment_intent_id` (text) - Stripe payment intent ID
      - `ticket_type` (text) - Ticket type: adult, child, member
      - `amount_paid` (numeric) - Amount paid in GBP
      - `booking_reference` (text) - Unique booking reference code
      - `dietary_requirements` (text) - Dietary needs for catered events

  2. Notes
    - All new columns are nullable for backward compatibility with free events
    - Booking reference uses a unique index for fast lookups
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN payment_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'ticket_type'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN ticket_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN amount_paid numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN booking_reference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'dietary_requirements'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN dietary_requirements text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_booking_ref
  ON event_registrations (booking_reference)
  WHERE booking_reference IS NOT NULL;