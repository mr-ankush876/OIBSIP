import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pizza, ShoppingBag, Globe, User, LogOut, ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { currentLanguage, currentConfig, supportedLanguages, changeLanguage, setShowInitialModal } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(214, 40, 40, 0.3)'
          }}>
            <Pizza size={26} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px' }}>
              Slice<span style={{ color: 'var(--color-primary)' }}>Craft</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-4px' }}>
              Artisan Pizza
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <Link to="/" style={{ fontWeight: 600, color: 'var(--color-dark)', fontSize: '0.95rem' }}>
            {t('nav.home')}
          </Link>
          <Link to="/menu" style={{ fontWeight: 600, color: 'var(--color-dark)', fontSize: '0.95rem' }}>
            {t('nav.menu')}
          </Link>
          <Link to="/builder" style={{
            fontWeight: 700,
            color: 'var(--color-secondary)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff7ed',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #fed7aa'
          }}>
            ✨ {t('nav.builder')}
          </Link>
          <Link to="/track" style={{ fontWeight: 600, color: 'var(--color-dark)', fontSize: '0.95rem' }}>
            {t('nav.track')}
          </Link>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="btn btn-outline"
              style={{ padding: '7px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title={t('nav.changeLanguage')}
            >
              <Globe size={16} />
              <span>{currentConfig.nativeName}</span>
              <ChevronDown size={14} />
            </button>

            {langDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '220px',
                maxHeight: '340px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 200,
              }}>
                <button
                  onClick={() => {
                    setLangDropdownOpen(false);
                    setShowInitialModal(true);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'var(--color-primary)',
                    marginBottom: '6px',
                  }}
                >
                  🌐 View All 20+ Languages
                </button>
                {supportedLanguages.slice(0, 10).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code, true);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: currentLanguage === lang.code ? '#fee2e2' : 'transparent',
                      color: currentLanguage === lang.code ? 'var(--color-primary)' : 'var(--color-dark)',
                      fontWeight: currentLanguage === lang.code ? 700 : 500,
                    }}
                  >
                    <span>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fff1f2',
              color: 'var(--color-primary)',
            }}
            title={t('nav.cart')}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline"
                style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={16} />
                <span style={{ fontSize: '0.85rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '180px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                    {user.email}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <ShieldCheck size={16} />
                      {t('nav.admin')}
                    </Link>
                  )}
                  <Link
                    to="/my-orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--color-dark)',
                    }}
                  >
                    📦 {t('nav.myOrders')}
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--color-danger)',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', padding: '6px' }}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>{t('nav.home')}</Link>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>{t('nav.menu')}</Link>
          <Link to="/builder" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>✨ {t('nav.builder')}</Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>{t('nav.track')}</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              🛡️ {t('nav.admin')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
