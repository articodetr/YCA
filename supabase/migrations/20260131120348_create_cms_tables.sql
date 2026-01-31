/*
  # CMS Content Management System Tables

  ## Overview
  This migration creates all necessary tables for a complete Content Management System
  allowing admins to manage all website content through the admin panel.

  ## New Tables

  ### 1. hero_slides
  - Manages homepage hero section slides
  - Fields: id, title, subtitle, image_url, order_number, is_active, created_at, updated_at
  - Allows multiple rotating hero banners

  ### 2. team_members
  - Manages team members display
  - Fields: id, name, role, bio, image_url, email, phone, social_media (JSON), member_type, order_number, is_active
  - Types: board, committee, staff

  ### 3. services_content
  - Manages services page content
  - Fields: id, title, description, icon, category, detailed_content, order_number, is_active
  - Categories: advice, support, community

  ### 4. programmes_items
  - Manages programmes across different categories
  - Fields: id, title, description, image_url, category, link, color, icon, is_active, order_number
  - Categories: women, men, youth, children, elderly

  ### 5. resources_items
  - Manages downloadable resources and links
  - Fields: id, title, description, resource_type, file_url, link, file_size, year, category, is_active
  - Types: policy, form, guide, link

  ### 6. event_gallery
  - Manages photo galleries for events
  - Fields: id, event_id, image_url, caption, description, order_number, created_at

  ### 7. content_sections
  - Flexible content storage for various pages
  - Fields: id, page, section_key, content (JSONB), is_active, updated_at
  - Used for About pages, Mission, History, etc.

  ### 8. page_content
  - General page content management
  - Fields: id, page_name, section_name, content_type, content_data (JSONB), order_number, is_active

  ## Security
  - Enable RLS on all tables
  - Public read access for active content
  - Admin-only write access
  - Proper authentication checks
*/

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage hero slides"
  ON hero_slides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  image_url text,
  email text,
  phone text,
  social_media jsonb DEFAULT '{}',
  member_type text NOT NULL CHECK (member_type IN ('board', 'committee', 'staff')),
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active team members"
  ON team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create services_content table
CREATE TABLE IF NOT EXISTS services_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  category text NOT NULL CHECK (category IN ('advice', 'support', 'community')),
  detailed_content text,
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create programmes_items table
CREATE TABLE IF NOT EXISTS programmes_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  category text NOT NULL CHECK (category IN ('women', 'men', 'youth', 'children', 'elderly')),
  link text,
  color text DEFAULT '#10B981',
  icon text DEFAULT 'Users',
  is_active boolean DEFAULT true,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programmes_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programmes"
  ON programmes_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage programmes"
  ON programmes_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create resources_items table
CREATE TABLE IF NOT EXISTS resources_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL CHECK (resource_type IN ('policy', 'form', 'guide', 'link')),
  file_url text,
  link text,
  file_size bigint,
  year integer,
  category text,
  is_active boolean DEFAULT true,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources"
  ON resources_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage resources"
  ON resources_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create event_gallery table
CREATE TABLE IF NOT EXISTS event_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  description text,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event gallery"
  ON event_gallery FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event gallery"
  ON event_gallery FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section_key)
);

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active content sections"
  ON content_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage content sections"
  ON content_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_name text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text', 'html', 'json', 'image')),
  content_data jsonb NOT NULL DEFAULT '{}',
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page content"
  ON page_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage page content"
  ON page_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(member_type, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_services_category ON services_content(category, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_programmes_category ON programmes_items(category, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources_items(resource_type, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_event_gallery_event ON event_gallery(event_id, order_number);
CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page, section_key);
CREATE INDEX IF NOT EXISTS idx_page_content_page ON page_content(page_name, section_name, is_active);

-- Insert default hero slide
INSERT INTO hero_slides (title, subtitle, image_url, order_number, is_active)
VALUES (
  'Empowering the Yemeni Community',
  'Building a stronger, more connected community in Birmingham',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920',
  1,
  true
) ON CONFLICT DO NOTHING;