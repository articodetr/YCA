/*
  # Add Static Content for Content Management System
  
  1. Purpose
    - Populate the content_sections table with all existing static text from the website
    - Enable admin to edit all website text content from a central location
    - Preserve all current text as default values
  
  2. Content Organization
    Content is organized by page and section:
    - home: Hero text, stats, services intro, mission section, events section, get involved section, CTA section
    - services: Page description, mission cards, support workers list, services categories, opening times, contact info, feedback section
    - contact: Page description, contact info, form labels, need advice section
    - footer: Description, contact details, copyright text
    - about_mission: Mission text, vision text, core values, success description, join us section
    - donate: Page description, donation benefits, other ways section, support alternatives
  
  3. Data Structure
    Each content section contains:
    - page: The page identifier (e.g., 'home', 'services')
    - section_key: Unique key for the section (e.g., 'hero_subtitle', 'stats_members_label')
    - content: JSONB containing the actual text content
    - is_active: Boolean to enable/disable content
  
  4. Notes
    - All existing text is preserved exactly as it appears in the current site
    - Admin can modify any text through the Content Management interface
    - Fallback values are maintained in the frontend code
*/

-- Insert Home Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('home', 'hero_subtitle', '{"text": "Serving our community with pride and dignity"}', true),
  ('home', 'hero_button_services', '{"text": "Discover Our Services"}', true),
  ('home', 'hero_button_contact', '{"text": "Get In Touch"}', true),
  
  ('home', 'stats_members_label', '{"text": "Active Members"}', true),
  ('home', 'stats_programmes_label', '{"text": "Core Programmes"}', true),
  ('home', 'stats_years_label', '{"text": "Years of Service"}', true),
  ('home', 'stats_impact_label', '{"text": "Lives Impacted"}', true),
  
  ('home', 'welcome_title', '{"text": "Welcome to YCA Birmingham"}', true),
  ('home', 'welcome_description', '{"text": "We are dedicated to raising the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic, and cultural life of Birmingham."}', true),
  ('home', 'mission_title', '{"text": "Our Mission & Vision"}', true),
  ('home', 'mission_paragraph1', '{"text": "In all our activities and services, YCA Birmingham is focused on the community, brings the community together, preserves the identity of the Yemeni Community, and encourages mutual respect."}', true),
  ('home', 'mission_paragraph2', '{"text": "We provide community services such as advice, information, advocacy, and related services for the local community, with a special focus on individuals who don''t speak English and need Arabic-speaking advisors."}', true),
  ('home', 'mission_button', '{"text": "Learn More About Us"}', true),
  
  ('home', 'services_section_title', '{"text": "Our Services"}', true),
  ('home', 'services_section_description', '{"text": "Comprehensive support and guidance for the Yemeni community in Birmingham"}', true),
  ('home', 'service_advice_title', '{"text": "Advice & Guidance"}', true),
  ('home', 'service_advice_description', '{"text": "One-to-one confidential support with welfare benefits, housing, immigration, and essential life services in both English and Arabic."}', true),
  ('home', 'service_programmes_title', '{"text": "Community Programmes"}', true),
  ('home', 'service_programmes_description', '{"text": "Dedicated programmes for women, elderly, youth, children, and men focusing on social bonds, wellbeing, and cultural heritage."}', true),
  ('home', 'service_hub_title', '{"text": "Community Hub"}', true),
  ('home', 'service_hub_description', '{"text": "A welcoming space for social gatherings, cultural celebrations, and community events that bring our community together."}', true),
  
  ('home', 'events_title', '{"text": "Upcoming Events"}', true),
  ('home', 'events_description', '{"text": "Join us for cultural celebrations, community gatherings, and special programmes throughout the year. From National Day celebrations to youth sports activities, there''s something for everyone."}', true),
  ('home', 'events_button', '{"text": "View All Events"}', true),
  
  ('home', 'get_involved_title', '{"text": "Get Involved"}', true),
  ('home', 'get_involved_description', '{"text": "There are many ways you can support and contribute to our community"}', true),
  ('home', 'get_involved_membership_title', '{"text": "Become a Member"}', true),
  ('home', 'get_involved_membership_desc', '{"text": "Join our growing community"}', true),
  ('home', 'get_involved_volunteer_title', '{"text": "Volunteer"}', true),
  ('home', 'get_involved_volunteer_desc', '{"text": "Make a difference"}', true),
  ('home', 'get_involved_donate_title', '{"text": "Donate"}', true),
  ('home', 'get_involved_donate_desc', '{"text": "Support our work"}', true),
  ('home', 'get_involved_partner_title', '{"text": "Partner With Us"}', true),
  ('home', 'get_involved_partner_desc', '{"text": "Collaborate for impact"}', true),
  
  ('home', 'cta_title', '{"text": "Need Help or Have Questions?"}', true),
  ('home', 'cta_description', '{"text": "Our bilingual team is here to assist you. Contact us today for confidential advice and support."}', true),
  ('home', 'cta_button', '{"text": "Contact Us Today"}', true)
