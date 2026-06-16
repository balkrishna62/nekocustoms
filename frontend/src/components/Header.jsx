import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';

const Header = () => {
  const { settings, theme, toggleTheme, isFeatureActive } = useSettings();
  const { language, toggleLanguage, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-icon">NC</div>
          <span>{language === 'np' ? settings.site_name_np || 'नेको भन्सार' : settings.site_name}</span>
        </Link>

        {/* Navigation Menu */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {t('nav_home')}
          </NavLink>

          {isFeatureActive('show_about') && (
            <NavLink 
              to="/about" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {t('nav_about')}
            </NavLink>
          )}

          <NavLink 
            to="/services" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {t('nav_services')}
          </NavLink>

          {isFeatureActive('show_notice') && (
            <NavLink 
              to="/notices" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {t('nav_notices')}
            </NavLink>
          )}

          {isFeatureActive('show_gallery') && (
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {t('nav_gallery')}
            </NavLink>
          )}

          {isFeatureActive('show_blog') && (
            <NavLink 
              to="/blog" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {t('nav_blog')}
            </NavLink>
          )}

          {isFeatureActive('show_contact') && (
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {t('nav_contact')}
            </NavLink>
          )}
        </nav>

        {/* Action Group (Language switcher, Theme switcher, Mobile triggers) */}
        <div className="actions-group">
          {/* Language Switch Button */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleLanguage}
            style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'inherit' }}
            aria-label="Toggle Language EN/नेपाल"
          >
            {language === 'en' ? 'ने' : 'EN'}
          </button>

          {/* Theme Switch Button */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isFeatureActive('show_contact') && (
            <button 
              className="btn btn-primary" 
              onClick={() => { closeMobileMenu(); navigate('/contact'); }}
              style={{ display: mobileMenuOpen ? 'none' : 'inline-flex' }}
            >
              {t('btn_quote')}
            </button>
          )}

          <button 
            className="mobile-menu-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
