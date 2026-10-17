import { MutableRefObject, useCallback, useState } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { soundEngine } from '../../game/audio/soundEngine';
import { ShipSkinId, SpaceHangarScene } from '../3d/SpaceHangarScene';
import { SHIP_SKIN_STORAGE_KEY } from './menuTypes';

export function useShipSkin(
  engine: GameEngine,
  sceneRef: MutableRefObject<SpaceHangarScene | null>
) {
  const [activeSkin, setActiveSkin] = useState<ShipSkinId>(
    () => (localStorage.getItem(SHIP_SKIN_STORAGE_KEY) as ShipSkinId) || 'titanium'
  );

  const changeSkin = useCallback(
    (skinId: ShipSkinId) => {
      soundEngine.playUiClick();
      setActiveSkin(skinId);
      try {
        localStorage.setItem(SHIP_SKIN_STORAGE_KEY, skinId);
      } catch {}
      sceneRef.current?.setShipSkin(skinId);
      engine.unlockAchievement('skin_collector');
    },
    [engine, sceneRef]
  );

  return { activeSkin, changeSkin };
}
