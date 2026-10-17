import type { PlayerIntent } from '../../types/input';

/** Pressed state of one device for one player, in game space (left = decreasing x, up = up the screen). */
export interface DigitalInput {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
    roll: boolean;
}

export const IDLE_INPUT: DigitalInput = Object.freeze({
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    roll: false,
});

/** Any device can press any control (OR). Opposite directions cancel only once, after merging. */
export const mergeInputs = (inputs: readonly DigitalInput[]): DigitalInput => ({
    left: inputs.some((i) => i.left),
    right: inputs.some((i) => i.right),
    up: inputs.some((i) => i.up),
    down: inputs.some((i) => i.down),
    fire: inputs.some((i) => i.fire),
    roll: inputs.some((i) => i.roll),
});

export const toIntent = (input: DigitalInput): PlayerIntent => ({
    moveX: (input.right ? 1 : 0) - (input.left ? 1 : 0),
    moveY: (input.up ? 1 : 0) - (input.down ? 1 : 0),
    fire: input.fire,
    roll: input.roll,
});
