import {
    getArtistRadio,
    getMusicApiNext,
    resolveTrack,
} from '../music/music-service';

import type {
    MusicRadioTrack,
    MusicTrack,
    MusicApiCollection,
} from '../music/music-types';

import type {
    MusicPanelTab,
    PlaybackAudioAdapter,
    PlaybackController,
    PlaybackListSource,
    PlaybackSelectionOptions,
    PlaybackSource,
    PlaybackState,
    PlaybackYouTubeAdapter,
} from './types';

/* ============================================================
 * RESOLVE CACHE
 * ============================================================ */

const resolveCache =
    new Map<
        number,
        Promise<string | null>
    >();


const resolvedYouTubeIds =
    new Map<
        number,
        string
    >();


/* ============================================================
 * ARTIST RADIO CACHE
 * ============================================================ */

const artistRadioCache =
    new Map<
        number,
        Promise<MusicRadioTrack[]>
    >();


const artistRadioResults =
    new Map<
        number,
        MusicRadioTrack[]
    >();


/* ============================================================
 * PLAYBACK STATE
 * ============================================================ */

export function createPlaybackState():
    PlaybackState {

    return {
        playbackList: [],
        playbackListCurrentIndex: -1,
        playbackListMode: 'context',
        playbackListSource: null,

        playbackListNext: null,
        playbackListTotal: null,
        playbackListLoadingMore: false,

        currentMusicTrack: null,
        currentYouTubeVideoId: null,

        playbackIntent: 'pause',

        playbackRequestId: 0,
        queueRequestId: 0,

        youtubeRepeat: false,
        youtubeShuffle: false,
        youtubeShuffleHistory: [],
        youtubeShuffleHistoryPosition: -1,
    };
}

export function isPlaybackPanelSource(
    source: PlaybackListSource
): boolean {

    return (
        source !== null &&
        source !== 'home-trending' &&
        source !== 'search-all'
    );
}

/* ============================================================
 * RESOLVE HELPERS
 * ============================================================ */

export function hasResolveInFlight(
    trackId: number
): boolean {

    return resolveCache.has(
        trackId
    );
}


export async function resolveYouTubeTrack(
    track: MusicTrack
): Promise<string | null> {

    const cachedVideoId =
        resolvedYouTubeIds.get(
            track.id
        );

    if (cachedVideoId) {

        console.log(
            '[MusicPlayer] Using cached YouTube ID:',
            {
                deezerId:
                    track.id,

                youtubeId:
                    cachedVideoId,
            }
        );

        return cachedVideoId;
    }


    const existingRequest =
        resolveCache.get(
            track.id
        );

    if (existingRequest) {

        console.log(
            '[MusicPlayer] Reusing in-flight resolve:',
            track.id
        );

        return existingRequest;
    }


    const artistName =
        track.artist?.name ??
        '';

    const trackName =
        track.title ??
        '';


    if (
        !artistName ||
        !trackName
    ) {

        console.log(
            '[MusicPlayer] Cannot resolve track: missing artist or title.'
        );

        return null;
    }


    console.log(
        '[MusicPlayer] Starting resolve:',
        {
            deezerId:
                track.id,

            artist:
                artistName,

            title:
                trackName,
        }
    );


    const request =
        (async (): Promise<
            string | null
        > => {

            try {

                const response =
                    await resolveTrack(
                        track.id,
                        artistName,
                        trackName
                    );


                const videoId =
                    response.results?.[0]?.id;


                if (!videoId) {

                    console.log(
                        '[MusicPlayer] No YouTube video found:',
                        track.id
                    );

                    return null;
                }


                resolvedYouTubeIds.set(
                    track.id,
                    videoId
                );


                console.log(
                    '[MusicPlayer] Resolve completed:',
                    {
                        deezerId:
                            track.id,

                        youtubeId:
                            videoId,
                    }
                );


                return videoId;

            } catch (error) {

                console.error(
                    '[MusicPlayer] Music resolve failed:',
                    error
                );

                return null;
            }

        })();


    resolveCache.set(
        track.id,
        request
    );


    try {

        return await request;

    } finally {

        resolveCache.delete(
            track.id
        );
    }
}


