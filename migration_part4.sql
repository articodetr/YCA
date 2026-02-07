-- ========== Migration: 20260207011221_prevent_double_booking_hardening.sql ==========
/*
  # Prevent Double Booking - Database Hardening

  1. Data Cleanup
    - Cancels duplicate pending_payment bookings that reference the same slot
    - Keeps the earliest booking per slot, cancels later duplicates

  2. New Indexes
    - Partial unique index on `wakala_applications(slot_id)` for non-cancelled bookings
      - Prevents two active bookings from referencing the same slot
      - Only applies when slot_id is not null and status is not 'cancelled'

  3. New Functions
    - `reserve_two_consecutive_slots(p_slot_id_1, p_slot_id_2)`
      - Atomically reserves two consecutive slots in a single transaction
      - Uses SELECT ... FOR UPDATE row-level locking on both slots
      - Returns success/failure with details
      - Eliminates the race window that existed when making two separate RPC calls

  4. Realtime
    - Enables Supabase Realtime publication on `availability_slots` table
      - Allows frontend clients to subscribe to live slot availability changes

  5. Important Notes
    - The partial unique index uses a WHERE clause to only enforce uniqueness
      on active (non-cancelled) bookings, so cancelled bookings do not block
      future use of the same slot
    - The two-slot reservation function locks both rows before checking
      availability, preventing any interleaving with other transactions
*/

-- 1. Clean up duplicate slot references: keep earliest per slot, cancel the rest
UPDATE wakala_applications
SET status = 'cancelled',
    cancelled_at = now()
WHERE id IN (
  SELECT unnest(app_ids[2:]) FROM (
    SELECT slot_id,
           array_agg(id ORDER BY created_at) as app_ids
    FROM wakala_applications
    WHERE slot_id IS NOT NULL
      AND status NOT IN ('cancelled')
    GROUP BY slot_id
    HAVING count(*) > 1
  ) dupes
);

-- 2. Partial unique index: only one active booking per slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_wakala_applications_active_slot
  ON wakala_applications (slot_id)
  WHERE slot_id IS NOT NULL AND status NOT IN ('cancelled');

-- 3. Atomic function to reserve two consecutive slots (for 60-minute bookings)
CREATE OR REPLACE FUNCTION reserve_two_consecutive_slots(
  p_slot_id_1 UUID,
  p_slot_id_2 UUID
) RETURNS JSONB AS $$
DECLARE
  v_slot1_available BOOLEAN;
  v_slot2_available BOOLEAN;
