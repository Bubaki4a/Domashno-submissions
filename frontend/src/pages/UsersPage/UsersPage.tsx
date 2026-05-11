import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { User } from '../../domain/entities/User/User';
import './UsersPage.css';

const ROLES: User['role'][] = ['administrator', 'manager', 'operator'];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('operator');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await apiService.getUsers();
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiService.createUser({
        email: formEmail.trim(),
        password: formPassword,
        name: formName.trim() || formEmail.trim(),
        role: formRole,
      });
      setFormEmail('');
      setFormPassword('');
      setFormName('');
      setFormRole('operator');
      setFormOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel: Record<User['role'], string> = {
    administrator: 'Administrator',
    manager: 'Manager',
    operator: 'Operator',
  };

  return (
    <div className="users-page">
      <div className="users-page-header">
        <h1>Users</h1>
        <button type="button" className="users-add-btn" onClick={() => setFormOpen(true)}>
          + New user
        </button>
      </div>
      {error && <div className="users-error">{error}</div>}
      {loading ? (
        <p className="users-loading">Loading...</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{roleLabel[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {formOpen && (
        <div className="users-modal" onClick={() => setFormOpen(false)}>
          <div className="users-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New user</h2>
            <form onSubmit={handleCreate}>
              <label>
                Email *
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <label>
                Password *
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  minLength={1}
                  disabled={submitting}
                />
              </label>
              <label>
                Name
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Optional"
                  disabled={submitting}
                />
              </label>
              <label>
                Role
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as User['role'])}
                  disabled={submitting}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel[r]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="users-modal-actions">
                <button type="button" onClick={() => setFormOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
