import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Award, Shield, Calendar, Star, FileText, ClipboardList, Send, RefreshCw, ChevronRight } from 'lucide-react';

export default function WorkloadTracker() {
  const { user } = useOutletContext();
  const [staffList, setStaffList] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Tab control in details pane
  const [activeSubTab, setActiveSubTab] = useState('workload');
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Performance Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [staffReviews, setStaffReviews] = useState([]);

  // Records maintenance form state
  const [recordForm, setRecordForm] = useState({
    joining_date: '',
    competence_level: 'Intermediate',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Users
      const usersRes = await fetch('/api/admin/users', { headers });
      const workloadRes = await fetch('/api/portal/dashboard/workload', { headers });
      const tasksRes = await fetch('/api/portal/tasks', { headers });

      if (usersRes.ok && workloadRes.ok && tasksRes.ok) {
        const usersData = await usersRes.json();
        const workloadData = await workloadRes.json();
        const tasksData = await tasksRes.json();

        setStaffList(usersData);
        setWorkloads(workloadData);
        setTasks(tasksData);

        // Select the current user by default as "profile view" if they exist in users
        const me = usersData.find(u => u.id === user.id);
        if (me) {
          handleSelectStaff(me, workloadData, tasksData);
        } else if (usersData.length > 0) {
          handleSelectStaff(usersData[0], workloadData, tasksData);
        }
      } else {
        setError('Failed to fetch staff data. Please check authorization.');
      }
    } catch (err) {
      console.error('Error loading workload tracker:', err);
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = async (staff, workloadData = workloads, tasksData = tasks) => {
    setSelectedStaff(staff);
    setError('');
    setMessage('');
    
    // Set form state for maintenance
    setRecordForm({
      joining_date: staff.joining_date ? new Date(staff.joining_date).toISOString().split('T')[0] : '',
      competence_level: staff.competence_level || 'Intermediate',
      status: staff.status || 'Active',
      notes: staff.notes || ''
    });

    // Fetch this staff member's reviews
    fetchStaffReviews(staff.id);
  };

  const fetchStaffReviews = async (staffId) => {
    try {
      const res = await fetch(`/api/admin/users/${staffId}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setStaffReviews(await res.json());
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch(`/api/admin/users/${selectedStaff.id}/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recordForm)
      });

      if (res.ok) {
        setMessage('Staff record updated successfully!');
        
        // Refresh users & workloads lists
        const token = localStorage.getItem('token');
        const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setStaffList(usersData);
          const updated = usersData.find(u => u.id === selectedStaff.id);
          if (updated) {
            setSelectedStaff(updated);
          }
        }
      } else {
        const errData = await res.json();
        setError(errData.message || 'Error updating staff records.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/users/${selectedStaff.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: reviewRating, review_text: reviewText })
      });

      if (res.ok) {
        setReviewText('');
        setReviewRating(5);
        setMessage('Feedback review posted successfully!');
        fetchStaffReviews(selectedStaff.id);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Error posting performance review.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for selected staff member
  const getStaffWorkloadStats = (staffId) => {
    const wl = workloads.find(w => w.id === staffId);
    return wl || {
      total_tasks: 0,
      planned_count: 0,
      ongoing_count: 0,
      review_count: 0,
      completed_count: 0,
      pending_fees: 0,
      realized_fees: 0
    };
  };

  const getStaffTasks = (staffId) => {
    return tasks.filter(t => t.assigned_to === staffId);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'var(--portal-text-muted)', fontWeight: '600' }}>Loading Workload Tracker Metrics...</p>
      </div>
    );
  }

  const selectedWl = selectedStaff ? getStaffWorkloadStats(selectedStaff.id) : null;
  const selectedTasks = selectedStaff ? getStaffTasks(selectedStaff.id) : [];
  const activeTasks = selectedTasks.filter(t => t.status !== 'completed');
  const completedTasksList = selectedTasks.filter(t => t.status === 'completed');

  // Competence Calculation (Task Completion Rate)
  const completionRate = selectedWl && selectedWl.total_tasks > 0 
    ? Math.round((selectedWl.completed_count / selectedWl.total_tasks) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '30px' }}>
      <div className="portal-section-header">
        <div>
          <h2 className="portal-section-title">Staff & Role Workload Tracker</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--portal-text-secondary)', fontSize: '14px' }}>
            Inspect operational staff workloads, competence records, performance reviews, and assign audits.
          </p>
        </div>
        <button onClick={fetchInitialData} className="portal-btn portal-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Left Column: Staff Directory */}
        <div className="portal-card" style={{ width: '340px', display: 'flex', flexDirection: 'column', padding: '20px', margin: 0 }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--portal-text-primary)', fontSize: '15px', fontWeight: '700' }}>
            Staff Directory
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {staffList.map(staff => {
              const wl = getStaffWorkloadStats(staff.id);
              const isSelected = selectedStaff && selectedStaff.id === staff.id;
              return (
                <div 
                  key={staff.id} 
                  onClick={() => handleSelectStaff(staff)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--portal-primary)' : 'var(--portal-border-color)'}`,
                    backgroundColor: isSelected ? 'var(--portal-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--portal-primary)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : 'var(--portal-text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {staff.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--portal-text-primary)' }}>
                        {staff.username} {staff.id === user.id && <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--portal-text-muted)' }}>(You)</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                        <span className={`portal-role-badge portal-role-${staff.role}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {staff.role}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--portal-text-muted)' }}>
                          {wl.total_tasks} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={isSelected ? 'var(--portal-primary)' : '#cbd5e1'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Workload & Management Profile Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedStaff ? (
            <div className="portal-card" style={{ flex: 1, margin: 0, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              
              {/* Profile Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--portal-border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    backgroundColor: 'var(--portal-primary-light)', color: 'var(--portal-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px'
                  }}>
                    {selectedStaff.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '20px', fontWeight: '700' }}>
                      {selectedStaff.username}'s Operational Profile
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                      <span className={`portal-role-badge portal-role-${selectedStaff.role}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {selectedStaff.role.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--portal-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> Joined: {selectedStaff.joining_date ? new Date(selectedStaff.joining_date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
                        backgroundColor: selectedStaff.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: selectedStaff.status === 'Active' ? '#15803d' : '#b91c1c'
                      }}>
                        {selectedStaff.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Competence Level</div>
                  <div style={{
                    marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    padding: '4px 12px', borderRadius: '16px', backgroundColor: 'var(--portal-primary-light)', 
                    color: 'var(--portal-primary)', fontWeight: 'bold', fontSize: '13px'
                  }}>
                    <Award size={15} /> {selectedStaff.competence_level || 'Intermediate'}
                  </div>
                </div>
              </div>

              {/* Alert Notifications */}
              {error && <div className="portal-alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
              {message && <div className="portal-alert-success" style={{ marginBottom: '16px' }}>{message}</div>}

              {/* Tabs Nav */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--portal-border-color)', marginBottom: '20px', gap: '16px' }}>
                <button 
                  onClick={() => setActiveSubTab('workload')}
                  className={`portal-tab-btn ${activeSubTab === 'workload' ? 'active' : ''}`}
                  style={{ borderBottomWidth: '2px', paddingBottom: '10px' }}
                >
                  Workload & Tasks
                </button>
                <button 
                  onClick={() => setActiveSubTab('maintenance')}
                  className={`portal-tab-btn ${activeSubTab === 'maintenance' ? 'active' : ''}`}
                  style={{ borderBottomWidth: '2px', paddingBottom: '10px' }}
                >
                  Record Maintenance
                </button>
                <button 
                  onClick={() => setActiveSubTab('reviews')}
                  className={`portal-tab-btn ${activeSubTab === 'reviews' ? 'active' : ''}`}
                  style={{ borderBottomWidth: '2px', paddingBottom: '10px' }}
                >
                  Performance Reviews ({staffReviews.length})
                </button>
              </div>

              {/* Tab Content Panels */}
              <div style={{ flex: 1, minHeight: 0 }}>
                
                {/* PANEL 1: WORKLOAD & TASKS */}
                {activeSubTab === 'workload' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Performance Metrics scorecard */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div style={{ padding: '16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                        <div style={{ fontSize: '11px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Completion Rate</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--portal-text-primary)', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          {completionRate}% 
                          <span style={{ fontSize: '12px', color: 'var(--portal-text-secondary)', fontWeight: 'normal' }}>({selectedWl.completed_count}/{selectedWl.total_tasks})</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: '#16a34a' }}></div>
                        </div>
                      </div>

                      <div style={{ padding: '16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                        <div style={{ fontSize: '11px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pending Responsibility</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>
                          Rs. {selectedWl.pending_fees.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--portal-text-muted)' }}>{selectedWl.planned_count + selectedWl.ongoing_count + selectedWl.review_count} unfinished tasks</span>
                      </div>

                      <div style={{ padding: '16px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                        <div style={{ fontSize: '11px', color: 'var(--portal-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Realized Earnings</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', marginTop: '4px' }}>
                          Rs. {selectedWl.realized_fees.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--portal-text-muted)' }}>From {selectedWl.completed_count} completed tasks</span>
                      </div>
                    </div>

                    {/* Task Lists split */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                      {/* Active tasks */}
                      <div>
                        <h4 style={{ margin: '0 0 12px', color: 'var(--portal-text-primary)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ClipboardList size={16} color="var(--portal-primary)" /> Active Declarations ({activeTasks.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                          {activeTasks.length === 0 ? (
                            <div style={{ padding: '20px', border: '1px dashed var(--portal-border-color)', borderRadius: '6px', textAlign: 'center', color: 'var(--portal-text-muted)', fontSize: '13px' }}>
                              No active tasks assigned.
                            </div>
                          ) : (
                            activeTasks.map(t => (
                              <div key={t.id} style={{ padding: '10px', border: '1px solid var(--portal-border-color)', borderRadius: '6px', backgroundColor: '#fff' }}>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--portal-text-primary)' }}>{t.title}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                                  <span style={{ color: 'var(--portal-text-secondary)' }}>Goods: {t.goods_details || 'N/A'}</span>
                                  <span className={`portal-role-badge portal-role-staff`} style={{ padding: '1px 5px', textTransform: 'uppercase' }}>{t.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Completed tasks */}
                      <div>
                        <h4 style={{ margin: '0 0 12px', color: 'var(--portal-text-primary)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Star size={16} color="#16a34a" /> Completed Tasks ({completedTasksList.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                          {completedTasksList.length === 0 ? (
                            <div style={{ padding: '20px', border: '1px dashed var(--portal-border-color)', borderRadius: '6px', textAlign: 'center', color: 'var(--portal-text-muted)', fontSize: '13px' }}>
                              No completed tasks found.
                            </div>
                          ) : (
                            completedTasksList.map(t => (
                              <div key={t.id} style={{ padding: '10px', border: '1px solid var(--portal-border-color)', borderRadius: '6px', backgroundColor: '#fdfdfd' }}>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--portal-text-primary)' }}>{t.title}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                                  <span style={{ color: 'var(--portal-success)', fontWeight: '600' }}>Rs. {t.fee_paid}</span>
                                  <span style={{ color: 'var(--portal-text-muted)' }}>Done: {new Date(t.updated_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PANEL 2: RECORD MAINTENANCE */}
                {activeSubTab === 'maintenance' && (
                  <form onSubmit={handleSaveRecord} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="portal-form-group">
                        <label className="portal-label">Joining Date</label>
                        <input 
                          type="date" 
                          value={recordForm.joining_date} 
                          onChange={e => setRecordForm({ ...recordForm, joining_date: e.target.value })} 
                          className="portal-input"
                          disabled={user.role !== 'admin' && user.role !== 'manager'}
                        />
                      </div>
                      
                      <div className="portal-form-group">
                        <label className="portal-label">Competence Rank</label>
                        <select 
                          value={recordForm.competence_level} 
                          onChange={e => setRecordForm({ ...recordForm, competence_level: e.target.value })} 
                          className="portal-input"
                          disabled={user.role !== 'admin' && user.role !== 'manager'}
                        >
                          <option value="Beginner">Beginner Agent (Trainee)</option>
                          <option value="Intermediate">Intermediate Broker</option>
                          <option value="Expert">Expert Declaration Officer</option>
                          <option value="Lead">Lead Customs Specialist</option>
                        </select>
                      </div>
                    </div>

                    <div className="portal-form-group">
                      <label className="portal-label">Active Status</label>
                      <select 
                        value={recordForm.status} 
                        onChange={e => setRecordForm({ ...recordForm, status: e.target.value })} 
                        className="portal-input"
                        disabled={user.role !== 'admin' && user.role !== 'manager'}
                      >
                        <option value="Active">Active Duty</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended / On Leave</option>
                      </select>
                    </div>

                    <div className="portal-form-group">
                      <label className="portal-label">Internal Staff Records Notes</label>
                      <textarea 
                        rows="4" 
                        placeholder="Add notes on performance audits, declarations speed, background clearances..."
                        value={recordForm.notes} 
                        onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} 
                        className="portal-input" 
                        style={{ resize: 'vertical' }}
                        disabled={user.role !== 'admin' && user.role !== 'manager'}
                      ></textarea>
                    </div>

                    {(user.role === 'admin' || user.role === 'manager') && (
                      <button 
                        type="submit" 
                        disabled={actionLoading} 
                        className="portal-btn portal-btn-primary" 
                        style={{ alignSelf: 'flex-start', padding: '10px 24px', marginTop: '8px' }}
                      >
                        {actionLoading ? 'Saving changes...' : 'Save Staff Record'}
                      </button>
                    )}
                  </form>
                )}

                {/* PANEL 3: PERFORMANCE REVIEWS */}
                {activeSubTab === 'reviews' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Submit new review (Admins/Managers only, and cannot review themselves) */}
                    {(user.role === 'admin' || user.role === 'manager') && selectedStaff.id !== user.id && (
                      <form onSubmit={handleSubmitReview} className="portal-card" style={{ padding: '16px', backgroundColor: '#fcfcfc', border: '1px solid var(--portal-border-color)', margin: 0 }}>
                        <h4 style={{ margin: '0 0 12px', color: 'var(--portal-text-primary)', fontSize: '13.5px', fontWeight: '700' }}>
                          Submit Performance Review & Audit Feedback
                        </h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--portal-text-secondary)', fontWeight: '500' }}>Rating Score:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <Star 
                                  size={18} 
                                  fill={star <= reviewRating ? '#eab308' : 'none'} 
                                  color={star <= reviewRating ? '#eab308' : '#cbd5e1'} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="portal-form-group">
                          <textarea
                            rows="3"
                            required
                            placeholder="Write constructive evaluation notes regarding their declaration filings, communication speed, custom rules compliance..."
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            className="portal-input"
                            style={{ fontSize: '13px' }}
                          ></textarea>
                        </div>

                        <button 
                          type="submit" 
                          disabled={actionLoading} 
                          className="portal-btn portal-btn-primary" 
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12.5px', marginTop: '10px' }}
                        >
                          <Send size={14} /> {actionLoading ? 'Submitting...' : 'Post Evaluation'}
                        </button>
                      </form>
                    )}

                    {/* Review Feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--portal-text-primary)', fontSize: '14px', fontWeight: '700' }}>
                        Performance Feedback Thread
                      </h4>
                      {staffReviews.length === 0 ? (
                        <div style={{ padding: '30px', border: '1px dashed var(--portal-border-color)', borderRadius: '6px', textAlign: 'center', color: 'var(--portal-text-muted)', fontSize: '13px' }}>
                          No performance audits or reviews submitted for this staff member yet.
                        </div>
                      ) : (
                        staffReviews.map(rev => (
                          <div key={rev.id} style={{ padding: '14px', border: '1px solid var(--portal-border-color)', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--portal-text-primary)' }}>
                                  Reviewed by {rev.reviewer_username}
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--portal-text-muted)' }}>•</span>
                                <span style={{ fontSize: '11px', color: 'var(--portal-text-muted)' }}>
                                  {new Date(rev.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    size={12} 
                                    fill={star <= rev.rating ? '#eab308' : 'none'} 
                                    color={star <= rev.rating ? '#eab308' : '#e2e8f0'} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--portal-text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {rev.review_text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="portal-card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', color: 'var(--portal-text-muted)' }}>
              <User size={48} style={{ marginBottom: '16px', color: '#cbd5e1' }} />
              <p style={{ fontWeight: '500' }}>Select a staff member from the directory list to inspect their profile tracker details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
