/*
  # Allow users to update their own membership applications

  1. Security Changes
    - Add UPDATE policy on `membership_applications` for authenticated users
    - Users can only update their own applications (matched by user_id)
    - This fixes the issue where payment status updates were silently blocked by RLS

  2. Important Notes
    - Previously only admins could update membership applications
    - The payment page needs to update `payment_status` after successful Stripe payment
    - Without this policy, the frontend update fails silently, causing "Payment Required" to persist
*/

CREATE POLICY "Users can update own applications"
  ON membership_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