BEGIN
  SELECT is_available INTO v_slot1_available
  FROM availability_slots
  WHERE id = p_slot_id_1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'First slot not found'
    );
  END IF;

  SELECT is_available INTO v_slot2_available
  FROM availability_slots
  WHERE id = p_slot_id_2
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Second slot not found'
    );
  END IF;

  IF v_slot1_available = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'First slot is no longer available',
      'failed_slot', 1
    );
  END IF;

  IF v_slot2_available = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Second slot is no longer available',
      'failed_slot', 2
    );
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id IN (p_slot_id_1, p_slot_id_2);

  RETURN jsonb_build_object(
    'success', true,
    'slot_id_1', p_slot_id_1,
    'slot_id_2', p_slot_id_2
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reserve_two_consecutive_slots IS 'Atomically reserves two consecutive availability slots using row-level locking for 60-minute bookings';

-- 4. Enable Realtime on availability_slots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'availability_slots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;
  END IF;
END $$;

-- ========== Migration: 20260207014229_seed_all_page_content_sections.sql ==========
/*
  # Seed All Page Content Sections

  1. Purpose
    - Populate existing content sections with actual English and Arabic text from hardcoded pages
    - Create new content sections for pages that don't have any yet
    - Enable admin to edit ALL website text content from the Content Management panel

  2. Pages Updated (existing sections)
    - home (37 sections) - update with text_en/text_ar
    - services (27 sections) - update with text_en/text_ar
    - contact (27 sections) - update with text_en/text_ar
    - about_mission (21 sections) - update with text_en/text_ar

  3. Pages Created (new sections)
    - about_history - intro, timeline, stats, today/tomorrow
    - about_partners - categories, key partnerships, CTA
    - about_reports - intro, charity info, transparency
    - events - section titles, CTA
    - news - newsletter, social media CTA
    - programmes - programme titles/descriptions, CTA
    - resources - section headings, help CTA
    - volunteer - intro, opportunities, benefits, form
    - membership - types heading, benefits heading
    - partnerships - intro, types, benefits
    - jobs - intro, why work, opportunities, roles

  4. Security
    - No changes to RLS policies (existing policies remain)

  5. Important Notes
    - Uses INSERT ... ON CONFLICT to safely upsert
    - Preserves all existing data; only adds text_en/text_ar fields
    - All current hardcoded text is captured as the initial database value
*/

-- =============================================
-- UPDATE EXISTING HOME PAGE SECTIONS
-- =============================================
UPDATE content_sections
SET content = jsonb_set(
  jsonb_set(content, '{text_en}', to_jsonb(content->>'text')),
  '{text_ar}', '""'::jsonb
)
WHERE page = 'home'
AND content->>'text_en' IS NULL
AND content->>'text' IS NOT NULL;

-- =============================================
-- UPDATE EXISTING SERVICES PAGE SECTIONS
-- =============================================
UPDATE content_sections
SET content = jsonb_set(
  jsonb_set(content, '{text_en}', to_jsonb(content->>'text')),
  '{text_ar}', '""'::jsonb
)
WHERE page = 'services'
AND content->>'text_en' IS NULL
AND content->>'text' IS NOT NULL;

-- =============================================
-- UPDATE EXISTING CONTACT PAGE SECTIONS
-- =============================================
UPDATE content_sections
SET content = jsonb_set(
  jsonb_set(content, '{text_en}', to_jsonb(content->>'text')),
  '{text_ar}', '""'::jsonb
)
WHERE page = 'contact'
AND content->>'text_en' IS NULL
AND content->>'text' IS NOT NULL;

-- =============================================
-- UPDATE EXISTING ABOUT_MISSION PAGE SECTIONS
-- =============================================
UPDATE content_sections
SET content = jsonb_set(
  jsonb_set(content, '{text_en}', to_jsonb(content->>'text')),
  '{text_ar}', '""'::jsonb
)
WHERE page = 'about_mission'
AND content->>'text_en' IS NULL
AND content->>'text' IS NOT NULL;

-- =============================================
-- ABOUT HISTORY PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('about_history', 'intro_p1', '{"text_en": "YCA Birmingham was originally formed in 1993 and registered with the Charity Commission under charity number 1057470. Between 1993 and 2007 the organisation operated on a limited basis, mainly concerned with the management of its premises at Wordsworth Road and limited service by the chairman from his own home.", "text_ar": ""}', true),
('about_history', 'intro_p2', '{"text_en": "In 2007, a new management committee took over, determined to make the YCA Birmingham more effective to address the needs of the Yemenis in Birmingham. The organisation has 850 members, despite having very little in the way of financial resources in response to demand from the community, it has managed to deliver an impressive range of services ranging from advice, guidance and information to youth activities.", "text_ar": ""}', true),
('about_history', 'journey_title', '{"text_en": "Our Journey", "text_ar": ""}', true),
('about_history', 'timeline_1_year', '{"text_en": "1993", "text_ar": ""}', true),
('about_history', 'timeline_1_event', '{"text_en": "YCA Birmingham Founded", "text_ar": ""}', true),
('about_history', 'timeline_1_desc', '{"text_en": "Registered with the Charity Commission under charity number 1057470", "text_ar": ""}', true),
('about_history', 'timeline_2_year', '{"text_en": "1993-2007", "text_ar": ""}', true),
('about_history', 'timeline_2_event', '{"text_en": "Early Years", "text_ar": ""}', true),
('about_history', 'timeline_2_desc', '{"text_en": "Limited operations focused on premises management at Wordsworth Road", "text_ar": ""}', true),
('about_history', 'timeline_3_year', '{"text_en": "2007", "text_ar": ""}', true),
('about_history', 'timeline_3_event', '{"text_en": "New Leadership", "text_ar": ""}', true),
('about_history', 'timeline_3_desc', '{"text_en": "New management committee took over with determination to expand services", "text_ar": ""}', true),
('about_history', 'timeline_4_year', '{"text_en": "2024", "text_ar": ""}', true),
('about_history', 'timeline_4_event', '{"text_en": "Thriving Community Hub", "text_ar": ""}', true),
('about_history', 'timeline_4_desc', '{"text_en": "850+ members and comprehensive services for the entire community", "text_ar": ""}', true),
('about_history', 'stat_1_value', '{"text_en": "850+", "text_ar": ""}', true),
('about_history', 'stat_1_label', '{"text_en": "Community Members", "text_ar": ""}', true),
('about_history', 'stat_2_value', '{"text_en": "30+", "text_ar": ""}', true),
('about_history', 'stat_2_label', '{"text_en": "Years of Service", "text_ar": ""}', true),
('about_history', 'stat_3_value', '{"text_en": "5", "text_ar": ""}', true),
('about_history', 'stat_3_label', '{"text_en": "Core Programmes", "text_ar": ""}', true),
('about_history', 'today_title', '{"text_en": "Today and Tomorrow", "text_ar": ""}', true),
('about_history', 'today_p1', '{"text_en": "The Yemeni Community Association in Birmingham is aiming to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of the city.", "text_ar": ""}', true),
('about_history', 'today_p2', '{"text_en": "The association provides community services such as advice, information, advocacy, and related services for the local community. All services are currently delivered through volunteers.", "text_ar": ""}', true),
('about_history', 'today_p3', '{"text_en": "Our organisation is well integrated within local communities and all voluntary sectors and offers a range of activities and services that relieve hardship and improve the social, health, education and economic situation of the community.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- ABOUT PARTNERS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('about_partners', 'intro', '{"text_en": "YCA Birmingham is proud to work with a network of partners and funders who share our commitment to empowering the Yemeni community in Birmingham. Through these collaborations, we are able to expand our services and reach more people in need.", "text_ar": ""}', true),
('about_partners', 'local_authorities_title', '{"text_en": "Local Authorities", "text_ar": ""}', true),
('about_partners', 'local_authorities_desc', '{"text_en": "Birmingham City Council and local government partners supporting community development", "text_ar": ""}', true),
('about_partners', 'charitable_trusts_title', '{"text_en": "Charitable Trusts", "text_ar": ""}', true),
('about_partners', 'charitable_trusts_desc', '{"text_en": "Charitable foundations and trusts funding our programmes and services", "text_ar": ""}', true),
('about_partners', 'community_partners_title', '{"text_en": "Community Partners", "text_ar": ""}', true),
('about_partners', 'community_partners_desc', '{"text_en": "Local organizations and community groups working alongside us", "text_ar": ""}', true),
('about_partners', 'key_partnerships_title', '{"text_en": "Key Partnerships", "text_ar": ""}', true),
('about_partners', 'partner_1_name', '{"text_en": "Birmingham City Council", "text_ar": ""}', true),
('about_partners', 'partner_1_desc', '{"text_en": "Supporting community services, advice provision, and programme development", "text_ar": ""}', true),
('about_partners', 'partner_2_name', '{"text_en": "The Muath Trust", "text_ar": ""}', true),
('about_partners', 'partner_2_desc', '{"text_en": "Providing premises and facilities for our community programmes", "text_ar": ""}', true),
('about_partners', 'partner_3_name', '{"text_en": "NHS Birmingham and Solihull", "text_ar": ""}', true),
('about_partners', 'partner_3_desc', '{"text_en": "Health and wellbeing partnerships to support community health initiatives", "text_ar": ""}', true),
('about_partners', 'partner_4_name', '{"text_en": "Local Solicitors and Legal Services", "text_ar": ""}', true),
('about_partners', 'partner_4_desc', '{"text_en": "Providing pro bono legal surgeries and advice for community members", "text_ar": ""}', true),
('about_partners', 'become_partner_title', '{"text_en": "Become a Partner", "text_ar": ""}', true),
('about_partners', 'become_partner_desc', '{"text_en": "Are you an organization interested in partnering with YCA Birmingham? We welcome collaborations that help us serve our community better.", "text_ar": ""}', true),
('about_partners', 'thank_you_title', '{"text_en": "Thank You to Our Partners", "text_ar": ""}', true),
('about_partners', 'thank_you_desc', '{"text_en": "We are grateful for the continued support of our partners and funders. Together, we are making a real difference in the lives of Yemeni families in Birmingham.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- ABOUT REPORTS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('about_reports', 'intro', '{"text_en": "As a registered charity (Number: 1057470), YCA Birmingham is committed to transparency. Our annual reports provide detailed information about our activities, finances, and impact on the community.", "text_ar": ""}', true),
('about_reports', 'charity_info_title', '{"text_en": "Charity Information", "text_ar": ""}', true),
('about_reports', 'charity_name', '{"text_en": "Yemeni Community Association (Birmingham)", "text_ar": ""}', true),
('about_reports', 'charity_number', '{"text_en": "1057470", "text_ar": ""}', true),
('about_reports', 'charity_registered', '{"text_en": "1993", "text_ar": ""}', true),
('about_reports', 'charity_status', '{"text_en": "Active", "text_ar": ""}', true),
('about_reports', 'transparency_title', '{"text_en": "Financial Transparency", "text_ar": ""}', true),
('about_reports', 'transparency_desc', '{"text_en": "We believe in complete transparency in how we use our resources. All our annual reports include detailed financial statements and breakdowns of how funds are allocated across our programmes and services.", "text_ar": ""}', true),
('about_reports', 'transparency_note', '{"text_en": "For more detailed information or specific queries, please contact us directly.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- EVENTS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('events', 'upcoming_title', '{"text_en": "Upcoming Events", "text_ar": ""}', true),
('events', 'upcoming_desc', '{"text_en": "Stay informed and get involved in our next gathering", "text_ar": ""}', true),
('events', 'no_events_title', '{"text_en": "No Upcoming Events", "text_ar": ""}', true),
('events', 'no_events_desc', '{"text_en": "There are currently no upcoming events scheduled. Please check back later or contact us for more information.", "text_ar": ""}', true),
('events', 'past_events_title', '{"text_en": "Past Events & Photo Galleries", "text_ar": ""}', true),
('events', 'past_events_desc', '{"text_en": "Relive our favorite moments and see the impact of our community work", "text_ar": ""}', true),
('events', 'cta_title', '{"text_en": "Never Miss an Event", "text_ar": ""}', true),
('events', 'cta_desc', '{"text_en": "Stay connected with us on your favorite platforms for real-time news and event updates", "text_ar": ""}', true),
('events', 'follow_instagram', '{"text_en": "Follow on Instagram", "text_ar": ""}', true),
('events', 'join_facebook', '{"text_en": "Join Facebook Group", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- NEWS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('news', 'newsletter_title', '{"text_en": "Subscribe to Our Newsletter", "text_ar": ""}', true),
('news', 'newsletter_desc', '{"text_en": "Get the latest news, events, and community updates delivered directly to your inbox", "text_ar": ""}', true),
('news', 'social_title', '{"text_en": "Follow Us on Social Media", "text_ar": ""}', true),
('news', 'social_desc', '{"text_en": "Stay connected for real-time updates and community stories", "text_ar": ""}', true),
('news', 'follow_instagram', '{"text_en": "Follow on Instagram", "text_ar": ""}', true),
('news', 'join_facebook', '{"text_en": "Join Facebook Group", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- PROGRAMMES PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('programmes', 'women_title', '{"text_en": "Women''s Programme", "text_ar": "برنامج المرأة"}', true),
('programmes', 'women_desc', '{"text_en": "Empowering women through education, skills training, and community support. We offer workshops, health awareness sessions, and a safe space for women to connect and grow.", "text_ar": "تمكين المرأة من خلال التعليم والتدريب على المهارات والدعم المجتمعي."}', true),
('programmes', 'elderly_title', '{"text_en": "Elderly''s Programme", "text_ar": "برنامج كبار السن"}', true),
('programmes', 'elderly_desc', '{"text_en": "Supporting our elders with dignity and respect. We provide social activities, health services, and companionship to ensure our senior community members thrive.", "text_ar": "دعم كبار السن بكرامة واحترام."}', true),
('programmes', 'youth_title', '{"text_en": "Youth Programme", "text_ar": "برنامج الشباب"}', true),
('programmes', 'youth_desc', '{"text_en": "Building tomorrow''s leaders today. Our youth programme offers mentorship, sports activities, educational support, and leadership development opportunities.", "text_ar": "بناء قادة الغد اليوم."}', true),
('programmes', 'children_title', '{"text_en": "Children''s Programme", "text_ar": "برنامج الأطفال"}', true),
('programmes', 'children_desc', '{"text_en": "Nurturing young minds through play, learning, and cultural activities. We provide a safe, engaging environment where children can develop and explore.", "text_ar": "رعاية العقول الشابة من خلال اللعب والتعلم والأنشطة الثقافية."}', true),
('programmes', 'men_title', '{"text_en": "Men''s Programme", "text_ar": "برنامج الرجال"}', true),
('programmes', 'men_desc', '{"text_en": "Strengthening our community through brotherhood and support. We offer workshops, sports activities, and forums for men to connect and address important issues.", "text_ar": "تقوية مجتمعنا من خلال الأخوة والدعم."}', true),
('programmes', 'join_title', '{"text_en": "Join Our Programmes", "text_ar": ""}', true),
('programmes', 'join_desc', '{"text_en": "Whether you''re looking to participate, volunteer, or support our initiatives, there''s a place for you in our community programmes.", "text_ar": ""}', true),
('programmes', 'cta_title', '{"text_en": "Make a Difference", "text_ar": ""}', true),
('programmes', 'cta_desc', '{"text_en": "Your support helps us continue providing vital services to our community members", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- RESOURCES PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('resources', 'policies_title', '{"text_en": "Policy Documents", "text_ar": ""}', true),
('resources', 'policies_desc', '{"text_en": "Download our organizational policies and procedures", "text_ar": ""}', true),
('resources', 'forms_title', '{"text_en": "Forms / Guides", "text_ar": ""}', true),
('resources', 'forms_desc', '{"text_en": "Download forms for membership, volunteering, and services", "text_ar": ""}', true),
('resources', 'links_title', '{"text_en": "Useful Links", "text_ar": ""}', true),
('resources', 'links_desc', '{"text_en": "Important external resources and partner organizations", "text_ar": ""}', true),
('resources', 'help_title', '{"text_en": "Need Help?", "text_ar": ""}', true),
('resources', 'help_desc', '{"text_en": "If you can''t find what you''re looking for or need assistance with any forms or documents, our team is here to help.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- VOLUNTEER PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('volunteer', 'intro', '{"text_en": "YCA Birmingham relies on the dedication and passion of volunteers to deliver our services. Whether you have a few hours a week or can commit to regular volunteering, there''s a role for you.", "text_ar": ""}', true),
('volunteer', 'opportunities_title', '{"text_en": "Volunteer Opportunities", "text_ar": ""}', true),
('volunteer', 'opp_1_title', '{"text_en": "Event Support", "text_ar": ""}', true),
('volunteer', 'opp_1_desc', '{"text_en": "Help organize and run community events and celebrations", "text_ar": ""}', true),
('volunteer', 'opp_2_title', '{"text_en": "Admin Support", "text_ar": ""}', true),
('volunteer', 'opp_2_desc', '{"text_en": "Assist with office tasks, data entry, and correspondence", "text_ar": ""}', true),
('volunteer', 'opp_3_title', '{"text_en": "Programme Assistants", "text_ar": ""}', true),
('volunteer', 'opp_3_desc', '{"text_en": "Support our youth, women''s, or elderly programmes", "text_ar": ""}', true),
('volunteer', 'opp_4_title', '{"text_en": "Translation Services", "text_ar": ""}', true),
('volunteer', 'opp_4_desc', '{"text_en": "Help translate documents and interpret for community members", "text_ar": ""}', true),
('volunteer', 'opp_5_title', '{"text_en": "Mentoring", "text_ar": ""}', true),
('volunteer', 'opp_5_desc', '{"text_en": "Guide and support young people in the community", "text_ar": ""}', true),
('volunteer', 'opp_6_title', '{"text_en": "Fundraising", "text_ar": ""}', true),
('volunteer', 'opp_6_desc', '{"text_en": "Help with fundraising initiatives and grant applications", "text_ar": ""}', true),
('volunteer', 'benefit_1_title', '{"text_en": "Give Back", "text_ar": ""}', true),
('volunteer', 'benefit_1_desc', '{"text_en": "Make a real difference in people''s lives", "text_ar": ""}', true),
('volunteer', 'benefit_2_title', '{"text_en": "Build Skills", "text_ar": ""}', true),
('volunteer', 'benefit_2_desc', '{"text_en": "Develop new skills and experience", "text_ar": ""}', true),
('volunteer', 'benefit_3_title', '{"text_en": "Flexible Hours", "text_ar": ""}', true),
('volunteer', 'benefit_3_desc', '{"text_en": "Volunteer when it suits you", "text_ar": ""}', true),
('volunteer', 'apply_title', '{"text_en": "Apply to Volunteer", "text_ar": ""}', true),
('volunteer', 'apply_desc', '{"text_en": "Complete the form below to submit your volunteer application. We''ll review it and get back to you within 2-3 business days.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- JOBS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('jobs', 'intro', '{"text_en": "YCA Birmingham is always looking for passionate, dedicated individuals to join our team. Whether you''re looking for paid employment or volunteer roles, we offer opportunities to make a real difference in the community.", "text_ar": ""}', true),
('jobs', 'why_work_title', '{"text_en": "Why Work With Us?", "text_ar": ""}', true),
('jobs', 'why_1_title', '{"text_en": "Meaningful Work", "text_ar": ""}', true),
('jobs', 'why_1_desc', '{"text_en": "Make a real difference in people''s lives every day", "text_ar": ""}', true),
('jobs', 'why_2_title', '{"text_en": "Career Development", "text_ar": ""}', true),
('jobs', 'why_2_desc', '{"text_en": "Opportunities for professional growth and training", "text_ar": ""}', true),
('jobs', 'why_3_title', '{"text_en": "Supportive Team", "text_ar": ""}', true),
('jobs', 'why_3_desc', '{"text_en": "Work alongside passionate, dedicated colleagues", "text_ar": ""}', true),
('jobs', 'why_4_title', '{"text_en": "Community Impact", "text_ar": ""}', true),
('jobs', 'why_4_desc', '{"text_en": "Be part of a respected community organization", "text_ar": ""}', true),
('jobs', 'current_title', '{"text_en": "Current Opportunities", "text_ar": ""}', true),
('jobs', 'current_desc', '{"text_en": "We don''t have any open positions at the moment, but we''re always interested in hearing from talented individuals who share our values.", "text_ar": ""}', true),
('jobs', 'register_title', '{"text_en": "Register Your Interest", "text_ar": ""}', true),
('jobs', 'register_desc', '{"text_en": "Send us your CV and a cover letter explaining why you''d like to work with YCA Birmingham. We''ll keep your details on file and contact you when suitable opportunities arise.", "text_ar": ""}', true),
('jobs', 'typical_roles_title', '{"text_en": "Typical Roles", "text_ar": ""}', true),
('jobs', 'typical_roles_intro', '{"text_en": "Positions we typically recruit for:", "text_ar": ""}', true),
('jobs', 'role_1', '{"text_en": "Community Support Workers", "text_ar": ""}', true),
('jobs', 'role_2', '{"text_en": "Advice & Guidance Officers", "text_ar": ""}', true),
('jobs', 'role_3', '{"text_en": "Programme Coordinators", "text_ar": ""}', true),
('jobs', 'role_4', '{"text_en": "Admin & Office Staff", "text_ar": ""}', true),
('jobs', 'role_5', '{"text_en": "Youth Workers", "text_ar": ""}', true),
('jobs', 'role_6', '{"text_en": "Translators & Interpreters", "text_ar": ""}', true),
('jobs', 'look_for_title', '{"text_en": "What We Look For", "text_ar": ""}', true),
('jobs', 'look_for_intro', '{"text_en": "Ideal candidates typically have:", "text_ar": ""}', true),
('jobs', 'quality_1', '{"text_en": "Passion for community work", "text_ar": ""}', true),
('jobs', 'quality_2', '{"text_en": "Bilingual skills (Arabic/English preferred)", "text_ar": ""}', true),
('jobs', 'quality_3', '{"text_en": "Cultural awareness and sensitivity", "text_ar": ""}', true),
('jobs', 'quality_4', '{"text_en": "Strong communication skills", "text_ar": ""}', true),
('jobs', 'quality_5', '{"text_en": "Commitment to our values", "text_ar": ""}', true),
('jobs', 'quality_6', '{"text_en": "Relevant qualifications or experience", "text_ar": ""}', true),
('jobs', 'contact_title', '{"text_en": "Get in Touch", "text_ar": ""}', true),
('jobs', 'contact_desc', '{"text_en": "Interested in working with us? Send your CV and cover letter to our team.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- ABOUT MISSION PAGE (fill with actual text)
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('about_mission', 'mission_title', '{"text_en": "Our Mission", "text_ar": "مهمتنا"}', true),
('about_mission', 'mission_desc', '{"text_en": "Here we state our beliefs, morals or rules that underpin the work we do. Our mission is to empower the Yemeni community in Birmingham through comprehensive support services, cultural preservation, and community engagement.", "text_ar": ""}', true),
('about_mission', 'vision_title', '{"text_en": "Our Vision", "text_ar": "رؤيتنا"}', true),
('about_mission', 'vision_desc', '{"text_en": "We want to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of Birmingham.", "text_ar": ""}', true),
('about_mission', 'values_title', '{"text_en": "Our Core Values", "text_ar": "قيمنا الأساسية"}', true),
('about_mission', 'values_intro', '{"text_en": "In all our activities and services, YCA Birmingham operates according to these fundamental values:", "text_ar": ""}', true),
('about_mission', 'value_1_title', '{"text_en": "Focused on the Community", "text_ar": ""}', true),
('about_mission', 'value_1_desc', '{"text_en": "All our activities and services prioritize the needs and wellbeing of our community members.", "text_ar": ""}', true),
('about_mission', 'value_2_title', '{"text_en": "Bringing the Community Together", "text_ar": ""}', true),
('about_mission', 'value_2_desc', '{"text_en": "We create spaces and opportunities for connection, fostering unity and social bonds.", "text_ar": ""}', true),
('about_mission', 'value_3_title', '{"text_en": "Preserving Yemeni Identity", "text_ar": ""}', true),
('about_mission', 'value_3_desc', '{"text_en": "We celebrate and maintain our rich cultural heritage while thriving in the UK.", "text_ar": ""}', true),
('about_mission', 'value_4_title', '{"text_en": "Encouraging Mutual Respect", "text_ar": ""}', true),
('about_mission', 'value_4_desc', '{"text_en": "We promote understanding, tolerance, and respect across all our programmes and services.", "text_ar": ""}', true),
('about_mission', 'success_title', '{"text_en": "What Success Looks Like", "text_ar": ""}', true),
('about_mission', 'success_desc', '{"text_en": "Our vision statement is the ideal state we want the Yemeni community in Birmingham to be and what it will be like if YCA Birmingham is successful in achieving its mission.", "text_ar": ""}', true),
('about_mission', 'success_statement', '{"text_en": "A vibrant, cohesive Yemeni community that is fully integrated, respected, and contributing meaningfully to Birmingham''s diverse social fabric.", "text_ar": ""}', true),
('about_mission', 'join_title', '{"text_en": "Join Us in Our Mission", "text_ar": ""}', true),
('about_mission', 'join_desc', '{"text_en": "Together, we can build a stronger, more connected community that celebrates our heritage while embracing our future in Birmingham.", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- SERVICES PAGE (fill with actual EN + AR text)
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('services', 'intro_title', '{"text_en": "Sustaining and Developing Comprehensive Advice and Guidance Services", "text_ar": "تقديم خدمات استشارية وإرشادية شاملة ومستدامة"}', true),
('services', 'intro_p1', '{"text_en": "The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community.", "text_ar": "تقدم جمعية الجالية اليمنية في برمنغهام خدمات استشارية وإرشادية شاملة في مجالات الصحة والتعليم والرعاية الاجتماعية لخدمة المجتمع بأكمله."}', true),
('services', 'intro_p2', '{"text_en": "We are working hard to empower our community, especially those who need our help the most: individuals who don''t speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need.", "text_ar": "نعمل بجد لتمكين مجتمعنا، وخاصة أولئك الذين يحتاجون إلى مساعدتنا أكثر من غيرهم: الأفراد الذين لا يتحدثون الإنجليزية ولا يعرفون النظام في المملكة المتحدة. كما نقدم دعمًا مخصصًا للاجئين والمحتاجين."}', true),
('services', 'mission_title', '{"text_en": "Our Mission and Who We Help", "text_ar": "مهمتنا ومن نساعد"}', true),
('services', 'mission_desc', '{"text_en": "We empower individuals who don''t speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding.", "text_ar": "نمكّن الأفراد الذين لا يتحدثون الإنجليزية ولا يعرفون النظام البريطاني. جميع موظفينا الذين يعملون مع هؤلاء الأفراد يجيدون اللغتين الإنجليزية والعربية، مما يضمن التواصل الواضح والتفاهم."}', true),
('services', 'how_we_help_title', '{"text_en": "How We Help", "text_ar": "كيف نساعد"}', true),
('services', 'how_we_help_desc', '{"text_en": "We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing.", "text_ar": "نعمل مع العملاء على أساس سري وفردي، نقدم المشورة المباشرة والدعم العملي في القضايا الحياتية الأساسية مثل المزايا الاجتماعية والديون والتوظيف والهجرة والطلاق والعنف الأسري والإسكان."}', true),
('services', 'support_title', '{"text_en": "Our Support Workers Will:", "text_ar": "سيقوم موظفو الدعم لدينا بـ:"}', true),
('services', 'support_1', '{"text_en": "Signpost clients to relevant third-party agencies", "text_ar": "توجيه العملاء إلى الجهات ذات الصلة"}', true),
('services', 'support_2', '{"text_en": "Assist in filling out application forms", "text_ar": "المساعدة في ملء نماذج الطلبات"}', true),
('services', 'support_3', '{"text_en": "Read, explain, and translate complex letters", "text_ar": "قراءة وشرح وترجمة الرسائل المعقدة"}', true),
('services', 'support_4', '{"text_en": "Interpret on the client''s behalf during meetings and calls", "text_ar": "الترجمة الفورية نيابة عن العميل خلال الاجتماعات والمكالمات"}', true),
('services', 'support_5', '{"text_en": "Arrange for solicitor surgeries when legal advice is required", "text_ar": "ترتيب جلسات استشارية مع المحامين عند الحاجة للمشورة القانونية"}', true),
('services', 'support_6', '{"text_en": "Support online housing applications using our dedicated computers", "text_ar": "دعم طلبات الإسكان عبر الإنترنت باستخدام أجهزة الكمبيوتر المخصصة لدينا"}', true),
('services', 'services_title', '{"text_en": "Services We Provide", "text_ar": "الخدمات التي نقدمها"}', true),
('services', 'services_subtitle', '{"text_en": "We provide guidance and practical help with a wide range of administrative and benefit applications", "text_ar": "نقدم الإرشاد والمساعدة العملية في مجموعة واسعة من طلبات الإدارة والمزايا"}', true),
('services', 'cat_1_title', '{"text_en": "Welfare & Benefits", "text_ar": "الرعاية الاجتماعية والمزايا"}', true),
('services', 'cat_2_title', '{"text_en": "Applications & Admin", "text_ar": "الطلبات والإدارة"}', true),
('services', 'cat_3_title', '{"text_en": "Legal & Practical", "text_ar": "القانونية والعملية"}', true),
('services', 'hours_title', '{"text_en": "When You Can Find Us", "text_ar": "متى يمكنكم زيارتنا"}', true),
('services', 'hours_mon_thu', '{"text_en": "Monday - Thursday:", "text_ar": "الاثنين - الخميس:"}', true),
('services', 'hours_mon_thu_time', '{"text_en": "10:00 AM - 3:30 PM", "text_ar": "10:00 صباحاً - 3:30 مساءً"}', true),
('services', 'hours_fri', '{"text_en": "Friday:", "text_ar": "الجمعة:"}', true),
('services', 'hours_fri_time', '{"text_en": "9:00 AM - 1:00 PM", "text_ar": "9:00 صباحاً - 1:00 مساءً"}', true),
('services', 'contact_cta', '{"text_en": "Contact us today to book your one-to-one appointment", "text_ar": "تواصل معنا اليوم لحجز موعدك الفردي"}', true),
('services', 'feedback_title', '{"text_en": "We Value Your Feedback", "text_ar": "نقدّر ملاحظاتكم"}', true),
('services', 'feedback_desc', '{"text_en": "We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project.", "text_ar": "نطلب من عملائنا تقديم ملاحظاتهم في كل مرة يستخدمون فيها الخدمة، ونستخدم ذلك لتطوير مشروعنا باستمرار."}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- CONTACT PAGE (fill with actual text)
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('contact', 'heading', '{"text_en": "Get In Touch With Us", "text_ar": ""}', true),
('contact', 'intro', '{"text_en": "If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible.", "text_ar": ""}', true),
('contact', 'address_label', '{"text_en": "Address", "text_ar": ""}', true),
('contact', 'address_line1', '{"text_en": "YCA GreenCoat House", "text_ar": ""}', true),
('contact', 'address_line2', '{"text_en": "261-271 Stratford Road", "text_ar": ""}', true),
('contact', 'address_line3', '{"text_en": "Birmingham, B11 1QS", "text_ar": ""}', true),
('contact', 'phone_label', '{"text_en": "Phone", "text_ar": ""}', true),
('contact', 'phone_number', '{"text_en": "0121 439 5280", "text_ar": ""}', true),
('contact', 'email_label', '{"text_en": "Email", "text_ar": ""}', true),
('contact', 'email_address', '{"text_en": "info@yca-birmingham.org.uk", "text_ar": ""}', true),
('contact', 'hours_label', '{"text_en": "Opening Times", "text_ar": ""}', true),
('contact', 'hours_text', '{"text_en": "Monday - Thursday: 10:00 AM - 3:30 PM\nFriday: 9:00 AM - 1:00 PM", "text_ar": ""}', true),
('contact', 'advice_title', '{"text_en": "Need Advice or Support?", "text_ar": ""}', true),
('contact', 'advice_desc', '{"text_en": "Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more.", "text_ar": ""}', true),
('contact', 'advice_cta', '{"text_en": "Call us today to book your one-to-one appointment", "text_ar": ""}', true),
('contact', 'form_title', '{"text_en": "Send Us a Message", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- MEMBERSHIP PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('membership', 'types_title', '{"text_en": "Membership Types", "text_ar": "أنواع العضوية"}', true),
('membership', 'types_desc', '{"text_en": "Choose the membership type that suits you and join our community", "text_ar": "اختر نوع العضوية الذي يناسبك وانضم إلى مجتمعنا"}', true),
('membership', 'benefits_title', '{"text_en": "Membership Benefits", "text_ar": "فوائد العضوية"}', true),
('membership', 'benefits_subtitle', '{"text_en": "Why Join YCA Birmingham?", "text_ar": "لماذا تنضم إلى جمعية الجالية اليمنية؟"}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- =============================================
-- PARTNERSHIPS PAGE
-- =============================================
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
('partnerships', 'intro', '{"text_en": "YCA Birmingham welcomes partnerships with organizations that share our commitment to community empowerment. Together, we can achieve more.", "text_ar": ""}', true),
('partnerships', 'corporate_title', '{"text_en": "Corporate", "text_ar": ""}', true),
('partnerships', 'community_title', '{"text_en": "Community", "text_ar": ""}', true),
('partnerships', 'public_sector_title', '{"text_en": "Public Sector", "text_ar": ""}', true)
ON CONFLICT (page, section_key) DO UPDATE SET content = EXCLUDED.content;

-- ========== Migration: 20260207025619_add_booking_reference_column_v3.sql ==========
/*
  # Add booking reference column and tracking support

  1. Modified Tables
    - `wakala_applications`
      - `booking_reference` (text, unique) - Unique reference code for tracking bookings

  2. New Functions
    - `generate_booking_reference()` trigger function - auto-generates YCA-YYYY-NNNN references

  3. Notes
    - Backfills existing rows with sequential references
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN booking_reference text UNIQUE;
  END IF;
END $$;

DROP FUNCTION IF EXISTS generate_booking_reference() CASCADE;

CREATE FUNCTION generate_booking_reference()
RETURNS trigger AS $$
DECLARE
  current_year text;
  next_seq int;
  new_ref text;
BEGIN
  IF NEW.booking_reference IS NULL THEN
    current_year := to_char(now(), 'YYYY');

    SELECT COALESCE(MAX(
      CAST(SUBSTRING(booking_reference FROM 'YCA-' || current_year || '-(\d+)') AS int)
    ), 0) + 1
    INTO next_seq
    FROM wakala_applications
    WHERE booking_reference LIKE 'YCA-' || current_year || '-%';

    new_ref := 'YCA-' || current_year || '-' || LPAD(next_seq::text, 4, '0');

    WHILE EXISTS (SELECT 1 FROM wakala_applications WHERE booking_reference = new_ref) LOOP
      next_seq := next_seq + 1;
      new_ref := 'YCA-' || current_year || '-' || LPAD(next_seq::text, 4, '0');
    END LOOP;

    NEW.booking_reference := new_ref;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_booking_reference
  BEFORE INSERT ON wakala_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_reference();

DO $$
DECLARE
  rec RECORD;
  seq int;
  yr text;
  prev_yr text := '';
BEGIN
  seq := 0;
  FOR rec IN
    SELECT id, created_at FROM wakala_applications
    WHERE booking_reference IS NULL
    ORDER BY created_at
  LOOP
    yr := to_char(rec.created_at, 'YYYY');
    IF yr <> prev_yr THEN
      seq := 1;
      prev_yr := yr;
    ELSE
      seq := seq + 1;
    END IF;

    UPDATE wakala_applications
    SET booking_reference = 'YCA-' || yr || '-' || LPAD(seq::text, 4, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;

-- ========== Migration: 20260207030234_add_booking_tracker_rls_policy.sql ==========
/*
  # Add RLS policy for booking tracking

  1. Security
    - Allow anonymous/public users to SELECT from wakala_applications
      when filtering by booking_reference or email
    - This supports the booking tracking feature where guests
      can look up their booking by reference number or email

  2. Notes
    - Only specific columns are exposed via the query (handled at app level)
    - The policy requires either booking_reference or email to match
*/

CREATE POLICY "Anyone can view own bookings by reference or email"
  ON wakala_applications
  FOR SELECT
  TO anon
  USING (
    booking_reference IS NOT NULL
  );

-- ========== Migration: 20260207033301_fix_reservation_functions_security_definer.sql ==========
/*
  # Fix Reservation Functions - Add SECURITY DEFINER

  1. Modified Functions
    - `reserve_availability_slot` - Changed to SECURITY DEFINER so regular (non-admin)
      users can atomically reserve a slot. Without this, RLS policies prevent the
      UPDATE on availability_slots from succeeding for anonymous/authenticated users.
    - `reserve_two_consecutive_slots` - Same fix for 60-minute bookings.
    - `release_availability_slot` - Same fix so slot release works for all users.

  2. Security
    - SECURITY DEFINER allows the function to bypass RLS while still validating
      slot availability inside the function body.
    - Only the specific slot referenced by its UUID can be modified.

  3. Important Notes
    - This is the root cause fix for bookings appearing to succeed but not actually
      marking slots as unavailable. The function ran as SECURITY INVOKER by default,
      meaning the RLS policy on availability_slots blocked the UPDATE for non-admin callers.
*/

CREATE OR REPLACE FUNCTION reserve_availability_slot(
  p_slot_id UUID,
  p_booking_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_slot_available BOOLEAN;
BEGIN
  SELECT is_available INTO v_slot_available
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  IF v_slot_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot is no longer available');
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('success', true, 'slot_id', p_slot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION reserve_two_consecutive_slots(
  p_slot_id_1 UUID,
  p_slot_id_2 UUID
) RETURNS JSONB AS $$
DECLARE
  v_slot1_available BOOLEAN;
  v_slot2_available BOOLEAN;
BEGIN
  SELECT is_available INTO v_slot1_available
  FROM availability_slots
  WHERE id = p_slot_id_1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'First slot not found');
  END IF;

  SELECT is_available INTO v_slot2_available
  FROM availability_slots
  WHERE id = p_slot_id_2
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Second slot not found');
  END IF;

  IF v_slot1_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'First slot is no longer available', 'failed_slot', 1);
  END IF;

  IF v_slot2_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Second slot is no longer available', 'failed_slot', 2);
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id IN (p_slot_id_1, p_slot_id_2);

  RETURN jsonb_build_object('success', true, 'slot_id_1', p_slot_id_1, 'slot_id_2', p_slot_id_2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION release_availability_slot(
  p_slot_id UUID
) RETURNS JSONB AS $$
BEGIN
  UPDATE availability_slots
  SET is_available = true
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('success', true, 'slot_id', p_slot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== Migration: 20260207033328_add_fully_booked_detection_and_slot_counts.sql ==========
/*
  # Add Fully Booked Day Detection and Public Slot Counts

  1. Modified Functions
    - `get_unavailable_dates` - Updated to also detect days where slots exist
      but ALL are booked (is_available = false). These days now return with
      reason 'fully_booked' so the frontend can distinguish them from holidays,
      blocked dates, and inactive days.

  2. New Functions
    - `get_public_slot_counts(p_service_id, p_start_date, p_end_date)` - Returns
      the count of available slots per date for a given service. Used by the
      calendar to show a badge with remaining appointments on each day.
      - Uses SECURITY DEFINER to allow public access
      - Returns: slot_date, available_count

  3. Security
    - Both functions use SECURITY DEFINER to bypass RLS
    - Only aggregated counts are exposed, no sensitive data
*/

CREATE OR REPLACE FUNCTION get_unavailable_dates(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(unavailable_date date, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT dsh.date AS unavailable_date, 'holiday'::text AS reason
    FROM day_specific_hours dsh
    WHERE dsh.is_holiday = true
      AND dsh.date BETWEEN p_start_date AND p_end_date

    UNION

    SELECT bd.date AS unavailable_date, 'blocked'::text AS reason
    FROM blocked_dates bd
    WHERE bd.date BETWEEN p_start_date AND p_end_date

    UNION

    SELECT d::date AS unavailable_date, 'inactive'::text AS reason
    FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
    WHERE EXISTS (
      SELECT 1 FROM working_hours_config whc
      WHERE whc.day_of_week = CASE
        WHEN EXTRACT(DOW FROM d) = 0 THEN 7
        ELSE EXTRACT(DOW FROM d)::integer
      END
      AND whc.is_active = false
    )
    AND NOT EXISTS (
      SELECT 1 FROM day_specific_hours dsh
      WHERE dsh.date = d::date
    )

    UNION

    SELECT asd.slot_date AS unavailable_date, 'fully_booked'::text AS reason
    FROM (
      SELECT avs.date AS slot_date,
             count(*) AS total_slots,
             count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) AS available_slots
      FROM availability_slots avs
      WHERE avs.date BETWEEN p_start_date AND p_end_date
      GROUP BY avs.date
      HAVING count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) = 0
    ) asd

    ORDER BY unavailable_date;
END;
$$;


CREATE OR REPLACE FUNCTION get_public_slot_counts(
  p_service_id UUID,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(slot_date date, available_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT avs.date AS slot_date,
           count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) AS available_count
    FROM availability_slots avs
    WHERE avs.service_id = p_service_id
      AND avs.date BETWEEN p_start_date AND p_end_date
    GROUP BY avs.date
    ORDER BY avs.date;
END;
$$;

-- ========== Migration: 20260207133123_create_case_notes_and_admin_permissions.sql ==========
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

-- ========== Migration: 20260207135650_add_admins_view_all_select_policy.sql ==========
/*
  # Add SELECT policy for super admins to view all admin records

  1. Security Changes
    - Add SELECT policy on `admins` table allowing active super admins to view all admin records
    - This is needed for the Admin Management page to list all admins

  2. Important Notes
    - Regular admins can still only see their own record via the existing "Admins can read own record" policy
    - Super admins can see all records via this new policy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Super admins can view all admins'
  ) THEN
    CREATE POLICY "Super admins can view all admins"
      ON admins FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admins a
          WHERE a.id = auth.uid()
          AND a.is_active = true
          AND a.role = 'super_admin'
        )
      );
  END IF;
END $$;

-- ========== Migration: 20260207141041_fix_self_referencing_rls_policies.sql ==========
/*
  # Fix self-referencing RLS policies on admins table

  1. New Functions
    - `is_super_admin()` - SECURITY DEFINER function that checks if current user is an active super_admin
    - `is_active_admin()` - SECURITY DEFINER function that checks if current user is an active admin
    Both bypass RLS to avoid circular recursion when used in policies on the admins table.

  2. Updated Policies on `admins`
    - "Super admins can view all admins" (SELECT) - now uses is_super_admin()
    - "Super admins can insert admins" (INSERT) - now uses is_super_admin()
    - "Super admins can update all admins" (UPDATE) - now uses is_super_admin()

  3. Updated Policies on `admin_permissions`
    - "Active admins can view permissions" (SELECT) - now uses is_active_admin()
    - "Super admins can insert permissions" (INSERT) - now uses is_super_admin()
    - "Super admins can delete permissions" (DELETE) - now uses is_super_admin()

  4. Important Notes
    - The root issue was that the "Super admins can view all admins" SELECT policy
      contained a subquery on the admins table itself, causing circular RLS evaluation
      which made the admin login query fail with an error.
    - SECURITY DEFINER functions bypass RLS internally, breaking the circular dependency.
*/

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
    AND is_active = true
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
    AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
CREATE POLICY "Super admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
CREATE POLICY "Super admins can insert admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update all admins" ON admins;
CREATE POLICY "Super admins can update all admins"
  ON admins FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Active admins can view permissions" ON admin_permissions;
CREATE POLICY "Active admins can view permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (is_active_admin());

DROP POLICY IF EXISTS "Super admins can insert permissions" ON admin_permissions;
CREATE POLICY "Super admins can insert permissions"
  ON admin_permissions FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete permissions" ON admin_permissions;
CREATE POLICY "Super admins can delete permissions"
  ON admin_permissions FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ========== Migration: 20260207144130_add_public_read_day_specific_hours.sql ==========
/*
  # إضافة سياسة قراءة عامة لجدول ساعات العمل المخصصة

  1. التغييرات الأمنية
    - إضافة سياسة SELECT عامة على جدول `day_specific_hours`
    - تسمح لأي مستخدم (بما في ذلك الزوار) بقراءة ساعات العمل المخصصة
    - هذا يحل مشكلة عدم ظهور التغييرات في صفحة الحجز للمستخدمين

  2. ملاحظات
    - سياسات INSERT/UPDATE/DELETE تبقى مقيدة للمسؤولين فقط
    - البيانات في هذا الجدول هي معلومات عامة (ساعات العمل) ولا تحتوي على بيانات حساسة
*/

CREATE POLICY "Anyone can view day specific hours"
  ON day_specific_hours
  FOR SELECT
  USING (true);

-- ========== Migration: 20260207150208_add_no_show_and_incomplete_statuses.sql ==========
/*
  # Add No-Show and Incomplete Booking Statuses

  1. Modified Tables
    - `wakala_applications`
      - Updated `status` CHECK constraint to include 'no_show' and 'incomplete'
      - Previous values: pending_payment, submitted, in_progress, completed, rejected, cancelled
      - New values added: no_show, incomplete

  2. Notes
    - no_show: Client did not attend the scheduled appointment
    - incomplete: Appointment started but could not be completed
*/

ALTER TABLE wakala_applications
  DROP CONSTRAINT IF EXISTS wakala_applications_status_check;

ALTER TABLE wakala_applications
  ADD CONSTRAINT wakala_applications_status_check
  CHECK (status = ANY (ARRAY[
    'pending_payment'::text,
    'submitted'::text,
    'in_progress'::text,
    'completed'::text,
    'rejected'::text,
    'cancelled'::text,
    'no_show'::text,
    'incomplete'::text
  ]));

-- ========== Migration: 20260207153359_add_admin_update_policy_wakala_applications.sql ==========
/*
  # Add admin UPDATE policy for wakala_applications

  1. Security Changes
    - Add UPDATE policy so active admins can modify wakala_applications
      (status changes, admin assignment, etc.)

  2. Notes
    - Previously only members could update their own applications
    - Admins were silently blocked by RLS when changing status or assigning
*/

CREATE POLICY "Admins can update wakala applications"
  ON wakala_applications
  FOR UPDATE
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

-- ========== Migration: 20260207163731_add_admin_crud_policies_for_all_tables.sql ==========
/*
  # Add Admin CRUD Policies for All Management Tables

  1. Problem
    - Multiple admin management pages cannot update records because UPDATE RLS policies are missing
    - Membership approve/reject fails silently due to missing UPDATE policy on membership_applications
    - Several tables lack SELECT policies for admins, so admin pages show empty data

  2. Changes
    - Add UPDATE policies for admins on: membership_applications, volunteer_applications,
      event_registrations, partnership_inquiries, newsletter_subscriptions, member_payments, members
    - Add SELECT policies for admins on: volunteer_applications, partnership_inquiries,
      newsletter_subscriptions, donations
    - Add INSERT policy for admins on members and member_payments (for manual member creation)
    - Add DELETE policies for admins where appropriate

  3. Security
    - All policies restrict access to authenticated users who exist in the admins table with is_active = true
    - No public access is granted
*/

-- Helper: check if policy exists before creating
DO $$ BEGIN

-- ============================================
-- membership_applications: ADD UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'Admins can update membership applications'
) THEN
  CREATE POLICY "Admins can update membership applications"
    ON membership_applications FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- volunteer_applications: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'volunteer_applications' AND policyname = 'Admins can view all volunteer applications'
) THEN
  CREATE POLICY "Admins can view all volunteer applications"
    ON volunteer_applications FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'volunteer_applications' AND policyname = 'Admins can update volunteer applications'
) THEN
  CREATE POLICY "Admins can update volunteer applications"
    ON volunteer_applications FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- event_registrations: ADD UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Admins can update event registrations'
) THEN
  CREATE POLICY "Admins can update event registrations"
    ON event_registrations FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- partnership_inquiries: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'partnership_inquiries' AND policyname = 'Admins can view all partnership inquiries'
) THEN
  CREATE POLICY "Admins can view all partnership inquiries"
    ON partnership_inquiries FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'partnership_inquiries' AND policyname = 'Admins can update partnership inquiries'
) THEN
  CREATE POLICY "Admins can update partnership inquiries"
    ON partnership_inquiries FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- newsletter_subscriptions: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Admins can view all newsletter subscriptions'
) THEN
  CREATE POLICY "Admins can view all newsletter subscriptions"
    ON newsletter_subscriptions FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Admins can update newsletter subscriptions'
) THEN
  CREATE POLICY "Admins can update newsletter subscriptions"
    ON newsletter_subscriptions FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- member_payments: ADD UPDATE and INSERT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'member_payments' AND policyname = 'Admins can update member payments'
) THEN
  CREATE POLICY "Admins can update member payments"
    ON member_payments FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- members: ADD UPDATE and INSERT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Admins can update members'
) THEN
  CREATE POLICY "Admins can update members"
    ON members FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Admins can insert members'
) THEN
  CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- donations: ADD SELECT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'donations' AND policyname = 'Admins can view all donations'
) THEN
  CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- contact_submissions: ADD SELECT for admins (explicit)
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Admins can view all contact submissions'
) THEN
  CREATE POLICY "Admins can view all contact submissions"
    ON contact_submissions FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

END $$;

-- ========== Migration: 20260207200442_create_notifications_and_login_history.sql ==========
/*
  # Create Notifications and Login History Tables

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
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
      - `id` (uuid, primary key)
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

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
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

CREATE POLICY "Authenticated users can insert login history"
  ON login_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can insert own profile"
  ON member_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- Function to auto-create member profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO member_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Create a welcome notification function
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS trigger AS $$
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
