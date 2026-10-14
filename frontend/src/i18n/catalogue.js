export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', region: 'Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', region: 'India' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', region: 'India' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', region: 'South Asia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', region: 'India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', region: 'India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', region: 'India' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', region: 'India' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', region: 'India' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', region: 'India' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', region: 'India' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', region: 'Middle East' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', region: 'Spain / Americas' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', region: 'France' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', region: 'Germany' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr', region: 'Italy' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', region: 'Portugal / Brazil' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', region: 'Eastern Europe' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', dir: 'ltr', region: 'East Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', region: 'Japan' },
];

export const getLanguageConfig = (code) => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
};

export const isRTL = (code) => {
  const lang = getLanguageConfig(code);
  return lang.dir === 'rtl';
};
