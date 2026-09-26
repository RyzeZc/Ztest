import type {
    AudioPlaybackStatus,
    AudioPlayerState,
    AudioSource,
} from './audio-types';


type AudioPlayerListener =
    (state: AudioPlayerState) => void;


class AudioPlayer {

    private audio: HTMLAudioElement | null = null;

    private source: AudioSource | null = null;

    private listeners =
        new Set<AudioPlayerListener>();

    private initialized = false;


    initialize(
        audioElement: HTMLAudioElement
    ): void {

        if (this.initialized) {
            return;
        }

        this.audio = audioElement;

        this.initialized = true;

        this.attachAudioEvents();
    }


    private attachAudioEvents(): void {

        if (!this.audio) {
            return;
        }


        this.audio.addEventListener(
            'loadstart',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'canplay',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'play',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'pause',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'waiting',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'playing',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'volumechange',
            () => {
                this.notify();
            }
        );


        this.audio.addEventListener(
            'error',
            () => {
                this.notify();
            }
        );
    }


    setSource(
        source: AudioSource
    ): void {

        if (!this.audio) {
            return;
        }


        if (
            this.source?.id === source.id
        ) {
            return;
        }


        this.audio.pause();


        this.source = source;


        this.audio.src =
            source.streamUrl;


        this.audio.load();


        this.notify();
    }


    async play(): Promise<void> {

        if (!this.audio) {
            return;
        }


        try {

            await this.audio.play();

        } catch (error) {

            console.error(
                '[MusicPlayer] Unable to start audio:',
                error
            );

            this.notify();

            throw error;
        }
    }


    pause(): void {

        if (!this.audio) {
            return;
        }

        this.audio.pause();
    }


    stop(): void {

        if (!this.audio) {
            return;
        }


        this.audio.pause();

        this.audio.currentTime = 0;

        this.notify();
    }


    async toggle(): Promise<void> {

        if (!this.audio) {
            return;
        }


        if (this.audio.paused) {

            await this.play();

        } else {

            this.pause();
        }
    }


    setVolume(
        volume: number
    ): void {

        if (!this.audio) {
            return;
        }


        const normalizedVolume =
            Math.min(
                1,
                Math.max(
                    0,
                    volume
                )
            );


        this.audio.volume =
            normalizedVolume;


        if (
            normalizedVolume > 0 &&
            this.audio.muted
        ) {
            this.audio.muted = false;
        }
    }


    setMuted(
        muted: boolean
    ): void {

        if (!this.audio) {
            return;
        }


        this.audio.muted =
            muted;
    }


    subscribe(
        listener: AudioPlayerListener
    ): () => void {

        this.listeners.add(
            listener
        );


        listener(
            this.getState()
        );


        return () => {

            this.listeners.delete(
                listener
            );
        };
    }


    getState(): AudioPlayerState {

        return {
            source:
                this.source,

            status:
                this.getPlaybackStatus(),

            volume:
                this.audio
                    ? this.audio.volume
                    : 1,

            muted:
                this.audio
                    ? this.audio.muted
                    : false,

            error:
                this.audio?.error
                    ?? null,
        };
    }


    private getPlaybackStatus():
        AudioPlaybackStatus {

        if (!this.audio) {
            return 'idle';
        }


        if (this.audio.error) {
            return 'error';
        }


        if (
            this.audio.readyState ===
            HTMLMediaElement.HAVE_NOTHING
        ) {
            return this.source
                ? 'idle'
                : 'idle';
        }


        if (
            !this.audio.paused &&
            !this.audio.ended
        ) {

            if (
                this.audio.readyState <
                HTMLMediaElement.HAVE_FUTURE_DATA
            ) {
                return 'loading';
            }

            return 'playing';
        }


        return 'paused';
    }


    private notify(): void {

        const state =
            this.getState();


        this.listeners.forEach(
            listener => {
                listener(state);
            }
        );
    }
}


export const audioPlayer =
    new AudioPlayer();
