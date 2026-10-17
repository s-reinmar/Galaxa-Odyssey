import * as THREE from 'three';
import { CloneWarsHangar3D } from '../hangar/CloneWarsHangar3D';

/**
 * HangarFactory - odpowiada za tworzenie instancji aktywnej sceny hangaru 3D.
 */
export class HangarFactory {
    public static createCloneWarsHangar(): CloneWarsHangar3D {
        return new CloneWarsHangar3D();
    }

    public static createHangar(): CloneWarsHangar3D {
        return this.createCloneWarsHangar();
    }
}

/**
 * EntityFactory - tworzy pomocnicze światła sceny.
 */
export class EntityFactory {
    public static createDirectionalLight(
        color: THREE.ColorRepresentation = 0xffffff,
        intensity: number = 1.5,
        position: THREE.Vector3 = new THREE.Vector3(10, 20, 15)
    ): THREE.DirectionalLight {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.copy(position);
        light.castShadow = true;
        return light;
    }

    public static createAmbientLight(
        color: THREE.ColorRepresentation = 0x223344,
        intensity: number = 1.0
    ): THREE.AmbientLight {
        return new THREE.AmbientLight(color, intensity);
    }
}