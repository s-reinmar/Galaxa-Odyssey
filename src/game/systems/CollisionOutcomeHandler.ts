import {
    DIFFICULTY_CONFIGS,
    EnemyType,
    ENEMY_CONFIGS,
    PowerUpType,
    SoundType,
    WeaponMode,
} from '../../types/game';
import { soundEngine } from '../../audio/soundEngine';
import {
    MAX_SHIELD,
    MAX_WEAPON_ENERGY,
} from '../constants';
import { Bomb, Enemy, PlayerState, PowerUp } from '../entities/GameEntities';
import type { CollisionEvent, ICollisionContext } from './CollisionSystem';

export class CollisionOutcomeHandler {
    public handle(event: CollisionEvent, ctx: ICollisionContext): void {
        switch (event.type) {
            case 'laser-bomb-hit':
                ctx.addLaserSparks(event.laserX, event.bombCenterY, '#ff37a6', 5);
                this.removeBomb(event.bomb, ctx);
                ctx.addExplosion(event.bomb.x + 12, event.bomb.y + 12, 255, 70, 80, 40);
                soundEngine.playSound(SoundType.EXPLOSION);
                ctx.incrementProgress('bomb_defuser', 1);
                return;
            case 'laser-enemy-hit':
                ctx.addLaserSparks(event.laserX, event.enemyCenterY, '#ff37a6', 3);
                event.enemy.hp -= 0.35;
                if (event.enemy.hp <= 0) {
                    this.removeEnemy(event.enemy, ctx);
                    ctx.addExplosion(event.enemy.x + 16, event.enemy.y + 16, 255, 55, 166, 30);
                    this.handleEnemyDestroyed(event.enemy, ctx);
                }
                return;
            case 'player-bullet-bomb-hit':
                this.removeBullet(event.bullet, ctx);
                this.removeBomb(event.bomb, ctx);
                ctx.addExplosion(event.bomb.x + 12, event.bomb.y + 12, 255, 70, 80, 45);
                soundEngine.playSound(SoundType.EXPLOSION);
                ctx.incrementProgress('bomb_defuser', 1);
                ctx.incrementProgress('bomb_demolisher', 1);
                return;
            case 'player-bullet-enemy-hit':
                this.removeBullet(event.bullet, ctx);
                event.enemy.hp -= 1;
                if (event.enemy.hp <= 0) {
                    this.removeEnemy(event.enemy, ctx);
                    ctx.addExplosion(event.enemy.x + 16, event.enemy.y + 16, 255, 0, 255, 25);
                    this.handleEnemyDestroyed(event.enemy, ctx);
                } else {
                    ctx.addLaserSparks(event.enemy.x + 16, event.enemy.y + 16, '#37f5ff', 3);
                }
                return;
            case 'enemy-bullet-player-hit':
                this.removeBullet(event.bullet, ctx);
                this.damagePlayer(event.player, this.calculateDamage(ctx), ctx);
                return;
            case 'bomb-player-hit':
                this.removeBomb(event.bomb, ctx);
                ctx.addExplosion(event.player.x + 20, event.player.y + 20, 255, 70, 80, 50);
                soundEngine.playSound(SoundType.EXPLOSION);
                this.damagePlayer(event.player, 100, ctx);
                return;
            case 'enemy-player-hit':
                this.removeEnemy(event.enemy, ctx);
                ctx.addExplosion(event.enemy.x + 16, event.enemy.y + 16, 255, 120, 60, 30);
                soundEngine.playSound(SoundType.EXPLOSION);
                this.damagePlayer(event.player, this.calculateDamage(ctx), ctx);
                return;
            case 'players-dead':
                ctx.onAllPlayersDead();
                return;
            case 'power-up-player-hit':
                this.collectPowerUp(event.powerUp, event.player, ctx);
                return;
        }
    }

    private removeBullet(bullet: ICollisionContext['bullets'][number], ctx: ICollisionContext): void {
        const index = ctx.bullets.indexOf(bullet);
        if (index !== -1) ctx.bullets.splice(index, 1);
    }

    private removeBomb(bomb: Bomb, ctx: ICollisionContext): void {
        const index = ctx.bombs.indexOf(bomb);
        if (index !== -1) ctx.bombs.splice(index, 1);
    }

    private removeEnemy(enemy: Enemy, ctx: ICollisionContext): void {
        const index = ctx.enemies.indexOf(enemy);
        if (index !== -1) ctx.enemies.splice(index, 1);
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

    private calculateDamage(ctx: ICollisionContext): number {
        const difficulty = DIFFICULTY_CONFIGS[ctx.difficultyLevel];
        return Math.max(
            1,
            Math.round(Math.min(70, 40 + Math.floor(ctx.wave / 3)) * difficulty.damageMultiplier)
        );
    }

    private collectPowerUp(powerUp: PowerUp, player: PlayerState, ctx: ICollisionContext): void {
        const index = ctx.powerUps.indexOf(powerUp);
        if (index === -1) return;
        ctx.powerUps.splice(index, 1);

        ctx.incrementProgress('power_surge', 1);
        ctx.incrementProgress('token_collector', 1);

        if (powerUp.type === PowerUpType.TOKEN_TRIPLE_SHOT) {
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
        } else if (powerUp.type === PowerUpType.TOKEN_LASER_BEAM) {
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
        } else if (powerUp.type === PowerUpType.TOKEN_PLASMA_SPREAD) {
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
        } else if (powerUp.type === PowerUpType.SHIELD_BOOST) {
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
        } else if (powerUp.type === PowerUpType.EXTRA_LIFE) {
            player.lives += 1;
            ctx.weaponAnnouncement = {
                title: '❤️ EXTRA PILOT LIFE ACQUIRED',
                subtitle: 'Hull Backup Unit Online',
                color: '#4ade80',
                timer: 100,
                maxTimer: 100,
            };
            soundEngine.playSound(SoundType.POWER_UP);
        } else if (powerUp.type === PowerUpType.WEAPON) {
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
