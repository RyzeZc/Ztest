import type {
    MusicTrack,
} from '../music/music-types';


/* ============================================================
 * PLAYBACK ENGINE — CORE TYPES
 * ============================================================ */

export type PlaybackListMode =
    | 'queue'
    | 'context';


export type PlaybackListSource =
    | 'search-tracks-queue'
    | 'search-all'
    | 'search-artist'
    | 'search-album'
    | 'search-playlist'
    | 'home-trending'
    | 'home-album'
    | 'home-playlist'
    | 'home-genre'
    | 'local-list'
    | null;


export interface ParkedPlaybackContext {

    playbackList:
        MusicTrack[];

    playbackListCurrentIndex:
        number;

    playbackListMode:
        PlaybackListMode;

    playbackListSource:
        PlaybackListSource;

    playbackListNext:
        string | null;

    playbackListTotal:
        number | null;

    youtubeRepeat:
        boolean;

    youtubeShuffle:
        boolean;

    youtubeShuffleHistory:
        number[];

    youtubeShuffleHistoryPosition:
        number;
}


export type PlaybackSource =
    | 'radio'
    | 'youtube';


export type PlaybackQueueAction =
    | 'generate'
    | 'keep'
    | 'clear';


export interface PlaybackSelectionOptions {

    autoplay?:
        boolean;

    startSeconds?:
        number;

    queueIndex?:
        number;

    queueAction?:
        PlaybackQueueAction;

    playbackList?:
        MusicTrack[];

    playbackListMode?:
        PlaybackListMode;

    playbackListSource?:
        PlaybackListSource;

    playbackListNext?:
        string | null;

    playbackListTotal?:
        number | null;
}


/* ============================================================
 * PLAYBACK SESSION STATE
 * ============================================================ */

export interface PlaybackState {

    /*
     * Fuente actualmente seleccionada.
     *
     * Todavía no se incorpora al estado en esta fase,
     * porque la versión actual mantiene activePlaybackSource
     * en MusicPlayer.
     *
     * Esta interfaz conservará exactamente el contrato
     * actual para no modificar comportamiento durante
     * la primera etapa de la refactorización.
     */

    playbackList:
        MusicTrack[];

    playbackListCurrentIndex:
        number;

    playbackListMode:
        PlaybackListMode;

    playbackListSource:
        PlaybackListSource;

    playbackListNext:
        string | null;

    playbackListTotal:
        number | null;

    playbackListLoadingMore:
        boolean;

    parkedPlaybackContext:
        ParkedPlaybackContext | null;

    currentMusicTrack:
        MusicTrack | null;

    currentYouTubeVideoId:
        string | null;

    playbackIntent:
        'play' | 'pause';

    playbackRequestId:
        number;

    queueRequestId:
        number;

    youtubeRepeat:
        boolean;

    youtubeShuffle:
        boolean;

    youtubeShuffleHistory:
        number[];

    youtubeShuffleHistoryPosition:
        number;
}

export interface PlaybackStateView {

    readonly playbackList:
        readonly MusicTrack[];

    readonly playbackListCurrentIndex:
        number;

    readonly playbackListMode:
        PlaybackListMode;

    readonly playbackListSource:
        PlaybackListSource;

    readonly playbackListNext:
        string | null;

    readonly playbackListTotal:
        number | null;

    readonly playbackListLoadingMore:
        boolean;

    readonly parkedPlaybackContext:
        Readonly<ParkedPlaybackContext> | null;

    readonly currentMusicTrack:
        MusicTrack | null;

    readonly currentYouTubeVideoId:
        string | null;

    readonly playbackIntent:
        'play' | 'pause';

    readonly playbackRequestId:
        number;

    readonly queueRequestId:
        number;

    readonly youtubeRepeat:
        boolean;

    readonly youtubeShuffle:
        boolean;

    readonly youtubeShuffleHistory:
        readonly number[];

    readonly youtubeShuffleHistoryPosition:
        number;
}


export type PlaybackEvent =
    | {
        type:
            'track-selected';

        track:
            MusicTrack;

        source:
            PlaybackSource;
    }
    | {
        type:
            'queue-changed';

        reason:
            'replaced' |
            'appended' |
            'cleared';
    }
    | {
        type:
            'queue-index-changed';

        index:
            number;
    }
    | {
        type:
            'playback-intent-changed';

        intent:
            'play' |
            'pause';
    }
    | {
        type:
            'repeat-changed';

        enabled:
            boolean;
    }
    | {
        type:
            'shuffle-changed';

        enabled:
            boolean;
    };


export type PlaybackEventListener =
    (
        event:
            PlaybackEvent,

        state:
            PlaybackStateView
    ) =>
        void;


export interface PlaybackSessionRestore {

    playbackList:
        MusicTrack[];

    playbackListCurrentIndex:
        number;

    playbackListMode:
        PlaybackListMode;

    playbackListSource:
        PlaybackListSource;

    playbackListNext:
        string | null;

    playbackListTotal:
        number | null;

    youtubeRepeat:
        boolean;

    youtubeShuffle:
        boolean;

    youtubeShuffleHistory:
        number[];

    youtubeShuffleHistoryPosition:
        number;
}

/* ============================================================
 * MEDIA ADAPTERS
 * ============================================================ */

export interface PlaybackYouTubeAdapter {

    pause():
        void;

    play():
        void;

    load(
        videoId:
            string,
        startSeconds?:
            number
    ):
        void;

    seekTo(
        seconds:
            number
    ):
        void;

    getCurrentTime():
        number;
}


export interface PlaybackAudioAdapter {

    pause():
        void;
}


/* ============================================================
 * PLAYBACK ENGINE CONTROLLER
 * ============================================================ */

export interface PlaybackController {

    getState():
        PlaybackStateView;

    subscribe(
        listener:
            PlaybackEventListener
    ):
        () => void;
                
    setPlaybackIntent(
        intent:
            'play' | 'pause'
    ):
        void;

    toggleRepeat():
        boolean;

    toggleShuffle():
        boolean;

    restoreSessionState(
        session:
            PlaybackSessionRestore
    ):
        void;

    selectMusicTrack(
        track:
            MusicTrack,
        options?:
            PlaybackSelectionOptions
    ):
        Promise<void>;

    playMusicQueueTrack(
        index:
            number
    ):
        Promise<void>;

    playNextMusicQueueTrack():
        Promise<void>;

    playPreviousMusicQueueTrack():
        Promise<void>;

    loadMorePlaybackList():
        Promise<boolean>;

    restoreParkedPlaybackContext(
        index:
            number
    ):
        Promise<void>;
}
