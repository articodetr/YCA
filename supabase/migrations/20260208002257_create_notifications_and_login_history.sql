/*
  # Create Notifications and Login History Tables with Fixed RLS

  1. New Tables
    - `notifications`
      - `user_id` (uuid, references auth.users)
      - `title` (text) - notification title in English
      - `title_ar` (text) - notification title in Arabic
      - `message` (text) - notification message in English
      - `message_ar` (text) - notification message in Arabic
      - `type` (text) - category: info, success, warning, reminder, system
      - `action_url` (text) - optional link to navigate to
      - `is_read` (boolean) - whether the user has read it
      - `created_at` (timestamptz) - when the notification was created

    - `login_history`
      - `user_id` (uuid, references auth.users)
      - `ip_address` (text) - IP address of login
      - `user_agent` (text) - browser/device info
      - `login_method` (text) - email, google, etc.
      - `status` (text) - success or failed
      - `created_at` (timestamptz) - when the login happened

    - `member_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `postcode` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `date_of_birth` (date)
      - `preferred_language` (text) - en or ar
      - `onboarding_completed` (boolean) - tracks if user finished onboarding
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/update their own data
    - System can insert notifications for any user
    - Permissive policies for Google OAuth triggers to work correctly

  3. Triggers
    - Auto-create member profile on user signup
    - Send welcome notification on user signup
    - Both triggers use SECURITY DEFINER and proper error handling
*/

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  message_ar text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'reminder', 'system')),
  action_url text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permissive policy to allow trigger functions to insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  login_method text NOT NULL DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'other')),
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Permissive policy to allow trigger functions and user code to insert login history
CREATE POLICY "System can insert login history"
  ON login_history FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);

-- Member profiles table (extends auth.users with additional profile data)
CREATE TABLE IF NOT EXISTS member_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postcode text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  date_of_birth date,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON member_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Permissive policy to allow trigger functions to insert profiles during OAuth
CREATE POLICY "System can insert profiles"
  ON member_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON member_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON member_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_member_profiles_updated ON member_profiles(updated_at DESC);

-- Function to auto-create member profile on user signup with error handling
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use exception handling to prevent auth failures if profile creation fails
  BEGIN
    INSERT INTO member_profiles (id, full_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the user creation
      RAISE WARNING 'Failed to create member profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user_profile();
  END IF;
END $$;

-- Function to create welcome notification with error handling
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use exception handling to prevent auth failures if notification creation fails
  BEGIN
    INSERT INTO notifications (user_id, title, title_ar, message, message_ar, type, action_url)
    VALUES (
      NEW.id,
      'Welcome to YCA Birmingham!',
      'مرحبا بك في جمعية الجالية اليمنية في برمنغهام!',
      'Thank you for joining us. Explore our services and programmes to get started.',
      'شكرا لانضمامك إلينا. استكشف خدماتنا وبرامجنا للبدء.',
      'info',
      '/member/dashboard'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the user creation
      RAISE WARNING 'Failed to create welcome notification for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_notification'
  ) THEN
    CREATE TRIGGER on_auth_user_created_notification
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_welcome_notification();
  END IF;
END $$;

-- Grant necessary permissions
GRANT INSERT ON member_profiles TO authenticated, anon;
GRANT INSERT ON notifications TO authenticated, anon;
GRANT INSERT ON login_history TO authenticated, anon;
