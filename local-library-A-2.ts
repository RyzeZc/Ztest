/*
 * ============================================================
 * NEW RETRO — LOCAL MUSIC LIBRARY
 * ============================================================
 *
 * IndexedDB
 *
 * v2:
 * - tracks
 * - metadata
 *
 * ============================================================
 */

const DB_NAME =
    'new-retro-music';

const DB_VERSION =
    2;

const TRACK_STORE_NAME =
    'tracks';

const METADATA_STORE_NAME =
    'metadata';

const METADATA_KEY =
    'library';

const DEFAULT_PLAYLIST_NAME =
    'Mi Música';

const MAX_PLAYLIST_NAME_LENGTH =
    80;


/* ============================================================
 * TIPOS
 * ============================================================ */

export interface LocalLibraryArtist {

    id:
        number;

    name:
        string;

}


export interface LocalLibraryAlbum {

    id:
        number;

    title:
        string;

    cover:
        string | null;

}


export interface LocalLibraryTrack {

    id:
        number;

    title:
        string;

    duration:
        number;

    artist:
        LocalLibraryArtist;

    album:
        LocalLibraryAlbum;

    youtubeVideoId:
        string;

    position:
        number;

    addedAt:
        number;

    updatedAt:
        number;

}


export interface LocalLibraryMetadata {

    key:
        typeof METADATA_KEY;

    playlistName:
        string;

    updatedAt:
        number;

}


export interface LocalLibraryExport {

    format:
        'new-retro-local-library';

    version:
        2;

    playlistName:
        string;

    exportedAt:
        string;

    tracks:
        LocalLibraryTrack[];

}


/*
 * Compatibilidad con los JSON antiguos.
 */
interface LegacyLocalLibraryExport {

    format:
        'new-retro-local-library';

    version:
        1;

    exportedAt:
        string;

    tracks:
        LocalLibraryTrack[];

}


type LocalLibraryImportData =
    | LocalLibraryExport
    | LegacyLocalLibraryExport;


/* ============================================================
 * DATABASE
 * ============================================================ */

let databasePromise:
    Promise<IDBDatabase> |
    null =
    null;


function openDatabase():
    Promise<IDBDatabase> {

    if (
        databasePromise
    ) {
        return databasePromise;
    }


    databasePromise =
        new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    typeof window ===
                    'undefined'
                ) {

                    reject(
                        new Error(
                            'IndexedDB is only available in the browser.'
                        )
                    );

                    return;
                }


                const request =
                    window.indexedDB.open(
                        DB_NAME,
                        DB_VERSION
                    );


                request.onerror =
                    () => {

                        databasePromise =
                            null;

                        reject(
                            request.error ??
                            new Error(
                                'Unable to open IndexedDB.'
                            )
                        );
                    };


                request.onupgradeneeded =
                    () => {

                        const database =
                            request.result;


                        /*
                         * TRACKS
                         */

                        let trackStore:
                            IDBObjectStore;


                        if (
                            database.objectStoreNames.contains(
                                TRACK_STORE_NAME
                            )
                        ) {

                            const transaction =
                                request.transaction;

                            if (
                                !transaction
                            ) {

                                throw new Error(
                                    'IndexedDB upgrade transaction is unavailable.'
                                );
                            }


                            trackStore =
                                transaction.objectStore(
                                    TRACK_STORE_NAME
                                );

                        } else {

                            trackStore =
                                database.createObjectStore(
                                    TRACK_STORE_NAME,
                                    {
                                        keyPath:
                                            'id',
                                    }
                                );
                        }


                        if (
                            !trackStore.indexNames.contains(
                                'position'
                            )
                        ) {

                            trackStore.createIndex(
                                'position',
                                'position',
                                {
                                    unique:
                                        false,
                                }
                            );
                        }


                        if (
                            !trackStore.indexNames.contains(
                                'youtubeVideoId'
                            )
                        ) {

                            trackStore.createIndex(
                                'youtubeVideoId',
                                'youtubeVideoId',
                                {
                                    unique:
                                        false,
                                }
                            );
                        }


                        /*
                         * METADATA
                         */

                        if (
                            !database.objectStoreNames.contains(
                                METADATA_STORE_NAME
                            )
                        ) {

                            database.createObjectStore(
                                METADATA_STORE_NAME,
                                {
                                    keyPath:
                                        'key',
                                }
                            );
                        }

                    };


                request.onsuccess =
                    () => {

                        const database =
                            request.result;


                        database.onversionchange =
                            () => {

                                database.close();

                                databasePromise =
                                    null;
                            };


                        resolve(
                            database
                        );
                    };

            }
        );


    return databasePromise;
}


