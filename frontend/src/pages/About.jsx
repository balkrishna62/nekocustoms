import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { Shield, Clock, Award } from 'lucide-react';

const About = () => {
  const { settings, isFeatureActive } = useSettings();
  const { language, t } = useTranslation();

  if (!isFeatureActive('show_about')) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>This section has been temporarily disabled by the administrator.</h2>
      </div>
    );
  }

  // Load translations or fallback keys
  const activeStory = language === 'np' && settings.about_story_np 
    ? settings.about_story_np 
    : settings.about_story;

  const activeMission = language === 'np' && settings.about_mission_np 
    ? settings.about_mission_np 
    : settings.about_mission;

  const activeVision = language === 'np' && settings.about_vision_np 
    ? settings.about_vision_np 
    : settings.about_vision;

  return (
    <div className="about-page container animate-fade-in">
      <SchemaMarkup 
        title={t('nav_about')}
        description="Learn about Neko Customs Brokerage services and custom clearance procedures at Biratnagar Dry Port (ICD Biratnagar)."
      />

      {/* About Company Intro Section */}
      <section className="about-intro-grid" style={{ paddingTop: '40px' }}>
        <div className="about-info-panel animate-fade-in-up">
          <span className="about-port-badge">{t('about_badge')}</span>
          <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{t('about_title')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{activeStory}</p>
          
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-number">12+</div>
              <div className="stat-label">{t('stat_exp')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">{t('stat_cleared')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">{t('stat_rate')}</div>
            </div>
          </div>
        </div>

        <div className="about-image-panel animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <img 
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" 
            alt="Custom Clearance and Trade Consulting"
            style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', display: 'block', height: '360px', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Port Procedures Step Section */}
      <section className="port-procedure-section">
        <div className="container">
          <h2 className="section-title">{t('proc_title')}</h2>
          <p className="section-subtitle">{t('proc_subtitle')}</p>

          <div className="procedure-steps">
            <div className="step-card">
              <span className="step-number">01</span>
              <h3 className="step-title">{t('step1_title')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('step1_desc')}
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <h3 className="step-title">{t('step2_title')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('step2_desc')}
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <h3 className="step-title">{t('step3_title')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('step3_desc')}
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>
              <h3 className="step-title">{t('step4_title')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('step4_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mv-grid animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="mv-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-color)' }}>
            <Shield size={32} />
            <h3 style={{ fontSize: '1.5rem' }}>{t('mission_title')}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{activeMission}</p>
        </div>

        <div className="mv-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-gold)' }}>
            <Award size={32} />
            <h3 style={{ fontSize: '1.5rem' }}>{t('vision_title')}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{activeVision}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
