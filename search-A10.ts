import {
    getAlbum,
    getArtist,
    getArtistTop,
    getMusicApiNext,
    getPlaylist,
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

    preview:
        T[];

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

interface CategoryView {

    section:
        HTMLElement;

    previewList:
        HTMLElement;

    list:
        HTMLElement;

    loader:
        HTMLElement;

    viewAll:
        HTMLButtonElement;

    count:
        HTMLElement;

    renderedCount:
        number;
}

interface SearchPlaybackContext {

    key:
        string;

    type:
        | 'artist'
        | 'album'
        | 'playlist';

    label:
        string;

    title:
        string;

    subtitle:
        string;

    image:
        string | null;
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

    updateTrackPlaybackIndicators:
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
                number,
            context:
                SearchPlaybackContext
        ) => void;

    isPlaybackContextActive:
        (
            contextKey:
                string
        ) => boolean;

    toggleActivePlaybackContext:
        () => void;        

    formatDuration:
        (
            seconds:
                number
        ) => string;

    maxPages:
        number;
}

const GLOBAL_SEARCH_PREVIEW_LIMIT = 8;

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

        preview:
            [],

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
        isPlaybackContextActive,
        toggleActivePlaybackContext,
        updateTrackPlaybackIndicators,
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

    let categoryHasUserScrolled =
        false;

    let categoryScrollHandler:
        (() => void) | null =
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

    const categoryViews =
        new Map<
            MusicGlobalSearchCategory,
            CategoryView
        >();

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

        if (
            categoryScrollHandler
        ) {

            resultsContainer.removeEventListener(
                'scroll',
                categoryScrollHandler
            );

            categoryScrollHandler =
                null;
        }

        const activeView =
            categoryViews.get(
                activeCategory
            );

        if (
            activeView
        ) {

            updateCategoryLoader(
                activeView,
                false
            );
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

                const interactionSource =
                    activeCategory ===
                    'all'
                        ? 'search-all'
                        : source;

                onTrackSelected(
                    track,
                    interactionSource
                );
            }
        );

        parent.appendChild(
            item
        );
    }

    function createCardPlaybackIndicator():
        HTMLSpanElement {

        const indicator =
            document.createElement(
                'span'
            );

        indicator.className =
            'music-player-card-play-indicator';

        indicator.setAttribute(
            'aria-hidden',
            'true'
        );

        indicator.textContent =
            '▶';

        return indicator;
    }    

    function createCardCover(
        image:
            HTMLImageElement
    ):
        HTMLSpanElement {

        const cover =
            document.createElement(
                'span'
            );

        cover.className =
            'music-player-card-cover';

        cover.appendChild(
            image
        );

        cover.appendChild(
            createCardPlaybackIndicator()
        );

        return cover;
    }

    function formatArtistFans(
        fans:
            number | null | undefined
    ):
        string {

        if (
            fans === null ||
            fans === undefined ||
            !Number.isFinite(
                fans
            )
        ) {
            return '— fans';
        }

        const formatted =
            new Intl.NumberFormat(
                'es-PE',
                {
                    notation:
                        'compact',

                    maximumFractionDigits:
                        1,
                }
            ).format(
                fans
            );

        return `${formatted} fans`;
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
            'music-player-search-entity-card music-player-search-entity-card--artist';

        item.dataset.searchEntity =
            'artist';

        const contextKey =
            `artist:${artist.id}`;

        item.dataset.playbackContextKey =
            contextKey;

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
            formatArtistFans(
                artist.nb_fan
            );

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
            createCardCover(
                image
            )
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
                    'search-artist',
                    item,
                    {
                        key:
                            contextKey,

                        type:
                            'artist',

                        label:
                            'ARTISTA',

                        title:
                            artist.name,

                        subtitle:
                            'Cargando información del artista...',

                        image:
                            artist.picture ??
                            null,
                    }
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
            'music-player-search-entity-card music-player-search-entity-card--album';

        item.dataset.searchEntity =
            'album';

        const contextKey =
            `album:${album.id}`;

        item.dataset.playbackContextKey =
            contextKey;            

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
            createCardCover(
                image
            )
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
                    'search-album',
                    item,
                    {
                        key:
                            contextKey,

                        type:
                            'album',

                        label:
                            'ÁLBUM',

                        title:
                            album.title,

                        subtitle:
                            album.artist?.name ??
                            'ARTISTA DESCONOCIDO',

                        image:
                            album.cover ??
                            null,
                    }
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
            'music-player-search-entity-card music-player-search-entity-card--playlist';

        item.dataset.searchEntity =
            'playlist';

        const contextKey =
            `playlist:${playlist.id}`;

        item.dataset.playbackContextKey =
            contextKey;            

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
            createCardCover(
                image
            )
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
                    'search-playlist',
                    item,
                    {
                        key:
                            contextKey,

                        type:
                            'playlist',

                        label:
                            'PLAYLIST',

                        title:
                            playlist.title,

                        subtitle:
                            playlist.user?.name
                                ? `Por ${playlist.user.name}`
                                : `${playlist.nb_tracks ?? 0} pistas`,

                        image:
                            playlist.picture ??
                            null,
                    }
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

function createCategoryLoader():
    HTMLElement {

    const categoryLoader =
        loader.cloneNode(
            true
        ) as HTMLElement;

    categoryLoader.removeAttribute(
        'data-music-search-loader'
    );

    categoryLoader.classList.remove(
        'music-player-search-infinite-loader'
    );

    categoryLoader.classList.add(
        'music-player-search-category-loader'
    );

    categoryLoader.hidden =
        true;

    return categoryLoader;
}


function updateCategoryLoader(
    view:
        CategoryView,
    visible:
        boolean
):
    void {

    view.loader.hidden =
        !visible;

    const spinner =
        view.loader.querySelector<HTMLElement>(
            '.loading-spinner'
        );

    if (
        spinner instanceof HTMLElement
    ) {

        spinner.classList.toggle(
            'is-visible',
            visible &&
            getState(
                activeCategory
            ).loading
        );
    }
}

function ensureCategoryRows(
    category:
        MusicGlobalSearchCategory
):
    void {

    const state =
        getState(
            category
        );


    const view =
        categoryViews.get(
            category
        );


    if (
        !view
    ) {
        return;
    }


    if (
        view.renderedCount >=
        state.data.length
    ) {
        return;
    }


    const newItems =
        state.data.slice(
            view.renderedCount
        );


    appendCategoryRows(
        category,
        newItems,
        sourceForCategory(
            category
        ),
        view.list,
        view.renderedCount
    );


    view.renderedCount =
        state.data.length;
}

function createSearchSection(
    category:
        MusicGlobalSearchCategory
):
    CategoryView {

    const existing =
        categoryViews.get(
            category
        );

    if (
        existing
    ) {
        return existing;
    }


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

    viewAll.addEventListener(
        'click',
        () => {

            activeCategory =
                category;

            categoryHasUserScrolled =
                false;

            resultsContainer.scrollTop =
                0;

            updateActiveTab();

            renderActiveCategory();
        }
    );        

    header.appendChild(
        viewAll
    );


    /*
     * --------------------------------------------
     * PREVIEW — SOLO PARA TODOS
     *
     * Estos nodos nunca reciben las páginas
     * adicionales del infinite scroll.
     * --------------------------------------------
     */

    const previewList =
        document.createElement(
            'div'
        );

    previewList.className =
        category === 'tracks'
            ? 'music-player-search-preview-list'
            : 'music-player-search-preview-list music-player-search-entity-grid';


    appendCategoryRows(
        category,
        state.preview,
        sourceForCategory(
            category
        ),
        previewList
    );


    /*
     * --------------------------------------------
     * LISTA COMPLETA — PESTAÑA INDIVIDUAL
     * --------------------------------------------
     */

    const list =
        document.createElement(
            'div'
        );

    list.className =
        category === 'tracks'
            ? 'music-player-search-section-list'
            : 'music-player-search-section-list music-player-search-entity-grid';


    appendCategoryRows(
        category,
        state.data,
        sourceForCategory(
            category
        ),
        list
    );


    const categoryLoader =
        createCategoryLoader();


    section.appendChild(
        header
    );

    section.appendChild(
        previewList
    );

    section.appendChild(
        list
    );

    section.appendChild(
        categoryLoader
    );


    const view:
        CategoryView = {

        section,

        previewList,

        list,

        loader:
            categoryLoader,

        viewAll,

        count,

        renderedCount:
            state.data.length,
    };


    categoryViews.set(
        category,
        view
    );


    return view;
}

function updateSearchViews():
    void {

    stopInfiniteScroll();


    for (
        const category
        of CATEGORY_ORDER
    ) {

        const tab =
            categoryTabs.querySelector(
                `[data-music-search-tab="${category}"]`
            );

        if (
            !tab
        ) {
            continue;
        }


        const state =
            getState(
                category
            );


        if (
            state.data.length ===
            0
        ) {
            continue;
        }


        const view =
            createSearchSection(
                category
            );


        if (
            !resultsContainer.contains(
                view.section
            )
        ) {

            resultsContainer.appendChild(
                view.section
            );
        }


        ensureCategoryRows(
            category
        );


        const isVisible =
            activeCategory ===
                'all' ||
            activeCategory ===
                category;


        view.section.hidden =
            !isVisible;

        view.previewList.hidden =
            activeCategory !== 'all';

        view.list.hidden =
            activeCategory === 'all';

        view.viewAll.hidden =
            activeCategory !==
                'all' ||
            state.total <=
                5;


        view.count.textContent =
            String(
                state.total
            );
    }


    if (
        activeCategory ===
        'all'
    ) {

        updateTrackPlaybackIndicators();

        return;
    }


    armInfiniteScrollAfterUserScroll();

    updateTrackPlaybackIndicators();
}


function getActiveSectionList():
    HTMLElement | null {

    if (
        activeCategory ===
        'all'
    ) {

        return null;
    }


    return (
        categoryViews.get(
            activeCategory
        )?.list ??
        null
    );
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
            maxPages
    );
}

