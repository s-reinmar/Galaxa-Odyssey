import React from 'react';
import { Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GameEngine } from '../../game/GameEngine';
import { soundEngine } from '../../game/audio/soundEngine';
import { MenuPanelHeader, ReturnToBridgeButton } from './MenuPanel';
import { useLocale } from '../../config/content/locales/LocaleProvider';
import type { SupportedLocale } from '../../config/content/locales';

const LANGUAGE_OPTIONS: { id: SupportedLocale; label: string }[] = [
  { id: 'pl-PL', label: 'POLSKI' },
  { id: 'en-US', label: 'ENGLISH' },
];

interface DiagnosticsTabProps {
  engine: GameEngine;
  onStateUpdate: () => void;
  onBack: () => void;
}

export const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({ engine, onStateUpdate, onBack }) => {
  const { locale, setLocale, t } = useLocale();
  const handleWipeProfile = () => {
    if (window.confirm(t('Zresetować lokalny profil pilota i osiągnięcia?', 'Reset local pilot profile and achievements?'))) {
      engine.clearSavedGame();
      localStorage.removeItem('galaxa_odyssey_achievements');
      localStorage.removeItem('galaxa_odyssey_profile');
      engine.loadAchievements();
      engine.loadProfile();
      onStateUpdate();
    }
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in fade-in duration-200">
      <MenuPanelHeader
        icon={<Settings size={16} />}
        title={t('DIAGNOSTYKA SYSTEMU I AUDIO', 'SYSTEM DIAGNOSTICS & AUDIO')}
        titleClassName="text-cyan-400"
        onBack={onBack}
      />

      <div className="space-y-2.5">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              {engine.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">{t('SYNTEZATOR DŹWIĘKU', 'AUDIO SYNTHESIZER')}</div>
              <div className="text-[10px] text-slate-400">{t('Lasery, silniki manewrowe i dźwięki napędu', 'Weapon lasers, thrusters & engine chimes')}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              engine.toggleAudio();
              onStateUpdate();
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              engine.soundEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {engine.soundEnabled ? t('AKTYWNE', 'ONLINE') : t('WYCISZONE', 'MUTED')}
          </button>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">{t('EFEKTY CZĄSTECZKOWE', 'PARTICLE VOLUMETRICS')}</div>
              <div className="text-[10px] text-slate-400">{t('Szybkie iskry plazmy i poświata wiązek', 'High-speed plasma sparks & beam glows')}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              engine.toggleParticles();
              onStateUpdate();
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              engine.particlesEnabled ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {engine.particlesEnabled ? t('MAX FX', 'MAX FX') : t('OGRANICZONE', 'REDUCED')}
          </button>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="text-xs font-bold text-white font-mono">{t('JĘZYK', 'LANGUAGE')}</div>
          <div className="flex items-center gap-1.5">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={locale === option.id}
                onClick={() => {
                  soundEngine.playUiClick();
                  setLocale(option.id);
                }}
                onMouseEnter={() => soundEngine.playUiHover()}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  locale === option.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-300 font-mono">{t('ZRESETUJ DANE PROFILU', 'RESET PROFILE DATA')}</div>
            <div className="text-[10px] text-slate-400">{t('Usuń zapisy, statystyki i wyróżnienia misji', 'Wipe saves, stats and mission honors')}</div>
          </div>
          <button
            type="button"
            onClick={handleWipeProfile}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-rose-900/60 text-rose-300 transition cursor-pointer"
          >
            {t('USUŃ DANE', 'WIPE DATA')}
          </button>
        </div>
      </div>

      <ReturnToBridgeButton onClick={onBack} />
    </div>
  );
};
