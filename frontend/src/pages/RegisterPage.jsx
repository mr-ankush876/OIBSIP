import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Pizza,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PhoneCountryInput from '../components/PhoneCountryInput';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import apiClient from '../api/apiClient';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Instant verification upon registration states
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [verifyingInstant, setVerifyingInstant] = useState(false);
  const [instantVerified, setInstantVerified] = useState(false);
  const [instantVerifyMsg, setInstantVerifyMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handlePhoneChange = ({ phoneNumber, dialCode: dial }) => {
    setPhone(phoneNumber);
    setDialCode(dial);
    if (error) setError(null);
  };

  const handlePasswordKeyDown = (e) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
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
        phone,
        countryCode: dialCode,
        preferredLanguage: currentLanguage,
      });

      if (res.success) {
        setRegisteredEmail(formData.email);
        if (res.verificationToken) setVerificationToken(res.verificationToken);
        if (res.verificationLink) setVerificationLink(res.verificationLink);
        setRegisteredSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    try {
      setVerifyingInstant(true);
      setInstantVerifyMsg(null);

      const res = await apiClient.post('/auth/verify-direct', {
        email: registeredEmail,
        token: verificationToken,
      });

      if (res.success) {
        setInstantVerified(true);
        setInstantVerifyMsg(res.message || 'Account activated successfully!');
      }
    } catch (err) {
      setInstantVerifyMsg(err.message || 'Failed to activate account. You can log in and click verify.');
    } finally {
      setVerifyingInstant(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 20px', maxWidth: '480px' }}>
      <div
        className="card"
        style={{
          padding: '36px 30px',
          borderRadius: '18px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #d62828 0%, #f77f00 50%, #fcbf49 100%)',
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--color-primary, #d62828)',
              color: '#fff',
              borderRadius: '16px',
              marginBottom: '12px',
              boxShadow: '0 8px 18px rgba(214, 40, 40, 0.35)',
            }}
          >
            <Pizza size={30} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '4px' }}>
            {t('auth.registerTitle', 'Create Your Account')}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {t('auth.registerSubtitle', 'Join SliceCraft for exclusive artisan pizzas and rapid delivery')}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
            <span>{error}</span>
          </div>
        )}

        {registeredSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ color: '#16a34a', marginBottom: '14px' }}>
              <CheckCircle2 size={54} style={{ margin: '0 auto' }} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
              {instantVerified ? 'Account Verified & Ready!' : 'Check Your Inbox!'}
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
              {instantVerified ? (
                <>Your account <strong>{registeredEmail}</strong> is fully verified. You can now log in directly!</>
              ) : (
                <>We dispatched a verification email to <strong>{registeredEmail}</strong>. You can verify through your email or activate immediately below.</>
              )}
            </p>

            {/* Instant 1-Click Verification Action */}
            {!instantVerified && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.92rem', marginBottom: '6px' }}>
                  Testing or Waiting for Email?
                </div>
                <p style={{ fontSize: '0.82rem', color: '#3b82f6', marginBottom: '12px' }}>
                  Click below to instantly activate your account with 1-click verification.
                </p>
                <button
                  type="button"
                  disabled={verifyingInstant}
                  onClick={handleInstantVerify}
                  style={{
                    width: '100%',
                    padding: '11px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: verifyingInstant ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <Zap size={16} />
                  <span>{verifyingInstant ? 'Activating Account...' : '⚡ Verify & Activate Account Now'}</span>
                </button>
              </div>
            )}

            {instantVerifyMsg && (
              <p
                style={{
                  fontSize: '0.84rem',
                  color: instantVerified ? '#16a34a' : '#dc2626',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {instantVerifyMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Proceed to Login</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                {t('auth.name', 'Full Name *')}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '42px', borderRadius: '8px' }}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                {t('auth.email', 'Email Address *')}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '42px', borderRadius: '8px' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <span>Mobile Phone Number</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>Optional</span>
              </label>
              <PhoneCountryInput
                id="register-phone"
                value={phone}
                selectedDialCode={dialCode}
                onChange={handlePhoneChange}
              />
            </div>

            {/* Password Section with Strong Password Features */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                  {t('auth.password', 'Password *')}
                </label>
                {isCapsLockOn && (
                  <span style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 600 }}>
                    ⚠️ Caps Lock is ON
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onKeyDown={handlePasswordKeyDown}
                  onKeyUp={handlePasswordKeyDown}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px', height: '42px', borderRadius: '8px' }}
                  placeholder="At least 6 characters (8+ recommended)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time Password Strength Meter & Security Checklist */}
              <PasswordStrengthMeter
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                showCriteria={true}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                {t('auth.confirmPassword', 'Confirm Password *')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onKeyDown={handlePasswordKeyDown}
                  onKeyUp={handlePasswordKeyDown}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px', height: '42px', borderRadius: '8px' }}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '10px',
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? t('common.loading', 'Creating Account...') : t('auth.registerButton', 'Sign Up')}
            </button>
          </form>
        )}

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          {t('auth.haveAccount', 'Already have an account?')}{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--color-primary, #d62828)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {t('nav.login', 'Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
