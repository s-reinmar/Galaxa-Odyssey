import React from 'react';
import { Rocket, Shield, Trophy, ChevronRight, BookOpen, Settings, Users } from 'lucide-react';
import { GameEngine } from '../../game/GameEngine';
import { DifficultyLevel } from '../../types/game';
import { soundEngine } from '../../game/audio/soundEngine';
import { MenuTab } from './menuTypes';

interface MainMenuTabProps {
  engine: GameEngine;
  selectedCoop: boolean;
  selectedDifficulty: DifficultyLevel;
  isWarping: boolean;
  onToggleCoop: () => void;
  onCycleDifficulty: () => void;
  onStartMission: () => void;
  onResumeSaved: () => void;
  onOpenTab: (tab: MenuTab) => void;
  onOpenAchievements: () => void;
}

export const MainMenuTab: React.FC<MainMenuTabProps> = ({
  engine,
  selectedCoop,
  selectedDifficulty,
  isWarping,
  onToggleCoop,
  onCycleDifficulty,
  onStartMission,
  onResumeSaved,
  onOpenTab,
  onOpenAchievements,
}) => {
  const hasSave = engine.hasSavedGame();
  const openTab = (tab: MenuTab) => {
    soundEngine.playUiClick();
    onOpenTab(tab);
  };

  return (
    <div className="space-y-2.5 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="mb-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold mb-1 flex items-center gap-2">
          <span>TACTICAL FLIGHT DECK</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] text-emerald-400">ONLINE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">GALAXA ODYSSEY</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-[360px] leading-relaxed">
          Next-generation 21st-century starfighter orbital command & alien frontline defense simulator.
        </p>
      </div>

      {hasSave && (
        <button
          type="button"
          onClick={onResumeSaved}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="w-full group px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-emerald-500/60 rounded-xl text-left transition-all duration-200 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Rocket size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2">
                RESUME MISSION
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono font-bold">
                  WAVE {engine.wave + 1}
                </span>
              </div>
              <div className="text-[11px] text-emerald-300/80">Continue from saved tactical state</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      <button
        type="button"
        onClick={onStartMission}
        onMouseEnter={() => soundEngine.playUiHover()}
        disabled={isWarping}
        className="w-full group px-4 py-3.5 bg-cyan-500 hover:bg-cyan-400 border border-cyan-400 rounded-xl text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <Rocket size={20} className="text-cyan-400 fill-cyan-400" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black text-slate-950 font-mono tracking-wider flex items-center gap-2">
              ROZPOCZNIJ MISJĘ
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-bold border border-slate-950/20">
                [SPACJA / ENTER]
              </span>
            </div>
            <div className="text-[11px] text-slate-900 font-semibold">
              {selectedCoop ? 'Tryb 2P Co-op Wingman' : 'Tryb 1P Solo'} • Trudność: {selectedDifficulty}
            </div>
          </div>
        </div>
        <ChevronRight size={22} className="text-slate-950 group-hover:translate-x-1.5 transition-transform" />
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onToggleCoop();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="px-3 py-2 bg-slate-900/90 border border-slate-700 hover:border-cyan-400/80 rounded-xl flex items-center justify-between text-xs font-mono transition cursor-pointer"
        >
          <span className="text-slate-400 text-[10px]">FORMACJA:</span>
          <span className="font-bold text-cyan-300 flex items-center gap-1">
            <Users size={12} /> {selectedCoop ? '2P CO-OP' : '1P SOLO'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onCycleDifficulty();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="px-3 py-2 bg-slate-900/90 border border-slate-700 hover:border-amber-400/80 rounded-xl flex items-center justify-between text-xs font-mono transition cursor-pointer"
        >
          <span className="text-slate-400 text-[10px]">TRUDNOŚĆ:</span>
          <span className="font-bold text-amber-300">{selectedDifficulty}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => openTab('loadout')}
        onMouseEnter={() => soundEngine.playUiHover()}
        className="w-full group px-4 py-2.5 bg-slate-950/85 hover:bg-slate-900/90 border border-purple-500/40 rounded-xl text-left transition-all duration-200 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 font-mono">SHIP LOADOUT & HANGAR</div>
            <div className="text-[10px] text-slate-400">Weapon tiers, ship skins & shield upgrades</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
      </button>

      <button
        type="button"
        onClick={() => {
          soundEngine.playUiClick();
          onOpenAchievements();
        }}
        onMouseEnter={() => soundEngine.playUiHover()}
        className="w-full group px-4 py-2.5 bg-slate-950/85 hover:bg-slate-900/90 border border-amber-500/40 rounded-xl text-left transition-all duration-200 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Trophy size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
              BADGES & ACHIEVEMENTS
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                ({engine.getUnlockedCount()}/{engine.getTotalCount()})
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Inspect 31 unlocked medals, flight badges & honors</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => openTab('diagnostics')}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="px-3 py-2 bg-slate-950/85 hover:bg-slate-900 border border-slate-800 rounded-xl text-left transition text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 cursor-pointer"
        >
          <Settings size={14} className="text-cyan-400 shrink-0" />
          <span>DIAGNOSTICS</span>
        </button>
        <button
          type="button"
          onClick={() => openTab('manual')}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="px-3 py-2 bg-slate-950/85 hover:bg-slate-900 border border-slate-800 rounded-xl text-left transition text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 cursor-pointer"
        >
          <BookOpen size={14} className="text-pink-400 shrink-0" />
          <span>FLIGHT MANUAL</span>
        </button>
      </div>
    </div>
  );
};
