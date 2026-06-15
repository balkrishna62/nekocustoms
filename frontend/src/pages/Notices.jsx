import React, { useState, useEffect } from 'react';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { Calendar, Bell, AlertTriangle } from 'lucide-react';

const Notices = () => {
  const { isFeatureActive } = useSettings();
  const { language, t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFeatureActive('show_notice')) {
      return;
    }

    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/notices?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setNotices(data);
        }
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [language, isFeatureActive]);

  if (!isFeatureActive('show_notice')) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>This section has been temporarily disabled by the administrator.</h2>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="notice-page container animate-fade-in">
      <SchemaMarkup 
        title={t('nav_notices')}
        description={t('notices_subtitle')}
      />

      <h2 className="section-title">{t('notices_title')}</h2>
      <p className="section-subtitle">{t('notices_subtitle')}</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p>{t('no_notices')}</p>
        </div>
      ) : (
        <div className="notice-list">
          {notices.map((notice, index) => (
            <div 
              key={notice.id} 
              className={`notice-card ${notice.type} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="notice-meta">
                <span className="notice-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {notice.type === 'alert' ? <AlertTriangle size={14} /> : <Bell size={14} />}
                  {notice.type === 'popup' ? 'landing popup' : notice.type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {formatDate(notice.created_at)}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{notice.title}</h3>
              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{notice.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices;
