import React from 'react';

export default function TaskCard({ task, onStatusChange, onEdit, role }) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
  
  const priorityColors = {
    urgent: { bg: '#fef2f2', text: '#ef4444', border: '#fca5a5' },
    high: { bg: '#fff7ed', text: '#f97316', border: '#fdba74' },
    medium: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
    low: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
  };
  
  const pColor = priorityColors[task.priority_rank || 'medium'];

  return (
    <div className={`portal-task-card ${isOverdue ? 'portal-task-card-overdue' : ''}`}>
      {/* Left priority color bar indicator */}
      <div 
        className="portal-task-indicator" 
        style={{ backgroundColor: pColor.text }}
      />
      
      {/* Title and Priority */}
      <div className="portal-task-main">
        <div className="portal-task-title">
          <h4 style={{ margin: 0, color: 'var(--portal-text-primary)', fontSize: '15px', fontWeight: '600' }}>{task.title}</h4>
          {isOverdue && (
            <span className="portal-badge-overdue">
              Overdue
            </span>
          )}
        </div>
        <div className="portal-task-goods">
          {task.goods_details || 'No goods specified'}
        </div>
      </div>

      {/* Details Columns */}
      <div className="portal-task-details-grid">
        <div className="portal-task-meta-col">
          <span className="portal-task-meta-label">Assignee</span>
          <span className="portal-task-meta-value">{task.assigned_to_username || 'Unassigned'}</span>
        </div>

        <div className="portal-task-meta-col">
          <span className="portal-task-meta-label">Deadline</span>
          <span 
            className="portal-task-meta-value" 
            style={{ color: isOverdue ? 'var(--portal-danger)' : 'var(--portal-text-primary)', fontWeight: isOverdue ? '600' : '500' }}
          >
            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <div className="portal-task-meta-col">
          <span className="portal-task-meta-label">Contact</span>
          <span className="portal-task-meta-value">{task.contact_number || 'N/A'}</span>
        </div>

        <div className="portal-task-meta-col">
          <span className="portal-task-meta-label">Fee</span>
          <span className="portal-task-meta-value" style={{ color: 'var(--portal-success)', fontWeight: '600' }}>
            Rs. {task.fee_paid}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="portal-task-actions">
        {task.status === 'planned' && (
          <button 
            onClick={() => onStatusChange(task.id, 'ongoing')} 
            className="portal-btn portal-btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Start Work
          </button>
        )}
        
        {task.status === 'ongoing' && (
          <button 
            onClick={() => onStatusChange(task.id, role === 'staff' ? 'pending_approval' : 'completed')} 
            className="portal-btn portal-btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {role === 'staff' ? 'Submit for Approval' : 'Mark Completed'}
          </button>
        )}

        {task.status === 'pending_approval' && (role === 'admin' || role === 'manager') && (
          <button 
            onClick={() => onStatusChange(task.id, 'completed')} 
            className="portal-btn portal-btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Verify & Complete
          </button>
        )}

        {/* Admin Controls */}
        {(role === 'admin' || role === 'manager') && (
          <>
            {task.status !== 'planned' && (
              <button 
                onClick={() => onStatusChange(task.id, 'planned')} 
                className="portal-btn portal-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Revert
              </button>
            )}
            <button 
              onClick={() => onEdit(task)} 
              className="portal-btn portal-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              ✏️ Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
