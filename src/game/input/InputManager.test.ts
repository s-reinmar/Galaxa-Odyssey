import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InputManager } from './InputManager';

describe('InputManager keyboard adapter', () => {
    let listeners: Map<string, EventListener>;
    let addEventListener: ReturnType<typeof vi.fn>;
    let removeEventListener: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        listeners = new Map();
        addEventListener = vi.fn((type: string, listener: EventListener) => {
            listeners.set(type, listener);
        });
        removeEventListener = vi.fn();
        vi.stubGlobal('window', {
            addEventListener,
            removeEventListener,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('translates keyboard commands and exposes pressed keys through input state', () => {
        const manager = new InputManager();
        const cycleWeapon = vi.fn();
        const startFire = vi.fn();
        const endFire = vi.fn();
        manager.setOnWeaponCycle(cycleWeapon);
        manager.setOnFireStart(startFire);
        manager.setOnFireEnd(endFire);

        listeners.get('keydown')?.({ key: 'q', code: 'KeyQ' } as KeyboardEvent);
        listeners.get('keydown')?.({ key: ' ', code: 'Space' } as KeyboardEvent);

        expect(cycleWeapon).toHaveBeenCalledWith(-1);
        expect(startFire).toHaveBeenCalledWith(1);
        expect(manager.isP1Firing()).toBe(true);

        listeners.get('keyup')?.({ key: ' ', code: 'Space' } as KeyboardEvent);

        expect(endFire).toHaveBeenCalledWith(1);
        expect(manager.isP1Firing()).toBe(false);
        manager.dispose();
    });

    it('removes the registered DOM listeners when disposed', () => {
        const manager = new InputManager();

        manager.dispose();

        expect(addEventListener).toHaveBeenCalledTimes(2);
        expect(removeEventListener).toHaveBeenCalledTimes(2);
        expect(removeEventListener).toHaveBeenCalledWith('keydown', listeners.get('keydown'));
        expect(removeEventListener).toHaveBeenCalledWith('keyup', listeners.get('keyup'));
    });
});
