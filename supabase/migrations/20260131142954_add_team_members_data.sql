/*
  # Add Team Members Data

  1. Purpose
    - Populate team_members table with all team members from the existing static data
    - Includes board members, committee members, and staff
    
  2. Data Added
    - 7 Board Members (Chairman, Treasurer, Secretary, Trustees)
    - 2 Committee Members (Women & Children Officer, Media Officer)
    - 2 Staff Members (Development Officer, Admin Assistant)
    
  3. Notes
    - Checks for existing members before inserting to avoid duplicates
    - Sets appropriate member_type for each category
    - All members set as active by default
    - Order numbers assigned for proper display sequence
*/

-- Insert Board Members (only if they don't exist)
DO $$
BEGIN
  -- Ahmed Al bakri (might already exist)
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Ahmed Al bakri' AND role = 'Chairman') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Ahmed Al bakri', 'Chairman', 'Leading YCA Birmingham with strategic vision and community focus.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abduljalil Khaled' AND role = 'Treasurer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abduljalil Khaled', 'Treasurer', 'Managing financial resources and ensuring fiscal responsibility.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 2, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdulrahman Shujoon' AND role = 'Secretary') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdulrahman Shujoon', 'Secretary', 'Maintaining organizational records and governance compliance.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 3, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Marwan Faisel' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Marwan Faisel', 'Trustee', 'Providing oversight and strategic guidance to the organization.', 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 4, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Fadhl Hassn' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Fadhl Hassn', 'Trustee', 'Supporting community initiatives and organizational development.', 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 5, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdullah Ahmed' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdullah Ahmed', 'Trustee', 'Contributing expertise in community engagement and partnerships.', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 6, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Mohamed Mosleh' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Mohamed Mosleh', 'Trustee', 'Ensuring effective governance and community representation.', 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 7, true);
  END IF;

  -- Committee Members
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Dr. Zainab Al hammadi' AND role = 'Women and Children Committee Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Dr. Zainab Al hammadi', 'Women and Children Committee Officer', 'Leading initiatives for women and children in the community.', 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'committee', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdulrahman Sailan' AND role = 'Media Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdulrahman Sailan', 'Media Officer', 'Managing communications and media relations for YCA Birmingham.', 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'committee', 2, true);
  END IF;

  -- Staff Members
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Salah Al-hamidi' AND role = 'Development Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Salah Al-hamidi', 'Development Officer', 'Coordinating development projects and community programs.', 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'staff', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Saahirah Kusar' AND role = 'Admin Assistant') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Saahirah Kusar', 'Admin Assistant', 'Supporting daily operations and administrative functions.', 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'staff', 2, true);
  END IF;
END $$;
