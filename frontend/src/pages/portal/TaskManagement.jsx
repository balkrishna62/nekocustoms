import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Printer } from 'lucide-react';
import TaskCard from '../../components/portal/TaskCard';

export default function TaskManagement() {
  const { user } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('planned');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', assigned_to: '', priority_rank: 'medium', deadline: '', fee_paid: '', goods_details: '', contact_number: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async (query = '') => {
    let endpoint = user.role === 'admin' || user.role === 'manager' ? '/api/portal/tasks' : '/api/portal/tasks/me';
    if (query) endpoint = `/api/portal/tasks/search?query=\${encodeURIComponent(query)}`;

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setTasks(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setUsers(await res.json());
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchTasks(e.target.value);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ title: '', description: '', assigned_to: '', priority_rank: 'medium', deadline: '', fee_paid: '', goods_details: '', contact_number: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setIsEditMode(true);
    setEditingId(task.id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority_rank: task.priority_rank || 'medium',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      fee_paid: task.fee_paid || '',
      goods_details: task.goods_details || '',
      contact_number: task.contact_number || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    const payload = { ...formData, fee_paid: formData.fee_paid || 0 };
    
    let url = '/api/portal/tasks';
    let method = 'POST';
    
    if (isEditMode) {
      url = `/api/portal/tasks/${editingId}/details`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchTasks(searchQuery);
    }
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/portal/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchTasks(searchQuery);
  };

  const handlePrintSection = () => {
    const printWindow = window.open('', '_blank');
    const sectionTitle = activeTab === 'pending_approval' ? 'PENDING REVIEW' : activeTab.toUpperCase();
    const tasksToPrint = getActiveTasks();

    const taskRows = tasksToPrint.map((t, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-weight: 600; color: #4b5563; font-size: 14px;">${idx + 1}</td>
        <td style="padding: 12px 10px;">
          <div style="font-weight: 700; font-size: 14px; color: #1e293b;">${t.title || 'No Title'}</div>
          ${t.description ? `<div style="color: #64748b; font-size: 12px; margin-top: 4px; line-height: 1.4;">${t.description}</div>` : ''}
        </td>
        <td style="padding: 12px 10px; text-transform: uppercase; font-size: 11px; font-weight: 700;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; 
            background-color: ${t.priority_rank === 'urgent' ? '#fee2e2' : t.priority_rank === 'high' ? '#ffedd5' : t.priority_rank === 'medium' ? '#eff6ff' : '#f8fafc'};
            color: ${t.priority_rank === 'urgent' ? '#ef4444' : t.priority_rank === 'high' ? '#f97316' : t.priority_rank === 'medium' ? '#3b82f6' : '#64748b'};
            border: 1px solid ${t.priority_rank === 'urgent' ? '#fca5a5' : t.priority_rank === 'high' ? '#fdba74' : t.priority_rank === 'medium' ? '#bfdbfe' : '#e2e8f0'};">
            ${t.priority_rank || 'medium'}
          </span>
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #334155;">
          <div><strong>Goods:</strong> ${t.goods_details || 'N/A'}</div>
          <div style="margin-top: 2px;"><strong>Contact:</strong> ${t.contact_number || 'N/A'}</div>
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #334155; font-weight: 500;">
          ${t.assigned_to_username || 'Unassigned'}
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #334155;">
          ${t.deadline ? new Date(t.deadline).toLocaleDateString() + ' ' + new Date(t.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
        </td>
        <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #16a34a; text-align: right;">
          Rs. ${Number(t.fee_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Neko Customs - ${sectionTitle} Tasks Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-title { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
            .logo-accent { color: #6366f1; }
            .report-info { font-size: 14px; color: #4b5563; margin-top: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
            .date-info { text-align: right; font-size: 13px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; text-align: left; padding: 14px 10px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; font-weight: 500; }
            @media print {
              body { margin: 20px; }
              .header { border-bottom: 3px solid #000; }
              th { background-color: #f1f5f9 !important; border-bottom: 2px solid #94a3b8 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">NEKO<span class="logo-accent">CUSTOMS</span></div>
              <div class="report-info">Task Status Report: ${sectionTitle}</div>
            </div>
            <div class="date-info">
              <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              <div style="margin-top: 2px;"><strong>Total Tasks:</strong> ${tasksToPrint.length}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%">S.N.</th>
                <th style="width: 32%">Task details</th>
                <th style="width: 12%">Priority</th>
                <th style="width: 23%">Goods & Client info</th>
                <th style="width: 13%">Assignee</th>
                <th style="width: 15%">Deadline</th>
                <th style="width: 10%; text-align: right;">Fee (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              ${taskRows.length > 0 ? taskRows : '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8; font-size: 14px;">No tasks found in this section.</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            Neko Customs clearance agent &copy; ${new Date().getFullYear()} - Biratnagar Dry Port, Nepal. All Rights Reserved.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const plannedTasks = tasks.filter(t => t.status === 'planned');
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
  const reviewTasks = tasks.filter(t => t.status === 'pending_approval');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getActiveTasks = () => {
    switch(activeTab) {
      case 'planned': return plannedTasks;
      case 'ongoing': return ongoingTasks;
      case 'pending_approval': return reviewTasks;
      case 'completed': return completedTasks;
      default: return [];
    }
  };

  const activeTasksList = getActiveTasks();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header & Search */}
      <div className="portal-section-header">
        <h2 className="portal-section-title">Task Management</h2>
        
        <div className="portal-search-wrapper">
          <input 
            type="text" 
            placeholder="Search tasks, goods, or contacts..." 
            value={searchQuery}
            onChange={handleSearch}
            className="portal-input"
            style={{ width: '300px' }}
          />
          <button 
            onClick={handlePrintSection} 
            className="portal-btn portal-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} /> Print Section
          </button>
          <button onClick={openCreateModal} className="portal-btn portal-btn-primary">
            + New Task
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="portal-tabs-container">
        <button 
          onClick={() => setActiveTab('planned')}
          className={`portal-tab-btn ${activeTab === 'planned' ? 'active' : ''}`}
        >
          PLANNED <span className="portal-tab-count">{plannedTasks.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('ongoing')}
          className={`portal-tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
        >
          ONGOING <span className="portal-tab-count">{ongoingTasks.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('pending_approval')}
          className={`portal-tab-btn ${activeTab === 'pending_approval' ? 'active' : ''}`}
        >
          PENDING REVIEW <span className="portal-tab-count">{reviewTasks.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`portal-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          COMPLETED <span className="portal-tab-count">{completedTasks.length}</span>
        </button>
      </div>

      {/* Vertical List Format */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {activeTasksList.length === 0 ? (
          <div className="portal-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--portal-text-muted)' }}>
            No tasks found in this section.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTasksList.map(t => (
              <TaskCard key={t.id} task={t} onStatusChange={updateStatus} onEdit={openEditModal} role={user.role} />
            ))}
          </div>
        )}
      </div>

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="portal-modal-close">&times;</button>
            </div>
            
            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Task Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Assign To</label>
                  <select value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} className="portal-input">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="portal-form-group">
                  <label className="portal-label">Priority</label>
                  <select value={formData.priority_rank} onChange={e => setFormData({...formData, priority_rank: e.target.value})} className="portal-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Deadline</label>
                  <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="portal-input" />
                </div>
                <div className="portal-form-group">
                  <label className="portal-label">Fee Paid (Rs)</label>
                  <input type="number" step="0.01" value={formData.fee_paid} onChange={e => setFormData({...formData, fee_paid: e.target.value})} className="portal-input" />
                </div>
              </div>

              <div className="portal-form-group">
                <label className="portal-label">Goods Details</label>
                <input type="text" placeholder="e.g., 20ft Container, Electronics" value={formData.goods_details} onChange={e => setFormData({...formData, goods_details: e.target.value})} className="portal-input" />
              </div>

              <div className="portal-form-group">
                <label className="portal-label">Client Contact Number</label>
                <input type="text" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} className="portal-input" />
              </div>

              <div className="portal-form-group">
                <label className="portal-label">Internal Notes</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="portal-input" style={{ resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="portal-btn portal-btn-secondary">Cancel</button>
                <button type="submit" className="portal-btn portal-btn-primary">{isEditMode ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
