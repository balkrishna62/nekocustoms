import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, MessageSquare, Users, LogOut, Settings, TrendingUp } from 'lucide-react';

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  let user = { role: 'staff', username: 'Guest' };
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch(e) {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinkClass = (path) => {
    const isActive = path === '/dashboard' 
      ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
      : location.pathname.includes(path);
    return `portal-nav-item ${isActive ? 'active' : ''}`;
  };

  return (
    <div className="portal-layout-wrapper">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-logo">N</div>
          <div>
            <h2 className="portal-brand-title">Neko Portal</h2>
            <div className="portal-brand-subtitle">Customs Brokerage</div>
          </div>
        </div>

        <div className="portal-user-badge">
          <div className="portal-user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="portal-user-name">{user.username}</div>
            <div className="portal-user-role">{user.role}</div>
          </div>
        </div>

        <nav className="portal-sidebar-nav">
          <div className="portal-nav-section-title">Menu</div>
          <Link to="/dashboard" className={navLinkClass('/dashboard')} end>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/dashboard/tasks" className={navLinkClass('/tasks')}>
            <CheckSquare size={18} /> Task Board
          </Link>
          <Link to="/dashboard/chat" className={navLinkClass('/chat')}>
            <MessageSquare size={18} /> Communications
          </Link>
          
          {(user.role === 'admin' || user.role === 'manager') && (
            <>
              <div className="portal-nav-section-title" style={{ marginTop: '16px' }}>Admin</div>
              {user.role === 'admin' && (
                <Link to="/dashboard/users" className={navLinkClass('/users')}>
                  <Users size={18} /> Users & Roles
                </Link>
              )}
              <Link to="/dashboard/workload" className={navLinkClass('/workload')}>
                <TrendingUp size={18} /> Staff Tracker
              </Link>
              <Link to="/dashboard/site" className={navLinkClass('/site')}>
                <Settings size={18} /> Site Manager
              </Link>
            </>
          )}
        </nav>

        <div className="portal-logout-container">
          <button 
            onClick={handleLogout}
            className="portal-logout-btn"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-content">
        <div className="portal-content-area">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
