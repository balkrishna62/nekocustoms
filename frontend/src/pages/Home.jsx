import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck, FileText, Globe, Landmark, Star, Quote, Clock, Briefcase, MapPinned, Award } from 'lucide-react';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';

const Home = () => {
  const { settings, isFeatureActive } = useSettings();
  const { language, t } = useTranslation();
  const navigate = useNavigate();

  // Component States
  const [activeFaq, setActiveFaq] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Fetch reviews matching active language
  useEffect(() => {
    if (!isFeatureActive('show_reviews')) {
      return;
    }

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/reviews?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.warn('Reviews API offline. Fallback rendering active.', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [language, isFeatureActive]);

  // Stats countdown animation
  const statsRef = useRef(null);
  const [statsCounted, setStatsCounted] = useState(false);
  const [counters, setCounters] = useState({ hours: 0, projects: 0, locations: 0, awards: 0 });

  const statsData = [
    { key: 'hours', target: 1000, icon: <Clock size={32} />, label: t('stats_hours') },
    { key: 'projects', target: 150, icon: <Briefcase size={32} />, label: t('stats_projects') },
    { key: 'locations', target: 20, icon: <MapPinned size={32} />, label: t('stats_locations') },
    { key: 'awards', target: 80, icon: <Award size={32} />, label: t('stats_awards') },
  ];

  const animateCounters = useCallback(() => {
    if (statsCounted) return;
    setStatsCounted(true);
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCounters({
        hours: Math.round(1000 * eased),
        projects: Math.round(150 * eased),
        locations: Math.round(20 * eased),
        awards: Math.round(80 * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  }, [statsCounted]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [animateCounters]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Localized FAQs for AEO (Answer Engine Optimization)
  const faqs = language === 'np' ? [
    {
      question: 'विराटनगर सुख्खा बन्दरगाहमा जाँचपासका लागि के-कस्ता कागजातहरू आवश्यक पर्छन्?',
      answer: 'विराटनगर सुख्खा बन्दरगाह (ICD/ICP) मा व्यावसायिक आयातका लागि आवश्यक मुख्य कागजातहरूमा: व्यावसायिक बीजक (Commercial Invoice), प्याकिङ लिस्ट (Packing List), चलान रसिद (L/R), उत्पत्तिको प्रमाणपत्र (Certificate of Origin - साफ्टा सहुलियतका लागि), प्रतीतपत्र (L/C) वा बैंकिङ भुक्तानी कागजात, आयातकर्ताको प्यान/भ्याट दर्ता र एक्जिम कोड (EXIM Code) हुन्।'
    },
    {
      question: 'विराटनगर सुख्खा बन्दरगाह (ICD) मा सामान जाँचपास हुन कति समय लाग्छ?',
      answer: 'यदि सबै कागजातहरू सही र कानुनसम्मत छन् भने, मालसामान बन्दरगाह आइपुगेको २४ देखि ४८ घण्टाभित्र भन्सार जाँचपास सम्पन्न गर्न सकिन्छ। कागजात वर्गीकरणमा विवाद हुँदा वा भौतिक निरीक्षण (रातो च्यानल) पर्दा केही समय थप लाग्न सक्छ।'
    },
    {
      question: 'के तपाईं वस्तुको एचएस कोड वर्गीकरण र भन्सार महशुल दर गणनामा सहयोग गर्नुहुन्छ?',
      answer: 'अन्तर्राष्ट्रिय व्यापारमा वस्तुको सही एचएस कोड (HS Code) वर्गिकरण अत्यन्त महत्वपूर्ण हुन्छ। हामी नेपाल सरकारको आर्थिक ऐन बमोजिम आयात-निर्यात हुने सामानको एचएस कोड विश्लेषण, भन्सार महशुल दर, मूल्य अभिवृद्धि कर (VAT) र अन्तःशुल्क हिसाब गर्न पूर्ण परामर्श सेवा प्रदान गर्दछौं।'
    },
    {
      question: 'एकीकृत जाँच चौकी (ICP) विराटनगर के हो र यसले कसरी काम गर्छ?',
      answer: 'एकीकृत जाँच चौकी (ICP) नेपाल-भारत सीमामा अवस्थित आधुनिक भन्सार पूर्वाधार हो। यसले जोगबनी (भारत) र विराटनगर (नेपाल) बीचको मालसामान ढुवानीलाई स्क्यानिङ, यार्ड व्यवस्थापन र एकमुष्ठ जाँचपास डेस्क मार्फत छिटो र व्यवस्थित बनाउँछ।'
    }
  ] : [
    {
      question: 'What documents are required for custom clearance at Biratnagar Dry Port?',
      answer: 'For commercial imports at Biratnagar Dry Port (ICD), the mandatory documentation includes the Commercial Invoice, Packing List, Bill of Lading or Lorry Receipt (L/R), Certificate of Origin (mandatory for SAFTA concessions), Letter of Credit (L/C) or Bank Draft, PAN/VAT registration of the importer, and the Exim Code.'
    },
    {
      question: 'How long does the custom clearance process take at ICD Biratnagar?',
      answer: 'Typically, if all documentation is accurate and compliant, customs clearance can be completed within 24 to 48 hours of cargo arrival. Delays usually happen due to classification disputes, verification of valuation databases, or physical inspections (Red Channel routing).'
    },
    {
      question: 'Can you help with HS Code classification and tariff advisory for Nepal Customs?',
      answer: 'Yes! Accurate Harmonized System (HS Code) classification is vital under Nepal\'s Finance Act. We provide professional tariff advisory services, checking reference values, customs duty percentages, VAT applicability, and excise rates to ensure correct declaration and prevent penalty fees.'
    },
    {
      question: 'What is the Integrated Check Post (ICP) Biratnagar and how is it connected?',
      answer: 'ICP Biratnagar is a unified customs infrastructure on the Nepal-India border. It facilitates cargo movement between Jogbani (India) and Biratnagar (Nepal) with integrated lanes, scanner yards, and clearance desks, boosting trading speeds between India, third countries, and Nepal.'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          fill={i < rating ? 'currentColor' : 'none'} 
          className="star-icon"
        />
      );
    }
    return stars;
  };

  // Select dynamic translations
  const activeHeroTitle = language === 'np' && settings.hero_title_np 
    ? settings.hero_title_np 
    : settings.hero_title;
    
  const activeHeroSubtitle = language === 'np' && settings.hero_subtitle_np 
    ? settings.hero_subtitle_np 
    : settings.hero_subtitle;

  const activeHeroTag = language === 'np' && settings.hero_tag_np
    ? settings.hero_tag_np
    : settings.hero_tag || t('hero_tag');

  const activeServicesTitle = language === 'np' && settings.services_title_np
    ? settings.services_title_np
    : settings.services_title || t('services_title');

  const activeServicesSubtitle = language === 'np' && settings.services_subtitle_np
    ? settings.services_subtitle_np
    : settings.services_subtitle || t('services_subtitle');

  const activeSrvImportTitle = language === 'np' && settings.srv_import_title_np
    ? settings.srv_import_title_np
    : settings.srv_import_title || t('srv_import_title');

  const activeSrvImportDesc = language === 'np' && settings.srv_import_desc_np
    ? settings.srv_import_desc_np
    : settings.srv_import_desc || t('srv_import_desc');

  const activeSrvExportTitle = language === 'np' && settings.srv_export_title_np
    ? settings.srv_export_title_np
    : settings.srv_export_title || t('srv_export_title');

  const activeSrvExportDesc = language === 'np' && settings.srv_export_desc_np
    ? settings.srv_export_desc_np
    : settings.srv_export_desc || t('srv_export_desc');

  const activeSrvTariffTitle = language === 'np' && settings.srv_tariff_title_np
    ? settings.srv_tariff_title_np
    : settings.srv_tariff_title || t('srv_tariff_title');

  const activeSrvTariffDesc = language === 'np' && settings.srv_tariff_desc_np
    ? settings.srv_tariff_desc_np
    : settings.srv_tariff_desc || t('srv_tariff_desc');

  return (
    <div className="home-page animate-fade-in">
      {/* Schema Injection */}
      <SchemaMarkup 
        title={t('nav_home')}
        description={settings.seo_meta_desc}
        keywords={settings.seo_meta_keywords}
        faqData={faqs}
        isLocalBusiness={true}
      />

      {/* Static Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content animate-fade-in-up">
            <h1 className="hero-title">{activeHeroTitle}</h1>
            <p className="hero-subtitle">{activeHeroSubtitle}</p>
            <div className="hero-actions">
              {isFeatureActive('show_contact') && (
                <button className="btn btn-primary" onClick={() => navigate('/contact')}>
                  {t('btn_quote')} <ArrowRight size={16} />
                </button>
              )}
              {isFeatureActive('show_about') && (
                <button className="btn btn-secondary" onClick={() => navigate('/about')}>
                  {t('btn_learn_more')}
                </button>
              )}
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="hero-image-wrapper">
              <img 
                src={settings.hero_image || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800"} 
                alt="Biratnagar Dry Port Custom Clearance Operations" 
                className="hero-image"
              />
              <div className="hero-floating-card">
                <div className="hero-floating-card-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>100% Compliant</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Licensed Customs Broker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">{activeServicesTitle}</h2>
          <p className="section-subtitle">{activeServicesSubtitle}</p>

          <div className="features-grid">
            <div className="feature-card">
              <FileText className="feature-icon" size={36} />
              <h3 className="feature-title">{activeSrvImportTitle}</h3>
              <p className="feature-desc">{activeSrvImportDesc}</p>
            </div>

            <div className="feature-card">
              <Globe className="feature-icon" size={36} />
              <h3 className="feature-title">{activeSrvExportTitle}</h3>
              <p className="feature-desc">{activeSrvExportDesc}</p>
            </div>

            <div className="feature-card">
              <Landmark className="feature-icon" size={36} />
              <h3 className="feature-title">{activeSrvTariffTitle}</h3>
              <p className="feature-desc">{activeSrvTariffDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Countdown Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div 
                key={stat.key} 
                className="stats-card"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="stats-card-icon">{stat.icon}</div>
                <div className="stats-card-number">{counters[stat.key]}+</div>
                <div className="stats-card-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Showcase Section */}
      {isFeatureActive('show_reviews') && reviews.length > 0 && (
        <section className="reviews-section">
          <div className="container">
            <h2 className="section-title">{t('reviews_title')}</h2>
            <p className="section-subtitle">{t('reviews_subtitle')}</p>

            <div className="reviews-grid">
              {reviews.map((rev, index) => (
                <div 
                  key={rev.id} 
                  className="review-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="review-stars">
                    {renderStars(rev.rating)}
                  </div>
                  
                  {rev.media_type !== 'none' && rev.media_url && (
                    <div className="review-media-wrapper">
                      {rev.media_type === 'photo' && (
                        <img 
                          src={rev.media_url} 
                          alt={`${rev.name} review attachment`}
                          className="review-photo-asset"
                        />
                      )}
                      {rev.media_type === 'video' && (
                        <video 
                          src={rev.media_url} 
                          controls
                          className="review-video-asset"
                          preload="metadata"
                          playsInline
                        />
                      )}
                    </div>
                  )}

                  <p className="review-text">
                    <Quote size={14} style={{ opacity: 0.3, verticalAlign: 'top', marginRight: '6px' }} />
                    {rev.review_text}
                  </p>

                  <div className="review-client-meta">
                    {rev.media_type === 'photo' && rev.media_url ? (
                      <img src={rev.media_url} alt={rev.name} className="review-client-photo" />
                    ) : (
                      <div className="review-client-photo" style={{ background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--accent-color)', fontWeight: '800' }}>
                        {rev.name[0]}
                      </div>
                    )}
                    <div className="review-client-info">
                      <span className="review-client-name">{rev.name}</span>
                      {rev.company && <span className="review-client-company">{rev.company}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Accordion FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">{t('faq_title')}</h2>
          <p className="section-subtitle">{t('faq_subtitle')}</p>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)}
                  aria-expanded={activeFaq === index}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className="faq-icon" size={20} />
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