/* ============================================================
 * HELPERS
 * ============================================================ */

function normalizePlaylistName(
    name:
        string
): string {

    const normalized =
        name
            .trim()
            .replace(
                /\s+/g,
                ' '
            )
            .slice(
                0,
                MAX_PLAYLIST_NAME_LENGTH
            );


    return (
        normalized ||
        DEFAULT_PLAYLIST_NAME
    );
}


/* ============================================================
 * GET TRACKS
 * ============================================================ */

export async function getLocalLibrary():
    Promise<LocalLibraryTrack[]> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const request =
                store.getAll();


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to read local library.'
                        )
                    );
                };


            request.onsuccess =
                () => {

                    const tracks =
                        request.result as
                        LocalLibraryTrack[];


                    tracks.sort(
                        (
                            a,
                            b
                        ) =>
                            a.position -
                            b.position
                    );


                    resolve(
                        tracks
                    );
                };

        }
    );
}


/* ============================================================
 * GET ONE
 * ============================================================ */

export async function getLocalTrack(
    trackId:
        number
):
    Promise<LocalLibraryTrack | null> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const request =
                store.get(
                    trackId
                );


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to read local track.'
                        )
                    );
                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result ??
                        null
                    );
                };

        }
    );
}


/* ============================================================
 * GET PLAYLIST NAME
 * ============================================================ */

export async function getLocalLibraryName():
    Promise<string> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    METADATA_STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    METADATA_STORE_NAME
                );


            const request =
                store.get(
                    METADATA_KEY
                );


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to read local library metadata.'
                        )
                    );
                };


            request.onsuccess =
                () => {

                    const metadata =
                        request.result as
                        LocalLibraryMetadata |
                        undefined;


                    resolve(
                        normalizePlaylistName(
                            metadata?.playlistName ??
                            DEFAULT_PLAYLIST_NAME
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * SET PLAYLIST NAME
 * ============================================================ */

export async function setLocalLibraryName(
    name:
        string
):
    Promise<string> {

    const database =
        await openDatabase();


    const playlistName =
        normalizePlaylistName(
            name
        );


    const metadata:
        LocalLibraryMetadata = {

        key:
            METADATA_KEY,

        playlistName,

        updatedAt:
            Date.now(),

    };


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    METADATA_STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    METADATA_STORE_NAME
                );


            store.put(
                metadata
            );


            transaction.oncomplete =
                () => {

                    resolve(
                        playlistName
                    );
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to save local library metadata.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local library metadata update was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * SAVE / UPDATE TRACK
 * ============================================================ */

export async function saveLocalTrack(
    track:
        Omit<
            LocalLibraryTrack,
            | 'position'
            | 'addedAt'
            | 'updatedAt'
        >
):
    Promise<LocalLibraryTrack> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const getExistingRequest =
                store.get(
                    track.id
                );


            const getLastRequest =
                store
                    .index('position')
                    .openCursor(
                        null,
                        'prev'
                    );


            let existingTrack:
                LocalLibraryTrack |
                null =
                null;

            let lastPosition =
                -1;

            let existingReady =
                false;

            let lastPositionReady =
                false;

            let saveStarted =
                false;

            let savedTrack:
                LocalLibraryTrack |
                null =
                null;


            const trySave =
                () => {

                    if (
                        saveStarted ||
                        !existingReady ||
                        !lastPositionReady
                    ) {
                        return;
                    }


                    saveStarted =
                        true;


                    const now =
                        Date.now();


                    savedTrack = {

                        ...track,

                        position:
                            existingTrack?.position ??
                            (
                                lastPosition +
                                1
                            ),

                        addedAt:
                            existingTrack?.addedAt ??
                            now,

                        updatedAt:
                            now,

                    };


                    store.put(
                        savedTrack
                    );
                };


            getExistingRequest.onsuccess =
                () => {

                    existingTrack =
                        getExistingRequest.result ??
                        null;

                    existingReady =
                        true;

                    trySave();
                };


            getExistingRequest.onerror =
                () => {

                    reject(
                        getExistingRequest.error ??
                        new Error(
                            'Unable to read existing local track.'
                        )
                    );
                };


            getLastRequest.onsuccess =
                () => {

                    const cursor =
                        getLastRequest.result;


                    if (
                        cursor
                    ) {

                        const value =
                            cursor.value as
                            LocalLibraryTrack;


                        lastPosition =
                            Number.isFinite(
                                value.position
                            )
                                ? value.position
                                : -1;
                    }


                    lastPositionReady =
                        true;


                    trySave();
                };


            getLastRequest.onerror =
                () => {

                    reject(
                        getLastRequest.error ??
                        new Error(
                            'Unable to determine local library position.'
                        )
                    );
                };


            transaction.oncomplete =
                () => {

                    resolve(
                        savedTrack as
                        LocalLibraryTrack
                    );
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to save local track.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local track save was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * REMOVE TRACK
 * ============================================================ */

export async function removeLocalTrack(
    trackId:
        number
):
    Promise<void> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            store.delete(
                trackId
            );


            transaction.oncomplete =
                () => {

                    resolve();
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to remove local track.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local track removal was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * EXISTS
 * ============================================================ */

export async function hasLocalTrack(
    trackId:
        number
):
    Promise<boolean> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const request =
                store.getKey(
                    trackId
                );


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to check local track.'
                        )
                    );
                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result !==
                        undefined
                    );
                };

        }
    );
}


