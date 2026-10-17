import React from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useLocale } from '../config/content/locales/LocaleProvider';

interface AppHeaderProps {
  isFullscreen: boolean;
  soundEnabled: boolean;
  particlesEnabled: boolean;
  unlockedAchievementCount: number;
  totalAchievementCount: number;
  onToggleAchievements: () => void;
  onToggleAudio: () => void;
  onToggleParticles: () => void;
  onToggleFullscreen: () => void;
  onResetProfile: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isFullscreen,
  soundEnabled,
  particlesEnabled,
  unlockedAchievementCount,
  totalAchievementCount,
  onToggleAchievements,
  onToggleAudio,
  onToggleParticles,
  onToggleFullscreen,
  onResetProfile,
}) => {
  const { t } = useLocale();

  return (
    <header className="w-full shrink-0 flex items-center justify-between py-1.5 px-3 sm:px-5 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-30">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-sm">
        GO
      </div>
      <div>
        <h1 className="text-sm sm:text-base font-black tracking-wider text-cyan-400 font-mono">
          GALAXA ODYSSEY
        </h1>
        <p className="text-[10px] text-slate-400">
          {t('Kosmiczna walka orbitalna 3D XXI wieku', '21st-Century 3D Orbital Space Combat')}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleAchievements}
        title={t('Zobacz odznaki osiągnięć [B]', 'Inspect Achievement Badges [B]')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 hover:text-amber-200 transition text-xs font-mono font-bold"
      >
        <Trophy size={14} className="text-amber-400" />
        <span className="hidden sm:inline">{t('ODZNAKI', 'BADGES')}</span>
        <span className="text-[11px] text-amber-200">
          ({unlockedAchievementCount}/{totalAchievementCount})
        </span>
      </button>

      <button
        type="button"
        onClick={onToggleAudio}
        title={soundEnabled ? t('Wycisz dźwięk', 'Mute Audio') : t('Włącz dźwięk', 'Enable Audio')}
        className={`p-2 rounded-lg border transition ${
          soundEnabled
            ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
        }`}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <button
        type="button"
        onClick={onToggleParticles}
        title={particlesEnabled ? t('Wysokie efekty', 'High FX') : t('Niskie efekty', 'Low FX')}
        className={`p-2 rounded-lg border transition ${
          particlesEnabled
            ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
        }`}
      >
        <Sparkles size={16} />
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        title={
          isFullscreen
            ? t('Opuść pełny ekran [F]', 'Exit Fullscreen [F]')
            : t('Pełny ekran [F]', 'Fullscreen [F]')
        }
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-cyan-400 transition text-xs font-mono font-bold"
      >
        {isFullscreen ? (
          <Minimize2 size={14} className="text-cyan-400" />
        ) : (
          <Maximize2 size={14} className="text-cyan-400" />
        )}
        <span className="hidden sm:inline">{isFullscreen ? t('OKNO', 'WINDOW') : t('PEŁNY EKRAN', 'FULLSCREEN')}</span>
        <span className="text-[10px] text-slate-400 hidden md:inline">[F]</span>
      </button>

      <button
        type="button"
        onClick={onResetProfile}
        title={t('Zresetuj grę i osiągnięcia', 'Reset Game & Achievements')}
        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
      >
        <RotateCcw size={16} />
      </button>
    </div>
    </header>
  );
};
