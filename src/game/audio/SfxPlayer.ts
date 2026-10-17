export type SfxName =
    | 'shoot'
    | 'tripleShot'
    | 'laser'
    | 'tokenCollect'
    | 'explosion'
    | 'powerUp'
    | 'uiHover'
    | 'uiClick'
    | 'warpJump'
    | 'targetAcquiring'
    | 'targetLocked';

const SFX_NAMES: SfxName[] = [
    'shoot', 'tripleShot', 'laser', 'tokenCollect', 'explosion', 'powerUp',
    'uiHover', 'uiClick', 'warpJump', 'targetAcquiring', 'targetLocked',
];

const SFX_BASE_URL = '/resources/sounds/';

/**
 * Ładuje i odtwarza krótkie efekty z plików WAV (public/resources/sounds).
 * Pliki są dekodowane leniwie przy pierwszym użyciu kontekstu; do czasu
 * załadowania efekt jest po prostu pomijany.
 */
export class SfxPlayer {
    private buffers = new Map<SfxName, AudioBuffer>();
    private loading: Promise<void> | null = null;

    public constructor(private readonly volume = 1) {}

    public preload(ctx: AudioContext): Promise<void> {
        this.loading ??= Promise.all(
            SFX_NAMES.map(async (name) => {
                try {
                    const res = await fetch(`${SFX_BASE_URL}${name}.wav`);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    this.buffers.set(name, await ctx.decodeAudioData(await res.arrayBuffer()));
                } catch (err) {
                    console.warn(`[SfxPlayer] Nie udało się załadować '${name}':`, err);
                }
            }),
        ).then(() => undefined);
        return this.loading;
    }

    public play(ctx: AudioContext, name: SfxName): void {
        void this.preload(ctx);
        const buffer = this.buffers.get(name);
        if (!buffer) return;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        if (this.volume === 1) {
            src.connect(ctx.destination);
        } else {
            const gain = ctx.createGain();
            gain.gain.value = this.volume;
            src.connect(gain);
            gain.connect(ctx.destination);
        }
        src.start();
    }
}
