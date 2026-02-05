/*
  # Fix Wakala Applications - Make Old Columns Nullable

  ## Changes
  1. Makes `applicant_phone` column nullable (previously NOT NULL)
  2. Makes `applicant_email` column nullable (previously NOT NULL)
  
  ## Reason
  The application form now uses the new `phone` and `email` columns instead of the legacy `applicant_phone` and `applicant_email` columns. Making the old columns nullable ensures backward compatibility while allowing the new structure to work properly.
  
  ## Notes
  - The new columns `phone` and `email` are already nullable
  - This migration maintains data integrity while supporting the updated application flow
*/

-- Make old columns nullable to support new application structure
ALTER TABLE wakala_applications 
  ALTER COLUMN applicant_phone DROP NOT NULL,
  ALTER COLUMN applicant_email DROP NOT NULL;