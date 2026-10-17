import type { GameInputActions, PlayerInputState, VirtualButtonAction } from '../../types/input';
import KeyboardInput from './KeyboardInput';

export class InputManager {
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
    private keys: Record<string, boolean> = {};

    private onWeaponCycle?: (dir: 1 | -1) => void;
    private onWeaponSelect?: (modeIdx: number) => void;
    private onPauseToggle?: () => void;
    private onAchievementsToggle?: () => void;
    private onFireStart?: (pIdx: number) => void;
    private onFireEnd?: (pIdx: number) => void;
    private readonly keyboard: KeyboardInput;

    constructor() {
        this.keyboard = new KeyboardInput({
            onKeyChange: (key, code, pressed) => {
                this.keys[key] = pressed;
                this.keys[code] = pressed;
            },
            onWeaponCycle: (dir) => this.onWeaponCycle?.(dir),
            onWeaponSelect: (modeIdx) => this.onWeaponSelect?.(modeIdx),
            onPauseToggle: () => this.onPauseToggle?.(),
            onAchievementsToggle: () => this.onAchievementsToggle?.(),
            onFireStart: (pIdx) => this.onFireStart?.(pIdx),
            onFireEnd: (pIdx) => this.onFireEnd?.(pIdx),
        });
    }

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

    public getPlayer1Actions(): PlayerInputState {
        let moveX = 0;
        let moveY = 0;

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

    public isP1MovingLeft(): boolean {
        return this.virtualP1.right || Boolean(this.keys['arrowright'] || (!this.isTwoPlayer && (this.keys['d'] || this.keys['keyd'])));
    }

    public isP1MovingRight(): boolean {
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
        this.keyboard.dispose();
    }
}