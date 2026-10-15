import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Pizza,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneCountryInput from '../components/PhoneCountryInput';
import apiClient from '../api/apiClient';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: 'phone' or 'email'
  const [loginMode, setLoginMode] = useState('phone');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('slicecraft_saved_phone') || '');
  const [dialCode, setDialCode] = useState(() => localStorage.getItem('slicecraft_saved_dial') || '+91');
  const [countryCode, setCountryCode] = useState('IN');

  // Email state
  const [email, setEmail] = useState(() => localStorage.getItem('slicecraft_saved_email') || '');

  // Password & UI states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [resending, setResending] = useState(false);

  // Sync remembered credentials on change
  useEffect(() => {
    if (rememberMe) {
      if (loginMode === 'phone' && phoneNumber) {
        localStorage.setItem('slicecraft_saved_phone', phoneNumber);
        localStorage.setItem('slicecraft_saved_dial', dialCode);
      } else if (loginMode === 'email' && email) {
        localStorage.setItem('slicecraft_saved_email', email);
      }
    }
  }, [rememberMe, loginMode, phoneNumber, dialCode, email]);

  const handlePhoneChange = ({ phoneNumber: num, dialCode: dial, countryCode: cc }) => {
    setPhoneNumber(num);
    setDialCode(dial);
    setCountryCode(cc);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setRequiresVerification(false);

    // Basic frontend validations
    if (loginMode === 'phone') {
      if (!phoneNumber || phoneNumber.length < 6) {
        setError('Please enter a valid mobile phone number.');
        return;
      }
    } else {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      let credentials;
      if (loginMode === 'phone') {
        credentials = {
          phone: phoneNumber,
          countryCode: dialCode,
          identifier: `${dialCode}${phoneNumber}`,
          password,
        };
      } else {
        credentials = {
          email: email.trim().toLowerCase(),
          identifier: email.trim().toLowerCase(),
          password,
        };
      }

      const res = await login(credentials);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      if (err.message?.toLowerCase().includes('verify') || err.message?.toLowerCase().includes('verification')) {
        setRequiresVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      setResendStatus('Sending verification link...');
      const targetEmail = email || 'customer@slicecraftpizza.com';
      const res = await apiClient.post('/auth/resend-verification', { email: targetEmail });
      setResendStatus(res.message || 'Verification link dispatched successfully!');
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  };


  return (
    <div
      className="container"
      style={{
        padding: '50px 20px',
        maxWidth: '460px',
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        className="card"
        style={{
          padding: '36px 30px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0,0,0,0.04)',
          borderRadius: '18px',
          border: '1px solid #f1f5f9',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative top bar */}
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

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
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
              marginBottom: '14px',
              boxShadow: '0 8px 18px rgba(214, 40, 40, 0.35)',
            }}
          >
            <Pizza size={30} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-dark, #0f172a)',
              marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            {t('auth.loginTitle', 'Welcome Back')}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {t('auth.loginSubtitle', 'Sign in to track orders, save favorites & enjoy hot pizza')}
          </p>
        </div>

        {/* Advance Dual-Mode Interactive Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '22px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setError(null);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: loginMode === 'phone' ? 700 : 500,
              color: loginMode === 'phone' ? '#0f172a' : '#64748b',
              backgroundColor: loginMode === 'phone' ? '#ffffff' : 'transparent',
              boxShadow: loginMode === 'phone' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Phone size={16} color={loginMode === 'phone' ? 'var(--color-primary, #d62828)' : '#64748b'} />
            <span>Mobile Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setError(null);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: loginMode === 'email' ? 700 : 500,
              color: loginMode === 'email' ? '#0f172a' : '#64748b',
              backgroundColor: loginMode === 'email' ? '#ffffff' : 'transparent',
              boxShadow: loginMode === 'email' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Mail size={16} color={loginMode === 'email' ? 'var(--color-primary, #d62828)' : '#64748b'} />
            <span>Email Address</span>
          </button>
        </div>

        {/* Error Notification Banner */}
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
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'shake 0.3s ease-in-out',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
            <div style={{ flex: 1, lineHeight: 1.4 }}>{error}</div>
          </div>
        )}

        {/* Unverified Account Banner */}
        {requiresVerification && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '14px',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#1e40af', marginBottom: '8px', fontWeight: 500 }}>
              Your account email requires verification before logging in.
            </p>
            <button
              type="button"
              disabled={resending}
              onClick={handleResendVerification}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #d62828)',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {resending ? 'Sending email...' : t('auth.resendVerification', 'Resend Verification Email')}
            </button>
            {resendStatus && (
              <p style={{ marginTop: '8px', color: '#16a34a', fontWeight: 600 }}>{resendStatus}</p>
            )}
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit}>
          {/* TAB 1: Mobile Phone Number Input with Fixed Country Code */}
          {loginMode === 'phone' ? (
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                <span>Mobile Phone Number *</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>
                  Select world country code
                </span>
              </label>

              <PhoneCountryInput
                id="login-phone"
                value={phoneNumber}
                selectedDialCode={dialCode}
                onChange={handlePhoneChange}
                required
                autoFocus
              />
            </div>
          ) : (
            /* TAB 2: Email Address Input */
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label
                className="form-label"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                {t('auth.email', 'Email Address *')}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', top: '13px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="form-control"
                  style={{
                    paddingLeft: '38px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.94rem',
                  }}
                  placeholder="name@example.com"
                />
              </div>
            </div>
          )}

          {/* Password Input with Show/Hide Eye Toggle */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                {t('auth.password', 'Password *')}
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.78rem', color: 'var(--color-primary, #d62828)', fontWeight: 600, textDecoration: 'none' }}
              >
                {t('auth.forgotPassword', 'Forgot Password?')}
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', top: '13px', left: '12px', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="form-control"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '40px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.94rem',
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: '#475569',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary, #d62828)', cursor: 'pointer' }}
              />
              <span>Remember my login details</span>
            </label>
          </div>

          {/* Submit Button */}
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
              backgroundColor: 'var(--color-primary, #d62828)',
              border: 'none',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(214, 40, 40, 0.35)',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{loginMode === 'phone' ? 'Sign In with Mobile' : t('auth.loginButton', 'Sign In')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>


        {/* Footer Navigation Link */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          {t('auth.noAccount', "Don't have an account yet?")}{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-primary, #d62828)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {t('nav.register', 'Create Account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
