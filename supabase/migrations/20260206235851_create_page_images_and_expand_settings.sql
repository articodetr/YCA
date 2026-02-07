/*
  # Create page_images table and expand site_settings

  1. New Tables
    - `page_images`
      - `id` (uuid, primary key)
      - `page_key` (text) - identifies which page (e.g., 'home', 'services', 'about_mission')
      - `image_key` (text) - identifies which image slot (e.g., 'header_bg', 'welcome_section', 'event_1')
      - `image_url` (text) - the URL of the image
      - `alt_text` (text) - alt text in English
      - `alt_text_ar` (text) - alt text in Arabic
      - `is_active` (boolean) - whether image is shown
      - `created_at` / `updated_at` (timestamptz)

  2. New site_settings entries
    - Branding: site_logo, site_logo_text
    - Organization: org_name_en, org_name_ar, org_tagline_en, org_tagline_ar, charity_number
    - Social: social_tiktok
    - Stats: stat_members, stat_programmes, stat_years, stat_impact

  3. Security
    - Enable RLS on `page_images` table
    - Admins can manage page_images
    - Public can read active page_images
*/

CREATE TABLE IF NOT EXISTS page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  image_key text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  alt_text text DEFAULT '',
  alt_text_ar text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_key, image_key)
);

ALTER TABLE page_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page images"
  ON page_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert page images"
  ON page_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

CREATE POLICY "Admins can update page images"
  ON page_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

CREATE POLICY "Admins can delete page images"
  ON page_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

INSERT INTO site_settings (key, value, description) VALUES
  ('site_logo', '"/logo.png"', 'Main site logo URL'),
  ('site_logo_text', '"/logo_text.png"', 'Site text logo URL'),
  ('org_name_en', '"Yemeni Community Association"', 'Organization name in English'),
  ('org_name_ar', '"جمعية الجالية اليمنية"', 'Organization name in Arabic'),
  ('org_tagline_en', '"Empowering the Yemeni community in Birmingham"', 'Organization tagline in English'),
  ('org_tagline_ar', '"تمكين الجالية اليمنية في برمنغهام"', 'Organization tagline in Arabic'),
  ('charity_number', '"1057470"', 'Charity registration number'),
  ('social_tiktok', '"https://tiktok.com/@ycabirmingham"', 'TikTok profile URL'),
  ('stat_members', '"850"', 'Homepage stat: number of active members'),
  ('stat_programmes', '"5"', 'Homepage stat: number of core programmes'),
  ('stat_years', '"30"', 'Homepage stat: years of service'),
  ('stat_impact', '"1000"', 'Homepage stat: lives impacted')
ON CONFLICT (key) DO NOTHING;

INSERT INTO page_images (page_key, image_key, image_url, alt_text) VALUES
  ('home', 'welcome_section', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', 'Community gathering'),
  ('home', 'events_1', 'https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=400', 'Community event'),
  ('home', 'events_2', 'https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=400', 'Community gathering'),
  ('services', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Services'),
  ('programmes', 'header_bg', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Programmes'),
  ('events', 'header_bg', 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Events'),
  ('news', 'header_bg', 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1920', 'News'),
  ('contact', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Contact'),
  ('resources', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Resources'),
  ('about_mission', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our Mission'),
  ('about_history', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our History'),
  ('about_team', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our Team'),
  ('about_partners', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Partners'),
  ('about_reports', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Reports'),
  ('donate', 'header_bg', 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Donate'),
  ('volunteer', 'header_bg', 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Volunteer'),
  ('membership', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Membership'),
  ('jobs', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Jobs'),
  ('partnerships', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Partnerships'),
  ('programmes_women', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Women Programme'),
  ('programmes_men', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Men Programme'),
  ('programmes_youth', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Youth Programme'),
  ('programmes_children', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Children Programme'),
  ('programmes_elderly', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Elderly Programme'),
  ('programmes_journey', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Journey Within Programme')
ON CONFLICT (page_key, image_key) DO NOTHING;
