/**
 * Główny słownik języka polskiego (pl-PL) oraz definicja schematu translacji.
 * Single Source of Truth dla warstwy językowej UI.
 */
export const plPL = {
    common: {
        back: 'POWRÓT',
        confirm: 'POTWIERDŹ',
        cancel: 'ANULUJ',
        close: 'ZAMKNIJ',
        loading: 'ŁADOWANIE...',
        credits: 'KREDYTY',
        score: 'WYNIK',
        wave: 'FALA',
        lives: 'ŻYCIA',
    },
    menu: {
        title: 'GALAGA ODYSSEY',
        subtitle: 'Odrodzenie Legendy 3D',
        startGame: 'ROZPOCZNIJ MISJĘ',
        coopGame: 'TRYB WSPÓŁPRACY (2P)',
        hangar: 'HANGAR MYŚLIWCA',
        upgrades: 'MODYFIKACJE STATKU',
        achievements: 'OSIĄGNIĘCIA',
        settings: 'OPCJE SYSTEMOWE',
        howToPlay: 'INSTRUKCJA PILOTA',
    },
    difficulty: {
        title: 'WYBIERZ POZIOM TRUDNOŚCI',
        easy: 'Kadet (Easy)',
        normal: 'Weteran (Normal)',
        hard: 'Ekspert (Hard)',
    },
    hangar: {
        padStatusReady: 'STATUS: GOTOWY DO STARTU',
        launchSequence: 'PROCEDURA STARTOWA',
        abortSequence: 'PRZERWIJ PROCEDURĘ',
        skinSelector: 'MALOWANIE KADŁUBA',
        cameraInspection: 'INSPEKCJA SYSTEMÓW',
        cameraPresets: {
            default: 'WIDOK DOKU',
            cockpit: 'KOKPIT',
            weapons: 'DZIAŁA',
            engines: 'SILNIKI JONOWE',
            cinematic: 'KAMERA KINOWA',
        },
        skins: {
            stealth: 'Mroczny Cień (Void Stealth)',
            titanium: 'Słoneczny Tytan (Solar Titanium)',
            cyberpunk: 'Cyfrowy Impuls (Cyber Pulse)',
            hyperion: 'Arktyczny Hiperion (Hyperion Arctic)',
        },
    },
    hud: {
        shield: 'TARCZA',
        hull: 'KADŁUB',
        energy: 'ENERGIA',
        overheat: 'PRZEGRZANIE',
        lockOn: 'NAMIERZANIE',
        targetAcquired: 'CEL ZABLOKOWANY',
        warning: 'ZAGROŻENIE',
        danger: 'KRYTYCZNE USZKODZENIA',
    },
    weapons: {
        standard: 'Działo Pulsacyjne',
        tripleShot: 'Potrójny Wachlarz',
        laserBeam: 'Promień Hiperlaserowy',
        plasmaSpread: 'Rozrzut Plazmowy',
    },
    settings: {
        title: 'OPCJE SYSTEMU POKŁADOWEGO',
        audio: 'DŹWIĘK I MUZYKA',
        sfxVolume: 'GŁOŚNOŚĆ EFEKTÓW',
        musicVolume: 'GŁOŚNOŚĆ MUZYKI',
        particles: 'EFEKTY CZĄSTECZKOWE',
        graphics: 'JAKOŚĆ GRAFIKI',
    },
    gameOver: {
        title: 'STATEK ZNISZCZONY',
        victoryTitle: 'SEKTOR OCZYSZCZONY',
        finalScore: 'KOŃCOWY WYNIK',
        wavesCleared: 'UKOŃCZONE FALE',
        retry: 'PONÓW PRÓBĘ',
        returnToMenu: 'POWRÓT DO BAZY',
    },
};

type DeepRecord<T> = {
    [K in keyof T]: T[K] extends Record<string, unknown> ? DeepRecord<T[K]> : string;
};

export type TranslationSchema = DeepRecord<typeof plPL>;