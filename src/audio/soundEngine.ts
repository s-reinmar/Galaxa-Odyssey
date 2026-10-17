// Web Audio API Retro Sound Generator mirroring the Java synthetic sound synthesis
import { SoundType } from '../types/game';
import { SfxPlayer, type SfxName } from '../game/audio/SfxPlayer';

const SOUND_TYPE_TO_SFX: Partial<Record<SoundType, SfxName>> = {
    [SoundType.SHOOT]: 'shoot',
    [SoundType.TRIPLE_SHOT]: 'tripleShot',
    [SoundType.LASER]: 'laser',
    [SoundType.TOKEN_COLLECT]: 'tokenCollect',
    [SoundType.EXPLOSION]: 'explosion',
    [SoundType.POWER_UP]: 'powerUp',
};

/**
 * Kontrakt publicznego interfejsu silnika dźwięku
 */
export interface ISoundEngine {
    setSoundEnabled(enabled: boolean): void;
    isSoundEnabled(): boolean;
    resumeContext(): Promise<void>;
    playSound(type: SoundType): void;
    startMenuMusic(): void;
    stopMenuMusic(): void;
    playUiHover(): void;
    playUiClick(): void;
    playWarpJump(): void;
    playTargetAcquiringBeep(): void;
    playTargetLockedAlert(): void;
    playCinematicIntroSoundscape(): void;
    stopCinematicIntroSoundscape(): void;
    startHangarAmbience(): void;
    stopHangarAmbience(): void;
}

class SoundEngine implements ISoundEngine {
    private ctx: AudioContext | null = null;
    private soundEnabled = true;
    private menuMusicPlaying = false;
    private musicTimeout: number | null = null;
    private melodyIndex = 0;

    private melody = [
        261.63, 329.63, 392.00, 523.25,
        392.00, 329.63, 293.66, 261.63,
        220.00, 261.63, 329.63, 440.00,
        329.63, 293.66, 261.63, 196.00
    ];

    // Hangar Procedural Ambient Layer
    private hangarAmbienceRunning = false;
    private hangarMasterGain: GainNode | null = null;
    private hangarNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
    private hangarTimeoutIds: number[] = [];

