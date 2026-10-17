import type { GameInputActions, PlayerInputState, VirtualButtonAction } from '../../types/input';

export class InputManager {
    // Wewnętrzny stan przycisków wirtualnych / dotykowych
    private virtualP1 = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false,
        roll: false,
    };

    private virtualP2 = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false,
        roll: false,
    };

    public isTwoPlayer = false;

    // Aktywne stany klawiatury
    private keys: Record<string, boolean> = {};

    // Rejestr callbacków dla akcji zdarzeniowych
    private onWeaponCycle?: (dir: 1 | -1) => void;
    private onWeaponSelect?: (modeIdx: number) => void;
    private onPauseToggle?: () => void;
    private onAchievementsToggle?: () => void;
    private onFireStart?: (pIdx: number) => void;
    private onFireEnd?: (pIdx: number) => void;

    private handleKeyDown = (e: KeyboardEvent) => {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true;

        // Przełączanie trybów broni (Q / E)
        if (e.key === 'q' || e.key === 'Q') {
            this.onWeaponCycle?.(-1);
        } else if (e.key === 'e' || e.key === 'E') {
            this.onWeaponCycle?.(1);
        }

        // Wybór broni klawiszami numerycznymi (1-4)
        if (e.key === '1') this.onWeaponSelect?.(0);
        if (e.key === '2') this.onWeaponSelect?.(1);
        if (e.key === '3') this.onWeaponSelect?.(2);
        if (e.key === '4') this.onWeaponSelect?.(3);

        // Menu pauzy
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            this.onPauseToggle?.();
        }

        // Panel osiągnięć
        if (e.key === 'Tab') {
            e.preventDefault();
            this.onAchievementsToggle?.();
        }

        // Zdarzenia rozpoczęcia ognia
        if (e.code === 'Space') {
            this.onFireStart?.(1);
        }
        if (e.code === 'Numpad0' || e.code === 'Enter') {
            this.onFireStart?.(2);
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;

        if (e.code === 'Space') {
            this.onFireEnd?.(1);
        }
        if (e.code === 'Numpad0' || e.code === 'Enter') {
            this.onFireEnd?.(2);
        }
    };

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }

    // --- API ZDARZENIOWE ---

    public setOnWeaponCycle(cb: (dir: 1 | -1) => void) {
        this.onWeaponCycle = cb;
    }

    public setOnWeaponSelect(cb: (modeIdx: number) => void) {
        this.onWeaponSelect = cb;
    }

    public setOnPauseToggle(cb: () => void) {
        this.onPauseToggle = cb;
    }

    public setOnAchievementsToggle(cb: () => void) {
        this.onAchievementsToggle = cb;
    }

    public setOnFireStart(cb: (pIdx: number) => void) {
        this.onFireStart = cb;
    }

    public setOnFireEnd(cb: (pIdx: number) => void) {
        this.onFireEnd = cb;
    }

    // --- OBSŁUGA KONTROLEK WIRTUALNYCH / TOUCH ---

    public setVirtualButton(player: 1 | 2, action: VirtualButtonAction, pressed: boolean) {
        const target = player === 1 ? this.virtualP1 : this.virtualP2;
        target[action] = pressed;

        if (action === 'fire') {
            if (pressed) {
                this.onFireStart?.(player);
            } else {
                this.onFireEnd?.(player);
            }
        }
    }

    // --- ZNORMALIZOWANE WEKTORY INTENCJI ---

    public getPlayer1Actions(): PlayerInputState {
        let moveX = 0;
        let moveY = 0;

        // Dopasowanie wektora do docelowej percepcji ruchu ekranowego
        if (this.isP1MovingLeft()) moveX -= 1;
        if (this.isP1MovingRight()) moveX += 1;
        if (this.isP1MovingDown()) moveY -= 1;
        if (this.isP1MovingUp()) moveY += 1;

        return {
            moveX,
            moveY,
            fire: this.isP1Firing(),
            roll: this.virtualP1.roll || this.keys['shiftleft'] || false,
        };
    }

    public getPlayer2Actions(): PlayerInputState {
        let moveX = 0;
        let moveY = 0;

        if (this.isP2MovingLeft()) moveX -= 1;
        if (this.isP2MovingRight()) moveX += 1;
        if (this.isP2MovingDown()) moveY -= 1;
        if (this.isP2MovingUp()) moveY += 1;

        return {
            moveX,
            moveY,
            fire: this.isP2Firing(),
            roll: this.virtualP2.roll || this.keys['numpad1'] || false,
        };
    }

    public getInputActions(): GameInputActions {
        return {
            p1: this.getPlayer1Actions(),
            p2: this.getPlayer2Actions(),
            isTwoPlayer: this.isTwoPlayer,
        };
    }

    // --- ODCZYTY DLA PĘTLI SILNIKA ---
    // Odwrócenie osi: klawisze lewo aktywują flagę lewo dla silnika (zgodnie z układem współrzędnych sceny)

    public isP1MovingLeft(): boolean {
        const keyboardLeft =
            this.keys['arrowleft'] ||
            (!this.isTwoPlayer && (this.keys['a'] || this.keys['keya']));
        // Zwraca stan pod fizyczny ruch statku w lewo na ekranie
        return this.virtualP1.right || Boolean(this.keys['arrowright'] || (!this.isTwoPlayer && (this.keys['d'] || this.keys['keyd'])));
    }

    public isP1MovingRight(): boolean {
        const keyboardRight =
            this.keys['arrowright'] ||
            (!this.isTwoPlayer && (this.keys['d'] || this.keys['keyd']));
        // Zwraca stan pod fizyczny ruch statku w prawo na ekranie
        return this.virtualP1.left || Boolean(this.keys['arrowleft'] || (!this.isTwoPlayer && (this.keys['a'] || this.keys['keya'])));
    }

    public isP1MovingUp(): boolean {
        const keyboardUp = this.keys['arrowup'] || (!this.isTwoPlayer && (this.keys['w'] || this.keys['keyw']));
        return this.virtualP1.up || Boolean(keyboardUp);
    }

    public isP1MovingDown(): boolean {
        const keyboardDown = this.keys['arrowdown'] || (!this.isTwoPlayer && (this.keys['s'] || this.keys['keys']));
        return this.virtualP1.down || Boolean(keyboardDown);
    }

    public isP1Firing(): boolean {
        return this.virtualP1.fire || this.keys['space'] || this.keys[' '] || false;
    }

    public isP2MovingLeft(): boolean {
        if (!this.isTwoPlayer) return false;
        return this.virtualP2.left || this.keys['a'] || this.keys['keya'] || this.keys['numpad4'] || this.keys['j'] || false;
    }

    public isP2MovingRight(): boolean {
        if (!this.isTwoPlayer) return false;
        return this.virtualP2.right || this.keys['d'] || this.keys['keyd'] || this.keys['numpad6'] || this.keys['l'] || false;
    }

    public isP2MovingUp(): boolean {
        if (!this.isTwoPlayer) return false;
        return this.virtualP2.up || this.keys['w'] || this.keys['keyw'] || this.keys['numpad8'] || this.keys['i'] || false;
    }

    public isP2MovingDown(): boolean {
        if (!this.isTwoPlayer) return false;
        return this.virtualP2.down || this.keys['s'] || this.keys['keys'] || this.keys['numpad5'] || this.keys['k'] || false;
    }

    public isP2Firing(): boolean {
        if (!this.isTwoPlayer) return false;
        return this.virtualP2.fire || this.keys['f'] || this.keys['keyf'] || this.keys['numpad0'] || this.keys['enter'] || false;
    }

    // Kompatybilność wsteczna dla kontrolek dotykowych (TouchControls)
    public get p1Left() { return this.virtualP1.left; }
    public set p1Left(val: boolean) { this.virtualP1.left = val; }

    public get p1Right() { return this.virtualP1.right; }
    public set p1Right(val: boolean) { this.virtualP1.right = val; }

    public get p1Up() { return this.virtualP1.up; }
    public set p1Up(val: boolean) { this.virtualP1.up = val; }

    public get p1Down() { return this.virtualP1.down; }
    public set p1Down(val: boolean) { this.virtualP1.down = val; }

    public get p1Fire() { return this.virtualP1.fire; }
    public set p1Fire(val: boolean) { this.virtualP1.fire = val; }

    public get p2Left() { return this.virtualP2.left; }
    public set p2Left(val: boolean) { this.virtualP2.left = val; }

    public get p2Right() { return this.virtualP2.right; }
    public set p2Right(val: boolean) { this.virtualP2.right = val; }

    public get p2Up() { return this.virtualP2.up; }
    public set p2Up(val: boolean) { this.virtualP2.up = val; }

    public get p2Down() { return this.virtualP2.down; }
    public set p2Down(val: boolean) { this.virtualP2.down = val; }

    public get p2Fire() { return this.virtualP2.fire; }
    public set p2Fire(val: boolean) { this.virtualP2.fire = val; }

    public reset() {
        this.virtualP1 = { left: false, right: false, up: false, down: false, fire: false, roll: false };
        this.virtualP2 = { left: false, right: false, up: false, down: false, fire: false, roll: false };
        this.keys = {};
    }

    public dispose() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }
    }
}