import React from 'react';
import { Camera, Flame, Radio } from 'lucide-react';
import type { CameraViewMode } from '../../rendering/three/combatSceneTypes';

interface CombatTopBarProps {
    wave: number;
    viewMode: CameraViewMode;
    isWarpActive: boolean;
    onToggleView: () => void;
    onWarpJump: () => void;
}

const VIEW_LABELS: Record<CameraViewMode, string> = {
    CHASE_3D: 'Widok: Zza statku (3D)',
    COCKPIT_3D: 'Widok: Bliski pościg (3D)',
    TACTICAL_3D: 'Widok: Taktyczny (3D)',
};

export const CombatTopBar: React.FC<CombatTopBarProps> = ({ wave, viewMode, isWarpActive, onToggleView, onWarpJump }) => (
    <div className="flex flex-col items-center gap-1.5">
        <div className="px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-xs font-bold tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            <span>SECTOR {wave} • ACTIVE COMBAT ZONE</span>
        </div>

        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onToggleView}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition text-[11px] shadow-sm"
                title="Przełącz perspektywę kamery 3D (Klawisz V)"
            >
                <Camera size={13} className="text-cyan-400" />
                <span>{VIEW_LABELS[viewMode]}</span>
                <span className="text-slate-500 text-[9px]">[V]</span>
            </button>

            <button
                type="button"
                onClick={onWarpJump}
                disabled={isWarpActive}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white transition text-[11px]"
                title="Wymuś skok w nadprzestrzeń (Warp Jump)"
            >
                <Flame size={12} className="text-indigo-400" />
                <span>Warp</span>
            </button>
        </div>
    </div>
);
