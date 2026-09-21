import { audioPlayer } from '../../lib/audio/audio-player';
import { audioStations } from '../../lib/audio/audio-stations';
import { YouTubePlayer } from '../../lib/youtube/youtube-player';
import {
    getArtistRadio,
    getChart,
    getGenres,
    resolveTrack,
    searchTracks,
} from '../../lib/music/music-service';

import type {
    MusicAlbum,
    MusicChart,
    MusicGenre,
    MusicRadioTrack,
    MusicTrack,
} from '../../lib/music/music-types';

function initializeMusicPlayer(): void {

    const player =
        document.querySelector(
            '.music-player'
        );

    if (!player) {
        return;
    }

    if (
        player.dataset.initialized === 'true'
    ) {
        return;
    }

    player.dataset.initialized = 'true';

    let isInitialInfoLoading =
    player.classList.contains(
        'is-info-loading'
    );

    let isInitialArtworkLoading =
        player.classList.contains(
            'is-artwork-loading'
        );

    let initialArtworkStarted = false;

    const youtubePlayerContainer =
    player.querySelector(
        '.music-player-youtube-player'
    );

    const audio =
        player.querySelector(
            '.music-player-audio'
        );

    const playButton =
        player.querySelector(
            '.music-player-play'
        );

    const previousButton =
    player.querySelector(
        '.music-player-previous'
    );

    const nextButton =
        player.querySelector(
            '.music-player-next'
        );

    const repeatButton =
        player.querySelector(
            '.music-player-repeat'
        );

    const shuffleButton = player.querySelector('.music-player-shuffle');

    const playIcon =
        player.querySelector(
            '.music-player-play-icon'
        );

    const muteButton =
        player.querySelector(
            '.music-player-mute'
        );

    const volumeIcon =
        player.querySelector(
            '.music-player-volume-icon'
        );

    const volumeSlider =
        player.querySelector(
            '.music-player-volume-slider'
        );

    const volumeProgress =
    player.querySelector(
        '.music-player-volume-progress'
    );

    const statusText =
        player.querySelector(
            '.music-player-status-text'
        );

    const stationSelector =
        player.querySelector(
            '.music-player-station-selector'
        );

    const stationName =
        player.querySelector(
            '.music-player-station'
        );

    const stationMenu =
        player.querySelector(
            '.music-player-station-menu'
        );

const stationPanel =
    player.querySelector(
        '[data-panel="home"]'
    );

const youtubePanel =
    player.querySelector(
        '[data-panel="results"]'
    );

const queuePanel =
    player.querySelector(
        '[data-panel="queue"]'
    );

const queueList =
    player.querySelector(
        '.music-player-queue-list'
    );

const panelTabs =
    Array.from(
        player.querySelectorAll<HTMLButtonElement>(
            '[data-panel-tab]'
        )
    );

const panelViews =
    Array.from(
        player.querySelectorAll<HTMLElement>(
            '[data-panel-view]'
        )
    );

const homeNavItems =
    Array.from(
        player.querySelectorAll<HTMLButtonElement>(
            '[data-home-section-button]'
        )
    );

const homeSections =
    Array.from(
        player.querySelectorAll<HTMLElement>(
            '[data-home-section]'
        )
    );

    const youtubeButton =
        player.querySelector(
            '.music-player-youtube-button'
        );

    const youtubeSearchForm =
        player.querySelector(
            '.music-player-youtube-search'
        );

    const youtubeSearchInput =
        player.querySelector(
            '.music-player-youtube-search-input'
        );

    const youtubeResults =
        player.querySelector(
            '.music-player-youtube-results'
        );

    const artworkImage =
        player.querySelector(
            '.music-player-track-artwork-image'
        );

    const trackArtist =
        player.querySelector(
            '.music-player-track-artist'
        );

    const trackTitleWrapper =
        player.querySelector(
            '.music-player-track-title-wrapper'
        );

    const trackArtistWrapper =
        player.querySelector(
            '.music-player-track-artist-wrapper'
        );

    const trackTitle =
        player.querySelector(
            '.music-player-track-title'
        );
        
    const progressSeek =
    player.querySelector(
        '.music-player-seek'
    );

    const progressSeekProgress =
    player.querySelector(
        '.music-player-seek-progress'
    );

    const progressCurrent =
        player.querySelector(
            '.music-player-time-current'
        );

    const progressTotal =
        player.querySelector(
            '.music-player-time-total'
        );
        
    const videoToggle =
    player.querySelector(
        '.music-player-video-toggle'
    );

    const videoPanel =
        player.querySelector(
            '.music-player-video-panel'
        );

    if (
        !(trackArtist instanceof HTMLElement) ||
        !(trackTitleWrapper instanceof HTMLElement) ||
        !(trackArtistWrapper instanceof HTMLElement) ||
        !(trackTitle instanceof HTMLElement) ||
        !(stationPanel instanceof HTMLElement) ||
        !(youtubePanel instanceof HTMLElement) ||
        !(youtubeButton instanceof HTMLButtonElement) ||
        !(youtubeSearchForm instanceof HTMLFormElement) ||
        !(youtubeSearchInput instanceof HTMLInputElement) ||
        !(youtubeResults instanceof HTMLElement) ||
        !(youtubePlayerContainer instanceof HTMLElement) ||
        !(previousButton instanceof HTMLButtonElement) ||
        !(nextButton instanceof HTMLButtonElement) ||
        !(repeatButton instanceof HTMLButtonElement) ||
        !(shuffleButton instanceof HTMLButtonElement) ||
        !(progressSeek instanceof HTMLInputElement) ||
        !(progressCurrent instanceof HTMLElement) ||
        !(progressTotal instanceof HTMLElement) ||
        !(progressSeekProgress instanceof HTMLElement) ||
        !(volumeProgress instanceof HTMLElement) ||
        !(videoToggle instanceof HTMLButtonElement) ||
        !(videoPanel instanceof HTMLElement) ||
        !(queuePanel instanceof HTMLElement) ||
        !(queueList instanceof HTMLElement)
    ) {
        console.error(
            '[MusicPlayer] Required elements not found.'
        );
        return;
    }

    audioPlayer.initialize(
        audio
    );

    const youtubePlayer =
    new YouTubePlayer();

    youtubePlayer
    .initialize(
        youtubePlayerContainer
    )
    .then(
        () => {

            console.log(
                '[MusicPlayer] YouTube player ready.'
            );

        }
    )
    .catch(
        error => {

            console.error(
                '[MusicPlayer] Unable to initialize YouTube player:',
                error
            );

        }
    );


    /* --------------------------------------------------
       ESTACIONES
    -------------------------------------------------- */

    let currentStationId =
        audioStations[0]?.id ?? null;


    function closeStationMenu(): void {

        stationMenu.classList.remove(
            'is-open'
        );

        stationSelector.setAttribute(
            'aria-expanded',
            'false'
        );
    }


    function openStationMenu(): void {

        stationMenu.classList.add(
            'is-open'
        );

        stationSelector.setAttribute(
            'aria-expanded',
            'true'
        );
    }


    function toggleStationMenu(): void {

        const isOpen =
            stationMenu.classList.contains(
                'is-open'
            );

        if (isOpen) {
            closeStationMenu();
        } else {
            openStationMenu();
        }
    }


function updateStationMenu(): void {

    const stationOptions =
        stationPanel.querySelector(
            '.music-player-station-options'
        );

    if (
        !(stationOptions instanceof HTMLElement)
    ) {
        return;
    }


    stationOptions.innerHTML = '';


    audioStations.forEach(
        (
            station,
            index
        ) => {

            const option =
                document.createElement(
                    'button'
                );

            option.type =
                'button';

            option.className =
                'music-player-station-option';

            option.setAttribute(
                'role',
                'option'
            );

            option.dataset.stationId =
                station.id;


            const isActive =
                station.id ===
                currentStationId;


            option.setAttribute(
                'aria-selected',
                String(isActive)
            );


            if (isActive) {

                option.classList.add(
                    'is-active'
                );
            }


            const number =
                document.createElement(
                    'span'
                );

            number.className =
                'music-player-station-index';

            number.textContent =
                String(
                    index + 1
                );


            const artwork =
                document.createElement(
                    'img'
                );

            artwork.className =
                'music-player-station-artwork';

            if (
                station.artwork
            ) {

                artwork.src =
                    station.artwork;

                artwork.alt =
                    `${station.name} - portada`;

            } else {

                artwork.alt = '';
            }


            const name =
                document.createElement(
                    'span'
                );

            name.className =
                'music-player-station-name';

            name.textContent =
                station.name;


            option.appendChild(
                number
            );

            option.appendChild(
                artwork
            );

            option.appendChild(
                name
            );


            option.addEventListener(
                'click',
                () => {

                    selectStation(
                        station.id
                    );

                }
            );


            stationOptions.appendChild(
                option
            );
        }
    );
}


function selectStation(
    stationId: string
): void {

    const station =
        audioStations.find(
            item =>
                item.id === stationId
        );

    if (!station) {
        return;
    }

    activePlaybackSource =
        'radio';

    stopYouTubeProgress();

    youtubeIsSeeking =
        false;

    youtubeSeekTargetTime =
        null;

    youtubePlayer.pause();

    currentStationId =
        station.id;

    stationName.textContent =
        station.name;

    /*
     * Actualizamos inmediatamente
     * la información visual de la radio.
     *
     * No esperamos a que el stream
     * termine de cargar.
     */
    audioPlayer.setSource(
        station
    );

    updateTrackInfo();

    updateUI();

    closeStationMenu();

    /*
     * Una radio seleccionada debe
     * comenzar a reproducirse
     * automáticamente.
     */
    audioPlayer
        .play()
        .catch(
            error => {
                console.error(
                    '[MusicPlayer] Unable to start radio:',
                    error
                );
            }
        );
}

    stationSelector.addEventListener(
        'click',
        () => {

            toggleStationMenu();
        }
    );


    document.addEventListener(
        'click',
        event => {

            const target =
                event.target;

            if (
                target instanceof Node &&
                !player.contains(target)
            ) {
                closeStationMenu();
            }
        }
    );


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key ===
                'Escape'
            ) {
                closeStationMenu();
            }
        }
    );


        /* --------------------------------------------------
       YOUTUBE SEARCH
    -------------------------------------------------- */
    let activePlaybackSource:
        'radio' | 'youtube' =
        'radio';
    
    /*
    * --------------------------------------------------
    * MUSIC QUEUE
    * --------------------------------------------------
    *
    * Cola principal basada en MusicTrack.
    *
    * Contiene únicamente metadata musical.
    * El YouTube ID se resuelve cuando una pista
    * necesita reproducirse.
    */

    let musicQueue:
        MusicTrack[] = [];

    let musicQueueCurrentIndex =
        -1;

    let currentMusicTrack:
        MusicTrack | null = null;

    let youtubeTracks:
        MusicTrack[] = [];

    let youtubeSelectedTrackId:
        number | null = null;

    let youtubeRepeat = false;
    let youtubeShuffle = false;

    let currentYouTubeVideoId:
        string | null = null;

    /*
    * --------------------------------------------------
    * MUSIC RESOLVE CACHE
    * --------------------------------------------------
    *
    * Guarda tanto:
    *
    * 1. Resoluciones que ya terminaron.
    * 2. Resoluciones que todavía están en curso.
    *
    * Así, si el usuario hace clic varias veces
    * sobre la misma canción, reutilizamos la misma
    * Promise y no generamos requests duplicados.
    */
    const resolveCache =
        new Map<number, Promise<string | null>>();

    const resolvedYouTubeIds =
        new Map<number, string>();

        /*
    * --------------------------------------------------
    * ARTIST RADIO CACHE
    * --------------------------------------------------
    *
    * Igual que con resolve:
    *
    * - Si ya existe el resultado, lo reutilizamos.
    * - Si existe una petición en curso, reutilizamos
    *   la misma Promise.
    * - Artistas diferentes pueden resolverse en paralelo.
    */
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

    /*
    * Identifica cuál fue la última selección
    * realizada por el usuario.
    *
    * Una respuesta antigua puede terminar después
    * de una selección nueva, pero no debe tomar
    * control de la reproducción.
    */
    let playbackRequestId = 0;

    /*
    * Identifica la generación actual de la queue.
    *
    * Una respuesta antigua de Artist Radio no debe
    * reemplazar una queue generada por una selección
    * posterior.
    */
    let queueRequestId = 0;

    let youtubeShuffleHistory: number[] = [];

    let youtubeShuffleHistoryPosition = -1;

    let youtubeProgressInterval:
    ReturnType<typeof setInterval> | null =
    null;

    let youtubeIsSeeking = false;

    let youtubeSeekTargetTime:
    number | null = null;

    let currentTrackInfoKey = '';