/* ============================================================
 * REORDER
 * ============================================================ */

export async function reorderLocalLibrary(
    orderedTrackIds:
        number[]
):
    Promise<void> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const getAllRequest =
                store.getAll();


            getAllRequest.onerror =
                () => {

                    reject(
                        getAllRequest.error ??
                        new Error(
                            'Unable to read local library for reorder.'
                        )
                    );
                };


            getAllRequest.onsuccess =
                () => {

                    const tracks =
                        getAllRequest.result as
                        LocalLibraryTrack[];


                    const tracksById =
                        new Map(
                            tracks.map(
                                track => [
                                    track.id,
                                    track,
                                ]
                            )
                        );


                    const uniqueIds =
                        new Set(
                            orderedTrackIds
                        );


                    if (
                        orderedTrackIds.length !==
                            tracks.length ||
                        uniqueIds.size !==
                            orderedTrackIds.length
                    ) {

                        transaction.abort();

                        reject(
                            new Error(
                                'Invalid local library order.'
                            )
                        );

                        return;
                    }


                    for (
                        let index = 0;
                        index <
                            orderedTrackIds.length;
                        index++
                    ) {

                        const track =
                            tracksById.get(
                                orderedTrackIds[index]
                            );


                        if (
                            !track
                        ) {

                            transaction.abort();

                            reject(
                                new Error(
                                    'Local library reorder contains an unknown track.'
                                )
                            );

                            return;
                        }


                        store.put({

                            ...track,

                            position:
                                index,

                            updatedAt:
                                Date.now(),

                        });
                    }
                };


            transaction.oncomplete =
                () => {

                    resolve();
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to reorder local library.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local library reorder was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * CLEAR TRACKS
 * ============================================================ */

export async function clearLocalLibrary():
    Promise<void> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    TRACK_STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            store.clear();


            transaction.oncomplete =
                () => {

                    resolve();
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to clear local library.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local library clear was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * CREATE NEW PLAYLIST
 * ============================================================ */

export async function createNewLocalLibrary(
    name:
        string
):
    Promise<string> {

    const database =
        await openDatabase();


    const playlistName =
        normalizePlaylistName(
            name
        );


    const metadata:
        LocalLibraryMetadata = {

        key:
            METADATA_KEY,

        playlistName,

        updatedAt:
            Date.now(),

    };


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    [
                        TRACK_STORE_NAME,
                        METADATA_STORE_NAME,
                    ],
                    'readwrite'
                );


            const trackStore =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const metadataStore =
                transaction.objectStore(
                    METADATA_STORE_NAME
                );


            /*
             * Todo ocurre dentro de la misma
             * transacción.
             */
            trackStore.clear();

            metadataStore.put(
                metadata
            );


            transaction.oncomplete =
                () => {

                    resolve(
                        playlistName
                    );
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to create new local playlist.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Creating the new local playlist was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * EXPORT
 * ============================================================ */

export async function exportLocalLibrary():
    Promise<LocalLibraryExport> {

    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    [
                        TRACK_STORE_NAME,
                        METADATA_STORE_NAME,
                    ],
                    'readonly'
                );


            const trackStore =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const metadataStore =
                transaction.objectStore(
                    METADATA_STORE_NAME
                );


            const tracksRequest =
                trackStore.getAll();


            const metadataRequest =
                metadataStore.get(
                    METADATA_KEY
                );


            let tracks:
                LocalLibraryTrack[] |
                null =
                null;

            let metadata:
                LocalLibraryMetadata |
                undefined;


            const tryResolve =
                () => {

                    if (
                        tracks ===
                            null ||
                        metadata ===
                            undefined
                    ) {
                        return;
                    }


                    tracks.sort(
                        (
                            a,
                            b
                        ) =>
                            a.position -
                            b.position
                    );


                    resolve({

                        format:
                            'new-retro-local-library',

                        version:
                            2,

                        playlistName:
                            normalizePlaylistName(
                                metadata.playlistName
                            ),

                        exportedAt:
                            new Date().toISOString(),

                        tracks,

                    });
                };


            tracksRequest.onerror =
                () => {

                    reject(
                        tracksRequest.error ??
                        new Error(
                            'Unable to export local tracks.'
                        )
                    );
                };


            tracksRequest.onsuccess =
                () => {

                    tracks =
                        tracksRequest.result as
                        LocalLibraryTrack[];

                    tryResolve();
                };


            metadataRequest.onerror =
                () => {

                    reject(
                        metadataRequest.error ??
                        new Error(
                            'Unable to export local library metadata.'
                        )
                    );
                };


            metadataRequest.onsuccess =
                () => {

                    metadata =
                        metadataRequest.result as
                        LocalLibraryMetadata |
                        undefined;

                    /*
                     * Si todavía no existe metadata,
                     * exportamos con el nombre por defecto.
                     */
                    if (
                        metadata ===
                        undefined
                    ) {

                        metadata = {

                            key:
                                METADATA_KEY,

                            playlistName:
                                DEFAULT_PLAYLIST_NAME,

                            updatedAt:
                                Date.now(),

                        };
                    }


                    tryResolve();
                };

        }
    );
}


