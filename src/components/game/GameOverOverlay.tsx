import React from 'react';
import { RotateCcw, ChevronRight } from 'lucide-react';

interface GameOverOverlayProps {
    wave: number;
    score: number;
    credits: number;
    onRedeploy: () => void;
    onReturn: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ wave, score, credits, onRedeploy, onReturn }) => (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-red-500/40 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-red-500 font-mono tracking-wider animate-pulse">
                HULL BREACHED • CRITICAL FAILURE
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Starfighter Destroyed in Sector {wave}</p>

            <div className="w-full grid grid-cols-2 gap-3 my-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
                <div>
                    <span className="text-slate-500">FINAL SCORE</span>
                    <p className="text-lg font-black text-cyan-300">{score.toLocaleString()}</p>
                </div>
                <div>
                    <span className="text-slate-500">SALVAGE CREDITS</span>
                    <p className="text-lg font-black text-amber-400">+{credits}</p>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3 font-mono text-sm">
                <button
                    type="button"
                    onClick={onRedeploy}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                    <RotateCcw size={18} />
                    <span>DEPLOY REPLACEMENT FIGHTER</span>
                </button>

                <button
                    type="button"
                    onClick={onReturn}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition text-xs"
                >
                    <ChevronRight size={16} />
                    <span>RETURN TO SHIP HANGAR</span>
                </button>
            </div>
        </div>
    </div>
);
