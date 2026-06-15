import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Nav Bar
    nav_home: 'Home',
    nav_about: 'About',
    nav_notices: 'Notices',
    nav_gallery: 'Gallery',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    nav_services: 'Services',
    nav_admin: 'Admin',
    btn_quote: 'Clearance Quote',
    
    // Homepage
    hero_tag: 'ICD Biratnagar Dry Port Specialist',
    btn_learn_more: 'Compliance Guide',
    btn_read_more: 'Read Article',
    services_title: 'Core Services at Biratnagar ICD',
    services_subtitle: 'Providing custom clearing and forwarding agent broker support for seamless trade.',
    srv_import_title: 'Import Custom Clearance',
    srv_import_desc: 'Full documentation, ASYCUDA World declarations, assessment assistance, duty payment clearing, and cargo release at ICD Biratnagar checkpost.',
    srv_export_title: 'Export Compliance & Brokerage',
    srv_export_desc: 'Arranging commercial documentation, Certificate of Origin filings, SAFTA registrations, and fast-track custom approvals for Nepalese exports.',
    srv_tariff_title: 'Tariff & Duty Consultation',
    srv_tariff_desc: 'Consulting on Harmonized System (HS) classifications, duties, VAT, agricultural reform fees, and excise requirements under the Finance Act.',
    reviews_title: 'Client Testimonials',
    reviews_subtitle: 'Read what importers and export traders say about our fast-track clearing services at Jogbani border custom check-posts.',
    faq_title: 'Customs Clearance FAQ',
    faq_subtitle: 'Answers to key questions regarding Biratnagar Dry Port customs declarations, duty payments, and procedures.',
    
    // Stats Section
    stats_hours: 'Hours Of Work',
    stats_projects: 'Projects Completed',
    stats_locations: 'Locations',
    stats_awards: 'Awards Won',

    // Services Page
    services_hero_tag: 'Our Professional Services',
    services_hero_title: 'Comprehensive Customs & Trade Solutions',
    services_page_subtitle: 'At Neko Customs Clearing Services, we offer a wide range of professional customs and trade-related solutions to ensure a hassle-free experience for importers and exporters.',
    services_cta_title: 'Need Custom Clearance Assistance?',
    services_cta_subtitle: 'Our expert team is ready to help you navigate the complex customs procedures at Biratnagar Dry Port.',

    // About Page
    about_badge: 'Licensed Broker Agency',
    about_title: 'Your Trusted Gateway to Nepal Trade',
    stat_exp: 'Years Experience',
    stat_cleared: 'Consignments Cleared',
    stat_rate: 'Compliance Rate',
    proc_title: 'Standard Clearance Steps at Biratnagar ICD',
    proc_subtitle: 'How we expedite your import or export cargo through Biratnagar custom check points.',
    step1_title: 'HS Code Audit',
    step1_desc: 'We classify raw materials or finished goods using the Harmonized System (HS Code) to verify tariff rates.',
    step2_title: 'ASYCUDA Entry',
    step2_desc: 'Scanned documents are uploaded online to the Department of Customs\' ASYCUDA World terminal.',
    step3_title: 'Physical Check',
    step3_desc: 'Custom officers perform document audits or physical container check (Yellow/Red channels).',
    step4_title: 'Gate Pass Out',
    step4_desc: 'Upon custom duty confirmation and payment, the dry port issues the gate pass for delivery release.',
    mission_title: 'Our Mission',
    vision_title: 'Our Vision',

    // Notices Page
    notices_title: 'Notice Board',
    notices_subtitle: 'Stay updated with operational notifications, customs tariff updates, and shipping alerts.',
    no_notices: 'No active notices at this time. Check back later.',

    // Gallery Page
    gallery_title: 'Operations Gallery',
    gallery_subtitle: 'Visual updates of our cargo handling, customs inspection, and transit forwarding operations at ICD Biratnagar.',
    no_gallery: 'No gallery images uploaded yet. Check back later.',

    // Blog Page
    blog_title: 'Trade & Customs Advisory Blog',
    blog_subtitle: 'Expert articles, customs compliance guides, and import/export regulations for businesses trading via Biratnagar.',
    no_blogs: 'No blog posts published yet. Check back soon for expert guidance.',
    back_to_blog: 'Back to Blog',

    // Contact Page
    contact_title: 'Contact Our Customs Desk',
    contact_subtitle: 'Have cargo arriving at Biratnagar Dry Port? Send us your inquiry to receive a clearance quote and tariff analysis.',
    card_address: 'Office Address',
    card_phone: 'Phone Numbers',
    card_email: 'Email Correspondence',
    form_name: 'Full Name *',
    form_email: 'Email Address *',
    form_phone: 'Phone / Mobile',
    form_subject: 'Subject *',
    form_message: 'Inquiry / Message Details *',
    btn_submit: 'Submit Inquiry',
    btn_sending: 'Sending Message...',
    success_msg: 'Your message has been sent successfully. We will get back to you shortly!',
    error_msg: 'Failed to submit form.',

    // Footer
    footer_desc: 'Professional custom clearing agent (broker) services at ICD Biratnagar, Morang, Nepal. We streamline imports and exports with compliance and speed.',
    footer_links: 'Useful Links',
    footer_ops: 'Port Operations',
    footer_ops_hours: 'Sun - Fri: 9AM - 5PM',
    footer_ops_gov1: 'Nepal Customs Dept.',
    footer_ops_gov2: 'ICD Biratnagar Dry Port',
    footer_local: 'Local Presence',
    footer_copy: 'All rights reserved.',
    footer_portal: 'Portal Login'
  },
  np: {
    // Nav Bar
    nav_home: 'गृहपृष्ठ',
    nav_about: 'हाम्रो बारेमा',
    nav_notices: 'सूचनाहरू',
    nav_gallery: 'ग्यालेरी',
    nav_blog: 'व्यापार ब्लग',
    nav_contact: 'सम्पर्क',
    nav_services: 'सेवाहरू',
    nav_admin: 'प्रशासक',
    btn_quote: 'जाँचपास कोट',
    
    // Homepage
    hero_tag: 'विराटनगर सुख्खा बन्दरगाह विशेषज्ञ',
    btn_learn_more: 'भन्सार निर्देशिका',
    btn_read_more: 'थप पढ्नुहोस्',
    services_title: 'विराटनगर सुख्खा बन्दरगाहका मुख्य सेवाहरू',
    services_subtitle: 'व्यवस्थित र झन्झटमुक्त व्यापारका लागि हाम्रो भन्सार एजेन्ट र क्लियरिङ सेवाहरू।',
    srv_import_title: 'आयात भन्सार जाँचपास',
    srv_import_desc: 'विराटनगर बन्दरगाहमा प्रज्ञापना पत्र भर्ने, आसिकुडा वर्ल्ड दर्ता, महशुल भुक्तानी तथा कार्गो रिलिज सम्बन्धी सम्पूर्ण कार्यहरू।',
    srv_export_title: 'निर्यात अनुपालन तथा एजेन्सी',
    srv_export_desc: 'उत्पत्तिको प्रमाणपत्र (Certificate of Origin), साफ्टा (SAFTA) दर्ता र निकासीका लागि आवश्यक कागजी प्रक्रिया र स्वीकृति।',
    srv_tariff_title: 'भन्सार महशुल र दर परामर्श',
    srv_tariff_desc: 'नयाँ आर्थिक ऐन बमोजिम वस्तुको एचएस कोड (HS Code) वर्गीकरण, भन्सार महशुल, अन्तःशुल्क र भ्याट दर परामर्श।',
    reviews_title: 'ग्राहकहरूको प्रतिक्रिया',
    reviews_subtitle: 'विराटनगर सुख्खा बन्दरगाह (ICP) नाकाबाट हाम्रा सेवाहरू प्रयोग गरिरहेका ग्राहकहरूको अनुभव।',
    faq_title: 'भन्सार जाँचपास सम्बन्धी सोधिने प्रश्नहरू',
    faq_subtitle: 'विराटनगर बन्दरगाहमा प्रज्ञापना पत्र दर्ता, भन्सार महशुल र प्रक्रिया सम्बन्धी केही उपयोगी उत्तरहरू।',
    
    // Stats Section
    stats_hours: 'काम गरिएका घण्टा',
    stats_projects: 'पूरा गरिएका परियोजनाहरू',
    stats_locations: 'स्थानहरू',
    stats_awards: 'पुरस्कारहरू',

    // Services Page
    services_hero_tag: 'हाम्रा व्यावसायिक सेवाहरू',
    services_hero_title: 'व्यापक भन्सार तथा व्यापार समाधान',
    services_page_subtitle: 'नेको भन्सार क्लियरिङ सेवामा, हामी आयातकर्ता र निर्यातकर्ताहरूलाई झन्झटमुक्त अनुभव सुनिश्चित गर्न विभिन्न व्यावसायिक भन्सार र व्यापार-सम्बन्धी समाधानहरू प्रदान गर्दछौं।',
    services_cta_title: 'भन्सार जाँचपासमा सहयोग चाहिन्छ?',
    services_cta_subtitle: 'हाम्रो विशेषज्ञ टोली विराटनगर सुख्खा बन्दरगाहको जटिल भन्सार प्रक्रियामा तपाईंलाई सहयोग गर्न तयार छ।',

    // About Page
    about_badge: 'लाइसेन्स प्राप्त भन्सार एजेन्ट',
    about_title: 'नेपाल व्यापारको भरपर्दो नाका साझेदार',
    stat_exp: 'वर्षको अनुभव',
    stat_cleared: 'जाँचपास गरिएका ढुवानीहरू',
    stat_rate: 'कानुनी अनुपालन दर',
    proc_title: 'विराटनगर सुख्खा बन्दरगाहको जाँचपास प्रक्रिया',
    proc_subtitle: 'विराटनगर भन्सार नाकाबाट तपाईंको आयात वा निर्यात कार्गो कसरी सुरक्षित रूपमा पास गराइन्छ?',
    step1_title: 'एचएस कोड अडिट',
    step1_desc: 'भन्सार दर निर्धारण गर्न हार्मोनाइज्ड प्रणाली (HS Code) अनुसार वस्तुको सही वर्गीकरण गरिन्छ।',
    step2_title: 'आसिकुडा प्रविष्टि',
    step2_desc: 'तयार कागजातहरू डिजिटल रूपमा स्क्यान गरी भन्सार विभागको आसिकुडा वर्ल्ड अनलाइन प्रणालीमा चढाइन्छ।',
    step3_title: 'भौतिक परीक्षण',
    step3_desc: 'भन्सार अधिकृतहरूद्वारा कागजात अनुसन्धान वा कन्टेनरको भौतिक निरीक्षण (पहेंलो/रातो च्यानल) गरिन्छ।',
    step4_title: 'गेट पास जारी',
    step4_desc: 'भन्सार महशुल बैंक मार्फत तिरेपछि सुख्खा बन्दरगाहले ढुवानी फुकुवाको लागि गेट पास जारी गर्दछ।',
    mission_title: 'हाम्रो लक्ष्य',
    vision_title: 'हाम्रो संकल्प',

    // Notices Page
    notices_title: 'सूचना पाटी',
    notices_subtitle: 'भन्सार कार्यालयका संचालन सूचना, नयाँ महशुल दर संसोधन तथा बन्दरगाहका सूचनाहरू।',
    no_notices: 'हाल कुनै सक्रिय सूचना उपलब्ध छैन। पछि फेरि हेर्नुहोला।',

    // Gallery Page
    gallery_title: 'संचालन ग्यालेरी',
    gallery_subtitle: 'विराटनगर सुख्खा बन्दरगाहमा भैरहेका कार्गो व्यवस्थापन र भन्सार निरीक्षणका केही दृश्यहरू।',
    no_gallery: 'ग्यालेरीमा कुनै तस्वीर थपिएको छैन। पछि फेरि हेर्नुहोला।',

    // Blog Page
    blog_title: 'व्यापार तथा भन्सार निर्देशिका ब्लग',
    blog_subtitle: 'विराटनगर नाकाबाट आयात-निर्यात गर्ने व्यवसायीका लागि भन्सार नियम र परामर्श सम्बन्धी लेखहरू।',
    no_blogs: 'अहिलेसम्म कुनै लेखहरू प्रकाशित भएका छैनन्। चाँडै थपिनेछन्।',
    back_to_blog: 'Advisory ब्लगमा फर्कनुहोस्',

    // Contact Page
    contact_title: 'भन्सार सोधपुछ डेस्क',
    contact_subtitle: 'विराटनगर बन्दरगाहमा मालसामान आइपुग्दैछ? भन्सार कोट र महशुल दर विश्लेषण प्राप्त गर्न फारम भर्नुहोस्।',
    card_address: 'कार्यालयको ठेगाना',
    card_phone: 'फोन नम्बरहरू',
    card_email: 'इमेल पत्राचार',
    form_name: 'पूरा नाम *',
    form_email: 'इमेल ठेगाना *',
    form_phone: 'फोन / मोबाइल',
    form_subject: 'विषय *',
    form_message: 'विस्तृत सोधपुछ विवरण *',
    btn_submit: 'सोधपुछ पठाउनुहोस्',
    btn_sending: 'पठाउँदैछ...',
    success_msg: 'तपाईंको सन्देश सफलतापूर्वक पठाइएको छ। हामी चाँडै सम्पर्क गर्नेछौं!',
    error_msg: 'फारम बुझाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',

    // Footer
    footer_desc: 'विराटनगर सुख्खा बन्दरगाह (ICD/ICP), मोरङमा व्यावसायिक भन्सार जाँचपास र क्लियरिङ सेवा। हामी कानुनसम्मत आयात-निर्यातलाई सहजीकरण गर्दछौं।',
    footer_links: 'महत्वपूर्ण लिङ्कहरू',
    footer_ops: 'बन्दरगाह संचालन समय',
    footer_ops_hours: 'आइतबार - शुक्रबार: बिहान ९ बजे - बेलुका ५ बजे',
    footer_ops_gov1: 'भन्सार विभाग नेपाल',
    footer_ops_gov2: 'विराटनगर सुख्खा बन्दरगाह',
    footer_local: 'हाम्रो उपस्थिति',
    footer_copy: 'सर्वाधिकार सुरक्षित।',
    footer_portal: 'पोर्टल लगइन'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'np')) {
      setLanguage(storedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'np' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
