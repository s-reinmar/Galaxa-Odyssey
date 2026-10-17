import { WeaponMode } from '../../types/game';
import { PlayerEntityService, PlayerState } from '../entities/GameEntities';
import { InputManager } from '../input/InputManager';

export interface IPlayerControlContext {
    player1: PlayerState;
    player2: PlayerState | null;
    twoPlayerMode: boolean;
    spaceHeld: boolean;
    secondPlayerFireHeld: boolean;
    fireCooldown: number;
    secondPlayerFireCooldown: number;
    firePlayer1: () => void;
    firePlayer2: () => void;
}

/** Ruch, efekty i auto-ogień graczy w pojedynczej klatce. */
export class PlayerController {
    constructor(private readonly input: InputManager) {}

    public update(ctx: IPlayerControlContext): void {
        this.updatePlayer1(ctx);
        this.updatePlayer2(ctx);
    }

    private updatePlayer1(ctx: IPlayerControlContext): void {
        const p1 = ctx.player1;
        PlayerEntityService.updateMovement(
            p1,
            this.input.isP1MovingLeft(),
            this.input.isP1MovingRight(),
            this.input.isP1MovingUp(),
            this.input.isP1MovingDown()
        );
        PlayerEntityService.updateEffectsAndEnergy(p1, true);

        if (ctx.fireCooldown > 0) ctx.fireCooldown--;
        const isFiring = this.input.isP1Firing() || ctx.spaceHeld;
        if (isFiring && p1.lives > 0) {
            if (p1.weaponMode === WeaponMode.LASER_BEAM || ctx.fireCooldown === 0) {
                ctx.firePlayer1();
            }
        } else {
            p1.isLaserActive = false;
        }
    }

    private updatePlayer2(ctx: IPlayerControlContext): void {
        const p2 = ctx.player2;
        if (!ctx.twoPlayerMode || !p2 || p2.lives <= 0) return;

        PlayerEntityService.updateMovement(
            p2,
            this.input.isP2MovingLeft(),
            this.input.isP2MovingRight(),
            this.input.isP2MovingUp(),
            this.input.isP2MovingDown()
        );
        PlayerEntityService.updateEffectsAndEnergy(p2, false);

        if (ctx.secondPlayerFireCooldown > 0) ctx.secondPlayerFireCooldown--;
        const isFiring = this.input.isP2Firing() || ctx.secondPlayerFireHeld;
        if (isFiring && ctx.secondPlayerFireCooldown === 0) {
            ctx.firePlayer2();
        }
    }
}