async function resolveYouTubeTrack(
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
                deezerId: track.id,
                youtubeId: cachedVideoId,
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
            deezerId: track.id,
            artist: artistName,
            title: trackName,
        }
    );

    const request =
        (async (): Promise<string | null> => {

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
                        deezerId: track.id,
                        youtubeId: videoId,
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

        /*
         * La Promise ya terminó.
         *
         * El resultado exitoso permanece en
         * resolvedYouTubeIds.
         *
         * Si falló, eliminamos la Promise para
         * permitir un nuevo intento posteriormente.
         */
        resolveCache.delete(
            track.id
        );

    }
}

async function getArtistRadioTracks(
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

        /*
         * La Promise solo se mantiene mientras
         * la petición está en curso.
         *
         * El resultado exitoso queda en
         * artistRadioResults.
         */
        artistRadioCache.delete(
            artistId
        );

    }
}

function buildMusicQueue(
    selectedTrack: MusicTrack,
    radioTracks: MusicRadioTrack[]
): MusicTrack[] {

    /*
     * Primero eliminamos duplicados de Artist Radio
     * usando el Deezer ID como identidad única.
     */
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

    /*
     * ¿Artist Radio ya contiene la canción
     * que el usuario seleccionó?
     */
    const selectedTrackIndex =
        uniqueRadioTracks.findIndex(
            track =>
                track.id ===
                selectedTrack.id
        );

    /*
     * CASO 1:
     *
     * La canción ya existe.
     *
     * Conservamos el orden generado por
     * Artist Radio.
     */
    if (
        selectedTrackIndex >= 0
    ) {

        return uniqueRadioTracks;
    }

    /*
     * CASO 2:
     *
     * Artist Radio no la incluyó.
     *
     * La ponemos al principio para que
     * sea siempre el track actual de la cola.
     */
    return [
        selectedTrack,
        ...uniqueRadioTracks,
    ];
}

function formatTime(
    seconds: number
): string {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {
        return '0:00';
    }

    const totalSeconds =
        Math.floor(seconds);

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const remainingSeconds =
        totalSeconds % 60;

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
}

function updateYouTubeProgress(): void {

    if (
        youtubeIsSeeking ||
        youtubeSeekTargetTime !== null
    ) {
        return;
    }
    const currentTime =
        youtubePlayer.getCurrentTime();

    const duration =
        youtubePlayer.getDuration();

    if (
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0
    ) {
        progressCurrent.textContent =
            '0:00';

        progressTotal.textContent =
            '0:00';

        progressSeek.value =
            '0';

        return;
    }

    progressCurrent.textContent =
        formatTime(currentTime);

    progressTotal.textContent =
        formatTime(duration);

    progressSeek.value =
        String(
            (currentTime / duration) * 100
        );

    progressSeek.style.setProperty(
    '--music-player-seek-progress',
    `${(currentTime / duration) * 100}%`
    );

    progressSeekProgress.style.width =
    `${(currentTime / duration) * 100}%`;
}

function startYouTubeProgress(): void {

    if (
        youtubeProgressInterval !== null
    ) {
        return;
    }

    updateYouTubeProgress();

    youtubeProgressInterval =
        setInterval(
            () => {
                updateYouTubeProgress();
            },
            250
        );
}

function stopYouTubeProgress(): void {

    if (
        youtubeProgressInterval === null
    ) {
        return;
    }

    clearInterval(
        youtubeProgressInterval
    );

    youtubeProgressInterval =
        null;
}

