import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../game/audio/soundEngine';
import { useCombatScene } from './useCombatScene';
import { useCombatShortcuts } from './useCombatShortcuts';
import { useGameLoop } from './useGameLoop';
import type { CameraViewMode, ProjectedTarget } from '../rendering/three/combatSceneTypes';
import type { ShipSkinId } from '../config/visuals/hangarVisuals';
import type { WeaponMode } from '../types/game';
import { calculateCombatHudMetrics } from '../game/services/combatHudMetrics';
import { selectCombatViewModel } from '../game/services/combatViewModel';

interface Modern3DGameCanvasControllerOptions {
    engine: GameEngine;
    onStateUpdate: () => void;
    selectedSkin: ShipSkinId;
    onReturnToHangar?: () => void;
    onToggleFullscreen?: () => void;
}

const TELEMETRY_INTERVAL_MS = 33;
const EMPTY_TELEMETRY = { targets: [] as ProjectedTarget[], primaryTarget: null as ProjectedTarget | null };

const VIEW_CYCLE: Record<CameraViewMode, CameraViewMode> = {
    CHASE_3D: 'COCKPIT_3D',
    COCKPIT_3D: 'TACTICAL_3D',
    TACTICAL_3D: 'CHASE_3D',
};

export function useModern3DGameCanvasController({
    engine,
    onStateUpdate,
    selectedSkin,
    onReturnToHangar,
    onToggleFullscreen,
}: Modern3DGameCanvasControllerOptions) {
    const { containerRef, sceneRef } = useCombatScene(selectedSkin);
    const [viewMode, setViewMode] = useState<CameraViewMode>('CHASE_3D');
    const [isWarpActive, setIsWarpActive] = useState(false);
    const [showRadar, setShowRadar] = useState(true);
    const [targetTelemetry, setTargetTelemetry] = useState(EMPTY_TELEMETRY);
    const lastTelemetryAt = useRef(0);

    useGameLoop(engine, (eng) => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.syncWithFrame(eng);
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

    useEffect(() => {
        sceneRef.current?.setViewMode(viewMode);
    }, [viewMode, selectedSkin, sceneRef]);

    const toggleRadar = useCallback(() => setShowRadar((prev) => !prev), []);
    const handleToggleRadar = useCallback(() => {
        soundEngine.playUiClick();
        toggleRadar();
    }, [toggleRadar]);

    useCombatShortcuts({
        engine,
        onStateUpdate,
        onToggleView: toggleViewMode,
        onToggleRadar: toggleRadar,
        onReturnToHangar,
        onToggleFullscreen,
    });

    const returnToHangar = useCallback(() => {
        if (onReturnToHangar) onReturnToHangar();
        else engine.returnToMenu();
        onStateUpdate();
    }, [engine, onReturnToHangar, onStateUpdate]);

    const handleSelectWeapon = useCallback((mode: WeaponMode) => {
        if (!engine.player1.unlockedWeaponModes.includes(mode)) return;

        soundEngine.playUiClick();
        engine.setWeaponMode(mode);
        onStateUpdate();
    }, [engine, onStateUpdate]);

    const handleManualWarpJump = useCallback(() => {
        soundEngine.playWarpJump();
        sceneRef.current?.triggerHyperspaceJump();
    }, [sceneRef]);

    const handleResume = useCallback(() => {
        engine.resumeGame();
        onStateUpdate();
    }, [engine, onStateUpdate]);

    const handleRedeploy = useCallback(() => {
        engine.startNewGame();
        sceneRef.current?.triggerHyperspaceArrival();
        onStateUpdate();
    }, [engine, onStateUpdate, sceneRef]);

    return {
        containerRef,
        sceneRef,
        viewMode,
        isWarpActive,
        showRadar,
        targetTelemetry,
        view: selectCombatViewModel(engine),
        hudMetrics: calculateCombatHudMetrics(engine.player1),
        toggleViewMode,
        handleToggleRadar,
        handleSelectWeapon,
        handleManualWarpJump,
        returnToHangar,
        handleResume,
        handleRedeploy,
    };
}
