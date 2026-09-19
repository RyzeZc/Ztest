export type YouTubePlaybackStatus =
    | 'idle'
    | 'loading'
    | 'playing'
    | 'buffering'
    | 'paused'
    | 'ended'
    | 'error';

export interface YouTubePlayerState {
    videoId: string | null;
    status: YouTubePlaybackStatus;
    ready: boolean;
    volume: number;
    muted: boolean;
}

interface YouTubePlayerInstance {
    loadVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(
        seconds: number,
        allowSeekAhead?: boolean
    ): void;
    setVolume(volume: number): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    getVolume(): number;
    destroy(): void;
}

interface YouTubePlayerOptions {
    height: string;
    width: string;
    videoId?: string;
    playerVars?: {
        autoplay?: number;
        controls?: number;
        disablekb?: number;
        fs?: number;
        modestbranding?: number;
        playsinline?: number;
        rel?: number;
    };
    events?: {
        onReady?: () => void;
        onStateChange?: (
            event: {
                data: number;
            }
        ) => void;
        onError?: (
            event: {
                data: number;
            }
        ) => void;
    };
}

interface YouTubePlayerConstructor {
    new (
        element: HTMLElement,
        options: YouTubePlayerOptions
    ): YouTubePlayerInstance;
}

interface YouTubeNamespace {
    Player: YouTubePlayerConstructor;
    PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
    };
}

declare global {
    interface Window {
        YT?: YouTubeNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}


let apiPromise:
    Promise<YouTubeNamespace> | null =
    null;


function loadYouTubeApi():
    Promise<YouTubeNamespace> {

    if (window.YT?.Player) {
        return Promise.resolve(
            window.YT
        );
    }

    if (apiPromise) {
        return apiPromise;
    }

    apiPromise =
        new Promise(
            (
                resolve,
                reject
            ) => {

                const previousCallback =
                    window.onYouTubeIframeAPIReady;

                window.onYouTubeIframeAPIReady =
                    () => {

                        previousCallback?.();

                        if (
                            window.YT?.Player
                        ) {

                            resolve(
                                window.YT
                            );

                        } else {

                            reject(
                                new Error(
                                    'YouTube IFrame API failed to initialize.'
                                )
                            );
                        }
                    };


                const existingScript =
                    document.querySelector(
                        'script[src="https://www.youtube.com/iframe_api"]'
                    );


                if (existingScript) {
                    return;
                }


                const script =
                    document.createElement(
                        'script'
                    );

                script.src =
                    'https://www.youtube.com/iframe_api';

                script.async =
                    true;

                script.onerror =
                    () => {

                        reject(
                            new Error(
                                'Unable to load YouTube IFrame API.'
                            )
                        );
                    };

                document.head.appendChild(
                    script
                );
            }
        );

    return apiPromise;
}


export class YouTubePlayer {

    private player:
        YouTubePlayerInstance | null =
        null;

    private state:
        YouTubePlayerState = {
        videoId: null,
        status: 'idle',
        ready: false,
        volume: 100,
        muted: false,
    };

    private listeners =
    new Set<
        (
            state: YouTubePlayerState
        ) => void
    >();

    subscribe(
        listener: (
            state: YouTubePlayerState
        ) => void
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

    private notify(): void {

        const state =
            this.getState();

        this.listeners.forEach(
            listener => {
                listener(state);
            }
        );
    }

    async initialize(
        container: HTMLElement
    ): Promise<void> {

        const YT =
            await loadYouTubeApi();


        this.player =
            new YT.Player(
                container,
                {
                    height: '100%',
                    width: '100%',

                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                    },

                    events: {

                        onReady:
                            () => {

                                this.state.ready =
                                    true;

                                this.state.status =
                                    'paused';

                                this.state.volume =
                                    this.player
                                        ?.getVolume()
                                    ?? 100;

                                this.state.muted =
                                    this.player
                                        ?.isMuted()
                                    ?? false;

                                this.notify();
                            },


                        onStateChange:
                            event => {

                                if (!window.YT) {
                                    return;
                                }

                                switch (
                                    event.data
                                ) {

                                    case window.YT.PlayerState.PLAYING:

                                        this.state.status =
                                            'playing';

                                        break;

                                    case window.YT.PlayerState.BUFFERING:

                                        this.state.status =
                                            'loading';

                                        break;

                                    case window.YT.PlayerState.PAUSED:

                                        this.state.status =
                                            'paused';

                                        break;

                                    case window.YT.PlayerState.ENDED:

                                        this.state.status =
                                            'ended';

                                        break;

                                    case window.YT.PlayerState.CUED:

                                        this.state.status =
                                            'paused';

                                        break;

                                    default:

                                        break;
                                }

                                this.notify();
                            },


                        onError:
                            event => {

                                console.error(
                                    '[YouTubePlayer] YouTube error:',
                                    event.data
                                );

                                this.state.status =
                                    'error';

                                this.notify();
                            },
                    },
                }
            );
    }


    load(
        videoId: string
    ): void {

        if (!this.player) {
            return;
        }

        this.state.videoId =
            videoId;

        this.state.status =
            'loading';

        this.notify();

        this.player.loadVideoById(
            videoId
        );
    }


    play(): void {

        if (!this.player) {
            return;
        }

        this.player.playVideo();

        this.state.status =
            'playing';

        this.notify();
    }


    pause(): void {

        if (!this.player) {
            return;
        }

        this.player.pauseVideo();

        this.state.status =
            'paused';

        this.notify();
    }


    stop(): void {

        this.player?.stopVideo();

        this.state.status =
            'paused';

        this.notify();
    }

    getCurrentTime(): number {

        if (!this.player) {
            return 0;
        }

        return this.player.getCurrentTime();
    }

    getDuration(): number {

        if (!this.player) {
            return 0;
        }

        return this.player.getDuration();
    }

    seekTo(
        seconds: number
    ): void {

        if (!this.player) {
            return;
        }

        const duration =
            this.player.getDuration();

        if (
            !Number.isFinite(seconds) ||
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return;
        }

        const safeSeconds =
            Math.min(
                duration,
                Math.max(
                    0,
                    seconds
                )
            );

        this.player.seekTo(
            safeSeconds,
            true
        );
    }

    setVolume(
        volume: number
    ): void {

        if (!this.player) {
            return;
        }

        const normalized =
            Math.min(
                100,
                Math.max(
                    0,
                    volume
                )
            );

        this.player.setVolume(
            normalized
        );

        this.state.volume =
            normalized / 100;

        this.notify();
    }


    setMuted(
        muted: boolean
    ): void {

        if (!this.player) {
            return;
        }

        if (muted) {

            this.player.mute();

        } else {

            this.player.unMute();
        }

        this.state.muted =
            muted;

        this.notify();
    }


    getState():
        YouTubePlayerState {

        return {
            ...this.state,
        };
    }


    destroy(): void {

        this.player?.destroy();

        this.player =
            null;

        this.state = {
            videoId: null,
            status: 'idle',
            ready: false,
            volume: 100,
            muted: false,
        };
    }
}
