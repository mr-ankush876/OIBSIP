import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Phone } from 'lucide-react';
import { WORLD_COUNTRIES, DEFAULT_COUNTRY, searchCountries } from '../data/countryCodes';

/**
 * PhoneCountryInput
 * Modern, advance-level phone input with pinned country code button and searchable worldwide countries dropdown.
 *
 * Props:
 * - value: string (current local phone number digits e.g. "9876543210")
 * - selectedDialCode: string (optional e.g. "+91")
 * - onChange: function({ phoneNumber, dialCode, countryCode, fullNumber, isValid })
 * - placeholder: string (optional)
 * - disabled: boolean
 * - required: boolean
 * - autoFocus: boolean
 * - id: string
 */
const PhoneCountryInput = ({
  value = '',
  selectedDialCode = '+91',
  onChange,
  placeholder,
  disabled = false,
  required = false,
  autoFocus = false,
  id = 'phone-input',
}) => {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return WORLD_COUNTRIES.find((c) => c.dialCode === selectedDialCode) || DEFAULT_COUNTRY;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawNumber, setRawNumber] = useState(value);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Sync internal rawNumber if external value changes
  useEffect(() => {
    setRawNumber(value);
  }, [value]);

  // Sync country if selectedDialCode changes from outside
  useEffect(() => {
    if (selectedDialCode && selectedDialCode !== selectedCountry.dialCode) {
      const match = WORLD_COUNTRIES.find((c) => c.dialCode === selectedDialCode);
      if (match) setSelectedCountry(match);
    }
  }, [selectedDialCode]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries based on live search
  const filteredCountries = searchCountries(searchQuery);
  const popularCountries = WORLD_COUNTRIES.filter((c) => c.popular);

  const triggerChange = (number, country) => {
    const cleanNumber = number.replace(/\D/g, '');
    const maxLen = country.length || 10;
    const trimmedNumber = cleanNumber.slice(0, maxLen);
    const fullNumber = `${country.dialCode}${trimmedNumber}`;
    const isValid = trimmedNumber.length >= Math.max(6, (country.length || 10) - 2);

    if (onChange) {
      onChange({
        phoneNumber: trimmedNumber,
        dialCode: country.dialCode,
        countryCode: country.code,
        countryName: country.name,
        fullNumber,
        isValid,
      });
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    triggerChange(rawNumber, country);
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 50);
  };

  const handleNumberChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '');
    const maxLen = selectedCountry.length || 10;
    const limited = clean.slice(0, maxLen);
    setRawNumber(limited);
    triggerChange(limited, selectedCountry);
  };

  const handleClear = () => {
    setRawNumber('');
    triggerChange('', selectedCountry);
    phoneInputRef.current?.focus();
  };

  const expectedLength = selectedCountry.length || 10;
  const currentLength = rawNumber.length;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Integrated Input Group */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: isOpen ? '2px solid var(--color-primary)' : '1px solid #cbd5e1',
          borderRadius: 'var(--radius-md, 8px)',
          boxShadow: isOpen ? '0 0 0 3px rgba(214, 40, 40, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Fixed Country Code Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={`Selected: ${selectedCountry.name} (${selectedCountry.dialCode}) - Click to change country`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
            border: 'none',
            borderRight: '1px solid #e2e8f0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }} role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span style={{ color: '#0f172a', letterSpacing: '0.01em' }}>{selectedCountry.dialCode}</span>
          <ChevronDown
            size={14}
            style={{
              color: '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Local Number Input */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            ref={phoneInputRef}
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            value={rawNumber}
            onChange={handleNumberChange}
            placeholder={placeholder || (selectedCountry.code === 'IN' ? '98765 43210' : `Enter ${expectedLength}-digit number`)}
            style={{
              width: '100%',
              padding: '11px 36px 11px 14px',
              border: 'none',
              outline: 'none',
              fontSize: '0.96rem',
              fontWeight: 500,
              color: '#0f172a',
              letterSpacing: '0.04em',
              backgroundColor: 'transparent',
            }}
          />

          {/* Clear Number Button */}
          {rawNumber && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear phone number"
              style={{
                position: 'absolute',
                right: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Helper text showing format and digit constraints */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '5px',
          fontSize: '0.74rem',
          color: '#64748b',
          padding: '0 2px',
        }}
      >
        <span>
          Fixed country code: <strong>{selectedCountry.dialCode}</strong> ({selectedCountry.name})
        </span>
        <span style={{ color: currentLength === expectedLength ? '#16a34a' : '#64748b', fontWeight: 600 }}>
          {currentLength} / {expectedLength} digits
        </span>
      </div>

      {/* Worldwide Country Selector Dropdown Modal / Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            maxHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header & Search Bar */}
          <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Country Code (All World)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country name, dial code (+91, +1)..."
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 32px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Popular Chips */}
            {!searchQuery && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {popularCountries.slice(0, 6).map((pop) => (
                  <button
                    key={pop.code}
                    type="button"
                    onClick={() => handleCountrySelect(pop)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: selectedCountry.code === pop.code ? '#fee2e2' : '#ffffff',
                      color: selectedCountry.code === pop.code ? 'var(--color-primary, #d62828)' : '#475569',
                      border: selectedCountry.code === pop.code ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{pop.flag}</span>
                    <span>{pop.dialCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country List Items */}
          <div
            role="listbox"
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '4px 0',
            }}
          >
            {filteredCountries.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                No country found matching "<strong>{searchQuery}</strong>"
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code && selectedCountry.dialCode === c.dialCode;
                return (
                  <div
                    key={`${c.code}-${c.dialCode}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      backgroundColor: isSelected ? '#fef2f2' : 'transparent',
                      color: isSelected ? 'var(--color-primary, #d62828)' : '#1e293b',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{c.flag}</span>
                      <span style={{ fontWeight: isSelected ? 700 : 500 }}>{c.name}</span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                        ({c.code})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          color: isSelected ? 'var(--color-primary, #d62828)' : '#475569',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {c.dialCode}
                      </span>
                      {isSelected && <Check size={16} color="var(--color-primary, #d62828)" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneCountryInput;
