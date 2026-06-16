import React, { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setUsers(await res.json());
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ username, password, role })
    });
    
    if (res.ok) {
      setUsername('');
      setPassword('');
      setRole('staff');
      fetchUsers();
    } else {
      const data = await res.json();
      setError(data.message || 'Error creating user');
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) fetchUsers();
  };

  return (
    <div>
      <h2 className="portal-section-title" style={{ marginBottom: '24px' }}>User & Role Management</h2>

      <form onSubmit={createUser} className="portal-card" style={{ marginBottom: '32px', maxWidth: '600px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--portal-text-primary)' }}>Create New Portal User</h3>
        {error && <div className="portal-alert-error">{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="portal-form-group" style={{ marginBottom: 0 }}>
            <label className="portal-label">Username</label>
            <input 
              type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} required
              className="portal-input"
            />
          </div>
          <div className="portal-form-group" style={{ marginBottom: 0 }}>
            <label className="portal-label">Password</label>
            <input 
              type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required
              className="portal-input"
            />
          </div>
          <div className="portal-form-group" style={{ marginBottom: 0 }}>
            <label className="portal-label">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="portal-input">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <button type="submit" className="portal-btn portal-btn-primary" style={{ padding: '12px', marginTop: '8px' }}>
            Create User
          </button>
        </div>
      </form>

      <div className="portal-table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: '600', color: 'var(--portal-text-primary)' }}>{u.username}</td>
                <td>
                  <span className={`portal-role-badge portal-role-${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.username !== 'admin' && (
                    <button onClick={() => deleteUser(u.id)} className="portal-btn portal-btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
