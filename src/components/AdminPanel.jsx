import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const API = import.meta.env.VITE_API_URL;
  // Check session
  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Fetch appointments once authenticated
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    axios
      .get(`${API}/api/appointments`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('Error fetching appointments:', err))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API}/api/admin/login`, loginData);
      if (res.data.success) {
        sessionStorage.setItem('admin_auth', 'true');
        setAuthenticated(true);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await axios.delete(`${API}/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const q = search.toLowerCase();
    return (
      apt.patient_name.toLowerCase().includes(q) ||
      apt.email.toLowerCase().includes(q) ||
      apt.dentist_name.toLowerCase().includes(q) ||
      apt.clinic_name.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // ——— Login Screen ———
  if (!authenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon">🔒</div>
            <h2>Admin Access</h2>
            <p>Sign in to manage appointments</p>
          </div>
          <div className="auth-card-body">
            {loginError && <div className="auth-error">{loginError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-username">Username</label>
                <input
                  className="form-input"
                  type="text"
                  id="admin-username"
                  placeholder="Enter username"
                  value={loginData.username}
                  onChange={(e) => setLoginData((p) => ({ ...p, username: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="admin-password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                id="admin-login-btn"
                disabled={loggingIn}
                style={{ marginTop: 8 }}
              >
                {loggingIn ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ——— Appointments Dashboard ———
  return (
    <div className="container admin-page">
      <div className="admin-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1>Appointments</h1>
          <span className="admin-count">{appointments.length} total</span>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout}>
          Logout →
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="search-appointments"
            placeholder="Search patients, dentists, clinics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {['Patient', 'Email', 'Age', 'Gender', 'Date', 'Dentist', 'Clinic', 'Status', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ width: `${50 + Math.random() * 40}%`, height: 14 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>
            {search
              ? 'No appointments match your search.'
              : "No appointments yet. They will appear here once patients book."}
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Date</th>
                <th>Dentist</th>
                <th>Clinic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="table-cell-primary">{apt.patient_name}</td>
                  <td>{apt.email}</td>
                  <td>{apt.age}</td>
                  <td>
                    <span className={`badge badge-${(apt.gender || '').toLowerCase()}`}>
                      {apt.gender}
                    </span>
                  </td>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td className="table-cell-accent">{apt.dentist_name}</td>
                  <td>{apt.clinic_name}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '12px', minWidth: '100px' }}
                      value={apt.status || 'Scheduled'}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDelete(apt.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
