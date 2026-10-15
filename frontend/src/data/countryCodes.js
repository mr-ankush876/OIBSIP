/**
 * Comprehensive World Country Codes Dataset
 * Covers all worldwide countries and territories with ISO code, name, dial code, flag emoji, and phone length.
 */

export const WORLD_COUNTRIES = [
  // --- TOP POPULAR / FREQUENT COUNTRIES ---
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', length: 10, format: '##### #####', popular: true },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', length: 10, format: '(###) ###-####', popular: true },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', length: 10, format: '#### ######', popular: true },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', length: 9, format: '## ### ####', popular: true },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', length: 10, format: '(###) ###-####', popular: true },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', length: 9, format: '### ### ###', popular: true },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', length: 9, format: '## ### ####', popular: true },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', length: 8, format: '#### ####', popular: true },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', length: 10, format: '### #######', popular: true },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', length: 9, format: '# ## ## ## ##', popular: true },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', length: 8, format: '#### ####', popular: true },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', length: 8, format: '#### ####', popular: true },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', length: 8, format: '#### ####', popular: true },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', length: 8, format: '#### ####', popular: true },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', length: 10, format: '### #######', popular: true },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', length: 10, format: '#### ######', popular: true },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', length: 10, format: '## #######', popular: true },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', length: 9, format: '## #######', popular: true },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', length: 9, format: '## ### ####', popular: true },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', length: 9, format: '## ### ####', popular: true },

  // --- ALL WORLD COUNTRIES & TERRITORIES (ALPHABETICAL) ---
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', length: 9 },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', length: 9 },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', length: 9 },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩', length: 6 },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴', length: 9 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', length: 10 },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲', length: 8 },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', length: 10 },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿', length: 9 },
  { code: 'BS', name: 'Bahamas', dialCode: '+1242', flag: '🇧🇸', length: 7 },
  { code: 'BB', name: 'Barbados', dialCode: '+1246', flag: '🇧🇧', length: 7 },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾', length: 9 },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', length: 9 },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿', length: 7 },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯', length: 8 },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', flag: '🇧🇹', length: 8 },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', length: 8 },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '🇧🇦', length: 8 },
  { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼', length: 8 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', length: 11 },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳', length: 7 },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', length: 9 },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', length: 8 },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', length: 8 },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭', length: 9 },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', length: 9 },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', length: 9 },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', length: 11 },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', length: 10 },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', length: 8 },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', length: 9 },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', length: 8 },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', length: 8 },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', length: 9 },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', length: 8 },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯', length: 8 },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1809', flag: '🇩🇴', length: 7 },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', length: 9 },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', length: 10 },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', length: 8 },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', length: 8 },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', length: 9 },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', length: 7 },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', length: 10 },
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪', length: 9 },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', length: 9 },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', length: 10 },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', length: 8 },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', length: 8 },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', length: 9 },
  { code: 'IS', name: 'Iceland', dialCode: '+354', flag: '🇮🇸', length: 7 },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', length: 10 },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷', length: 10 },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', length: 10 },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', length: 9 },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', length: 9 },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', length: 10 },
  { code: 'JM', name: 'Jamaica', dialCode: '+1876', flag: '🇯🇲', length: 7 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', length: 10 },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', length: 9 },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿', length: 10 },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', length: 9 },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', length: 10 },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', length: 8 },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', length: 9 },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', length: 9 },
  { code: 'MO', name: 'Macau', dialCode: '+853', flag: '🇲🇴', length: 8 },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩', length: 8 },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨', length: 8 },
  { code: 'MN', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳', length: 8 },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', length: 9 },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲', length: 9 },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', length: 9 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', length: 10 },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', length: 8 },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦', length: 8 },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪', length: 9 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', length: 10 },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', length: 9 },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', length: 9 },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴', length: 9 },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', length: 10 },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', length: 9 },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳', length: 9 },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸', length: 9 },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', length: 9 },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', length: 8 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', length: 9 },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', length: 9 },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', length: 9 },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', length: 9 },
  { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾', length: 9 },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', length: 9 },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', length: 9 },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', length: 9 },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', length: 8 },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', length: 10 },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', length: 9 },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', length: 9 },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', length: 8 },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿', length: 9 },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', length: 10 },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', length: 9 },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', length: 9 },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲', length: 9 },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', length: 9 }
];

export const DEFAULT_COUNTRY = WORLD_COUNTRIES[0]; // India (+91)

export const searchCountries = (query = '') => {
  if (!query || !query.trim()) return WORLD_COUNTRIES;
  const clean = query.trim().toLowerCase().replace('+', '');
  return WORLD_COUNTRIES.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(clean);
    const codeMatch = c.code.toLowerCase().includes(clean);
    const dialMatch = c.dialCode.replace('+', '').includes(clean);
    return nameMatch || codeMatch || dialMatch;
  });
};

export const getCountryByCode = (code) => {
  if (!code) return DEFAULT_COUNTRY;
  return WORLD_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || DEFAULT_COUNTRY;
};

export const getCountryByDialCode = (dialCode) => {
  if (!dialCode) return DEFAULT_COUNTRY;
  const cleanDial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return WORLD_COUNTRIES.find((c) => c.dialCode === cleanDial) || DEFAULT_COUNTRY;
};
