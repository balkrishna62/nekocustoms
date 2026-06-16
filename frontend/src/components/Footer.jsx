import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from './SocialIcons';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';

const Footer = () => {
  const { settings, isFeatureActive } = useSettings();
  const { language, t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand & Logo */}
          <div className="footer-column animate-fade-in-up">
            <h4 className="footer-column-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="logo-icon" style={{ width: '28px', height: '28px', fontSize: '1rem' }}>NC</span>
              {language === 'np' ? settings.site_name_np || 'नेको भन्सार' : settings.site_name}
            </h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {t('footer_desc')}
            </p>
            <div className="social-links" style={{ display: 'flex', gap: '12px' }}>
              {settings.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>
                  <FacebookIcon size={20} />
                </a>
              )}
              {settings.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>
                  <TwitterIcon size={20} />
                </a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>
                  <InstagramIcon size={20} />
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>
                  <LinkedinIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="footer-column-title">{t('footer_links')}</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">{t('nav_home')}</Link></li>
              {isFeatureActive('show_about') && <li><Link to="/about" className="footer-link">{t('nav_about')}</Link></li>}
              <li><Link to="/services" className="footer-link">{t('nav_services')}</Link></li>
              {isFeatureActive('show_notice') && <li><Link to="/notices" className="footer-link">{t('nav_notices')}</Link></li>}
              {isFeatureActive('show_gallery') && <li><Link to="/gallery" className="footer-link">{t('nav_gallery')}</Link></li>}
              {isFeatureActive('show_blog') && <li><Link to="/blog" className="footer-link">{t('nav_blog')}</Link></li>}
              {isFeatureActive('show_contact') && <li><Link to="/contact" className="footer-link">{t('nav_contact')}</Link></li>}
            </ul>
          </div>

          {/* Column 3: Ports and Operations */}
          <div className="footer-column animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="footer-column-title">{t('footer_ops')}</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> {t('footer_ops_hours')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExternalLink size={16} /> 
                <a href="https://customs.gov.np" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  {t('footer_ops_gov1')}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExternalLink size={16} />
                <a href="https://nepalport.gov.np" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  {t('footer_ops_gov2')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Local Contact Info */}
          <div className="footer-column animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h4 className="footer-column-title">{t('footer_local')}</h4>
            <div className="footer-contact-item">
              <MapPin className="footer-contact-icon" size={18} />
              <span>
                {language === 'np' && settings.site_address_np 
                  ? settings.site_address_np 
                  : settings.site_address}
              </span>
            </div>
            <div className="footer-contact-item">
              <Phone className="footer-contact-icon" size={18} />
              <span>{settings.site_phone}</span>
            </div>
            <div className="footer-contact-item">
              <Mail className="footer-contact-icon" size={18} />
              <span>{settings.site_email}</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {language === 'np' ? settings.site_name_np || 'नेको भन्सार' : settings.site_name}. {t('footer_copy')}</p>
          <div className="footer-bottom-links">
            <a href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              {t('footer_portal')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
