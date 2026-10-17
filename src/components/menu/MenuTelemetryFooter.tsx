import React from 'react';

export const MenuTelemetryFooter: React.FC = () => (
  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 sm:px-4 py-2">
    <div className="flex items-center gap-3">
      <span className="text-cyan-400 font-bold">RADAR:</span>
      <span>SECTOR 07 CLEAR • WEAPON CAPACITORS 100%</span>
    </div>
    <div className="hidden sm:flex items-center gap-3 text-slate-500">
      <span>DRAG MOUSE TO ORBIT 3D STARFIGHTER</span>
      <span>•</span>
      <span>SCROLL TO ZOOM</span>
    </div>
  </div>
);
