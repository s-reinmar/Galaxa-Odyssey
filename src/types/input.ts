/**
 * Interfejs intencji wejściowych pojedynczego gracza.
 * Wartości osi są znormalizowane w zakresie [-1, 1].
 */
export interface PlayerInputState {
    // Wektor ruchu w osi X (-1: w lewo, 1: w prawo, 0: brak)
    moveX: number;
    // Wektor ruchu w osi Y (-1: w dół, 1: w górę, 0: brak)
    moveY: number;
    // Intencja prowadzenia ognia ciągłego / strzału
    fire: boolean;
    // Intencja wykonania uniku / beczki (roll)
    roll?: boolean;
}

/**
 * Globalny stan akcji wejściowych dla całego silnika gry.
 */
export interface GameInputActions {
    p1: PlayerInputState;
    p2: PlayerInputState;
    isTwoPlayer: boolean;
}

/**
 * Identyfikator wirtualnych przycisków / akcji
 */
export type VirtualButtonAction = 'left' | 'right' | 'up' | 'down' | 'fire' | 'roll';