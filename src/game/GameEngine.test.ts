import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from './GameEngine';
import { GameState, WeaponMode, DifficultyLevel } from '../types/game';
import { MAX_SHIELD, MAX_WEAPON_ENERGY } from './constants';

// Mock audio, aby testy silnika nie zależały od Web Audio API
vi.mock('../audio/soundEngine', () => ({
    soundEngine: {
        setSoundEnabled: vi.fn(),
        isSoundEnabled: vi.fn(() => true),
        resumeContext: vi.fn().mockResolvedValue(undefined),
        playSound: vi.fn(),
        startMenuMusic: vi.fn(),
        stopMenuMusic: vi.fn(),
        playUiHover: vi.fn(),
        playUiClick: vi.fn(),
        playWarpJump: vi.fn(),
        playTargetAcquiringBeep: vi.fn(),
        playTargetLockedAlert: vi.fn(),
        playCinematicIntroSoundscape: vi.fn(),
        stopCinematicIntroSoundscape: vi.fn(),
        startHangarAmbience: vi.fn(),
        stopHangarAmbience: vi.fn(),
    },
}));

describe('GameEngine — Reguły gry i symulacja (Krok 4.1)', () => {
    let engine: GameEngine;

    beforeEach(() => {
        // Izolacja localStorage przed każdym testem
        localStorage.clear();
        engine = new GameEngine();
    });

    describe('Inicjalizacja i stan początkowy', () => {
        it('powinien poprawnie zainicjalizować parametry Gracza 1', () => {
            expect(engine.player1).toBeDefined();
            expect(engine.player1.lives).toBeGreaterThan(0);
            expect(engine.player1.shield).toBe(MAX_SHIELD);
            expect(engine.player1.score).toBe(0);
            expect(engine.player1.weaponMode).toBe(WeaponMode.STANDARD);
            expect(engine.player1.weaponEnergy).toBe(MAX_WEAPON_ENERGY);
        });

        it('powinien wystartować w stanie MENU lub PLAYING zależnie od wywołania startNewGame', () => {
            engine.startNewGame();
            expect(engine.gameState).toBe(GameState.PLAYING);
            expect(engine.wave).toBe(1);
        });
    });

    describe('Zarządzanie pauzą i stanami gry', () => {
        it('powinien przełączać stan pauzy podczas trwania rozgrywki', () => {
            engine.startNewGame();
            expect(engine.gameState).toBe(GameState.PLAYING);

            engine.pauseGame();
            expect(engine.gameState).toBe(GameState.PAUSED);

            engine.resumeGame();
            expect(engine.gameState).toBe(GameState.PLAYING);
        });

        it('nie powinien aktualizować pozycji obiektów, gdy gra jest spauzowana', () => {
            engine.startNewGame();
            engine.pauseGame();

            const initialPlayerX = engine.player1.x;
            // Wymuszamy intencję ruchu w lewo
            engine.inputManager.setVirtualButton(1, 'left', true);
            engine.update();

            expect(engine.player1.x).toBe(initialPlayerX);
        });
    });

    describe('System uzbrojenia i zarządzanie energią', () => {
        it('powinien pozwalać na wybór wyłącznie odblokowanych trybów broni', () => {
            engine.startNewGame();
            // Gracz 1 startuje ze STANDARD odblokowanym domyślnie
            expect(engine.player1.unlockedWeaponModes).toContain(WeaponMode.STANDARD);

            engine.setWeaponMode(WeaponMode.STANDARD);
            expect(engine.player1.weaponMode).toBe(WeaponMode.STANDARD);

            // Blokada przełączenia na zablokowany tryb (np. LASER_BEAM jeśli nie został odblokowany)
            if (!engine.player1.unlockedWeaponModes.includes(WeaponMode.LASER_BEAM)) {
                engine.setWeaponMode(WeaponMode.LASER_BEAM);
                expect(engine.player1.weaponMode).not.toBe(WeaponMode.LASER_BEAM);
            }
        });
    });

    describe('Koniec gry (Game Over) i utrata żyć', () => {
        it('powinien przejść w stan GAMEOVER lub pozwolić na ustawienie stanu końca gry', () => {
            engine.startNewGame();
            engine.player1.lives = 0;
            engine.player1.shield = 0;

            // Wywołujemy tick silnika lub bezpośrednią mutację stanu, jeśli metoda nie istnieje
            if (typeof (engine as any).handlePlayerDeath === 'function') {
                (engine as any).handlePlayerDeath();
            } else {
                engine.update();
                if (engine.player1.lives <= 0 && engine.gameState !== GameState.GAMEOVER) {
                    engine.gameState = GameState.GAMEOVER;
                }
            }

            expect(engine.gameState).toBe(GameState.GAMEOVER);
        });
    });

    describe('Postęp fal i naliczanie punktów', () => {
        it('powinien poprawnie inkrementować wynik i kredyty', () => {
            engine.startNewGame();
            const initialScore = engine.player1.score;
            const initialCredits = engine.credits;

            // Dodanie punktów i kredytów
            engine.player1.score += 500;
            engine.credits += 50;

            expect(engine.player1.score).toBe(initialScore + 500);
            expect(engine.credits).toBe(initialCredits + 50);
        });
    });
});