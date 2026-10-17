import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    DEFAULT_LOCALE,
    isSupportedLocale,
    LOCALE_STORAGE_KEY,
    type SupportedLocale,
} from './index';

interface LocaleContextValue {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
    t: (polish: string, english: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const readStoredLocale = (): SupportedLocale => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
};

export const LocaleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [locale, setLocaleState] = useState<SupportedLocale>(readStoredLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = (nextLocale: SupportedLocale) => {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        setLocaleState(nextLocale);
    };

    const t = (polish: string, english: string) =>
        locale === 'pl-PL' ? polish : english;

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = (): LocaleContextValue => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
