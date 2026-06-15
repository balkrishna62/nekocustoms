import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { 
  FileCheck, MessageCircle, ClipboardList, CreditCard, 
  ShieldCheck, Scale, Truck, ArrowRight, Globe, Briefcase 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const { language, t } = useTranslation();
  const navigate = useNavigate();

  const services = language === 'np' ? [
    {
      icon: <FileCheck size={36} />,
      title: 'भन्सार जाँचपास तथा ढुवानी',
      desc: 'हामी भन्सार जाँचपासका सबै पक्षहरू सम्हाल्दछौं — आयात र निर्यात मालसामानको समयमा नै प्रशोधन सुनिश्चित गर्दै सबै कानुनी आवश्यकताहरू पूरा गर्दछौं।'
    },
    {
      icon: <MessageCircle size={36} />,
      title: 'भन्सार सम्बन्धी परामर्श',
      desc: 'भन्सार नियम, नीतिगत विषय र कानुनी अनुपालनमा विज्ञ सल्लाह प्राप्त गर्नुहोस् — ढिलाइ रोक्न र सहज व्यापार अनुभव सुनिश्चित गर्न।'
    },
    {
      icon: <ClipboardList size={36} />,
      title: 'ढुवानी निर्देशिका र कागजात तयारी',
      desc: 'हामी आवश्यक व्यापार कागजातहरूको तयारी र प्रमाणीकरणमा सहयोग गर्दछौं — त्रुटि घटाउँदै भन्सार प्रक्रियालाई छिटो बनाउँदछौं।'
    },
    {
      icon: <CreditCard size={36} />,
      title: 'एक्जिम कोड दर्ता तथा नवीकरण',
      desc: 'एक्जिम (Export-Import) कोड चाहिन्छ? हामी सहज दर्ता, नवीकरण र कानुनी मार्गदर्शन सहित तपाईंको आयात-निर्यात अनुमतिपत्र व्यवस्थापनमा सहयोग गर्दछौं।'
    },
    {
      icon: <ShieldCheck size={36} />,
      title: 'भन्सार अनुपालन तथा लेखापरीक्षण',
      desc: 'हामी नियमित अनुपालन समीक्षा र लेखापरीक्षण गरी तपाईंको व्यवसायलाई भन्सार कानुनहरूसँग मिल्दो राख्दछौं — जरिवाना र समस्याबाट बचाउँछौं।'
    },
    {
      icon: <Scale size={36} />,
      title: 'एचएस कोड वर्गीकरण र भन्सार महशुल दर गणना',
      desc: 'सही एचएस कोड वर्गीकरण र भन्सार दर गणनाले सही कर भुक्तानी सुनिश्चित गर्दछ — अतिरिक्त खर्च र कानुनी जटिलताबाट बचाउँदछ।'
    },
    {
      icon: <Truck size={36} />,
      title: 'कार्गो ढुवानी र ट्र्याकिङ',
      desc: 'सीमान्त प्रवेश बिन्दुदेखि गन्तव्यसम्म — हामी कार्गो ढुवानीको प्रत्येक चरणमा सहयोग गर्दछौं र वास्तविक समयमा अपडेट प्रदान गर्दछौं।'
    },
    {
      icon: <Globe size={36} />,
      title: 'सीटीडी (भन्सार पारवहन प्रज्ञापनपत्र)',
      desc: 'हामी सीटीडी (CTD) प्रक्रियाहरूमा सहजीकरण गर्दछौं, उचित कागजात र कानुनी अनुपालनको साथ सीमापार मालसामानको सहज आवतजावत सुनिश्चित गर्दै।'
    },
    {
      icon: <Briefcase size={36} />,
      title: 'अन्य भन्सार सम्बन्धित कार्यहरू',
      desc: 'भन्सार महशुल मूल्याङ्कनदेखि कर गणना र विशेष अनुमतिहरूसम्म, हामी तपाईंको व्यापार कार्यहरूलाई सहज बनाउन अन्य विभिन्न भन्सार-सम्बन्धित कार्यहरू सम्हाल्दछौं।'
    }
  ] : [
    {
      icon: <FileCheck size={36} />,
      title: 'Customs Clearing & Forwarding',
      desc: 'We handle all aspects of customs clearance, ensuring smooth and timely processing of import and export shipments while complying with all legal requirements.'
    },
    {
      icon: <MessageCircle size={36} />,
      title: 'Customs Related Consultancy',
      desc: 'Get expert advice on customs regulations, policies, and compliance to avoid delays and ensure a seamless trade experience.'
    },
    {
      icon: <ClipboardList size={36} />,
      title: 'Logistics Guidance & Documentation',
      desc: 'We assist in the preparation and verification of essential trade documents, minimizing errors and expediting the customs process.'
    },
    {
      icon: <CreditCard size={36} />,
      title: 'EXIM Code Registration & Renewal',
      desc: 'Need an EXIM (Export-Import) Code? We help with hassle-free registration, renewal, and compliance guidance for your import-export license.'
    },
    {
      icon: <ShieldCheck size={36} />,
      title: 'Customs Compliance & Auditing',
      desc: 'We conduct regular compliance reviews and audits to ensure your business stays aligned with customs regulations, avoiding penalties and disruptions.'
    },
    {
      icon: <Scale size={36} />,
      title: 'HS Code Classification & Tariff Calculation',
      desc: 'Accurate HS Code classification and tariff rate calculation ensures you pay the right duties — avoiding overpayments and legal complications.'
    },
    {
      icon: <Truck size={36} />,
      title: 'Cargo Handling & Tracking',
      desc: 'From port entry to final destination — we assist in every stage of cargo handling and provide real-time tracking updates for complete transparency.'
    },
    {
      icon: <Globe size={36} />,
      title: 'CTD (Customs Transit Declaration)',
      desc: 'We facilitate CTD procedures, ensuring the smooth movement of goods across borders with proper documentation and legal compliance.'
    },
    {
      icon: <Briefcase size={36} />,
      title: 'Other Customs Related Works',
      desc: 'From duty assessments to tax calculations and special permits, we handle various other customs-related tasks to streamline your trade operations.'
    }
  ];

  return (
    <div className="services-page animate-fade-in">
      <SchemaMarkup 
        title={t('nav_services')}
        description={t('services_page_subtitle')}
      />

      {/* Hero Banner */}
      <section className="services-hero">
        <div className="container">
          <span className="hero-tag">{t('services_hero_tag')}</span>
          <h1 className="services-hero-title">{t('services_hero_title')}</h1>
          <p className="services-hero-subtitle">{t('services_page_subtitle')}</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="container">
          <div className="services-card-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="service-card-icon">
                  {service.icon}
                </div>
                <div className="service-card-number">{String(index + 1).padStart(2, '0')}</div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">{t('services_cta_title')}</h2>
          <p className="section-subtitle">{t('services_cta_subtitle')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/contact')}>
            {t('btn_quote')} <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
