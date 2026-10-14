import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Check, Pizza } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageModal = () => {
  const { t } = useTranslation();
  const { showInitialModal, completeInitialSelection, supportedLanguages, currentLanguage } = useLanguage();
  const [selectedCode, setSelectedCode] = useState(currentLanguage || '');
  const [searchTerm, setSearchTerm] = useState('');

  if (!showInitialModal) {
    return null;
  }

  const filteredLanguages = supportedLanguages.filter((lang) => {
    const term = searchTerm.toLowerCase();
    return (
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.region.toLowerCase().includes(term)
    );
  });

  const handleContinue = () => {
    if (selectedCode) {
      completeInitialSelection(selectedCode);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 28px 20px 28px',
          borderBottom: '1px solid var(--color-border)',
          textAlign: 'center',
          backgroundColor: '#fffaf5',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '16px',
            marginBottom: '12px',
            boxShadow: '0 6px 16px rgba(214, 40, 40, 0.3)',
          }}>
            <Pizza size={32} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '6px' }}>
            {t('modal.welcome')}
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-muted)' }}>
            {t('modal.chooseLanguage')}
          </p>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            marginTop: '16px',
            maxWidth: '480px',
            marginInline: 'auto',
          }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('modal.searchLanguage')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{
                paddingLeft: '42px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Language Grid */}
        <div style={{
          padding: '20px 28px',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {filteredLanguages.map((lang) => {
            const isSelected = selectedCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedCode(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  backgroundColor: isSelected ? '#fff1f2' : '#ffffff',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-dark)',
                  }}>
                    {lang.nativeName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    {lang.name} {lang.dir === 'rtl' ? '• RTL' : ''}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCode}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
          >
            {t('modal.continue')}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textAlign: 'center' }}>
            {t('modal.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
