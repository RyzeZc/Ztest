export type YouTubePlaybackStatus =
    | 'idle'
    | 'loading'
    | 'playing'
    | 'buffering'
    | 'paused'
    | 'ended'
    | 'error';


export interface YouTubePlayerState {

    videoId:
        string | null;

    status:
        YouTubePlaybackStatus;

    ready:
        boolean;

    volume:
        number;

    muted:
        boolean;
}


interface YouTubePlayerInstance {

    loadVideoById(
        videoId:
            string
    ):
        void;

    cueVideoById(
        videoId:
            string,
        startSeconds?:
            number
    ):
        void;       

    playVideo():
        void;

    pauseVideo():
        void;

    stopVideo():
        void;

    getCurrentTime():
        number;

    getDuration():
        number;

    getPlayerState():
        number;        

    seekTo(
        seconds:
            number,
        allowSeekAhead?:
            boolean
    ):
        void;

    setVolume(
        volume:
            number
    ):
        void;

    mute():
        void;

    unMute():
        void;

    isMuted():
        boolean;

    getVolume():
        number;

    destroy():
        void;
}


interface YouTubePlayerConstructor {

    new (
        element:
            HTMLElement,
        options:
            {
                height:
                    string;

                width:
                    string;

                playerVars?: {
                    autoplay?:
                        number;

                    controls?:
                        number;

                    disablekb?:
                        number;

                    fs?:
                        number;

                    modestbranding?:
                        number;

                    playsinline?:
                        number;

                    rel?:
                        number;
                };

                events?: {
                    onReady?:
                        () => void;

                    onStateChange?:
                        (
                            event:
                                {
                                    data:
                                        number;
                                }
                        ) => void;                    

                    onError?:
                        (
                            event:
                                {
                                    data:
                                        number;
                                }
                        ) => void;

                    onAutoplayBlocked?:
                        () => void;                        
                };
            }
    ):
        YouTubePlayerInstance;
}


interface YouTubeNamespace {

    Player:
        YouTubePlayerConstructor;

    PlayerState: {

        UNSTARTED:
            number;

        ENDED:
            number;

        PLAYING:
            number;

        PAUSED:
            number;

        BUFFERING:
            number;

        CUED:
            number;
    };
}


declare global {

    interface Window {

        YT?:
            YouTubeNamespace;

        onYouTubeIframeAPIReady?:
            () => void;
    }
}


/* ============================================================
 * YOUTUBE API LOADER
 * ============================================================ */

const YOUTUBE_API_SRC =
    'https://www.youtube.com/iframe_api';

const YOUTUBE_API_SCRIPT_ID =
    'new-retro-youtube-iframe-api';

const YOUTUBE_API_TIMEOUT =
    10000;

const YOUTUBE_API_RETRIES =
    1;


let youtubeApiPromise:
    Promise<YouTubeNamespace> |
    null =
    null;


