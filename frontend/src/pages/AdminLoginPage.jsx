import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Phone, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneCountryInput from '../components/PhoneCountryInput';

const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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

      const res = await adminLogin(credentials);
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
    <div className="container" style={{ padding: '60px 20px', maxWidth: '460px' }}>
      <div
        className="card"
        style={{
          padding: '36px 30px',
          borderRadius: '18px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
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
            backgroundColor: '#111827',
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
              backgroundColor: '#111827',
              color: '#f8fafc',
              borderRadius: '16px',
              marginBottom: '12px',
              boxShadow: '0 8px 18px rgba(17, 24, 39, 0.3)',
            }}
          >
            <ShieldCheck size={32} color="#f87171" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '4px' }}>
            Store Administrator Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Restricted access for kitchen and inventory operations
          </p>
        </div>

        {/* Tab switch */}
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
              setLoginMode('email');
              setError(null);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: loginMode === 'email' ? 700 : 500,
              color: loginMode === 'email' ? '#0f172a' : '#64748b',
              backgroundColor: loginMode === 'email' ? '#ffffff' : 'transparent',
              boxShadow: loginMode === 'email' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Mail size={15} />
            <span>Admin Email</span>
          </button>

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
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: loginMode === 'phone' ? 700 : 500,
              color: loginMode === 'phone' ? '#0f172a' : '#64748b',
              backgroundColor: loginMode === 'phone' ? '#ffffff' : 'transparent',
              boxShadow: loginMode === 'phone' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Phone size={15} />
            <span>Admin Mobile</span>
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loginMode === 'email' ? (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                Administrator Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '42px', borderRadius: '8px' }}
                  placeholder="kankush1907@gmail.com"
                />
              </div>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                Administrator Mobile Number *
              </label>
              <PhoneCountryInput
                id="admin-phone"
                value={phoneNumber}
                selectedDialCode={dialCode}
                onChange={({ phoneNumber: num, dialCode: dial }) => {
                  setPhoneNumber(num);
                  setDialCode(dial);
                }}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
              Security Key / Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '38px', height: '42px', borderRadius: '8px' }}
                placeholder="••••••••••••"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              backgroundColor: '#111827',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Authenticating Admin...' : 'Authenticate as Admin'}
            <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLoginPage;
