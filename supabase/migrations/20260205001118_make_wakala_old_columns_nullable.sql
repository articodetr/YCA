/*
  # Make Wakala Applications Old Columns Nullable
  
  1. Changes
    - Make old wakala_applications columns nullable to support new application form
    - This allows the new form to work while maintaining backwards compatibility
    - Old columns remain available for Arabic-specific wakala applications
  
  2. Security
    - RLS policies remain unchanged
    - No data is lost or modified
*/

-- Make old required columns nullable
ALTER TABLE wakala_applications 
  ALTER COLUMN applicant_name_ar DROP NOT NULL,
  ALTER COLUMN attorney_name_ar DROP NOT NULL,
  ALTER COLUMN wakala_type_ar DROP NOT NULL,
  ALTER COLUMN wakala_format_ar DROP NOT NULL,
  ALTER COLUMN applicant_passport_url DROP NOT NULL,
  ALTER COLUMN attorney_passport_url DROP NOT NULL,
  ALTER COLUMN witness_passports_url DROP NOT NULL,
  ALTER COLUMN membership_status DROP NOT NULL,
  ALTER COLUMN fee_amount DROP NOT NULL;