/* ============================================================
 * IMPORT — REPLACE
 * ============================================================ */

export async function importLocalLibrary(
    data:
        unknown
):
    Promise<LocalLibraryTrack[]> {

    if (
        !(
            typeof data ===
            'object'
        ) ||
        data ===
            null
    ) {

        throw new Error(
            'Invalid local library file.'
        );
    }


    const source =
        data as
        Partial<LocalLibraryImportData>;


    if (
        source.format !==
        'new-retro-local-library'
    ) {

        throw new Error(
            'Unsupported local library format.'
        );
    }


    if (
        source.version !== 1 &&
        source.version !== 2
    ) {

        throw new Error(
            'Unsupported local library version.'
        );
    }


    if (
        !Array.isArray(
            source.tracks
        )
    ) {

        throw new Error(
            'Local library tracks are missing.'
        );
    }


    const importedIds =
        new Set<number>();


    const importedTracks:
        LocalLibraryTrack[] =
        [];


    const now =
        Date.now();


    for (
        let index = 0;
        index <
            source.tracks.length;
        index++
    ) {

        const importedTrack =
            source.tracks[index];


        if (
            !isValidLocalTrack(
                importedTrack
            )
        ) {

            throw new Error(
                `Invalid local track at position ${index + 1}.`
            );
        }


        if (
            importedIds.has(
                importedTrack.id
            )
        ) {

            throw new Error(
                `Duplicate track ID in local library: ${importedTrack.id}.`
            );
        }


        importedIds.add(
            importedTrack.id
        );


        importedTracks.push({

            ...importedTrack,

            position:
                index,

            addedAt:
                Number.isFinite(
                    importedTrack.addedAt
                )
                    ? importedTrack.addedAt
                    : now,

            updatedAt:
                now,

        });
    }


    const playlistName =
        source.version === 2 &&
        typeof source.playlistName ===
            'string'
            ? normalizePlaylistName(
                source.playlistName
            )
            : DEFAULT_PLAYLIST_NAME;


    const database =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    [
                        TRACK_STORE_NAME,
                        METADATA_STORE_NAME,
                    ],
                    'readwrite'
                );


            const trackStore =
                transaction.objectStore(
                    TRACK_STORE_NAME
                );


            const metadataStore =
                transaction.objectStore(
                    METADATA_STORE_NAME
                );


            /*
             * REEMPLAZO REAL.
             *
             * El import NO mezcla.
             */
            trackStore.clear();


            importedTracks.forEach(
                track => {

                    trackStore.put(
                        track
                    );
                }
            );


            metadataStore.put({

                key:
                    METADATA_KEY,

                playlistName,

                updatedAt:
                    Date.now(),

            });


            transaction.oncomplete =
                () => {

                    resolve(
                        importedTracks
                    );
                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Unable to import local library.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ??
                        new Error(
                            'Local library import was aborted.'
                        )
                    );
                };

        }
    );
}


