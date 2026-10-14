import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, RotateCcw, ChevronRight } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useLanguage } from '../../context/LanguageContext';

const DraggableWhatsApp = ({ activeOrderId = null }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [panelOpen, setPanelOpen] = useState(false);
  const [config, setConfig] = useState({
    whatsappPhone: '919876543210',
    whatsappMessage: 'Hello! I need help with my pizza order on SliceCraft.',
  });

  const ICON_SIZE = 58;
  const MARGIN = 16;

  // Position state (defaults to bottom right: x = window.innerWidth - ICON_SIZE - MARGIN, y = window.innerHeight - ICON_SIZE - MARGIN)
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('pizza_wa_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const defaultX = typeof window !== 'undefined' ? window.innerWidth - ICON_SIZE - MARGIN : 300;
    const defaultY = typeof window !== 'undefined' ? window.innerHeight - ICON_SIZE - MARGIN - 20 : 500;
    return { x: defaultX, y: defaultY };
  });

  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);
  const widgetRef = useRef(null);

  // Fetch safe public support settings from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiClient.get('/config');
        if (data.success && data.config) {
          setConfig({
            whatsappPhone: data.config.whatsappPhone || '919876543210',
            whatsappMessage: data.config.whatsappMessage || 'Hello! I need help with SliceCraft Pizza.',
          });
        }
      } catch (err) {
        // Fallback default
      }
    };
    fetchConfig();
  }, []);

  // Clamp helper
  const clampPosition = (x, y) => {
    const maxX = window.innerWidth - ICON_SIZE - MARGIN;
    const maxY = window.innerHeight - ICON_SIZE - MARGIN;
    return {
      x: Math.max(MARGIN, Math.min(x, maxX)),
      y: Math.max(MARGIN, Math.min(y, maxY)),
    };
  };

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Pointer drag handlers
  const handlePointerDown = (e) => {
    // Left mouse click or touch
    if (e.button && e.button !== 0) return;

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...position };

    // Capture pointer events on target
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startPointerRef.current.x;
    const deltaY = e.clientY - startPointerRef.current.y;
    dragDistanceRef.current = Math.hypot(deltaX, deltaY);

    const newX = startPosRef.current.x + deltaX;
    const newY = startPosRef.current.y + deltaY;

    setPosition(clampPosition(newX, newY));
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    // Persist position to localStorage
    setPosition((curr) => {
      const finalClamped = clampPosition(curr.x, curr.y);
      localStorage.setItem('pizza_wa_coords', JSON.stringify(finalClamped));
      return finalClamped;
    });

    // If drag distance was very small (<= 5px), treat as a genuine click!
    if (dragDistanceRef.current <= 5) {
      setPanelOpen((prev) => !prev);
    }
  };

  const resetPosition = () => {
    const defaultX = window.innerWidth - ICON_SIZE - MARGIN;
    const defaultY = window.innerHeight - ICON_SIZE - MARGIN - 20;
    const pos = { x: defaultX, y: defaultY };
    setPosition(pos);
    localStorage.setItem('pizza_wa_coords', JSON.stringify(pos));
  };

  // Launch official WhatsApp click-to-chat
  const openWhatsApp = (customIntent = '') => {
    const phone = config.whatsappPhone.replace(/[^0-9]/g, '');

    let message = config.whatsappMessage;
    if (activeOrderId) {
      message = `Hello! I need help with my Order #${activeOrderId.slice(-6).toUpperCase()} on SliceCraft Pizza.`;
    } else if (customIntent) {
      message = `Hello! I need help with: ${customIntent}.`;
    }

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setPanelOpen(false);
  };

  return (
    <>
      {/* Floating Draggable Icon */}
      <div
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { isDraggingRef.current = false; }}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${ICON_SIZE}px`,
          height: `${ICON_SIZE}px`,
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0,0,0,0.15)',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 90,
          transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease',
        }}
        title={t('whatsapp.tooltip')}
        aria-label="WhatsApp Customer Care Support"
      >
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </div>

      {/* Support Panel Popup */}
      {panelOpen && (
        <div style={{
          position: 'fixed',
          left: `${Math.min(position.x, window.innerWidth - 320 - MARGIN)}px`,
          top: `${Math.max(MARGIN, position.y - 330)}px`,
          width: '320px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          zIndex: 95,
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#25D366',
            color: '#ffffff',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={20} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  {t('whatsapp.title')}
                </h4>
                <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Available 24/7</span>
              </div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              style={{ color: '#ffffff', padding: '4px' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body options */}
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '4px' }}>
              {t('whatsapp.subtitle')}
            </p>

            {[
              { id: 'general', label: t('whatsapp.optionGeneral') },
              { id: 'pizza', label: t('whatsapp.optionPizza') },
              { id: 'payment', label: t('whatsapp.optionPayment') },
              { id: 'order', label: t('whatsapp.optionOrder') },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => openWhatsApp(opt.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-dark)',
                  textAlign: 'left',
                }}
              >
                <span>{opt.label}</span>
                <ChevronRight size={14} color="var(--color-muted)" />
              </button>
            ))}

            <button
              onClick={() => openWhatsApp()}
              className="btn btn-primary"
              style={{
                marginTop: '6px',
                backgroundColor: '#25D366',
                padding: '10px',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              💬 {t('whatsapp.openChat')}
            </button>
          </div>

          {/* Footer controls */}
          <div style={{
            padding: '8px 14px',
            backgroundColor: '#f1f5f9',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--color-muted)',
          }}>
            <span>{t('whatsapp.dragHint')}</span>
            <button
              onClick={resetPosition}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
              title="Reset icon to default location"
            >
              <RotateCcw size={12} />
              <span>{t('whatsapp.resetPosition')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DraggableWhatsApp;
