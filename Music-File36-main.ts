import { audioPlayer } from '../../lib/audio/audio-player';
import { audioStations } from '../../lib/audio/audio-stations';
import { YouTubePlayer } from '../../lib/youtube/youtube-player';
import {
    getAlbumTracks,
    getGenreChart,
    getMusicApiNext,
    getPlaylistTracks,
    searchTracks,
} from '../../lib/music/music-service';


import {
    createPlaybackController,
    createPlaybackState,
    hasResolveInFlight,
} from '../../lib/MusicPlayer/playback';


import type {
    MusicSearchResponse,
    MusicTrack,
} from '../../lib/music/music-types';


import type {
    HomeDetailRoute,
    HomeLoadState,
    HomeSection,
    MusicHomeController,
    MusicSearchController,
} from '../../lib/MusicPlayer/types';

import {
    createPanelController,
} from '../../lib/MusicPlayer/panel';

import {
    createSearchController,
} from '../../lib/MusicPlayer/search';

import {
    createHomeController,
} from '../../lib/MusicPlayer/home';

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
            '[data-panel="search"]'
        );

    const queuePanel =
        player.querySelector(
            '[data-panel="playback"]'
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

    const homeSectionsContainer =
    player.querySelector(
        '.music-player-home-sections'
    );

    const homeDetail =
        player.querySelector<HTMLElement>(
            '[data-home-detail]'
        );

    const panelCloseButton =
    player.querySelector<HTMLButtonElement>(
        '[data-panel-close]'
    );

    const homeDetailBack =
        player.querySelector<HTMLButtonElement>(
            '[data-home-detail-back]'
        );

    const homeDetailTitle =
        player.querySelector<HTMLElement>(
            '[data-home-detail-title]'
        );

    const homeDetailContent =
        player.querySelector<HTMLElement>(
            '[data-home-detail-content]'
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
    
    const searchLoader =
    player.querySelector<HTMLElement>(
        '[data-music-search-loader]'
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
        !(queueList instanceof HTMLElement) ||
        !(searchLoader instanceof HTMLElement) ||
        !(homeSectionsContainer instanceof HTMLElement) ||
        !(homeDetail instanceof HTMLElement) ||
        !(homeDetailBack instanceof HTMLButtonElement) ||
        !(homeDetailTitle instanceof HTMLElement) ||
        !(homeDetailContent instanceof HTMLElement) ||
        !(panelCloseButton instanceof HTMLButtonElement)
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

            const eventPath =
                event.composedPath();

            if (
                !eventPath.includes(player)
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

const homeController:
    MusicHomeController =
    createHomeController({

        homeSections,

        formatTime,

        onTrackSelected:
            (
                track,
                playbackList
            ) => {

                void selectMusicTrack(
                    track,
                    {
                        queueAction:
                            'clear',

                        playbackList,

                        playbackListMode:
                            'context',

                        playbackListSource:
                            'home-trending',
                    }
                );
            },

        updateTrackPlaybackIndicators,

        openHomeDetail,

    });

const {
    activatePanelTab,
    activateHomeSection,
    showSearchPanel,
} = createPanelController({

    panelTabs,

    panelViews,

    homeNavItems,

    homeSections,

    panelCloseButton,

    closePanel:
        closeStationMenu,

    focusSearch:
        () => {
            youtubeSearchInput.focus();
        },

    loadHomeSection:
        section => {

            homeController.loadSection(
                section
            );
        },
});

const playbackState =
    createPlaybackState();

const {
    selectMusicTrack,
    playMusicQueueTrack,
    playNextMusicQueueTrack,
    playPreviousMusicQueueTrack,
    } = createPlaybackController({

        state:
            playbackState,

        youtubePlayer,

        audioPlayer,

        getActivePlaybackSource:
            () =>
                activePlaybackSource,

        setActivePlaybackSource:
            source => {

                activePlaybackSource =
                    source;
            },

        updateTrackInfo,

        updateUI,

        updateTrackPlaybackIndicators,

        renderQueuePanel,

        scrollQueueTrackIntoView,

        activatePanelTab,
    });

const searchController:
    MusicSearchController =
    createSearchController({

        resultsContainer:
            youtubeResults,

        loader:
            searchLoader,

        searchForm:
            youtubeSearchForm,

        searchInput:
            youtubeSearchInput,

        activateSearchTab:
            () => {

                activatePanelTab(
                    'search'
                );
            },

        onTrackSelected:
            track => {

                void selectMusicTrack(
                    track,
                    {
                        queueAction:
                            'generate',
                    }
                );
            },

        formatDuration:
            formatTime,

        maxPages:
            3,
    });

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

    let youtubeProgressInterval:
    ReturnType<typeof setInterval> | null =
    null;

    let youtubeIsSeeking = false;

    let youtubeSeekTargetTime:
    number | null = null;

    let currentTrackInfoKey = '';

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

function showHomeRoot(): void {

    homeDetail.classList.remove(
        'is-active'
    );

    homeSectionsContainer.classList.remove(
        'is-hidden'
    );
}


function openHomeDetail(
    route: HomeDetailRoute
): void {

    activeHomeDetail =
        route;

    homeSectionsContainer.classList.add(
        'is-hidden'
    );

    homeDetail.classList.add(
        'is-active'
    );

    homeDetailTitle.textContent =
        route.title;

    homeDetailContent.innerHTML = `
        <div class="music-player-home-loading">
            CARGANDO...
        </div>
    `;

    void loadHomeDetail(
        route
    );
}


function closeHomeDetail(): void {

    if (
        !activeHomeDetail
    ) {
        return;
    }

    const returnSection =
        activeHomeDetail.returnSection;

    activeHomeDetail =
        null;

    showHomeRoot();

    activateHomeSection(
        returnSection
    );
}

homeDetailBack.addEventListener(
    'click',
    () => {
        closeHomeDetail();
    }
);

async function loadHomeDetail(
    route: HomeDetailRoute
): Promise<void> {

    try {

        let tracks:
            MusicTrack[] = [];

        switch (
            route.type
        ) {

            case 'album': {

                const response =
                    await getAlbumTracks(
                        route.id,
                        0,
                        10
                    );

                if (
                    response.status !==
                    'success'
                ) {
                    throw new Error(
                        'Album tracks request failed.'
                    );
                }

                tracks =
                    response.data;

                break;
            }

            case 'playlist': {

                const response =
                    await getPlaylistTracks(
                        route.id,
                        0,
                        10
                    );

                if (
                    response.status !==
                    'success'
                ) {
                    throw new Error(
                        'Playlist tracks request failed.'
                    );
                }

                tracks =
                    response.data;

                break;
            }

            case 'genre': {

                const response =
                    await getGenreChart(
                        route.id
                    );

                if (
                    response.status !==
                    'success'
                ) {
                    throw new Error(
                        'Genre chart request failed.'
                    );
                }

                tracks =
                    response.tracks.data;

                break;
            }
        }

        renderHomeDetailTracks(
            tracks
        );

    } catch (error) {

        console.error(
            '[MusicPlayer] Home detail failed:',
            error
        );

        homeDetailContent.innerHTML = `
            <div class="music-player-home-placeholder">
                NO SE PUDIERON CARGAR LAS CANCIONES
            </div>
        `;
    }
}

function renderHomeDetailTracks(
    tracks: MusicTrack[]
): void {

    if (
        tracks.length === 0
    ) {

        homeDetailContent.innerHTML = `
            <div class="music-player-home-placeholder">
                NO HAY CANCIONES DISPONIBLES
            </div>
        `;

        return;
    }

    homeDetailContent.innerHTML = `
        <div class="music-player-list-header music-player-home-detail-list-header">

            <span class="music-player-list-column-index">
                #
            </span>

            <span
                class="music-player-list-column-cover"
                aria-hidden="true"
            ></span>

            <span class="music-player-list-column-title">
                TÍTULO
            </span>

            <span class="music-player-list-column-duration">
                DURACIÓN
            </span>

        </div>

        <div
            class="music-player-trending-list music-player-home-detail-list"
        ></div>
    `;

    const list =
        homeDetailContent.querySelector(
            '.music-player-home-detail-list'
        );

    if (
        !(list instanceof HTMLElement)
    ) {
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
                'music-player-trending-item music-player-home-detail-track';

            item.dataset.trackId =
                String(
                    track.id
                );

            item.dataset.detailIndex =
                String(index);

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

                    void selectMusicTrack(
                        track,
                        {
                            queueAction:
                                'clear',
                        }
                    );
                }
            );

            list.appendChild(
                item
            );
        }
    );

    updateTrackPlaybackIndicators();
}

function renderQueuePanel(): void {

    queueList.innerHTML = '';

    if (
        playbackState.playbackList.length === 0
    ) {

        queueList.innerHTML = `
            <div class="music-player-queue-empty">
                LA COLA SE GENERARÁ AL REPRODUCIR UNA CANCIÓN
            </div>
        `;

        return;
    }

    playbackState.playbackList.forEach(
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
                
            item.dataset.trackId =
                String(
                    track.id
                );

            if (
                index ===
                playbackState.playbackListCurrentIndex
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
                String(
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

    updateTrackPlaybackIndicators();
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

function updateTrackPlaybackIndicators(): void {

    const state =
        youtubePlayer.getState();

    const currentTrackId =
        activePlaybackSource ===
        'youtube'
            ? playbackState.currentMusicTrack?.id ??
              null
            : null;

    const isActuallyPlaying =
        state.status ===
        'playing';

    const isPendingPlayback =
        currentTrackId !== null &&
        playbackState.playbackIntent === 'play' &&
        playbackState.currentYouTubeVideoId === null &&
        hasResolveInFlight(
            currentTrackId
        );

    const isVisuallyPlaying =
        activePlaybackSource ===
            'youtube' &&
        (
            isActuallyPlaying ||
            isPendingPlayback
        );

    /*
     * --------------------------------------------------
     * RESULTADOS
     * --------------------------------------------------
     */

    const resultItems =
        youtubeResults.querySelectorAll<HTMLElement>(
            '.music-player-youtube-result'
        );

    resultItems.forEach(
        item => {

            const trackId =
                Number(
                    item.dataset.trackId
                );

            const isCurrent =
                trackId ===
                currentTrackId;

            item.classList.toggle(
                'is-selected',
                isCurrent
            );

            const index =
                item.querySelector<HTMLElement>(
                    '.music-player-list-column-index'
                );

            if (index) {

                const resultIndex =
                    searchController
                        .getTracks()
                        .findIndex(
                            track =>
                                track.id ===
                                trackId
                        );

                index.textContent =
                    isCurrent
                        ? (
                            isVisuallyPlaying
                                ? '⏸'
                                : '▶'
                        )
                        : String(
                            resultIndex + 1
                        );
            }

            item.setAttribute(
                'aria-label',
                isCurrent &&
                isVisuallyPlaying
                    ? `Pausar ${item
                        .querySelector(
                            '.music-player-youtube-result-title'
                        )
                        ?.textContent ?? ''}`
                    : `Reproducir ${item
                        .querySelector(
                            '.music-player-youtube-result-title'
                        )
                        ?.textContent ?? ''}`
            );
        }
    );

    const detailItems =
        player.querySelectorAll<HTMLElement>(
            '.music-player-home-detail-track'
        );

    detailItems.forEach(
        item => {

            const trackId =
                Number(
                    item.dataset.trackId
                );

            const isCurrent =
                trackId ===
                currentTrackId;

            item.classList.toggle(
                'is-current',
                isCurrent
            );

            const index =
                item.querySelector<HTMLElement>(
                    '.music-player-list-column-index'
                );

            if (index) {

                const detailIndex =
                    Number(
                        item.dataset.detailIndex
                    );

                index.textContent =
                    isCurrent
                        ? (
                            isVisuallyPlaying
                                ? '⏸'
                                : '▶'
                        )
                        : String(
                            detailIndex + 1
                        );
            }
        }
    );

    /*
     * --------------------------------------------------
     * QUEUE
     * --------------------------------------------------
     */

    const queueItems =
        queueList.querySelectorAll<HTMLElement>(
            '.music-player-queue-item'
        );

    queueItems.forEach(
        item => {

            const trackId =
                Number(
                    item.dataset.trackId
                );

            const isCurrent =
                trackId ===
                currentTrackId;

            item.classList.toggle(
                'is-current',
                isCurrent
            );

            const index =
                item.querySelector<HTMLElement>(
                    '.music-player-queue-index'
                );

            if (index) {

                const queueIndex =
                    Number(
                        item.dataset
                            .queueIndex
                    );

                index.textContent =
                    isCurrent
                        ? (
                            isVisuallyPlaying
                                ? '⏸'
                                : '▶'
                        )
                        : String(
                            queueIndex + 1
                        );
            }
        }
    );

    /*
     * --------------------------------------------------
     * TENDENCIAS
     * --------------------------------------------------
     */

    const trendingItems =
        player.querySelectorAll<HTMLElement>(
            '.music-player-trending-item'
        );

    trendingItems.forEach(
        item => {

            const trackId =
                Number(
                    item.dataset.trackId
                );

            const isCurrent =
                trackId ===
                currentTrackId;

            item.classList.toggle(
                'is-current',
                isCurrent
            );

            const index =
                item.querySelector<HTMLElement>(
                    '.music-player-list-column-index'
                );

            if (index) {

                const trendingIndex =
                    Number(
                        item.dataset
                            .trendingIndex
                    );

                index.textContent =
                    isCurrent
                        ? (
                            isVisuallyPlaying
                                ? '⏸'
                                : '▶'
                        )
                        : String(
                            trendingIndex + 1
                        );
            }
        }
    );
}

    youtubeButton.addEventListener(
        'click',
        () => {

            showSearchPanel();
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
            playbackState.currentMusicTrack;

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
            playbackState.playbackList.length > 0 &&
            playbackState.playbackListCurrentIndex >= 0;

        previousButton.disabled =
            !hasMusicQueue;

        nextButton.disabled =
            !hasMusicQueue ||
            playbackState.playbackListCurrentIndex >=
                playbackState.playbackList.length - 1;

        repeatButton.disabled =
            !hasMusicQueue;

        shuffleButton.disabled =
            !hasMusicQueue ||
            playbackState.playbackList.length < 2;

        shuffleButton.setAttribute(
            'aria-pressed',
            String(playbackState.youtubeShuffle)
        );

        shuffleButton.classList.toggle(
            'is-active',
            playbackState.youtubeShuffle
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

        updateTrackPlaybackIndicators();
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

        playbackState.youtubeRepeat =
            !playbackState.youtubeRepeat;

        repeatButton.setAttribute(
            'aria-pressed',
            String(playbackState.youtubeRepeat)
        );

        repeatButton.classList.toggle(
            'is-active',
            playbackState.youtubeRepeat
        );

        console.log(
            '[MusicPlayer] YouTube repeat:',
            playbackState.youtubeRepeat
        );
    }
);

shuffleButton.addEventListener('click', () => {
    if (activePlaybackSource !== 'youtube') return;

    playbackState.youtubeShuffle = !playbackState.youtubeShuffle;

    if (playbackState.youtubeShuffle) {
        playbackState.youtubeShuffleHistory = [];

        if (
            playbackState.playbackListCurrentIndex >= 0
        ) {
            playbackState.youtubeShuffleHistory.push(
                playbackState.playbackListCurrentIndex
            );
        }

        playbackState.youtubeShuffleHistoryPosition =
            playbackState.youtubeShuffleHistory.length - 1;

        console.log(
            '[MusicPlayer] Shuffle history reset:',
            playbackState.youtubeShuffleHistory
        );

    } else {
        playbackState.youtubeShuffleHistory = [];
        playbackState.youtubeShuffleHistoryPosition = -1;
    }

    shuffleButton.setAttribute(
        'aria-pressed',
        String(playbackState.youtubeShuffle)
    );

    shuffleButton.classList.toggle(
        'is-active',
        playbackState.youtubeShuffle
    );

    console.log(
        '[MusicPlayer] YouTube shuffle:',
        playbackState.youtubeShuffle
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
            playbackState.playbackListCurrentIndex < 0 ||
            playbackState.playbackListCurrentIndex >=
                playbackState.playbackList.length
        ) {

            console.log(
                '[MusicPlayer] Cannot handle ended track: invalid music queue index.',
                playbackState.playbackListCurrentIndex
            );

            return;
        }

        /*
         * Repeat:
         * repetimos exclusivamente
         * la canción actual.
         */
        if (
            playbackState.youtubeRepeat
        ) {

            console.log(
                '[MusicPlayer] Repeat enabled. Replaying current music track.'
            );

            if (
                playbackState.currentYouTubeVideoId
            ) {

                youtubePlayer.seekTo(
                    0
                );

                youtubePlayer.play();

            } else {

                void playMusicQueueTrack(
                    playbackState.playbackListCurrentIndex
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

                playbackState.playbackIntent =
                    'pause';

                youtubePlayer.pause();

            } else {

                playbackState.playbackIntent =
                    'play';

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
