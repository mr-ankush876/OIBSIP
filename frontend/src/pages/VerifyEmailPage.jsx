import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Mail, Zap, RefreshCw } from 'lucide-react';
import apiClient from '../api/apiClient';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam || '');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [directActivating, setDirectActivating] = useState(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!token && !emailParam) {
        setStatus('error');
        setMessage('No verification token or email provided in the URL.');
        return;
      }

      try {
        const query = token ? `token=${token}` : `email=${encodeURIComponent(emailParam)}`;
        const res = await apiClient.get(`/auth/verify-email?${query}`);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Your email has been verified successfully!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or has expired.');
      }
    };

    performVerification();
  }, [token, emailParam]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendMessage('');

    try {
      const res = await apiClient.post('/auth/resend-verification', { email: resendEmail });
      setResendMessage(res.message || 'A new verification link has been sent to your email.');
    } catch (err) {
      setResendMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleDirectActivate = async () => {
    if (!resendEmail) return;
    setDirectActivating(true);
    setResendMessage('');

    try {
      const res = await apiClient.post('/auth/verify-direct', { email: resendEmail });
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Account activated successfully!');
      }
    } catch (err) {
      setResendMessage(err.message || 'Failed to activate account.');
    } finally {
      setDirectActivating(false);
    }
  };

  return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: '480px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px 28px', borderRadius: '18px' }}>
        {status === 'verifying' && (
          <div>
            <div className="spinner"></div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '20px' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>
              Please wait while we validate your activation token.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ color: '#16a34a', marginBottom: '16px' }}>
              <CheckCircle2 size={56} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
              Account Verified!
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '28px' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px' }}>
              Proceed to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ color: 'var(--color-danger, #dc2626)', marginBottom: '16px' }}>
              <XCircle size={56} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
              Verification Needed
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              {message}
            </p>

            {/* Direct Instant Activation & Resend Form */}
            <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-dark)' }}>
                Activate Account Directly or Request Link
              </h4>
              <form onSubmit={handleResend}>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Mail size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '36px', fontSize: '0.88rem', height: '40px', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={directActivating || !resendEmail}
                    onClick={handleDirectActivate}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Zap size={15} />
                    <span>{directActivating ? 'Activating...' : '⚡ Instant Verify & Activate Now'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={resending || !resendEmail}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '9px',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
                  </button>
                </div>
              </form>

              {resendMessage && (
                <p style={{ fontSize: '0.82rem', color: '#16a34a', marginTop: '10px', fontWeight: 600 }}>
                  {resendMessage}
                </p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--color-primary, #d62828)', fontWeight: 600 }}>
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
