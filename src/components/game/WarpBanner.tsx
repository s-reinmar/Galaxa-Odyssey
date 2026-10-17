import React from 'react';
import { Flame } from 'lucide-react';

export const WarpBanner: React.FC<{ wave: number }> = ({ wave }) => (
    <div className="self-center flex flex-col items-center justify-center p-6 rounded-2xl bg-cyan-950/80 border border-cyan-400/60 backdrop-blur-lg shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 text-cyan-300 text-lg font-black tracking-widest uppercase">
            <Flame size={22} className="text-cyan-400 animate-bounce" />
            <span>SKOK W NADPRZESTRZEŃ • HYPERDRIVE ACTIVE</span>
        </div>
        <p className="text-xs text-cyan-200 mt-1">Kamera zablokowana za statkiem • Tranzyt do Sektora {wave}</p>
    </div>
);
