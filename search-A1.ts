import {
    getAlbumTracks,
    getArtistTop,
    getMusicApiNext,
    getPlaylistTracks,
    searchAlbums,
    searchArtists,
    searchGlobal,
    searchPlaylists,
    searchTracks,
} from '../music/music-service';

import type {
    MusicGlobalSearchCategory,
    MusicGlobalSearchResponse,
} from '../music/music-service';

import type {
    MusicAlbum,
    MusicApiCollection,
    MusicArtist,
    MusicPlaylist,
    MusicSearchResponse,
    MusicTrack,
} from '../music/music-types';

import type {
    MusicSearchController,
    PlaybackListSource,
} from './types';


type SearchCategory =
    | 'all'
    | MusicGlobalSearchCategory;


interface CategoryState<T> {

    data:
        T[];

    total:
        number;

    next:
        string | null;

    pageCount:
        number;

    loading:
        boolean;
}


interface SearchControllerOptions {

    resultsContainer:
        HTMLElement;

    loader:
        HTMLElement;

    searchForm:
        HTMLFormElement;

    searchInput:
        HTMLInputElement;

    categoryTabs:
        HTMLElement;

    activateSearchTab:
        () => void;

    onTrackSelected:
        (
            track:
                MusicTrack,
            source:
                PlaybackListSource
        ) => void;

    onTrackListSelected:
        (
            tracks:
                MusicTrack[],
            source:
                PlaybackListSource,
            next:
                string | null,
            total:
                number
        ) => void;

    formatDuration:
        (
            seconds:
                number
        ) => string;

    maxPages:
        number;
}


const CATEGORY_ORDER:
    MusicGlobalSearchCategory[] = [
        'tracks',
        'artists',
        'albums',
        'playlists',
    ];


const CATEGORY_LABELS:
    Record<
        MusicGlobalSearchCategory,
        string
    > = {

    tracks:
        'CANCIONES',

    artists:
        'ARTISTAS',

    albums:
        'ÁLBUMES',

    playlists:
        'PLAYLISTS',
};


function createCategoryState<T>():
    CategoryState<T> {

    return {

        data:
            [],

        total:
            0,

        next:
            null,

        pageCount:
            0,

        loading:
            false,
    };
}


