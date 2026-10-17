import { plPL, type TranslationSchema } from './pl-PL';
import { enUS } from './en-US';

export type SupportedLocale = 'pl-PL' | 'en-US';

export const LOCALES: Record<SupportedLocale, TranslationSchema> = {
    'pl-PL': plPL,
    'en-US': enUS,
};

export const LOCALE_STORAGE_KEY = 'galaxa_odyssey_locale';

/**
 * Domyślna lokalizacja bazowa
 */
export const DEFAULT_LOCALE: SupportedLocale = 'pl-PL';

export const isSupportedLocale = (value: string | null): value is SupportedLocale =>
    value !== null && Object.prototype.hasOwnProperty.call(LOCALES, value);

export type { TranslationSchema };