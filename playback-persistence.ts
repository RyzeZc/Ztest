import type {
    MusicTrack,
} from '../music/music-types';

import type {
    PlaybackListMode,
    PlaybackListSource,
} from './types';


const SNAPSHOT_KEY =
    'new-retro-music-playback-v1';

const LAST_MEDIA_KEY =
    'new-retro-last-media-v1';


const MAX_SNAPSHOT_SIZE =
    512 * 1024;


export type LastMedia =
    | 'music'
    | 'radio';


export interface MusicPlaybackSnapshot {

    version:
        1;

    savedAt:
        number;

    track:
        MusicTrack;

    youtubeVideoId:
        string;

    currentTime:
        number;

    volume:
        number;

    muted:
        boolean;

    playbackIntent:
        'play' |
        'pause';

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
 * LAST MEDIA
 * ============================================================ */

export function setLastMedia(
    media:
        LastMedia
):
    void {

    try {

        localStorage.setItem(
            LAST_MEDIA_KEY,
            media
        );

    } catch (
        error
    ) {

        console.warn(
            '[PlaybackPersistence] Unable to save last media:',
            error
        );
    }
}


export function getLastMedia():
    LastMedia |
    null {

    try {

        const value =
            localStorage.getItem(
                LAST_MEDIA_KEY
            );


        if (
            value ===
            'music'
        ) {

            return 'music';
        }


        if (
            value ===
            'radio'
        ) {

            return 'radio';
        }


        return null;

    } catch (
        error
    ) {

        console.warn(
            '[PlaybackPersistence] Unable to read last media:',
            error
        );


        return null;
    }
}


/* ============================================================
 * SAVE
 * ============================================================ */

export function saveMusicPlaybackSnapshot(
    snapshot:
        MusicPlaybackSnapshot
):
    void {

    try {

        const serialized =
            JSON.stringify(
                snapshot
            );


        /*
         * Evitamos llenar localStorage
         * con una cola exageradamente grande.
         */
        if (
            serialized.length >
            MAX_SNAPSHOT_SIZE
        ) {

            const compactSnapshot:
                MusicPlaybackSnapshot = {

                ...snapshot,

                playbackList:
                    [
                        snapshot.track,
                    ],

                playbackListCurrentIndex:
                    0,

                playbackListNext:
                    null,

                playbackListTotal:
                    1,

            };


            localStorage.setItem(
                SNAPSHOT_KEY,
                JSON.stringify(
                    compactSnapshot
                )
            );

        } else {

            localStorage.setItem(
                SNAPSHOT_KEY,
                serialized
            );
        }


        setLastMedia(
            'music'
        );

    } catch (
        error
    ) {

        console.warn(
            '[PlaybackPersistence] Unable to save music session:',
            error
        );
    }
}


/* ============================================================
 * LOAD
 * ============================================================ */

export function loadMusicPlaybackSnapshot():
    MusicPlaybackSnapshot |
    null {

    try {

        const raw =
            localStorage.getItem(
                SNAPSHOT_KEY
            );


        if (
            !raw
        ) {

            return null;
        }


        const parsed:
            unknown =
            JSON.parse(
                raw
            );


        if (
            !parsed ||
            typeof parsed !==
                'object'
        ) {

            return null;
        }


        const snapshot =
            parsed as
            Partial<MusicPlaybackSnapshot>;


        if (
            snapshot.version !==
                1 ||
            !snapshot.track ||
            typeof snapshot.youtubeVideoId !==
                'string' ||
            snapshot.youtubeVideoId.length ===
                0 ||
            !Array.isArray(
                snapshot.playbackList
            )
        ) {

            return null;
        }


        return (
            snapshot as
            MusicPlaybackSnapshot
        );

    } catch (
        error
    ) {

        console.warn(
            '[PlaybackPersistence] Unable to read music session:',
            error
        );


        return null;
    }
}


/* ============================================================
 * CLEAR
 * ============================================================ */

export function clearMusicPlaybackSnapshot():
    void {

    try {

        localStorage.removeItem(
            SNAPSHOT_KEY
        );

    } catch (
        error
    ) {

        console.warn(
            '[PlaybackPersistence] Unable to clear music session:',
            error
        );
    }
}
