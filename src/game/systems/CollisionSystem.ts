import {
    DifficultyLevel,
    DIFFICULTY_CONFIGS,
    EnemyType,
    ENEMY_CONFIGS,
    PowerUpType,
    SoundType,
    WeaponMode,
} from '../../types/game';
import {
    ENEMY_WIDTH,
    ENEMY_HEIGHT,
    BOMB_SIZE,
    POWERUP_TOKEN_SIZE,
    MAX_SHIELD,
    MAX_WEAPON_ENERGY,
    LASER_BEAM_WIDTH,
} from '../constants';
import { soundEngine } from '../../audio/soundEngine';
import {
    Bomb,
    Bullet,
    Enemy,
    PlayerState,
    PowerUp,
    WeaponAnnouncement,
} from '../entities/GameEntities';

export interface ICollisionContext {
    player1: PlayerState;
    player2: PlayerState | null;
    twoPlayerMode: boolean;
    difficultyLevel: DifficultyLevel;
    wave: number;
    credits: number;
    profileScore: number;
    highScore: number;
    infiniteLives: boolean;
    tookDamageInCurrentWave: boolean;
    bullets: Bullet[];
    bombs: Bomb[];
    enemies: Enemy[];
    powerUps: PowerUp[];
    weaponAnnouncement: WeaponAnnouncement | null;
    addExplosion: (x: number, y: number, r: number, g: number, b: number, count: number) => void;
    addLaserSparks: (x: number, y: number, colorHex: string, count?: number) => void;
    unlockAchievement: (id: string) => void;
    incrementProgress: (id: string, amount?: number) => void;
    onAllPlayersDead: () => void;
    notifyChange: () => void;
}

