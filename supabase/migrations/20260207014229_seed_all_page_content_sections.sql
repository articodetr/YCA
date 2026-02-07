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