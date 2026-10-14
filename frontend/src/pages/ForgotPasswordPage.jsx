import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Pizza } from 'lucide-react';
import apiClient from '../api/apiClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch password reset request.');
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
            Reset Password
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
            Enter your email to receive password reset instructions
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

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ color: '#16a34a', marginBottom: '14px' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
              Check Your Email
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              If an account is registered with <strong>{email}</strong>, we have dispatched a secure password reset link. Please check your inbox and spam folder.
            </p>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            Remembered your password? Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
