import {
    getMusicApiNext,
    searchTracks,
} from '../music/music-service';

import type {
    MusicSearchResponse,
    MusicTrack,
} from '../music/music-types';

import type {
    MusicSearchController,
} from './types';


interface SearchControllerOptions {

    resultsContainer:
        HTMLElement;

    loader:
        HTMLElement;

    searchForm:
        HTMLFormElement;

    searchInput:
        HTMLInputElement;

    activateSearchTab:
        () => void;

    onTrackSelected:
        (
            track: MusicTrack
        ) => void;

    formatDuration:
        (
            seconds: number
        ) => string;

    maxPages:
        number;
}


export function createSearchController(
    options:
        SearchControllerOptions
): MusicSearchController {

    const {
        resultsContainer,
        loader,
        searchForm,
        searchInput,
        activateSearchTab,
        onTrackSelected,
        formatDuration,
        maxPages,
    } = options;


    let tracks:
        MusicTrack[] = [];


    let searchQuery =
        '';


    let searchNext:
        string | null =
        null;


    let searchPageCount =
        0;


    let searchLoading =
        false;


    let searchObserver:
        IntersectionObserver | null =
        null;


    function updateLoader(
        visible: boolean
    ): void {

        const spinner =
            loader.querySelector<HTMLElement>(
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


    function stopInfiniteScroll(): void {

        if (
            searchObserver
        ) {

            searchObserver.disconnect();

            searchObserver =
                null;
        }


        updateLoader(
            false
        );
    }


    function setupInfiniteScroll():
        void {

        stopInfiniteScroll();


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

                        stopInfiniteScroll();

                        return;
                    }


                    if (
                        searchPageCount >=
                        maxPages
                    ) {

                        stopInfiniteScroll();

                        return;
                    }


                    void loadMoreResults();
                },
                {
                    root:
                        resultsContainer,

                    rootMargin:
                        '0px 0px 250px 0px',

                    threshold:
                        0,
                }
            );


        searchObserver.observe(
            loader
        );
    }


    function appendResults(
        newTracks:
            MusicTrack[]
    ): void {

        newTracks.forEach(
            track => {

                const item =
                    document.createElement(
                        'button'
                    );


                item.type =
                    'button';


                item.className =
                    'music-player-youtube-result';


                item.dataset.trackId =
                    String(
                        track.id
                    );


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
                        tracks.findIndex(
                            currentTrack =>
                                currentTrack.id ===
                                track.id
                        ) + 1
                    );


                /*
                 * --------------------------------------------------
                 * COVER
                 * --------------------------------------------------
                 */

                const thumbnail =
                    document.createElement(
                        'img'
                    );


                thumbnail.className =
                    'music-player-youtube-result-thumbnail';


                thumbnail.src =
                    track.album.cover;


                thumbnail.alt =
                    `${track.title} - portada`;


                /*
                 * --------------------------------------------------
                 * TÍTULO / ARTISTA
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
                    track.title;


                const artist =
                    document.createElement(
                        'span'
                    );


                artist.className =
                    'music-player-youtube-result-channel';


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
                 * --------------------------------------------------
                 * DURACIÓN
                 * --------------------------------------------------
                 */

                const duration =
                    document.createElement(
                        'span'
                    );


                duration.className =
                    'music-player-list-column-duration';


                duration.textContent =
                    formatDuration(
                        track.duration
                    );


                /*
                 * --------------------------------------------------
                 * FILA
                 * --------------------------------------------------
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
                 * --------------------------------------------------
                 * SELECCIÓN
                 * --------------------------------------------------
                 *
                 * Search no necesita conocer cómo
                 * funciona playback.
                 *
                 * Solo entrega el MusicTrack.
                 */

                item.addEventListener(
                    'click',
                    () => {

                        onTrackSelected(
                            track
                        );
                    }
                );


                resultsContainer.insertBefore(
                    item,
                    loader
                );
            }
        );
    }


    async function loadSearchPage(
        isInitialPage =
            false
    ): Promise<void> {

        if (
            searchLoading
        ) {
            return;
        }


        if (
            !isInitialPage &&
            (
                !searchNext ||
                searchPageCount >=
                    maxPages
            )
        ) {

            stopInfiniteScroll();

            return;
        }


        searchLoading =
            true;


        updateLoader(
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
             * La primera página elimina
             * BUSCANDO...
             */

            if (
                isInitialPage
            ) {

                resultsContainer
                    .querySelector(
                        '.music-player-youtube-loading'
                    )
                    ?.remove();
            }


            /*
             * Evitar duplicados
             * por Deezer ID.
             */

            const existingIds =
                new Set(
                    tracks.map(
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


            tracks.push(
                ...uniqueTracks
            );


            appendResults(
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
                        tracks.length,

                    next:
                        searchNext,
                }
            );


            if (
                !searchNext ||
                searchPageCount >=
                    maxPages
            ) {

                stopInfiniteScroll();
            }


        } catch (error) {

            console.error(
                '[MusicPlayer] Music search failed:',
                error
            );


            if (
                isInitialPage
            ) {

                resultsContainer.innerHTML =
                    `
                        <div class="music-player-youtube-error">
                            NO SE PUDO REALIZAR LA BÚSQUEDA
                        </div>
                    `;


                resultsContainer.appendChild(
                    loader
                );


            } else {

                /*
                 * Si falla una página adicional,
                 * conservamos todos los resultados
                 * que ya estaban visibles.
                 */

                console.error(
                    '[MusicPlayer] Additional search page failed.'
                );
            }


            stopInfiniteScroll();


        } finally {

            searchLoading =
                false;


            updateLoader(
                false
            );
        }
    }


    async function loadMoreResults():
        Promise<void> {

        if (
            !searchNext ||
            searchPageCount >=
                maxPages
        ) {

            stopInfiniteScroll();

            return;
        }


        await loadSearchPage(
            false
        );
    }


    async function search(
        query: string
    ): Promise<void> {

        const normalizedQuery =
            query.trim();


        if (
            !normalizedQuery
        ) {
            return;
        }


        searchQuery =
            normalizedQuery;


        searchNext =
            null;


        searchPageCount =
            0;


        tracks =
            [];


        searchLoading =
            false;


        resultsContainer.innerHTML =
            `
                <div class="music-player-youtube-loading">
                    BUSCANDO...
                </div>
            `;


        resultsContainer.appendChild(
            loader
        );


        setupInfiniteScroll();


        searchInput.disabled =
            true;


        try {

            await loadSearchPage(
                true
            );

        } finally {

            searchInput.disabled =
                false;
        }
    }


    function clear(): void {

        stopInfiniteScroll();


        tracks =
            [];


        searchQuery =
            '';


        searchNext =
            null;


        searchPageCount =
            0;


        searchLoading =
            false;


        resultsContainer.innerHTML =
            '';


        resultsContainer.appendChild(
            loader
        );
    }


    searchForm.addEventListener(
        'submit',
        event => {

            event.preventDefault();


            const query =
                searchInput.value.trim();


            if (
                !query
            ) {
                return;
            }


            activateSearchTab();

            void search(
                query
            );
        }
    );


    return {

        search,

        getTracks:
            () =>
                tracks,

        clear,

        stop:
            stopInfiniteScroll,
    };
}
