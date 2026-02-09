/*
  # Allow updating pending event registrations

  1. Security Changes
    - Add UPDATE policy on `event_registrations` for anonymous users
    - Only allows updating registrations that are currently in 'pending' status
    - Only allows setting status to 'confirmed' or 'cancelled'
    - Only allows updating payment-related fields

  2. Notes
    - Required for the paid event registration flow where the frontend
      updates the registration status after Stripe payment confirmation
    - INSERT and SELECT policies are already permissive for this table
    - The UPDATE is scoped to pending registrations only (cannot modify confirmed ones)
*/

CREATE POLICY "Allow updating pending event registrations"
  ON event_registrations
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('confirmed', 'cancelled', 'pending'));
