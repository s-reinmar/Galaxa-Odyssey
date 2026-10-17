import { GameSaveData } from '../../types/game';

const SAVE_KEY = 'galaxa_odyssey_save';
const PROFILE_KEY = 'galaxa_odyssey_profile';
const ACHIEVEMENTS_KEY = 'galaxa_odyssey_achievements';

export interface UserProfileData {
    credits: number;
    profileScore: number;
    highScore: number;
    ownedWeaponLevel: number;
    doubleLives: boolean;
    infiniteLives: boolean;
    soundEnabled?: boolean;
    particlesEnabled?: boolean;
}

export class StorageService {
    public static loadProfile(): UserProfileData {
        try {
            if (typeof localStorage === 'undefined') {
                return this.getDefaultProfile();
            }
            const raw = localStorage.getItem(PROFILE_KEY);
            if (!raw) return this.getDefaultProfile();

            const data = JSON.parse(raw);
            return {
                credits: data.credits ?? 0,
                profileScore: data.profileScore ?? 0,
                highScore: data.highScore ?? 0,
                ownedWeaponLevel: data.ownedWeaponLevel ?? 1,
                doubleLives: !!data.doubleLives,
                infiniteLives: !!data.infiniteLives,
                soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
                particlesEnabled: typeof data.particlesEnabled === 'boolean' ? data.particlesEnabled : true,
            };
        } catch {
            return this.getDefaultProfile();
        }
    }

    public static saveProfile(profile: UserProfileData): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        } catch {
            // Storage error fallback
        }
    }

    public static loadSession(): GameSaveData | null {
        try {
            if (typeof localStorage === 'undefined') return null;
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as GameSaveData;
        } catch {
            return null;
        }
    }

    public static saveSession(session: GameSaveData): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(SAVE_KEY, JSON.stringify(session));
        } catch {
            // Storage error fallback
        }
    }

    public static hasSavedGame(): boolean {
        try {
            if (typeof localStorage === 'undefined') return false;
            return !!localStorage.getItem(SAVE_KEY);
        } catch {
            return false;
        }
    }

    public static clearSession(): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.removeItem(SAVE_KEY);
        } catch {
            // Storage error fallback
        }
    }

    public static loadAchievements<T>(defaultAchievements: T): T {
        try {
            if (typeof localStorage === 'undefined') return defaultAchievements;
            const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
            if (!raw) return defaultAchievements;
            return JSON.parse(raw) as T;
        } catch {
            return defaultAchievements;
        }
    }

    public static saveAchievements(achievements: unknown): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        } catch {
            // Storage error fallback
        }
    }

    private static getDefaultProfile(): UserProfileData {
        return {
            credits: 0,
            profileScore: 0,
            highScore: 0,
            ownedWeaponLevel: 1,
            doubleLives: false,
            infiniteLives: false,
            soundEnabled: true,
            particlesEnabled: true,
        };
    }
}