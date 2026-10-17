import type { IHangarSceneEntity } from '../contracts/IHangarSceneEntity';

export type { IHangarSceneEntity } from '../contracts/IHangarSceneEntity';

export type LaunchPhase = 'DOCKED' | 'ALIGNING' | 'DOORS_OPENING' | 'ACCELERATING' | 'LAUNCHED';

export interface LaunchSequenceListener {
    onPhaseChange?: (phase: LaunchPhase) => void;
    onLaunchComplete?: () => void;
}

/**
 * LaunchSequenceController
 * Koordynuje procedurę startową myśliwca z platformy lądowiska w hangarze.
 */
export class LaunchSequenceController {
    private phase: LaunchPhase = 'DOCKED';
    private hangar: IHangarSceneEntity;
    private listeners: LaunchSequenceListener[] = [];
    private sequenceTimer: number = 0;

    constructor(hangar: IHangarSceneEntity) {
        this.hangar = hangar;
    }

    public addListener(listener: LaunchSequenceListener): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: LaunchSequenceListener): void {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    public getPhase(): LaunchPhase {
        return this.phase;
    }

    public initiateLaunch(): void {
        if (this.phase === 'DOCKED') {
            this.setPhase('ALIGNING');
            this.sequenceTimer = 0;
        }
    }

    public update(deltaTime: number): void {
        this.sequenceTimer += deltaTime;

        switch (this.phase) {
            case 'ALIGNING': {
                const isAligned = this.hangar.alignPadToForward(deltaTime);
                if (isAligned || this.sequenceTimer > 1.5) {
                    this.hangar.resetPadRotation();
                    this.hangar.setGateOpen(true);
                    this.setPhase('DOORS_OPENING');
                    this.sequenceTimer = 0;
                }
                break;
            }

            case 'DOORS_OPENING': {
                if (this.hangar.isGateCleared() || this.sequenceTimer > 1.2) {
                    this.setPhase('ACCELERATING');
                    this.sequenceTimer = 0;
                }
                break;
            }

            case 'ACCELERATING': {
                if (this.sequenceTimer > 1.0) {
                    this.setPhase('LAUNCHED');
                    for (const listener of this.listeners) {
                        listener.onLaunchComplete?.();
                    }
                }
                break;
            }

            case 'DOCKED':
            case 'LAUNCHED':
            default:
                break;
        }
    }

    public reset(): void {
        this.phase = 'DOCKED';
        this.sequenceTimer = 0;
        this.hangar.setGateOpen(false);
        this.hangar.resetPadRotation();
    }

    private setPhase(newPhase: LaunchPhase): void {
        this.phase = newPhase;
        for (const listener of this.listeners) {
            listener.onPhaseChange?.(newPhase);
        }
    }
}