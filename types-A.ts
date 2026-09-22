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
 * PLAYBACK
 * ============================================================ */

export type PlaybackListMode =
    | 'queue'
    | 'context';


export type PlaybackListSource =
    | 'search-tracks-queue'
    | 'search-artist'
    | 'search-album'
    | 'search-playlist'
    | 'home-trending'
    | 'home-album'
    | 'home-playlist'
    | 'home-genre'
    | null;


export type PlaybackSource =
    | 'radio'
    | 'youtube';


export type PlaybackQueueAction =
    | 'generate'
    | 'keep'
    | 'clear';


export interface PlaybackSelectionOptions {
    queueIndex?: number;
    queueAction?: PlaybackQueueAction;

    playbackList?: MusicTrack[];
    playbackListMode?: PlaybackListMode;
    playbackListSource?: PlaybackListSource;
}


/* ============================================================
 * PLAYBACK STATE
 * ============================================================ */

export interface PlaybackState {
    playbackList: MusicTrack[];
    playbackListCurrentIndex: number;

    playbackListMode: PlaybackListMode;
    playbackListSource: PlaybackListSource;

    currentMusicTrack: MusicTrack | null;
    currentYouTubeVideoId: string | null;

    playbackIntent: 'play' | 'pause';

    playbackRequestId: number;
    queueRequestId: number;

    youtubeRepeat: boolean;
    youtubeShuffle: boolean;
    youtubeShuffleHistory: number[];
    youtubeShuffleHistoryPosition: number;
}


/* ============================================================
 * PLAYBACK ADAPTERS
 * ============================================================
 *
 * Interfaces pequeñas para que playback.ts no tenga que
 * conocer las clases reales de YouTube/Audio ni tocar DOM.
 */

export interface PlaybackYouTubeAdapter {

    pause(): void;

    play(): void;

    load(
        videoId: string
    ): void;

    seekTo(
        seconds: number
    ): void;

    getCurrentTime(): number;
}


export interface PlaybackAudioAdapter {

    pause(): void;
}


/* ============================================================
 * PLAYBACK CONTROLLER
 * ============================================================ */

export interface PlaybackController {

    selectMusicTrack(
        track: MusicTrack,
        options?: PlaybackSelectionOptions
    ): Promise<void>;

    playMusicQueueTrack(
        index: number
    ): Promise<void>;

    playNextMusicQueueTrack():
        Promise<void>;

    playPreviousMusicQueueTrack():
        Promise<void>;
}

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
