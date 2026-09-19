import { audioPlayer } from '../../lib/audio/audio-player';
import { audioStations } from '../../lib/audio/audio-stations';
import { YouTubePlayer } from '../../lib/youtube/youtube-player';
import type { DeezerTrack } from '../../lib/deezer/deezer-types';

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

    player.classList.add(
        'is-track-info-loading'
    );

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
        '[data-panel="stations"]'
    );

    const youtubePanel =
        player.querySelector(
            '[data-panel="youtube"]'
        );

    const youtubeButton =
        player.querySelector(
            '.music-player-youtube-button'
        );

    const youtubeBackButton =
        player.querySelector(
            '.music-player-youtube-back'
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

    const youtubeLoadMore =
        player.querySelector(
            '.music-player-youtube-load-more'
        );

    const artworkImage =
        player.querySelector(
            '.music-player-track-artwork-image'
        );

    const trackInfo =
        player.querySelector(
            '.music-player-track-info'
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
        !(youtubeBackButton instanceof HTMLButtonElement) ||
        !(youtubeSearchForm instanceof HTMLFormElement) ||
        !(youtubeSearchInput instanceof HTMLInputElement) ||
        !(youtubeResults instanceof HTMLElement) ||
        !(youtubeLoadMore instanceof HTMLButtonElement) ||
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
        !(videoPanel instanceof HTMLElement)
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
            station => {

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

                option.textContent =
                    station.name;

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

    updateStationMenu();

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


    updateStationMenu();

        /* --------------------------------------------------
       YOUTUBE SEARCH
    -------------------------------------------------- */

    let youtubeNextPageToken:
        string | undefined;

    let youtubeCurrentQuery =
        '';

    let activePlaybackSource:
        'radio' | 'youtube' =
        'radio';
    
    interface YouTubeQueueTrack {
        videoId: string;
        title: string;
        artist: string;
        duration: number | null;
        thumbnail: string | null;
    }

    let youtubeQueue:
        YouTubeQueueTrack[] = [];


    let youtubeTracks:
    DeezerTrack[] = [];

    let youtubeQueueCurrentIndex = -1;
    let youtubeCurrentIndex = -1;

    let youtubeRepeat = false;
    let youtubeShuffle = false;

    let currentYouTubeVideoId: string | null = null;

    let youtubeShuffleHistory: number[] = [];
    let youtubeShuffleHistoryPosition = -1;

    let youtubeProgressInterval:
    ReturnType<typeof setInterval> | null =
    null;

    let youtubeIsSeeking = false;

    let youtubeSeekTargetTime:
    number | null = null;
    
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

function playYouTubeQueueTrack(
    index: number
): void {

    if (
        index < 0 ||
        index >= youtubeQueue.length
    ) {
        console.log(
            '[MusicPlayer] Invalid YouTube queue index:',
            index
        );

        return;
    }

    const track =
        youtubeQueue[index];

    if (!track) {
        return;
    }

    youtubeQueueCurrentIndex =
        index;

    currentYouTubeVideoId =
        track.videoId;

    console.log(
        '[MusicPlayer] Playing YouTube queue track:',
        track
    );

    console.log(
        '[MusicPlayer] YouTube queue index:',
        youtubeQueueCurrentIndex
    );

    audioPlayer.pause();

    activePlaybackSource =
        'youtube';

    youtubePlayer.load(
        track.videoId
    );

    youtubePlayer.play();
}

function getNextShuffleIndex(): number | null {

    if (
        youtubeQueue.length <= 1
    ) {
        return null;
    }

    const availableIndexes =
        youtubeQueue
            .map(
                (_, index) =>
                    index
            )
            .filter(
                index =>
                    index !==
                    youtubeQueueCurrentIndex
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

function playNextYouTubeQueueTrack(): void {

    if (
        youtubeQueue.length === 0
    ) {
        console.log(
            '[MusicPlayer] YouTube queue is empty.'
        );

        return;
    }

    if (
        youtubeQueueCurrentIndex < 0
    ) {
        console.log(
            '[MusicPlayer] YouTube queue index is invalid:',
            youtubeQueueCurrentIndex
        );

        return;
    }

    /*
     * Shuffle:
     *
     * Si estamos navegando hacia atrás
     * dentro del historial, primero avanzamos
     * dentro de ese historial.
     */
    if (
        youtubeShuffle &&
        youtubeShuffleHistoryPosition <
            youtubeShuffleHistory.length - 1
    ) {

        youtubeShuffleHistoryPosition += 1;

        const historyIndex =
            youtubeShuffleHistory[
                youtubeShuffleHistoryPosition
            ];

        if (
            historyIndex === undefined
        ) {
            return;
        }

        console.log(
            '[MusicPlayer] Shuffle next from history:',
            historyIndex
        );

        playYouTubeQueueTrack(
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

        /*
         * Eliminamos cualquier tramo
         * posterior del historial.
         *
         * Esto ocurre si hicimos Previous
         * y luego Next genera una nueva
         * continuación.
         */
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

        console.log(
            '[MusicPlayer] Shuffle selected next track:',
            nextIndex
        );

        console.log(
            '[MusicPlayer] Shuffle history:',
            youtubeShuffleHistory
        );

    } else {

        const sequentialIndex =
            youtubeQueueCurrentIndex + 1;

        if (
            sequentialIndex >=
            youtubeQueue.length
        ) {
            console.log(
                '[MusicPlayer] YouTube queue reached the end.'
            );

            return;
        }

        nextIndex =
            sequentialIndex;

        console.log(
            '[MusicPlayer] Playing next YouTube queue track:',
            nextIndex
        );
    }

    playYouTubeQueueTrack(
        nextIndex
    );
}

function playPreviousYouTubeQueueTrack(): void {

    if (
        youtubeQueue.length === 0
    ) {
        console.log(
            '[MusicPlayer] YouTube queue is empty.'
        );

        return;
    }

    if (
        youtubeQueueCurrentIndex < 0
    ) {
        console.log(
            '[MusicPlayer] YouTube queue index is invalid:',
            youtubeQueueCurrentIndex
        );

        return;
    }

    const currentTime =
        youtubePlayer.getCurrentTime();

    if (
        currentTime > 3
    ) {
        console.log(
            '[MusicPlayer] Restarting current YouTube track.'
        );

        youtubePlayer.seekTo(0);
        youtubePlayer.play();

        return;
    }

    /*
     * Shuffle:
     *
     * El historial representa el camino
     * real recorrido:
     *
     * [6, 4, 6, 12]
     *           ↑
     *        posición 3
     */
    if (
        youtubeShuffle &&
        youtubeShuffleHistoryPosition > 0
    ) {

        youtubeShuffleHistoryPosition -= 1;

        const previousIndex =
            youtubeShuffleHistory[
                youtubeShuffleHistoryPosition
            ];

        if (
            previousIndex === undefined
        ) {
            console.log(
                '[MusicPlayer] Shuffle history has no previous track.'
            );

            return;
        }

        console.log(
            '[MusicPlayer] Shuffle previous track:',
            previousIndex
        );

        console.log(
            '[MusicPlayer] Shuffle history position:',
            youtubeShuffleHistoryPosition
        );

        console.log(
            '[MusicPlayer] Shuffle history:',
            youtubeShuffleHistory
        );

        playYouTubeQueueTrack(
            previousIndex
        );

        return;
    }

    /*
     * Shuffle activado pero no existe
     * un elemento anterior en el historial.
     */
    if (
        youtubeShuffle
    ) {

        console.log(
            '[MusicPlayer] Shuffle history has no previous track.'
        );

        youtubePlayer.seekTo(0);
        youtubePlayer.play();

        return;
    }

    /*
     * Shuffle desactivado:
     * comportamiento secuencial normal.
     */
    const previousIndex =
        youtubeQueueCurrentIndex - 1;

    if (
        previousIndex < 0
    ) {
        console.log(
            '[MusicPlayer] YouTube queue is already at the first track.'
        );

        youtubePlayer.seekTo(0);
        youtubePlayer.play();

        return;
    }

    console.log(
        '[MusicPlayer] Playing previous YouTube queue track:',
        previousIndex
    );

    playYouTubeQueueTrack(
        previousIndex
    );
}

    function showYouTubePanel(): void {

        stationPanel.classList.remove(
            'is-active'
        );

        youtubePanel.classList.add(
            'is-active'
        );

        youtubeSearchInput.focus();
    }


    function showStationsPanel(): void {

        youtubePanel.classList.remove(
            'is-active'
        );

        stationPanel.classList.add(
            'is-active'
        );
    }


    function clearYouTubeResults(): void {

        youtubeResults.innerHTML = '';

        youtubeNextPageToken =
            undefined;

        youtubeLoadMore.hidden =
            true;
    }


    function appendYouTubeResults(
    results: DeezerTrack[]
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

                const thumbnail =
                    document.createElement(
                        'img'
                    );

                thumbnail.className =
                    'music-player-youtube-result-thumbnail';

                thumbnail.src =
                    result.image;

                thumbnail.alt =
                    `${result.name} - portada`;

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
                    result.name;

                const channel =
                    document.createElement(
                        'span'
                    );

                channel.className =
                    'music-player-youtube-result-channel';

                channel.textContent =
                    result.artists
                        ?.map(
                            artist =>
                                artist.name
                        )
                        .join(', ') ??
                    'ARTISTA DESCONOCIDO';

                info.appendChild(
                    title
                );

                info.appendChild(
                    channel
                );

                item.appendChild(
                    thumbnail
                );

                item.appendChild(
                    info
                );

item.addEventListener(
    'click',
    async () => {

        const trackId =
            item.dataset.trackId;

        if (!trackId) {
            return;
        }

        console.log(
            '[MusicPlayer] Deezer track selected:',
            result
        );

        youtubeCurrentIndex =
            youtubeTracks.findIndex(
                track =>
                    track.id ===
                    Number(trackId)
            );

        console.log(
            '[MusicPlayer] Deezer track index:',
            youtubeCurrentIndex
        );


        const artistName =
            result.artists
                ?.map(
                    artist =>
                        artist.name
                )
                .join(', ') ??
            '';

        const trackName =
            result.name;

        if (!artistName || !trackName) {

            console.log(
                '[MusicPlayer] Cannot resolve track: missing artist or title.'
            );

            return;
        }

        console.log(
            '[MusicPlayer] Resolving Deezer track:',
            {
                id: result.id,
                artist: artistName,
                title: trackName,
            }
        );

        try {

            const params =
                new URLSearchParams();

            params.set(
                'id',
                String(result.id)
            );

            params.set(
                'artist',
                artistName
            );

            params.set(
                'title',
                trackName
            );

            const response =
                await fetch(
                    `/api/v2/music/resolve?${params.toString()}`
                );

            if (!response.ok) {

                throw new Error(
                    `Music resolve failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!data.success) {

                throw new Error(
                    data.error ??
                    'Music resolve failed.'
                );
            }

            const resolvedTracks =
                data.results ?? [];

            console.log(
                '[MusicPlayer] Resolved YouTube tracks:',
                resolvedTracks
            );

            if (
                resolvedTracks.length === 0
            ) {

                console.log(
                    '[MusicPlayer] No YouTube video was found for this track.'
                );

                return;
            }

            const videoId =
                resolvedTracks[0]?.id;

            if (!videoId) {

                console.log(
                    '[MusicPlayer] Resolved result does not contain a video ID.'
                );

                return;
            }

            console.log(
                '[MusicPlayer] Using YouTube video:',
                videoId
            );

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

            try {

                const upNextResponse =
                    await fetch(
                        `/api/v2/music/up-next?videoId=${encodeURIComponent(
                            videoId
                        )}`
                    );

                if (!upNextResponse.ok) {

                    throw new Error(
                        `Up Next request failed: ${upNextResponse.status}`
                    );

                }

                const upNextData =
                    await upNextResponse.json();

                if (
                    !upNextData.success ||
                    !Array.isArray(
                        upNextData.results
                    )
                ) {

                    throw new Error(
                        'Invalid Up Next response'
                    );

                }

                    youtubeQueue =
                        upNextData.results;

                    youtubeQueueCurrentIndex =
                        youtubeQueue.findIndex(
                            track =>
                                track.videoId ===
                                videoId
                        );

                    if (
                        youtubeQueueCurrentIndex < 0 &&
                        youtubeQueue.length > 0
                    ) {
                        youtubeQueueCurrentIndex =
                            0;
                    }

                    console.log(
                        '[MusicPlayer] YouTube Up Next queue loaded:',
                        youtubeQueue
                    );

                    console.log(
                        '[MusicPlayer] YouTube Up Next queue length:',
                        youtubeQueue.length
                    );

                    console.log(
                        '[MusicPlayer] YouTube queue current index:',
                        youtubeQueueCurrentIndex
                    );
                    updateUI();

                } catch (error) {

                console.error(
                    '[MusicPlayer] Failed to load YouTube Up Next:',
                    error
                );

            }

        } catch (error) {

            console.error(
                '[MusicPlayer] Music resolve failed:',
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
    query: string,
    append = false
): Promise<void> {

    if (!query) {
        return;
    }

    if (!append) {

        youtubeCurrentQuery =
            query;

        youtubeNextPageToken =
            undefined;

        youtubeTracks =
            [];

        youtubeCurrentIndex =
            -1;

        youtubeQueue =
            [];

        youtubeQueueCurrentIndex =
            -1;

        youtubeResults.innerHTML =
            '';

        youtubeLoadMore.hidden =
            true;
    }

    youtubeSearchInput.disabled =
        true;

    if (!append) {

        youtubeResults.innerHTML = `
            <div class="music-player-youtube-loading">
                BUSCANDO...
            </div>
        `;
    }

    try {

        const params =
            new URLSearchParams();

        params.set(
            'query',
            youtubeCurrentQuery
        );

        const response =
            await fetch(
                `/api/v2/music/search?${params.toString()}`
            );

        if (!response.ok) {

            throw new Error(
                `Music search failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.error ??
                'Music search failed.'
            );
        }

        if (!append) {

            youtubeResults.innerHTML =
                '';
        }

        const newTracks:
            DeezerTrack[] =
            data.results ?? [];

        youtubeTracks.push(
            ...newTracks
        );

        appendYouTubeResults(
            newTracks
        );

        /*
         * Soundbliz/Deezer no utiliza
         * la paginación de YouTube.
         *
         * Por ahora ocultamos "Cargar más".
         */
        youtubeNextPageToken =
            undefined;

        youtubeLoadMore.hidden =
            true;

    } catch (error) {

        console.error(
            '[MusicPlayer] Music search failed:',
            error
        );

        if (!append) {

            youtubeResults.innerHTML = `
                <div class="music-player-youtube-error">
                    NO SE PUDO REALIZAR LA BÚSQUEDA
                </div>
            `;
        }

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


    youtubeBackButton.addEventListener(
        'click',
        () => {

            showStationsPanel();
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

            searchYouTube(
                query
            );
        }
    );


    youtubeLoadMore.addEventListener(
        'click',
        () => {

            if (
                !youtubeNextPageToken
            ) {
                return;
            }

            searchYouTube(
                youtubeCurrentQuery,
                true
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

    /*
     * Mostrar inmediatamente:
     * cover + nombre + RADIO.
     */
    updateTrackInfo();

    updateStationMenu();
}


    /* --------------------------------------------------
       INFORMACIÓN DEL TRACK
    -------------------------------------------------- */
function showTrackArtwork(
    artworkUrl: string,
    altText: string
): void {

    artworkImage.style.opacity =
        '0';

    player.classList.add(
        'is-track-info-loading'
    );

    artworkImage.onload = () => {

        artworkImage.style.opacity =
            '1';

        player.classList.remove(
            'is-track-info-loading'
        );

        artworkImage.onload =
            null;
    };

    artworkImage.onerror = () => {

        artworkImage.removeAttribute(
            'src'
        );

        artworkImage.style.opacity =
            '0';

        artworkImage.onload =
            null;
    };

    artworkImage.src =
        artworkUrl;

    artworkImage.alt =
        altText;
}


function updateTrackInfo(): void {


    const source =
        audioPlayer.getState().source;

    if (
        activePlaybackSource === 'youtube'
    ) {

        const track =
            youtubeQueue[
                youtubeQueueCurrentIndex
            ];

        if (!track) {
            return;
        }

        player.classList.add(
            'is-track'
        );

        player.classList.remove(
            'is-radio'
        );

        trackTitle.textContent =
            track.title;

        trackArtist.textContent =
            track.artist ??
            'ARTISTA DESCONOCIDO';

        if (track.thumbnail) {

            if (track.thumbnail) {

        showTrackArtwork(
                track.thumbnail,
                `${track.title} - portada`
            );

        } else {

            artworkImage.removeAttribute(
                'src'
            );

            artworkImage.alt = '';

            player.classList.add(
                'is-track-info-loading'
            );
        }

            artworkImage.alt =
                `${track.title} - portada`;

        } else {

            artworkImage.removeAttribute(
                'src'
            );

            artworkImage.alt = '';
        }

        requestAnimationFrame(
            updateTrackMarquee
        );

        player.classList.remove(
            'is-loading-info'
        );

        return;
    }

    if (!source) {

        player.classList.remove(
            'is-radio',
            'is-track'
        );

        artworkImage.removeAttribute(
            'src'
        );

        artworkImage.alt = '';

        trackTitle.textContent = '';
        trackArtist.textContent = '';

        return;
    }

    if (
        source.type === 'radio'
    ) {

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

        if (source.artwork) {

            artworkImage.src =
                source.artwork;

            artworkImage.alt =
                `${source.name} - portada`;

        } else {

            artworkImage.removeAttribute(
                'src'
            );

            artworkImage.alt = '';
        }

        requestAnimationFrame(
            updateTrackMarquee
        );

        player.classList.remove(
            'is-loading-info'
        );

        return;
    }

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

    if (source.artwork) {

        showTrackArtwork(
            source.artwork,
            `${source.name} - portada`
        );

    } else {

        artworkImage.removeAttribute(
            'src'
        );

        artworkImage.alt = '';

        player.classList.add(
            'is-track-info-loading'
        );
    }

    requestAnimationFrame(
        updateTrackMarquee
    );
}


function updateTrackMarquee(): void {

    const marqueeElements = [
        {
            element: trackTitle,
            wrapper: trackTitleWrapper,
            overflowVariable:
                '--music-player-title-overflow',
            durationVariable:
                '--music-player-title-marquee-duration'
        },
        {
            element: trackArtist,
            wrapper: trackArtistWrapper,
            overflowVariable:
                '--music-player-artist-overflow',
            durationVariable:
                '--music-player-artist-marquee-duration'
        }
    ];

    marqueeElements.forEach(
        ({
            element,
            wrapper,
            overflowVariable,
            durationVariable
        }) => {

            element.classList.remove(
                'is-marquee'
            );

            element.style.removeProperty(
                overflowVariable
            );

            element.style.removeProperty(
                durationVariable
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
                overflowVariable,
                `${distance}px`
            );

            element.style.setProperty(
                durationVariable,
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



        const hasYouTubeQueue =
            activePlaybackSource === 'youtube' &&
            youtubeQueue.length > 0 &&
            youtubeQueueCurrentIndex >= 0;
        

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

        previousButton.disabled = !hasYouTubeQueue;

        nextButton.disabled =
            !hasYouTubeQueue ||
            youtubeQueueCurrentIndex >= youtubeQueue.length - 1;

        repeatButton.disabled = !hasYouTubeQueue;

        shuffleButton.disabled = !hasYouTubeQueue;

        shuffleButton.setAttribute(
            'aria-pressed',
            String(youtubeShuffle)
        );

        shuffleButton.classList.toggle(
            'is-active',
            youtubeShuffle
        );

        updateTrackInfo();

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

        playPreviousYouTubeQueueTrack();
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

        playNextYouTubeQueueTrack();
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

        if (youtubeQueueCurrentIndex >= 0) {
            youtubeShuffleHistory.push(
                youtubeQueueCurrentIndex
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
            youtubeQueueCurrentIndex < 0 ||
            youtubeQueueCurrentIndex >=
                youtubeQueue.length
        ) {

            console.log(
                '[MusicPlayer] Cannot handle ended track: invalid YouTube queue index.',
                youtubeQueueCurrentIndex
            );

            return;
        }

        /*
         * Repeat repite únicamente
         * la canción actual.
         */
        if (
            youtubeRepeat
        ) {

            console.log(
                '[MusicPlayer] Repeat enabled. Replaying current YouTube track.'
            );

            if (
                currentYouTubeVideoId
            ) {

                youtubePlayer.seekTo(
                    0
                );

                youtubePlayer.play();

            } else {

                console.log(
                    '[MusicPlayer] Cannot repeat: current YouTube video ID is missing.'
                );

            }

            return;
        }

        /*
         * Repeat apagado:
         * avanzamos a la siguiente canción.
         */
        console.log(
            '[MusicPlayer] Repeat disabled. Playing next YouTube track.'
        );

        playNextYouTubeQueueTrack();
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
