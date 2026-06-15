import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default settings in case the backend database is offline during bootstrapping
const defaultSettings = {
  site_name: 'Neko Customs Brokerage',
  site_name_np: 'नेको भन्सार',
  site_phone: '+977-21-530123, +977-9852023456',
  site_email: 'info@nekocustoms.com.np',
  site_whatsapp: '9779852023456',
  site_address: 'Dry Port Road, Biratnagar-18, Morang, Koshi Province, Nepal',
  site_address_np: 'सुख्खा बन्दरगाह मार्ग, विराटनगर-१८, मोरङ, कोशी प्रदेश, नेपाल',
  site_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.7661556214574!2d87.26909477610667!3d26.398670576957813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef73de909623e1%3A0xe54e605dcdfaec!2sBiratnagar%20Dry%20Port%20(ICD)!5e0!3m2!1sen!2snp!4v1718378901234!5m2!1sen!2snp',
  hero_tag: 'ICD Biratnagar Dry Port Specialist',
  hero_tag_np: 'विराटनगर सुख्खा बन्दरगाह विशेषज्ञ',
  hero_title: 'Expert Custom Clearance Brokerage at Biratnagar Dry Port',
  hero_title_np: 'विराटनगर सुख्खा बन्दरगाहमा विशेषज्ञ भन्सार क्लियरेन्स एजेन्ट',
  hero_subtitle: 'Streamlining imports and exports with professional custom brokerage, tariff advisory, and hassle-free clearing & forwarding solutions at ICD Biratnagar, Nepal.',
  hero_subtitle_np: 'विराटनगर सुख्खा बन्दरगाह (ICD) मा आयात तथा निर्यात हुने मालसामानको कानुनी तथा झन्झटमुक्त भन्सार जाँचपास र ढुवानी सेवाका लागि हामीलाई सम्झनुहोस्।',
  hero_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
  services_title: 'Core Services at Biratnagar ICD',
  services_title_np: 'विराटनगर सुख्खा बन्दरगाहका मुख्य सेवाहरू',
  services_subtitle: 'Providing custom clearing and forwarding agent broker support for seamless trade.',
  services_subtitle_np: 'व्यवस्थित र झन्झटमुक्त व्यापारका लागि हाम्रो भन्सार एजेन्ट र क्लियरिङ सेवाहरू।',
  srv_import_title: 'Import Custom Clearance',
  srv_import_title_np: 'आयात भन्सार जाँचपास',
  srv_import_desc: 'Full documentation, ASYCUDA World declarations, assessment assistance, duty payment clearing, and cargo release at ICD Biratnagar checkpost.',
  srv_import_desc_np: 'विराटनगर बन्दरगाहमा प्रज्ञापना पत्र भर्ने, आसिकुडा वर्ल्ड दर्ता, महशुल भुक्तानी तथा कार्गो रिलिज सम्बन्धी सम्पूर्ण कार्यहरू।',
  srv_export_title: 'Export Compliance & Brokerage',
  srv_export_title_np: 'निर्यात अनुपालन तथा एजेन्सी',
  srv_export_desc: 'Arranging commercial documentation, Certificate of Origin filings, SAFTA registrations, and fast-track custom approvals for Nepalese exports.',
  srv_export_desc_np: 'उत्पत्तिको प्रमाणपत्र (Certificate of Origin), साफ्टा (SAFTA) दर्ता र निकासीका लागि आवश्यक कागजी प्रक्रिया र स्वीकृति।',
  srv_tariff_title: 'Tariff & Duty Consultation',
  srv_tariff_title_np: 'भन्सार महशुल र दर परामर्श',
  srv_tariff_desc: 'Consulting on Harmonized System (HS) classifications, duties, VAT, agricultural reform fees, and excise requirements under the Finance Act.',
  srv_tariff_desc_np: 'नयाँ आर्थिक ऐन बमोजिम वस्तुको एचएस कोड (HS Code) वर्गीकरण, भन्सार महशुल, अन्तःशुल्क र भ्याट दर परामर्श।',
  about_story: 'Neko Customs Brokerage has been at the forefront of international trade facilitation since 2012. Headquartered at Biratnagar, Morang, we specialize in customs documentation, import/export cargo handling, and regulatory compliance clearance at the Biratnagar Dry Port.',
  about_mission: 'To provide fast, compliant, and cost-efficient custom clearance and logistics solutions through technology, transparency, and expert tariff advisory, enabling growth for local and national businesses.',
  about_vision: 'To be Nepal\'s most trusted, digit-oriented custom clearance agency, known for integrity, compliance, and service speed.',
  show_blog: 'true',
  show_notice: 'true',
  show_popup_notice: 'true',
  show_about: 'true',
  show_contact: 'true',
  show_gallery: 'true',
  show_reviews: 'true',
  theme_default: 'light',
  seo_meta_title: 'Custom Clearance Agent at Biratnagar Dry Port | Neko Customs',
  seo_meta_desc: 'Professional Custom Clearing Agent (broker) at Biratnagar ICD Dry Port, Morang. Specializing in import/export clearance, HS code classification, and document compliance in Nepal.',
  seo_meta_keywords: 'custom clearance agent biratnagar, customs broker nepal, icd biratnagar dry port, custom agent morang, import export nepal'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        // Merge fetched data with defaults to ensure all keys are present
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn('Backend settings offline, utilizing local layout configurations.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Set initial theme based on default setting or localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      const def = settings.theme_default || 'light';
      setTheme(def);
      applyTheme(def);
    }
  }, [settings.theme_default]);

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Check if a specific module is active based on dashboard toggles
  const isFeatureActive = (featureName) => {
    // Expected options: 'show_blog', 'show_notice', 'show_popup_notice', 'show_about', 'show_contact'
    return settings[featureName] === 'true' || settings[featureName] === true || settings[featureName] === '1';
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading, theme, toggleTheme, isFeatureActive, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
