/*
  # Add Bilingual Support (English & Arabic)

  ## Overview
  This migration adds Arabic language support to all content tables.
  Default language is English, Arabic fields are optional with fallback to English.

  ## Changes

  ### 1. Hero Slides
  - Add `title_ar` (text) - Arabic title
  - Add `description_ar` (text) - Arabic description

  ### 2. Services Content
  - Add `title_ar` (text) - Arabic service title
  - Add `description_ar` (text) - Arabic service description

  ### 3. Programmes Items
  - Add `title_ar` (text) - Arabic programme title
  - Add `description_ar` (text) - Arabic programme description
  - Add `content_ar` (text) - Arabic programme content

  ### 4. Resources Items
  - Add `title_ar` (text) - Arabic resource title
  - Add `description_ar` (text) - Arabic resource description

  ### 5. Team Members
  - Add `role_ar` (text) - Arabic role/position
  - Add `bio_ar` (text) - Arabic biography

  ### 6. Events
  - Add `title_ar` (text) - Arabic event title
  - Add `description_ar` (text) - Arabic event description
  - Add `location_ar` (text) - Arabic location name

  ### 7. News
  - Add `title_ar` (text) - Arabic news title
  - Add `description_ar` (text) - Arabic news excerpt/description
  - Add `content_ar` (text) - Arabic news full content

  ### 8. Page Content
  - Add `title_ar` (text) - Arabic page title
  - Add `description_ar` (text) - Arabic page description

  ### 9. Content Sections
  - Add `title_ar` (text) - Arabic section title
  - Content JSON already supports { text_en, text_ar, image }

  ## Notes
  - All Arabic fields are nullable
  - Frontend should fallback to English when Arabic is empty
  - RLS policies remain unchanged
*/

-- Hero Slides
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN description_ar text;
  END IF;
END $$;

-- Services Content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_content' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE services_content ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_content' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE services_content ADD COLUMN description_ar text;
  END IF;
END $$;

-- Programmes Items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN content_ar text;
  END IF;
END $$;

-- Resources Items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_items' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE resources_items ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_items' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE resources_items ADD COLUMN description_ar text;
  END IF;
END $$;

-- Team Members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'role_ar'
  ) THEN
    ALTER TABLE team_members ADD COLUMN role_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'bio_ar'
  ) THEN
    ALTER TABLE team_members ADD COLUMN bio_ar text;
  END IF;
END $$;

-- Events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN location_ar text;
  END IF;
END $$;

-- News
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN content_ar text;
  END IF;
END $$;

-- Page Content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE page_content ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE page_content ADD COLUMN description_ar text;
  END IF;
END $$;

-- Content Sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_sections' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE content_sections ADD COLUMN title_ar text;
  END IF;
END $$;
