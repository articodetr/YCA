/*
  # Case Notes, Admin Permissions, and Assignment System

  1. New Tables
    - `case_notes`
      - `id` (uuid, primary key)
      - `entity_type` (text) - 'wakala_application' or 'booking'
      - `entity_id` (uuid) - ID of the related entity
      - `admin_id` (uuid, FK to admins) - Who wrote the note
      - `note_text` (text) - The note content
      - `note_type` (text) - 'general', 'status_change', 'assignment', 'data_edit'
      - `created_at` (timestamptz)
    - `admin_permissions`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, FK to admins)
      - `permission_key` (text) - e.g. 'wakala.view', 'admin.manage'
      - `created_at` (timestamptz)

  2. Modified Tables
    - `wakala_applications` - Added `assigned_admin_id` column
    - `admins` - Added INSERT/DELETE policies for super_admins

  3. Security
    - Enable RLS on all new tables
    - Active admins can read/write case notes
    - Active admins can read permissions
    - Super admins can manage permissions and admin records

  4. Indexes
    - case_notes: entity lookup, admin lookup, chronological
    - admin_permissions: admin lookup, unique constraint
*/

-- Create case_notes table
CREATE TABLE IF NOT EXISTS case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('wakala_application', 'booking')),
  entity_id uuid NOT NULL,
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  note_text text NOT NULL DEFAULT '',
  note_type text NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'status_change', 'assignment', 'data_edit')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active admins can view case notes"
  ON case_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Active admins can insert case notes"
  ON case_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
    AND admin_id = auth.uid()
  );

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(admin_id, permission_key)
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active admins can view permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Super admins can insert permissions"
  ON admin_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete permissions"
  ON admin_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role = 'super_admin'
    )
  );

-- Add assigned_admin_id to wakala_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'assigned_admin_id'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN assigned_admin_id uuid REFERENCES admins(id);
  END IF;
END $$;

-- Add super_admin policies for managing admins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Super admins can insert admins'
  ) THEN
    CREATE POLICY "Super admins can insert admins"
      ON admins FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM admins
          WHERE admins.id = auth.uid()
          AND admins.is_active = true
          AND admins.role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Super admins can update all admins'
  ) THEN
    CREATE POLICY "Super admins can update all admins"
      ON admins FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admins
          WHERE admins.id = auth.uid()
          AND admins.is_active = true
          AND admins.role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM admins
          WHERE admins.id = auth.uid()
          AND admins.is_active = true
          AND admins.role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_notes_entity ON case_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_admin ON case_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created ON case_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_wakala_assigned_admin ON wakala_applications(assigned_admin_id);
