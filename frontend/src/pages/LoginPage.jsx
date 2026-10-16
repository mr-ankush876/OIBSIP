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
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneCountryInput from '../components/PhoneCountryInput';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import apiClient from '../api/apiClient';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: 'phone' or 'email'
  const [loginMode, setLoginMode] = useState('email');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('slicecraft_saved_phone') || '');
  const [dialCode, setDialCode] = useState(() => localStorage.getItem('slicecraft_saved_dial') || '+91');
  const [countryCode, setCountryCode] = useState('IN');

  // Email state
  const [email, setEmail] = useState(() => localStorage.getItem('slicecraft_saved_email') || '');

  // Password & UI states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Email verification states
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [verifyingDirect, setVerifyingDirect] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

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

  const handlePasswordKeyDown = (e) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setVerificationMsg(null);
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
      const isUnverified =
        err.data?.requiresVerification ||
        err.message?.toLowerCase().includes('verify') ||
        err.message?.toLowerCase().includes('verification');

      if (isUnverified) {
        setRequiresVerification(true);
        const resolvedEmail = err.data?.email || (loginMode === 'email' ? email.trim() : '');
        setUnverifiedEmail(resolvedEmail);
        if (err.data?.verificationToken) setVerificationToken(err.data.verificationToken);
        if (err.data?.verificationLink) setVerificationLink(err.data.verificationLink);
        setError(null); // Keep card clean and non-duplicated
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Verification Handler
  const handleDirectVerify = async () => {
    try {
      setVerifyingDirect(true);
      setVerificationMsg(null);
      const targetEmail = unverifiedEmail || email || (loginMode === 'email' ? email.trim() : '');

      const res = await apiClient.post('/auth/verify-direct', {
        email: targetEmail,
        token: verificationToken,
      });

      if (res.success) {
        setVerificationSuccess(true);
        setRequiresVerification(false);
        setError(null);
        setVerificationMsg(res.message || 'Account verified successfully! You can now log in.');
      }
    } catch (err) {
      setVerificationMsg(err.message || 'Failed to verify account. Please try requesting a new link.');
    } finally {
      setVerifyingDirect(false);
    }
  };

  // Resend Verification Email Handler
  const handleResendVerification = async () => {
    try {
      setResending(true);
      setResendStatus('Sending verification link...');
      const targetEmail = unverifiedEmail || email || 'customer@slicecraftpizza.com';
      const res = await apiClient.post('/auth/resend-verification', { email: targetEmail });

      if (res.verificationToken) setVerificationToken(res.verificationToken);
      if (res.verificationLink) setVerificationLink(res.verificationLink);

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
        {/* Decorative top bar */}
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
            {t('auth.loginSubtitle', 'Log in to track orders, save favorites, and enjoy hot pizza')}
          </p>
        </div>

        {/* Dual-Mode Interactive Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '20px',
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

        {/* Verification Success Celebration Banner */}
        {verificationSuccess && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <CheckCircle2 size={24} style={{ color: '#059669', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.92rem' }}>
                Account Verified Successfully!
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '2px' }}>
                {verificationMsg || 'You can now sign in with your email and password.'}
              </div>
            </div>
          </div>
        )}

        {/* Generic Error Banner (Only shown if NOT an unverified email notice) */}
        {error && !requiresVerification && (
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

        {/* Unified Email Verification Required Card */}
        {requiresVerification && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                marginBottom: '8px',
              }}
            >
              <Mail size={20} />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
              Email Verification Required
            </h3>

            <p style={{ fontSize: '0.84rem', color: '#3b82f6', marginBottom: '12px', lineHeight: 1.4 }}>
              Account <strong>{unverifiedEmail || email || 'associated with this login'}</strong> is awaiting verification.
            </p>

            {/* Action 1: Instant 1-Click Verification */}
            <button
              type="button"
              disabled={verifyingDirect}
              onClick={handleDirectVerify}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: verifyingDirect ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={16} />
              <span>{verifyingDirect ? 'Verifying Account...' : '⚡ Verify Account Now (1-Click)'}</span>
            </button>

            {/* Action 2: Resend Verification Email (Typo Fixed!) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                disabled={resending}
                onClick={handleResendVerification}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #d62828)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textDecoration: 'underline',
                  cursor: resending ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={13} className={resending ? 'spin' : ''} />
                <span>{resending ? 'Sending Email...' : 'Resend Verification Email'}</span>
              </button>

              {verificationLink && (
                <a
                  href={verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open Link</span>
                </a>
              )}
            </div>

            {resendStatus && (
              <p style={{ marginTop: '8px', color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                {resendStatus}
              </p>
            )}

            {verificationMsg && !verificationSuccess && (
              <p style={{ marginTop: '8px', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>
                {verificationMsg}
              </p>
            )}
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit}>
          {/* TAB 1: Mobile Phone Number Input */}
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

          {/* Password Section with Eye Toggle, Caps Lock Alert, and Strength Assistant */}
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
                onKeyDown={handlePasswordKeyDown}
                onKeyUp={handlePasswordKeyDown}
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
                  border: isCapsLockOn ? '1px solid #f59e0b' : '1px solid #cbd5e1',
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

            {/* Caps Lock Warning Badge */}
            {isCapsLockOn && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#b45309',
                  backgroundColor: '#fef3c7',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <span>⚠️ Caps Lock is active</span>
              </div>
            )}

            {/* Optional Password Security Requirements Assistant */}
            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowPasswordGuide(!showPasswordGuide)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.74rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <ShieldCheck size={12} color="#64748b" />
                <span>{showPasswordGuide ? 'Hide password strength helper' : 'Password security helper'}</span>
              </button>
            </div>

            {showPasswordGuide && (
              <PasswordStrengthMeter password={password} showCriteria={true} />
            )}
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
