import React from 'react';
import { Shield, Palette } from 'lucide-react';
import { GameEngine } from '../../game/GameEngine';
import { UpgradeOption, UPGRADE_CONFIGS } from '../../types/game';
import { SHIP_SKINS } from '../../config/visuals/hangarVisuals';
import type { ShipSkinId } from '../../config/visuals/hangarVisuals';
import { soundEngine } from '../../game/audio/soundEngine';
import { MenuPanelHeader, ReturnToBridgeButton } from './MenuPanel';

interface LoadoutTabProps {
  engine: GameEngine;
  activeSkin: ShipSkinId;
  onSkinChange: (skin: ShipSkinId) => void;
  onStateUpdate: () => void;
  onBack: () => void;
}

const isUpgradeOwned = (engine: GameEngine, option: UpgradeOption) => {
  switch (option) {
    case UpgradeOption.DUAL_CANNONS:
      return engine.ownedWeaponLevel >= 2;
    case UpgradeOption.TRIPLE_CANNONS:
      return engine.ownedWeaponLevel >= 3;
    case UpgradeOption.DOUBLE_LIVES:
      return engine.doubleLives;
    case UpgradeOption.INFINITE_LIVES:
      return engine.infiniteLives;
    default:
      return false;
  }
};

export const LoadoutTab: React.FC<LoadoutTabProps> = ({
  engine,
  activeSkin,
  onSkinChange,
  onStateUpdate,
  onBack,
}) => (
  <div className="bg-slate-950/90 backdrop-blur-md border border-purple-500/50 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200 max-h-[66vh] overflow-y-auto">
    <MenuPanelHeader
      icon={<Shield size={16} />}
      title="STARFIGHTER LOADOUT & UPGRADES"
      titleClassName="text-purple-400"
      onBack={onBack}
    />

    <div>
      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
        <Palette size={12} className="text-purple-400" /> STARFIGHTER LIVERY
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {(Object.keys(SHIP_SKINS) as ShipSkinId[]).map((skinKey) => (
          <button
            key={skinKey}
            type="button"
            onClick={() => onSkinChange(skinKey)}
            className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[10px] font-mono font-bold ${
              activeSkin === skinKey
                ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            {SHIP_SKINS[skinKey].name}
          </button>
        ))}
      </div>
    </div>

    <div className="text-[11px] text-amber-300 font-mono font-bold bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-1.5 flex justify-between items-center">
      <span>AVAILABLE CREDITS:</span>
      <span className="text-sm font-black">{engine.credits} CR</span>
    </div>

    <div className="space-y-2">
      {UPGRADE_CONFIGS.filter((u) => u.id !== UpgradeOption.RETURN).map((u) => {
        const owned = isUpgradeOwned(engine, u.id);
        return (
          <div
            key={u.id}
            className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                {u.name}
                {owned && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    MOUNTED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{u.subtitle}</div>
            </div>

            <button
              type="button"
              disabled={owned || engine.credits < u.cost}
              onClick={() => {
                soundEngine.playUiClick();
                engine.buyUpgrade(u.id);
                onStateUpdate();
              }}
              onMouseEnter={() => soundEngine.playUiHover()}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                owned
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                  : engine.credits >= u.cost
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                  : 'bg-slate-800/40 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              {owned ? 'ACTIVE' : `${u.cost} CR`}
            </button>
          </div>
        );
      })}
    </div>

    <ReturnToBridgeButton onClick={onBack} />
  </div>
);
