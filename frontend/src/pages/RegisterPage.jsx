import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, User, AlertCircle, Pizza, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { currentLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        ...formData,
        preferredLanguage: currentLanguage,
      });

      if (res.success) {
        setRegisteredSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '460px' }}>
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
            {t('auth.registerTitle')}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
            {t('auth.registerSubtitle')}
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

        {registeredSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: '#16a34a', marginBottom: '14px' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
              Check Your Inbox!
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              We have sent an email verification link to <strong>{formData.email}</strong>. Please click the link to activate your account and start ordering.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.name')} *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.email')} *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password')} *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword')} *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '12px' }}
            >
              {loading ? 'Creating Account...' : t('auth.registerButton')}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
