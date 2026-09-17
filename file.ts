import { audioPlayer } from '../../lib/audio/audio-player';
import { audioStations } from '../../lib/audio/audio-stations';
import { YouTubePlayer } from '../../lib/youtube/youtube-player';

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

    const playIcon =
        player.querySelector(
            '.music-player-play-icon'
        );

    const stopButton =
        player.querySelector(
            '.music-player-stop'
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

    const trackTitle =
        player.querySelector(
            '.music-player-track-title'
        );

    if (
                !(trackArtist instanceof HTMLElement) ||
                !(trackTitleWrapper instanceof HTMLElement) ||
                !(trackTitle instanceof HTMLElement) ||
                !(stationPanel instanceof HTMLElement) ||
                !(youtubePanel instanceof HTMLElement) ||
                !(youtubeButton instanceof HTMLButtonElement) ||
                !(youtubeBackButton instanceof HTMLButtonElement) ||
                !(youtubeSearchForm instanceof HTMLFormElement) ||
                !(youtubeSearchInput instanceof HTMLInputElement) ||
                !(youtubeResults instanceof HTMLElement) ||
                !(youtubeLoadMore instanceof HTMLButtonElement) ||
                !(youtubePlayerContainer instanceof HTMLElement)
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

        currentStationId =
            station.id;

        stationName.textContent =
            station.name;

        audioPlayer.setSource(
            station
        );

        updateStationMenu();

        closeStationMenu();
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

    function showStationsPanel(): void {

        stationPanel.classList.add(
            'is-active'
        );

        youtubePanel.classList.remove(
            'is-active'
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


    function clearYouTubeResults(): void {

        youtubeResults.innerHTML = '';

        youtubeNextPageToken =
            undefined;

        youtubeLoadMore.hidden =
            true;
    }


    function appendYouTubeResults(
        results: Array<{
            videoId: string;
            title: string;
            channelTitle: string;
            thumbnail: string;
        }>
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

                item.dataset.videoId =
                    result.videoId;


                const thumbnail =
                    document.createElement(
                        'img'
                    );

                thumbnail.className =
                    'music-player-youtube-result-thumbnail';

                thumbnail.src =
                    result.thumbnail;

                thumbnail.alt = '';


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


                const channel =
                    document.createElement(
                        'span'
                    );

                channel.className =
                    'music-player-youtube-result-channel';

                channel.textContent =
                    result.channelTitle;


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

                        const videoId =
                            item.dataset.videoId;

                        if (!videoId) {
                            return;
                        }

                        console.log(
                            '[MusicPlayer] YouTube video selected:',
                            videoId
                        );

                        // Si había una radio reproduciéndose,
                        // la detenemos antes de iniciar YouTube.
                        audioPlayer.pause();

                        activePlaybackSource =
                            'youtube';

                        youtubePlayer.load(
                            videoId
                        );

                        youtubePlayer.play();
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

            youtubeResults.innerHTML = '';

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
                'q',
                youtubeCurrentQuery
            );


            if (
                append &&
                youtubeNextPageToken
            ) {

                params.set(
                    'pageToken',
                    youtubeNextPageToken
                );
            }


            const response =
                await fetch(
                    `/api/youtube/search?${params.toString()}`
                );


            if (!response.ok) {

                throw new Error(
                    `YouTube search failed: ${response.status}`
                );
            }


            const data =
                await response.json();


            if (!append) {
                youtubeResults.innerHTML = '';
            }


            appendYouTubeResults(
                data.results ?? []
            );


            youtubeNextPageToken =
                data.nextPageToken;


            youtubeLoadMore.hidden =
                !youtubeNextPageToken;


        } catch (error) {

            console.error(
                '[MusicPlayer] YouTube search failed:',
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

        updateStationMenu();
    }


    /* --------------------------------------------------
       INFORMACIÓN DEL TRACK
    -------------------------------------------------- */

    function updateTrackInfo(): void {

        const state =
            audioPlayer.getState();

        const source =
            state.source;

        if (!source) {

            player.classList.remove(
                'is-radio',
                'is-track'
            );

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
    }


    function updateTrackMarquee(): void {

        trackTitle.classList.remove(
            'is-marquee'
        );

        trackTitle.style.removeProperty(
            '--music-player-title-overflow'
        );

        trackTitle.style.removeProperty(
            '--music-player-marquee-duration'
        );

        const overflow =
            trackTitle.scrollWidth -
            trackTitleWrapper.clientWidth;

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

        trackTitle.style.setProperty(
            '--music-player-title-overflow',
            `${distance}px`
        );

        trackTitle.style.setProperty(
            '--music-player-marquee-duration',
            `${duration}s`
        );

        trackTitle.classList.add(
            'is-marquee'
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


    audioPlayer.subscribe(
        updateUI
    );

    youtubePlayer.subscribe(
        updateUI
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
       STOP
    -------------------------------------------------- */

    stopButton.addEventListener(
        'click',
        () => {

            audioPlayer.stop();
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
}


document.addEventListener(
    'astro:page-load',
    initializeMusicPlayer
);
