import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Bell, BookOpen, Mail, Key, LogOut, Plus, Edit2, Trash2, 
  Save, X, Check, AlertTriangle, Calendar, Image, Star, Upload
} from 'lucide-react';
import { API_BASE_URL, useSettings } from '../context/SettingsContext';
import SchemaMarkup from '../components/SchemaMarkup';

const AdminDashboard = () => {
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

  // 8. Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const lastKnownUnread = useRef(-1);
  const notifPermission = useRef('default');

  // Helper headers for auth
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerServiceWorkerAndSubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const register = await navigator.serviceWorker.register('/sw.js');
      const res = await fetch(`${API_BASE_URL}/admin/push/vapid-public-key`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const { publicKey } = await res.json();
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await fetch(`${API_BASE_URL}/admin/push/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Push Subscription failed:', err);
    }
  }, [token]);

  // ==========================================
  // BROWSER NOTIFICATION SYSTEM
  // ==========================================
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      notifPermission.current = perm;
      if (perm === 'granted') registerServiceWorkerAndSubscribe();
    } else {
      notifPermission.current = Notification.permission;
      if (Notification.permission === 'granted') registerServiceWorkerAndSubscribe();
    }
  }, [registerServiceWorkerAndSubscribe]);

  const sendBrowserNotification = useCallback((title, body) => {
    // Direct check to avoid race conditions
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'neko-inbox-' + Date.now(),
        requireInteraction: true,
      });
      notif.onclick = () => {
        window.focus();
        setActiveTab('inbox');
        notif.close();
      };

      // Play a simple notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqPb3RxfoKHiI2OkJSWl5iZmpqbm5ucnZ2dnp+foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbm5ucnZ2dnp+foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbm5ucnZ2dnp+foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/');
        audio.play().catch(e => console.warn('Audio play prevented:', e));
      } catch (e) { }

    } catch (e) {
      console.warn('Notification failed:', e);
    }
  }, []);

  const pollUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unread || 0;
        setUnreadCount(newCount);

        // First load baseline
        if (lastKnownUnread.current === -1) {
           lastKnownUnread.current = newCount;
           return;
        }

        lastKnownUnread.current = newCount;
      }
    } catch (err) {
      // Silent fail on poll
    }
  }, [token]);

  // Request notification permission and start polling on mount
  useEffect(() => {
    if (!token) return;
    requestNotificationPermission();
    
    // Initial fetch
    pollUnreadCount();
    
    // Poll every 15 seconds for new messages
    const interval = setInterval(pollUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token, requestNotificationPermission, pollUnreadCount]);

  // Fetch initial content
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Copy settings to state
    setSettingsForm(settings);

    // Fetch tab data based on selection
    if (activeTab === 'notices') fetchNotices();
    if (activeTab === 'blogs') fetchBlogs();
    if (activeTab === 'inbox') fetchMessages();
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab, settings, token, navigate]);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: null, message: null }), 5000);
  };

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
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
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
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
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
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
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
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
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
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="admin-dashboard-page container animate-fade-in">
      <SchemaMarkup title="Admin Control Center" />

      {/* Dashboard Top Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title-group">
          <h2>Admin Control Center</h2>
          <span className="admin-dashboard-subtitle">Configure layout segments, toggles, notices, media uploads, and languages</span>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ gap: '6px' }}>
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Dynamic Alerts */}
      {alert.message && (
        <div className={`alert-box ${alert.type}`}>
          {alert.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* File Upload Global Progress Loader */}
      {uploading && (
        <div className="alert-box success" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', position: 'fixed', bottom: '24px', right: '24px', zIndex: '2010', boxShadow: 'var(--shadow-xl)' }}>
          <Upload size={18} className="animate-bounce" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Tab Navigation links */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> General & Toggles
        </button>
        <button 
          className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Image size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Gallery Grid
        </button>
        <button 
          className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Star size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Customer Reviews
        </button>
        <button 
          className={`admin-tab ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          <Bell size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Notice Board
        </button>
        <button 
          className={`admin-tab ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Blog Manager
        </button>
        <button 
          className={`admin-tab ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
          style={{ position: 'relative' }}
        >
          <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Inbox Inquiries
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: '800',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
              animation: 'pulse 2s infinite'
            }}>{unreadCount}</span>
          )}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Security Password
        </button>
      </div>

      {/* Tab Contents Panel */}
      <div className="admin-panel-card">

        {/* TAB 1: SITE SETTINGS & FEATURE TOGGLES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSettingsSubmit}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">General Settings & Visibility Toggles</h3>
              <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                <Save size={16} /> Save Configurations
              </button>
            </div>

            {/* Feature Hide/Show toggles grid */}
            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Section Visibility Controls</h4>
            <div className="toggle-grid">
              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">Notice Module</span>
                  <span className="toggle-desc">Enable notice board pages & headers</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_notice" 
                    checked={settingsForm.show_notice === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">Landing Pop-up</span>
                  <span className="toggle-desc">Auto-display latest alert popup notice</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_popup_notice" 
                    checked={settingsForm.show_popup_notice === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">Gallery Operations Section</span>
                  <span className="toggle-desc">Enable checkpoints gallery images grid</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_gallery" 
                    checked={settingsForm.show_gallery === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">Reviews Section</span>
                  <span className="toggle-desc">Enable customer photo/video testimonial cards</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_reviews" 
                    checked={settingsForm.show_reviews === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">Blogs & Guides Section</span>
                  <span className="toggle-desc">Enable trade articles & custom advices</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_blog" 
                    checked={settingsForm.show_blog === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">About Port Section</span>
                  <span className="toggle-desc">Display port procedures & info</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_about" 
                    checked={settingsForm.show_about === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card" style={{ gridColumn: 'span 2' }}>
                <div className="toggle-info">
                  <span className="toggle-title">Contact & Clearance Form</span>
                  <span className="toggle-desc">Allow public quotes submissions</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="show_contact" 
                    checked={settingsForm.show_contact === 'true'} 
                    onChange={handleSettingsChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Custom Site Texts fields */}
            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Identity & Brand</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Site Name (English)</label>
                <input 
                  type="text" 
                  name="site_name" 
                  value={settingsForm.site_name || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Site Name (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="site_name_np" 
                  value={settingsForm.site_name_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Primary Theme Preference</label>
              <select 
                name="theme_default" 
                value={settingsForm.theme_default || 'light'} 
                onChange={handleSettingsChange} 
                className="form-input"
                style={{ background: 'var(--bg-primary)' }}
              >
                <option value="light">Light Mode default</option>
                <option value="dark">Dark Mode default</option>
              </select>
            </div>

            {/* Bilingual inputs side-by-side */}
            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Bilingual Hero Wording & Image (English & Nepali)</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Hero Tag (English)</label>
                <input 
                  type="text" 
                  name="hero_tag" 
                  value={settingsForm.hero_tag || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Tag (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="hero_tag_np" 
                  value={settingsForm.hero_tag_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Hero Title (English)</label>
                <input 
                  type="text" 
                  name="hero_title" 
                  value={settingsForm.hero_title || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Title (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="hero_title_np" 
                  value={settingsForm.hero_title_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Hero Subtitle (English)</label>
                <textarea 
                  name="hero_subtitle" 
                  value={settingsForm.hero_subtitle || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Subtitle (Nepali - नेपाली)</label>
                <textarea 
                  name="hero_subtitle_np" 
                  value={settingsForm.hero_subtitle_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Hero Background Image</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  name="hero_image" 
                  value={settingsForm.hero_image || ''} 
                  onChange={handleSettingsChange} 
                  placeholder="https://..."
                  className="form-input" 
                  style={{ flexGrow: 1 }}
                />
                <div className="btn btn-secondary" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Upload size={16} /> Upload image
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (url) => setSettingsForm(prev => ({ ...prev, hero_image: url })))}
                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                  />
                </div>
              </div>
              {settingsForm.hero_image && (
                <img 
                  src={settingsForm.hero_image} 
                  alt="Hero Preview" 
                  style={{ marginTop: '8px', maxHeight: '100px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'block' }}
                />
              )}
            </div>

            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Bilingual Company Story (English & Nepali)</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Company Story (English)</label>
                <textarea 
                  name="about_story" 
                  value={settingsForm.about_story || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '120px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Story (Nepali - नेपाली)</label>
                <textarea 
                  name="about_story_np" 
                  value={settingsForm.about_story_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '120px' }}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Company Mission (English)</label>
                <textarea 
                  name="about_mission" 
                  value={settingsForm.about_mission || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Mission (Nepali - नेपाली)</label>
                <textarea 
                  name="about_mission_np" 
                  value={settingsForm.about_mission_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Company Vision (English)</label>
                <textarea 
                  name="about_vision" 
                  value={settingsForm.about_vision || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Vision (Nepali - नेपाली)</label>
                <textarea 
                  name="about_vision_np" 
                  value={settingsForm.about_vision_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>

            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Bilingual Location Presence</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Office Address (English)</label>
                <input 
                  type="text" 
                  name="site_address" 
                  value={settingsForm.site_address || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Office Address (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="site_address_np" 
                  value={settingsForm.site_address_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input 
                  type="text" 
                  name="site_phone" 
                  value={settingsForm.site_phone || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input 
                  type="email" 
                  name="site_email" 
                  value={settingsForm.site_email || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">WhatsApp Contact Number (digits only, e.g. 9779852023456)</label>
                <input 
                  type="text" 
                  name="site_whatsapp" 
                  value={settingsForm.site_whatsapp || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Google Maps Embed URL src</label>
                <input 
                  type="text" 
                  name="site_map_embed" 
                  value={settingsForm.site_map_embed || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Social Media Links</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Facebook URL</label>
                <input 
                  type="text" 
                  name="social_facebook" 
                  value={settingsForm.social_facebook || ''} 
                  onChange={handleSettingsChange} 
                  placeholder="https://facebook.com/..."
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter / X URL</label>
                <input 
                  type="text" 
                  name="social_twitter" 
                  value={settingsForm.social_twitter || ''} 
                  onChange={handleSettingsChange} 
                  placeholder="https://twitter.com/..."
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Instagram URL</label>
                <input 
                  type="text" 
                  name="social_instagram" 
                  value={settingsForm.social_instagram || ''} 
                  onChange={handleSettingsChange} 
                  placeholder="https://instagram.com/..."
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input 
                  type="text" 
                  name="social_linkedin" 
                  value={settingsForm.social_linkedin || ''} 
                  onChange={handleSettingsChange} 
                  placeholder="https://linkedin.com/in/..."
                  className="form-input" 
                />
              </div>
            </div>

            {/* Bilingual Core Services Details */}
            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Bilingual Services Section (English & Nepali)</h4>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Services Section Title (English)</label>
                <input 
                  type="text" 
                  name="services_title" 
                  value={settingsForm.services_title || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Services Section Title (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="services_title_np" 
                  value={settingsForm.services_title_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Services Section Subtitle (English)</label>
                <textarea 
                  name="services_subtitle" 
                  value={settingsForm.services_subtitle || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Services Section Subtitle (Nepali - नेपाली)</label>
                <textarea 
                  name="services_subtitle_np" 
                  value={settingsForm.services_subtitle_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>

            {/* Service Card 1: Import Clearance */}
            <h5 style={{ margin: '16px 0 8px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Service Card 1 (Import Customs)</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 1 Title (English)</label>
                <input 
                  type="text" 
                  name="srv_import_title" 
                  value={settingsForm.srv_import_title || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 1 Title (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="srv_import_title_np" 
                  value={settingsForm.srv_import_title_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 1 Description (English)</label>
                <textarea 
                  name="srv_import_desc" 
                  value={settingsForm.srv_import_desc || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 1 Description (Nepali - नेपाली)</label>
                <textarea 
                  name="srv_import_desc_np" 
                  value={settingsForm.srv_import_desc_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>

            {/* Service Card 2: Export Compliance */}
            <h5 style={{ margin: '16px 0 8px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Service Card 2 (Export Compliance)</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 2 Title (English)</label>
                <input 
                  type="text" 
                  name="srv_export_title" 
                  value={settingsForm.srv_export_title || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 2 Title (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="srv_export_title_np" 
                  value={settingsForm.srv_export_title_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 2 Description (English)</label>
                <textarea 
                  name="srv_export_desc" 
                  value={settingsForm.srv_export_desc || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 2 Description (Nepali - नेपाली)</label>
                <textarea 
                  name="srv_export_desc_np" 
                  value={settingsForm.srv_export_desc_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>

            {/* Service Card 3: Tariff Consultation */}
            <h5 style={{ margin: '16px 0 8px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Service Card 3 (Tariff & Consultation)</h5>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 3 Title (English)</label>
                <input 
                  type="text" 
                  name="srv_tariff_title" 
                  value={settingsForm.srv_tariff_title || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 3 Title (Nepali - नेपाली)</label>
                <input 
                  type="text" 
                  name="srv_tariff_title_np" 
                  value={settingsForm.srv_tariff_title_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Card 3 Description (English)</label>
                <textarea 
                  name="srv_tariff_desc" 
                  value={settingsForm.srv_tariff_desc || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card 3 Description (Nepali - नेपाली)</label>
                <textarea 
                  name="srv_tariff_desc_np" 
                  value={settingsForm.srv_tariff_desc_np || ''} 
                  onChange={handleSettingsChange} 
                  className="form-input" 
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>

            <h4 style={{ margin: '24px 0 12px', color: 'var(--accent-color)' }}>Search Index Meta SEO & Keywords</h4>
            <div className="form-group">
              <label className="form-label">SEO Page Metadata Title</label>
              <input 
                type="text" 
                name="seo_meta_title" 
                value={settingsForm.seo_meta_title || ''} 
                onChange={handleSettingsChange} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">SEO Description Tag</label>
              <textarea 
                name="seo_meta_desc" 
                value={settingsForm.seo_meta_desc || ''} 
                onChange={handleSettingsChange} 
                className="form-input" 
                style={{ minHeight: '60px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SEO Keywords List (Comma-separated)</label>
              <input 
                type="text" 
                name="seo_meta_keywords" 
                value={settingsForm.seo_meta_keywords || ''} 
                onChange={handleSettingsChange} 
                className="form-input" 
              />
            </div>
          </form>
        )}

        {/* TAB 2: GALLERY MANAGER CRUD */}
        {activeTab === 'gallery' && (
          <div>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Manage Operations Gallery</h3>
              <button className="btn btn-primary" onClick={() => handleOpenGalleryModal()} style={{ gap: '6px' }}>
                <Plus size={16} /> Add Photo
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Caption Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gallery.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.title}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description || '-'}</td>
                      <td className="action-btns">
                        <button className="btn-icon" onClick={() => handleOpenGalleryModal(item)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteGallery(item.id)} style={{ color: 'var(--danger-color)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gallery.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Gallery grid is empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER REVIEWS CRUD */}
        {activeTab === 'reviews' && (
          <div>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Manage Customer References</h3>
              <button className="btn btn-primary" onClick={() => handleOpenReviewModal()} style={{ gap: '6px' }}>
                <Plus size={16} /> Add Client Reference
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Company</th>
                    <th>Rating</th>
                    <th>Language</th>
                    <th>Attachment Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(rev => (
                    <tr key={rev.id}>
                      <td style={{ fontWeight: '600' }}>{rev.name}</td>
                      <td>{rev.company || '-'}</td>
                      <td style={{ color: 'var(--accent-gold)' }}>{rev.rating} ★</td>
                      <td style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{rev.language}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                          {rev.media_type}
                        </span>
                      </td>
                      <td className="action-btns">
                        <button className="btn-icon" onClick={() => handleOpenReviewModal(rev)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteReview(rev.id)} style={{ color: 'var(--danger-color)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No reviews added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: NOTICE BOARD LIST & CRUD */}
        {activeTab === 'notices' && (
          <div>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Manage Notices</h3>
              <button className="btn btn-primary" onClick={() => handleOpenNoticeModal()} style={{ gap: '6px' }}>
                <Plus size={16} /> New Announcement
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Expires At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id}>
                      <td style={{ fontWeight: '600' }}>{notice.title}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                          {notice.type}
                        </span>
                      </td>
                      <td style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{notice.language}</td>
                      <td>
                        <span className={`status-badge ${notice.is_active ? 'active' : 'inactive'}`}>
                          {notice.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td>{notice.expires_at ? notice.expires_at.split('T')[0] : 'Never'}</td>
                      <td className="action-btns">
                        <button className="btn-icon" onClick={() => handleOpenNoticeModal(notice)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteNotice(notice.id)} style={{ color: 'var(--danger-color)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No notice announcements in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BLOGS MANAGER CRUD */}
        {activeTab === 'blogs' && (
          <div>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Manage Articles & Guides</h3>
              <button className="btn btn-primary" onClick={() => handleOpenBlogModal()} style={{ gap: '6px' }}>
                <Plus size={16} /> Create Article
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog.id}>
                      <td style={{ fontWeight: '600' }}>{blog.title}</td>
                      <td>{blog.category}</td>
                      <td style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{blog.language}</td>
                      <td>
                        <span className={`status-badge ${blog.status === 'published' ? 'active' : 'inactive'}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{blog.created_at.split('T')[0]}</td>
                      <td className="action-btns">
                        <button className="btn-icon" onClick={() => handleOpenBlogModal(blog)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteBlog(blog.id)} style={{ color: 'var(--danger-color)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No blog posts seeded or created.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: INBOX MESSAGE VIEWER */}
        {activeTab === 'inbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: messages.length ? '1.2fr 1.8fr' : '1fr', gap: '32px' }}>
            <div>
              <h3 className="admin-panel-title" style={{ marginBottom: '16px' }}>Inbox Inquiries</h3>
              <div className="admin-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="admin-table">
                  <tbody>
                    {messages.map(msg => (
                      <tr 
                        key={msg.id} 
                        onClick={() => handleReadMessage(msg)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: activeMessage?.id === msg.id ? 'var(--bg-secondary)' : ''
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: msg.status === 'unread' ? '800' : '500' }}>{msg.name}</span>
                            <span className={`status-badge ${msg.status === 'unread' ? 'unread' : 'read'}`} style={{ fontSize: '0.65rem' }}>
                              {msg.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {msg.subject}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr>
                        <td style={{ textAlign: 'center', padding: '24px' }}>Inquiries inbox is empty.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Read Box Details */}
            <div>
              {activeMessage ? (
                <div>
                  <div className="admin-panel-header" style={{ marginBottom: '16px' }}>
                    <h3 className="admin-panel-title">Message Details</h3>
                    <button className="btn btn-secondary" style={{ color: 'var(--danger-color)', padding: '6px 12px' }} onClick={() => handleDeleteMessage(activeMessage.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  
                  <div className="msg-preview-card">
                    <div className="msg-preview-meta">
                      <div>
                        <strong>From:</strong> {activeMessage.name}
                      </div>
                      <div>
                        <strong>Date:</strong> {new Date(activeMessage.created_at).toLocaleString()}
                      </div>
                      <div>
                        <strong>Email:</strong> <a href={`mailto:${activeMessage.email}`} style={{ textDecoration: 'underline', color: 'var(--accent-color)' }}>{activeMessage.email}</a>
                      </div>
                      {activeMessage.phone && (
                        <div>
                          <strong>Phone:</strong> {activeMessage.phone}
                        </div>
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ marginBottom: '8px' }}>Subject: {activeMessage.subject}</h4>
                      <p className="msg-preview-body">{activeMessage.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                  Select a message from the list to preview details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '400px' }}>
            <h3 className="admin-panel-title" style={{ marginBottom: '24px' }}>Change Access Password</h3>
            
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input 
                type="password" 
                value={passForm.currentPassword} 
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} 
                required 
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Secure Password *</label>
              <input 
                type="password" 
                value={passForm.newPassword} 
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} 
                required 
                className="form-input" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Confirm New Password *</label>
              <input 
                type="password" 
                value={passForm.confirmPassword} 
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} 
                required 
                className="form-input" 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Change Password
            </button>
          </form>
        )}

      </div>

      {/* ==========================================
          MODALS OVERLAY SECTION
          ========================================== */}

      {/* 1. GALLERY MODAL */}
      {galleryModal.open && (
        <div className="admin-modal-overlay">
          <form className="admin-modal" onSubmit={handleSaveGallery}>
            <div className="admin-modal-header">
              <h3>{galleryModal.data.id ? 'Edit Gallery Photo' : 'Add Gallery Photo'}</h3>
              <button type="button" className="popup-close-btn" onClick={() => setGalleryModal({ open: false, data: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Photo Title *</label>
                <input 
                  type="text" 
                  value={galleryModal.data.title}
                  onChange={(e) => setGalleryModal({ ...galleryModal, data: { ...galleryModal.data, title: e.target.value } })}
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description Caption</label>
                <input 
                  type="text" 
                  value={galleryModal.data.description}
                  onChange={(e) => setGalleryModal({ ...galleryModal, data: { ...galleryModal.data, description: e.target.value } })}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Operations Photo *</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={galleryModal.data.image_url}
                    onChange={(e) => setGalleryModal({ ...galleryModal, data: { ...galleryModal.data, image_url: e.target.value } })}
                    required 
                    placeholder="https://..."
                    className="form-input" 
                    style={{ flexGrow: 1 }}
                  />
                  <div className="btn btn-secondary" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                    <Upload size={16} /> Upload image
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => setGalleryModal(prev => ({ ...prev, data: { ...prev.data, image_url: url } })))}
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setGalleryModal({ open: false, data: null })}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Gallery Image
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. CLIENT REVIEWS MODAL (BILINGUAL) */}
      {reviewModal.open && (
        <div className="admin-modal-overlay">
          <form className="admin-modal" onSubmit={handleSaveReview}>
            <div className="admin-modal-header">
              <h3>{reviewModal.data.id ? 'Edit Client Review' : 'Add Client Review'}</h3>
              <button type="button" className="popup-close-btn" onClick={() => setReviewModal({ open: false, data: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input 
                    type="text" 
                    value={reviewModal.data.name}
                    onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, name: e.target.value } })}
                    required 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Designation</label>
                  <input 
                    type="text" 
                    value={reviewModal.data.company}
                    onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, company: e.target.value } })}
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Rating score (1 to 5 Stars)</label>
                  <select 
                    value={reviewModal.data.rating}
                    onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, rating: parseInt(e.target.value, 10) } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Target Language</label>
                  <select 
                    value={reviewModal.data.language}
                    onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, language: e.target.value } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="en">English Edition</option>
                    <option value="np">Nepali Edition (नेपाली)</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Display Media Type Attachment</label>
                  <select 
                    value={reviewModal.data.media_type}
                    onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, media_type: e.target.value, media_url: '' } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="none">None (Text only)</option>
                    <option value="photo">Photo Image</option>
                    <option value="video">Video Clip</option>
                  </select>
                </div>
              </div>

              {reviewModal.data.media_type !== 'none' && (
                <div className="form-group">
                  <label className="form-label">
                    Upload Testimony {reviewModal.data.media_type === 'photo' ? 'Photo Image' : 'Video Clip'} *
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={reviewModal.data.media_url || ''}
                      onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, media_url: e.target.value } })}
                      required 
                      placeholder="https://... or click upload"
                      className="form-input" 
                      style={{ flexGrow: 1 }}
                    />
                    <div className="btn btn-secondary" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                      <Upload size={16} /> Upload File
                      <input 
                        type="file" 
                        accept={reviewModal.data.media_type === 'photo' ? "image/*" : "video/*"}
                        onChange={(e) => handleFileUpload(e, (url) => setReviewModal(prev => ({ ...prev, data: { ...prev.data, media_url: url } })))}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Review text feedback *</label>
                <textarea 
                  value={reviewModal.data.review_text}
                  onChange={(e) => setReviewModal({ ...reviewModal, data: { ...reviewModal.data, review_text: e.target.value } })}
                  required 
                  className="form-input" 
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setReviewModal({ open: false, data: null })}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. NOTICE MODAL (BILINGUAL) */}
      {noticeModal.open && (
        <div className="admin-modal-overlay">
          <form className="admin-modal" onSubmit={handleSaveNotice}>
            <div className="admin-modal-header">
              <h3>{noticeModal.data.id ? 'Edit Notice' : 'Add New Notice'}</h3>
              <button type="button" className="popup-close-btn" onClick={() => setNoticeModal({ open: false, data: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input 
                  type="text" 
                  value={noticeModal.data.title}
                  onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, title: e.target.value } })}
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Content *</label>
                <textarea 
                  value={noticeModal.data.content}
                  onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, content: e.target.value } })}
                  required 
                  className="form-input" 
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    value={noticeModal.data.type}
                    onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, type: e.target.value } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="regular">regular board notice</option>
                    <option value="popup">landing popup alert</option>
                    <option value="alert">warning alert bar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language target</label>
                  <select 
                    value={noticeModal.data.language}
                    onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, language: e.target.value } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="en">English Edition</option>
                    <option value="np">Nepali Edition (नेपाली)</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Expiration Date (Optional)</label>
                  <input 
                    type="date" 
                    value={noticeModal.data.expires_at || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, expires_at: e.target.value } })}
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="popup-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={noticeModal.data.is_active === 1 || noticeModal.data.is_active === true}
                    onChange={(e) => setNoticeModal({ ...noticeModal, data: { ...noticeModal.data, is_active: e.target.checked ? 1 : 0 } })}
                  />
                  Publish immediately (Active)
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setNoticeModal({ open: false, data: null })}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. BLOG MODAL (BILINGUAL) */}
      {blogModal.open && (
        <div className="admin-modal-overlay">
          <form className="admin-modal" onSubmit={handleSaveBlog}>
            <div className="admin-modal-header">
              <h3>{blogModal.data.id ? 'Edit Article' : 'Create New Article'}</h3>
              <button type="button" className="popup-close-btn" onClick={() => setBlogModal({ open: false, data: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Article Title *</label>
                <input 
                  type="text" 
                  value={blogModal.data.title}
                  onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, title: e.target.value } })}
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    value={blogModal.data.category}
                    onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, category: e.target.value } })}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Article Status</label>
                  <select 
                    value={blogModal.data.status}
                    onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, status: e.target.value } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Language Target</label>
                  <select 
                    value={blogModal.data.language}
                    onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, language: e.target.value } })}
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="en">English Edition</option>
                    <option value="np">Nepali Edition (नेपाली)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Article Cover Image</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={blogModal.data.cover_image}
                    onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, cover_image: e.target.value } })}
                    placeholder="https://..."
                    className="form-input" 
                    style={{ flexGrow: 1 }}
                  />
                  <div className="btn btn-secondary" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                    <Upload size={16} /> Upload image
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, cover_image: url } })))}
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Excerpt Summary *</label>
                <input 
                  type="text" 
                  value={blogModal.data.excerpt}
                  onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, excerpt: e.target.value } })}
                  required
                  className="form-input" 
                  placeholder="Short brief description for index listing"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body Content (Supports markdown style headers & bullets) *</label>
                <textarea 
                  value={blogModal.data.content}
                  onChange={(e) => setBlogModal({ ...blogModal, data: { ...blogModal.data, content: e.target.value } })}
                  required 
                  className="form-input" 
                  style={{ minHeight: '240px' }}
                  placeholder="Write content here. Double Enter separation starts paragraphs. Use ## for Headings."
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setBlogModal({ open: false, data: null })}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Article
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