function waitForYouTubeApi(
    timeout:
        number
):
    Promise<YouTubeNamespace> {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            let settled =
                false;

            let pollTimer:
                ReturnType<typeof setInterval> |
                null =
                null;

            let timeoutTimer:
                ReturnType<typeof setTimeout> |
                null =
                null;


            const previousCallback =
                window.onYouTubeIframeAPIReady;


            const cleanup =
                () => {

                    if (
                        pollTimer !==
                        null
                    ) {

                        clearInterval(
                            pollTimer
                        );

                        pollTimer =
                            null;
                    }


                    if (
                        timeoutTimer !==
                        null
                    ) {

                        clearTimeout(
                            timeoutTimer
                        );

                        timeoutTimer =
                            null;
                    }


                    if (
                        window.onYouTubeIframeAPIReady ===
                        onYouTubeApiReady
                    ) {

                        window.onYouTubeIframeAPIReady =
                            previousCallback;
                    }
                };


            const succeed =
                () => {

                    if (
                        settled
                    ) {
                        return;
                    }


                    if (
                        !window.YT?.Player
                    ) {
                        return;
                    }


                    settled =
                        true;

                    cleanup();


                    resolve(
                        window.YT
                    );
                };


            const fail =
                (
                    error:
                        Error
                ) => {

                    if (
                        settled
                    ) {
                        return;
                    }


                    settled =
                        true;

                    cleanup();

                    reject(
                        error
                    );
                };


            const onYouTubeApiReady =
                () => {

                    try {

                        previousCallback?.();

                    } catch (
                        callbackError
                    ) {

                        console.error(
                            '[YouTubePlayer] Existing API callback failed:',
                            callbackError
                        );
                    }


                    succeed();
                };


            window.onYouTubeIframeAPIReady =
                onYouTubeApiReady;


            /*
             * Puede que la API ya esté lista
             * antes de que nosotros instalemos
             * el callback.
             */
            if (
                window.YT?.Player
            ) {

                succeed();

                return;
            }


            let script =
                document.getElementById(
                    YOUTUBE_API_SCRIPT_ID
                ) as
                HTMLScriptElement |
                null;


            if (
                !script
            ) {

                script =
                    document.querySelector(
                        `script[src="${YOUTUBE_API_SRC}"]`
                    ) as
                    HTMLScriptElement |
                    null;
            }


            const handleScriptError =
                () => {

                    fail(
                        new Error(
                            'Unable to load YouTube IFrame API.'
                        )
                    );
                };


            if (
                script
            ) {

                script.dataset.newRetroYoutubeApi =
                    'true';


                script.addEventListener(
                    'error',
                    handleScriptError,
                    {
                        once:
                            true,
                    }
                );


            } else {

                script =
                    document.createElement(
                        'script'
                    );


                script.id =
                    YOUTUBE_API_SCRIPT_ID;

                script.src =
                    YOUTUBE_API_SRC;

                script.async =
                    true;

                script.dataset.newRetroYoutubeApi =
                    'true';


                script.addEventListener(
                    'error',
                    handleScriptError,
                    {
                        once:
                            true,
                    }
                );


                document.head.appendChild(
                    script
                );
            }


            /*
             * Además del callback oficial,
             * hacemos polling muy corto para cubrir
             * el caso de que la API haya terminado
             * antes de que podamos observar el callback.
             */
            pollTimer =
                setInterval(
                    () => {

                        succeed();

                    },
                    50
                );


            timeoutTimer =
                setTimeout(
                    () => {

                        fail(
                            new Error(
                                `YouTube IFrame API did not become ready within ${timeout}ms.`
                            )
                        );

                    },
                    timeout
                );

        }
    );
}


function loadYouTubeApi():
    Promise<YouTubeNamespace> {

    if (
        window.YT?.Player
    ) {

        return Promise.resolve(
            window.YT
        );
    }


    if (
        youtubeApiPromise
    ) {

        return youtubeApiPromise;
    }


    youtubeApiPromise =
        (
            async () => {

                let lastError:
                    Error | null =
                    null;


                for (
                    let attempt = 0;
                    attempt <=
                        YOUTUBE_API_RETRIES;
                    attempt++
                ) {

                    try {

                        return await waitForYouTubeApi(
                            YOUTUBE_API_TIMEOUT
                        );

                    } catch (
                        error
                    ) {

                        lastError =
                            error instanceof Error
                                ? error
                                : new Error(
                                    'Unable to initialize YouTube IFrame API.'
                                );


                        const script =
                            document.getElementById(
                                YOUTUBE_API_SCRIPT_ID
                            );


                        if (
                            script &&
                            attempt <
                                YOUTUBE_API_RETRIES
                        ) {

                            script.remove();
                        }
                    }
                }


                throw (
                    lastError ??
                    new Error(
                        'Unable to initialize YouTube IFrame API.'
                    )
                );

            }
        )()
        .catch(
            error => {

                youtubeApiPromise =
                    null;

                throw error;
            }
        );


    return youtubeApiPromise;
}


/* ============================================================
 * PLAYER
 * ============================================================ */

export class YouTubePlayer {

    private readonly container:
        HTMLElement;


