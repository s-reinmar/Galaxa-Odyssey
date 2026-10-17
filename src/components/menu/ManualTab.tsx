import React from 'react';
import { BookOpen } from 'lucide-react';
import { MenuPanelHeader, ReturnToBridgeButton } from './MenuPanel';

interface ManualTabProps {
  onBack: () => void;
}

const CONTROL_BINDINGS = [
  { action: 'STEER STARFIGHTER (P1)', keys: '← / → ARROWS', keyClass: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40' },
  { action: 'FIRE ACTIVE WEAPON (P1)', keys: 'SPACEBAR', keyClass: 'text-purple-400 bg-purple-950/80 border-purple-500/40' },
  { action: 'SWITCH WEAPON MODES', keys: '1, 2, 3, 4 / Q, E', keyClass: 'text-amber-400 bg-amber-950/80 border-amber-500/40' },
  { action: 'CO-OP WINGMAN (P2)', keys: 'A, D (MOVE) / F (FIRE)', keyClass: 'text-pink-400 bg-pink-950/80 border-pink-500/40' },
  { action: 'TACTICAL PAUSE & SAVE', keys: 'ESC', keyClass: 'text-slate-300 bg-slate-800 border-slate-700' },
];

export const ManualTab: React.FC<ManualTabProps> = ({ onBack }) => (
  <div className="bg-slate-950/90 backdrop-blur-md border border-pink-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in fade-in duration-200 max-h-[66vh] overflow-y-auto">
    <MenuPanelHeader
      icon={<BookOpen size={16} />}
      title="TACTICAL COMBAT MANUAL"
      titleClassName="text-pink-400"
      onBack={onBack}
    />

    <div className="space-y-2 text-xs font-mono">
      {CONTROL_BINDINGS.map((binding) => (
        <div
          key={binding.action}
          className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between"
        >
          <span className="text-slate-300">{binding.action}</span>
          <span className={`font-bold px-2 py-0.5 rounded border ${binding.keyClass}`}>{binding.keys}</span>
        </div>
      ))}
    </div>

    <ReturnToBridgeButton onClick={onBack} />
  </div>
);
