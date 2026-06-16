import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShieldAlert } from 'lucide-react';

export default function PortalLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Invalid username or password.');
      }
    } catch (err) {
      setError('Network connection error. Please verify database connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-container">
      <div className="portal-login-card animate-fade-in-up">
        {/* Brand Logo emblem */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--portal-primary), #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: '800', fontSize: '20px', marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            NC
          </div>
          <h2 className="portal-login-title" style={{ margin: 0 }}>Neko Portal</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--portal-text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Staff Authentication
          </p>
        </div>
        
        {error && (
          <div className="portal-alert-error" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="portal-form-group" style={{ textAlign: 'left', margin: 0 }}>
            <label className="portal-label">Username</label>
            <div className="portal-input-icon-wrapper">
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="portal-input"
                placeholder="Enter username"
                required 
              />
              <User size={16} />
            </div>
          </div>

          <div className="portal-form-group" style={{ textAlign: 'left', margin: 0 }}>
            <label className="portal-label">Password</label>
            <div className="portal-input-icon-wrapper">
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="portal-input"
                placeholder="Enter password"
                required 
              />
              <Lock size={16} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="portal-btn portal-btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px', fontWeight: '700', letterSpacing: '0.5px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--portal-border-color)', paddingTop: '16px' }}>
          <a href="/" style={{ fontSize: '12.5px', color: 'var(--portal-text-secondary)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
             onMouseOver={e => e.target.style.color = 'var(--portal-primary)'}
             onMouseOut={e => e.target.style.color = 'var(--portal-text-secondary)'}>
            ← Back to nekocustoms.com
          </a>
        </div>
      </div>
    </div>
  );
}
