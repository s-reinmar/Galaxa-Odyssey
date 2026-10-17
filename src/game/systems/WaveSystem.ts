import {
    DifficultyLevel,
    DIFFICULTY_CONFIGS,
    EnemyType,
    ENEMY_CONFIGS,
} from '../../types/game';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    ENEMY_WIDTH,
    ENEMY_HEIGHT,
} from '../constants';
import { Bomb, Bullet, Enemy, PowerUp } from '../entities/GameEntities';

export interface WaveAchievementEvaluationParams {
    completedWave: number;
    difficultyLevel: DifficultyLevel;
    tookDamageInCurrentWave: boolean;
    player1Lives: number;
    currentWaveDuration: number;
    unlockAchievement: (id: string) => void;
    incrementProgress: (id: string, amount?: number) => void;
}

export class WaveSystem {
    public evaluateWaveAchievements(params: WaveAchievementEvaluationParams): void {
        const {
            completedWave,
            difficultyLevel,
            tookDamageInCurrentWave,
            player1Lives,
            currentWaveDuration,
            unlockAchievement,
            incrementProgress,
        } = params;

        if (completedWave < 1) return;

        unlockAchievement('first_wave');
        incrementProgress('wave_three', 1);

        if (completedWave >= 3) unlockAchievement('wave_three');
        if (completedWave >= 5) unlockAchievement('interstellar_ace');
        if (completedWave >= 10) unlockAchievement('cosmic_navigator');

        if (difficultyLevel === DifficultyLevel.HARD) {
            unlockAchievement('void_conqueror');
            if (completedWave >= 3) {
                unlockAchievement('nightmare_veteran');
            }
        }

        if (!tookDamageInCurrentWave) {
            unlockAchievement('indomitable');
        }
        if (player1Lives === 1) {
            unlockAchievement('near_death_escape');
        }
        if (currentWaveDuration > 0 && currentWaveDuration < 20) {
            unlockAchievement('speed_demon');
        }
    }

    public createWaveEnemies(wave: number, difficultyLevel: DifficultyLevel): Enemy[] {
        const diff = DIFFICULTY_CONFIGS[difficultyLevel];
        const rows = Math.max(1, Math.min(5, 2 + Math.floor(wave / 2) + diff.additionalRows));

        const cols = 8;
        const spacingX = 64;
        const spacingY = 48;
        const startX = (GAME_WIDTH - cols * spacingX) / 2 + spacingX / 2;
        const startY = 80;

        const enemies: Enemy[] = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let type = EnemyType.STANDARD;
                if (r === 0 && wave >= 2) {
                    type = EnemyType.ELITE;
                } else if (r === 1 && wave >= 3) {
                    type = EnemyType.DIVING;
                } else if (r === 2 && wave >= 4) {
                    type = EnemyType.SWARM;
                }

                const config = ENEMY_CONFIGS[type];
                const hp = config?.hp ?? 1;
                enemies.push({
                    x: startX + c * spacingX,
                    y: startY + r * spacingY,
                    startX: startX + c * spacingX,
                    startY: startY + r * spacingY,
                    angle: 0,
                    type,
                    diving: false,
                    hp,
                    maxHp: hp,
                });
            }
        }
        return enemies;
    }

    public updateBullets(bullets: Bullet[]): void {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x += b.vx || 0;
            b.y += b.vy;
            if (b.y < -20 || b.y > GAME_HEIGHT + 20 || b.x < -20 || b.x > GAME_WIDTH + 20) {
                bullets.splice(i, 1);
            }
        }
    }

    public updateEnemiesAndFire(
        enemies: Enemy[],
        bullets: Bullet[],
        wave: number,
        difficultyLevel: DifficultyLevel
    ): void {
        const diff = DIFFICULTY_CONFIGS[difficultyLevel];

        for (const e of enemies) {
            e.angle += 0.04;
            e.x = e.startX + Math.sin(e.angle) * (42 + wave * 2);

            if (!e.diving && Math.random() < 0.001 + wave * 0.0003) {
                e.diving = true;
            }

            if (e.diving) {
                const typeCfg = ENEMY_CONFIGS[e.type];
                e.y += (2.6 + typeCfg.difficulty * 0.6 + Math.min(1.5, wave * 0.08)) * diff.enemySpeedMultiplier;
                e.x += Math.sin(e.angle * 2.5) * (1.8 + Math.min(1.2, wave * 0.05)) * diff.enemySpeedMultiplier;
                if (e.y > 620) {
                    e.y = e.startY;
                    e.x = e.startX;
                    e.diving = false;
                }
            } else {
                e.y += Math.min(0.14, 0.025 + wave * 0.004) * diff.enemySpeedMultiplier;
            }
        }

        const enemyFireChance = Math.min(0.012, (0.0025 + wave * 0.0007) * diff.enemyFireMultiplier);
        for (const e of enemies) {
            if (Math.random() < enemyFireChance) {
                bullets.push({
                    x: e.x + ENEMY_WIDTH / 2,
                    y: e.y + ENEMY_HEIGHT,
                    vx: 0,
                    vy: 5 + diff.enemySpeedMultiplier,
                    isFromPlayer: false,
                });
            }
        }
    }

    public updateBombs(bombs: Bomb[], wave: number, difficultyLevel: DifficultyLevel): void {
        const diff = DIFFICULTY_CONFIGS[difficultyLevel];
        const bombChance = Math.min(0.012, (0.0002 + wave * 0.00008) * diff.bombChanceMultiplier);

        if (Math.random() < bombChance) {
            bombs.push({
                x: 30 + Math.random() * (GAME_WIDTH - 60),
                y: -30,
                speed: Math.round((3 + Math.min(3, wave / 5)) * diff.bombSpeedMultiplier),
            });
        }

        for (let i = bombs.length - 1; i >= 0; i--) {
            const bomb = bombs[i];
            bomb.y += bomb.speed;
            if (bomb.y > GAME_HEIGHT + 40) {
                bombs.splice(i, 1);
            }
        }
    }

    public updatePowerUps(powerUps: PowerUp[]): void {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const p = powerUps[i];
            p.bobAngle += 0.05;
            p.x += Math.sin(p.bobAngle) * 0.6;
            p.y += p.speed;
            if (p.y > GAME_HEIGHT + 30) {
                powerUps.splice(i, 1);
            }
        }
    }
}