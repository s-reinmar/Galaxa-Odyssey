import type {
    DifficultyLevel,
    EnemyType,
    WeaponMode,
    UpgradeOption,
    SoundType,
    DifficultyConfig,
    EnemyConfig,
    WeaponModeConfig,
    UpgradeConfig,
} from '../../types/game';

/**
 * Konfiguracje poziomów trudności
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
    EASY: {
        displayName: 'EASY',
        enemySpeedMultiplier: 0.8,
        additionalRows: -1,
        enemyFireMultiplier: 0.65,
        damageMultiplier: 0.75,
        bombChanceMultiplier: 0.65,
        bombSpeedMultiplier: 0.9,
    },
    NORMAL: {
        displayName: 'NORMAL',
        enemySpeedMultiplier: 1.0,
        additionalRows: 0,
        enemyFireMultiplier: 1.0,
        damageMultiplier: 1.0,
        bombChanceMultiplier: 1.0,
        bombSpeedMultiplier: 1.0,
    },
    HARD: {
        displayName: 'HARD',
        enemySpeedMultiplier: 1.25,
        additionalRows: 1,
        enemyFireMultiplier: 1.45,
        damageMultiplier: 1.35,
        bombChanceMultiplier: 1.5,
        bombSpeedMultiplier: 1.15,
    },
};

/**
 * Konfiguracje wrogów
 */
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
    STANDARD: { score: 100, credits: 5, difficulty: 1, width: 38, height: 32, hp: 1 },
    ELITE: { score: 250, credits: 15, difficulty: 2, width: 44, height: 36, hp: 3 },
    BOSS: { score: 1500, credits: 100, difficulty: 5, width: 72, height: 56, hp: 35 },
    ESCORT: { score: 200, credits: 10, difficulty: 2, width: 36, height: 32, hp: 2 },
    DIVING: { score: 150, credits: 8, difficulty: 1.5, width: 38, height: 32, hp: 1 },
    SWARM: { score: 80, credits: 3, difficulty: 1, width: 28, height: 26, hp: 1 },
};

/**
 * Konfiguracje trybów uzbrojenia
 */
export const WEAPON_MODE_CONFIGS: Record<WeaponMode, WeaponModeConfig> = {
    STANDARD: {
        name: 'Standard Blaster',
        label: 'BLASTER',
        description: 'Rapid concentrated dual/triple forward pulse cannons',
        color: '#37f5ff',
        glow: 'rgba(55, 245, 255, 0.4)',
        cooldown: 8,
        fireRate: 8,
        energyCost: 0,
        sound: 'SHOOT' as SoundType,
    },
    TRIPLE_SHOT: {
        name: 'Triple Fan Shot',
        label: 'TRIPLE SHOT',
        description: '3-way angled spread shot sweeping through entire enemy formations',
        color: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.4)',
        cooldown: 9,
        fireRate: 9,
        energyCost: 1.5,
        sound: 'TRIPLE_SHOT' as SoundType,
    },
    LASER_BEAM: {
        name: 'Hyper Laser Beam',
        label: 'LASER BEAM',
        description: 'Piercing high-energy coherent continuous beam cutting through all targets',
        color: '#ff37a6',
        glow: 'rgba(255, 55, 166, 0.5)',
        cooldown: 3,
        fireRate: 3,
        energyCost: 0.8,
        sound: 'LASER' as SoundType,
    },
    PLASMA_SPREAD: {
        name: 'Plasma Spread',
        label: 'PLASMA SPREAD',
        description: 'Heavy 5-way destructive arc bolts vaporizing bombs & dive-bombers',
        color: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.4)',
        cooldown: 11,
        fireRate: 11,
        energyCost: 2.5,
        sound: 'TRIPLE_SHOT' as SoundType,
    },
};

/**
 * Konfiguracja ulepszeń
 */