async function playMusicQueueTrack(
    index: number
): Promise<void> {

    if (
        index < 0 ||
        index >= musicQueue.length
    ) {

        console.log(
            '[MusicPlayer] Invalid music queue index:',
            index
        );

        return;
    }

    const track =
        musicQueue[index];

    if (!track) {
        return;
    }

    /*
     * Esta selección pasa a ser inmediatamente
     * la pista actual.
     */
    musicQueueCurrentIndex =
        index;

    currentMusicTrack =
        track;

    renderQueuePanel();

    scrollQueueTrackIntoView(
        index
    );

    activePlaybackSource =
        'youtube';

    updateTrackInfo();

    updateUI();

    /*
     * Cada reproducción obtiene un request ID.
     *
     * Si el usuario hace clic rápidamente
     * en otra canción, este resolve ya no
     * podrá tomar control del player.
     */
    const currentRequestId =
        ++playbackRequestId;

    console.log(
        '[MusicPlayer] Resolving music queue track:',
        {
            index,
            deezerId:
                track.id,
            title:
                track.title,
            artist:
                track.artist.name,
        }
    );

    const videoId =
        await resolveYouTubeTrack(
            track
        );

    if (
        currentRequestId !==
        playbackRequestId
    ) {

        console.log(
            '[MusicPlayer] Ignoring outdated queue playback:',
            track.id
        );

        return;
    }

    if (!videoId) {

        console.log(
            '[MusicPlayer] Unable to resolve queue track:',
            track.id
        );

        updateUI();

        return;
    }

    currentYouTubeVideoId =
        videoId;

    audioPlayer.pause();

    activePlaybackSource =
        'youtube';

    youtubePlayer.load(
        videoId
    );

    youtubePlayer.play();

    updateUI();

    console.log(
        '[MusicPlayer] Music queue playback started:',
        {
            index,
            deezerId:
                track.id,
            youtubeId:
                videoId,
        }
    );
}


