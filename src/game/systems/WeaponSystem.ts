import { SoundType, WeaponMode } from '../../types/game';
import { Bullet, PlayerState } from '../entities/GameEntities';
import { GameAudioService } from '../audio/GameAudioService';
import type { IGameAudio } from '../audio/IGameAudio';

export class WeaponSystem {
    public fireCooldown = 0;
    public secondPlayerFireCooldown = 0;
    private laserSoundTimer = 0;

    constructor(private readonly audio: IGameAudio = new GameAudioService()) {}

    public setWeaponMode(player: PlayerState, mode: WeaponMode): boolean {
        if (player.unlockedWeaponModes.includes(mode)) {
            player.weaponMode = mode;
            player.isLaserActive = false;
            return true;
        }
        return false;
    }

    public cycleWeaponMode(player: PlayerState, direction: 1 | -1 = 1): boolean {
        const modes = player.unlockedWeaponModes;
        if (modes.length <= 1) return false;

        const currIdx = modes.indexOf(player.weaponMode);
        const nextIdx = (currIdx + direction + modes.length) % modes.length;
        player.weaponMode = modes[nextIdx];
        player.isLaserActive = false;
        this.audio.playSound(SoundType.SHOOT);
        return true;
    }

    public firePlayer1(player: PlayerState, bullets: Bullet[]): void {
        if (player.lives <= 0) return;

        if (player.weaponMode === WeaponMode.LASER_BEAM) {
            if (player.weaponEnergy > 2) {
                player.isLaserActive = true;
                player.weaponEnergy = Math.max(0, player.weaponEnergy - 0.4);
                this.laserSoundTimer++;
                if (this.laserSoundTimer % 7 === 0) {
                    this.audio.playSound(SoundType.LASER);
                }
            } else {
                player.isLaserActive = false;
                this.fireCooldown = this.spawnStandardBlaster(player, bullets);
            }
            return;
        }

        player.isLaserActive = false;

        if (player.weaponMode === WeaponMode.TRIPLE_SHOT) {
            this.fireCooldown = this.spawnTripleShot(player, bullets);
            player.weaponEnergy = Math.max(0, player.weaponEnergy - 1.2);
        } else if (player.weaponMode === WeaponMode.PLASMA_SPREAD) {
            this.fireCooldown = this.spawnPlasmaSpread(player, bullets);
            player.weaponEnergy = Math.max(0, player.weaponEnergy - 1.8);
        } else {
            this.fireCooldown = this.spawnStandardBlaster(player, bullets);
        }
    }

    public firePlayer2(player2: PlayerState | null, bullets: Bullet[]): void {
        if (!player2 || player2.lives <= 0) return;
        this.secondPlayerFireCooldown = this.spawnStandardBlaster(player2, bullets);
    }

    private spawnStandardBlaster(p: PlayerState, bullets: Bullet[]): number {
        this.audio.playSound(SoundType.SHOOT);
        const lvl = p.weaponLevel;

        if (lvl === 1) {
            bullets.push({
                x: p.x + p.width / 2,
                y: p.y,
                vx: 0,
                vy: -11,
                isFromPlayer: true,
                color: '#41f0ff',
            });
        } else if (lvl === 2) {
            bullets.push(
                {
                    x: p.x + 8,
                    y: p.y,
                    vx: 0,
                    vy: -11,
                    isFromPlayer: true,
                    color: '#41f0ff',
                },
                {
                    x: p.x + p.width - 8,
                    y: p.y,
                    vx: 0,
                    vy: -11,
                    isFromPlayer: true,
                    color: '#41f0ff',
                }
            );
        } else {
            bullets.push(
                {
                    x: p.x + p.width / 2,
                    y: p.y - 4,
                    vx: 0,
                    vy: -11,
                    isFromPlayer: true,
                    color: '#41f0ff',
                },
                {
                    x: p.x + 2,
                    y: p.y,
                    vx: 0,
                    vy: -11,
                    isFromPlayer: true,
                    color: '#41f0ff',
                },
                {
                    x: p.x + p.width - 2,
                    y: p.y,
                    vx: 0,
                    vy: -11,
                    isFromPlayer: true,
                    color: '#41f0ff',
                }
            );
        }

        return Math.max(5, 12 - lvl * 2);
    }

    private spawnTripleShot(p: PlayerState, bullets: Bullet[]): number {
        this.audio.playSound(SoundType.TRIPLE_SHOT);
        const cx = p.x + p.width / 2;
        const cy = p.y;

        bullets.push(
            {
                x: cx,
                y: cy - 4,
                vx: 0,
                vy: -12,
                isFromPlayer: true,
                color: '#fbbf24',
                size: 5,
            },
            {
                x: cx - 10,
                y: cy,
                vx: -3.8,
                vy: -11.5,
                isFromPlayer: true,
                color: '#fbbf24',
                size: 4,
            },
            {
                x: cx + 10,
                y: cy,
                vx: 3.8,
                vy: -11.5,
                isFromPlayer: true,
                color: '#fbbf24',
                size: 4,
            }
        );

        if (p.weaponLevel >= 3) {
            bullets.push(
                {
                    x: cx - 18,
                    y: cy + 4,
                    vx: -6.2,
                    vy: -10,
                    isFromPlayer: true,
                    color: '#f59e0b',
                    size: 3,
                },
                {
                    x: cx + 18,
                    y: cy + 4,
                    vx: 6.2,
                    vy: -10,
                    isFromPlayer: true,
                    color: '#f59e0b',
                    size: 3,
                }
            );
        }

        return 8;
    }

    private spawnPlasmaSpread(p: PlayerState, bullets: Bullet[]): number {
        this.audio.playSound(SoundType.TRIPLE_SHOT);
        const cx = p.x + p.width / 2;
        const cy = p.y;
        const angles = [-5.2, -2.6, 0, 2.6, 5.2];

        for (const vx of angles) {
            bullets.push({
                x: cx,
                y: cy,
                vx,
                vy: -11,
                isFromPlayer: true,
                color: '#c084fc',
                size: 5,
            });
        }
        return 10;
    }
}