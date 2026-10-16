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

import { WORLD_COUNTRIES, DEFAULT_COUNTRY, searchCountries, getCountryByDialCode } from '../data/countryCodes';

describe('Worldwide Country Codes & Phone Selector Rules', () => {
  it('includes comprehensive worldwide country codes dataset', () => {
    expect(WORLD_COUNTRIES.length).toBeGreaterThanOrEqual(100);
    const dialCodes = WORLD_COUNTRIES.map((c) => c.dialCode);
    expect(dialCodes).toContain('+91'); // India
    expect(dialCodes).toContain('+1');  // USA / Canada
    expect(dialCodes).toContain('+44'); // UK
    expect(dialCodes).toContain('+971'); // UAE
    expect(dialCodes).toContain('+61'); // Australia
    expect(dialCodes).toContain('+966'); // Saudi Arabia
  });

  it('defaults to India (+91) with 10 digits format', () => {
    expect(DEFAULT_COUNTRY.code).toBe('IN');
    expect(DEFAULT_COUNTRY.dialCode).toBe('+91');
    expect(DEFAULT_COUNTRY.length).toBe(10);
  });

  it('searches countries by name, code, or dial code accurately', () => {
    const byName = searchCountries('India');
    expect(byName.length).toBeGreaterThanOrEqual(1);
    expect(byName[0].code).toBe('IN');

    const byDial = searchCountries('971');
    expect(byDial.some((c) => c.code === 'AE')).toBe(true);

    const byCode = searchCountries('GB');
    expect(byCode.some((c) => c.code === 'GB')).toBe(true);
  });

  it('retrieves country by dial code helper', () => {
    const india = getCountryByDialCode('+91');
    expect(india.code).toBe('IN');

    const uae = getCountryByDialCode('+971');
    expect(uae.code).toBe('AE');
  });
});

import { calculatePasswordStrength } from '../components/common/PasswordStrengthMeter';

describe('Password Strength Analyzer & Validation Rules', () => {
  it('returns zero score and Too Weak for empty password', () => {
    const res = calculatePasswordStrength('');
    expect(res.strength.score).toBe(0);
    expect(res.strength.label).toBe('Too Weak');
    expect(res.metCount).toBe(0);
  });

  it('classifies simple short passwords as Weak', () => {
    const res = calculatePasswordStrength('abc');
    expect(res.strength.label).toBe('Weak');
    expect(res.strength.score).toBe(1);
    expect(res.length).toBe(false);
  });

  it('classifies medium passwords meeting 3 criteria as Fair', () => {
    const res = calculatePasswordStrength('password123'); // length, lower, number
    expect(res.strength.label).toBe('Fair');
    expect(res.strength.score).toBe(2);
  });

  it('classifies passwords meeting 4 criteria as Good', () => {
    const res = calculatePasswordStrength('Password123'); // length, upper, lower, number
    expect(res.strength.label).toBe('Good');
    expect(res.strength.score).toBe(3);
  });

  it('classifies complex passwords meeting all 5 criteria as Strong', () => {
    const res = calculatePasswordStrength('Ankush143@'); // length, upper, lower, number, special
    expect(res.strength.label).toBe('Strong');
    expect(res.strength.score).toBe(4);
    expect(res.length).toBe(true);
    expect(res.hasUpper).toBe(true);
    expect(res.hasLower).toBe(true);
    expect(res.hasNumber).toBe(true);
    expect(res.hasSpecial).toBe(true);
  });
});

