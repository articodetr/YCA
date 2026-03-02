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

const programmesDefaults: ContentDefault[] = [
  { section_key: 'page_title', text_en: 'Programmes', text_ar: 'البرامج' },
  { section_key: 'page_description', text_en: 'Community programmes that support and connect our community', text_ar: 'برامج مجتمعية تدعم وتربط أفراد الجالية' },

  { section_key: 'intro_title', text_en: 'Our Programmes', text_ar: 'برامجنا' },
  { section_key: 'intro_p1', text_en: 'We run a range of programmes designed to support different groups in our community.', text_ar: 'نقدم مجموعة من البرامج المصممة لدعم فئات مختلفة في مجتمعنا.' },
  { section_key: 'intro_p2', text_en: 'Choose a programme below to see its description, photos, and related news.', text_ar: 'اختر برنامجًا أدناه لعرض وصفه وصوره وأخباره المرتبطة.' },

  { section_key: 'programmes_title', text_en: 'Explore Our Programmes', text_ar: 'استكشف برامجنا' },
  { section_key: 'programmes_intro', text_en: 'Tabs below are fixed. Programme details are managed from Programmes Management, while this page text is managed from Page Content → Programmes.', text_ar: 'التبويبات أدناه ثابتة. تفاصيل كل برنامج تُدار من إدارة البرامج، أما نص هذه الصفحة فيُدار من Page Content → Programmes.' },

  { section_key: 'gallery_title', text_en: 'Programme Photos', text_ar: 'صور البرنامج' },
  { section_key: 'news_title', text_en: 'Programme News', text_ar: 'أخبار البرنامج' },
  { section_key: 'news_empty', text_en: 'There are no news items linked to this programme yet.', text_ar: 'لا توجد أخبار مرتبطة بهذا البرنامج حاليًا.' },

  { section_key: 'cta_title', text_en: 'Join Our Programmes', text_ar: 'انضم إلى برامجنا' },
  { section_key: 'cta_desc', text_en: "Whether you're looking to participate, volunteer, or support our initiatives, there's a place for you in our community programmes.", text_ar: 'سواء كنت تبحث عن المشاركة أو التطوع أو دعم مبادراتنا، فهناك مكان لك في برامج مجتمعنا.' },
  { section_key: 'cta_btn_member', text_en: 'Become a Member', text_ar: 'كن عضواً' },
  { section_key: 'cta_btn_contact', text_en: 'Contact Us', text_ar: 'تواصل معنا' },
];

const defaultsMap: Record<string, ContentDefault[]> = {
  footer: footerDefaults,
  donate: donateDefaults,
  about_team: aboutTeamDefaults,
  programmes: programmesDefaults,
};

export function getPageDefaults(page: string): ContentDefault[] {
  return defaultsMap[page] || [];
}

export function hasDefaults(page: string): boolean {
  return page in defaultsMap;
}
