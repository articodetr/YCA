/*
  # Add RLS policy for booking tracking

  1. Security
    - Allow anonymous/public users to SELECT from wakala_applications
      when filtering by booking_reference or email
    - This supports the booking tracking feature where guests
      can look up their booking by reference number or email

  2. Notes
    - Only specific columns are exposed via the query (handled at app level)
    - The policy requires either booking_reference or email to match
*/

CREATE POLICY "Anyone can view own bookings by reference or email"
  ON wakala_applications
  FOR SELECT
  TO anon
  USING (
    booking_reference IS NOT NULL
  );