/* ============================================================
 * ARTIST RADIO
 * ============================================================ */

export async function getArtistRadioTracks(
    artistId: number
): Promise<MusicRadioTrack[]> {

    const cachedTracks =
        artistRadioResults.get(
            artistId
        );

    if (cachedTracks) {

        console.log(
            '[MusicPlayer] Using cached Artist Radio:',
            artistId
        );

        return cachedTracks;
    }


    const existingRequest =
        artistRadioCache.get(
            artistId
        );

    if (existingRequest) {

        console.log(
            '[MusicPlayer] Reusing in-flight Artist Radio:',
            artistId
        );

        return existingRequest;
    }


    console.log(
        '[MusicPlayer] Starting Artist Radio:',
        artistId
    );


    const request =
        (async (): Promise<
            MusicRadioTrack[]
        > => {

            try {

                const response =
                    await getArtistRadio(
                        artistId
                    );


                const tracks =
                    response.data ?? [];


                artistRadioResults.set(
                    artistId,
                    tracks
                );


                console.log(
                    '[MusicPlayer] Artist Radio completed:',
                    {
                        artistId,

                        tracks:
                            tracks.length,
                    }
                );


                return tracks;

            } catch (error) {

                console.error(
                    '[MusicPlayer] Artist Radio failed:',
                    error
                );

                return [];
            }

        })();


    artistRadioCache.set(
        artistId,
        request
    );


    try {

        return await request;

    } finally {

        artistRadioCache.delete(
            artistId
        );
    }
}


/* ============================================================
 * BUILD MUSIC QUEUE
 * ============================================================ */

export function buildMusicQueue(
    selectedTrack: MusicTrack,
    radioTracks: MusicRadioTrack[]
): MusicTrack[] {

    const uniqueRadioTracks:
        MusicTrack[] = [];


    const seenTrackIds =
        new Set<number>();


    for (
        const track of radioTracks
    ) {

        if (
            seenTrackIds.has(
                track.id
            )
        ) {
            continue;
        }


        seenTrackIds.add(
            track.id
        );


        uniqueRadioTracks.push(
            track
        );
    }


    const selectedTrackIndex =
        uniqueRadioTracks.findIndex(
            track =>
                track.id ===
                selectedTrack.id
        );


    if (
        selectedTrackIndex >= 0
    ) {

        return uniqueRadioTracks;
    }


    return [
        selectedTrack,
        ...uniqueRadioTracks,
    ];
}


/* ============================================================
 * SHUFFLE HELPER
 * ============================================================ */

export function getNextShuffleIndex(
    tracks: MusicTrack[],
    currentIndex: number
): number | null {

    if (
        tracks.length <= 1
    ) {

        return null;
    }


    const availableIndexes =
        tracks
            .map(
                (_, index) =>
                    index
            )
            .filter(
                index =>
                    index !==
                    currentIndex
            );


    if (
        availableIndexes.length === 0
    ) {

        return null;
    }


    const randomPosition =
        Math.floor(
            Math.random() *
            availableIndexes.length
        );


    return (
        availableIndexes[
            randomPosition
        ] ?? null
    );
}


/* ============================================================
 * PLAYBACK CONTROLLER
 * ============================================================ */

interface PlaybackControllerOptions {

    state:
        PlaybackState;

    youtubePlayer:
        PlaybackYouTubeAdapter;

    audioPlayer:
        PlaybackAudioAdapter;

    getActivePlaybackSource:
        () => PlaybackSource;

    setActivePlaybackSource:
        (
            source: PlaybackSource
        ) => void;

    updateTrackInfo:
        () => void;

    updateUI:
        () => void;

    updateTrackPlaybackIndicators:
        () => void;

    renderQueuePanel:
        () => void;

    scrollQueueTrackIntoView:
        (
            index: number
        ) => void;

    activatePanelTab:
        (
            tab: MusicPanelTab
        ) => void;
}


