import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLanguageConfig, isRTL } from '../i18n/catalogue';
import apiClient from '../api/apiClient';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('pizza_lang') || 'en';
  });

  // Section 18.2: Mandatory Initial Language Selection for first-time visitors
  const [showInitialModal, setShowInitialModal] = useState(() => {
    return !localStorage.getItem('pizza_lang');
  });

  const changeLanguage = async (langCode, syncWithBackend = false) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('pizza_lang', langCode);
    i18n.changeLanguage(langCode);

    const rtl = isRTL(langCode);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;

    if (syncWithBackend && localStorage.getItem('pizza_auth_token')) {
      try {
        await apiClient.put('/auth/language', { language: langCode });
      } catch (err) {
        // Silently continue if sync fails
      }
    }
  };

  const completeInitialSelection = (langCode) => {
    changeLanguage(langCode, true);
    setShowInitialModal(false);
  };

  useEffect(() => {
    const rtl = isRTL(currentLanguage);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentConfig: getLanguageConfig(currentLanguage),
        supportedLanguages: SUPPORTED_LANGUAGES,
        changeLanguage,
        showInitialModal,
        setShowInitialModal,
        completeInitialSelection,
        isRTL: isRTL(currentLanguage),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
