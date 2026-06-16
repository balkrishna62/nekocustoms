import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Bell, BookOpen, Mail, Key, Plus, Edit2, Trash2, 
  Save, X, Check, AlertTriangle, Calendar, Image, Star, Upload
} from 'lucide-react';
import { API_BASE_URL, useSettings } from '../../context/SettingsContext';

export default function SiteAdministration() {
  const { settings, fetchSettings } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [token] = useState(() => localStorage.getItem('token'));

  // Alert State
  const [alert, setAlert] = useState({ type: null, message: null });

  // Upload progress indicator
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // 1. Settings Form State
  const [settingsForm, setSettingsForm] = useState({});

  // 2. Notices Management State
  const [notices, setNotices] = useState([]);
  const [noticeModal, setNoticeModal] = useState({ open: false, data: null });

  // 3. Blogs Management State
  const [blogs, setBlogs] = useState([]);
  const [blogModal, setBlogModal] = useState({ open: false, data: null });

  // 4. Messages/Inbox State
  const [messages, setMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);

  // 5. Password Change State
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // 6. Gallery Management State
  const [gallery, setGallery] = useState([]);
  const [galleryModal, setGalleryModal] = useState({ open: false, data: null });

  // 7. Reviews Management State
  const [reviews, setReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, data: null });

  // 8. Notification/Inbox State
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper headers for auth
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: null, message: null }), 5000);
  };

  const pollUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      }
    } catch (err) {
      // Silent fail on poll
    }
  }, [token]);

  // Poll for messages on mount
  useEffect(() => {
    if (!token) return;
    pollUnreadCount();
    const interval = setInterval(pollUnreadCount, 20000);
    return () => clearInterval(interval);
  }, [token, pollUnreadCount]);

  // Fetch initial content when tab changes
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setSettingsForm(settings);

    if (activeTab === 'notices') fetchNotices();
    if (activeTab === 'blogs') fetchBlogs();
    if (activeTab === 'inbox') fetchMessages();
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab, settings, token, navigate]);

  // ==========================================
  // STATIC ASSETS UPLOAD UTILITY
  // ==========================================
  const handleFileUpload = async (e, onUrlCaptured) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading file to server...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        onUrlCaptured(data.url);
        triggerAlert('success', `File '${file.name}' uploaded successfully.`);
      } else {
        triggerAlert('danger', data.message || 'File upload failed.');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Network error occurred during file upload.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // ==========================================
  // CONFIGURATION / SITE SETTINGS HANDLERS
  // ==========================================
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        await fetchSettings();
        triggerAlert('success', 'Site settings and feature toggles updated successfully!');
      } else {
        const errData = await res.json();
        triggerAlert('danger', errData.message || 'Failed to update settings.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error. Settings update failed.');
    }
  };

  // ==========================================
  // NOTICES HANDLERS
  // ==========================================
  const fetchNotices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notices`, { headers: getAuthHeaders() });
      if (res.ok) setNotices(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNoticeModal = (notice = null) => {
    setNoticeModal({
      open: true,
      data: notice ? {
        ...notice,
        expires_at: notice.expires_at ? notice.expires_at.split('T')[0] : ''
      } : {
        title: '',
        content: '',
        type: 'regular',
        is_active: 1,
        expires_at: '',
        language: 'en'
      }
    });
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    const { data } = noticeModal;
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE_URL}/notices/${data.id}` : `${API_BASE_URL}/notices`;
    
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setNoticeModal({ open: false, data: null });
        fetchNotices();
        triggerAlert('success', `Notice ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await res.json();
        triggerAlert('danger', err.message || 'Failed to save notice.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error saving notice.');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchNotices();
        triggerAlert('success', 'Notice deleted successfully.');
      }
    } catch (err) {
      triggerAlert('danger', 'Failed to delete notice.');
    }
  };

  // ==========================================
  // BLOGS HANDLERS
  // ==========================================
  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs?all=true`);
      if (res.ok) setBlogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBlogModal = (blog = null) => {
    setBlogModal({
      open: true,
      data: blog ? { ...blog } : {
        title: '',
        excerpt: '',
        content: '',
        category: 'Custom Clearance',
        cover_image: '',
        status: 'published',
        language: 'en'
      }
    });
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    const { data } = blogModal;
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE_URL}/blogs/${data.id}` : `${API_BASE_URL}/blogs`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setBlogModal({ open: false, data: null });
        fetchBlogs();
        triggerAlert('success', `Blog post ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await res.json();
        triggerAlert('danger', err.message || 'Failed to save blog post.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error saving blog post.');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchBlogs();
        triggerAlert('success', 'Blog post deleted successfully.');
      }
    } catch (err) {
      triggerAlert('danger', 'Failed to delete blog.');
    }
  };

  // ==========================================
  // INBOX / MESSAGES HANDLERS
  // ==========================================
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages`, { headers: getAuthHeaders() });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadMessage = async (msg) => {
    setActiveMessage(msg);
    if (msg.status === 'unread') {
      try {
        await fetch(`${API_BASE_URL}/admin/messages/${msg.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: 'read' })
        });
        fetchMessages();
        pollUnreadCount();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this inquiry from database?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setActiveMessage(null);
        fetchMessages();
        pollUnreadCount();
        triggerAlert('success', 'Message deleted successfully.');
      }
    } catch (err) {
      triggerAlert('danger', 'Failed to delete message.');
    }
  };

  // ==========================================
  // GALLERY HANDLERS
  // ==========================================
  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery`);
      if (res.ok) setGallery(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGalleryModal = (item = null) => {
    setGalleryModal({
      open: true,
      data: item ? { ...item } : {
        title: '',
        description: '',
        image_url: ''
      }
    });
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    const { data } = galleryModal;
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE_URL}/gallery/${data.id}` : `${API_BASE_URL}/gallery`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setGalleryModal({ open: false, data: null });
        fetchGallery();
        triggerAlert('success', `Gallery item ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await res.json();
        triggerAlert('danger', err.message || 'Failed to save item.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error saving gallery item.');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery photo item?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchGallery();
        triggerAlert('success', 'Gallery item deleted successfully.');
      }
    } catch (err) {
      triggerAlert('danger', 'Failed to delete gallery item.');
    }
  };

  // ==========================================
  // REVIEWS HANDLERS
  // ==========================================
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`);
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReviewModal = (rev = null) => {
    setReviewModal({
      open: true,
      data: rev ? { ...rev } : {
        name: '',
        company: '',
        rating: 5,
        review_text: '',
        media_type: 'none',
        media_url: '',
        language: 'en'
      }
    });
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    const { data } = reviewModal;
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE_URL}/reviews/${data.id}` : `${API_BASE_URL}/reviews`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setReviewModal({ open: false, data: null });
        fetchReviews();
        triggerAlert('success', `Client review ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await res.json();
        triggerAlert('danger', err.message || 'Failed to save review.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error saving client review.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this client review?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchReviews();
        triggerAlert('success', 'Review deleted successfully.');
      }
    } catch (err) {
      triggerAlert('danger', 'Failed to delete review.');
    }
  };

  // ==========================================
  // PASSWORD CHANGE HANDLER
  // ==========================================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      triggerAlert('danger', 'New passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        triggerAlert('success', 'Security password changed successfully!');
      } else {
        triggerAlert('danger', data.message || 'Password update failed.');
      }
    } catch (err) {
      triggerAlert('danger', 'Network error. Password update failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Title Header */}
      <div className="portal-section-header">
        <div>
          <h2 className="portal-section-title">Site Manager</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--portal-text-muted)', fontSize: '13px' }}>
            Configure visibility toggles, address records, notice boards, client reviews, published articles, and inbox inquiries.
          </p>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {alert.message && (
        <div 
          className={`portal-alert-error`} 
          style={{ 
            backgroundColor: alert.type === 'success' ? 'var(--portal-success-light)' : 'var(--portal-danger-light)',
            color: alert.type === 'success' ? 'var(--portal-success)' : 'var(--portal-danger)',
            borderColor: alert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderStyle: 'solid', borderWidth: '1px'
          }}
        >
          {alert.message}
        </div>
      )}

      {/* File Upload Global Loader */}
      {uploading && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 2010,
          background: 'var(--portal-card-bg)', border: '1px solid var(--portal-border-dark)',
          padding: '12px 20px', borderRadius: '8px', boxShadow: 'var(--portal-shadow-lg)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--portal-text-primary)'
        }}>
          <Upload size={16} style={{ animation: 'bounce 1s infinite' }} />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Tab Navigation links */}
      <div className="portal-tabs-container">
        <button 
          className={`portal-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={15} /> General & Toggles
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Image size={15} /> Gallery Grid
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Star size={15} /> Customer Reviews
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          <Bell size={15} /> Notice Board
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          <BookOpen size={15} /> Blog Manager
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
          style={{ position: 'relative' }}
        >
          <Mail size={15} /> Inbox Inquiries
          {unreadCount > 0 && (
            <span className="portal-tab-count" style={{ marginLeft: '6px', backgroundColor: 'var(--portal-danger)', color: 'white' }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          className={`portal-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={15} /> Security Password
        </button>
      </div>

      {/* Content Panels */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        {/* TAB 1: SITE SETTINGS & FEATURE TOGGLES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSettingsSubmit} className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--portal-border)', paddingBottom: '16px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '16px' }}>Public Website Controls</h3>
              <button type="submit" className="portal-btn portal-btn-primary">
                <Save size={16} /> Save Configurations
              </button>
            </div>

            {/* Visibility switches */}
            <h4 style={{ margin: '10px 0 0', color: 'var(--portal-primary)', fontSize: '14px', fontWeight: '600' }}>Section Visibility Controls</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries({
                show_notice: 'Notice Module (Notice board announcements)',
                show_popup_notice: 'Landing Pop-up Notice (Alert dialog box)',
                show_gallery: 'Gallery Operations Section',
                show_reviews: 'Reviews Showcase Module',
                show_blog: 'Blog Module & News updates',
                show_about: 'About Us Bio Section',
                show_contact: 'Quote Inquiries & Call Desk Form'
              }).map(([key, label]) => (
                <div key={key} className="portal-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--portal-text-primary)', fontSize: '13.5px', fontWeight: '600' }}>{label}</div>
                  </div>
                  <input 
                    type="checkbox" 
                    name={key}
                    checked={settingsForm[key] === 'true'} 
                    onChange={handleSettingsChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>

            {/* General Site details */}
            <h4 style={{ margin: '20px 0 0', color: 'var(--portal-primary)', fontSize: '14px', fontWeight: '600' }}>Identity & Contact Coordinates</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="portal-form-group">
                <label className="portal-label">Site Name (EN)</label>
                <input type="text" name="site_name" value={settingsForm.site_name || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Site Name (NP)</label>
                <input type="text" name="site_name_np" value={settingsForm.site_name_np || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Call Desk Numbers</label>
                <input type="text" name="site_phone" value={settingsForm.site_phone || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Primary Email</label>
                <input type="email" name="site_email" value={settingsForm.site_email || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">WhatsApp Contact Number (No spaces)</label>
                <input type="text" name="site_whatsapp" value={settingsForm.site_whatsapp || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Google Maps Embed Source URL</label>
                <input type="text" name="site_map_embed" value={settingsForm.site_map_embed || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
            </div>

            <div className="portal-form-group">
              <label className="portal-label">HQ Office Address Description (EN)</label>
              <input type="text" name="site_address" value={settingsForm.site_address || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">HQ Office Address Description (NP)</label>
              <input type="text" name="site_address_np" value={settingsForm.site_address_np || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>

            {/* Hero banner settings */}
            <h4 style={{ margin: '20px 0 0', color: 'var(--portal-primary)', fontSize: '14px', fontWeight: '600' }}>Hero Billboard Segment</h4>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Tagline (EN)</label>
              <input type="text" name="hero_tag" value={settingsForm.hero_tag || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Tagline (NP)</label>
              <input type="text" name="hero_tag_np" value={settingsForm.hero_tag_np || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Main Title (EN)</label>
              <input type="text" name="hero_title" value={settingsForm.hero_title || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Main Title (NP)</label>
              <input type="text" name="hero_title_np" value={settingsForm.hero_title_np || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Subtitle (EN)</label>
              <textarea name="hero_subtitle" rows="2" value={settingsForm.hero_subtitle || ''} onChange={handleSettingsChange} className="portal-input"></textarea>
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Billboard Subtitle (NP)</label>
              <textarea name="hero_subtitle_np" rows="2" value={settingsForm.hero_subtitle_np || ''} onChange={handleSettingsChange} className="portal-input"></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
              <div className="portal-form-group">
                <label className="portal-label">Billboard Image Cover Asset URL</label>
                <input type="text" name="hero_image" value={settingsForm.hero_image || ''} onChange={e => handleSettingsChange(e)} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-btn portal-btn-secondary" style={{ width: '100%', padding: '11px', gap: '8px' }}>
                  <Upload size={16} /> Upload Hero Photo
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, (url) => setSettingsForm(prev => ({ ...prev, hero_image: url })))} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Social settings */}
            <h4 style={{ margin: '20px 0 0', color: 'var(--portal-primary)', fontSize: '14px', fontWeight: '600' }}>Social Network Coordinates</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="portal-form-group">
                <label className="portal-label">Facebook Profile URL</label>
                <input type="text" name="social_facebook" value={settingsForm.social_facebook || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Twitter/X Profile URL</label>
                <input type="text" name="social_twitter" value={settingsForm.social_twitter || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Instagram Channel URL</label>
                <input type="text" name="social_instagram" value={settingsForm.social_instagram || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">LinkedIn Organization URL</label>
                <input type="text" name="social_linkedin" value={settingsForm.social_linkedin || ''} onChange={handleSettingsChange} className="portal-input" />
              </div>
            </div>

            {/* SEO configurations */}
            <h4 style={{ margin: '20px 0 0', color: 'var(--portal-primary)', fontSize: '14px', fontWeight: '600' }}>Search Engine Optimization (SEO Meta)</h4>
            <div className="portal-form-group">
              <label className="portal-label">SEO Browser Meta Title</label>
              <input type="text" name="seo_meta_title" value={settingsForm.seo_meta_title || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">SEO Meta Description Summary</label>
              <textarea name="seo_meta_desc" rows="2" value={settingsForm.seo_meta_desc || ''} onChange={handleSettingsChange} className="portal-input"></textarea>
            </div>
            <div className="portal-form-group">
              <label className="portal-label">SEO Index Keywords (separated by commas)</label>
              <input type="text" name="seo_meta_keywords" value={settingsForm.seo_meta_keywords || ''} onChange={handleSettingsChange} className="portal-input" />
            </div>

            <button type="submit" className="portal-btn portal-btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
              <Save size={16} /> Save Configurations
            </button>
          </form>
        )}

        {/* TAB 2: GALLERY GRID */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px' }}>Checkpoints Operations Gallery</h3>
              <button onClick={() => handleOpenGalleryModal()} className="portal-btn portal-btn-primary">
                <Plus size={15} /> Add Gallery Item
              </button>
            </div>

            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gallery.map(item => (
                    <tr key={item.id}>
                      <td style={{ width: '80px' }}>
                        <img src={item.image_url} alt={item.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td style={{ color: 'var(--portal-text-primary)', fontWeight: '600' }}>{item.title}</td>
                      <td>{item.description}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenGalleryModal(item)} className="portal-btn portal-btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteGallery(item.id)} className="portal-btn portal-btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gallery.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--portal-text-muted)', padding: '24px' }}>No gallery items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px' }}>Client Feedback Reviews</h3>
              <button onClick={() => handleOpenReviewModal()} className="portal-btn portal-btn-primary">
                <Plus size={15} /> Add Review Item
              </button>
            </div>

            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Company</th>
                    <th>Rating</th>
                    <th>Excerpt</th>
                    <th>Language</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(rev => (
                    <tr key={rev.id}>
                      <td style={{ color: 'var(--portal-text-primary)', fontWeight: '600' }}>{rev.name}</td>
                      <td>{rev.company}</td>
                      <td style={{ color: 'var(--portal-warning)', fontWeight: '700' }}>{'★'.repeat(rev.rating)}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.review_text}</td>
                      <td>{rev.language === 'np' ? 'नेपाली' : 'English'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenReviewModal(rev)} className="portal-btn portal-btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteReview(rev.id)} className="portal-btn portal-btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--portal-text-muted)', padding: '24px' }}>No reviews found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: NOTICE BOARD */}
        {activeTab === 'notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px' }}>Official Notices announcements</h3>
              <button onClick={() => handleOpenNoticeModal()} className="portal-btn portal-btn-primary">
                <Plus size={15} /> Add New Notice
              </button>
            </div>

            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Notice Title</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Language</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id}>
                      <td style={{ color: 'var(--portal-text-primary)', fontWeight: '600' }}>{notice.title}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px', textTransform: 'capitalize',
                          backgroundColor: notice.type === 'alert' ? 'var(--portal-danger-light)' : notice.type === 'popup' ? 'var(--portal-info-light)' : 'var(--portal-border)',
                          color: notice.type === 'alert' ? 'var(--portal-danger)' : notice.type === 'popup' ? 'var(--portal-info)' : 'var(--portal-text-secondary)',
                        }}>
                          {notice.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: notice.is_active ? 'var(--portal-success)' : 'var(--portal-text-muted)', fontWeight: '600' }}>
                          {notice.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td>{notice.language === 'np' ? 'नेपाली' : 'English'}</td>
                      <td>{notice.expires_at ? new Date(notice.expires_at).toLocaleDateString() : 'Never'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenNoticeModal(notice)} className="portal-btn portal-btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteNotice(notice.id)} className="portal-btn portal-btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--portal-text-muted)', padding: '24px' }}>No notices listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BLOG MANAGER */}
        {activeTab === 'blogs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px' }}>Custom Guidelines & News Articles</h3>
              <button onClick={() => handleOpenBlogModal()} className="portal-btn portal-btn-primary">
                <Plus size={15} /> Write New Article
              </button>
            </div>

            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Article Title</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Published At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog.id}>
                      <td style={{ width: '80px' }}>
                        {blog.cover_image && <img src={blog.cover_image} alt={blog.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                      </td>
                      <td style={{ color: 'var(--portal-text-primary)', fontWeight: '600' }}>{blog.title}</td>
                      <td>{blog.category}</td>
                      <td>{blog.language === 'np' ? 'नेपाली' : 'English'}</td>
                      <td>
                        <span style={{ color: blog.status === 'published' ? 'var(--portal-success)' : 'var(--portal-text-muted)', fontWeight: '600' }}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenBlogModal(blog)} className="portal-btn portal-btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteBlog(blog.id)} className="portal-btn portal-btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--portal-text-muted)', padding: '24px' }}>No blog articles written yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: INBOX INQUIRIES */}
        {activeTab === 'inbox' && (
          <div style={{ display: 'flex', gap: '24px', height: '560px' }}>
            
            {/* Inquiry List */}
            <div className="portal-table-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--portal-border)', background: '#fafbfd' }}>
                <h4 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '13.5px', fontWeight: '700' }}>Inbox Messages</h4>
              </div>
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  onClick={() => handleReadMessage(msg)}
                  style={{
                    padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid var(--portal-border)',
                    backgroundColor: activeMessage?.id === msg.id ? 'var(--portal-primary-light)' : msg.status === 'unread' ? '#ffffff' : 'transparent',
                    borderLeft: msg.status === 'unread' ? '3px solid var(--portal-primary)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--portal-text-primary)', fontSize: '13px', fontWeight: msg.status === 'unread' ? '700' : '500' }}>{msg.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--portal-text-muted)' }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--portal-text-primary)', fontWeight: msg.status === 'unread' ? '600' : '400', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--portal-text-muted)' }}>Inbox is empty. No inquiries.</div>
              )}
            </div>

            {/* Inquiry Detail */}
            <div className="portal-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {activeMessage ? (
                <>
                  <div style={{ borderBottom: '1px solid var(--portal-border)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px', fontWeight: '700' }}>{activeMessage.subject}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--portal-text-secondary)' }}>
                        From: <strong style={{ color: 'var(--portal-text-primary)' }}>{activeMessage.name}</strong> ({activeMessage.email}) | Phone: {activeMessage.phone || 'N/A'}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteMessage(activeMessage.id)} className="portal-btn portal-btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Delete Message
                    </button>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--portal-text-primary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {activeMessage.message}
                  </div>
                  <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '16px', marginTop: 'auto', fontSize: '11px', color: 'var(--portal-text-muted)' }}>
                    Message received at: {new Date(activeMessage.created_at).toLocaleString()}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--portal-text-muted)' }}>
                  Select an inquiry message to view details.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 7: SECURITY PASSWORD */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
            <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '16px', borderBottom: '1px solid var(--portal-border)', paddingBottom: '12px' }}>
              Change Authentication Password
            </h3>
            
            <div className="portal-form-group">
              <label className="portal-label">Current Password</label>
              <input 
                type="password" required className="portal-input"
                value={passForm.currentPassword} 
                onChange={e => setPassForm(prev => ({ ...prev, currentPassword: e.target.value }))} 
              />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">New Password</label>
              <input 
                type="password" required className="portal-input"
                value={passForm.newPassword} 
                onChange={e => setPassForm(prev => ({ ...prev, newPassword: e.target.value }))} 
              />
            </div>
            <div className="portal-form-group">
              <label className="portal-label">Confirm New Password</label>
              <input 
                type="password" required className="portal-input"
                value={passForm.confirmPassword} 
                onChange={e => setPassForm(prev => ({ ...prev, confirmPassword: e.target.value }))} 
              />
            </div>

            <button type="submit" className="portal-btn portal-btn-primary" style={{ padding: '12px', alignSelf: 'flex-start' }}>
              Change Password
            </button>
          </form>
        )}

      </div>

      {/* MODAL 1: NOTICE CREATE/EDIT */}
      {noticeModal.open && noticeModal.data && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{noticeModal.data.id ? 'Edit Notice' : 'Add Notice'}</h2>
              <button onClick={() => setNoticeModal({ open: false, data: null })} className="portal-modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="portal-form-group">
                <label className="portal-label">Notice Title *</label>
                <input type="text" required value={noticeModal.data.title} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Language</label>
                <select value={noticeModal.data.language} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, language: e.target.value } }))} className="portal-input">
                  <option value="en">English</option>
                  <option value="np">नेपाली</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Type</label>
                  <select value={noticeModal.data.type} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, type: e.target.value } }))} className="portal-input">
                    <option value="regular">Regular Board</option>
                    <option value="popup">Landing Pop-up</option>
                    <option value="alert">Red Alert Banner</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Status</label>
                  <select value={noticeModal.data.is_active} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, is_active: parseInt(e.target.value) } }))} className="portal-input">
                    <option value="1">Active</option>
                    <option value="0">Draft/In-Active</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Expires At (Optional)</label>
                  <input type="date" value={noticeModal.data.expires_at} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, expires_at: e.target.value } }))} className="portal-input" />
                </div>
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Content Summary</label>
                <textarea rows="4" required value={noticeModal.data.content} onChange={e => setNoticeModal(prev => ({ ...prev, data: { ...prev.data, content: e.target.value } }))} className="portal-input"></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setNoticeModal({ open: false, data: null })} className="portal-btn portal-btn-secondary">Cancel</button>
                <button type="submit" className="portal-btn portal-btn-primary">Save Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BLOG CREATE/EDIT */}
      {blogModal.open && blogModal.data && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card" style={{ maxWidth: '680px' }}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{blogModal.data.id ? 'Edit Article' : 'Write Article'}</h2>
              <button onClick={() => setBlogModal({ open: false, data: null })} className="portal-modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="portal-form-group">
                <label className="portal-label">Article Title *</label>
                <input type="text" required value={blogModal.data.title} onChange={e => setBlogModal(prev => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return { ...prev, data: { ...prev.data, title, slug: prev.data.id ? prev.data.slug : slug } };
                })} className="portal-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Unique Slug URL</label>
                  <input type="text" required value={blogModal.data.slug} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, slug: e.target.value } }))} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Category</label>
                  <input type="text" value={blogModal.data.category} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, category: e.target.value } }))} className="portal-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Language</label>
                  <select value={blogModal.data.language} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, language: e.target.value } }))} className="portal-input">
                    <option value="en">English</option>
                    <option value="np">नेपाली</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Status</label>
                  <select value={blogModal.data.status} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))} className="portal-input">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Cover Image Asset URL</label>
                  <input type="text" value={blogModal.data.cover_image} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, cover_image: e.target.value } }))} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-btn portal-btn-secondary" style={{ width: '100%', padding: '11px', gap: '8px' }}>
                    <Upload size={16} /> Upload Cover
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, (url) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, cover_image: url } })))} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div className="portal-form-group">
                <label className="portal-label">Excerpt / Brief Summary</label>
                <textarea rows="2" value={blogModal.data.excerpt} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, excerpt: e.target.value } }))} className="portal-input"></textarea>
              </div>

              <div className="portal-form-group">
                <label className="portal-label">Article Markdown Content</label>
                <textarea rows="6" required value={blogModal.data.content} onChange={e => setBlogModal(prev => ({ ...prev, data: { ...prev.data, content: e.target.value } }))} className="portal-input" style={{ fontFamily: 'monospace' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setBlogModal({ open: false, data: null })} className="portal-btn portal-btn-secondary">Cancel</button>
                <button type="submit" className="portal-btn portal-btn-primary">Save Article</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GALLERY CREATE/EDIT */}
      {galleryModal.open && galleryModal.data && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{galleryModal.data.id ? 'Edit Image' : 'Add Image'}</h2>
              <button onClick={() => setGalleryModal({ open: false, data: null })} className="portal-modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveGallery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="portal-form-group">
                <label className="portal-label">Photo Title *</label>
                <input type="text" required value={galleryModal.data.title} onChange={e => setGalleryModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))} className="portal-input" />
              </div>
              <div className="portal-form-group">
                <label className="portal-label">Short Description</label>
                <input type="text" value={galleryModal.data.description} onChange={e => setGalleryModal(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))} className="portal-input" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Image Asset URL</label>
                  <input type="text" required value={galleryModal.data.image_url} onChange={e => setGalleryModal(prev => ({ ...prev, data: { ...prev.data, image_url: e.target.value } }))} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-btn portal-btn-secondary" style={{ width: '100%', padding: '11px', gap: '8px' }}>
                    <Upload size={16} /> Upload Photo
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, (url) => setGalleryModal(prev => ({ ...prev, data: { ...prev.data, image_url: url } })))} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setGalleryModal({ open: false, data: null })} className="portal-btn portal-btn-secondary">Cancel</button>
                <button type="submit" className="portal-btn portal-btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW CREATE/EDIT */}
      {reviewModal.open && reviewModal.data && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{reviewModal.data.id ? 'Edit Review' : 'Add Review'}</h2>
              <button onClick={() => setReviewModal({ open: false, data: null })} className="portal-modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Client Name *</label>
                  <input type="text" required value={reviewModal.data.name} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Company/Affiliation</label>
                  <input type="text" value={reviewModal.data.company} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, company: e.target.value } }))} className="portal-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Rating (1 to 5 Stars)</label>
                  <select value={reviewModal.data.rating} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, rating: parseInt(e.target.value) } }))} className="portal-input">
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Language</label>
                  <select value={reviewModal.data.language} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, language: e.target.value } }))} className="portal-input">
                    <option value="en">English</option>
                    <option value="np">नेपाली</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Media Attachment</label>
                  <select value={reviewModal.data.media_type} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, media_type: e.target.value } }))} className="portal-input">
                    <option value="none">No Attachment</option>
                    <option value="photo">Client Photo</option>
                    <option value="video">Review Video</option>
                  </select>
                </div>
              </div>

              {reviewModal.data.media_type !== 'none' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div className="portal-form-group">
                    <label className="portal-label">Media Asset URL</label>
                    <input type="text" required value={reviewModal.data.media_url} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, media_url: e.target.value } }))} className="portal-input" />
                  </div>
                  <div className="portal-form-group">
                    <label className="portal-btn portal-btn-secondary" style={{ width: '100%', padding: '11px', gap: '8px' }}>
                      <Upload size={16} /> Upload Asset
                      <input type="file" accept={reviewModal.data.media_type === 'video' ? 'video/*' : 'image/*'} onChange={e => handleFileUpload(e, (url) => setReviewModal(prev => ({ ...prev, data: { ...prev.data, media_url: url } })))} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              )}

              <div className="portal-form-group">
                <label className="portal-label">Client Testimonial Review Content</label>
                <textarea rows="3" required value={reviewModal.data.review_text} onChange={e => setReviewModal(prev => ({ ...prev, data: { ...prev.data, review_text: e.target.value } }))} className="portal-input"></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setReviewModal({ open: false, data: null })} className="portal-btn portal-btn-secondary">Cancel</button>
                <button type="submit" className="portal-btn portal-btn-primary">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
