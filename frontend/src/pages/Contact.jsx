import React, { useState } from 'react';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

const Contact = () => {
  const { settings, isFeatureActive } = useSettings();
  const { language, t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  if (!isFeatureActive('show_contact')) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>This section has been temporarily disabled by the administrator.</h2>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ submitting: false, success: true, error: null });
        
        // Prepare formatted WhatsApp message
        const waMsg = `Hello! I have submitted an inquiry on the website:\n\n` +
          `*Name:* ${formData.name}\n` +
          `*Email:* ${formData.email}\n` +
          `*Phone:* ${formData.phone || 'N/A'}\n` +
          `*Subject:* ${formData.subject}\n` +
          `*Message:* ${formData.message}`;
          
        const encodedMsg = encodeURIComponent(waMsg);
        const waUrl = `https://wa.me/${settings.site_whatsapp || '9779849898185'}?text=${encodedMsg}`;
        
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        
        // Redirect to WhatsApp chat
        window.open(waUrl, '_blank');
      } else {
        setStatus({ submitting: false, success: false, error: data.message || t('error_msg') });
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatus({ submitting: false, success: false, error: 'Network failure. Please try again later.' });
    }
  };

  const activeAddress = language === 'np' && settings.site_address_np 
    ? settings.site_address_np 
    : settings.site_address;

  return (
    <div className="contact-page container animate-fade-in">
      <SchemaMarkup 
        title={t('nav_contact')}
        description={t('contact_subtitle')}
      />

      <h2 className="section-title">{t('contact_title')}</h2>
      <p className="section-subtitle">{t('contact_subtitle')}</p>

      <div className="contact-grid">
        {/* Contact Info Cards */}
        <div className="contact-info-cards animate-fade-in-up">
          <div className="contact-info-card">
            <div className="contact-info-icon-wrapper">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="contact-info-title">{t('card_address')}</h3>
              <p className="contact-info-desc">{activeAddress}</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon-wrapper">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="contact-info-title">{t('card_phone')}</h3>
              <p className="contact-info-desc">{settings.site_phone}</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon-wrapper">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="contact-info-title">{t('card_email')}</h3>
              <p className="contact-info-desc">{settings.site_email}</p>
            </div>
          </div>

          {settings.site_whatsapp && (
            <a 
              href={`https://wa.me/${settings.site_whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-card"
              style={{ display: 'flex', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <div className="contact-info-icon-wrapper" style={{ background: '#25D366', color: 'white' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="contact-info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Chat on WhatsApp
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#25D366', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}>Live</span>
                </h3>
                <p className="contact-info-desc">Message our brokerage desk directly on WhatsApp.</p>
              </div>
            </a>
          )}
        </div>

        {/* Contact Form Card */}
        <div className="contact-form-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {status.success && (
            <div className="alert-box success">
              <CheckCircle2 size={18} />
              <span>{t('success_msg')}</span>
            </div>
          )}

          {status.error && (
            <div className="alert-box danger">
              <AlertCircle size={18} />
              <span>{status.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label" htmlFor="name">{t('form_name')}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="form-input" 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">{t('form_email')}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">{t('form_phone')}</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">{t('form_subject')}</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  required 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">{t('form_message')}</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                required 
                className="form-input form-textarea"
              />
            </div>

            <button 
              type="submit" 
              disabled={status.submitting} 
              className="btn btn-primary"
              style={{ width: '100%', gap: '10px' }}
            >
              <Send size={16} /> 
              {status.submitting ? t('btn_sending') : t('btn_submit')}
            </button>
          </form>
        </div>
      </div>

      {/* Map Embed Container */}
      {settings.site_map_embed && (
        <section className="map-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <iframe 
            src={settings.site_map_embed}
            className="map-iframe"
            title="Biratnagar Dry Port Google Map Location"
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
      )}
    </div>
  );
};

export default Contact;