ON CONFLICT DO NOTHING;

-- Insert Services Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('services', 'page_title', '{"text": "Our Services"}', true),
  ('services', 'page_description', '{"text": "Advice & Guidance: Supporting the Yemeni Community in Birmingham"}', true),
  
  ('services', 'intro_title', '{"text": "Sustaining and Developing Comprehensive Advice and Guidance Services"}', true),
  ('services', 'intro_paragraph1', '{"text": "The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community."}', true),
  ('services', 'intro_paragraph2', '{"text": "We are working hard to empower our community, especially those who need our help the most: individuals who don''t speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need."}', true),
  
  ('services', 'mission_card_title', '{"text": "Our Mission and Who We Help"}', true),
  ('services', 'mission_card_description', '{"text": "We empower individuals who don''t speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding."}', true),
  ('services', 'how_help_title', '{"text": "How We Help"}', true),
  ('services', 'how_help_description', '{"text": "We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing."}', true),
  
  ('services', 'support_workers_title', '{"text": "Our Support Workers Will:"}', true),
  ('services', 'support_worker_1', '{"text": "Signpost clients to relevant third-party agencies"}', true),
  ('services', 'support_worker_2', '{"text": "Assist in filling out application forms"}', true),
  ('services', 'support_worker_3', '{"text": "Read, explain, and translate complex letters"}', true),
  ('services', 'support_worker_4', '{"text": "Interpret on the client''s behalf during meetings and calls"}', true),
  ('services', 'support_worker_5', '{"text": "Arrange for solicitor surgeries when legal advice is required"}', true),
  ('services', 'support_worker_6', '{"text": "Support online housing applications using our dedicated computers"}', true),
  
  ('services', 'services_list_title', '{"text": "Services We Provide"}', true),
  ('services', 'services_list_description', '{"text": "We provide guidance and practical help with a wide range of administrative and benefit applications"}', true),
  
  ('services', 'opening_times_title', '{"text": "When You Can Find Us"}', true),
  ('services', 'opening_days', '{"text": "5 days per week"}', true),
  ('services', 'opening_hours', '{"text": "Monday to Friday, 10:00 AM – 3:00 PM"}', true),
  ('services', 'contact_prompt', '{"text": "Contact us today to book your one-to-one appointment"}', true),
  ('services', 'contact_phone', '{"text": "0121 439 5280"}', true),
  ('services', 'contact_button_phone', '{"text": "0121 439 5280"}', true),
  ('services', 'contact_button_message', '{"text": "Send a Message"}', true),
  
  ('services', 'feedback_title', '{"text": "We Value Your Feedback"}', true),
  ('services', 'feedback_description', '{"text": "We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project."}', true)
ON CONFLICT DO NOTHING;

