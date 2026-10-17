import { EnemyType, PowerUpType, WeaponMode } from '../../types/game';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_SPEED,
    MAX_SHIELD,
    MAX_WEAPON_ENERGY,
} from '../constants';

export interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
}

export interface Bullet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    isFromPlayer: boolean;
    color?: string;
    size?: number;
}

export interface Bomb {
    x: number;
    y: number;
    speed: number;
}

export interface Enemy {
    x: number;
    y: number;
    startX: number;
    startY: number;
    angle: number;
    type: EnemyType;
    diving: boolean;
    hp: number;
    maxHp: number;
}

export interface PowerUp {
    x: number;
    y: number;
    type: PowerUpType;
    bobAngle: number;
    speed: number;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    g: number;
    b: number;
    life: number;
    maxLife: number;
    size: number;
}

export interface PlayerState {
    x: number;
    y: number;
    width: number;
    height: number;
    lives: number;
    maxLives?: number;
    shield: number;
    score: number;
    weaponLevel: number;
    weaponMode: WeaponMode;
    unlockedWeaponModes: WeaponMode[];
    weaponEnergy: number;
    isLaserActive?: boolean;
    movingLeft: boolean;
    movingRight: boolean;
    movingUp?: boolean;
    movingDown?: boolean;
    lastHitTime?: number;
    recentDamageTaken?: number;
    damageFlash?: number;
    shieldLag?: number;
    hitNotice?: string;
    hitNoticeTimer?: number;
}

export interface WeaponAnnouncement {
    title: string;
    subtitle: string;
    color: string;
    timer: number;
    maxTimer: number;
}

export class PlayerEntityService {
    public static createPlayer(
        x: number,
        ownedWeaponLevel: number,
        doubleLives: boolean,
        infiniteLives: boolean
    ): PlayerState {
        return {
            x,
            y: GAME_HEIGHT - PLAYER_HEIGHT - 30,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            lives: infiniteLives ? 999999 : doubleLives ? 6 : 3,
            shield: MAX_SHIELD,
            score: 0,
            weaponLevel: ownedWeaponLevel,
            weaponMode: WeaponMode.STANDARD,
            unlockedWeaponModes: [WeaponMode.STANDARD],
            weaponEnergy: MAX_WEAPON_ENERGY,
            movingLeft: false,
            movingRight: false,
            movingUp: false,
            movingDown: false,
        };
    }

    public static createPlayers(
        twoPlayerMode: boolean,
        ownedWeaponLevel: number,
        doubleLives: boolean,
        infiniteLives: boolean
    ): { player1: PlayerState; player2: PlayerState | null } {
        if (twoPlayerMode) {
            return {
                player1: this.createPlayer(
                    GAME_WIDTH / 2 - PLAYER_WIDTH - 30,
                    ownedWeaponLevel,
                    doubleLives,
                    infiniteLives
                ),
                player2: this.createPlayer(
                    GAME_WIDTH / 2 + 30,
                    ownedWeaponLevel,
                    doubleLives,
                    infiniteLives
                ),
            };
        }

        return {
            player1: this.createPlayer(
                GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
                ownedWeaponLevel,
                doubleLives,
                infiniteLives
            ),
            player2: null,
        };
    }

    public static updateMovement(
        player: PlayerState,
        left: boolean,
        right: boolean,
        up: boolean,
        down: boolean
    ): void {
        player.movingLeft = left;
        player.movingRight = right;
        player.movingUp = up;
        player.movingDown = down;

        let dx = 0;
        let dy = 0;
        if (left) dx -= PLAYER_SPEED;
        if (right) dx += PLAYER_SPEED;
        if (up) dy -= PLAYER_SPEED;
        if (down) dy += PLAYER_SPEED;

        if (dx !== 0 || dy !== 0) {
            player.x = Math.max(10, Math.min(GAME_WIDTH - player.width - 10, player.x + dx));
            player.y = Math.max(260, Math.min(GAME_HEIGHT - player.height - 10, player.y + dy));
        }
    }

    public static updateEffectsAndEnergy(player: PlayerState, regenerateEnergy: boolean): void {
        if (regenerateEnergy && player.weaponEnergy < MAX_WEAPON_ENERGY) {
            player.weaponEnergy = Math.min(MAX_WEAPON_ENERGY, player.weaponEnergy + 0.08);
        }

        if (player.damageFlash && player.damageFlash > 0) {
            player.damageFlash = Math.max(0, player.damageFlash - 0.04);
        }

        if (player.shieldLag === undefined) {
            player.shieldLag = player.shield;
        }
        if (player.shieldLag > player.shield) {
            player.shieldLag = Math.max(player.shield, player.shieldLag - 1.25);
        } else if (player.shieldLag < player.shield) {
            player.shieldLag = player.shield;
        }

        if (player.hitNoticeTimer && player.hitNoticeTimer > 0) {
            player.hitNoticeTimer--;
            if (player.hitNoticeTimer === 0) {
                player.hitNotice = undefined;
            }
        }
    }
}