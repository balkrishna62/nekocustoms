import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClipboardList, CreditCard, FileCheck, Activity } from 'lucide-react';

export default function PortalDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({
    remainingWorks: 0,
    remainingPayment: 0,
    completedThisMonth: 0,
    completedFeesThisMonth: 0,
    totalUsers: 0,
    unreadMessages: 0,
    totalNotices: 0,
    totalBlogs: 0,
    totalReviews: 0,
    totalGalleryItems: 0
  });
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchWorkloads();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloads = async () => {
    if (user.role !== 'admin' && user.role !== 'manager') return;
    try {
      const res = await fetch('/api/portal/dashboard/workload', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setWorkloads(await res.json());
      }
    } catch (err) {
      console.error('Error fetching workload stats:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'var(--portal-text-muted)', fontWeight: '600' }}>Loading Dashboard Metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Dashboard Greeting Header */}
      <div className="portal-section-header">
        <div>
          <h2 className="portal-section-title">Portal Overview</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--portal-text-secondary)', fontSize: '14px' }}>
            Welcome back, <strong style={{ color: 'var(--portal-text-primary)' }}>{user.username}</strong>. Here is the operational summary for Neko Customs.
          </p>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="portal-stats-grid">
        {/* Card 1: Remaining Works */}
        <div className="portal-stat-card">
          <div className="portal-stat-icon portal-stat-icon-warning">
            <ClipboardList size={22} />
          </div>
          <div className="portal-stat-info">
            <span className="portal-stat-title">Remaining Works</span>
            <span className="portal-stat-number">{stats.remainingWorks}</span>
            <span className="portal-stat-desc">Planned, ongoing & review tasks</span>
          </div>
        </div>

        {/* Card 2: Remaining Payments */}
        <div className="portal-stat-card">
          <div className="portal-stat-icon portal-stat-icon-danger">
            <CreditCard size={22} />
          </div>
          <div className="portal-stat-info">
            <span className="portal-stat-title">Pending Payments</span>
            <span className="portal-stat-number">Rs. {stats.remainingPayment.toLocaleString()}</span>
            <span className="portal-stat-desc">Fees for outstanding tasks</span>
          </div>
        </div>

        {/* Card 3: Works Completed This Month */}
        <div className="portal-stat-card">
          <div className="portal-stat-icon portal-stat-icon-success">
            <FileCheck size={22} />
          </div>
          <div className="portal-stat-info">
            <span className="portal-stat-title">Done This Month</span>
            <span className="portal-stat-number">{stats.completedThisMonth}</span>
            <span className="portal-stat-desc">Rs. {stats.completedFeesThisMonth.toLocaleString()} realized</span>
          </div>
        </div>

        {/* Card 4: Platform Activity / Details */}
        <div className="portal-stat-card">
          <div className="portal-stat-icon portal-stat-icon-primary">
            <Activity size={22} />
          </div>
          <div className="portal-stat-info">
            <span className="portal-stat-title">Operational Data</span>
            <span className="portal-stat-number">
              {user.role === 'admin' || user.role === 'manager' ? stats.unreadMessages : stats.totalNotices}
            </span>
            <span className="portal-stat-desc">
              {user.role === 'admin' || user.role === 'manager' 
                ? `${stats.unreadMessages} unread inbox inquiries` 
                : `${stats.totalNotices} notice board notices`}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'window.innerWidth < 1024 ? "1fr" : "1fr 1fr"', gap: '24px', marginTop: '32px' }}>
        {/* Main General Operational Guidelines / Shortcuts Card */}
        <div className="portal-card" style={{ margin: 0 }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--portal-text-primary)', fontSize: '16px', fontWeight: '700' }}>
            Portal Quick Guides
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '14.5px', lineHeight: '1.6' }}>
            Welcome to the Neko Customs Brokerage operation center. As a staff member or administrator, you can perform your duties seamlessly using the modules in the sidebar:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--portal-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong style={{ color: 'var(--portal-text-primary)' }}>Task Board</strong>: Track client import/export declarations, update task statuses (Planned ➔ Ongoing ➔ Pending Review ➔ Completed), and log customs service fees.
            </li>
            <li>
              <strong style={{ color: 'var(--portal-text-primary)' }}>Communications</strong>: Chat with team members in the Global Group or send private direct messages regarding customs documents and ASYCUDA World entries.
            </li>
            {(user.role === 'admin' || user.role === 'manager') && (
              <>
                <li>
                  <strong style={{ color: 'var(--portal-text-primary)' }}>Users & Roles</strong>: Create new portal users (Admin, Manager, or Staff) and manage permissions.
                </li>
                <li>
                  <strong style={{ color: 'var(--portal-text-primary)' }}>Site Manager</strong>: Update settings, announcement notices, gallery operators, publish blogs, and read customer inquiries directly from the public landing site.
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Website Content Health Card */}
        <div className="portal-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--portal-text-primary)', fontSize: '16px', fontWeight: '700' }}>
            Website Content Summary
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '14.5px', color: 'var(--portal-text-secondary)' }}>
            High-level content metrics of the public-facing site: <a href="/" target="_blank" rel="noreferrer" style={{ color: 'var(--portal-primary)', textDecoration: 'none', fontWeight: '600' }}>nekocustoms.com</a>
          </p>
          
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px 16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ fontSize: '12px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Blogs & News</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--portal-text-primary)', marginTop: '4px' }}>{stats.totalBlogs}</div>
              <div style={{ fontSize: '11px', color: 'var(--portal-text-secondary)', marginTop: '2px' }}>Published articles & updates</div>
            </div>
            
            <div style={{ padding: '12px 16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ fontSize: '12px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Gallery Items</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--portal-text-primary)', marginTop: '4px' }}>{stats.totalGalleryItems}</div>
              <div style={{ fontSize: '11px', color: 'var(--portal-text-secondary)', marginTop: '2px' }}>Operational showcases</div>
            </div>
            
            <div style={{ padding: '12px 16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ fontSize: '12px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Client Reviews</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--portal-text-primary)', marginTop: '4px' }}>{stats.totalReviews}</div>
              <div style={{ fontSize: '11px', color: 'var(--portal-text-secondary)', marginTop: '2px' }}>Customer testimonials & ratings</div>
            </div>

            <div style={{ padding: '12px 16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ fontSize: '12px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Public Notices</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--portal-text-primary)', marginTop: '4px' }}>{stats.totalNotices}</div>
              <div style={{ fontSize: '11px', color: 'var(--portal-text-secondary)', marginTop: '2px' }}>Active announcements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Workload Table Section - Manager/Admin only */}
      {(user.role === 'admin' || user.role === 'manager') && workloads.length > 0 && (
        <div className="portal-card" style={{ marginTop: '32px' }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--portal-text-primary)', fontSize: '16px', fontWeight: '700' }}>
            Staff & Role Workload Tracker
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: 'var(--portal-text-secondary)' }}>
            Monitor the active work allocation, tasks distribution, and service fee tracking for each portal user role.
          </p>
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>User / Role</th>
                  <th style={{ textAlign: 'center' }}>Total Tasks</th>
                  <th style={{ textAlign: 'center' }}>Planned</th>
                  <th style={{ textAlign: 'center' }}>Ongoing</th>
                  <th style={{ textAlign: 'center' }}>Pending Review</th>
                  <th style={{ textAlign: 'center' }}>Completed</th>
                  <th style={{ textAlign: 'right' }}>Pending Fees</th>
                  <th style={{ textAlign: 'right' }}>Realized Fees</th>
                </tr>
              </thead>
              <tbody>
                {workloads.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', 
                          backgroundColor: 'var(--portal-primary-light)', color: 'var(--portal-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px'
                        }}>
                          {w.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--portal-text-primary)' }}>{w.username}</div>
                          <span className={`portal-role-badge portal-role-${w.role}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {w.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{w.total_tasks}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: w.planned_count > 0 ? 'var(--portal-text-primary)' : 'var(--portal-text-muted)' }}>
                        {w.planned_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: w.ongoing_count > 0 ? '#4f46e5' : 'var(--portal-text-muted)', fontWeight: w.ongoing_count > 0 ? '600' : 'normal' }}>
                        {w.ongoing_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        color: w.review_count > 0 ? '#b45309' : 'var(--portal-text-muted)', 
                        fontWeight: w.review_count > 0 ? '600' : 'normal',
                        backgroundColor: w.review_count > 0 ? '#fef3c7' : 'transparent',
                        padding: w.review_count > 0 ? '2px 6px' : '0',
                        borderRadius: '4px'
                      }}>
                        {w.review_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: w.completed_count > 0 ? '#15803d' : 'var(--portal-text-muted)', fontWeight: w.completed_count > 0 ? '600' : 'normal' }}>
                        {w.completed_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: w.pending_fees > 0 ? '#b91c1c' : 'var(--portal-text-secondary)' }}>
                      Rs. {w.pending_fees.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#15803d' }}>
                      Rs. {w.realized_fees.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
