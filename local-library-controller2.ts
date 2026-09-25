import type {
    MusicTrack,
} from '../music/music-types';

import type {
    PlaybackSelectionOptions,
} from './types';

import {
    primeResolvedYouTubeTracks,
    resolveYouTubeTrack,
} from './playback';

import {
    exportLocalLibrary,
    getLocalLibrary,
    hasLocalTrack,
    importLocalLibrary,
    removeLocalTrack,
    reorderLocalLibrary,
    saveLocalTrack,
    type LocalLibraryTrack,
} from './local-library';


type ActivePlaybackSource =
    | 'radio'
    | 'youtube';


interface LocalLibraryControllerOptions {

    player:
        HTMLElement;

    openPanel:
        () => void;

    activateHomeTab:
        () => void;

    getCurrentTrack:
        () => MusicTrack | null;

    getActivePlaybackSource:
        () => ActivePlaybackSource;

    getCurrentYouTubeVideoId:
        () => string | null;

    getPlaybackListSource:
        () => string | null;

    selectMusicTrack:
        (
            track: MusicTrack,
            options: PlaybackSelectionOptions
        ) => Promise<void>;
}


export interface LocalLibraryController {

    open:
        () => void;

    syncCurrentTrack:
        (
            track: MusicTrack | null,
            isYouTube: boolean
        ) => void;

    hidePlayerSaveButton:
        () => void;

    updatePlaybackIndicators:
        (
            isVisuallyPlaying: boolean
        ) => void;
}


