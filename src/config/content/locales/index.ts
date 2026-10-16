import { plPL, type TranslationSchema } from './pl-PL';
import { enUS } from './en-US';

export type SupportedLocale = 'pl-PL' | 'en-US';

export const LOCALES: Record<SupportedLocale, TranslationSchema> = {
    'pl-PL': plPL,
    'en-US': enUS,
};

/**
 * Domyślna lokalizacja bazowa
 */
export const DEFAULT_LOCALE: SupportedLocale = 'pl-PL';

/**
 * Bezpośredni dostęp do aktywnego słownika
 */
export const t = LOCALES[DEFAULT_LOCALE];

export type { TranslationSchema };