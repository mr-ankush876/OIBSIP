import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Pizza } from 'lucide-react';
import apiClient from '../api/apiClient';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing from the link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.put('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });

      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '14px',
            marginBottom: '12px',
          }}>
            <Pizza size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '4px' }}>
            Choose New Password
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
            Set a new secure password for your SliceCraft account
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ color: '#16a34a', marginBottom: '14px' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Password Reset Complete!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              Your password has been securely updated. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
