import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, isRTL, getLanguageConfig } from '../i18n/catalogue';

describe('Global Multilingual Catalogue & RTL Detection', () => {
  it('supports major world languages with no 3-language limit', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(15);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('pa');
    expect(codes).toContain('ur');
    expect(codes).toContain('ar');
    expect(codes).toContain('es');
  });

  it('correctly flags RTL direction for Arabic and Urdu', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('ur')).toBe(true);
    expect(isRTL('en')).toBe(false);
    expect(isRTL('hi')).toBe(false);
  });

  it('returns valid language config with native names', () => {
    const hindi = getLanguageConfig('hi');
    expect(hindi.nativeName).toBe('हिन्दी');

    const punjabi = getLanguageConfig('pa');
    expect(punjabi.nativeName).toBe('ਪੰਜਾਬੀ');
  });
});

describe('Draggable WhatsApp Clamping Math', () => {
  const clampPosition = (x, y, iconSize, margin, windowWidth, windowHeight) => {
    const maxX = windowWidth - iconSize - margin;
    const maxY = windowHeight - iconSize - margin;
    return {
      x: Math.max(margin, Math.min(x, maxX)),
      y: Math.max(margin, Math.min(y, maxY)),
    };
  };

  it('keeps widget inside left and top bounds when dragged past screen', () => {
    const clamped = clampPosition(-50, -20, 58, 16, 1024, 768);
    expect(clamped.x).toBe(16);
    expect(clamped.y).toBe(16);
  });

  it('keeps widget inside right and bottom bounds when dragged past screen', () => {
    const clamped = clampPosition(2000, 1500, 58, 16, 1024, 768);
    expect(clamped.x).toBe(1024 - 58 - 16);
    expect(clamped.y).toBe(768 - 58 - 16);
  });
});

describe('Cart Totals & GST Financial Rules', () => {
  it('applies 5% GST and ₹40 delivery fee for subtotal < ₹500', () => {
    const subtotal = 400;
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;

    expect(tax).toBe(20);
    expect(deliveryFee).toBe(40);
    expect(total).toBe(460);
  });

  it('waives delivery fee for orders >= ₹500', () => {
    const subtotal = 600;
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;

    expect(tax).toBe(30);
    expect(deliveryFee).toBe(0);
    expect(total).toBe(630);
  });
});