export const UPGRADE_CONFIGS: UpgradeConfig[] = [
    { id: 'DUAL_CANNONS' as UpgradeOption, name: 'DUAL CANNONS', subtitle: 'Fire two projectiles simultaneously', cost: 120 },
    { id: 'TRIPLE_CANNONS' as UpgradeOption, name: 'TRIPLE CANNONS', subtitle: 'Fire three spread projectiles', cost: 260 },
    { id: 'DOUBLE_LIVES' as UpgradeOption, name: 'DOUBLE LIVES', subtitle: 'Start missions with double lives (6 lives)', cost: 5000 },
    { id: 'INFINITE_LIVES' as UpgradeOption, name: 'INFINITE LIVES', subtitle: 'Damage never removes lives (invincible)', cost: 50000000 },
    { id: 'RETURN' as UpgradeOption, name: 'RETURN TO HANGAR', subtitle: 'Back to main menu', cost: 0 },
];

export interface LocalizedText {
    pl: string;
    en: string;
}

export const WEAPON_LABELS: Record<
    WeaponMode,
    { name: LocalizedText; label: LocalizedText; description: LocalizedText }
> = {
    STANDARD: {
        name: { pl: 'Działo pulsacyjne', en: 'Standard Blaster' },
        label: { pl: 'BLASTER', en: 'BLASTER' },
        description: {
            pl: 'Szybkie, skupione pociski pulsacyjne wystrzeliwane do przodu',
            en: 'Rapid concentrated forward pulse cannons',
        },
    },
    TRIPLE_SHOT: {
        name: { pl: 'Potrójny wachlarz', en: 'Triple Fan Shot' },
        label: { pl: 'POTRÓJNY', en: 'TRIPLE' },
        description: {
            pl: 'Rozproszony strzał pod kątem, omiatający całe formacje wrogów',
            en: 'Angled spread shot sweeping through entire enemy formations',
        },
    },
    LASER_BEAM: {
        name: { pl: 'Promień hiperlaserowy', en: 'Hyper Laser Beam' },
        label: { pl: 'LASER', en: 'LASER' },
        description: {
            pl: 'Przenikliwa, ciągła wiązka energii tnąca wszystkie cele',
            en: 'Piercing continuous energy beam cutting through all targets',
        },
    },
    PLASMA_SPREAD: {
        name: { pl: 'Rozrzut plazmowy', en: 'Plasma Spread' },
        label: { pl: 'PLAZMA', en: 'PLASMA' },
        description: {
            pl: 'Ciężkie, pięciokierunkowe pociski łukowe niszczące bomby i bombowce',
            en: 'Heavy five-way arc bolts vaporizing bombs and dive-bombers',
        },
    },
};

/**
 * Lokalizowane nazwy i opisy ulepszeń (klucz = UpgradeOption), bez wpływu na mechanikę.
 */
export const UPGRADE_LABELS: Record<string, { name: LocalizedText; subtitle: LocalizedText }> = {
    DUAL_CANNONS: {
        name: { pl: 'PODWÓJNE DZIAŁA', en: 'DUAL CANNONS' },
        subtitle: { pl: 'Strzelaj dwoma pociskami jednocześnie', en: 'Fire two projectiles simultaneously' },
    },
    TRIPLE_CANNONS: {
        name: { pl: 'POTRÓJNE DZIAŁA', en: 'TRIPLE CANNONS' },
        subtitle: { pl: 'Strzelaj trzema rozproszonymi pociskami', en: 'Fire three spread projectiles' },
    },
    DOUBLE_LIVES: {
        name: { pl: 'PODWÓJNE ŻYCIA', en: 'DOUBLE LIVES' },
        subtitle: { pl: 'Rozpoczynaj misje z podwójną liczbą żyć (6 żyć)', en: 'Start missions with double lives (6 lives)' },
    },
    INFINITE_LIVES: {
        name: { pl: 'NIESKOŃCZONE ŻYCIA', en: 'INFINITE LIVES' },
        subtitle: { pl: 'Obrażenia nie odbierają żyć (niezniszczalność)', en: 'Damage never removes lives (invincible)' },
    },
    RETURN: {
        name: { pl: 'POWRÓT DO HANGARU', en: 'RETURN TO HANGAR' },
        subtitle: { pl: 'Powrót do menu głównego', en: 'Back to main menu' },
    },
};