function getNextShuffleIndex():
    number | null {

    if (
        musicQueue.length <= 1
    ) {

        return null;
    }

    const availableIndexes =
        musicQueue
            .map(
                (_, index) =>
                    index
            )
            .filter(
                index =>
                    index !==
                    musicQueueCurrentIndex
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


async function playNextMusicQueueTrack():
    Promise<void> {

    if (
        musicQueue.length === 0
    ) {

        console.log(
            '[MusicPlayer] Music queue is empty.'
        );

        return;
    }

    if (
        musicQueueCurrentIndex < 0
    ) {

        console.log(
            '[MusicPlayer] Music queue index is invalid:',
            musicQueueCurrentIndex
        );

        return;
    }

    /*
     * Si estamos navegando hacia adelante
     * dentro del historial de Shuffle,
     * recuperamos ese recorrido primero.
     */
    if (
        youtubeShuffle &&
        youtubeShuffleHistoryPosition <
            youtubeShuffleHistory.length - 1
    ) {

        youtubeShuffleHistoryPosition +=
            1;

        const historyIndex =
            youtubeShuffleHistory[
                youtubeShuffleHistoryPosition
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
        number | null = null;

    if (
        youtubeShuffle
    ) {

        nextIndex =
            getNextShuffleIndex();

        if (
            nextIndex === null
        ) {

            console.log(
                '[MusicPlayer] Shuffle could not select another track.'
            );

            return;
        }

        youtubeShuffleHistory =
            youtubeShuffleHistory.slice(
                0,
                youtubeShuffleHistoryPosition + 1
            );

        youtubeShuffleHistory.push(
            nextIndex
        );

        youtubeShuffleHistoryPosition =
            youtubeShuffleHistory.length - 1;

    } else {

        const sequentialIndex =
            musicQueueCurrentIndex + 1;

        if (
            sequentialIndex >=
            musicQueue.length
        ) {

            console.log(
                '[MusicPlayer] Music queue reached the end.'
            );

            return;
        }

        nextIndex =
            sequentialIndex;
    }

    if (
        nextIndex === null
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
        musicQueue.length === 0
    ) {

        console.log(
            '[MusicPlayer] Music queue is empty.'
        );

        return;
    }

    if (
        musicQueueCurrentIndex < 0
    ) {

        return;
    }

    const currentTime =
        youtubePlayer.getCurrentTime();

    /*
     * Como antes:
     * si llevamos más de 3 segundos,
     * Previous reinicia la canción actual.
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
     * Previous con Shuffle:
     * navegamos por el historial real.
     */
    if (
        youtubeShuffle &&
        youtubeShuffleHistoryPosition > 0
    ) {

        youtubeShuffleHistoryPosition -=
            1;

        const previousIndex =
            youtubeShuffleHistory[
                youtubeShuffleHistoryPosition
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
     * Shuffle activo pero no hay historial
     * anterior.
     */
    if (
        youtubeShuffle
    ) {

        youtubePlayer.seekTo(
            0
        );

        youtubePlayer.play();

        return;
    }

    /*
     * Navegación secuencial.
     */
    const previousIndex =
        musicQueueCurrentIndex - 1;

    if (
        previousIndex < 0
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

type MusicPanelTab =
    | 'home'
    | 'results'
    | 'queue';


type HomeSection =
    | 'trending'
    | 'discover'
    | 'playlist'
    | 'genres'
    | 'stations';

type HomeLoadState =
    | 'idle'
    | 'loading'
    | 'loaded'
    | 'error';


const homeLoadState: Record<
    HomeSection,
    HomeLoadState
> = {
    trending: 'idle',
    discover: 'idle',
    playlist: 'idle',
    genres: 'idle',
    stations: 'idle',
};


function activatePanelTab(
    tab: MusicPanelTab
): void {

    panelTabs.forEach(
        button => {

            const isActive =
                button.dataset.panelTab ===
                tab;

            button.classList.toggle(
                'is-active',
                isActive
            );

            button.setAttribute(
                'aria-selected',
                String(isActive)
            );
        }
    );


    panelViews.forEach(
        view => {

            const isActive =
                view.dataset.panelView ===
                tab;

            view.classList.toggle(
                'is-active',
                isActive
            );
        }
    );
}


function activateHomeSection(
    section: HomeSection
): void {

    homeNavItems.forEach(
        button => {

            const isActive =
                button.dataset
                    .homeSectionButton ===
                section;

            button.classList.toggle(
                'is-active',
                isActive
            );

            if (isActive) {

                button.setAttribute(
                    'aria-current',
                    'page'
                );

            } else {

                button.removeAttribute(
                    'aria-current'
                );
            }
        }
    );


    homeSections.forEach(
        element => {

            element.classList.toggle(
                'is-active',
                element.dataset
                    .homeSection ===
                section
            );
        }
    );


    /*
     * Cargar únicamente la sección
     * que el usuario está viendo.
     */

    switch (section) {

        case 'trending':
            void loadTrending();
            break;

        case 'discover':
            void loadDiscover();
            break;

        case 'genres':
            void loadGenres();
            break;

        case 'playlist':
            break;

        case 'stations':
            break;
    }
}

function getHomeSectionElement(
    section: HomeSection
): HTMLElement | null {

    const element =
        homeSections.find(
            current =>
                current.dataset
                    .homeSection ===
                section
        );

    return element ?? null;
}

let homeChartCache:
    MusicChart | null = null;

let homeChartPromise:
    Promise<MusicChart> | null = null;


async function getHomeChartData():
    Promise<MusicChart> {

    if (homeChartCache) {

        return homeChartCache;
    }

    if (homeChartPromise) {

        return homeChartPromise;
    }

    homeChartPromise =
        (async (): Promise<MusicChart> => {

            const response =
                await getChart();

            if (
                response.status !==
                'success'
            ) {

                throw new Error(
                    'Music Chart request failed.'
                );
            }

            homeChartCache =
                response;

            return response;

        })();

    try {

        return await homeChartPromise;

    } finally {

        homeChartPromise =
            null;
    }
}

function renderHomeError(
    section: HomeSection,
    message: string
): void {

    const element =
        getHomeSectionElement(
            section
        );

    if (
        !element
    ) {
        return;
    }


    const list =
        element.querySelector(
            '.music-player-trending-list'
        );


    if (
        list instanceof HTMLElement
    ) {

        list.innerHTML = `
            <div class="music-player-youtube-error">
                ${message}
            </div>
        `;

        return;
    }


    element.innerHTML = `
        <div class="music-player-home-placeholder">
            ${message}
        </div>
    `;
}

async function loadTrending(): Promise<void> {

    if (
        homeLoadState.trending ===
        'loading' ||
        homeLoadState.trending ===
        'loaded'
    ) {
        return;
    }


    const section =
        getHomeSectionElement(
            'trending'
        );


    if (
        !section
    ) {
        return;
    }


    const list =
        section.querySelector(
            '.music-player-trending-list'
        );


    if (
        !(list instanceof HTMLElement)
    ) {
        return;
    }


    homeLoadState.trending =
        'loading';


    try {

        const chart =
            await getHomeChartData();

        const tracks =
            chart.tracks.data;


        renderTrending(
            tracks
        );


        homeLoadState.trending =
            'loaded';

    } catch (error) {

        console.error(
            '[MusicPlayer] Trending failed:',
            error
        );


        homeLoadState.trending =
            'error';


        renderHomeError(
            'trending',
            'NO SE PUDIERON CARGAR LAS TENDENCIAS'
        );
    }
}


function renderTrending(
    tracks: MusicTrack[]
): void {

    const section =
        getHomeSectionElement(
            'trending'
        );


    const list =
        section?.querySelector(
            '.music-player-trending-list'
        );


    if (
        !(list instanceof HTMLElement)
    ) {
        return;
    }


    list.innerHTML = '';


    if (
        tracks.length === 0
    ) {

        list.innerHTML = `
            <div class="music-player-queue-empty">
                NO HAY TENDENCIAS DISPONIBLES
            </div>
        `;

        return;
    }


    tracks.forEach(
        (
            track,
            index
        ) => {

            const item =
                document.createElement(
                    'button'
                );

            item.type =
                'button';

            item.className =
                'music-player-trending-item';

            item.dataset.trackId =
                String(
                    track.id
                );


            /*
             * #
             */

            const number =
                document.createElement(
                    'span'
                );

            number.className =
                'music-player-list-column-index';

            number.textContent =
                String(
                    index + 1
                );


            /*
             * COVER
             */

            const thumbnail =
                document.createElement(
                    'img'
                );

            thumbnail.className =
                'music-player-trending-thumbnail';

            thumbnail.src =
                track.album.cover;

            thumbnail.alt =
                `${track.title} - portada`;


            /*
             * TÍTULO / ARTISTA
             */

            const info =
                document.createElement(
                    'span'
                );

            info.className =
                'music-player-trending-info';


            const title =
                document.createElement(
                    'span'
                );

            title.className =
                'music-player-trending-title';

            title.textContent =
                track.title;


            const artist =
                document.createElement(
                    'span'
                );

            artist.className =
                'music-player-trending-artist';

            artist.textContent =
                track.artist.name ||
                'ARTISTA DESCONOCIDO';


            info.appendChild(
                title
            );

            info.appendChild(
                artist
            );


            /*
             * DURACIÓN
             */

            const duration =
                document.createElement(
                    'span'
                );

            duration.className =
                'music-player-list-column-duration';

            duration.textContent =
                formatTime(
                    track.duration
                );


            /*
             * FILA
             */

            item.appendChild(
                number
            );

            item.appendChild(
                thumbnail
            );

            item.appendChild(
                info
            );

            item.appendChild(
                duration
            );


            /*
             * Por ahora el click se conecta
             * en el siguiente paso al mismo
             * flujo de resolución de búsqueda.
             */

            list.appendChild(
                item
            );
        }
    );
}

async function loadDiscover(): Promise<void> {

    if (
        homeLoadState.discover ===
        'loading' ||
        homeLoadState.discover ===
        'loaded'
    ) {
        return;
    }


    const section =
        getHomeSectionElement(
            'discover'
        );


    if (
        !section
    ) {
        return;
    }


    homeLoadState.discover =
        'loading';


    section.innerHTML = `
        <div class="music-player-home-loading">
            CARGANDO NUEVOS LANZAMIENTOS...
        </div>
    `;


    try {

        const chart =
            await getHomeChartData();

        const albums =
            chart.albums.data;


        renderDiscover(
            section,
            albums
        );


        homeLoadState.discover =
            'loaded';

    } catch (error) {

        console.error(
            '[MusicPlayer] Discover failed:',
            error
        );


        homeLoadState.discover =
            'error';


        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO SE PUDIERON CARGAR LOS LANZAMIENTOS
            </div>
        `;
    }
}

function formatReleaseDate(
    date: string
): string {

    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return '';
    }


    return parsed.toLocaleDateString(
        'es-PE',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    );
}


function getAlbumArtistsText(
    album: MusicAlbum
): string {

    return (
        album.artist?.name ||
        'ARTISTA DESCONOCIDO'
    );
}


function renderDiscover(
    section: HTMLElement,
    albums: MusicAlbum[]
): void {
    if (
        albums.length === 0
    ) {

        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO HAY NUEVOS LANZAMIENTOS
            </div>
        `;

        return;
    }


    section.innerHTML = `
        <div class="music-player-discover-grid"></div>
    `;


    const grid =
        section.querySelector(
            '.music-player-discover-grid'
        );


    if (
        !(grid instanceof HTMLElement)
    ) {
        return;
    }


    albums.forEach(
        album => {

            const card =
                document.createElement(
                    'article'
                );

            card.className =
                'music-player-discover-card';


            const image =
                document.createElement(
                    'img'
                );

            image.src =
                album.cover;

            image.alt =
                `${album.title} - portada`;


            const title =
                document.createElement(
                    'div'
                );

            title.className =
                'music-player-discover-title';

            title.textContent =
                album.title;


            const artist =
                document.createElement(
                    'div'
                );

            artist.className =
                'music-player-discover-artist';

            artist.textContent =
                getAlbumArtistsText(
                    album
                );


            const date =
                document.createElement(
                    'div'
                );

            date.className =
                'music-player-discover-date';

            date.textContent =
                formatReleaseDate(
                    album.release_date
                );


            card.appendChild(
                image
            );

            card.appendChild(
                title
            );

            card.appendChild(
                artist
            );

            card.appendChild(
                date
            );


            grid.appendChild(
                card
            );
        }
    );
}

async function loadGenres(): Promise<void> {

    if (
        homeLoadState.genres ===
        'loading' ||
        homeLoadState.genres ===
        'loaded'
    ) {
        return;
    }


    const section =
        getHomeSectionElement(
            'genres'
        );


    if (
        !section
    ) {
        return;
    }


    homeLoadState.genres =
        'loading';


    section.innerHTML = `
        <div class="music-player-home-loading">
            CARGANDO GÉNEROS...
        </div>
    `;


    try {

        const response =
            await getGenres();

        if (
            response.status !==
            'success'
        ) {

            throw new Error(
                'Genres request failed.'
            );
        }

        const genres =
            response.data;


        renderGenres(
            section,
            genres
        );


        homeLoadState.genres =
            'loaded';

    } catch (error) {

        console.error(
            '[MusicPlayer] Genres failed:',
            error
        );


        homeLoadState.genres =
            'error';


        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO SE PUDIERON CARGAR LOS GÉNEROS
            </div>
        `;
    }
}

function renderGenres(
    section: HTMLElement,
    genres: MusicGenre[]
): void {

    if (
        genres.length === 0
    ) {

        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO HAY GÉNEROS DISPONIBLES
            </div>
        `;

        return;
    }


    section.innerHTML = `
        <div class="music-player-genres-grid"></div>
    `;


    const grid =
        section.querySelector(
            '.music-player-genres-grid'
        );


    if (
        !(grid instanceof HTMLElement)
    ) {
        return;
    }


    genres.forEach(
        genre => {

            const card =
                document.createElement(
                    'button'
                );

            card.type =
                'button';

            card.className =
                'music-player-genre-card';


            const image =
                document.createElement(
                    'img'
                );

            image.src =
                genre.picture ??
                '';

            image.alt =
                genre.name;


            const name =
                document.createElement(
                    'span'
                );

            name.className =
                'music-player-genre-name';

            name.textContent =
                genre.name;


            card.appendChild(
                image
            );

            card.appendChild(
                name
            );


            grid.appendChild(
                card
            );
        }
    );
}

function renderQueuePanel(): void {

    queueList.innerHTML = '';

    if (
        musicQueue.length === 0
    ) {

        queueList.innerHTML = `
            <div class="music-player-queue-empty">
                LA COLA SE GENERARÁ AL REPRODUCIR UNA CANCIÓN
            </div>
        `;

        return;
    }

    musicQueue.forEach(
        (track, index) => {

            const item =
                document.createElement(
                    'button'
                );

            item.type =
                'button';

            item.className =
                'music-player-queue-item';

            item.dataset.queueIndex =
                String(index);

            if (
                index ===
                musicQueueCurrentIndex
            ) {

                item.classList.add(
                    'is-current'
                );
            }

            /*
             * --------------------------------------------
             * COLUMNA #
             * --------------------------------------------
             */

            const number =
                document.createElement(
                    'span'
                );

            number.className =
                'music-player-queue-index';

            number.textContent =
                index ===
                musicQueueCurrentIndex
                    ? '▶'
                    : String(
                        index + 1
                    );

            /*
             * --------------------------------------------
             * COLUMNA COVER
             * --------------------------------------------
             */

            const thumbnail =
                document.createElement(
                    'img'
                );

            thumbnail.className =
                'music-player-queue-thumbnail';

            thumbnail.src =
                track.album.cover;

            thumbnail.alt =
                `${track.title} - portada`;

            /*
             * --------------------------------------------
             * COLUMNA TÍTULO / ARTISTA
             * --------------------------------------------
             */

            const info =
                document.createElement(
                    'span'
                );

            info.className =
                'music-player-queue-info';

            const title =
                document.createElement(
                    'span'
                );

            title.className =
                'music-player-queue-track-title';

            title.textContent =
                track.title;

            const artist =
                document.createElement(
                    'span'
                );

            artist.className =
                'music-player-queue-track-artist';

            artist.textContent =
                track.artist.name ||
                'ARTISTA DESCONOCIDO';

            info.appendChild(
                title
            );

            info.appendChild(
                artist
            );

            /*
             * --------------------------------------------
             * COLUMNA DURACIÓN
             * --------------------------------------------
             */

            const duration =
                document.createElement(
                    'span'
                );

            duration.className =
                'music-player-list-column-duration';

            duration.textContent =
                formatTime(
                    track.duration
                );

            /*
             * --------------------------------------------
             * FILA
             * --------------------------------------------
             */

            item.appendChild(
                number
            );

            item.appendChild(
                thumbnail
            );

            item.appendChild(
                info
            );

            item.appendChild(
                duration
            );

            item.addEventListener(
                'click',
                () => {

                    playMusicQueueTrack(
                        index
                    );
                }
            );

            queueList.appendChild(
                item
            );
        }
    );
}
function scrollQueueTrackIntoView(
    index: number
): void {

    requestAnimationFrame(
        () => {

            const item =
                queueList.querySelector<HTMLElement>(
                    `[data-queue-index="${index}"]`
                );

            if (!item) {
                return;
            }

            item.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    );
}

function showYouTubePanel(): void {

    activatePanelTab(
        'results'
    );

    youtubeSearchInput.focus();
}

panelTabs.forEach(
    button => {

        button.addEventListener(
            'click',
            () => {

                const tab =
                    button.dataset
                        .panelTab;

                if (
                    tab === 'home' ||
                    tab === 'results' ||
                    tab === 'queue'
                ) {

                    activatePanelTab(
                        tab
                    );
                }
            }
        );
    }
);


homeNavItems.forEach(
    button => {

        button.addEventListener(
            'click',
            () => {

                const section =
                    button.dataset
                        .homeSectionButton;

                    if (
                        section === 'trending' ||
                        section === 'discover' ||
                        section === 'playlist' ||
                        section === 'genres' ||
                        section === 'stations'
                    ) {

                    activatePanelTab(
                        'home'
                    );

                    activateHomeSection(
                        section
                    );
                }
            }
        );
    }
);

    function clearYouTubeResults(): void {

        youtubeResults.innerHTML = '';

    }


    function updateSelectedYouTubeResult(): void {

    const resultItems =
        youtubeResults.querySelectorAll(
            '.music-player-youtube-result'
        );

    resultItems.forEach(
        item => {

            const trackId =
                Number(
                    (item as HTMLElement)
                        .dataset
                        .trackId
                );

            item.classList.toggle(
                'is-selected',
                trackId ===
                youtubeSelectedTrackId
            );
        }
    );
}

function appendYouTubeResults(
    results: MusicTrack[]
): void {

    results.forEach(
        result => {

            const item =
                document.createElement(
                    'button'
                );

            item.type =
                'button';

            item.className =
                'music-player-youtube-result';

            item.dataset.trackId =
                String(result.id);


            if (
                result.id ===
                youtubeSelectedTrackId
            ) {

                item.classList.add(
                    'is-selected'
                );
            }


            /*
             * --------------------------------------------------
             * COLUMNA #
             * --------------------------------------------------
             */

            const number =
                document.createElement(
                    'span'
                );

            number.className =
                'music-player-list-column-index';

            number.textContent =
                String(
                    youtubeTracks.indexOf(
                        result
                    ) + 1
                );


             /* --------------------------------------------
               COLUMNA COVER
            -------------------------------------------- */

                const thumbnail =
                    document.createElement(
                        'img'
                    );

                thumbnail.className =
                    'music-player-youtube-result-thumbnail';

                thumbnail.src =
                    result.album.cover;

                thumbnail.alt =
                    `${result.title} - portada`;


            /*
             * --------------------------------------------------
             * COLUMNA TÍTULO
             * --------------------------------------------------
             */

            const info =
                document.createElement(
                    'span'
                );

            info.className =
                'music-player-youtube-result-info';


            const title =
                document.createElement(
                    'span'
                );

            title.className =
                'music-player-youtube-result-title';

            title.textContent =
                result.title;


            const artist =
                document.createElement(
                    'span'
                );

            artist.className =
                'music-player-youtube-result-channel';

            artist.textContent =
                result.artist.name ||
                'ARTISTA DESCONOCIDO';

            info.appendChild(
                title
            );

            info.appendChild(
                artist
            );


            /*
             * --------------------------------------------------
             * COLUMNA DURACIÓN
             * --------------------------------------------------
             */

            const duration =
                document.createElement(
                    'span'
                );

            duration.className =
                'music-player-list-column-duration';

            duration.textContent =
                formatTime(
                    result.duration
                );


            item.appendChild(
                number
            );

            item.appendChild(
                thumbnail
            );

            item.appendChild(
                info
            );

            item.appendChild(
                duration
            );


            /*
             * --------------------------------------------------
             * SELECCIÓN
             * --------------------------------------------------
             */
            item.addEventListener(
                'click',
                async () => {

                    const trackId =
                        item.dataset.trackId;

                    if (!trackId) {
                        return;
                    }

                    youtubeSelectedTrackId =
                        Number(trackId);

                    updateSelectedYouTubeResult();

                    currentMusicTrack =
                        result;

                    activePlaybackSource =
                        'youtube';

                    updateTrackInfo();

                    updateUI();

                    console.log(
                        '[MusicPlayer] Music track selected:',
                        {
                            id:
                                result.id,

                            title:
                                result.title,

                            artist:
                                result.artist.name,

                            artistId:
                                result.artist.id,
                        }
                    );

                    /*
                    * -----------------------------------------------
                    * NUEVA SELECCIÓN
                    * -----------------------------------------------
                    */
                    const currentPlaybackRequestId =
                        ++playbackRequestId;

                    const currentQueueRequestId =
                        ++queueRequestId;

                    /*
                    * -----------------------------------------------
                    * RESOLVE + ARTIST RADIO EN PARALELO
                    * -----------------------------------------------
                    */
                    const resolvePromise =
                        resolveYouTubeTrack(
                            result
                        );

                    const queuePromise =
                        getArtistRadioTracks(
                            result.artist.id
                        );

                    /*
                    * -----------------------------------------------
                    * RESOLVE
                    * -----------------------------------------------
                    */
                    try {

                        const videoId =
                            await resolvePromise;

                        if (
                            currentPlaybackRequestId !==
                            playbackRequestId
                        ) {

                            console.log(
                                '[MusicPlayer] Ignoring outdated playback resolve:',
                                result.id
                            );

                        } else if (videoId) {

                            currentYouTubeVideoId =
                                videoId;

                            audioPlayer.pause();

                            activePlaybackSource =
                                'youtube';

                            youtubePlayer.load(
                                videoId
                            );

                            youtubePlayer.play();

                            console.log(
                                '[MusicPlayer] YouTube playback started:',
                                videoId
                            );

                        } else {

                            console.log(
                                '[MusicPlayer] No YouTube video found:',
                                result.id
                            );
                        }

                    } catch (error) {

                        console.error(
                            '[MusicPlayer] Music resolve failed:',
                            error
                        );
                    }

                    /*
                    * -----------------------------------------------
                    * ARTIST RADIO
                    * -----------------------------------------------
                    */
                    try {

                        const radioTracks =
                            await queuePromise;

                        if (
                            currentQueueRequestId !==
                            queueRequestId
                        ) {

                            console.log(
                                '[MusicPlayer] Ignoring outdated Artist Radio:',
                                result.artist.id
                            );

                            return;
                        }

                        musicQueue =
                            buildMusicQueue(
                                result,
                                radioTracks
                            );

                        musicQueueCurrentIndex =
                            musicQueue.findIndex(
                                track =>
                                    track.id ===
                                    result.id
                            );

                        /*
                        * Una nueva queue representa
                        * una nueva sesión de navegación.
                        */
                        youtubeShuffleHistory = [];

                        youtubeShuffleHistoryPosition =
                            -1;

                        console.log(
                            '[MusicPlayer] New Music Queue ready:',
                            {
                                artistId:
                                    result.artist.id,

                                length:
                                    musicQueue.length,

                                currentIndex:
                                    musicQueueCurrentIndex,
                            }
                        );

                        if (
                            musicQueue.length > 0
                        ) {

                            renderQueuePanel();

                            activatePanelTab(
                                'queue'
                            );
                        }

                    } catch (error) {

                        console.error(
                            '[MusicPlayer] Artist Radio failed:',
                            error
                        );
                    }

                }
            );

            youtubeResults.appendChild(
                item
            );
        }
    );
}

async function searchYouTube(
    query: string
): Promise<void> {

    const normalizedQuery =
        query.trim();

    if (!normalizedQuery) {
        return;
    }

    /*
     * Nueva búsqueda:
     * comenzamos con resultados limpios.
     */
    youtubeTracks =
        [];

    youtubeSelectedTrackId =
        null;

    youtubeResults.innerHTML =
        `
            <div class="music-player-youtube-loading">
                BUSCANDO...
            </div>
        `;

    youtubeSearchInput.disabled =
        true;

    try {

        const response =
            await searchTracks(
                normalizedQuery
            );

        if (
            response.status !==
            'success'
        ) {

            throw new Error(
                `Music search failed: ${response.status}`
            );
        }

        const newTracks:
            MusicTrack[] =
            response.data ?? [];

        /*
         * Elimina BUSCANDO...
         * y deja el contenedor listo
         * para los resultados.
         */
        youtubeResults.innerHTML =
            '';

        youtubeTracks.push(
            ...newTracks
        );

        appendYouTubeResults(
            newTracks
        );

    } catch (error) {

        console.error(
            '[MusicPlayer] Music search failed:',
            error
        );

        youtubeResults.innerHTML =
            `
                <div class="music-player-youtube-error">
                    NO SE PUDO REALIZAR LA BÚSQUEDA
                </div>
            `;

    } finally {

        youtubeSearchInput.disabled =
            false;
    }
}


    youtubeButton.addEventListener(
        'click',
        () => {

            showYouTubePanel();
        }
    );


    youtubeSearchForm.addEventListener(
        'submit',
        event => {

            event.preventDefault();

            const query =
                youtubeSearchInput.value.trim();

            if (!query) {
                return;
            }

            activatePanelTab(
                'results'
            );

            searchYouTube(
                query
            );
        }
    );


const initialStation =
    audioStations[0];

if (initialStation) {

    currentStationId =
        initialStation.id;

    stationName.textContent =
        initialStation.name;

    audioPlayer.setSource(
        initialStation
    );

    updateTrackInfo();

    activatePanelTab(
        'home'
    );

    activateHomeSection(
        'trending'
    );

    renderQueuePanel();

    updateStationMenu();

} else {

    finishInitialInfoLoading();
}


    /* --------------------------------------------------
       INFORMACIÓN DEL TRACK
    -------------------------------------------------- */
function finishInitialInfoLoading(): void {

    if (!isInitialInfoLoading) {
        return;
    }

    isInitialInfoLoading =
        false;

    player.classList.remove(
        'is-info-loading'
    );
}


function finishInitialArtworkLoading(): void {

    if (!isInitialArtworkLoading) {
        return;
    }

    isInitialArtworkLoading =
        false;

    player.classList.remove(
        'is-artwork-loading'
    );

    player.setAttribute(
        'aria-busy',
        'false'
    );

    artworkImage.onload =
        null;

    artworkImage.onerror =
        null;
}


function updateArtwork(
    artworkUrl: string | null,
    altText: string
): void {

    /*
     * --------------------------------------------------
     * PRIMERA CARGA
     * --------------------------------------------------
     */

    if (isInitialArtworkLoading) {

        if (
            !initialArtworkStarted
        ) {

            initialArtworkStarted =
                true;

            artworkImage.style.opacity =
                '0';

            artworkImage.onload =
                () => {

                    artworkImage.style.opacity =
                        '1';

                    finishInitialArtworkLoading();
                };

            artworkImage.onerror =
                () => {

                    artworkImage.removeAttribute(
                        'src'
                    );

                    artworkImage.style.opacity =
                        '0';

                    finishInitialArtworkLoading();
                };
        }

        artworkImage.alt =
            altText;

        if (!artworkUrl) {

            artworkImage.removeAttribute(
                'src'
            );

            finishInitialArtworkLoading();

            return;
        }

        artworkImage.src =
            artworkUrl;

        if (
            artworkImage.complete &&
            artworkImage.naturalWidth > 0
        ) {

            artworkImage.style.opacity =
                '1';

            finishInitialArtworkLoading();
        }

        return;
    }


    /*
     * --------------------------------------------------
     * CAMBIOS POSTERIORES
     *
     * Aquí NO existe skeleton.
     * --------------------------------------------------
     */

    artworkImage.onload =
        null;

    artworkImage.onerror =
        null;

    if (!artworkUrl) {

        artworkImage.removeAttribute(
            'src'
        );

        artworkImage.alt = '';

        artworkImage.style.opacity =
            '0';

        return;
    }

    artworkImage.src =
        artworkUrl;

    artworkImage.alt =
        altText;

    artworkImage.style.opacity =
        '1';
}


function updateTrackInfo(): void {

    const source =
        audioPlayer.getState().source;

    /*
     * --------------------------------------------------
     * YOUTUBE
     * --------------------------------------------------
     */
    if (
        activePlaybackSource ===
        'youtube'
    ) {

        const track =
            currentMusicTrack;

        if (!track) {
            return;
        }

        const infoKey =
            `youtube:${track.id}`;

        /*
         * La canción no cambió.
         *
         * No tocamos el DOM.
         * Esto es especialmente importante para
         * no reiniciar el marquee.
         */
        if (
            infoKey ===
            currentTrackInfoKey
        ) {
            return;
        }

        currentTrackInfoKey =
            infoKey;

        player.classList.add(
            'is-track'
        );

        player.classList.remove(
            'is-radio'
        );

        trackTitle.textContent =
            track.title;

        trackArtist.textContent =
            track.artist.name ||
            'ARTISTA DESCONOCIDO';

        updateArtwork(
            track.album.cover,
            `${track.title} - portada`
        );

        requestAnimationFrame(
            updateTrackMarquee
        );

        return;
    }

    /*
     * --------------------------------------------------
     * SIN FUENTE
     * --------------------------------------------------
     */
    if (!source) {

        if (
            currentTrackInfoKey ===
            'none'
        ) {
            return;
        }

        currentTrackInfoKey =
            'none';

        player.classList.remove(
            'is-radio',
            'is-track'
        );

        artworkImage.removeAttribute(
            'src'
        );

        artworkImage.alt =
            '';

        artworkImage.style.opacity =
            '0';

        trackTitle.textContent =
            '';

        trackArtist.textContent =
            '';

        if (
            isInitialInfoLoading
        ) {
            finishInitialInfoLoading();
        }

        return;
    }

    /*
     * --------------------------------------------------
     * RADIO
     * --------------------------------------------------
     */
    if (
        source.type ===
        'radio'
    ) {

        const infoKey =
            `radio:${currentStationId}`;

        if (
            infoKey ===
            currentTrackInfoKey
        ) {
            return;
        }

        currentTrackInfoKey =
            infoKey;

        player.classList.add(
            'is-radio'
        );

        player.classList.remove(
            'is-track'
        );

        trackTitle.textContent =
            source.name;

        trackArtist.textContent =
            'RADIO';

        updateArtwork(
            source.artwork ?? null,
            `${source.name} - portada`
        );

        if (
            isInitialInfoLoading
        ) {
            finishInitialInfoLoading();
        }

        requestAnimationFrame(
            updateTrackMarquee
        );

        return;
    }

    /*
     * --------------------------------------------------
     * OTRA FUENTE
     * --------------------------------------------------
     */
    const infoKey =
        `${source.type}:${source.name}`;

    if (
        infoKey ===
        currentTrackInfoKey
    ) {
        return;
    }

    currentTrackInfoKey =
        infoKey;

    player.classList.add(
        'is-track'
    );

    player.classList.remove(
        'is-radio'
    );

    trackArtist.textContent =
        source.artist ??
        'ARTISTA DESCONOCIDO';

    trackTitle.textContent =
        source.name;

    updateArtwork(
        source.artwork ?? null,
        `${source.name} - portada`
    );

    requestAnimationFrame(
        updateTrackMarquee
    );
}


function updateTrackMarquee(): void {

    const marqueeElements = [
        {
            element:
                trackTitle,
            wrapper:
                trackTitleWrapper
        },
        {
            element:
                trackArtist,
            wrapper:
                trackArtistWrapper
        }
    ];

    marqueeElements.forEach(
        ({
            element,
            wrapper
        }) => {

            element.classList.remove(
                'is-marquee'
            );

            element.style.removeProperty(
                '--music-player-marquee-overflow'
            );

            element.style.removeProperty(
                '--music-player-marquee-duration'
            );

            const overflow =
                element.scrollWidth -
                wrapper.clientWidth;

            if (
                overflow <= 1
            ) {
                return;
            }

            const distance =
                Math.ceil(
                    overflow
                );

            const duration =
                Math.max(
                    5,
                    Math.min(
                        14,
                        distance / 12
                    )
                );

            element.style.setProperty(
                '--music-player-marquee-overflow',
                `${distance}px`
            );

            element.style.setProperty(
                '--music-player-marquee-duration',
                `${duration}s`
            );

            element.classList.add(
                'is-marquee'
            );
        }
    );
}

    /* --------------------------------------------------
       UI
    -------------------------------------------------- */

    function updateUI(): void {

        const state =
            activePlaybackSource ===
            'youtube'
                ? youtubePlayer.getState()
                : audioPlayer.getState();

        const isYouTube =
            activePlaybackSource ===
            'youtube';

        progressSeek.disabled =
            !isYouTube;

        if (!isYouTube) {

            progressCurrent.textContent =
                '--';

            progressTotal.textContent =
                '--';

            progressSeek.value =
                '100';

            progressSeekProgress.style.width =
                '100%';

        }

            videoToggle.hidden =
                !isYouTube;

            if (!isYouTube) {

                videoPanel.hidden =
                    true;

                videoPanel.setAttribute(
                    'aria-hidden',
                    'true'
                );

                videoToggle.setAttribute(
                    'aria-pressed',
                    'false'
                );

                videoToggle.setAttribute(
                    'aria-label',
                    'Mostrar video de YouTube'
                );
            }


        videoToggle.classList.toggle(
            'is-visible',
            isYouTube
        );

        if (!isYouTube) {

            videoPanel.hidden =
                true;

            videoPanel.setAttribute(
                'aria-hidden',
                'true'
            );

            videoToggle.setAttribute(
                'aria-pressed',
                'false'
            );

            videoToggle.setAttribute(
                'aria-label',
                'Mostrar video de YouTube'
            );
        }

        const hasMusicQueue =
            activePlaybackSource === 'youtube' &&
            musicQueue.length > 0 &&
            musicQueueCurrentIndex >= 0;

        previousButton.disabled =
            !hasMusicQueue;

        nextButton.disabled =
            !hasMusicQueue ||
            musicQueueCurrentIndex >=
                musicQueue.length - 1;

        repeatButton.disabled =
            !hasMusicQueue;

        shuffleButton.disabled =
            !hasMusicQueue ||
            musicQueue.length < 2;

        shuffleButton.setAttribute(
            'aria-pressed',
            String(youtubeShuffle)
        );

        shuffleButton.classList.toggle(
            'is-active',
            youtubeShuffle
        );

        player.classList.toggle(
            'is-playing',
            state.status === 'playing'
        );

        player.classList.toggle(
            'is-loading',
            state.status === 'loading' ||
            state.status === 'buffering'
        );

        player.classList.toggle(
            'has-error',
            state.status === 'error'
        );

        /* PLAY / PAUSE */

        if (
            state.status === 'playing'
        ) {

            playIcon.innerHTML = `
                <path
                    d="M8 6.5H11V17.5H8V6.5Z"
                />
                <path
                    d="M13 6.5H16V17.5H13V6.5Z"
                />
            `;

            playButton.setAttribute(
                'aria-label',
                'Pausar'
            );

            playButton.setAttribute(
                'aria-pressed',
                'true'
            );

        } else {

            playIcon.innerHTML = `
                <path
                    d="M9 6.5L18 12L9 17.5V6.5Z"
                />
            `;

            playButton.setAttribute(
                'aria-label',
                'Reproducir'
            );

            playButton.setAttribute(
                'aria-pressed',
                'false'
            );
        }


        /* MUTE */

        muteButton.setAttribute(
            'aria-pressed',
            String(state.muted)
        );


        /* VOLUMEN */

        if (
            state.muted ||
            state.volume === 0
        ) {

            volumeIcon.innerHTML = `
                <path
                    class="volume-speaker"
                    d="M5 9H8L12 5V19L8 15H5V9Z"
                />

                <path
                    class="volume-cross"
                    d="M15 9L19 15"
                />

                <path
                    class="volume-cross"
                    d="M19 9L15 15"
                />
            `;

        } else if (
            state.volume <= 0.33
        ) {

            volumeIcon.innerHTML = `
                <path
                    class="volume-speaker"
                    d="M5 9H8L12 5V19L8 15H5V9Z"
                />

                <path
                    class="volume-wave volume-wave-1"
                    d="M15 9C16.2 10.2 16.2 13.8 15 15"
                />
            `;

        } else if (
            state.volume <= 0.66
        ) {

            volumeIcon.innerHTML = `
                <path
                    class="volume-speaker"
                    d="M5 9H8L12 5V19L8 15H5V9Z"
                />

                <path
                    class="volume-wave volume-wave-1"
                    d="M15 9C16.2 10.2 16.2 13.8 15 15"
                />

                <path
                    class="volume-wave volume-wave-2"
                    d="M17.5 6.8C20 9.3 20 14.7 17.5 17.2"
                />
            `;

        } else {

            volumeIcon.innerHTML = `
                <path
                    class="volume-speaker"
                    d="M5 9H8L12 5V19L8 15H5V9Z"
                />

                <path
                    class="volume-wave volume-wave-1"
                    d="M15 9C16.2 10.2 16.2 13.8 15 15"
                />

                <path
                    class="volume-wave volume-wave-2"
                    d="M17.5 6.8C20 9.3 20 14.7 17.5 17.2"
                />

                <path
                    class="volume-wave volume-wave-3"
                    d="M20 4.8C23.5 8.3 23.5 15.7 20 19.2"
                />
            `;
        }


        volumeSlider.value =
            String(
                state.volume
            );
            
        volumeProgress.style.width =
        `${state.volume * 100}%`;


        /* ESTADO */

        switch (state.status) {

            case 'loading':
                statusText.textContent = 'CONECTANDO';
                break;

            case 'buffering':
                statusText.textContent = 'CARGANDO';
                break;

            case 'playing':
                statusText.textContent = 'EN VIVO';
                break;

            case 'error':
                statusText.textContent = 'ERROR';
                break;

            case 'paused':
                statusText.textContent = 'PAUSADO';
                break;

            default:
                statusText.textContent = 'LISTO';
                break;
        }
    }


    /* --------------------------------------------------
   PREVIOUS / NEXT / REPEAT
-------------------------------------------------- */

previousButton.addEventListener(
    'click',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        playPreviousMusicQueueTrack();
    }
);

nextButton.addEventListener(
    'click',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        playNextMusicQueueTrack();
    }
);

repeatButton.addEventListener(
    'click',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        youtubeRepeat =
            !youtubeRepeat;

        repeatButton.setAttribute(
            'aria-pressed',
            String(youtubeRepeat)
        );

        repeatButton.classList.toggle(
            'is-active',
            youtubeRepeat
        );

        console.log(
            '[MusicPlayer] YouTube repeat:',
            youtubeRepeat
        );
    }
);

shuffleButton.addEventListener('click', () => {
    if (activePlaybackSource !== 'youtube') return;

    youtubeShuffle = !youtubeShuffle;

    if (youtubeShuffle) {
        youtubeShuffleHistory = [];

        if (
            musicQueueCurrentIndex >= 0
        ) {
            youtubeShuffleHistory.push(
                musicQueueCurrentIndex
            );
        }

        youtubeShuffleHistoryPosition =
            youtubeShuffleHistory.length - 1;

        console.log(
            '[MusicPlayer] Shuffle history reset:',
            youtubeShuffleHistory
        );

    } else {
        youtubeShuffleHistory = [];
        youtubeShuffleHistoryPosition = -1;
    }

    shuffleButton.setAttribute(
        'aria-pressed',
        String(youtubeShuffle)
    );

    shuffleButton.classList.toggle(
        'is-active',
        youtubeShuffle
    );

    console.log(
        '[MusicPlayer] YouTube shuffle:',
        youtubeShuffle
    );
});
    audioPlayer.subscribe(
        updateUI
    );

    youtubePlayer.subscribe(
        updateUI
    );

    youtubePlayer.subscribe(
    state => {

        if (
            state.status ===
            'playing'
        ) {
            startYouTubeProgress();
            return;
        }

        stopYouTubeProgress();
    }
);

youtubePlayer.subscribe(
    state => {

        if (
            state.status !==
            'ended'
        ) {
            return;
        }

        console.log(
            '[MusicPlayer] YouTube track ended.'
        );

        if (
            musicQueueCurrentIndex < 0 ||
            musicQueueCurrentIndex >=
                musicQueue.length
        ) {

            console.log(
                '[MusicPlayer] Cannot handle ended track: invalid music queue index.',
                musicQueueCurrentIndex
            );

            return;
        }

        /*
         * Repeat:
         * repetimos exclusivamente
         * la canción actual.
         */
        if (
            youtubeRepeat
        ) {

            console.log(
                '[MusicPlayer] Repeat enabled. Replaying current music track.'
            );

            if (
                currentYouTubeVideoId
            ) {

                youtubePlayer.seekTo(
                    0
                );

                youtubePlayer.play();

            } else {

                void playMusicQueueTrack(
                    musicQueueCurrentIndex
                );
            }

            return;
        }

        /*
         * Repeat apagado:
         * avanzamos.
         */
        console.log(
            '[MusicPlayer] Repeat disabled. Playing next music track.'
        );

        void playNextMusicQueueTrack();
    }
);
    
/* --------------------------------------------------
   YOUTUBE TOOGLE
-------------------------------------------------- */

videoToggle.addEventListener(
    'click',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        const shouldOpen =
            videoPanel.hidden;

        videoPanel.hidden =
            !shouldOpen;

        videoPanel.setAttribute(
            'aria-hidden',
            String(!shouldOpen)
        );

        videoToggle.setAttribute(
            'aria-pressed',
            String(shouldOpen)
        );

        videoToggle.setAttribute(
            'aria-label',
            shouldOpen
                ? 'Ocultar video de YouTube'
                : 'Mostrar video de YouTube'
        );
    }
);

/* --------------------------------------------------
   SEEK
-------------------------------------------------- */

progressSeek.addEventListener(
    'pointerdown',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        youtubeIsSeeking =
            true;

        stopYouTubeProgress();
    }
);

progressSeek.addEventListener(
    'input',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            return;
        }

        const duration =
            youtubePlayer.getDuration();

        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return;
        }

        const percentage =
            Number(
                progressSeek.value
            );

        if (
            !Number.isFinite(percentage)
        ) {
            return;
        }

        const previewTime =
            duration *
            (percentage / 100);

        progressCurrent.textContent =
            formatTime(
                previewTime
            );
        progressSeekProgress.style.width =
            `${percentage}%`;
    }
);

progressSeek.addEventListener(
    'change',
    () => {

        if (
            activePlaybackSource !==
            'youtube'
        ) {
            youtubeIsSeeking =
                false;

            return;
        }

        const duration =
            youtubePlayer.getDuration();

        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            youtubeIsSeeking =
                false;

            return;
        }

        const percentage =
            Number(
                progressSeek.value
            );

        if (
            !Number.isFinite(percentage)
        ) {
            youtubeIsSeeking =
                false;

            return;
        }

        const targetTime =
            duration *
            (percentage / 100);

        youtubeSeekTargetTime =
            targetTime;

        progressCurrent.textContent =
            formatTime(
                targetTime
            );

        progressSeek.value =
            String(
                (targetTime / duration) *
                100
            );
        
        progressSeekProgress.style.width =
        `${(targetTime / duration) * 100}%`;

        youtubePlayer.seekTo(
            targetTime
        );

        const seekStartTime =
            performance.now();

        const waitForSeek =
            () => {

                if (
                    youtubeSeekTargetTime ===
                    null
                ) {
                    return;
                }

                const currentTime =
                    youtubePlayer
                        .getCurrentTime();

                const elapsed =
                    performance.now() -
                    seekStartTime;

                const reachedTarget =
                    Number.isFinite(
                        currentTime
                    ) &&
                    Math.abs(
                        currentTime -
                        targetTime
                    ) < 0.35;

                if (
                    reachedTarget ||
                    elapsed >= 1000
                ) {
                    youtubeSeekTargetTime =
                        null;

                    youtubeIsSeeking =
                        false;

                    updateYouTubeProgress();

                    const state =
                        youtubePlayer
                            .getState();

                    if (
                        state.status ===
                        'playing'
                    ) {
                        startYouTubeProgress();
                    }

                    return;
                }

                requestAnimationFrame(
                    waitForSeek
                );
            };

        requestAnimationFrame(
            waitForSeek
        );
    }
);

