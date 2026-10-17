import React from 'react';
import { Rocket, Users } from 'lucide-react';
import { DifficultyLevel } from '../../types/game';
import { soundEngine } from '../../game/audio/soundEngine';
import { MenuPanelHeader } from './MenuPanel';

interface DeployTabProps {
  selectedCoop: boolean;
  selectedDifficulty: DifficultyLevel;
  isWarping: boolean;
  onSelectCoop: (coop: boolean) => void;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  onStartMission: () => void;
  onBack: () => void;
}

const DIFFICULTIES = [DifficultyLevel.EASY, DifficultyLevel.NORMAL, DifficultyLevel.HARD];

const difficultyColor = (diff: DifficultyLevel) =>
  diff === DifficultyLevel.EASY
    ? 'text-emerald-400 border-emerald-500/60 bg-emerald-950/40'
    : diff === DifficultyLevel.NORMAL
    ? 'text-cyan-400 border-cyan-500/60 bg-cyan-950/40'
    : 'text-pink-400 border-pink-500/60 bg-pink-950/40';

const difficultyLabel = (diff: DifficultyLevel) =>
  diff === DifficultyLevel.EASY ? '0.8x Hazard' : diff === DifficultyLevel.NORMAL ? '1.0x Standard' : '1.5x Lethal';

export const DeployTab: React.FC<DeployTabProps> = ({
  selectedCoop,
  selectedDifficulty,
  isWarping,
  onSelectCoop,
  onSelectDifficulty,
  onStartMission,
  onBack,
}) => (
  <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
    <MenuPanelHeader
      icon={<Rocket size={16} />}
      title="MISSION DEPLOYMENT PROTOCOL"
      titleClassName="text-cyan-400"
      borderClassName="pb-2.5"
      onBack={onBack}
    />

    <div>
      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
        FLIGHT FORMATION
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onSelectCoop(false);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
            !selectedCoop
              ? 'border-cyan-400 bg-cyan-950/50 text-white font-bold'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-bold font-mono">1P SOLO RECON</div>
          <div className="text-[10px] text-slate-400">Single interceptor run</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onSelectCoop(true);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
            selectedCoop
              ? 'border-purple-400 bg-purple-950/50 text-white font-bold'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-bold font-mono flex items-center gap-1">
            <Users size={12} /> 2P CO-OP WINGMAN
          </div>
          <div className="text-[10px] text-slate-400">Shared combat flight screen</div>
        </button>
      </div>
    </div>

    <div>
      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
        THREAT SECTOR PROFILE
      </label>
      <div className="grid grid-cols-3 gap-2">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff}
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onSelectDifficulty(diff);
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className={`p-2 rounded-xl border text-center transition cursor-pointer ${
              selectedDifficulty === diff
                ? `${difficultyColor(diff)} font-bold`
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-black">{diff}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{difficultyLabel(diff)}</div>
          </button>
        ))}
      </div>
    </div>

    <button
      type="button"
      onClick={onStartMission}
      onMouseEnter={() => soundEngine.playUiHover()}
      disabled={isWarping}
      className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm font-mono tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
    >
      <Rocket size={18} /> ENGAGE HYPERDRIVE & LAUNCH
    </button>
  </div>
);
