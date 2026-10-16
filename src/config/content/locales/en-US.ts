import type { TranslationSchema } from './pl-PL';

/**
 * Słownik języka angielskiego (en-US).
 * Rygorystycznie typowany na bazie TranslationSchema.
 */
export const enUS: TranslationSchema = {
    common: {
        back: 'BACK',
        confirm: 'CONFIRM',
        cancel: 'CANCEL',
        close: 'CLOSE',
        loading: 'LOADING...',
        credits: 'CREDITS',
        score: 'SCORE',
        wave: 'WAVE',
        lives: 'LIVES',
    },
    menu: {
        title: 'GALAGA ODYSSEY',
        subtitle: '3D Legend Reborn',
        startGame: 'LAUNCH MISSION',
        coopGame: 'CO-OP SORTIE (2P)',
        hangar: 'STARFIGHTER HANGAR',
        upgrades: 'SHIP UPGRADES',
        achievements: 'ACHIEVEMENTS',
        settings: 'SYSTEM SETTINGS',
        howToPlay: 'PILOT MANUAL',
    },
    difficulty: {
        title: 'SELECT DIFFICULTY LEVEL',
        easy: 'Cadet (Easy)',
        normal: 'Veteran (Normal)',
        hard: 'Expert (Hard)',
    },
    hangar: {
        padStatusReady: 'STATUS: READY FOR LAUNCH',
        launchSequence: 'LAUNCH SEQUENCE',
        abortSequence: 'ABORT PROCEDURE',
        skinSelector: 'HULL COATING',
        cameraInspection: 'SYSTEM INSPECTION',
        cameraPresets: {
            default: 'DOCK OVERVIEW',
            cockpit: 'COCKPIT',
            weapons: 'WEAPONS',
            engines: 'ION ENGINES',
            cinematic: 'CINEMATIC ORBIT',
        },
        skins: {
            stealth: 'Void Stealth',
            titanium: 'Solar Titanium',
            cyberpunk: 'Cyber Pulse',
            hyperion: 'Hyperion Arctic',
        },
    },
    hud: {
        shield: 'SHIELD',
        hull: 'HULL',
        energy: 'ENERGY',
        overheat: 'OVERHEAT',
        lockOn: 'LOCK-ON',
        targetAcquired: 'TARGET LOCKED',
        warning: 'WARNING',
        danger: 'CRITICAL DAMAGE',
    },
    weapons: {
        standard: 'Pulse Cannon',
        tripleShot: 'Triple Fan Shot',
        laserBeam: 'Hyper Laser Beam',
        plasmaSpread: 'Plasma Spread',
    },
    settings: {
        title: 'AVIONICS & SYSTEM SETTINGS',
        audio: 'AUDIO & MUSIC',
        sfxVolume: 'SFX VOLUME',
        musicVolume: 'MUSIC VOLUME',
        particles: 'PARTICLE EFFECTS',
        graphics: 'GRAPHICS FIDELITY',
    },
    gameOver: {
        title: 'MISSION FAILED',
        victoryTitle: 'SECTOR PURGED',
        finalScore: 'FINAL SCORE',
        wavesCleared: 'WAVES CLEARED',
        retry: 'SORTIE AGAIN',
        returnToMenu: 'RETURN TO BASE',
    },
};