import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '36px 28px', borderTop: '4px solid var(--color-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: '#111827',
            color: '#f8fafc',
            borderRadius: '16px',
            marginBottom: '12px',
          }}>
            <ShieldCheck size={32} color="#f87171" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '4px' }}>
            Store Administrator Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            Restricted access for kitchen and inventory operations
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="kankush1907@gmail.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Security Key / Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '12px', backgroundColor: '#111827' }}
          >
            {loading ? 'Authenticating Admin...' : 'Authenticate as Admin'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
          Configured Administrator Credentials:<br/>
          <code>kankush1907@gmail.com</code> / <code>Ankush143@</code>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
