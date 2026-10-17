import { ACHIEVEMENTS, AchievementProgress } from '../../types/achievements';
import { SoundType } from '../../types/game';
import { soundEngine } from '../../audio/soundEngine';
import { StorageService } from '../persistence/StorageService';

export interface ActiveAchievementToast {
    id: string;
    title: string;
    subtitle: string;
    rewardCredits: number;
    iconName: string;
}

export class AchievementManager {
    public achievements: Record<string, AchievementProgress> = {};
    public activeToast: ActiveAchievementToast | null = null;
    private toastTimeout: ReturnType<typeof setTimeout> | number | null = null;
    private _isOpen = false;

    private onStateChange?: () => void;
    private onCreditsReward?: (credits: number) => void;

    constructor(
        onStateChange?: () => void,
        onCreditsReward?: (credits: number) => void
    ) {
        this.onStateChange = onStateChange;
        this.onCreditsReward = onCreditsReward;
        this.load();
    }

    public get isOpen(): boolean {
        return this._isOpen;
    }

    public open(): void {
        this._isOpen = true;
        this.notify();
    }

    public close(): void {
        this._isOpen = false;
        this.notify();
    }

    public toggle(): void {
        this._isOpen = !this._isOpen;
        this.notify();
    }

    public load(): void {
        this.achievements = StorageService.loadAchievements(this.achievements);
        for (const ach of ACHIEVEMENTS) {
            if (!this.achievements[ach.id]) {
                this.achievements[ach.id] = {
                    unlocked: false,
                    currentProgress: 0,
                };
            }
        }
    }

    public save(): void {
        StorageService.saveAchievements(this.achievements);
    }

    public isUnlocked(id: string): boolean {
        return !!this.achievements[id]?.unlocked;
    }

    public getProgress(id: string): number {
        return this.achievements[id]?.currentProgress ?? 0;
    }

    public getUnlockedCount(): number {
        return ACHIEVEMENTS.filter((a) => this.isUnlocked(a.id)).length;
    }

    public getTotalCount(): number {
        return ACHIEVEMENTS.length;
    }

    public unlock(id: string): void {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (!ach) return;

        if (!this.achievements[id]) {
            this.achievements[id] = { unlocked: false, currentProgress: 0 };
        }

        if (this.achievements[id].unlocked) return;

        this.achievements[id].unlocked = true;
        this.achievements[id].unlockedAt = Date.now();
        this.achievements[id].currentProgress = ach.maxProgress;

        this.onCreditsReward?.(ach.rewardCredits);

        this.activeToast = {
            id: ach.id,
            title: ach.title,
            subtitle: ach.subtitle,
            rewardCredits: ach.rewardCredits,
            iconName: ach.iconName,
        };

        if (this.toastTimeout !== null) {
            clearTimeout(this.toastTimeout as number);
        }

        this.toastTimeout = setTimeout(() => {
            this.activeToast = null;
            this.notify();
        }, 4500);

        soundEngine.playSound(SoundType.POWER_UP);

        this.save();
        this.notify();
    }

    public increment(id: string, amount = 1): void {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (!ach) return;

        if (!this.achievements[id]) {
            this.achievements[id] = { unlocked: false, currentProgress: 0 };
        }

        if (this.achievements[id].unlocked) return;

        const newProg = (this.achievements[id].currentProgress || 0) + amount;
        this.achievements[id].currentProgress = Math.min(ach.maxProgress, newProg);

        if (this.achievements[id].currentProgress >= ach.maxProgress) {
            this.unlock(id);
        } else {
            this.save();
        }
    }

    public dismissToast(): void {
        this.activeToast = null;
        if (this.toastTimeout !== null) {
            clearTimeout(this.toastTimeout as number);
            this.toastTimeout = null;
        }
        this.notify();
    }

    private notify(): void {
        this.onStateChange?.();
    }
}