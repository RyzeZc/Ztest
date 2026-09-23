import {
    getChart,
    getGenres,
} from '../music/music-service';

import type {
    MusicAlbum,
    MusicChart,
    MusicGenre,
    MusicPlaylist,
    MusicTrack,
} from '../music/music-types';

import type {
    HomeSection,
    MusicHomeController,
    HomeDetailRoute,
} from './types';


interface HomeControllerOptions {

    homeSections:
        HTMLElement[];

    formatTime:
        (
            seconds: number
        ) => string;

    onTrackSelected:
        (
            track: MusicTrack,
            playbackList: MusicTrack[]
        ) => void;

    updateTrackPlaybackIndicators:
        () => void;

    openHomeDetail:
        (
            route: HomeDetailRoute
        ) => void;
}


type HomeLoadState =
    | 'idle'
    | 'loading'
    | 'loaded'
    | 'error';


export function createHomeController(
    options:
        HomeControllerOptions
): MusicHomeController {

    const {
        homeSections,
        formatTime,
        onTrackSelected,
        updateTrackPlaybackIndicators,
        openHomeDetail,
    } = options;


    /*
     * --------------------------------------------------
     * ESTADO DE CARGA
     * --------------------------------------------------
     */

    const homeLoadState:
        Record<
            HomeSection,
            HomeLoadState
        > = {

        trending:
            'idle',

        discover:
            'idle',

        playlist:
            'idle',

        genres:
            'idle',

        stations:
            'idle',
    };


    /*
     * --------------------------------------------------
     * HELPERS DOM
     * --------------------------------------------------
     */

    function getHomeSectionElement(
        section:
            HomeSection
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


    /*
     * --------------------------------------------------
     * HOME CHART CACHE
     * --------------------------------------------------
     *
     * Se conserva exactamente la lógica actual:
     *
     * - una petición real
     * - Promise compartida si varias secciones
     *   la solicitan al mismo tiempo
     * - resultado mantenido en memoria
     *
     * El cache persistente con TTL vendrá después.
     */

    let homeChartCache:
        MusicChart | null =
        null;


    let homeChartPromise:
        Promise<MusicChart> | null =
        null;


    async function getHomeChartData():
        Promise<MusicChart> {

        if (
            homeChartCache
        ) {

            return homeChartCache;
        }


        if (
            homeChartPromise
        ) {

            return homeChartPromise;
        }


        homeChartPromise =
            (async (): Promise<
                MusicChart
            > => {

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


    /*
     * --------------------------------------------------
     * ERROR HOME
     * --------------------------------------------------
     */

    function renderHomeError(
        section:
            HomeSection,

        message:
            string
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

            list.innerHTML =
                `
                    <div class="music-player-youtube-error">
                        ${message}
                    </div>
                `;

            return;
        }


        element.innerHTML =
            `
                <div class="music-player-home-placeholder">
                    ${message}
                </div>
            `;
    }


    /*
     * ==================================================
     * TENDENCIAS
     * ==================================================
     */

    async function loadTrending():
        Promise<void> {

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
                section,
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
        section:
            HTMLElement,

        tracks:
            MusicTrack[]
    ): void {

        const list =
            section.querySelector(
                '.music-player-trending-list'
            );


        if (
            !(list instanceof HTMLElement)
        ) {

            return;
        }


        list.innerHTML =
            '';


        if (
            tracks.length ===
            0
        ) {

            list.innerHTML =
                `
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


                item.dataset.trendingIndex =
                    String(
                        index
                    );


                item.addEventListener(
                    'click',
                    () => {

                        onTrackSelected(
                            track,
                            tracks
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


    /*
     * ==================================================
     * DESCUBRE
     * ==================================================
     */

    async function loadDiscover():
        Promise<void> {

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


        section.innerHTML =
            `
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


            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO SE PUDIERON CARGAR LOS LANZAMIENTOS
                    </div>
                `;
        }
    }


    function formatReleaseDate(
        date:
            string
    ): string {

        const parsed =
            new Date(
                date
            );


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
                day:
                    '2-digit',

                month:
                    'short',

                year:
                    'numeric',
            }
        );
    }


    function getAlbumArtistsText(
        album:
            MusicAlbum
    ): string {

        return (
            album.artist?.name ||
            'ARTISTA DESCONOCIDO'
        );
    }


    function renderDiscover(
        section:
            HTMLElement,

        albums:
            MusicAlbum[]
    ): void {

        if (
            albums.length ===
            0
        ) {

            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO HAY NUEVOS LANZAMIENTOS
                    </div>
                `;

            return;
        }


        section.innerHTML =
            `
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

                card.dataset.playbackContextKey =
                    `album:${album.id}`;

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
                    album.release_date ?? ''
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


    /*
     * ==================================================
     * PLAYLIST
     * ==================================================
     */

    async function loadPlaylist():
        Promise<void> {

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


        if (
            !section
        ) {

            return;
        }


        homeLoadState.playlist =
            'loading';


        section.innerHTML =
            `
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


            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO SE PUDIERON CARGAR LAS PLAYLISTS
                    </div>
                `;
        }
    }


    function renderPlaylists(
        section:
            HTMLElement,

        playlists:
            MusicPlaylist[]
    ): void {

        if (
            playlists.length ===
            0
        ) {

            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO HAY PLAYLISTS DISPONIBLES
                    </div>
                `;

            return;
        }


        section.innerHTML =
            `
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

                card.dataset.playbackContextKey =
                    `playlist:${playlist.id}`;

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


    /*
     * ==================================================
     * GÉNEROS
     * ==================================================
     */

    async function loadGenres():
        Promise<void> {

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


        section.innerHTML =
            `
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


            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO SE PUDIERON CARGAR LOS GÉNEROS
                    </div>
                `;
        }
    }


    function renderGenres(
        section:
            HTMLElement,

        genres:
            MusicGenre[]
    ): void {

        if (
            genres.length ===
            0
        ) {

            section.innerHTML =
                `
                    <div class="music-player-home-placeholder">
                        NO HAY GÉNEROS DISPONIBLES
                    </div>
                `;

            return;
        }


        section.innerHTML =
            `
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

                card.dataset.playbackContextKey =
                    `genre:${genre.id}`;
                                    
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


    /*
     * ==================================================
     * PUBLIC CONTROLLER
     * ==================================================
     */

    function loadSection(
        section:
            HomeSection
    ): void {

        switch (
            section
        ) {

            case 'trending':
                void loadTrending();
                break;

            case 'discover':
                void loadDiscover();
                break;

            case 'playlist':
                void loadPlaylist();
                break;

            case 'genres':
                void loadGenres();
                break;

            case 'stations':
                /*
                 * Las emisoras se renderizan desde
                 * la lógica existente del reproductor.
                 *
                 * No tocamos ese comportamiento
                 * durante esta extracción.
                 */
                break;
        }
    }


    return {
        loadSection,
    };
}