/* ============================================================
 * VALIDATION
 * ============================================================ */

function isValidLocalTrack(
    value:
        unknown
):
    value is LocalLibraryTrack {

    if (
        typeof value !==
            'object' ||
        value ===
            null
    ) {

        return false;
    }


    const track =
        value as
        Partial<LocalLibraryTrack>;


    if (
        !Number.isInteger(
            track.id
        ) ||
        track.id < 1
    ) {
        return false;
    }


    if (
        typeof track.title !==
        'string' ||
        track.title.length ===
            0
    ) {
        return false;
    }


    if (
        typeof track.duration !==
        'number' ||
        !Number.isFinite(
            track.duration
        ) ||
        track.duration < 0
    ) {
        return false;
    }


    if (
        typeof track.youtubeVideoId !==
        'string' ||
        track.youtubeVideoId.trim()
            .length ===
            0
    ) {
        return false;
    }


    if (
        typeof track.position !==
        'number' ||
        !Number.isFinite(
            track.position
        )
    ) {
        return false;
    }


    if (
        typeof track.addedAt !==
        'number' ||
        !Number.isFinite(
            track.addedAt
        )
    ) {
        return false;
    }


    if (
        typeof track.updatedAt !==
        'number' ||
        !Number.isFinite(
            track.updatedAt
        )
    ) {
        return false;
    }


    if (
        typeof track.artist !==
            'object' ||
        track.artist ===
            null
    ) {
        return false;
    }


    if (
        !Number.isInteger(
            track.artist.id
        ) ||
        typeof track.artist.name !==
            'string'
    ) {
        return false;
    }


    if (
        typeof track.album !==
            'object' ||
        track.album ===
            null
    ) {
        return false;
    }


    if (
        !Number.isInteger(
            track.album.id
        ) ||
        typeof track.album.title !==
            'string'
    ) {
        return false;
    }


    if (
        track.album.cover !==
            null &&
        typeof track.album.cover !==
            'string'
    ) {
        return false;
    }


    return true;
}
