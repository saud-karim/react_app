import { useTranslation } from 'react-i18next';

export const getDateLocale = (language: string): string => {
    return language === 'ar' ? 'ar-EG' : 'en-US';
};

export const formatDate = (dateString: string, language: string, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(dateString);
    const locale = getDateLocale(language);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    
    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

export const formatDateShort = (dateString: string, language: string): string => {
    const date = new Date(dateString);
    const locale = getDateLocale(language);
    
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateWithWeekday = (dateString: string, language: string): string => {
    const date = new Date(dateString);
    const locale = getDateLocale(language);
    
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatMonthShort = (dateString: string, language: string): string => {
    const date = new Date(dateString);
    const locale = getDateLocale(language);
    
    return date.toLocaleDateString(locale, { month: 'short' });
};