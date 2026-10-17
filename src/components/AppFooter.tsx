import React from 'react';

export const AppFooter: React.FC = () => (
  <footer className="w-full shrink-0 py-1.5 px-3 sm:px-5 text-center text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-30">
    <div className="flex items-center gap-2">
      <span className="text-cyan-400 font-mono font-semibold">Sterowanie 3D:</span>
      <span>P1: ← / → + Spacja</span>
      <span className="text-slate-600">|</span>
      <span>Broń: 1-4 / Q, E</span>
      <span className="text-slate-600">|</span>
      <span>Kamera: V (TPP / Kokpit)</span>
      <span className="text-slate-600">|</span>
      <span>Pełny Ekran: F</span>
      <span className="text-slate-600">|</span>
      <span>Odznaki: B</span>
      <span className="text-slate-600">|</span>
      <span>Pauza: ESC</span>
    </div>
    <div className="text-slate-500 font-mono text-[10px] hidden sm:block">
      Galaxa Odyssey • Architektura Hangar3D & Pelny Ekran
    </div>
  </footer>
);
