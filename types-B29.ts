import type {
    MusicTrack,
} from '../music/music-types';

/* ============================================================
 * PANEL
 * ============================================================ */

export type MusicPanelTab =
    | 'home'
    | 'search'
    | 'playback';

/* ============================================================
 * HOME
 * ============================================================ */

export type HomeSection =
    | 'trending'
    | 'discover'
    | 'playlist'
    | 'genres'
    | 'stations';


export type HomeLoadState =
    | 'idle'
    | 'loading'
    | 'loaded'
    | 'error';


/* ============================================================
 * HOME DETAIL
 * ============================================================ */

export type HomeDetailRoute =
    | {
        type:
            'album';

        id:
            number;

        title:
            string;

        returnSection:
            HomeSection;
    }
    | {
        type:
            'playlist';

        id:
            number;

        title:
            string;

        returnSection:
            HomeSection;
    }
    | {
        type:
            'genre';

        id:
            number;

        title:
            string;

        returnSection:
            HomeSection;
    };


/* ============================================================
 * PLAYBACK ENGINE TYPES
 * ============================================================ */

export type {
    PlaybackListMode,
    PlaybackListSource,
    ParkedPlaybackContext,
    PlaybackSource,
    PlaybackQueueAction,
    PlaybackSelectionOptions,
    PlaybackState,
    PlaybackStateView,
    PlaybackEvent,
    PlaybackEventListener,
    PlaybackSessionRestore,
    PlaybackYouTubeAdapter,
    PlaybackAudioAdapter,
    PlaybackController,
} from './playback-engine-types';


/* ============================================================
 * UI CONTROLLERS
 * ============================================================ */

export interface MusicPanelController {

    activatePanelTab(
        tab: MusicPanelTab
    ): void;

    activateHomeSection(
        section: HomeSection
    ): void;

    showSearchPanel(): void;
}

export interface MusicSearchController {

    search(
        query: string
    ): Promise<void>;

    getTracks():
        MusicTrack[];

    clear():
        void;

    stop():
        void;
}

export interface MusicHomeController {

    loadSection(
        section: HomeSection
    ): void;

}
