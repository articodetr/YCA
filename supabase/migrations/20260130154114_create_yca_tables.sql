/*
  # Create YCA Birmingham Database Schema

  ## Overview
  This migration creates the core database tables for the YCA Birmingham website,
  including events, news articles, and contact form submissions.

  ## New Tables

  ### `events`
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `date` (date) - Event date
  - `time` (text) - Event time
  - `location` (text) - Event location
  - `category` (text) - Event category (Community, Sports, Cultural, etc.)
  - `image_url` (text) - URL to event image
  - `is_featured` (boolean) - Whether event is featured
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `news`
  - `id` (uuid, primary key) - Unique article identifier
  - `title` (text) - Article title
  - `excerpt` (text) - Article excerpt/summary
  - `content` (text) - Full article content
  - `category` (text) - Article category
  - `author` (text) - Article author
  - `image_url` (text) - URL to article image
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `contact_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `name` (text) - Sender name
  - `email` (text) - Sender email
  - `phone` (text, nullable) - Sender phone
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - Submission status (new, read, replied)
  - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for events and news
  - Authenticated-only write access for events and news
  - Public insert access for contact submissions (for form submissions)
  - Authenticated-only read access for contact submissions
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Events can be inserted by authenticated users"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Events can be updated by authenticated users"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Events can be deleted by authenticated users"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- News policies
CREATE POLICY "News articles are viewable by everyone"
  ON news FOR SELECT
  TO public
  USING (true);

CREATE POLICY "News can be inserted by authenticated users"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "News can be updated by authenticated users"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "News can be deleted by authenticated users"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- Contact submissions policies
CREATE POLICY "Contact submissions can be inserted by anyone"
  ON contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Contact submissions can be viewed by authenticated users"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contact submissions can be updated by authenticated users"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);
CREATE INDEX IF NOT EXISTS news_published_at_idx ON news(published_at);
CREATE INDEX IF NOT EXISTS news_category_idx ON news(category);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions(status);