-- Insert Contact Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('contact', 'page_title', '{"text": "Contact Us"}', true),
  ('contact', 'page_description', '{"text": "We''re Here to Help - Get in Touch Today"}', true),
  
  ('contact', 'intro_title', '{"text": "Get In Touch With Us"}', true),
  ('contact', 'intro_description', '{"text": "If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible."}', true),
  
  ('contact', 'address_label', '{"text": "Address"}', true),
  ('contact', 'address_line1', '{"text": "YCA GreenCoat House"}', true),
  ('contact', 'address_line2', '{"text": "261-271 Stratford Road"}', true),
  ('contact', 'address_line3', '{"text": "Birmingham, B11 1QS"}', true),
  
  ('contact', 'phone_label', '{"text": "Phone"}', true),
  ('contact', 'phone_number', '{"text": "0121 439 5280"}', true),
  
  ('contact', 'email_label', '{"text": "Email"}', true),
  ('contact', 'email_address', '{"text": "INFO@yca-birmingham.org.uk"}', true),
  
  ('contact', 'opening_times_label', '{"text": "Opening Times"}', true),
  ('contact', 'opening_days', '{"text": "Monday - Friday"}', true),
  ('contact', 'opening_hours', '{"text": "10:00 AM - 3:00 PM"}', true),
  
  ('contact', 'need_advice_title', '{"text": "Need Advice or Support?"}', true),
  ('contact', 'need_advice_description', '{"text": "Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more."}', true),
  ('contact', 'need_advice_prompt', '{"text": "Call us today to book your one-to-one appointment"}', true),
  
  ('contact', 'form_title', '{"text": "Send Us a Message"}', true),
  ('contact', 'form_name_label', '{"text": "Your Name"}', true),
  ('contact', 'form_email_label', '{"text": "Email"}', true),
  ('contact', 'form_phone_label', '{"text": "Phone"}', true),
  ('contact', 'form_subject_label', '{"text": "Subject"}', true),
  ('contact', 'form_message_label', '{"text": "Message"}', true),
  ('contact', 'form_button', '{"text": "Send Message"}', true),
  ('contact', 'form_success_message', '{"text": "Thank you for your message! We will get back to you soon."}', true),
  ('contact', 'form_error_message', '{"text": "There was an error sending your message. Please try again or contact us directly."}', true)
ON CONFLICT DO NOTHING;

-- Insert Footer Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('footer', 'description', '{"text": "Empowering the Yemeni community in Birmingham through support, guidance, and cultural celebration."}', true),
  ('footer', 'quick_links_title', '{"text": "Quick Links"}', true),
  ('footer', 'programmes_title', '{"text": "Programmes"}', true),
  ('footer', 'contact_info_title', '{"text": "Contact Info"}', true),
  ('footer', 'address_line1', '{"text": "YCA GreenCoat House"}', true),
  ('footer', 'address_line2', '{"text": "261-271 Stratford Road"}', true),
  ('footer', 'address_line3', '{"text": "Birmingham, B11 1QS"}', true),
  ('footer', 'phone', '{"text": "0121 439 5280"}', true),
  ('footer', 'email', '{"text": "INFO@yca-birmingham.org.uk"}', true),
  ('footer', 'copyright', '{"text": "Yemeni Community Association Birmingham. Charity Number: 1057470. All rights reserved."}', true)
ON CONFLICT DO NOTHING;