    // Active cinematic intro audio nodes
    private introGainNode: GainNode | null = null;
    private introOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];

    private initCtx(): AudioContext | null {
        if (typeof window === 'undefined') return null;

        if (!this.ctx) {
            try {
                const AudioCtx =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            } catch (err) {
                console.warn('[SoundEngine] Nie udało się zainicjalizować Web Audio API AudioContext:', err);
                return null;
            }
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch((err) => {
                console.warn('[SoundEngine] Błąd automatycznego wznowienia zawieszonego kontekstu AudioContext:', err);
            });
        }

        return this.ctx;
    }

    /**
     * Jawne wznowienie kontekstu audio przy pierwszej interakcji użytkownika (click/touch/keydown)
     */
    public async resumeContext(): Promise<void> {
        const ctx = this.initCtx();
        if (ctx && ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch (err) {
                console.warn('[SoundEngine] Błąd podczas jawnego wywołania resumeContext():', err);
            }
        }
    }

    public setSoundEnabled(enabled: boolean): void {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopMenuMusic();
            this.stopHangarAmbience();
            this.stopCinematicIntroSoundscape();
        }
    }

    public isSoundEnabled(): boolean {
        return this.soundEnabled;
    }

    private readonly sfx = new SfxPlayer();

    private playSfx(name: SfxName): void {
        if (!this.soundEnabled) return;
        const ctx = this.initCtx();
        if (ctx) this.sfx.play(ctx, name);
    }

    public playSound(type: SoundType): void {
        const name = SOUND_TYPE_TO_SFX[type];
        if (name) this.playSfx(name);
    }

    public startMenuMusic(): void {
        if (!this.soundEnabled || this.menuMusicPlaying) return;
        this.menuMusicPlaying = true;
        this.playNextMusicNote();
    }

    private playNextMusicNote(): void {
        if (!this.menuMusicPlaying || !this.soundEnabled) return;
        const ctx = this.initCtx();
        if (!ctx) return;

        try {
            const freq = this.melody[this.melodyIndex];
            this.melodyIndex = (this.melodyIndex + 1) % this.melody.length;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            const dur = 0.18;
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + dur);

            this.musicTimeout = window.setTimeout(() => {
                this.playNextMusicNote();
            }, dur * 1000);
        } catch (err) {
            console.warn('[SoundEngine] Błąd syntezy kolejnej nuty muzyki menu:', err);
        }
    }

    public stopMenuMusic(): void {
        this.menuMusicPlaying = false;
        if (this.musicTimeout !== null) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
        this.melodyIndex = 0;
    }

    public playUiHover(): void { this.playSfx('uiHover'); }

    public playUiClick(): void { this.playSfx('uiClick'); }

    public playWarpJump(): void { this.playSfx('warpJump'); }

    public playTargetAcquiringBeep(): void { this.playSfx('targetAcquiring'); }

    public playTargetLockedAlert(): void { this.playSfx('targetLocked'); }

    public playCinematicIntroSoundscape(): void {
        if (!this.soundEnabled) return;
        this.stopCinematicIntroSoundscape();
        const ctx = this.initCtx();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.001, now);
            masterGain.gain.exponentialRampToValueAtTime(0.35, now + 1.2);
            masterGain.connect(ctx.destination);
            this.introGainNode = masterGain;

            // 1. Deep Hangar Ambience & Sub Drone
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(55, now);
            sub.frequency.linearRampToValueAtTime(48, now + 3.0);
            sub.frequency.linearRampToValueAtTime(60, now + 6.0);
            subGain.gain.setValueAtTime(0.28, now);
            sub.connect(subGain);
            subGain.connect(masterGain);
            sub.start(now);
            this.introOscillators.push(sub);

            // 2. Sci-Fi Harmonic Atmosphere Pad
            const chordNotes = [110, 164.81, 220, 329.63];
            chordNotes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const chordGain = ctx.createGain();
                osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(freq, now);
                osc.detune.setValueAtTime((idx - 1.5) * 8, now);

                chordGain.gain.setValueAtTime(0.001, now);
                chordGain.gain.exponentialRampToValueAtTime(0.045 / (idx + 1), now + 0.8 + idx * 0.2);
                chordGain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + 4.5);
                chordGain.gain.exponentialRampToValueAtTime(0.001, now + 7.5);

                osc.connect(chordGain);
                chordGain.connect(masterGain);
                osc.start(now);
                this.introOscillators.push(osc);
            });

            // 3. Hydraulic Airlock / Vent Hiss
            const bufferSize = ctx.sampleRate * 1.5;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const whiteNoise = ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now + 0.4);
            filter.frequency.exponentialRampToValueAtTime(450, now + 1.8);
            filter.Q.value = 3.0;

            const hissGain = ctx.createGain();
            hissGain.gain.setValueAtTime(0.001, now);
            hissGain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
            hissGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            whiteNoise.connect(filter);
            filter.connect(hissGain);
            hissGain.connect(masterGain);
            whiteNoise.start(now + 0.4);
            this.introOscillators.push(whiteNoise);

            // 4. Thruster Spool-up & Diagnostic Chime
            const chimeOsc = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            chimeOsc.type = 'sine';
            chimeOsc.frequency.setValueAtTime(587.33, now + 2.8);
            chimeOsc.frequency.setValueAtTime(880, now + 3.0);
            chimeOsc.frequency.setValueAtTime(1174.66, now + 3.2);
            chimeGain.gain.setValueAtTime(0.001, now + 2.8);
            chimeGain.gain.linearRampToValueAtTime(0.09, now + 3.2);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

            chimeOsc.connect(chimeGain);
            chimeGain.connect(masterGain);
            chimeOsc.start(now + 2.8);
            chimeOsc.stop(now + 4.8);
            this.introOscillators.push(chimeOsc);

            // 5. Hero Reveal Fanfare Chime
            const heroOsc = ctx.createOscillator();
            const heroGain = ctx.createGain();
            heroOsc.type = 'triangle';
            heroOsc.frequency.setValueAtTime(440, now + 5.0);
            heroOsc.frequency.exponentialRampToValueAtTime(880, now + 5.5);
            heroGain.gain.setValueAtTime(0.001, now + 5.0);
            heroGain.gain.linearRampToValueAtTime(0.08, now + 5.4);
            heroGain.gain.exponentialRampToValueAtTime(0.001, now + 7.2);

            heroOsc.connect(heroGain);
            heroGain.connect(masterGain);
            heroOsc.start(now + 5.0);
            heroOsc.stop(now + 7.2);
            this.introOscillators.push(heroOsc);
        } catch (err) {
            console.warn('[SoundEngine] Błąd uruchomienia Cinematic Intro Soundscape:', err);
        }
    }

    public stopCinematicIntroSoundscape(): void {
        if (!this.introGainNode) return;
        try {
            const ctx = this.ctx;
            if (ctx) {
                const now = ctx.currentTime;
                this.introGainNode.gain.cancelScheduledValues(now);
                this.introGainNode.gain.setValueAtTime(this.introGainNode.gain.value, now);
                this.introGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            }
            setTimeout(() => {
                this.introOscillators.forEach((osc) => {
                    try {
                        if ('stop' in osc) osc.stop();
                    } catch (err) {
                        console.debug('[SoundEngine] Błąd zatrzymania oscylatora intro:', err);
                    }
                });
                this.introOscillators = [];
                this.introGainNode = null;
            }, 400);
        } catch (err) {
            console.warn('[SoundEngine] Błąd wyciszania Cinematic Intro:', err);
            this.introOscillators = [];
            this.introGainNode = null;
        }
    }

    public startHangarAmbience(): void {
        if (!this.soundEnabled || this.hangarAmbienceRunning) return;
        const ctx = this.initCtx();
        if (!ctx) return;

        try {
            this.hangarAmbienceRunning = true;
            const now = ctx.currentTime;

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.001, now);
            masterGain.gain.linearRampToValueAtTime(0.38, now + 1.2);
            masterGain.connect(ctx.destination);
            this.hangarMasterGain = masterGain;

            // 1. Deep Mechanical Drone
            const subOsc = ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(48.0, now);

            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.24, now);
            subOsc.connect(subGain);
            subGain.connect(masterGain);
            subOsc.start(now);
            this.hangarNodes.push(subOsc);

            // Industrial machinery overtone
            const machOsc = ctx.createOscillator();
            machOsc.type = 'triangle';
            machOsc.frequency.setValueAtTime(72.0, now);
            machOsc.detune.setValueAtTime(5, now);

            const lpf = ctx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(160, now);
            lpf.Q.setValueAtTime(2.2, now);

            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.12, now);
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(55, now);
            lfo.connect(lfoGain);
            lfoGain.connect(lpf.frequency);
            lfo.start(now);
            this.hangarNodes.push(lfo);

            const machGain = ctx.createGain();
            machGain.gain.setValueAtTime(0.18, now);

            machOsc.connect(lpf);
            lpf.connect(machGain);
            machGain.connect(masterGain);
            machOsc.start(now);
            this.hangarNodes.push(machOsc);

            // 2. Procedural Atmospheric Steam Vent Routine
            const scheduleNextSteamVent = () => {
                if (!this.hangarAmbienceRunning || !this.ctx || !this.hangarMasterGain) return;
                const delay = 6000 + Math.random() * 8000;
                const tid = window.setTimeout(() => {
                    this.triggerProceduralSteamVent();
                    scheduleNextSteamVent();
                }, delay);
                this.hangarTimeoutIds.push(tid);
            };
            scheduleNextSteamVent();

            // 3. Procedural Echoing Footsteps & Gantry Pings Routine
            const scheduleNextFootsteps = () => {
                if (!this.hangarAmbienceRunning || !this.ctx || !this.hangarMasterGain) return;
                const delay = 4500 + Math.random() * 7000;
                const tid = window.setTimeout(() => {
                    this.triggerProceduralEchoingFootstep();
                    scheduleNextFootsteps();
                }, delay);
                this.hangarTimeoutIds.push(tid);
            };
            scheduleNextFootsteps();
        } catch (err) {
            console.warn('[SoundEngine] Błąd uruchomienia atmosfery hangaru:', err);
        }
    }

    private triggerProceduralSteamVent(): void {
        if (!this.soundEnabled || !this.hangarAmbienceRunning || !this.ctx || !this.hangarMasterGain) return;
        try {
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const duration = 1.4 + Math.random() * 0.8;

            const bufferSize = Math.floor(ctx.sampleRate * duration);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            const startFreq = 1600 + Math.random() * 400;
            const endFreq = 450 + Math.random() * 150;
            bandpass.frequency.setValueAtTime(startFreq, now);
            bandpass.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            bandpass.Q.setValueAtTime(2.8, now);

            const ventGain = ctx.createGain();
            ventGain.gain.setValueAtTime(0.001, now);
            ventGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
            ventGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noiseSource.connect(bandpass);
            bandpass.connect(ventGain);
            ventGain.connect(this.hangarMasterGain);

            noiseSource.start(now);
            noiseSource.stop(now + duration);
        } catch (err) {
            console.debug('[SoundEngine] Błąd syntezy wyziewu pary:', err);
        }
    }

    private triggerProceduralEchoingFootstep(): void {
        if (!this.soundEnabled || !this.hangarAmbienceRunning || !this.ctx || !this.hangarMasterGain) return;
        try {
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const isPing = Math.random() > 0.45;

            if (isPing) {
                const pingFreq = 840 + Math.random() * 320;
                const osc = ctx.createOscillator();
                const pingGain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(pingFreq, now);
                osc.frequency.exponentialRampToValueAtTime(pingFreq * 0.6, now + 0.18);

                pingGain.gain.setValueAtTime(0.04, now);
                pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                const echoGain = ctx.createGain();
                echoGain.gain.setValueAtTime(0.001, now);
                echoGain.gain.setValueAtTime(0.018, now + 0.16);
                echoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                osc.connect(pingGain);
                pingGain.connect(this.hangarMasterGain);
                osc.connect(echoGain);
                echoGain.connect(this.hangarMasterGain);

                osc.start(now);
                osc.stop(now + 0.48);
            } else {
                const stepOffsets = [0, 0.32 + Math.random() * 0.08];
                stepOffsets.forEach((offset) => {
                    const osc = ctx.createOscillator();
                    const stepGain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(260 + Math.random() * 40, now + offset);
                    osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.09);

                    stepGain.gain.setValueAtTime(0.001, now);
                    stepGain.gain.setValueAtTime(0.06, now + offset);
                    stepGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

                    const echoGain = ctx.createGain();
                    echoGain.gain.setValueAtTime(0.001, now);
                    echoGain.gain.setValueAtTime(0.022, now + offset + 0.14);
                    echoGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.38);

                    osc.connect(stepGain);
                    stepGain.connect(this.hangarMasterGain!);
                    osc.connect(echoGain);
                    echoGain.connect(this.hangarMasterGain!);

                    osc.start(now + offset);
                    osc.stop(now + offset + 0.4);
                });
            }
        } catch (err) {
            console.debug('[SoundEngine] Błąd syntezy odgłosu kroków/metalu:', err);
        }
    }

    public stopHangarAmbience(): void {
        if (!this.hangarAmbienceRunning) return;
        this.hangarAmbienceRunning = false;
        this.hangarTimeoutIds.forEach((tid) => clearTimeout(tid));
        this.hangarTimeoutIds = [];

        if (this.hangarMasterGain && this.ctx) {
            try {
                const now = this.ctx.currentTime;
                this.hangarMasterGain.gain.cancelScheduledValues(now);
                this.hangarMasterGain.gain.setValueAtTime(this.hangarMasterGain.gain.value, now);
                this.hangarMasterGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
            } catch (err) {
                console.warn('[SoundEngine] Błąd łagodnego wyciszania hangaru:', err);
            }
        }

        setTimeout(() => {
            this.hangarNodes.forEach((node) => {
                try {
                    if ('stop' in node) (node as OscillatorNode).stop();
                } catch (err) {
                    console.debug('[SoundEngine] Błąd zatrzymania węzła tła hangaru:', err);
                }
            });
            this.hangarNodes = [];
            this.hangarMasterGain = null;
        }, 650);
    }
}

export const soundEngine: ISoundEngine = new SoundEngine();