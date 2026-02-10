import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, APP_CONSTANTS } from '../constants/config';

import ar from './ar';
import en from './en';

const resources = {
    ar: { translation: ar },
    en: { translation: en },
};

// Initialize i18n
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: APP_CONSTANTS.DEFAULT_LANGUAGE,
        fallbackLng: 'ar',
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v3',
        react: {
            useSuspense: false,
        },
    });

// Function to change language
export const changeLanguage = async (lang: string) => {
    try {
        console.log('Changing language to:', lang);
        
        // Save language preference
        await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
        console.log('Language saved to storage');
        
        // Change i18n language
        await i18n.changeLanguage(lang);
        console.log('i18n language changed');

        // Handle RTL for Arabic
        const isRTL = lang === 'ar';
        console.log('Setting RTL to:', isRTL);
        
        if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            
            // Show restart message for RTL changes
            console.log('Language changed. App restart may be needed for full RTL support.');
        }
        
        console.log('Language change completed successfully');
        return true;
    } catch (error) {
        console.error('Error changing language:', error);
        return false;
    }
};

// Function to load saved language
export const loadSavedLanguage = async () => {
    try {
        const savedLang = await storage.getItem(STORAGE_KEYS.LANGUAGE);
        if (savedLang && APP_CONSTANTS.SUPPORTED_LANGUAGES.includes(savedLang)) {
            await changeLanguage(savedLang);
        } else {
            // Set default language if none saved
            await changeLanguage(APP_CONSTANTS.DEFAULT_LANGUAGE);
        }
    } catch (error) {
        console.error('Error loading saved language:', error);
        // Fallback to default language
        await changeLanguage(APP_CONSTANTS.DEFAULT_LANGUAGE);
    }
};

// Function to get current language
export const getCurrentLanguage = () => {
    return i18n.language || APP_CONSTANTS.DEFAULT_LANGUAGE;
};

// Function to check if current language is RTL
export const isRTL = () => {
    return getCurrentLanguage() === 'ar';
};

export default i18n;