function getCategoryPreloadMargin():
    number {

    if (
        activeCategory ===
        'all'
    ) {
        return 0;
    }


    const view =
        categoryViews.get(
            activeCategory
        );


    if (
        !view
    ) {
        return 0;
    }


    const rows =
        Array.from(
            view.list.children
        ) as HTMLElement[];


    const lastTwoRows =
        rows.slice(
            -2
        );


    const height =
        lastTwoRows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.getBoundingClientRect().height,
            0
        );


    return Math.ceil(
        height
    );
}

function setupInfiniteScroll():
    void {

    stopInfiniteScroll();


    if (
        !categoryHasUserScrolled
    ) {
        return;
    }


    if (
        !canLoadMore()
    ) {
        return;
    }


    const view =
        categoryViews.get(
            activeCategory
        );


    if (
        !view
    ) {
        return;
    }


    const rows =
        Array.from(
            view.list.children
        ) as HTMLElement[];


    if (
        rows.length === 0
    ) {
        return;
    }


    /*
     * Observamos el tercer elemento desde
     * el final.
     *
     * Cuando entra en viewport quedan
     * aproximadamente dos resultados.
     */
    const triggerIndex =
        Math.max(
            0,
            rows.length - 3
        );


    const trigger =
        rows[
            triggerIndex
        ];


    if (
        !trigger
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


                const state =
                    getState(
                        activeCategory
                    );


                if (
                    state.loading
                ) {
                    return;
                }


                void loadMoreCategory();

            },
            {
                root:
                    resultsContainer,

                rootMargin:
                    `0px 0px ${getCategoryPreloadMargin()}px 0px`,

                threshold:
                    0,
            }
        );


    searchObserver.observe(
        trigger
    );
}

