/*
  # Refresh PostgREST schema cache
  
  1. Changes
    - Sends NOTIFY to PostgREST to refresh its schema cache
    - Ensures all table columns and constraints are correctly recognized by the API
  
  2. Reason
    - After multiple migrations modifying event_registrations table,
      PostgREST schema cache may be stale
    - This ensures INSERT operations work correctly through the REST API
*/

NOTIFY pgrst, 'reload schema';
