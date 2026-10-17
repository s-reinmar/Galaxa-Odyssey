import React, { useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { CameraViewMode, ProjectedTarget } from './3d/SpaceCombat3DScene';
import { SpaceCombatRadar } from './3d/SpaceCombatRadar';
import { SpaceCombatLockOnHUD } from './3d/SpaceCombatLockOnHUD';
import { GameState, WeaponMode } from '../types/game';
import { MAX_SHIELD, MAX_WEAPON_ENERGY } from '../game/constants';
import { soundEngine } from '../game/audio/soundEngine';
import { Camera, Sparkles, Flame, Radio, Radar, Maximize2, Minimize2 } from 'lucide-react';
import { ShipSkinId } from './3d/SpaceHangarScene';
import { CockpitHUDOverlay } from './3d/CockpitHUDOverlay';
import { ShieldPanel } from './game/ShieldPanel';
import { WeaponCapacitorPanel } from './game/WeaponCapacitorPanel';
import { WeaponSelector } from './game/WeaponSelector';
import { WarpBanner } from './game/WarpBanner';
import { PauseOverlay } from './game/PauseOverlay';
import { GameOverOverlay } from './game/GameOverOverlay';
import { useGameLoop } from '../hooks/useGameLoop';
import { useCombatScene } from '../hooks/useCombatScene';
import { useCombatShortcuts } from '../hooks/useCombatShortcuts';

interface Modern3DGameCanvasProps {
    engine: GameEngine;
    onStateUpdate: () => void;
    selectedSkin?: ShipSkinId;
    onReturnToHangar?: () => void;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

const TELEMETRY_INTERVAL_MS = 33;
const EMPTY_TELEMETRY = { targets: [] as ProjectedTarget[], primaryTarget: null as ProjectedTarget | null };

const VIEW_CYCLE: Record<CameraViewMode, CameraViewMode> = {
    CHASE_3D: 'COCKPIT_3D',
    COCKPIT_3D: 'TACTICAL_3D',
    TACTICAL_3D: 'CHASE_3D',
};

const percentOf = (value: number, max: number) => Math.max(0, Math.min(100, Math.round((value / max) * 100)));

export const Modern3DGameCanvas: React.FC<Modern3DGameCanvasProps> = ({
    engine,
    onStateUpdate,
    selectedSkin = 'titanium',
    onReturnToHangar,
    isFullscreen = false,
    onToggleFullscreen,
}) => {
    const { containerRef, sceneRef } = useCombatScene(selectedSkin);
    const [viewMode, setViewMode] = useState<CameraViewMode>('CHASE_3D');
    const [isWarpActive, setIsWarpActive] = useState(false);
    const [showRadar, setShowRadar] = useState(true);
    const [targetTelemetry, setTargetTelemetry] = useState(EMPTY_TELEMETRY);
    const lastTelemetryAt = useRef(0);

    // Logic runs at a fixed 60 Hz inside useGameLoop; this callback only syncs the view.
    useGameLoop(engine, (eng) => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.syncWithEngine(eng);
        setIsWarpActive(scene.isWarpJumping);

        const now = performance.now();
        if (now - lastTelemetryAt.current >= TELEMETRY_INTERVAL_MS) {
            lastTelemetryAt.current = now;
            setTargetTelemetry(scene.getProjectedTargetData(eng));
        }
    });

    const toggleViewMode = useCallback(() => {
        soundEngine.playUiClick();
        setViewMode((prev) => VIEW_CYCLE[prev]);
    }, []);

    // Keep the 3D scene camera in sync with the selected view mode
    React.useEffect(() => {
        sceneRef.current?.setViewMode(viewMode);
    }, [viewMode, selectedSkin, sceneRef]);

    const toggleRadar = useCallback(() => setShowRadar((prev) => !prev), []);

    useCombatShortcuts({
        engine,
        onStateUpdate,
        onToggleView: toggleViewMode,
        onToggleRadar: toggleRadar,
        onReturnToHangar,
        onToggleFullscreen,
    });

    const returnToHangar = () => {
        if (onReturnToHangar) onReturnToHangar();
        else engine.returnToMenu();
        onStateUpdate();
    };

    const handleSelectWeapon = (mode: WeaponMode) => {
        if (engine.player1.unlockedWeaponModes.includes(mode)) {
            soundEngine.playUiClick();
            engine.setWeaponMode(mode);
            onStateUpdate();
        }
    };

    const handleManualWarpJump = () => {
        soundEngine.playWarpJump();
        sceneRef.current?.triggerHyperspaceJump();
    };

    const p1 = engine.player1;
    const shieldPercent = percentOf(p1.shield, MAX_SHIELD);
    const shieldLagPercent = Math.max(shieldPercent, percentOf(p1.shieldLag ?? p1.shield, MAX_SHIELD));
    const energyPercent = percentOf(p1.weaponEnergy, MAX_WEAPON_ENERGY);
    const isTakingDamage = !!(p1.damageFlash && p1.damageFlash > 0.1);

    return (
        <div
            className={`relative w-full h-full min-h-0 flex-1 overflow-hidden transition-all duration-150 bg-slate-950 select-none ${
                isTakingDamage
                    ? 'border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.45)]'
                    : 'border-cyan-500/30'
            }`}
        >
            <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

            {viewMode === 'COCKPIT_3D' && engine.gameState === GameState.PLAYING && (
                <CockpitHUDOverlay
                    shield={p1.shield}
                    maxShield={MAX_SHIELD}
                    energy={p1.weaponEnergy}
                    maxEnergy={MAX_WEAPON_ENERGY}
                    lives={p1.lives}
                    weaponMode={p1.weaponMode}
                    bankAngle={p1.movingLeft ? -0.35 : p1.movingRight ? 0.35 : 0}
                    isTakingDamage={isTakingDamage}
                    onToggleView={toggleViewMode}
                />
            )}

            {engine.gameState === GameState.PLAYING && viewMode !== 'COCKPIT_3D' && (
                <SpaceCombatLockOnHUD
                    targets={targetTelemetry.targets}
                    primaryTarget={targetTelemetry.primaryTarget}
                    weaponMode={p1.weaponMode}
                    isTakingDamage={isTakingDamage}
                />
            )}

            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-mono">
                <div className="w-full flex items-start justify-between gap-4 pointer-events-auto">
                    <ShieldPanel
                        shieldPercent={shieldPercent}
                        shieldLagPercent={shieldLagPercent}
                        lives={p1.lives}
                        isTakingDamage={isTakingDamage}
                        hitNotice={p1.hitNotice}
                    />

                    <div className="flex flex-col items-center gap-1.5">
                        <div className="px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-xs font-bold tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2">
                            <Radio size={12} className="text-cyan-400 animate-pulse" />
                            <span>SECTOR {engine.wave} • ACTIVE COMBAT ZONE</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleViewMode}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition text-[11px] shadow-sm"
                                title="Przełącz perspektywę kamery 3D (Klawisz V)"
                            >
                                <Camera size={13} className="text-cyan-400" />
                                <span>
                                    {viewMode === 'CHASE_3D' && 'Widok: Zza statku (3D)'}
                                    {viewMode === 'COCKPIT_3D' && 'Widok: Bliski pościg (3D)'}
                                    {viewMode === 'TACTICAL_3D' && 'Widok: Taktyczny (3D)'}
                                </span>
                                <span className="text-slate-500 text-[9px]">[V]</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleManualWarpJump}
                                disabled={isWarpActive}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white transition text-[11px]"
                                title="Wymuś skok w nadprzestrzeń (Warp Jump)"
                            >
                                <Flame size={12} className="text-indigo-400" />
                                <span>Warp</span>
                            </button>
                        </div>
                    </div>

                    <WeaponCapacitorPanel energyPercent={energyPercent} score={p1.score} credits={engine.credits} />
                </div>

                {isWarpActive && <WarpBanner wave={engine.wave} />}

                {engine.weaponAnnouncement && !isWarpActive && (
                    <div
                        className="self-center px-6 py-2 rounded-xl backdrop-blur-md border shadow-xl flex items-center gap-3 transition-all animate-bounce"
                        style={{
                            backgroundColor: 'rgba(8, 15, 42, 0.92)',
                            borderColor: engine.weaponAnnouncement.color,
                            boxShadow: `0 0 25px ${engine.weaponAnnouncement.color}40`,
                        }}
                    >
                        <Sparkles size={18} style={{ color: engine.weaponAnnouncement.color }} />
                        <div>
                            <div className="font-black text-sm text-white tracking-wide">{engine.weaponAnnouncement.title}</div>
                            <div className="text-[11px] text-slate-300">{engine.weaponAnnouncement.subtitle}</div>
                        </div>
                    </div>
                )}

                <div className="w-full flex items-end justify-between gap-4 pointer-events-auto">
                    <div className="flex flex-col items-start gap-1.5">
                        {showRadar && (
                            <div className="animate-in fade-in zoom-in-95 duration-150">
                                <SpaceCombatRadar
                                    targets={targetTelemetry.targets}
                                    primaryTarget={targetTelemetry.primaryTarget}
                                    wave={engine.wave}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400">
                            <button
                                type="button"
                                onClick={() => {
                                    soundEngine.playUiClick();
                                    toggleRadar();
                                }}
                                className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded transition ${
                                    showRadar
                                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                        : 'text-slate-400 hover:text-white bg-slate-800/60'
                                }`}
                                title="Przełącz Radar 3D (Klawisz R)"
                            >
                                <Radar size={11} className={showRadar ? 'text-cyan-400 animate-spin' : ''} style={{ animationDuration: '4s' }} />
                                <span>RADAR [R]</span>
                            </button>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">[A/D] lub [←/→] Ruch</span>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">[SPACJA] Ogień</span>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">[1-4] Broń</span>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <button
                                type="button"
                                onClick={toggleViewMode}
                                className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded transition ${
                                    viewMode === 'COCKPIT_3D'
                                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                        : 'text-slate-400 hover:text-white bg-slate-800/60'
                                }`}
                                title="Przełącz Perspektywę (Klawisz V)"
                            >
                                <Camera size={11} />
                                <span>{viewMode === 'COCKPIT_3D' ? 'KOKPIT' : 'TPP'} [V]</span>
                            </button>
                            {onToggleFullscreen && (
                                <>
                                    <span className="text-slate-600 hidden sm:inline">•</span>
                                    <button
                                        type="button"
                                        onClick={onToggleFullscreen}
                                        className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition"
                                        title="Przełącz Pełny Ekran [F]"
                                    >
                                        {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                                        <span className="hidden md:inline">{isFullscreen ? 'OKNO' : 'PEŁNY EKRAN'} [F]</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <WeaponSelector
                        unlockedModes={p1.unlockedWeaponModes}
                        activeMode={p1.weaponMode}
                        onSelect={handleSelectWeapon}
                    />

                    {engine.twoPlayerMode && engine.player2 && (
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-pink-500/30 text-[11px] text-pink-300 flex items-center gap-2">
                            <span className="font-bold">PILOT 2:</span>
                            <span>{engine.player2.lives > 0 ? `${engine.player2.lives} Lives` : 'KIA'}</span>
                        </div>
                    )}
                </div>
            </div>

            {engine.gameState === GameState.PAUSED && (
                <PauseOverlay
                    wave={engine.wave}
                    onResume={() => {
                        engine.resumeGame();
                        onStateUpdate();
                    }}
                    onToggleView={toggleViewMode}
                    onAbort={returnToHangar}
                />
            )}

            {engine.gameState === GameState.GAMEOVER && (
                <GameOverOverlay
                    wave={engine.wave}
                    score={p1.score}
                    credits={engine.credits}
                    onRedeploy={() => {
                        engine.startNewGame();
                        sceneRef.current?.triggerHyperspaceArrival();
                        onStateUpdate();
                    }}
                    onReturn={returnToHangar}
                />
            )}
        </div>
    );
};