    private player:
        YouTubePlayerInstance |
        null =
        null;


    private initializePromise:
        Promise<void> |
        null =
        null;


    private state:
        YouTubePlayerState = {

        videoId:
            null,

        status:
            'idle',

        ready:
            false,

        /*
         * SIEMPRE 0..1.
         *
         * MusicPlayer ya trabaja con este
         * formato al guardar/restaurar volumen.
         */
        volume:
            1,

        muted:
            false,
    };


    private pendingVideoId:
        string |
        null =
        null;


    private pendingPlaybackAction:
        'play' |
        'pause' |
        'stop' |
        null =
        null;


    private pendingSeek:
        number |
        null =
        null;

    private pendingVideoStartSeconds:
        number |
        null =
        null;        

    private pendingPlayVideoId:
        string |
        null =
        null;

    private cuedStartTime:
        number |
        null =
        null;

    private pendingVolume:
        number |
        null =
        null;


    private pendingMuted:
        boolean |
        null =
        null;


    private listeners =
        new Set<
            (
                state:
                    YouTubePlayerState
            ) => void
        >();


    constructor(
        container:
            HTMLElement
    ) {

        this.container =
            container;
    }


    /* ========================================================
       SUBSCRIBE
       ======================================================== */

    subscribe(
        listener:
            (
                state:
                    YouTubePlayerState
            ) => void
    ):
        () => void {

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


    private notify():
        void {

        const state =
            this.getState();


        this.listeners.forEach(
            listener => {

                listener(
                    state
                );
            }
        );
    }


    /* ========================================================
       INITIALIZE
       ======================================================== */

    async initialize():
        Promise<void> {

        if (
            this.state.ready &&
            this.player
        ) {

            return;
        }


        if (
            this.initializePromise
        ) {

            return this.initializePromise;
        }


        this.initializePromise =
            (
                async () => {

                    const YT =
                        await loadYouTubeApi();


                    await new Promise<void>(
                        (
                            resolve,
                            reject
                        ) => {

                            let createdPlayer:
                                YouTubePlayerInstance |
                                null =
                                null;


                            let settled =
                                false;


                            const readyTimeout =
                                setTimeout(
                                    () => {

                                        if (
                                            settled
                                        ) {
                                            return;
                                        }


                                        settled =
                                            true;


                                        reject(
                                            new Error(
                                                'YouTube player did not become ready.'
                                            )
                                        );

                                    },
                                    10000
                                );


                            const resolveReady =
                                () => {

                                    if (
                                        settled
                                    ) {
                                        return;
                                    }


                                    settled =
                                        true;

                                    clearTimeout(
                                        readyTimeout
                                    );


                                    resolve();
                                };


                            const rejectReady =
                                (
                                    error:
                                        Error
                                ) => {

                                    if (
                                        settled
                                    ) {
                                        return;
                                    }


                                    settled =
                                        true;

                                    clearTimeout(
                                        readyTimeout
                                    );


                                    reject(
                                        error
                                    );
                                };


                            try {

                                createdPlayer =
                                    new YT.Player(
                                        this.container,
                                        {

                                            height:
                                                '100%',

                                            width:
                                                '100%',


                                            playerVars: {

                                                autoplay:
                                                    0,

                                                controls:
                                                    0,

                                                disablekb:
                                                    1,

                                                fs:
                                                    0,

                                                modestbranding:
                                                    1,

                                                playsinline:
                                                    1,

                                                rel:
                                                    0,
                                            },


                                            events: {

                                                onReady:
                                                    () => {

                                                        /*
                                                         * MUY IMPORTANTE:
                                                         *
                                                         * Solo guardamos el player
                                                         * cuando onReady ya llegó.
                                                         *
                                                         * Así nunca exponemos una instancia
                                                         * parcialmente inicializada.
                                                         */
                                                        if (
                                                            !createdPlayer
                                                        ) {

                                                            rejectReady(
                                                                new Error(
                                                                    'YouTube player instance is unavailable.'
                                                                )
                                                            );

                                                            return;
                                                        }


                                                        this.player =
                                                            createdPlayer;


                                                        this.state.ready =
                                                            true;

                                                        this.state.status =
                                                            'paused';


                                                        const volume =
                                                            createdPlayer.getVolume();


                                                        this.state.volume =
                                                            Number.isFinite(
                                                                volume
                                                            )
                                                                ? Math.min(
                                                                    100,
                                                                    Math.max(
                                                                        0,
                                                                        volume
                                                                    )
                                                                ) /
                                                                100
                                                                : 1;


                                                        this.state.muted =
                                                            createdPlayer.isMuted();


                                                        this.applyPendingCommands(
                                                            createdPlayer
                                                        );


                                                        this.notify();


                                                        resolveReady();
                                                    },


                                                onStateChange:
                                                    event => {

                                                        switch (
                                                            event.data
                                                        ) {

                                                            case YT.PlayerState.PLAYING:

                                                                /*
                                                                * Mientras una nueva canción está siendo
                                                                * preparada, PLAYING no puede ser una
                                                                * transición válida de esa carga.
                                                                *
                                                                * La reproducción de una canción nueva
                                                                * solo puede comenzar después de CUED.
                                                                *
                                                                * Si YouTube entrega aquí un PLAYING
                                                                * tardío de la reproducción anterior,
                                                                * lo ignoramos para no destruir el estado
                                                                * pendiente de la canción actual.
                                                                */
                                                                if (
                                                                    this.state.status ===
                                                                    'loading'
                                                                ) {
                                                                    break;
                                                                }

                                                                this.cuedStartTime =
                                                                    null;

                                                                this.pendingPlaybackAction =
                                                                    null;

                                                                this.pendingPlayVideoId =
                                                                    null;

                                                                this.state.status =
                                                                    'playing';

                                                                break;

                                                            case YT.PlayerState.BUFFERING:

                                                                /*
                                                                * Durante una nueva carga todavía estamos
                                                                * esperando CUED.
                                                                *
                                                                * No debemos transformar loading → buffering
                                                                * por un evento tardío de la canción anterior.
                                                                *
                                                                * Esto también evita que un seek posterior
                                                                * trate la nueva canción como si ya estuviera
                                                                * reproduciéndose.
                                                                */
                                                                if (
                                                                    this.state.status ===
                                                                    'loading'
                                                                ) {
                                                                    break;
                                                                }

                                                                this.state.status =
                                                                    'buffering';

                                                                break;

                                                            case YT.PlayerState.PAUSED:

                                                                /*
                                                                * Si estamos preparando una nueva canción,
                                                                * una señal PAUSED no debe cancelar el
                                                                * PLAY pendiente de esa canción.
                                                                *
                                                                * El PAUSED válido durante una carga solo
                                                                * será reflejado si el usuario realmente
                                                                * canceló la reproducción, en cuyo caso
                                                                * pause() ya habrá cambiado el estado a
                                                                * 'paused' y limpiado los pendientes.
                                                                */
                                                                if (
                                                                    this.state.status ===
                                                                    'loading'
                                                                ) {
                                                                    break;
                                                                }

                                                                this.cuedStartTime =
                                                                    null;

                                                                this.pendingPlaybackAction =
                                                                    null;

                                                                this.pendingPlayVideoId =
                                                                    null;

                                                                this.state.status =
                                                                    'paused';

                                                                break;


                                                            case YT.PlayerState.ENDED:

                                                                /*
                                                                * ENDED solo es válido cuando la canción
                                                                * que estamos reproduciendo llegó realmente
                                                                * al final.
                                                                *
                                                                * Mientras cargamos una nueva canción o
                                                                * estamos iniciando una reproducción pendiente,
                                                                * un ENDED tardío no debe disparar
                                                                * Next / Repeat.
                                                                */
                                                                if (
                                                                    this.state.status ===
                                                                        'loading' ||
                                                                    this.state.status ===
                                                                        'buffering'
                                                                ) {
                                                                    break;
                                                                }

                                                                this.cuedStartTime =
                                                                    null;

                                                                this.pendingPlaybackAction =
                                                                    null;

                                                                this.pendingPlayVideoId =
                                                                    null;

                                                                this.state.status =
                                                                    'ended';

                                                                break;


                                                            case YT.PlayerState.CUED:

                                                                /*
                                                                * Si había un seek pendiente porque
                                                                * el cue anterior todavía no estaba
                                                                * listo, volvemos a cuear el mismo
                                                                * vídeo usando startSeconds.
                                                                *
                                                                * NO usamos seekTo() aquí porque
                                                                * YouTube documenta que seekTo()
                                                                * desde CUED puede iniciar
                                                                * reproducción.
                                                                */
                                                                if (
                                                                    this.pendingSeek !==
                                                                    null &&
                                                                    this.state.videoId
                                                                ) {

                                                                    const targetTime =
                                                                        Math.max(
                                                                            0,
                                                                            this.pendingSeek
                                                                        );

                                                                    this.pendingSeek =
                                                                        null;

                                                                    this.cuedStartTime =
                                                                        targetTime;

                                                                    this.state.status =
                                                                        'loading';

                                                                    player.cueVideoById(
                                                                        this.state.videoId,
                                                                        targetTime
                                                                    );

                                                                    this.notify();

                                                                    return;
                                                                }


                                                                this.state.status =
                                                                    'paused';

                                                                /*
                                                                * Aquí es donde finalmente
                                                                * convertimos "quiero reproducir"
                                                                * en playVideo().
                                                                */
                                                                if (
                                                                    this.pendingPlaybackAction ===
                                                                        'play' &&
                                                                    this.pendingPlayVideoId ===
                                                                        this.state.videoId
                                                                ) {

                                                                    this.pendingPlaybackAction =
                                                                        null;

                                                                    this.pendingPlayVideoId =
                                                                        null;

                                                                    this.state.status =
                                                                        'buffering';

                                                                    player.playVideo();

                                                                    this.notify();

                                                                    return;
                                                                }

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


                                                        if (
                                                            !this.state.ready
                                                        ) {

                                                            rejectReady(
                                                                new Error(
                                                                    `YouTube player initialization failed with error ${event.data}.`
                                                                )
                                                            );
                                                        }
                                                    },
                                                onAutoplayBlocked:
                                                    () => {

                                                        console.warn(
                                                            '[YouTubePlayer] Playback was blocked by the browser.'
                                                        );

                                                        this.pendingPlaybackAction =
                                                            null;

                                                        this.pendingPlayVideoId =
                                                            null;

                                                        this.state.status =
                                                            'paused';

                                                        this.notify();
                                                    },                                                
                                            },

                                        }
                                    );

                            } catch (
                                error
                            ) {

                                rejectReady(
                                    error instanceof Error
                                        ? error
                                        : new Error(
                                            'Unable to create YouTube player.'
                                        )
                                );
                            }

                        }
                    );

                }
            )();


        try {

            await this.initializePromise;

        } catch (
            error
        ) {

            this.initializePromise =
                null;

            this.player =
                null;

            this.state.ready =
                false;

            this.state.status =
                'error';

            this.notify();

            throw error;
        }
    }

    private applyPendingCommands(
        player:
            YouTubePlayerInstance
    ):
        void {

        /*
        * ---------------------------------------------
        * VOLUME
        * ---------------------------------------------
        */
        if (
            this.pendingVolume !==
            null
        ) {

            player.setVolume(
                this.pendingVolume
            );

            this.state.volume =
                this.pendingVolume /
                100;

            this.pendingVolume =
                null;
        }


        /*
        * ---------------------------------------------
        * MUTE
        * ---------------------------------------------
        */
        if (
            this.pendingMuted !==
            null
        ) {

            if (
                this.pendingMuted
            ) {

                player.mute();

            } else {

                player.unMute();
            }

            this.state.muted =
                this.pendingMuted;

            this.pendingMuted =
                null;
        }


        /*
        * ---------------------------------------------
        * VIDEO PENDIENTE
        * ---------------------------------------------
        *
        * Nunca llamamos PLAY inmediatamente después
        * de cueVideoById().
        *
        * Si existe un seek pendiente, aprovechamos
        * startSeconds al hacer el cue.
        */
        if (
            this.pendingVideoId
        ) {
            const videoId =
                this.pendingVideoId;

            /*
            * Si existe un seek manual pendiente,
            * tiene prioridad sobre la posición
            * inicial de la carga.
            *
            * Esto permite que un usuario haga seek
            * mientras el vídeo todavía está cargando.
            */
            const startSeconds =
                this.pendingSeek !== null
                    ? Math.max(
                        0,
                        this.pendingSeek
                    )
                    : this.pendingVideoStartSeconds !== null
                        ? Math.max(
                            0,
                            this.pendingVideoStartSeconds
                        )
                        : 0;

            this.pendingVideoId =
                null;

            this.pendingSeek =
                null;

            this.pendingVideoStartSeconds =
                null;

            this.state.videoId =
                videoId;

            this.cuedStartTime =
                startSeconds;

            player.cueVideoById(
                videoId,
                startSeconds
            );

            this.state.status =
                'loading';

            /*
            * El PLAY pendiente se conserva.
            *
            * onStateChange(CUED) será quien
            * decida cuándo ejecutarlo.
            *
            * pause/stop no necesitan ejecutarse
            * sobre un vídeo que acaba de ser
            * preparado y todavía está pausado.
            */
            if (
                this.pendingPlaybackAction !==
                'play'
            ) {

                this.pendingPlaybackAction =
                    null;

                this.pendingPlayVideoId =
                    null;
            }

            this.notify();

            return;
        }


        /*
        * ---------------------------------------------
        * PLAY / PAUSE / STOP PENDIENTE
        * ---------------------------------------------
        *
        * Solo llegamos aquí cuando no existe
        * un vídeo pendiente de ser cued.
        */
        if (
            this.pendingPlaybackAction ===
            'play'
        ) {

            this.pendingPlaybackAction =
                null;

            this.pendingPlayVideoId =
                this.state.videoId;

            this.state.status =
                'buffering';

            player.playVideo();

        } else if (
            this.pendingPlaybackAction ===
            'pause'
        ) {

            this.pendingPlaybackAction =
                null;

            this.pendingPlayVideoId =
                null;

            player.pauseVideo();

            this.state.status =
                'paused';

        } else if (
            this.pendingPlaybackAction ===
            'stop'
        ) {

            this.pendingPlaybackAction =
                null;

            this.pendingPlayVideoId =
                null;

            player.stopVideo();

            this.state.status =
                'paused';
        }
    }


    /* ========================================================
       LOAD
       ======================================================== */

    load(
        videoId:
            string,
        startSeconds?:
            number
    ):
        void {

        const normalizedVideoId =
            videoId.trim();

        const normalizedStartSeconds =
            typeof startSeconds ===
                'number' &&
            Number.isFinite(
                startSeconds
            )
                ? Math.max(
                    0,
                    startSeconds
                )
                : 0;

        if (
            normalizedVideoId.length ===
            0
        ) {
            return;
        }


        /*
        * Una nueva canción cancela cualquier
        * intención de PLAY anterior.
        */
        this.pendingPlaybackAction =
            null;

        this.pendingPlayVideoId =
            null;

        /*
        * Una nueva carga comienza con una
        * nueva posición inicial.
        *
        * El seek manual pendiente anterior
        * ya no pertenece a esta canción.
        */
        this.pendingSeek =
            null;

        this.pendingVideoStartSeconds =
            normalizedStartSeconds;

        this.state.videoId =
            normalizedVideoId;

        this.cuedStartTime =
            normalizedStartSeconds;

        this.state.status =
            'loading';

        this.notify();


        /*
        * PLAYER YA LISTO
        */
        if (
            this.player &&
            this.state.ready
        ) {
            /*
            * El player ya está listo.
            *
            * cueVideoById() prepara el vídeo
            * sin iniciar la reproducción.
            */
            this.pendingVideoStartSeconds =
                null;

            this.player.cueVideoById(
                normalizedVideoId,
                normalizedStartSeconds
            );

            return;
        }

        /*
        * PLAYER TODAVÍA NO LISTO
        */
        this.pendingVideoId =
            normalizedVideoId;

        this.pendingVideoStartSeconds =
            normalizedStartSeconds;

        void this.initialize()
            .catch(
                error => {
                    this.state.status =
                        'error';

                    this.pendingVideoId =
                        null;

                    this.pendingVideoStartSeconds =
                        null;

                    this.pendingPlaybackAction =
                        null;

                    this.pendingPlayVideoId =
                        null;                    

                    this.notify();

                    console.error(
                        '[YouTubePlayer] Unable to initialize player:',
                        error
                    );
                }
            );
    }

    /* ========================================================
       PLAY
       ======================================================== */

    play():
        void {

        if (
            !this.state.videoId &&
            !this.pendingVideoId
        ) {

            return;
        }


        this.pendingPlaybackAction =
            'play';


        /*
        * Si todavía no existe el iframe,
        * esperamos a initialize().
        */
        if (
            !this.player ||
            !this.state.ready
        ) {

            this.pendingPlayVideoId =
                this.state.videoId ??
                this.pendingVideoId;

            void this.initialize()
                .catch(
                    error => {

                        this.pendingPlaybackAction =
                            null;

                        this.pendingPlayVideoId =
                            null;

                        this.state.status =
                            'error';

                        this.notify();

                        console.error(
                            '[YouTubePlayer] Unable to initialize player:',
                            error
                        );
                    }
                );

            return;
        }


        /*
        * La canción está siendo preparada.
        *
        * Esperamos CUED.
        */
        if (
            this.state.status ===
            'loading'
        ) {

            this.pendingPlayVideoId =
                this.state.videoId;

            return;
        }


        /*
        * El vídeo ya está disponible.
        */
        this.pendingPlaybackAction =
            null;

        this.pendingPlayVideoId =
            null;

        this.state.status =
            'buffering';

        this.notify();

        this.player.playVideo();
    }


    /* ========================================================
       PAUSE
       ======================================================== */

    pause():
        void {

        this.pendingPlaybackAction =
            null;

        this.pendingPlayVideoId =
            null;

        /*
         * IMPORTANTE:
         *
         * Si YouTube nunca fue inicializado,
         * pausar no debe provocar que carguemos
         * la API solo por seleccionar RADIO.
         */
        if (
            !this.player ||
            !this.state.ready
        ) {

            if (
                this.initializePromise
            ) {

                this.pendingPlaybackAction =
                    'pause';
            }


            this.state.status =
                'paused';

            this.notify();

            return;
        }


        if (
            typeof this.player.pauseVideo !==
                'function'
        ) {
            return;
        }


        this.pendingPlaybackAction =
            null;


        this.player.pauseVideo();


        this.state.status =
            'paused';


        this.notify();
    }


    /* ========================================================
       STOP
       ======================================================== */

    stop():
        void {

        if (
            !this.player ||
            !this.state.ready
        ) {

            this.pendingPlaybackAction =
                'stop';

            this.state.status =
                'paused';

            this.notify();

            return;
        }


        if (
            typeof this.player.stopVideo ===
                'function'
        ) {

            this.player.stopVideo();
        }


        this.pendingPlaybackAction =
            null;


        this.state.status =
            'paused';


        this.notify();
    }


    /* ========================================================
       TIME
       ======================================================== */

    getCurrentTime():
        number {

        if (
            this.player &&
            this.state.ready
        ) {

            const playerState =
                this.player.getPlayerState();

            if (
                (
                    playerState ===
                        YT.PlayerState.CUED ||
                    playerState ===
                        YT.PlayerState.UNSTARTED
                ) &&
                this.cuedStartTime !==
                    null
            ) {

                return this.cuedStartTime;
            }

            return this.player.getCurrentTime();
        }


        return (
            this.pendingSeek ??
            this.cuedStartTime ??
            0
        );
    }

    getDuration():
        number {

        if (
            this.player &&
            this.state.ready &&
            typeof this.player.getDuration ===
                'function'
        ) {

            return this.player.getDuration();
        }


        return 0;
    }


    seekTo(
        seconds:
            number
    ):
        void {

        if (
            !Number.isFinite(
                seconds
            )
        ) {
            return;
        }


        const safeSeconds =
            Math.max(
                0,
                seconds
            );


        /*
        * YouTube todavía no está preparado
        * o estamos en medio de una nueva carga.
        */
        if (
            !this.player ||
            !this.state.ready ||
            this.state.status ===
                'loading'
        ) {

            this.pendingSeek =
                safeSeconds;

            return;
        }


        const playerState =
            this.player.getPlayerState();


        /*
        * CUED / UNSTARTED / ENDED
        *
        * NO usamos seekTo().
        *
        * Volvemos a cuear el vídeo con
        * startSeconds para mantenerlo pausado.
        */
        if (
            playerState ===
                YT.PlayerState.CUED ||
            playerState ===
                YT.PlayerState.UNSTARTED ||
            playerState ===
                YT.PlayerState.ENDED
        ) {

            if (
                !this.state.videoId
            ) {

                this.pendingSeek =
                    safeSeconds;

                return;
            }

            this.cuedStartTime =
                safeSeconds;

            this.state.status =
                'loading';

            this.player.cueVideoById(
                this.state.videoId,
                safeSeconds
            );

            this.notify();

            return;
        }


        /*
        * PAUSED / PLAYING / BUFFERING
        *
        * Aquí sí usamos seekTo().
        *
        * Si ya está pausado, YouTube mantiene
        * el estado pausado.
        */
        this.player.seekTo(
            safeSeconds,
            true
        );

        this.cuedStartTime =
            null;

        this.notify();
    }


    /* ========================================================
       VOLUME
       ======================================================== */

    setVolume(
        volume:
            number
    ):
        void {

        const normalized =
            Math.min(
                100,
                Math.max(
                    0,
                    volume
                )
            );


        this.state.volume =
            normalized /
            100;


        if (
            !this.player ||
            !this.state.ready
        ) {

            this.pendingVolume =
                normalized;

            this.notify();

            return;
        }


        if (
            typeof this.player.setVolume !==
                'function'
        ) {
            return;
        }


        this.player.setVolume(
            normalized
        );


        this.notify();
    }


    /* ========================================================
       MUTE
       ======================================================== */

    setMuted(
        muted:
            boolean
    ):
        void {

        this.state.muted =
            muted;


        if (
            !this.player ||
            !this.state.ready
        ) {

            this.pendingMuted =
                muted;

            this.notify();

            return;
        }


        if (
            muted
        ) {

            if (
                typeof this.player.mute ===
                    'function'
            ) {

                this.player.mute();
            }

        } else {

            if (
                typeof this.player.unMute ===
                    'function'
            ) {

                this.player.unMute();
            }
        }


        this.notify();
    }


    /* ========================================================
       STATE
       ======================================================== */

    getState():
        YouTubePlayerState {

        return {
            ...this.state,
        };
    }


    /* ========================================================
       DESTROY
       ======================================================== */

    destroy():
        void {

        if (
            this.player &&
            typeof this.player.destroy ===
                'function'
        ) {

            this.player.destroy();
        }


        this.player =
            null;

        this.initializePromise =
            null;


        this.pendingVideoId =
            null;

        this.pendingPlaybackAction =
            null;

        this.pendingSeek =
            null;

        this.pendingVideoStartSeconds =
            null;

        this.pendingVolume =
            null;

        this.pendingMuted =
            null;

        this.pendingPlayVideoId =
            null;

        this.cuedStartTime =
            null;            


        this.state = {

            videoId:
                null,

            status:
                'idle',

            ready:
                false,

            volume:
                1,

            muted:
                false,
        };


        this.notify();
    }
}
