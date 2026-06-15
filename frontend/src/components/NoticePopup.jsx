import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';

const NoticePopup = () => {
  const { isFeatureActive } = useSettings();
  const { language } = useTranslation();
  const [popupData, setPopupData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [snooze24h, setSnooze24h] = useState(false);

  useEffect(() => {
    if (!isFeatureActive('show_popup_notice')) {
      return;
    }

    const snoozeTime = localStorage.getItem(`popup_notice_snooze_${language}`);
    if (snoozeTime) {
      const hoursSinceSnooze = (Date.now() - parseInt(snoozeTime, 10)) / (1000 * 60 * 60);
      if (hoursSinceSnooze < 24) {
        setIsVisible(false);
        return; // Snoozed
      }
    }

    const fetchPopup = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notices/popup?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPopupData(data);
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      } catch (err) {
        console.error('Error fetching popup notice:', err);
      }
    };

    fetchPopup();
  }, [language, isFeatureActive]);

  const handleClose = () => {
    if (snooze24h) {
      localStorage.setItem(`popup_notice_snooze_${language}`, Date.now().toString());
    }
    setIsVisible(false);
  };

  if (!isVisible || !popupData) {
    return null;
  }

  const headerText = language === 'np' ? 'महत्वपूर्ण सूचना' : 'Important Notice';
  const snoozeText = language === 'np' ? '२४ घण्टाका लागि फेरि नदेखाउनुहोस्' : 'Do not show again for 24h';
  const dismissText = language === 'np' ? 'बन्द गर्नुहोस्' : 'Dismiss';

  return (
    <div className="popup-overlay animate-fade-in" onClick={handleClose}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-header-title">
            <AlertTriangle size={20} />
            <h3>{headerText}</h3>
          </div>
          <button className="popup-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <div className="popup-body">
          <h4 className="popup-title">{popupData.title}</h4>
          <p className="popup-desc">{popupData.content}</p>
        </div>
        <div className="popup-footer">
          <label className="popup-checkbox-label">
            <input 
              type="checkbox" 
              checked={snooze24h} 
              onChange={(e) => setSnooze24h(e.target.checked)} 
            />
            {snoozeText}
          </label>
          <button className="btn btn-primary" onClick={handleClose}>
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;