export function createPlaybackController(
    options:
        PlaybackControllerOptions
): PlaybackController {

    const {
        state,
        youtubePlayer,
        audioPlayer,
        getActivePlaybackSource,
        setActivePlaybackSource,
        updateTrackInfo,
        updateUI,
        updateTrackPlaybackIndicators,
        renderQueuePanel,
        scrollQueueTrackIntoView,
        activatePanelTab,
    } = options;


    function arePlaybackListsEqual(
        first: MusicTrack[],
        second: MusicTrack[]
    ): boolean {

        if (
            first.length !==
            second.length
        ) {
            return false;
        }

        return first.every(
            (
                track,
                index
            ) =>
                track.id ===
                second[index]?.id
        );
    }


    let playbackListLoadPromise:
    Promise<boolean> | null =
    null;


    async function loadMorePlaybackList():
        Promise<boolean> {

        if (
            !state.playbackListNext
        ) {
            return false;
        }


        if (
            playbackListLoadPromise
        ) {
            return playbackListLoadPromise;
        }


        const requestId =
            state.playbackRequestId;

        const queueRequestId =
            state.queueRequestId;


        const loadPromise =
            (async () => {

                state.playbackListLoadingMore =
                    true;


                try {

                    const response =
                        await getMusicApiNext<
                            MusicApiCollection<
                                MusicTrack
                            >
                        >(
                            state.playbackListNext!
                        );


                    /*
                    * El usuario pudo haber cambiado
                    * de contexto mientras llegaba
                    * la petición.
                    */
                    if (
                        requestId !==
                            state.playbackRequestId ||
                        queueRequestId !==
                            state.queueRequestId
                    ) {

                        return false;
                    }


                    if (
                        response.status !==
                        'success'
                    ) {

                        throw new Error(
                            'Playback pagination request failed.'
                        );
                    }


                    const existingIds =
                        new Set(
                            state.playbackList.map(
                                currentTrack =>
                                    currentTrack.id
                            )
                        );


                    const newTracks =
                        (
                            response.data ??
                            []
                        ).filter(
                            currentTrack =>
                                !existingIds.has(
                                    currentTrack.id
                                )
                        );


                    state.playbackList.push(
                        ...newTracks
                    );


                    state.playbackListNext =
                        response.next ??
                        null;


                    state.playbackListTotal =
                        response.total ??
                        state.playbackListTotal ??
                        state.playbackList.length;


                    renderQueuePanel();

                    updateTrackPlaybackIndicators();


                    return (
                        newTracks.length >
                        0
                    );

                } catch (
                    error
                ) {

                    console.error(
                        '[MusicPlayer] Playback pagination failed:',
                        error
                    );


                    if (
                        requestId ===
                        state.playbackRequestId &&
                        queueRequestId ===
                        state.queueRequestId
                    ) {

                        state.playbackListNext =
                            null;
                    }


                    return false;

                } finally {

                    if (
                        requestId ===
                            state.playbackRequestId &&
                        queueRequestId ===
                            state.queueRequestId
                    ) {

                        state.playbackListLoadingMore =
                            false;
                    }
                }
            })();


        playbackListLoadPromise =
            loadPromise;


        try {

            return await loadPromise;

        } finally {

            if (
                playbackListLoadPromise ===
                loadPromise
            ) {

                playbackListLoadPromise =
                    null;
            }
        }
    }

    async function selectMusicTrack(
        track: MusicTrack,
        selectionOptions:
            PlaybackSelectionOptions = {}
    ): Promise<void> {

        const isSameCurrentTrack =
            getActivePlaybackSource() ===
                'youtube' &&
            state.currentMusicTrack?.id ===
                track.id;

        const hasPlaybackListSelection =
            selectionOptions.playbackList !==
            undefined;

        const isSamePlaybackContext =
            !hasPlaybackListSelection ||
            (
                (
                    selectionOptions.playbackListMode ??
                    state.playbackListMode
                ) ===
                    state.playbackListMode &&

                (
                    selectionOptions.playbackListSource ??
                    state.playbackListSource
                ) ===
                    state.playbackListSource &&

                arePlaybackListsEqual(
                    selectionOptions.playbackList ?? [],
                    state.playbackList
                )
            );


        /*
        * --------------------------------------------------
        * MISMA CANCIÓN
        * --------------------------------------------------
        */
        if (
            isSameCurrentTrack &&
            isSamePlaybackContext &&
            (
                state.currentYouTubeVideoId !==
                    null ||

                hasResolveInFlight(
                    track.id
                )
            )
        ) {

            state.playbackIntent =
                state.playbackIntent ===
                    'play'
                    ? 'pause'
                    : 'play';


            console.log(
                '[MusicPlayer] Toggling current track:',
                {
                    deezerId:
                        track.id,

                    intent:
                        state.playbackIntent,
                }
            );


            if (
                state.currentYouTubeVideoId
            ) {

                if (
                    state.playbackIntent ===
                    'pause'
                ) {

                    youtubePlayer.pause();

                } else {

                    youtubePlayer.play();
                }
            }


            updateTrackPlaybackIndicators();
            updateUI();


            return;
        }


        /*
         * --------------------------------------------------
         * NUEVA CANCIÓN
         * --------------------------------------------------
         */

        const currentPlaybackRequestId =
            ++state.playbackRequestId;


        const currentQueueRequestId =
            ++state.queueRequestId;


        /*
        * --------------------------------------------------
        * PLAYBACK LIST MODE / SOURCE
        * --------------------------------------------------
        */

if (
    selectionOptions.playbackList !==
    undefined
) {

    state.playbackList = [
        ...selectionOptions.playbackList,
    ];

    state.playbackListNext =
        selectionOptions.playbackListNext ??
        null;

    state.playbackListTotal =
        selectionOptions.playbackListTotal ??
        state.playbackList.length;

    state.playbackListLoadingMore =
        false;

    state.playbackListCurrentIndex =
        state.playbackList.findIndex(
            currentTrack =>
                currentTrack.id ===
                track.id
        );

    state.youtubeShuffleHistory =
        [];

    state.youtubeShuffleHistoryPosition =
        -1;

    renderQueuePanel();

    if (
        isPlaybackPanelSource(
            state.playbackListSource
        )
    ) {

        activatePanelTab(
            'playback'
        );

    } else if (
        state.playbackListSource ===
        'search-all'
    ) {

        activatePanelTab(
            'search'
        );

    } else {

        activatePanelTab(
            'home'
        );
    }

} else if (
            selectionOptions.queueIndex !==
            undefined
        ) {

            state.playbackListCurrentIndex =
                selectionOptions.queueIndex;

            renderQueuePanel();

            scrollQueueTrackIntoView(
                selectionOptions.queueIndex
            );

        } else if (
            selectionOptions.queueAction ===
            'generate'
        ) {

            state.playbackList =
                [];

            state.playbackListCurrentIndex =
                -1;
            state.playbackListNext = null;
            state.playbackListTotal = null;
            state.playbackListLoadingMore = false;

            renderQueuePanel();

        } else if (
            selectionOptions.queueAction ===
            'clear'
        ) {

            state.playbackList =
                [];

            state.playbackListCurrentIndex =
                -1;
            state.playbackListNext = null;
            state.playbackListTotal = null;
            state.playbackListLoadingMore = false;

            renderQueuePanel();
        }


        /*
         * Nueva pista actual
         */

        state.currentMusicTrack =
            track;


        setActivePlaybackSource(
            'youtube'
        );


        state.playbackIntent =
            'play';


        state.currentYouTubeVideoId =
            null;


        /*
         * Detener la canción anterior
         */

        youtubePlayer.pause();


        updateTrackInfo();
        updateUI();
        updateTrackPlaybackIndicators();


        console.log(
            '[MusicPlayer] Music track selected:',
            {
                id:
                    track.id,

                title:
                    track.title,

                artist:
                    track.artist.name,
            }
        );


        /*
         * --------------------------------------------------
         * RESOLVE + ARTIST RADIO
         * --------------------------------------------------
         */

        const resolvePromise =
            resolveYouTubeTrack(
                track
            );


        const queuePromise =
            selectionOptions.queueAction ===
            'generate'
                ? getArtistRadioTracks(
                    track.artist.id
                )
                : null;


        /*
         * --------------------------------------------------
         * RESOLVE
         * --------------------------------------------------
         */

        try {

            const videoId =
                await resolvePromise;


            if (
                currentPlaybackRequestId !==
                state.playbackRequestId
            ) {

                console.log(
                    '[MusicPlayer] Ignoring outdated playback resolve:',
                    track.id
                );


                return;
            }


            if (!videoId) {

                console.log(
                    '[MusicPlayer] No YouTube video found:',
                    track.id
                );


                state.playbackIntent =
                    'pause';


                updateUI();
                updateTrackPlaybackIndicators();


            } else {

                state.currentYouTubeVideoId =
                    videoId;


                if (
                    state.playbackIntent !==
                    'play'
                ) {

                    console.log(
                        '[MusicPlayer] Track resolved but playback was paused by user:',
                        track.id
                    );


                    updateUI();
                    updateTrackPlaybackIndicators();


                } else {

                    audioPlayer.pause();


                    setActivePlaybackSource(
                        'youtube'
                    );


                    youtubePlayer.load(
                        videoId
                    );


                    youtubePlayer.play();


                    updateUI();
                    updateTrackPlaybackIndicators();


                    console.log(
                        '[MusicPlayer] YouTube playback started:',
                        {
                            deezerId:
                                track.id,

                            youtubeId:
                                videoId,
                        }
                    );
                }
            }

        } catch (error) {

            console.error(
                '[MusicPlayer] Music resolve failed:',
                error
            );


            state.playbackIntent =
                'pause';


            updateUI();
            updateTrackPlaybackIndicators();
        }


        /*
         * --------------------------------------------------
         * ARTIST RADIO
         * --------------------------------------------------
         */

        if (
            !queuePromise
        ) {

            return;
        }


        try {

            const radioTracks =
                await queuePromise;


            if (
                currentQueueRequestId !==
                state.queueRequestId
            ) {

                console.log(
                    '[MusicPlayer] Ignoring outdated Artist Radio:',
                    track.artist.id
                );


                return;
            }


            state.playbackList =
                buildMusicQueue(
                    track,
                    radioTracks
                );

            state.playbackListNext =
                null;

            state.playbackListTotal =
                state.playbackList.length;

            state.playbackListLoadingMore =
                false;

            state.playbackListCurrentIndex =
                state.playbackList.findIndex(
                    currentTrack =>
                        currentTrack.id ===
                        track.id
                );


            state.youtubeShuffleHistory =
                [];


            state.youtubeShuffleHistoryPosition =
                -1;


            console.log(
                '[MusicPlayer] New Music Queue ready:',
                {
                    artistId:
                        track.artist.id,

                    length:
                        state.playbackList.length,

                    currentIndex:
                        state.playbackListCurrentIndex,
                }
            );


            if (
                state.playbackList.length > 0
            ) {

                renderQueuePanel();


                activatePanelTab(
                    'playback'
                );
            }

        } catch (error) {

            console.error(
                '[MusicPlayer] Artist Radio failed:',
                error
            );
        }
    }


    async function playMusicQueueTrack(
        index: number
    ): Promise<void> {

        if (
            index < 0 ||
            index >= state.playbackList.length
        ) {

            console.log(
                '[MusicPlayer] Invalid music queue index:',
                index
            );


            return;
        }


        const track =
            state.playbackList[index];


        if (!track) {
            return;
        }


        await selectMusicTrack(
            track,
            {
                queueIndex:
                    index,

                queueAction:
                    'keep',
            }
        );

        if (
            state.playbackListNext &&
            !state.playbackListLoadingMore &&
            (
                state.playbackList.length -
                index
            ) <= 3
        ) {

            void loadMorePlaybackList();
        }
    }


    async function playNextMusicQueueTrack():
        Promise<void> {

        if (
            state.playbackList.length ===
            0
        ) {

            console.log(
                '[MusicPlayer] Music queue is empty.'
            );


            return;
        }


        if (
            state.playbackListCurrentIndex <
            0
        ) {

            console.log(
                '[MusicPlayer] Music queue index is invalid:',
                state.playbackListCurrentIndex
            );


            return;
        }


        /*
         * Historial de Shuffle
         */

        if (
            state.youtubeShuffle &&

            state.youtubeShuffleHistoryPosition <
                state.youtubeShuffleHistory.length - 1
        ) {

            state.youtubeShuffleHistoryPosition +=
                1;


            const historyIndex =
                state.youtubeShuffleHistory[
                    state.youtubeShuffleHistoryPosition
                ];


            if (
                historyIndex ===
                undefined
            ) {

                return;
            }


            await playMusicQueueTrack(
                historyIndex
            );


            return;
        }


        let nextIndex:
            number | null =
            null;


        if (
            state.youtubeShuffle
        ) {

            nextIndex =
                getNextShuffleIndex(
                    state.playbackList,
                    state.playbackListCurrentIndex
                );


            if (
                nextIndex ===
                null
            ) {

                console.log(
                    '[MusicPlayer] Shuffle could not select another track.'
                );


                return;
            }


            state.youtubeShuffleHistory =
                state.youtubeShuffleHistory.slice(
                    0,
                    state.youtubeShuffleHistoryPosition + 1
                );


            state.youtubeShuffleHistory.push(
                nextIndex
            );


            state.youtubeShuffleHistoryPosition =
                state.youtubeShuffleHistory.length - 1;


        } else {

        let sequentialIndex =
            state.playbackListCurrentIndex +
            1;


        /*
        * Si llegamos al final de la página
        * pero existe otra página disponible,
        * la cargamos ahora.
        *
        * Este es el único caso donde Next
        * puede tener que esperar una petición.
        */
        if (
            sequentialIndex >=
            state.playbackList.length &&
            state.playbackListNext
        ) {

            const previousLength =
                state.playbackList.length;


            await loadMorePlaybackList();


            if (
                state.playbackList.length <=
                previousLength
            ) {

                console.log(
                    '[MusicPlayer] Playback list reached the end.'
                );

                return;
            }


            sequentialIndex =
                state.playbackListCurrentIndex +
                1;
        }


        if (
            sequentialIndex >=
            state.playbackList.length
        ) {

            console.log(
                '[MusicPlayer] Playback list reached the end.'
            );

            return;
        }


        /*
        * Si quedan aproximadamente tres
        * canciones, precargamos la siguiente
        * página sin bloquear la reproducción.
        */
        if (
            state.playbackListNext &&
            !state.playbackListLoadingMore &&
            (
                state.playbackList.length -
                state.playbackListCurrentIndex
            ) <= 3
        ) {

            void loadMorePlaybackList();
        }


        nextIndex =
            sequentialIndex;
        }


        if (
            nextIndex ===
            null
        ) {

            return;
        }


        await playMusicQueueTrack(
            nextIndex
        );
    }


    async function playPreviousMusicQueueTrack():
        Promise<void> {

        if (
            state.playbackList.length ===
            0
        ) {

            console.log(
                '[MusicPlayer] Music queue is empty.'
            );


            return;
        }


        if (
            state.playbackListCurrentIndex <
            0
        ) {

            return;
        }


        const currentTime =
            youtubePlayer.getCurrentTime();


        /*
         * Más de 3 segundos:
         * reiniciar pista.
         */

        if (
            currentTime > 3
        ) {

            youtubePlayer.seekTo(
                0
            );


            youtubePlayer.play();


            return;
        }


        /*
         * Previous con Shuffle
         */

        if (
            state.youtubeShuffle &&

            state.youtubeShuffleHistoryPosition >
                0
        ) {

            state.youtubeShuffleHistoryPosition -=
                1;


            const previousIndex =
                state.youtubeShuffleHistory[
                    state.youtubeShuffleHistoryPosition
                ];


            if (
                previousIndex ===
                undefined
            ) {

                return;
            }


            await playMusicQueueTrack(
                previousIndex
            );


            return;
        }


        /*
         * Shuffle activo sin historial
         */

        if (
            state.youtubeShuffle
        ) {

            youtubePlayer.seekTo(
                0
            );


            youtubePlayer.play();


            return;
        }


        /*
         * Navegación secuencial
         */

        const previousIndex =
            state.playbackListCurrentIndex -
            1;


        if (
            previousIndex <
            0
        ) {

            youtubePlayer.seekTo(
                0
            );


            youtubePlayer.play();


            return;
        }


        await playMusicQueueTrack(
            previousIndex
        );
    }


    return {
        selectMusicTrack,
        playMusicQueueTrack,
        playNextMusicQueueTrack,
        playPreviousMusicQueueTrack,
        loadMorePlaybackList,
    };
}
