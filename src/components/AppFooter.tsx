import React from 'react';
import { useLocale } from '../config/content/locales/LocaleProvider';

export const AppFooter: React.FC = () => {
  const { t } = useLocale();

  return (
    <footer className="w-full shrink-0 py-1.5 px-3 sm:px-5 text-center text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-30">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 font-mono font-semibold">{t('Sterowanie 3D:', '3D Controls:')}</span>
        <span>{t('Gracz 1: ← / → + Spacja', 'Player 1: ← / → + Space')}</span>
        <span className="text-slate-600">|</span>
        <span>{t('Broń: 1-4 / Q, E', 'Weapon: 1-4 / Q, E')}</span>
        <span className="text-slate-600">|</span>
        <span>{t('Kamera: V (TPP / Kokpit)', 'Camera: V (TPP / Cockpit)')}</span>
        <span className="text-slate-600">|</span>
        <span>{t('Pełny ekran: F', 'Fullscreen: F')}</span>
        <span className="text-slate-600">|</span>
        <span>{t('Odznaki: B', 'Badges: B')}</span>
        <span className="text-slate-600">|</span>
        <span>{t('Pauza: ESC', 'Pause: ESC')}</span>
      </div>
      <div className="text-slate-500 font-mono text-[10px] hidden sm:block">
        {t(
          'Galaxa Odyssey • Architektura Hangar3D i pełny ekran',
          'Galaxa Odyssey • Hangar3D Architecture & Fullscreen'
        )}
      </div>
    </footer>
  );
};
