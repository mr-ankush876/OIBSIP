import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Mail } from 'lucide-react';
import apiClient from '../api/apiClient';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in the URL.');
        return;
      }

      try {
        const res = await apiClient.get(`/auth/verify-email?token=${token}`);
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
  }, [token]);

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

  return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: '480px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px 28px' }}>
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
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Proceed to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>
              <XCircle size={56} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              {message}
            </p>

            {/* Resend Verification Form */}
            <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-dark)' }}>
                Request New Verification Link
              </h4>
              <form onSubmit={handleResend}>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Mail size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
                >
                  {resending ? 'Sending...' : 'Resend Email'}
                </button>
              </form>
              {resendMessage && (
                <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '8px', fontWeight: 600 }}>
                  {resendMessage}
                </p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
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