/* --------------------------------------------------
   PLAY / PAUSE
-------------------------------------------------- */

playButton.addEventListener(
    'click',
    () => {

        if (
            activePlaybackSource ===
            'youtube'
        ) {

            const state =
                youtubePlayer.getState();

            console.log(
                '[MusicPlayer] YouTube toggle:',
                state.status
            );

            if (
                state.status ===
                'playing'
            ) {

                console.log(
                    '[MusicPlayer] YouTube pause()'
                );

                youtubePlayer.pause();

            } else {

                console.log(
                    '[MusicPlayer] YouTube play()'
                );

                youtubePlayer.play();
            }

            return;
        }

        audioPlayer
            .toggle()
            .catch(
                error => {
                    console.error(
                        '[MusicPlayer] Unable to toggle audio:',
                        error
                    );
                }
            );
    }
);

    /* --------------------------------------------------
       MUTE
    -------------------------------------------------- */

    muteButton.addEventListener(
        'click',
        () => {

            if (
                activePlaybackSource ===
                'youtube'
            ) {

                const state =
                    youtubePlayer.getState();

                youtubePlayer.setMuted(
                    !state.muted
                );

                return;
            }

            const state =
                audioPlayer.getState();

            audioPlayer.setMuted(
                !state.muted
            );
        }
    );


    /* --------------------------------------------------
       VOLUMEN
    -------------------------------------------------- */

    volumeSlider.addEventListener(
        'input',
        () => {

            const volume =
                Number(
                    volumeSlider.value
                );

            if (
                activePlaybackSource ===
                'youtube'
            ) {

                youtubePlayer.setVolume(
                    volume * 100
                );

                return;
            }

            audioPlayer.setVolume(
                volume
            );
        }
    );

    updateUI();
}


document.addEventListener(
    'astro:page-load',
    initializeMusicPlayer
);