export function createLocalLibraryController(
    options:
        LocalLibraryControllerOptions
):
    LocalLibraryController {

    const {
        player,
        openPanel,
        activateHomeTab,
        getCurrentTrack,
        getActivePlaybackSource,
        getCurrentYouTubeVideoId,
        getPlaybackListSource,
        selectMusicTrack,
    } = options;


    /*
     * ==================================================
     * DOM
     * ==================================================
     */

    const localLibraryNavButton =
        player.querySelector<HTMLButtonElement>(
            '.music-player-local-library-nav'
        );

    const localLibraryEqualizer =
        player.querySelector<HTMLElement>(
            '[data-playback-equalizer="local-library"]'
        );

    const localLibrarySection =
        player.querySelector<HTMLElement>(
            '[data-local-library-section]'
        );

    const localLibraryContent =
        player.querySelector<HTMLElement>(
            '[data-local-library-content]'
        );

    const localLibraryListHeader =
        player.querySelector<HTMLElement>(
            '[data-local-library-list-header]'
        );

    const localLibraryImportButton =
        player.querySelector<HTMLButtonElement>(
            '[data-local-library-import]'
        );

    const localLibraryExportButton =
        player.querySelector<HTMLButtonElement>(
            '[data-local-library-export]'
        );

    const localLibraryFileInput =
        player.querySelector<HTMLInputElement>(
            '[data-local-library-file-input]'
        );

    const customListButton =
        player.querySelector<HTMLButtonElement>(
            '.music-player-custom-list-button'
        );

    const localSaveButton =
        player.querySelector<HTMLButtonElement>(
            '.music-player-local-save'
        );

    const homePanel =
        player.querySelector<HTMLElement>(
            '[data-panel-view="home"]'
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


    if (
        !(localLibraryNavButton instanceof HTMLButtonElement) ||
        !(localLibrarySection instanceof HTMLElement) ||
        !(localLibraryContent instanceof HTMLElement) ||
        !(localLibraryListHeader instanceof HTMLElement) ||
        !(localLibraryImportButton instanceof HTMLButtonElement) ||
        !(localLibraryExportButton instanceof HTMLButtonElement) ||
        !(localLibraryFileInput instanceof HTMLInputElement) ||
        !(localLibraryEqualizer instanceof HTMLElement) ||
        !(customListButton instanceof HTMLButtonElement) ||
        !(localSaveButton instanceof HTMLButtonElement) ||
        !(homePanel instanceof HTMLElement)
    ) {

        throw new Error(
            '[LocalLibrary] Required elements not found.'
        );
    }


    /*
     * ==================================================
     * ESTADO
     * ==================================================
     */

    let localLibraryLoaded =
        false;

    let localLibraryTracks:
        LocalLibraryTrack[] =
        [];

    let renderRequestId =
        0;

    let saveButtonRequestId =
        0;

    let lastPlayerTrackId:
        number | null =
        null;

    let lastPlayerSavedState:
        boolean | null =
        null;

    let draggedTrackId:
        number | null =
        null;


    /*
     * ==================================================
     * HELPERS
     * ==================================================
     */

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
            Math.floor(
                seconds
            );

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


    function localTrackToMusicTrack(
        track: LocalLibraryTrack
    ): MusicTrack {

        return {

            id:
                track.id,

            title:
                track.title,

            duration:
                track.duration,

            artist: {

                id:
                    track.artist.id,

                name:
                    track.artist.name,

            },

            album: {

                id:
                    track.album.id,

                title:
                    track.album.title,

                cover:
                    track.album.cover,

            },

        };
    }


    /*
     * ==================================================
     * PLAYER — MI MÚSICA
     * ==================================================
     */

function setSaveButtonIcon(
    saved: boolean
): void {

    localSaveButton.innerHTML =
        saved
            ? `
                <svg
                    class="music-player-local-save-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"
                    />
                </svg>
              `
            : `
                <svg
                    class="music-player-local-save-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                    />
                </svg>
              `;
}    

    function setSaveButtonState(
        saved: boolean
    ): void {

        localSaveButton.classList.toggle(
            'is-saved',
            saved
        );

        localSaveButton.setAttribute(
            'aria-pressed',
            String(saved)
        );

        localSaveButton.setAttribute(
            'aria-label',
            saved
                ? 'Quitar de Mi Música'
                : 'Guardar en Mi Música'
        );

        setSaveButtonIcon(
            saved
        );
    }


    function hidePlayerSaveButton(): void {

        ++saveButtonRequestId;

        lastPlayerTrackId =
            null;

        lastPlayerSavedState =
            null;

        localSaveButton.hidden =
            true;

        localSaveButton.disabled =
            true;
    }


    function syncCurrentTrack(
        track:
            MusicTrack | null,
        isYouTube:
            boolean
    ): void {

        const requestId =
            ++saveButtonRequestId;


        if (
            !isYouTube ||
            !track
        ) {

            hidePlayerSaveButton();

            return;
        }


        localSaveButton.hidden =
            false;

        localSaveButton.disabled =
            true;


        /*
         * Si seguimos mostrando la misma canción,
         * no volvemos a consultar IndexedDB.
         */
        if (
            lastPlayerTrackId ===
                track.id &&
            lastPlayerSavedState !==
                null
        ) {

            setSaveButtonState(
                lastPlayerSavedState
            );

            localSaveButton.disabled =
                false;

            return;
        }


        lastPlayerTrackId =
            track.id;

        lastPlayerSavedState =
            null;


        void (
            async () => {

                try {

                    const saved =
                        await hasLocalTrack(
                            track.id
                        );


                    if (
                        requestId !==
                        saveButtonRequestId
                    ) {
                        return;
                    }


                    lastPlayerSavedState =
                        saved;


                    setSaveButtonState(
                        saved
                    );

                } catch (error) {

                    console.error(
                        '[LocalLibrary] Unable to check saved state:',
                        error
                    );

                } finally {

                    if (
                        requestId ===
                        saveButtonRequestId
                    ) {

                        localSaveButton.disabled =
                            false;
                    }
                }

            }
        )();
    }


    async function togglePlayerSave():
        Promise<void> {

        const track =
            getCurrentTrack();


        if (
            getActivePlaybackSource() !==
                'youtube' ||
            !track
        ) {
            return;
        }


        localSaveButton.disabled =
            true;


        try {

            const saved =
                await hasLocalTrack(
                    track.id
                );


            if (saved) {

                await removeLocalTrack(
                    track.id
                );

                /*
                 * Compactamos posiciones después
                 * de una eliminación.
                 */
                const remainingIds =
                    localLibraryTracks
                        .filter(
                            item =>
                                item.id !==
                                track.id
                        )
                        .map(
                            item =>
                                item.id
                        );

                if (
                    remainingIds.length >
                    0
                ) {

                    await reorderLocalLibrary(
                        remainingIds
                    );
                }

            } else {

                let youtubeVideoId =
                    getCurrentYouTubeVideoId();


                if (
                    !youtubeVideoId
                ) {

                    youtubeVideoId =
                        await resolveYouTubeTrack(
                            track
                        );
                }


                if (
                    !youtubeVideoId
                ) {

                    console.error(
                        '[LocalLibrary] YouTube ID not available.'
                    );

                    return;
                }


                const now =
                    Date.now();


                await saveLocalTrack({

                    id:
                        track.id,

                    title:
                        track.title,

                    duration:
                        track.duration,

                    artist: {

                        id:
                            track.artist.id,

                        name:
                            track.artist.name,

                    },

                    album: {

                        id:
                            track.album.id,

                        title:
                            track.album.title,

                        cover:
                            track.album.cover ??
                            null,

                    },

                    youtubeVideoId,

                    position:
                        0,

                    addedAt:
                        now,

                    updatedAt:
                        now,

                });
            }


            const savedNow =
                !saved;


            lastPlayerTrackId =
                track.id;

            lastPlayerSavedState =
                savedNow;


            setSaveButtonState(
                savedNow
            );


            localSaveButton.disabled =
                false;


            localLibraryLoaded =
                false;


            if (
                localLibrarySection.classList.contains(
                    'is-active'
                )
            ) {

                await renderLocalLibrary();
            }


        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to update library:',
                error
            );

        } finally {

            localSaveButton.disabled =
                false;
        }
    }


    localSaveButton.addEventListener(
        'click',
        event => {

            event.stopPropagation();

            void togglePlayerSave();
        }
    );


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    function createLibraryRow(
        track:
            LocalLibraryTrack,
        index:
            number
    ): HTMLElement {

        const item =
            document.createElement(
                'div'
            );

        item.className =
            'music-player-local-library-item';

        item.dataset.trackId =
            String(
                track.id
            );

        item.dataset.localLibraryIndex =
            String(
                index
            );

        item.setAttribute(
            'role',
            'button'
        );

        item.tabIndex =
            0;

        item.draggable =
            true;

        item.title =
            'Arrastra para cambiar el orden';


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


        const cover =
            document.createElement(
                'img'
            );

        cover.className =
            'music-player-queue-thumbnail';

        cover.loading =
            'lazy';

        cover.decoding =
            'async';

        cover.alt =
            track.album.cover
                ? `${track.title} - portada`
                : '';

        if (
            track.album.cover
        ) {

            cover.src =
                track.album.cover;
        }


        const info =
            document.createElement(
                'div'
            );

        info.className =
            'music-player-queue-info';


        const title =
            document.createElement(
                'div'
            );

        title.className =
            'music-player-queue-track-title';

        title.textContent =
            track.title;


        const artist =
            document.createElement(
                'div'
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


        const removeButton =
            document.createElement(
                'button'
            );

        removeButton.className =
            'music-player-local-library-remove';

        removeButton.type =
            'button';

        removeButton.dataset.localLibraryAction =
            'remove';

        removeButton.dataset.trackId =
            String(
                track.id
            );

        removeButton.setAttribute(
            'aria-label',
            `Quitar ${track.title} de Mi Música`
        );

        removeButton.title =
            'Quitar de Mi Música';

        removeButton.textContent =
            '−';


        item.appendChild(
            number
        );

        item.appendChild(
            cover
        );

        item.appendChild(
            info
        );

        item.appendChild(
            duration
        );

        item.appendChild(
            removeButton
        );


        item.addEventListener(
            'dragstart',
            event => {

                draggedTrackId =
                    track.id;

                item.classList.add(
                    'is-dragging'
                );


                if (
                    event.dataTransfer
                ) {

                    event.dataTransfer.effectAllowed =
                        'move';

                    event.dataTransfer.setData(
                        'text/plain',
                        String(
                            track.id
                        )
                    );
                }
            }
        );


        item.addEventListener(
            'dragover',
            event => {

                event.preventDefault();

                if (
                    draggedTrackId ===
                    null ||
                    draggedTrackId ===
                    track.id
                ) {
                    return;
                }

                item.classList.add(
                    'is-drag-over'
                );


                if (
                    event.dataTransfer
                ) {

                    event.dataTransfer.dropEffect =
                        'move';
                }
            }
        );


        item.addEventListener(
            'dragleave',
            () => {

                item.classList.remove(
                    'is-drag-over'
                );
            }
        );


        item.addEventListener(
            'drop',
            event => {

                event.preventDefault();

                item.classList.remove(
                    'is-drag-over'
                );


                if (
                    draggedTrackId ===
                        null ||
                    draggedTrackId ===
                        track.id
                ) {
                    return;
                }


                void moveTrack(
                    draggedTrackId,
                    track.id
                );
            }
        );


        item.addEventListener(
            'dragend',
            () => {

                draggedTrackId =
                    null;

                clearDragVisualState();
            }
        );


        return item;
    }


    function clearDragVisualState():
        void {

        localLibraryContent
            .querySelectorAll<HTMLElement>(
                '.music-player-local-library-item'
            )
            .forEach(
                item => {

                    item.classList.remove(
                        'is-dragging',
                        'is-drag-over'
                    );
                }
            );
    }


    async function moveTrack(
        draggedId:
            number,
        targetId:
            number
    ): Promise<void> {

        const sourceIndex =
            localLibraryTracks.findIndex(
                track =>
                    track.id ===
                    draggedId
            );

        const targetIndex =
            localLibraryTracks.findIndex(
                track =>
                    track.id ===
                    targetId
            );


        if (
            sourceIndex < 0 ||
            targetIndex < 0 ||
            sourceIndex === targetIndex
        ) {
            return;
        }


        const reorderedTracks =
            [
                ...localLibraryTracks,
            ];

        const [
            movedTrack,
        ] =
            reorderedTracks.splice(
                sourceIndex,
                1
            );


        if (!movedTrack) {
            return;
        }


        reorderedTracks.splice(
            targetIndex,
            0,
            movedTrack
        );


        try {

            await reorderLocalLibrary(
                reorderedTracks.map(
                    track =>
                        track.id
                )
            );


            localLibraryTracks =
                reorderedTracks;

            localLibraryLoaded =
                true;


            await renderLocalLibrary();

        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to reorder library:',
                error
            );
        }
    }


    async function removeLibraryTrack(
        trackId:
            number
    ): Promise<void> {

        try {

            await removeLocalTrack(
                trackId
            );


            const remainingTracks =
                localLibraryTracks.filter(
                    track =>
                        track.id !==
                        trackId
                );


            localLibraryTracks =
                remainingTracks;


            if (
                remainingTracks.length >
                0
            ) {

                await reorderLocalLibrary(
                    remainingTracks.map(
                        track =>
                            track.id
                    )
                );
            }


            localLibraryLoaded =
                true;


            /*
             * Si eliminamos la canción
             * actualmente guardada,
             * refrescamos el corazón.
             */
            if (
                getCurrentTrack()?.id ===
                trackId
            ) {

                lastPlayerTrackId =
                    null;

                lastPlayerSavedState =
                    null;

                syncCurrentTrack(
                    getCurrentTrack(),
                    getActivePlaybackSource() ===
                        'youtube'
                );
            }


            await renderLocalLibrary();

        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to remove track:',
                error
            );
        }
    }


    async function renderLocalLibrary():
        Promise<void> {

        const requestId =
            ++renderRequestId;


        try {

            const tracks =
                await getLocalLibrary();


            if (
                requestId !==
                renderRequestId
            ) {
                return;
            }


            localLibraryTracks =
                tracks;

            localLibraryLoaded =
                true;


            localLibraryListHeader.hidden =
                tracks.length ===
                0;


            if (
                tracks.length ===
                0
            ) {

                localLibraryContent.innerHTML =
                    `
                        <div class="music-player-local-library-empty">

                            <div class="music-player-local-library-empty-title">
                                TU LISTA ESTÁ VACÍA
                            </div>

                            <div class="music-player-local-library-empty-text">
                                GUARDA TUS CANCIONES FAVORITAS PARA TENERLAS SIEMPRE AQUÍ
                            </div>

                        </div>
                    `;

                updatePlaybackIndicators(
                    player.classList.contains(
                        'is-playing'
                    )
                );

                return;
            }


            const list =
                document.createElement(
                    'div'
                );

            list.className =
                'music-player-local-library-list';


            tracks.forEach(
                (
                    track,
                    index
                ) => {

                    list.appendChild(
                        createLibraryRow(
                            track,
                            index
                        )
                    );
                }
            );


            localLibraryContent.replaceChildren(
                list
            );


            updatePlaybackIndicators(
                player.classList.contains(
                    'is-playing'
                )
            );

        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to load library:',
                error
            );

            localLibraryLoaded =
                false;

            localLibraryListHeader.hidden =
                true;

            localLibraryContent.innerHTML =
                `
                    <div class="music-player-local-library-empty">

                        <div class="music-player-local-library-empty-title">
                            NO SE PUDO CARGAR MI MÚSICA
                        </div>

                    </div>
                `;
        }
    }


    /*
     * ==================================================
     * ROW INTERACTION
     * ==================================================
     */

    localLibraryContent.addEventListener(
        'click',
        event => {

            const target =
                event.target;


            if (
                !(target instanceof Element)
            ) {
                return;
            }


            const removeButton =
                target.closest<HTMLButtonElement>(
                    '[data-local-library-action="remove"]'
                );


            if (
                removeButton
            ) {

                event.preventDefault();
                event.stopPropagation();


                const trackId =
                    Number(
                        removeButton.dataset.trackId
                    );


                if (
                    Number.isInteger(trackId)
                ) {

                    void removeLibraryTrack(
                        trackId
                    );
                }


                return;
            }


            const item =
                target.closest<HTMLElement>(
                    '[data-local-library-index]'
                );


            if (
                !item
            ) {
                return;
            }


            const index =
                Number(
                    item.dataset.localLibraryIndex
                );


            if (
                !Number.isInteger(index) ||
                index < 0
            ) {
                return;
            }


            void playLocalLibraryTrack(
                index
            );
        }
    );


    localLibraryContent.addEventListener(
        'keydown',
        event => {

            if (
                event.key !== 'Enter' &&
                event.key !== ' '
            ) {
                return;
            }


            const target =
                event.target;


            if (
                !(target instanceof HTMLElement)
            ) {
                return;
            }


            if (
                target.closest(
                    '[data-local-library-action]'
                )
            ) {
                return;
            }


            const item =
                target.closest<HTMLElement>(
                    '[data-local-library-index]'
                );


            if (
                !item
            ) {
                return;
            }


            const index =
                Number(
                    item.dataset.localLibraryIndex
                );


            if (
                !Number.isInteger(index) ||
                index < 0
            ) {
                return;
            }


            event.preventDefault();


            void playLocalLibraryTrack(
                index
            );
        }
    );


    /*
     * ==================================================
     * PLAYBACK
     * ==================================================
     */

    async function playLocalLibraryTrack(
        index:
            number
    ): Promise<void> {

        const selectedTrack =
            localLibraryTracks[index];


        if (
            !selectedTrack
        ) {
            return;
        }


        const playbackList =
            localLibraryTracks.map(
                localTrackToMusicTrack
            );


        /*
         * Los IDs ya están guardados
         * en IndexedDB.
         *
         * Los colocamos directamente en
         * el caché del sistema de playback.
         */
        primeResolvedYouTubeTracks(
            localLibraryTracks.map(
                track => ({

                    id:
                        track.id,

                    youtubeVideoId:
                        track.youtubeVideoId,

                })
            )
        );

        const track =
            playbackList[index];


        if (
            !track
        ) {
            return;
        }

        await selectMusicTrack(
            track,
            {

                queueAction:
                    'clear',

                playbackList,

                playbackListMode:
                    'context',

                playbackListSource:
                    'local-list',

                playbackListNext:
                    null,

                playbackListTotal:
                    playbackList.length,

            }
        );
    }


    /*
     * ==================================================
     * NAVIGATION
     * ==================================================
     */

    function resetNavigation():
        void {

        localLibraryNavButton.classList.remove(
            'is-active'
        );

        localLibraryNavButton.removeAttribute(
            'aria-current'
        );

        localLibrarySection.classList.remove(
            'is-active'
        );
    }


    function open():
        void {

        /*
         * IMPORTANTE:
         *
         * Comprobamos también que HOME sea
         * la vista actualmente visible.
         *
         * Antes solo comprobábamos que
         * localLibrarySection tuviera is-active,
         * y eso podía quedar persistente al
         * cambiar a BUSCAR o REPRODUCIENDO.
         */
        const isAlreadyOpen =
            player.classList.contains(
                'is-open'
            ) &&
            homePanel.classList.contains(
                'is-active'
            ) &&
            localLibrarySection.classList.contains(
                'is-active'
            );


        if (
            isAlreadyOpen
        ) {
            return;
        }


        openPanel();


        activateHomeTab();


        homeSections.forEach(
            section => {

                section.classList.remove(
                    'is-active'
                );
            }
        );


        localLibrarySection.classList.add(
            'is-active'
        );


        homeNavItems.forEach(
            item => {

                item.classList.remove(
                    'is-active'
                );

                item.removeAttribute(
                    'aria-current'
                );
            }
        );


        localLibraryNavButton.classList.add(
            'is-active'
        );

        localLibraryNavButton.setAttribute(
            'aria-current',
            'page'
        );


        if (
            !localLibraryLoaded
        ) {

            void renderLocalLibrary();
        }
    }


    customListButton.addEventListener(
        'click',
        event => {

            event.stopPropagation();

            open();
        }
    );


    localLibraryNavButton.addEventListener(
        'click',
        () => {

            open();
        }
    );


    homeNavItems.forEach(
        item => {

            item.addEventListener(
                'click',
                () => {

                    resetNavigation();
                }
            );
        }
    );


    /*
     * ==================================================
     * IMPORT / EXPORT
     * ==================================================
     */

    async function exportLibrary():
        Promise<void> {

        try {

            const data =
                await exportLocalLibrary();


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            'application/json',
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const anchor =
                document.createElement(
                    'a'
                );

            anchor.href =
                url;

            anchor.download =
                'new-retro-mi-musica.json';


            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();


            window.setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                },
                0
            );

        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to export library:',
                error
            );
        }
    }


    async function importLibrary(
        file:
            File
    ):
        Promise<void> {

        try {

            const text =
                await file.text();


            const data:
                unknown =
                JSON.parse(
                    text
                );


            await importLocalLibrary(
                data
            );


            localLibraryLoaded =
                false;


            await renderLocalLibrary();

        } catch (error) {

            console.error(
                '[LocalLibrary] Unable to import library:',
                error
            );

        } finally {

            localLibraryFileInput.value =
                '';
        }
    }


    localLibraryImportButton.addEventListener(
        'click',
        () => {

            localLibraryFileInput.click();
        }
    );


    localLibraryExportButton.addEventListener(
        'click',
        () => {

            void exportLibrary();
        }
    );


    localLibraryFileInput.addEventListener(
        'change',
        () => {

            const file =
                localLibraryFileInput.files?.[0];


            if (
                !file
            ) {
                return;
            }


            void importLibrary(
                file
            );
        }
    );


    /*
     * ==================================================
     * INDICADORES DE REPRODUCCIÓN
     * ==================================================
     */

    function updatePlaybackIndicators(
        isVisuallyPlaying:
            boolean
    ): void {

        const currentTrack =
            getCurrentTrack();


        const isLocalPlayback =
            getActivePlaybackSource() ===
                'youtube' &&
            getPlaybackListSource() ===
                'local-list';

        localLibraryEqualizer.classList.toggle(
            'is-active',
            isLocalPlayback
        );

        localLibraryEqualizer.classList.toggle(
            'is-playing',
            isLocalPlayback &&
            isVisuallyPlaying
        );        


        const currentTrackId =
            currentTrack?.id ??
            null;


        const items =
            localLibraryContent.querySelectorAll<HTMLElement>(
                '.music-player-local-library-item'
            );


        items.forEach(
            item => {

                const trackId =
                    Number(
                        item.dataset.trackId
                    );

                const index =
                    Number(
                        item.dataset.localLibraryIndex
                    );


                const isCurrent =
                    isLocalPlayback &&
                    currentTrackId !==
                        null &&
                    trackId ===
                        currentTrackId;


                item.classList.toggle(
                    'is-current',
                    isCurrent
                );


                const indexElement =
                    item.querySelector<HTMLElement>(
                        '.music-player-list-column-index'
                    );


                if (
                    !indexElement
                ) {
                    return;
                }


                indexElement.textContent =
                    isCurrent
                        ? (
                            isVisuallyPlaying
                                ? '⏸'
                                : '▶'
                        )
                        : String(
                            index + 1
                        );
            }
        );
    }


    return {

        open,

        syncCurrentTrack,

        hidePlayerSaveButton,

        updatePlaybackIndicators,

    };
}
