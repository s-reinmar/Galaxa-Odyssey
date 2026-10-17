import { useEffect, useRef } from 'react';
import { SpaceCombat3DScene } from '../components/3d/SpaceCombat3DScene';
import { ShipSkinId } from '../components/3d/SpaceHangarScene';

/** Owns the lifecycle of the Three.js combat scene attached to the returned container ref. */
export function useCombatScene(selectedSkin: ShipSkinId) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<SpaceCombat3DScene | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new SpaceCombat3DScene(container, selectedSkin);
        sceneRef.current = scene;

        const ro = new ResizeObserver(() => {
            window.dispatchEvent(new Event('resize'));
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            scene.dispose();
            sceneRef.current = null;
        };
    }, [selectedSkin]);

    return { containerRef, sceneRef };
}