export class CollisionSystem {
    public intersects(
        x1: number,
        y1: number,
        w1: number,
        h1: number,
        x2: number,
        y2: number,
        w2: number,
        h2: number
    ): boolean {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    public resolveAllCollisions(ctx: ICollisionContext): void {
        this.resolveLaserBeamHits(ctx);
        this.resolveBulletHits(ctx);
        this.resolveEnemyAndHazardCollisions(ctx);
        this.resolvePowerUpCollisions(ctx);
    }

    private resolveLaserBeamHits(ctx: ICollisionContext): void {
        if (!ctx.player1.isLaserActive || ctx.player1.lives <= 0) return;

        const laserX = ctx.player1.x + ctx.player1.width / 2;
        const laserTop = 0;
        const laserBottom = ctx.player1.y;

        for (let bmi = ctx.bombs.length - 1; bmi >= 0; bmi--) {
            const bomb = ctx.bombs[bmi];
            const bombCenterX = bomb.x + 12;
            const bombCenterY = bomb.y + 12;

            if (
                Math.abs(bombCenterX - laserX) < LASER_BEAM_WIDTH / 2 + 12 &&
                bombCenterY >= laserTop &&
                bombCenterY <= laserBottom
            ) {
                ctx.addLaserSparks(laserX, bombCenterY, '#ff37a6', 5);
                ctx.bombs.splice(bmi, 1);
                ctx.addExplosion(bomb.x + 12, bomb.y + 12, 255, 70, 80, 40);
                soundEngine.playSound(SoundType.EXPLOSION);
                ctx.incrementProgress('bomb_defuser', 1);
            }
        }

        for (let ei = ctx.enemies.length - 1; ei >= 0; ei--) {
            const enemy = ctx.enemies[ei];
            const enemyCenterX = enemy.x + 16;
            const enemyCenterY = enemy.y + 16;

            if (
                Math.abs(enemyCenterX - laserX) < LASER_BEAM_WIDTH / 2 + 16 &&
                enemyCenterY >= laserTop &&
                enemyCenterY <= laserBottom
            ) {
                ctx.addLaserSparks(laserX, enemyCenterY, '#ff37a6', 3);
                enemy.hp -= 0.35;

                if (enemy.hp <= 0) {
                    ctx.enemies.splice(ei, 1);
                    ctx.addExplosion(enemy.x + 16, enemy.y + 16, 255, 55, 166, 30);
                    this.handleEnemyDestroyed(enemy, ctx);
                }
            }
        }
    }

    private resolveBulletHits(ctx: ICollisionContext): void {
        for (let bi = ctx.bullets.length - 1; bi >= 0; bi--) {
            const b = ctx.bullets[bi];
            if (!b.isFromPlayer) continue;

            let bulletHit = false;

            for (let bmi = ctx.bombs.length - 1; bmi >= 0; bmi--) {
                const bomb = ctx.bombs[bmi];
                if (this.intersects(b.x - 4, b.y, 8, 14, bomb.x, bomb.y, BOMB_SIZE, BOMB_SIZE)) {
                    ctx.bullets.splice(bi, 1);
                    ctx.bombs.splice(bmi, 1);
                    ctx.addExplosion(bomb.x + 12, bomb.y + 12, 255, 70, 80, 45);
                    soundEngine.playSound(SoundType.EXPLOSION);
                    bulletHit = true;
                    ctx.incrementProgress('bomb_defuser', 1);
                    ctx.incrementProgress('bomb_demolisher', 1);
                    break;
                }
            }
            if (bulletHit) continue;

            for (let ei = ctx.enemies.length - 1; ei >= 0; ei--) {
                const enemy = ctx.enemies[ei];
                if (this.intersects(b.x - 4, b.y, 8, 14, enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT)) {
                    ctx.bullets.splice(bi, 1);
                    enemy.hp -= 1;

                    if (enemy.hp <= 0) {
                        ctx.enemies.splice(ei, 1);
                        ctx.addExplosion(enemy.x + 16, enemy.y + 16, 255, 0, 255, 25);
                        this.handleEnemyDestroyed(enemy, ctx);
                    } else {
                        ctx.addLaserSparks(enemy.x + 16, enemy.y + 16, '#37f5ff', 3);
                    }
                    break;
                }
            }
        }
    }

    private handleEnemyDestroyed(enemy: Enemy, ctx: ICollisionContext): void {
        const cfg = ENEMY_CONFIGS[enemy.type];
        soundEngine.playSound(SoundType.EXPLOSION);

        ctx.player1.score += cfg.score;
        ctx.credits += cfg.credits;
        ctx.profileScore += cfg.score;
        ctx.highScore = Math.max(ctx.highScore, ctx.player1.score);

        ctx.incrementProgress('alien_exterminator', 1);
        if (enemy.diving) {
            ctx.incrementProgress('sharpshooter', 1);
        }

        if (enemy.type === EnemyType.ELITE) {
            ctx.incrementProgress('elite_hunter', 1);
            ctx.incrementProgress('ace_interceptor', 1);
            ctx.incrementProgress('boss_slayer', 1);
        }

        if (ctx.player1.score >= 3000) {
            ctx.unlockAchievement('high_roller');
        }
        if (ctx.player1.score >= 10000) {
            ctx.unlockAchievement('galactic_legend');
        }
        if (ctx.twoPlayerMode && ctx.player1.score + (ctx.player2?.score || 0) >= 2000) {
            ctx.unlockAchievement('wingman_savior');
        }
        if (ctx.credits >= 1000) {
            ctx.unlockAchievement('credit_tycoon');
        }

        this.dropTokenAt(enemy.x, enemy.y, enemy.type === EnemyType.ELITE, ctx.powerUps);
    }

    private dropTokenAt(x: number, y: number, isElite: boolean, powerUps: PowerUp[]): void {
        const chance = isElite ? 0.45 : 0.14;
        if (Math.random() >= chance) return;

        const roll = Math.random();
        let type: PowerUpType;

        if (isElite) {
            if (roll < 0.38) type = PowerUpType.TOKEN_LASER_BEAM;
            else if (roll < 0.68) type = PowerUpType.TOKEN_TRIPLE_SHOT;
            else if (roll < 0.85) type = PowerUpType.TOKEN_PLASMA_SPREAD;
            else type = PowerUpType.EXTRA_LIFE;
        } else {
            if (roll < 0.28) type = PowerUpType.TOKEN_TRIPLE_SHOT;
            else if (roll < 0.48) type = PowerUpType.TOKEN_LASER_BEAM;
            else if (roll < 0.65) type = PowerUpType.TOKEN_PLASMA_SPREAD;
            else if (roll < 0.82) type = PowerUpType.SHIELD_BOOST;
            else if (roll < 0.93) type = PowerUpType.WEAPON;
            else type = PowerUpType.EXTRA_LIFE;
        }

        powerUps.push({
            x,
            y,
            type,
            bobAngle: Math.random() * Math.PI * 2,
            speed: 1.8 + Math.random() * 0.6,
        });
    }

    private resolveEnemyAndHazardCollisions(ctx: ICollisionContext): void {
        const diff = DIFFICULTY_CONFIGS[ctx.difficultyLevel];
        const baseDamage = Math.max(
            1,
            Math.round(Math.min(70, 40 + Math.floor(ctx.wave / 3)) * diff.damageMultiplier)
        );

        const playersToCheck = [ctx.player1];
        if (ctx.twoPlayerMode && ctx.player2) playersToCheck.push(ctx.player2);

        for (const player of playersToCheck) {
            if (player.lives <= 0) continue;

            for (let bi = ctx.bullets.length - 1; bi >= 0; bi--) {
                const b = ctx.bullets[bi];
                if (b.isFromPlayer) continue;
                if (this.intersects(b.x - 3, b.y, 6, 12, player.x, player.y, player.width, player.height)) {
                    ctx.bullets.splice(bi, 1);
                    this.damagePlayer(player, baseDamage, ctx);
                    break;
                }
            }

            for (let bmi = ctx.bombs.length - 1; bmi >= 0; bmi--) {
                const bomb = ctx.bombs[bmi];
                if (this.intersects(bomb.x, bomb.y, BOMB_SIZE, BOMB_SIZE, player.x, player.y, player.width, player.height)) {
                    ctx.bombs.splice(bmi, 1);
                    ctx.addExplosion(player.x + 20, player.y + 20, 255, 70, 80, 50);
                    soundEngine.playSound(SoundType.EXPLOSION);
                    this.damagePlayer(player, 100, ctx);
                    break;
                }
            }

            for (let ei = ctx.enemies.length - 1; ei >= 0; ei--) {
                const enemy = ctx.enemies[ei];
                if (this.intersects(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT, player.x, player.y, player.width, player.height)) {
                    ctx.enemies.splice(ei, 1);
                    ctx.addExplosion(enemy.x + 16, enemy.y + 16, 255, 120, 60, 30);
                    soundEngine.playSound(SoundType.EXPLOSION);
                    this.damagePlayer(player, baseDamage, ctx);
                    break;
                }
            }
        }

        const p1Dead = ctx.player1.lives <= 0;
        const p2Dead = !ctx.twoPlayerMode || !ctx.player2 || ctx.player2.lives <= 0;
        if (p1Dead && p2Dead) {
            ctx.onAllPlayersDead();
        }
    }

    private damagePlayer(player: PlayerState, damage: number, ctx: ICollisionContext): void {
        ctx.tookDamageInCurrentWave = true;
        player.lastHitTime = Date.now();
        player.recentDamageTaken = damage;
        player.damageFlash = 1.0;

        if (ctx.infiniteLives) {
            player.shield = MAX_SHIELD;
            player.hitNotice = 'SHIELD DEFLECTED';
            player.hitNoticeTimer = 40;
            return;
        }

        if (player.shield > 0) {
            player.shield = Math.max(0, player.shield - damage);
            player.hitNotice = `-${damage} SHIELD`;
            player.hitNoticeTimer = 45;
            return;
        }

        player.lives -= 1;
        player.shield = MAX_SHIELD;
        player.hitNotice = 'CRITICAL HULL HIT!';
        player.hitNoticeTimer = 60;
        ctx.addExplosion(player.x + 20, player.y + 20, 80, 210, 255, 32);
        soundEngine.playSound(SoundType.EXPLOSION);
    }

    private resolvePowerUpCollisions(ctx: ICollisionContext): void {
        const playersToCheck = [ctx.player1];
        if (ctx.twoPlayerMode && ctx.player2) playersToCheck.push(ctx.player2);

        for (const player of playersToCheck) {
            if (player.lives <= 0) continue;
            for (let pi = ctx.powerUps.length - 1; pi >= 0; pi--) {
                const p = ctx.powerUps[pi];
                if (
                    this.intersects(
                        p.x,
                        p.y,
                        POWERUP_TOKEN_SIZE,
                        POWERUP_TOKEN_SIZE,
                        player.x,
                        player.y,
                        player.width,
                        player.height
                    )
                ) {
                    ctx.powerUps.splice(pi, 1);

                    ctx.incrementProgress('power_surge', 1);
                    ctx.incrementProgress('token_collector', 1);

                    if (p.type === PowerUpType.TOKEN_TRIPLE_SHOT) {
                        if (!player.unlockedWeaponModes.includes(WeaponMode.TRIPLE_SHOT)) {
                            player.unlockedWeaponModes.push(WeaponMode.TRIPLE_SHOT);
                        }
                        player.weaponMode = WeaponMode.TRIPLE_SHOT;
                        player.weaponEnergy = MAX_WEAPON_ENERGY;
                        player.isLaserActive = false;

                        ctx.weaponAnnouncement = {
                            title: '🔱 TRIPLE SHOT ENGAGED!',
                            subtitle: '3-Way Angled Fan Cannons Activated',
                            color: '#fbbf24',
                            timer: 130,
                            maxTimer: 130,
                        };
                        ctx.unlockAchievement('triple_threat');
                        soundEngine.playSound(SoundType.TOKEN_COLLECT);
                    } else if (p.type === PowerUpType.TOKEN_LASER_BEAM) {
                        if (!player.unlockedWeaponModes.includes(WeaponMode.LASER_BEAM)) {
                            player.unlockedWeaponModes.push(WeaponMode.LASER_BEAM);
                        }
                        player.weaponMode = WeaponMode.LASER_BEAM;
                        player.weaponEnergy = MAX_WEAPON_ENERGY;

                        ctx.weaponAnnouncement = {
                            title: '⚡ HYPER LASER BEAM ENGAGED!',
                            subtitle: 'Piercing Coherent Laser Column Activated',
                            color: '#ff37a6',
                            timer: 130,
                            maxTimer: 130,
                        };
                        ctx.unlockAchievement('laser_master');
                        soundEngine.playSound(SoundType.TOKEN_COLLECT);
                    } else if (p.type === PowerUpType.TOKEN_PLASMA_SPREAD) {
                        if (!player.unlockedWeaponModes.includes(WeaponMode.PLASMA_SPREAD)) {
                            player.unlockedWeaponModes.push(WeaponMode.PLASMA_SPREAD);
                        }
                        player.weaponMode = WeaponMode.PLASMA_SPREAD;
                        player.weaponEnergy = MAX_WEAPON_ENERGY;
                        player.isLaserActive = false;

                        ctx.weaponAnnouncement = {
                            title: '🔮 PLASMA SPREAD ENGAGED!',
                            subtitle: '5-Way Heavy Disruption Bolts Activated',
                            color: '#c084fc',
                            timer: 130,
                            maxTimer: 130,
                        };
                        ctx.unlockAchievement('plasma_conduit');
                        soundEngine.playSound(SoundType.TOKEN_COLLECT);
                    } else if (p.type === PowerUpType.SHIELD_BOOST) {
                        if (player.shield < 25) {
                            ctx.unlockAchievement('shield_sentinel');
                        }
                        player.shield = MAX_SHIELD;
                        ctx.weaponAnnouncement = {
                            title: '🛡️ MAXIMUM SHIELD RESTORED',
                            subtitle: 'Deflector System Overcharged to 100%',
                            color: '#38bdf8',
                            timer: 100,
                            maxTimer: 100,
                        };
                        soundEngine.playSound(SoundType.POWER_UP);
                    } else if (p.type === PowerUpType.EXTRA_LIFE) {
                        player.lives += 1;
                        ctx.weaponAnnouncement = {
                            title: '❤️ EXTRA PILOT LIFE ACQUIRED',
                            subtitle: 'Hull Backup Unit Online',
                            color: '#4ade80',
                            timer: 100,
                            maxTimer: 100,
                        };
                        soundEngine.playSound(SoundType.POWER_UP);
                    } else if (p.type === PowerUpType.WEAPON) {
                        player.weaponLevel = Math.min(3, player.weaponLevel + 1);
                        if (player.weaponLevel >= 3) {
                            ctx.unlockAchievement('full_arsenal');
                        }
                        ctx.weaponAnnouncement = {
                            title: `⭐ CANNON LEVEL ${player.weaponLevel}`,
                            subtitle: 'Primary Firepower Tier Upgraded',
                            color: '#22d3ee',
                            timer: 100,
                            maxTimer: 100,
                        };
                        soundEngine.playSound(SoundType.POWER_UP);
                    }

                    ctx.notifyChange();
                }
            }
        }
    }
}