-- Insert About Mission Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('about_mission', 'page_title', '{"text": "Mission & Vision"}', true),
  ('about_mission', 'page_description', '{"text": "Our Guiding Principles and Aspirations"}', true),
  
  ('about_mission', 'mission_title', '{"text": "Our Mission"}', true),
  ('about_mission', 'mission_description', '{"text": "Here we state our beliefs, morals or rules that underpin the work we do. Our mission is to empower the Yemeni community in Birmingham through comprehensive support services, cultural preservation, and community engagement."}', true),
  
  ('about_mission', 'vision_title', '{"text": "Our Vision"}', true),
  ('about_mission', 'vision_description', '{"text": "We want to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of Birmingham."}', true),
  
  ('about_mission', 'core_values_title', '{"text": "Our Core Values"}', true),
  ('about_mission', 'core_values_intro', '{"text": "In all our activities and services, YCA Birmingham operates according to these fundamental values:"}', true),
  
  ('about_mission', 'value1_title', '{"text": "Focused on the Community"}', true),
  ('about_mission', 'value1_description', '{"text": "All our activities and services prioritize the needs and wellbeing of our community members."}', true),
  ('about_mission', 'value2_title', '{"text": "Bringing the Community Together"}', true),
  ('about_mission', 'value2_description', '{"text": "We create spaces and opportunities for connection, fostering unity and social bonds."}', true),
  ('about_mission', 'value3_title', '{"text": "Preserving Yemeni Identity"}', true),
  ('about_mission', 'value3_description', '{"text": "We celebrate and maintain our rich cultural heritage while thriving in the UK."}', true),
  ('about_mission', 'value4_title', '{"text": "Encouraging Mutual Respect"}', true),
  ('about_mission', 'value4_description', '{"text": "We promote understanding, tolerance, and respect across all our programmes and services."}', true),
  
  ('about_mission', 'success_title', '{"text": "What Success Looks Like"}', true),
  ('about_mission', 'success_paragraph1', '{"text": "Our vision statement is the ideal state we want the Yemeni community in Birmingham to be and what it will be like if YCA Birmingham is successful in achieving its mission."}', true),
  ('about_mission', 'success_paragraph2', '{"text": "A vibrant, cohesive Yemeni community that is fully integrated, respected, and contributing meaningfully to Birmingham''s diverse social fabric."}', true),
  
  ('about_mission', 'join_us_title', '{"text": "Join Us in Our Mission"}', true),
  ('about_mission', 'join_us_description', '{"text": "Together, we can build a stronger, more connected community that celebrates our heritage while embracing our future in Birmingham."}', true)
ON CONFLICT DO NOTHING;

-- Insert Donate Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('donate', 'page_title', '{"text": "Donate / Support Us"}', true),
  ('donate', 'page_description', '{"text": "Your Support Makes a Real Difference"}', true),
  
  ('donate', 'intro_description', '{"text": "YCA Birmingham relies on the generosity of individuals, businesses, and organizations to continue delivering vital services to the Yemeni community in Birmingham. Your donation, no matter the size, helps us support those who need it most."}', true),
  
  ('donate', 'how_helps_title', '{"text": "How Your Donation Helps"}', true),
  ('donate', 'benefit1_title', '{"text": "Support Services"}', true),
  ('donate', 'benefit1_description', '{"text": "Fund advice and guidance services for vulnerable community members who need help navigating UK systems."}', true),
  ('donate', 'benefit2_title', '{"text": "Community Programmes"}', true),
  ('donate', 'benefit2_description', '{"text": "Keep our youth, women''s, elderly, and children''s programmes running and accessible to all."}', true),
  ('donate', 'benefit3_title', '{"text": "Facilities & Resources"}', true),
  ('donate', 'benefit3_description', '{"text": "Maintain our community spaces and provide necessary resources for our services."}', true),
  ('donate', 'benefit4_title', '{"text": "Future Growth"}', true),
  ('donate', 'benefit4_description', '{"text": "Expand our services to reach more people and develop new programmes based on community needs."}', true),
  
  ('donate', 'other_ways_title', '{"text": "Other Ways to Donate"}', true),
  ('donate', 'other_ways_description', '{"text": "Prefer to donate via bank transfer, cheque, or in person? Contact us to discuss alternative donation options. We are a registered charity (Number: 1057470)."}', true),
  ('donate', 'other_ways_button_email', '{"text": "Email Us"}', true),
  ('donate', 'other_ways_button_call', '{"text": "Call: 0121 439 5280"}', true),
  
  ('donate', 'support_alternatives_title', '{"text": "Other Ways to Support"}', true),
  ('donate', 'support_alternatives_description', '{"text": "Can''t donate right now? You can still support us by volunteering your time, attending our events, or spreading the word about our work."}', true),
  ('donate', 'support_alternatives_button_volunteer', '{"text": "Become a Volunteer"}', true),
  ('donate', 'support_alternatives_button_member', '{"text": "Become a Member"}', true)
ON CONFLICT DO NOTHING;