interface ContentDefault {
  section_key: string;
  text_en: string;
  text_ar: string;
}

const footerDefaults: ContentDefault[] = [
  { section_key: 'welcome_message', text_en: 'YCA Welcomes You All', text_ar: 'الجالية اليمنية ترحب بالجميع' },
  { section_key: 'description', text_en: 'Empowering the Yemeni community in Birmingham through dedicated services, cultural programmes, and community support since 1993.', text_ar: 'تمكين الجالية اليمنية في برمنغهام من خلال خدمات متخصصة وبرامج ثقافية ودعم مجتمعي منذ عام 1993.' },
  { section_key: 'social_cta', text_en: 'Follow Us', text_ar: 'تابعنا' },
  { section_key: 'contact_info_title', text_en: 'Contact Info', text_ar: 'معلومات الاتصال' },
  { section_key: 'address_line1', text_en: 'YCA GreenCoat House', text_ar: 'YCA GreenCoat House' },
  { section_key: 'address_line2', text_en: '261-271 Stratford Road', text_ar: '261-271 Stratford Road' },
  { section_key: 'address_line3', text_en: 'Birmingham, B11 1QS', text_ar: 'Birmingham, B11 1QS' },
  { section_key: 'phone', text_en: '0121 439 5280', text_ar: '0121 439 5280' },
  { section_key: 'email', text_en: 'info@yca-birmingham.org.uk', text_ar: 'info@yca-birmingham.org.uk' },
  { section_key: 'copyright', text_en: 'Yemeni Community Association Birmingham. Registered Charity No. 1057470', text_ar: 'الجمعية اليمنية في برمنغهام. جمعية خيرية مسجلة برقم 1057470' },
];

const donateDefaults: ContentDefault[] = [
  { section_key: 'intro', text_en: 'Your generous donations help us continue providing essential services to the Yemeni community in Birmingham.', text_ar: 'تبرعاتكم السخية تساعدنا على الاستمرار في تقديم الخدمات الأساسية للجالية اليمنية في برمنغهام.' },
  { section_key: 'one_time_title', text_en: 'One-Time Donation', text_ar: 'تبرع لمرة واحدة' },
  { section_key: 'one_time_desc', text_en: 'Make a single donation to support our community services and programmes.', text_ar: 'قدّم تبرعاً واحداً لدعم خدماتنا وبرامجنا المجتمعية.' },
  { section_key: 'monthly_title', text_en: 'Monthly Donation', text_ar: 'تبرع شهري' },
  { section_key: 'monthly_desc', text_en: 'Set up a regular monthly donation for sustained impact.', text_ar: 'قم بإعداد تبرع شهري منتظم لتأثير مستدام.' },
  { section_key: 'impact_title', text_en: 'Your Impact', text_ar: 'أثر تبرعك' },
  { section_key: 'impact_desc', text_en: 'Every donation makes a difference in the lives of our community members.', text_ar: 'كل تبرع يحدث فرقاً في حياة أفراد مجتمعنا.' },
  { section_key: 'cta_title', text_en: 'Ready to Make a Difference?', text_ar: 'هل أنت مستعد لإحداث فرق؟' },
];

const aboutTeamDefaults: ContentDefault[] = [
  { section_key: 'intro', text_en: 'Meet the dedicated individuals who lead and support YCA Birmingham.', text_ar: 'تعرف على الأفراد المتفانين الذين يقودون ويدعمون الجمعية اليمنية في برمنغهام.' },
  { section_key: 'board_title', text_en: 'YCA Board Members', text_ar: 'أعضاء مجلس إدارة الجمعية' },
  { section_key: 'board_desc', text_en: 'Our dedicated board members provide strategic guidance and governance for the association.', text_ar: 'يقدم أعضاء مجلس إدارتنا المتفانون التوجيه الاستراتيجي والحوكمة للجمعية.' },
  { section_key: 'staff_title', text_en: 'Staff', text_ar: 'الموظفون' },
  { section_key: 'staff_desc', text_en: 'Our staff work tirelessly to deliver quality services to the community.', text_ar: 'يعمل موظفونا بلا كلل لتقديم خدمات عالية الجودة للمجتمع.' },
  { section_key: 'join_title', text_en: 'Join Our Team', text_ar: 'انضم إلى فريقنا' },
  { section_key: 'join_desc', text_en: 'We are always looking for passionate individuals to join our mission.', text_ar: 'نحن دائماً نبحث عن أفراد شغوفين للانضمام إلى مهمتنا.' },
];

const defaultsMap: Record<string, ContentDefault[]> = {
  footer: footerDefaults,
  donate: donateDefaults,
  about_team: aboutTeamDefaults,
};

export function getPageDefaults(page: string): ContentDefault[] {
  return defaultsMap[page] || [];
}

export function hasDefaults(page: string): boolean {
  return page in defaultsMap;
}
