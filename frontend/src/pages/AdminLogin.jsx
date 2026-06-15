import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { API_BASE_URL, useSettings } from '../context/SettingsContext';
import SchemaMarkup from '../components/SchemaMarkup';

const AdminLogin = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    error: null
  });

  useEffect(() => {
    // If token already exists, redirect immediately to dashboard
    if (localStorage.getItem('token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        // Redirect to dashboard
        navigate('/admin/dashboard');
        // Force header reload to show admin tab
        window.location.reload();
      } else {
        setStatus({ loading: false, error: data.message || 'Authentication failed. Please verify credentials.' });
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setStatus({ loading: false, error: 'Cannot connect to login server. Please ensure backend is running.' });
    }
  };

  return (
    <div className="admin-login-page container animate-fade-in">
      <SchemaMarkup title="Admin Portal Sign-In" />

      <div className="admin-login-card animate-fade-in-up">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <Lock size={28} />
          </div>
          <h2 className="admin-login-title">Admin Dashboard</h2>
          <p className="admin-login-subtitle">Sign in to manage custom clearance details and page features</p>
        </div>

        {status.error && (
          <div className="alert-box danger">
            <AlertCircle size={18} />
            <span>{status.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Username
              </span>
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={credentials.username}
              onChange={handleChange}
              required 
              className="form-input" 
              placeholder="Enter admin username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" htmlFor="password">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </span>
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={credentials.password}
              onChange={handleChange}
              required 
              className="form-input" 
              placeholder="Enter password"
            />
          </div>

          <button 
            type="submit" 
            disabled={status.loading} 
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {status.loading ? 'Signing In...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
