import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, AlertCircle, Pizza, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setRequiresVerification(false);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
      if (err.message?.toLowerCase().includes('verify') || err.message?.toLowerCase().includes('verification')) {
        setRequiresVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendStatus('Sending verification link...');
      const res = await apiClient.post('/auth/resend-verification', { email });
      setResendStatus(res.message || 'Verification link dispatched successfully!');
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification link.');
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '4px' }}>
            {t('auth.loginTitle')}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
            {t('auth.loginSubtitle')}
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
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {requiresVerification && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#1e40af', marginBottom: '8px' }}>
              Your account email requires verification before login.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              {t('auth.resendVerification')}
            </button>
            {resendStatus && (
              <p style={{ marginTop: '8px', color: '#16a34a', fontWeight: 600 }}>{resendStatus}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">{t('auth.password')}</label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '12px' }}
          >
            {loading ? 'Authenticating...' : t('auth.loginButton')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