function armInfiniteScrollAfterUserScroll():
    void {

    if (
        activeCategory ===
        'all'
    ) {
        return;
    }


    if (
        categoryHasUserScrolled
    ) {
        return;
    }


    const handleScroll =
        () => {

            if (
                resultsContainer.scrollTop <=
                0
            ) {
                return;
            }


            categoryHasUserScrolled =
                true;


            resultsContainer.removeEventListener(
                'scroll',
                handleScroll
            );


            categoryScrollHandler =
                null;


            setupInfiniteScroll();
        };


    categoryScrollHandler =
        handleScroll;


    resultsContainer.addEventListener(
        'scroll',
        handleScroll,
        {
            passive:
                true,
        }
    );
}

function renderAll():
    void {

    updateSearchViews();
}


function renderActiveCategory():
    void {

    updateSearchViews();
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

        const view =
            categoryViews.get(
                category
            );

        if (
            !view
        ) {
            return;
        }        

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

        updateCategoryLoader(
            view,
            true
        );

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


            if (
                view
            ) {

                view.renderedCount =
                    state.data.length;

                view.count.textContent =
                    String(
                        state.total
                    );
            }
                            
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

            updateCategoryLoader(
                view,
                false
            );                

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
            HTMLButtonElement,
        context:
            SearchPlaybackContext
    ):
        Promise<void> {

        /*
        * --------------------------------------------
        * MISMO CONTEXTO
        *
        * No volvemos a pedir metadata ni tracks.
        * --------------------------------------------
        */

        if (
            isPlaybackContextActive(
                context.key
            )
        ) {

            toggleActivePlaybackContext();

            return;
        }


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

            let tracksResponse:
                MusicApiCollection<MusicTrack>;

            let metadata:
                MusicArtist
                | MusicAlbum
                | MusicPlaylist
                | null =
                null;


            switch (
                category
            ) {

                case 'artists': {

                    const [
                        tracksResult,
                        metadataResult,
                    ] =
                        await Promise.allSettled([

                            getArtistTop(
                                id
                            ),

                            getArtist(
                                id
                            ),
                        ]);


                    if (
                        tracksResult.status !==
                        'fulfilled'
                    ) {

                        throw tracksResult.reason;
                    }


                    tracksResponse =
                        tracksResult.value;


                    if (
                        metadataResult.status ===
                        'fulfilled'
                    ) {

                        metadata =
                            metadataResult.value;
                    }


                    break;
                }


                case 'albums': {

                    const album =
                        await getAlbum(
                            id
                        ) as MusicAlbum & {
                            tracks?: MusicApiCollection<MusicTrack>;
                        };


                    metadata =
                        album;


                    tracksResponse = {

                        ...album.tracks,

                        status:
                            'success',

                    } as MusicApiCollection<MusicTrack>;


                    break;
                }


                case 'playlists': {

                    const playlist =
                        await getPlaylist(
                            id
                        ) as MusicPlaylist & {
                            tracks?: MusicApiCollection<MusicTrack>;
                        };


                    metadata =
                        playlist;


                    tracksResponse = {

                        ...playlist.tracks,

                        status:
                            'success',

                    } as MusicApiCollection<MusicTrack>;


                    break;
                }
            }


            if (
                requestId !==
                contextRequestId
            ) {
                return;
            }


            if (
                tracksResponse.status !==
                'success'
            ) {

                throw new Error(
                    'Search context request failed.'
                );
            }


            const tracks =
                tracksResponse.data ??
                [];


            if (
                tracks.length ===
                0
            ) {

                throw new Error(
                    'The selected item has no tracks.'
                );
            }


            /*
            * --------------------------------------------
            * ENRIQUECER CONTEXTO
            * --------------------------------------------
            */

            let enrichedContext:
                SearchPlaybackContext =
                {
                    ...context,
                };


            if (
                category ===
                    'artists' &&
                metadata
            ) {

                const artist =
                    metadata as
                    MusicArtist & {
                        nb_album?:
                            number;

                        nb_fan?:
                            number;

                        picture?:
                            string;
                    };


                const info:
                    string[] = [];


                if (
                    Number.isFinite(
                        artist.nb_album
                    )
                ) {

                    info.push(
                        `${artist.nb_album} álbumes`
                    );
                }


                if (
                    Number.isFinite(
                        artist.nb_fan
                    )
                ) {

                    info.push(
                        `${Intl.NumberFormat(
                            'es-PE',
                            {
                                notation:
                                    'compact',

                                maximumFractionDigits:
                                    1,
                            }
                        ).format(
                            artist.nb_fan
                        )} fans`
                    );
                }


                enrichedContext = {

                    ...context,

                    title:
                        artist.name ??
                        context.title,

                    subtitle:
                        info.join(
                            ' · '
                        ) ||
                        context.subtitle,

                    image:
                        artist.picture ??
                        context.image,
                };
            }


            if (
                category ===
                    'albums' &&
                metadata
            ) {

                const album =
                    metadata as MusicAlbum;


                enrichedContext = {

                    ...context,

                    title:
                        album.title ??
                        context.title,

                    subtitle:
                        album.artist?.name ??
                        context.subtitle,

                    image:
                        album.cover ??
                        context.image,
                };
            }


            if (
                category ===
                    'playlists' &&
                metadata
            ) {

                const playlist =
                    metadata as MusicPlaylist;


                enrichedContext = {

                    ...context,

                    title:
                        playlist.title ??
                        context.title,

                    subtitle:
                        playlist.user?.name
                            ? `Por ${playlist.user.name} · ${playlist.nb_tracks ?? tracks.length} pistas`
                            : `${playlist.nb_tracks ?? tracks.length} pistas`,

                    image:
                        playlist.picture ??
                        context.image,
                };
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
                tracksResponse.next ??
                    null,
                tracksResponse.total ??
                    tracks.length,
                enrichedContext
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

        categoryViews.clear();

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

                const previewItems =
                    (
                        preview.data ??
                        []
                    ).slice(
                        0,
                        GLOBAL_SEARCH_PREVIEW_LIMIT
                    );

                state.preview =
                    previewItems;

                state.data =
                    [
                        ...previewItems,
                    ];

                state.total =
                    preview.total ??
                    previewItems.length;

                state.next =
                    null;

                state.pageCount =
                    state.data.length > 0
                        ? 1
                        : 0;
            }

                resultsContainer.innerHTML = '';

                loader.remove();

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

                loader.remove();

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

        categoryViews.clear();

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

        loader.remove();


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

            categoryHasUserScrolled =
                false;

            resultsContainer.scrollTop =
                0;

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
