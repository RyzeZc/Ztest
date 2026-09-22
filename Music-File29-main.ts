import { audioPlayer } from '../../lib/audio/audio-player';
import { audioStations } from '../../lib/audio/audio-stations';
import { YouTubePlayer } from '../../lib/youtube/youtube-player';
import {
    getAlbumTracks,
    getChart,
    getGenreChart,
    getGenres,
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
    MusicAlbum,
    MusicChart,
    MusicGenre,
    MusicPlaylist,
    MusicSearchResponse,
    MusicTrack,
} from '../../lib/music/music-types';


import type {
    HomeDetailRoute,
    HomeLoadState,
    HomeSection,
    MusicPanelTab,
} from '../../lib/MusicPlayer/types';

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

    let youtubeTracks:
        MusicTrack[] = [];

    const SEARCH_MAX_PAGES =
    3;

    let searchQuery = '';

    let searchNext:
        string | null = null;

    let searchPageCount =
        0;

    let searchLoading =
        false;

    let searchObserver:
        IntersectionObserver | null =
        null;

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


panelCloseButton.addEventListener(
    'click',
    () => {

        closeStationMenu();
    }
);

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
            void loadPlaylist();
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


            item.dataset.trendingIndex =
                String(index);

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

async function loadPlaylist(): Promise<void> {

    if (
        homeLoadState.playlist ===
        'loading' ||
        homeLoadState.playlist ===
        'loaded'
    ) {
        return;
    }

    const section =
        getHomeSectionElement(
            'playlist'
        );

    if (!section) {
        return;
    }

    homeLoadState.playlist =
        'loading';

    section.innerHTML = `
        <div class="music-player-home-loading">
            CARGANDO PLAYLISTS...
        </div>
    `;

    try {

        const chart =
            await getHomeChartData();

        const playlists =
            chart.playlists.data;

        renderPlaylists(
            section,
            playlists
        );

        homeLoadState.playlist =
            'loaded';

    } catch (error) {

        console.error(
            '[MusicPlayer] Playlist failed:',
            error
        );

        homeLoadState.playlist =
            'error';

        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO SE PUDIERON CARGAR LAS PLAYLISTS
            </div>
        `;
    }
}

function renderPlaylists(
    section: HTMLElement,
    playlists: MusicPlaylist[]
): void {

    if (
        playlists.length === 0
    ) {

        section.innerHTML = `
            <div class="music-player-home-placeholder">
                NO HAY PLAYLISTS DISPONIBLES
            </div>
        `;

        return;
    }

    section.innerHTML = `
        <div class="music-player-discover-grid music-player-playlist-grid"></div>
    `;

    const grid =
        section.querySelector(
            '.music-player-playlist-grid'
        );

    if (
        !(grid instanceof HTMLElement)
    ) {
        return;
    }

    playlists.forEach(
        playlist => {

            const card =
                document.createElement(
                    'button'
                );

            card.type =
                'button';

            card.className =
                'music-player-discover-card music-player-playlist-card';

            const image =
                document.createElement(
                    'img'
                );

            image.src =
                playlist.picture ??
                '';

            image.alt =
                `${playlist.title} - portada`;

            const title =
                document.createElement(
                    'div'
                );

            title.className =
                'music-player-discover-title';

            title.textContent =
                playlist.title;

            const meta =
                document.createElement(
                    'div'
                );

            meta.className =
                'music-player-discover-artist';

            meta.textContent =
                playlist.user?.name
                    ? `${playlist.user.name} · ${playlist.nb_tracks ?? 0} pistas`
                    : `${playlist.nb_tracks ?? 0} pistas`;

            card.appendChild(
                image
            );

            card.appendChild(
                title
            );

            card.appendChild(
                meta
            );

            card.addEventListener(
                'click',
                () => {

                    openHomeDetail({
                        type:
                            'playlist',

                        id:
                            playlist.id,

                        title:
                            playlist.title,

                        returnSection:
                            'playlist',
                    });
                }
            );

            grid.appendChild(
                card
            );
        }
    );
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
                    'button'
                );

            card.type =
                'button';

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

            card.addEventListener(
                'click',
                () => {

                    openHomeDetail({
                        type:
                            'album',

                        id:
                            album.id,

                        title:
                            album.title,

                        returnSection:
                            'discover',
                    });
                }
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

            card.addEventListener(
                'click',
                () => {

                    openHomeDetail({
                        type:
                            'genre',

                        id:
                            genre.id,

                        title:
                            genre.name,

                        returnSection:
                            'genres',
                    });
                }
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
        playbackState.musicQueue.length === 0
    ) {

        queueList.innerHTML = `
            <div class="music-player-queue-empty">
                LA COLA SE GENERARÁ AL REPRODUCIR UNA CANCIÓN
            </div>
        `;

        return;
    }

    playbackState.musicQueue.forEach(
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
                playbackState.musicQueueCurrentIndex
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
                    youtubeTracks.findIndex(
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

function updateSearchLoader(
    visible: boolean
): void {

    if (
        !(searchLoader instanceof HTMLElement)
    ) {
        return;
    }

    const spinner =
        searchLoader.querySelector<HTMLElement>(
            '.loading-spinner'
        );

    if (
        !(spinner instanceof HTMLElement)
    ) {
        return;
    }

    spinner.classList.toggle(
        'is-visible',
        visible
    );
}


function stopSearchInfiniteScroll(): void {

    if (
        searchObserver
    ) {

        searchObserver.disconnect();

        searchObserver =
            null;
    }

    updateSearchLoader(
        false
    );
}


function setupSearchInfiniteScroll():
    void {

    stopSearchInfiniteScroll();

    searchObserver =
        new IntersectionObserver(
            entries => {

                const entry =
                    entries[0];

                if (
                    !entry?.isIntersecting
                ) {
                    return;
                }

                if (
                    searchLoading
                ) {
                    return;
                }

                if (
                    !searchNext
                ) {
                    stopSearchInfiniteScroll();
                    return;
                }

                if (
                    searchPageCount >=
                    SEARCH_MAX_PAGES
                ) {
                    stopSearchInfiniteScroll();
                    return;
                }

                void loadMoreSearchResults();
            },
            {
                root:
                    youtubeResults,

                rootMargin:
                    '0px 0px 250px 0px',

                threshold:
                    0,
            }
        );

    searchObserver.observe(
        searchLoader
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
                () => {

                    void selectMusicTrack(
                        result,
                        {
                            queueAction:
                                'generate',
                        }
                    );
                }
            );

            youtubeResults.insertBefore(
                item,
                searchLoader
            );
        }
    );
}

async function searchYouTube(
    query: string
): Promise<void> {

    const normalizedQuery =
        query.trim();

    if (
        !normalizedQuery
    ) {
        return;
    }

    /*
     * Nueva búsqueda:
     * reiniciamos toda la paginación.
     */
    searchQuery =
        normalizedQuery;

    searchNext =
        null;

    searchPageCount =
        0;

    youtubeTracks =
        [];

    searchLoading =
        false;

    setupSearchInfiniteScroll();

    /*
     * Estado inicial visual.
     */
    youtubeResults.innerHTML =
        `
            <div class="music-player-youtube-loading">
                BUSCANDO...
            </div>
        `;

    /*
     * Volvemos a insertar el loader
     * después del mensaje inicial.
     */
    youtubeResults.appendChild(
        searchLoader
    );

    youtubeSearchInput.disabled =
        true;

    await loadSearchPage(
        true
    );

    youtubeSearchInput.disabled =
        false;
}


async function loadSearchPage(
    isInitialPage = false
): Promise<void> {

    if (
        searchLoading
    ) {
        return;
    }

    /*
     * No hacemos más peticiones
     * cuando alcanzamos el límite.
     */
    if (
        !isInitialPage &&
        (
            !searchNext ||
            searchPageCount >=
                SEARCH_MAX_PAGES
        )
    ) {

        stopSearchInfiniteScroll();

        return;
    }

    searchLoading =
        true;

    updateSearchLoader(
        true
    );

    try {

        const response =
            isInitialPage

                ? await searchTracks(
                    searchQuery
                )

                : await getMusicApiNext<
                    MusicSearchResponse<MusicTrack>
                >(
                    searchNext as string
                );

        if (
            response.status !==
            'success'
        ) {

            throw new Error(
                `Music search failed: ${response.status}`
            );
        }

        const newTracks =
            response.data ??
            [];

        /*
         * Para la primera página
         * eliminamos BUSCANDO...
         */
        if (
            isInitialPage
        ) {

            youtubeResults
                .querySelector(
                    '.music-player-youtube-loading'
                )
                ?.remove();
        }

        /*
         * Evitamos duplicados por Deezer ID.
         */
        const existingIds =
            new Set(
                youtubeTracks.map(
                    track =>
                        track.id
                )
            );

        const uniqueTracks =
            newTracks.filter(
                track =>
                    !existingIds.has(
                        track.id
                    )
            );

        youtubeTracks.push(
            ...uniqueTracks
        );

        appendYouTubeResults(
            uniqueTracks
        );

        searchNext =
            response.next;

        searchPageCount +=
            1;

        console.log(
            '[MusicPlayer] Search page loaded:',
            {
                query:
                    searchQuery,

                page:
                    searchPageCount,

                added:
                    uniqueTracks.length,

                total:
                    youtubeTracks.length,

                next:
                    searchNext,
            }
        );

        /*
         * Si ya no hay siguiente página
         * o alcanzamos el máximo, paramos.
         */
        if (
            !searchNext ||
            searchPageCount >=
                SEARCH_MAX_PAGES
        ) {

            stopSearchInfiniteScroll();
        }

    } catch (error) {

        console.error(
            '[MusicPlayer] Music search failed:',
            error
        );

        if (
            isInitialPage
        ) {

            youtubeResults.innerHTML =
                `
                    <div class="music-player-youtube-error">
                        NO SE PUDO REALIZAR LA BÚSQUEDA
                    </div>
                `;

            /*
             * Volvemos a colocar el loader
             * al final del contenedor.
             */
            youtubeResults.appendChild(
                searchLoader
            );

        } else {

            /*
             * Una página posterior puede fallar
             * sin destruir los resultados que
             * ya tenemos.
             */
            console.error(
                '[MusicPlayer] Additional search page failed.'
            );
        }

        stopSearchInfiniteScroll();

    } finally {

        searchLoading =
            false;

        updateSearchLoader(
            false
        );
    }
}


async function loadMoreSearchResults():
    Promise<void> {

    if (
        !searchNext ||
        searchPageCount >=
            SEARCH_MAX_PAGES
    ) {

        stopSearchInfiniteScroll();

        return;
    }

    await loadSearchPage(
        false
    );
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
            playbackState.musicQueue.length > 0 &&
            playbackState.musicQueueCurrentIndex >= 0;

        previousButton.disabled =
            !hasMusicQueue;

        nextButton.disabled =
            !hasMusicQueue ||
            playbackState.musicQueueCurrentIndex >=
                playbackState.musicQueue.length - 1;

        repeatButton.disabled =
            !hasMusicQueue;

        shuffleButton.disabled =
            !hasMusicQueue ||
            playbackState.musicQueue.length < 2;

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
            playbackState.musicQueueCurrentIndex >= 0
        ) {
            playbackState.youtubeShuffleHistory.push(
                playbackState.musicQueueCurrentIndex
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
            playbackState.musicQueueCurrentIndex < 0 ||
            playbackState.musicQueueCurrentIndex >=
                playbackState.musicQueue.length
        ) {

            console.log(
                '[MusicPlayer] Cannot handle ended track: invalid music queue index.',
                playbackState.musicQueueCurrentIndex
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
                    playbackState.musicQueueCurrentIndex
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
