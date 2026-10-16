import React from 'react';
import { Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export const calculatePasswordStrength = (password = '') => {
  const criteria = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };

  const metCount = Object.values(criteria).filter(Boolean).length;

  let strength = {
    score: 0,
    label: 'Too Weak',
    color: '#94a3b8',
    activeBars: 0,
    bgBadge: '#f1f5f9',
    textBadge: '#64748b',
  };

  if (!password) {
    return { ...criteria, metCount: 0, strength };
  }

  if (metCount <= 2) {
    strength = {
      score: 1,
      label: 'Weak',
      color: '#ef4444',
      activeBars: 1,
      bgBadge: '#fee2e2',
      textBadge: '#b91c1c',
    };
  } else if (metCount === 3) {
    strength = {
      score: 2,
      label: 'Fair',
      color: '#f97316',
      activeBars: 2,
      bgBadge: '#ffedd5',
      textBadge: '#c2410c',
    };
  } else if (metCount === 4) {
    strength = {
      score: 3,
      label: 'Good',
      color: '#eab308',
      activeBars: 3,
      bgBadge: '#fef9c3',
      textBadge: '#a16207',
    };
  } else if (metCount === 5) {
    strength = {
      score: 4,
      label: 'Strong',
      color: '#10b981',
      activeBars: 4,
      bgBadge: '#d1fae5',
      textBadge: '#047857',
    };
  }

  return { ...criteria, metCount, strength };
};

const PasswordStrengthMeter = ({
  password = '',
  confirmPassword = undefined,
  showCriteria = true,
}) => {
  const { length, hasLower, hasUpper, hasNumber, hasSpecial, strength } =
    calculatePasswordStrength(password);

  const isConfirmed = confirmPassword !== undefined && confirmPassword.length > 0;
  const isMatch = isConfirmed && password === confirmPassword;

  if (!password && confirmPassword === undefined) {
    return null;
  }

  const checklist = [
    { label: 'At least 8 characters', met: length },
    { label: 'One uppercase letter (A-Z)', met: hasUpper },
    { label: 'One lowercase letter (a-z)', met: hasLower },
    { label: 'One number (0-9)', met: hasNumber },
    { label: 'One special symbol (@, #, $, %, etc.)', met: hasSpecial },
  ];

  return (
    <div
      style={{
        marginTop: '10px',
        padding: '12px 14px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '0.82rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Strength Header with 4-Segment Bar */}
      {password.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              {strength.score >= 4 ? (
                <ShieldCheck size={15} color="#10b981" />
              ) : strength.score >= 2 ? (
                <Shield size={15} color={strength.color} />
              ) : (
                <ShieldAlert size={15} color="#ef4444" />
              )}
              Password Strength:
            </span>
            <span
              style={{
                backgroundColor: strength.bgBadge,
                color: strength.textBadge,
                fontWeight: 700,
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.02em',
              }}
            >
              {strength.label}
            </span>
          </div>

          {/* 4 Segment Progress Bar */}
          <div style={{ display: 'flex', gap: '4px', height: '5px' }}>
            {[1, 2, 3, 4].map((barIndex) => (
              <div
                key={barIndex}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '3px',
                  backgroundColor:
                    barIndex <= strength.activeBars ? strength.color : '#e2e8f0',
                  transition: 'background-color 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Security Criteria Checklist */}
      {showCriteria && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '6px 12px',
            marginTop: '8px',
            paddingTop: password.length > 0 ? '8px' : '0',
            borderTop: password.length > 0 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          {checklist.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                color: item.met ? '#0f766e' : '#64748b',
                fontWeight: item.met ? 600 : 400,
                transition: 'color 0.2s ease',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: item.met ? '#ccfbf1' : '#e2e8f0',
                  color: item.met ? '#0d9488' : '#94a3b8',
                  flexShrink: 0,
                }}
              >
                {item.met ? (
                  <Check size={10} strokeWidth={3} />
                ) : (
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#94a3b8',
                    }}
                  />
                )}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Password Match Confirmation (if confirmPassword given) */}
      {isConfirmed && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isMatch ? '#16a34a' : '#dc2626',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: isMatch ? '#dcfce7' : '#fee2e2',
              color: isMatch ? '#16a34a' : '#dc2626',
            }}
          >
            {isMatch ? <Check size={10} strokeWidth={3} /> : '✕'}
          </span>
          <span>{isMatch ? 'Passwords match securely' : 'Passwords do not match'}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