export function createSearchController(
    options:
        SearchControllerOptions
):
    MusicSearchController {

    const {
        resultsContainer,
        loader,
        searchForm,
        searchInput,
        categoryTabs,
        activateSearchTab,
        onTrackSelected,
        onTrackListSelected,
        formatDuration,
        maxPages,
    } =
        options;


    let activeCategory:
        SearchCategory =
        'all';


    let searchQuery =
        '';


    let searchRequestId =
        0;


    let contextRequestId =
        0;


    let searchLoading =
        false;


    let searchObserver:
        IntersectionObserver | null =
        null;


    const states = {

        tracks:
            createCategoryState<
                MusicTrack
            >(),

        artists:
            createCategoryState<
                MusicArtist
            >(),

        albums:
            createCategoryState<
                MusicAlbum
            >(),

        playlists:
            createCategoryState<
                MusicPlaylist
            >(),
    };


    function getState(
        category:
            MusicGlobalSearchCategory
    ):
        CategoryState<any> {

        return states[
            category
        ];
    }


    function sourceForCategory(
        category:
            MusicGlobalSearchCategory
    ):
        PlaybackListSource {

        switch (
            category
        ) {

            case 'tracks':
                return 'search-tracks-queue';

            case 'artists':
                return 'search-artist';

            case 'albums':
                return 'search-album';

            case 'playlists':
                return 'search-playlist';
        }
    }


    function updateLoader(
        visible:
            boolean
    ):
        void {

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


    function stopInfiniteScroll():
        void {

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


    function resetStates():
        void {

        states.tracks =
            createCategoryState<
                MusicTrack
            >();

        states.artists =
            createCategoryState<
                MusicArtist
            >();

        states.albums =
            createCategoryState<
                MusicAlbum
            >();

        states.playlists =
            createCategoryState<
                MusicPlaylist
            >();
    }


    function clearCategoryTabs():
        void {

        categoryTabs.innerHTML = '';

        categoryTabs.hidden =
            true;
    }


    function renderCategoryTabs(
        available:
            MusicGlobalSearchCategory[]
    ):
        void {

        categoryTabs.innerHTML = '';

        if (
            available.length ===
            0
        ) {

            categoryTabs.hidden =
                true;

            return;
        }


        categoryTabs.hidden =
            false;


        const allButton =
            document.createElement(
                'button'
            );

        allButton.type =
            'button';

        allButton.className =
            'music-player-search-tab';

        allButton.dataset.musicSearchTab =
            'all';

        allButton.setAttribute(
            'role',
            'tab'
        );

        allButton.setAttribute(
            'aria-selected',
            String(
                activeCategory ===
                'all'
            )
        );

        allButton.textContent =
            'TODOS';

        allButton.classList.toggle(
            'is-active',
            activeCategory ===
                'all'
        );

        categoryTabs.appendChild(
            allButton
        );


        CATEGORY_ORDER.forEach(
            category => {

                if (
                    !available.includes(
                        category
                    )
                ) {
                    return;
                }


                const button =
                    document.createElement(
                        'button'
                    );

                button.type =
                    'button';

                button.className =
                    'music-player-search-tab';

                button.dataset.musicSearchTab =
                    category;

                button.setAttribute(
                    'role',
                    'tab'
                );

                button.setAttribute(
                    'aria-selected',
                    String(
                        activeCategory ===
                        category
                    )
                );

                button.textContent =
                    CATEGORY_LABELS[
                        category
                    ];

                button.classList.toggle(
                    'is-active',
                    activeCategory ===
                        category
                );

                categoryTabs.appendChild(
                    button
                );
            }
        );
    }


    function updateActiveTab():
        void {

        const buttons =
            categoryTabs.querySelectorAll<HTMLButtonElement>(
                '[data-music-search-tab]'
            );

        buttons.forEach(
            button => {

                const isActive =
                    button.dataset.musicSearchTab ===
                    activeCategory;

                button.classList.toggle(
                    'is-active',
                    isActive
                );

                button.setAttribute(
                    'aria-selected',
                    String(
                        isActive
                    )
                );
            }
        );
    }


    function appendTrackRow(
        track:
            MusicTrack,
        index:
            number,
        source:
            PlaybackListSource,
        parent:
            HTMLElement
    ):
        void {

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
            'music-player-youtube-result-thumbnail';

        thumbnail.src =
            track.album.cover;

        thumbnail.alt =
            `${track.title} - portada`;

        thumbnail.loading =
            'lazy';


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

                onTrackSelected(
                    track,
                    source
                );
            }
        );


        parent.appendChild(
            item
        );
    }


    function appendArtistRow(
        artist:
            MusicArtist,
        index:
            number,
        source:
            PlaybackListSource,
        parent:
            HTMLElement
    ):
        void {

        const item =
            document.createElement(
                'button'
            );

        item.type =
            'button';

        item.className =
            'music-player-search-entity';

        item.dataset.searchEntity =
            'artist';


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


        const image =
            document.createElement(
                'img'
            );

        image.className =
            'music-player-search-entity-image';

        image.src =
            artist.picture ??
            '';

        image.alt =
            `${artist.name} - artista`;

        image.loading =
            'lazy';


        const info =
            document.createElement(
                'span'
            );

        info.className =
            'music-player-search-entity-info';


        const title =
            document.createElement(
                'span'
            );

        title.className =
            'music-player-search-entity-title';

        title.textContent =
            artist.name;


        const meta =
            document.createElement(
                'span'
            );

        meta.className =
            'music-player-search-entity-meta';

        meta.textContent =
            'ARTISTA';


        info.appendChild(
            title
        );

        info.appendChild(
            meta
        );


        item.appendChild(
            number
        );

        item.appendChild(
            image
        );

        item.appendChild(
            info
        );


        item.addEventListener(
            'click',
            () => {

                void selectEntity(
                    'artists',
                    artist.id,
                    source,
                    item
                );
            }
        );


        parent.appendChild(
            item
        );
    }


    function appendAlbumRow(
        album:
            MusicAlbum,
        index:
            number,
        source:
            PlaybackListSource,
        parent:
            HTMLElement
    ):
        void {

        const item =
            document.createElement(
                'button'
            );

        item.type =
            'button';

        item.className =
            'music-player-search-entity';

        item.dataset.searchEntity =
            'album';


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


        const image =
            document.createElement(
                'img'
            );

        image.className =
            'music-player-search-entity-image';

        image.src =
            album.cover;

        image.alt =
            `${album.title} - portada`;

        image.loading =
            'lazy';


        const info =
            document.createElement(
                'span'
            );

        info.className =
            'music-player-search-entity-info';


        const title =
            document.createElement(
                'span'
            );

        title.className =
            'music-player-search-entity-title';

        title.textContent =
            album.title;


        const meta =
            document.createElement(
                'span'
            );

        meta.className =
            'music-player-search-entity-meta';

        meta.textContent =
            album.artist?.name ||
            'ARTISTA DESCONOCIDO';


        info.appendChild(
            title
        );

        info.appendChild(
            meta
        );


        item.appendChild(
            number
        );

        item.appendChild(
            image
        );

        item.appendChild(
            info
        );


        item.addEventListener(
            'click',
            () => {

                void selectEntity(
                    'albums',
                    album.id,
                    source,
                    item
                );
            }
        );


        parent.appendChild(
            item
        );
    }


    function appendPlaylistRow(
        playlist:
            MusicPlaylist,
        index:
            number,
        source:
            PlaybackListSource,
        parent:
            HTMLElement
    ):
        void {

        const item =
            document.createElement(
                'button'
            );

        item.type =
            'button';

        item.className =
            'music-player-search-entity';

        item.dataset.searchEntity =
            'playlist';


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


        const image =
            document.createElement(
                'img'
            );

        image.className =
            'music-player-search-entity-image';

        image.src =
            playlist.picture ??
            '';

        image.alt =
            `${playlist.title} - playlist`;

        image.loading =
            'lazy';


        const info =
            document.createElement(
                'span'
            );

        info.className =
            'music-player-search-entity-info';


        const title =
            document.createElement(
                'span'
            );

        title.className =
            'music-player-search-entity-title';

        title.textContent =
            playlist.title;


        const meta =
            document.createElement(
                'span'
            );

        meta.className =
            'music-player-search-entity-meta';

        meta.textContent =
            playlist.user?.name
                ? `${playlist.user.name} · ${playlist.nb_tracks ?? 0} pistas`
                : `${playlist.nb_tracks ?? 0} pistas`;


        info.appendChild(
            title
        );

        info.appendChild(
            meta
        );


        item.appendChild(
            number
        );

        item.appendChild(
            image
        );

        item.appendChild(
            info
        );


        item.addEventListener(
            'click',
            () => {

                void selectEntity(
                    'playlists',
                    playlist.id,
                    source,
                    item
                );
            }
        );


        parent.appendChild(
            item
        );
    }


    function appendCategoryRows(
        category:
            MusicGlobalSearchCategory,
        data:
            any[],
        source:
            PlaybackListSource,
        parent:
            HTMLElement,
        offset = 0
    ):
        void {

        data.forEach(
            (
                item,
                localIndex
            ) => {

                const index =
                    offset +
                    localIndex;


                switch (
                    category
                ) {

                    case 'tracks':

                        appendTrackRow(
                            item as MusicTrack,
                            index,
                            source,
                            parent
                        );

                        break;


                    case 'artists':

                        appendArtistRow(
                            item as MusicArtist,
                            index,
                            source,
                            parent
                        );

                        break;


                    case 'albums':

                        appendAlbumRow(
                            item as MusicAlbum,
                            index,
                            source,
                            parent
                        );

                        break;


                    case 'playlists':

                        appendPlaylistRow(
                            item as MusicPlaylist,
                            index,
                            source,
                            parent
                        );

                        break;
                }
            }
        );
    }


    function createSearchSection(
        category:
            MusicGlobalSearchCategory,
        parent:
            HTMLElement
    ):
        void {

        const state =
            getState(
                category
            );


        const section =
            document.createElement(
                'section'
            );

        section.className =
            'music-player-search-section';

        section.dataset.searchCategory =
            category;


        const header =
            document.createElement(
                'div'
            );

        header.className =
            'music-player-search-section-header';


        const title =
            document.createElement(
                'span'
            );

        title.className =
            'music-player-search-section-title';

        title.textContent =
            CATEGORY_LABELS[
                category
            ];


        const count =
            document.createElement(
                'span'
            );

        count.className =
            'music-player-search-section-count';

        count.textContent =
            String(
                state.total
            );


        header.appendChild(
            title
        );

        header.appendChild(
            count
        );


        if (
            state.total >
            state.data.length
        ) {

            const viewAll =
                document.createElement(
                    'button'
                );

            viewAll.type =
                'button';

            viewAll.className =
                'music-player-search-view-all';

            viewAll.dataset.searchViewAll =
                category;

            viewAll.textContent =
                'VER TODO';

            header.appendChild(
                viewAll
            );
        }


        const list =
            document.createElement(
                'div'
            );

        list.className =
            'music-player-search-section-list';


        appendCategoryRows(
            category,
            state.data.slice(
                0,
                5
            ),
            'search-all',
            list
        );


        section.appendChild(
            header
        );

        section.appendChild(
            list
        );


        parent.appendChild(
            section
        );
    }


    function renderAll():
        void {

        stopInfiniteScroll();

        resultsContainer.innerHTML =
            '';


        for (
            const category
            of CATEGORY_ORDER
        ) {

            const buttons =
                categoryTabs.querySelector(
                    `[data-music-search-tab="${category}"]`
                );

            if (
                !buttons
            ) {
                continue;
            }


            if (
                getState(
                    category
                ).data.length ===
                0
            ) {
                continue;
            }


            createSearchSection(
                category,
                resultsContainer
            );
        }


        resultsContainer.appendChild(
            loader
        );


        updateLoader(
            false
        );
    }


    function getActiveSectionList():
        HTMLElement | null {

        if (
            activeCategory ===
            'all'
        ) {

            return null;
        }


        const section =
            resultsContainer.querySelector<HTMLElement>(
                `[data-search-category="${activeCategory}"]`
            );

        if (
            !section
        ) {
            return null;
        }


        return section.querySelector<HTMLElement>(
            '.music-player-search-section-list'
        );
    }


    function renderActiveCategory():
        void {

        stopInfiniteScroll();

        resultsContainer.innerHTML =
            '';


        if (
            activeCategory ===
            'all'
        ) {

            renderAll();

            return;
        }


        const state =
            getState(
                activeCategory
            );


        const section =
            document.createElement(
                'section'
            );

        section.className =
            'music-player-search-section';

        section.dataset.searchCategory =
            activeCategory;


        const header =
            document.createElement(
                'div'
            );

        header.className =
            'music-player-search-section-header';


        const title =
            document.createElement(
                'span'
            );

        title.className =
            'music-player-search-section-title';

        title.textContent =
            CATEGORY_LABELS[
                activeCategory
            ];


        const count =
            document.createElement(
                'span'
            );

        count.className =
            'music-player-search-section-count';

        count.textContent =
            String(
                state.total
            );


        header.appendChild(
            title
        );

        header.appendChild(
            count
        );


        const list =
            document.createElement(
                'div'
            );

        list.className =
            'music-player-search-section-list';


        appendCategoryRows(
            activeCategory,
            state.data,
            sourceForCategory(
                activeCategory
            ),
            list
        );


        section.appendChild(
            header
        );

        section.appendChild(
            list
        );


        resultsContainer.appendChild(
            section
        );

        resultsContainer.appendChild(
            loader
        );


        setupInfiniteScroll();
    }


    function canLoadMore():
        boolean {

        if (
            activeCategory ===
            'all'
        ) {
            return false;
        }


        const state =
            getState(
                activeCategory
            );


        return (
            state.total >
                state.data.length &&
            state.pageCount <
                maxPages &&
            state.next !==
                ''
        );
    }


    function setupInfiniteScroll():
        void {

        stopInfiniteScroll();


        if (
            !canLoadMore()
        ) {

            return;
        }


        searchObserver =
            new IntersectionObserver(
                entries => {

                    if (
                        !entries.some(
                            entry =>
                                entry.isIntersecting
                        )
                    ) {
                        return;
                    }


                    if (
                        searchLoading
                    ) {
                        return;
                    }


                    void loadMoreCategory();
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


    async function loadMoreCategory():
        Promise<void> {

        if (
            activeCategory ===
            'all'
        ) {
            return;
        }


        const category =
            activeCategory;

        const state =
            getState(
                category
            );


        if (
            state.loading ||
            state.total <=
                state.data.length ||
            state.pageCount >=
                maxPages
        ) {

            setupInfiniteScroll();

            return;
        }


        state.loading =
            true;

        searchLoading =
            true;

        updateLoader(
            true
        );


        const requestId =
            searchRequestId;


        try {

            let response:
                MusicSearchResponse<any>;


            /*
             * PRIMERA PÁGINA ESPECÍFICA
             *
             * El global ya nos dio los primeros
             * 5 elementos. Continuamos desde ahí.
             */
            if (
                state.pageCount ===
                    1
            ) {

                const index =
                    state.data.length;


                switch (
                    category
                ) {

                    case 'tracks':

                        response =
                            await searchTracks(
                                searchQuery,
                                index,
                                10
                            );

                        break;


                    case 'artists':

                        response =
                            await searchArtists(
                                searchQuery,
                                index,
                                10
                            );

                        break;


                    case 'albums':

                        response =
                            await searchAlbums(
                                searchQuery,
                                index,
                                10
                            );

                        break;


                    case 'playlists':

                        response =
                            await searchPlaylists(
                                searchQuery,
                                index,
                                10
                            );

                        break;
                }

            } else {

                if (
                    !state.next
                ) {
                    return;
                }


                response =
                    await getMusicApiNext<
                        MusicSearchResponse<any>
                    >(
                        state.next
                    );
            }


            if (
                requestId !==
                    searchRequestId ||
                activeCategory !==
                    category
            ) {
                return;
            }


            if (
                response.status !==
                'success'
            ) {

                throw new Error(
                    'Search category request failed.'
                );
            }


            const existingIds =
                new Set(
                    state.data.map(
                        item =>
                            item.id
                    )
                );


            const newItems =
                (
                    response.data ??
                    []
                ).filter(
                    item =>
                        !existingIds.has(
                            item.id
                        )
                );


            const startIndex =
                state.data.length;


            state.data.push(
                ...newItems
            );


            state.next =
                response.next ??
                null;

            state.total =
                response.total ??
                state.total;

            state.pageCount +=
                1;


            const list =
                getActiveSectionList();


            if (
                list &&
                newItems.length > 0
            ) {

                appendCategoryRows(
                    category,
                    newItems,
                    sourceForCategory(
                        category
                    ),
                    list,
                    startIndex
                );
            }


            if (
                state.data.length >=
                    state.total ||
                !state.next ||
                state.pageCount >=
                    maxPages
            ) {

                stopInfiniteScroll();

            } else {

                setupInfiniteScroll();
            }

        } catch (
            error
        ) {

            console.error(
                '[MusicPlayer] Search pagination failed:',
                error
            );

            stopInfiniteScroll();

        } finally {

            state.loading =
                false;

            searchLoading =
                false;

            updateLoader(
                false
            );
        }
    }



    async function selectEntity(
        category:
            'artists'
            | 'albums'
            | 'playlists',
        id:
            number,
        source:
            PlaybackListSource,
        button:
            HTMLButtonElement
    ):
        Promise<void> {

        if (
            button.disabled
        ) {
            return;
        }


        const requestId =
            ++contextRequestId;


        button.disabled =
            true;

        button.classList.add(
            'is-loading'
        );


        try {

            let response:
                MusicApiCollection<
                    MusicTrack
                >;


            switch (
                category
            ) {

                case 'artists':

                    response =
                        await getArtistTop(
                            id
                        );

                    break;


                case 'albums':

                    response =
                        await getAlbumTracks(
                            id
                        );

                    break;


                case 'playlists':

                    response =
                        await getPlaylistTracks(
                            id
                        );

                    break;
            }


            if (
                requestId !==
                    contextRequestId
            ) {
                return;
            }


            if (
                response.status !==
                'success'
            ) {

                throw new Error(
                    'Search context request failed.'
                );
            }


            const tracks =
                response.data ??
                [];


            if (
                tracks.length ===
                0
            ) {

                throw new Error(
                    'The selected item has no tracks.'
                );
            }


            if (
                requestId !==
                    contextRequestId
            ) {
                return;
            }


            onTrackListSelected(
                tracks,
                source,
                response.next ??
                    null,
                response.total ??
                    tracks.length
            );

        } catch (
            error
        ) {

            console.error(
                '[MusicPlayer] Search context failed:',
                error
            );

        } finally {

            button.disabled =
                false;

            button.classList.remove(
                'is-loading'
            );
        }
    }


    async function search(
        query:
            string
    ):
        Promise<void> {

        const normalizedQuery =
            query.trim();


        if (
            !normalizedQuery
        ) {
            return;
        }


        activateSearchTab();


        const requestId =
            ++searchRequestId;


        ++contextRequestId;


        searchQuery =
            normalizedQuery;


        activeCategory =
            'all';


        searchLoading =
            true;


        stopInfiniteScroll();

        resetStates();

        clearCategoryTabs();

        updateLoader(
            true
        );


        searchInput.disabled =
            true;


        resultsContainer.innerHTML =
            `
                <div class="music-player-youtube-loading">
                    BUSCANDO...
                </div>
            `;

        resultsContainer.appendChild(
            loader
        );


        try {

            const response =
                await searchGlobal(
                    normalizedQuery
                );


            if (
                requestId !==
                searchRequestId
            ) {
                return;
            }


            if (
                response.status !==
                    'success' &&
                response.status !==
                    'partial' &&
                response.status !==
                    'not_found'
            ) {

                throw new Error(
                    'Global search failed.'
                );
            }


            for (
                const category
                of CATEGORY_ORDER
            ) {

                const state =
                    getState(
                        category
                    );

                const preview =
                    response[
                        category
                    ];


                state.data =
                    preview.data ??
                    [];

                state.total =
                    preview.total ??
                    0;

                state.next =
                    null;

                state.pageCount =
                    state.data.length > 0
                        ? 1
                        : 0;
            }


            renderCategoryTabs(
                response.available
            );


            if (
                response.available.length ===
                    0
            ) {

                resultsContainer.innerHTML =
                    `
                        <div class="music-player-youtube-loading">
                            SIN RESULTADOS
                        </div>
                    `;

                resultsContainer.appendChild(
                    loader
                );

                updateLoader(
                    false
                );

                return;
            }


            renderActiveCategory();

        } catch (
            error
        ) {

            if (
                requestId !==
                searchRequestId
            ) {
                return;
            }


            console.error(
                '[MusicPlayer] Global search failed:',
                error
            );


            clearCategoryTabs();


            resultsContainer.innerHTML =
                `
                    <div class="music-player-youtube-error">
                        NO SE PUDIERON CARGAR LOS RESULTADOS
                    </div>
                `;

            resultsContainer.appendChild(
                loader
            );

        } finally {

            if (
                requestId ===
                searchRequestId
            ) {

                searchLoading =
                    false;

                searchInput.disabled =
                    false;

                updateLoader(
                    false
                );
            }
        }
    }


    function clear():
        void {

        ++searchRequestId;

        ++contextRequestId;


        stopInfiniteScroll();

        resetStates();

        searchQuery =
            '';

        activeCategory =
            'all';

        searchLoading =
            false;


        searchInput.disabled =
            false;


        clearCategoryTabs();


        resultsContainer.innerHTML =
            `
                <div class="music-player-youtube-loading">
                    BUSCA CANCIONES, ARTISTAS, ÁLBUMES O PLAYLISTS
                </div>
            `;

        resultsContainer.appendChild(
            loader
        );


        updateLoader(
            false
        );
    }


    categoryTabs.addEventListener(
        'click',
        event => {

            const target =
                event.target;


            if (
                !(
                    target instanceof
                    HTMLElement
                )
            ) {
                return;
            }


            const button =
                target.closest<HTMLButtonElement>(
                    '[data-music-search-tab]'
                );


            if (
                !button
            ) {
                return;
            }


            const category =
                button.dataset
                    .musicSearchTab as
                    SearchCategory
                    | undefined;


            if (
                !category
            ) {
                return;
            }


            activeCategory =
                category;


            updateActiveTab();


            renderActiveCategory();
        }
    );


    resultsContainer.addEventListener(
        'click',
        event => {

            const target =
                event.target;


            if (
                !(
                    target instanceof
                    HTMLElement
                )
            ) {
                return;
            }


            const viewAll =
                target.closest<HTMLButtonElement>(
                    '[data-search-view-all]'
                );


            if (
                !viewAll
            ) {
                return;
            }


            const category =
                viewAll.dataset
                    .searchViewAll as
                    SearchCategory
                    | undefined;


            if (
                !category ||
                category ===
                    'all'
            ) {
                return;
            }


            activeCategory =
                category;


            updateActiveTab();


            renderActiveCategory();
        }
    );


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


            void search(
                query
            );
        }
    );


    clear();


    return {

        search,

        getTracks:
            () =>
                states.tracks.data,

        clear,

        stop:
            stopInfiniteScroll,
    };
}
