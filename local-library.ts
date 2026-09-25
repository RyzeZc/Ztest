/* =========================================================
   NEW RETRO — LOCAL MUSIC LIBRARY
   IndexedDB
   ========================================================= */

const DB_NAME =
    'new-retro-music';

const DB_VERSION =
    1;

const STORE_NAME =
    'tracks';


/* =========================================================
   TIPOS
   ========================================================= */

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


/* =========================================================
   DATABASE
   ========================================================= */

function openDatabase():
    Promise<IDBDatabase> {

    return new Promise(
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


                    if (
                        !database.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        const store =
                            database.createObjectStore(
                                STORE_NAME,
                                {
                                    keyPath:
                                        'id',
                                }
                            );


                        store.createIndex(
                            'position',
                            'position',
                            {
                                unique:
                                    false,
                            }
                        );


                        store.createIndex(
                            'youtubeVideoId',
                            'youtubeVideoId',
                            {
                                unique:
                                    false,
                            }
                        );

                    }

                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };

        }
    );
}


/* =========================================================
   GET ALL
   ========================================================= */

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
                    STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
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
                        request.result as LocalLibraryTrack[];


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


/* =========================================================
   GET ONE
   ========================================================= */

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
                    STORE_NAME,
                    'readonly'
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
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


/* =========================================================
   ADD / UPDATE
   ========================================================= */

export async function saveLocalTrack(
    track:
        Omit<
            LocalLibraryTrack,
            'position' |
            'addedAt' |
            'updatedAt'
        >
):
    Promise<LocalLibraryTrack> {

    const database =
        await openDatabase();


    const existing =
        await getLocalTrack(
            track.id
        );


    const now =
        Date.now();


    const savedTrack:
        LocalLibraryTrack = {

        ...track,

        position:
            existing?.position ??
            (
                await getLocalLibrary()
            ).length,

        addedAt:
            existing?.addedAt ??
            now,

        updatedAt:
            now,

    };


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.put(
                    savedTrack
                );


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to save local track.'
                        )
                    );

                };


            request.onsuccess =
                () => {

                    resolve(
                        savedTrack
                    );

                };

        }
    );
}


/* =========================================================
   REMOVE
   ========================================================= */

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
                    STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.delete(
                    trackId
                );


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to remove local track.'
                        )
                    );

                };


            request.onsuccess =
                () => {

                    resolve();

                };

        }
    );
}


/* =========================================================
   EXISTS
   ========================================================= */

export async function hasLocalTrack(
    trackId:
        number
):
    Promise<boolean> {

    const track =
        await getLocalTrack(
            trackId
        );


    return track !== null;
}


/* =========================================================
   REORDER
   ========================================================= */

export async function reorderLocalLibrary(
    orderedTrackIds:
        number[]
):
    Promise<void> {

    const database =
        await openDatabase();


    const tracks =
        await getLocalLibrary();


    const tracksById =
        new Map(
            tracks.map(
                track => [
                    track.id,
                    track,
                ]
            )
        );


    const transaction =
        database.transaction(
            STORE_NAME,
            'readwrite'
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    orderedTrackIds.forEach(
        (
            trackId,
            index
        ) => {

            const track =
                tracksById.get(
                    trackId
                );


            if (!track) {
                return;
            }


            store.put(
                {
                    ...track,

                    position:
                        index,

                    updatedAt:
                        Date.now(),

                }
            );

        }
    );


    return new Promise(
        (
            resolve,
            reject
        ) => {

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


/* =========================================================
   CLEAR
   ========================================================= */

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
                    STORE_NAME,
                    'readwrite'
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.clear();


            request.onerror =
                () => {

                    reject(
                        request.error ??
                        new Error(
                            'Unable to clear local library.'
                        )
                    );

                };


            request.onsuccess =
                () => {

                    resolve();

                };

        }
    );
}


/* =========================================================
   EXPORT
   ========================================================= */

export interface LocalLibraryExport {

    format:
        'new-retro-local-library';

    version:
        1;

    exportedAt:
        string;

    tracks:
        LocalLibraryTrack[];

}


export async function exportLocalLibrary():
    Promise<LocalLibraryExport> {

    const tracks =
        await getLocalLibrary();


    return {

        format:
            'new-retro-local-library',

        version:
            1,

        exportedAt:
            new Date().toISOString(),

        tracks,

    };

}


/* =========================================================
   IMPORT
   ========================================================= */

export async function importLocalLibrary(
    data:
        unknown
):
    Promise<LocalLibraryTrack[]> {

    if (
        typeof data !==
        'object' ||
        data === null
    ) {

        throw new Error(
            'Invalid local library file.'
        );

    }


    const source =
        data as Partial<LocalLibraryExport>;


    if (
        source.format !==
        'new-retro-local-library'
    ) {

        throw new Error(
            'Unsupported local library format.'
        );

    }


    if (
        source.version !==
        1
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


    const database =
        await openDatabase();


    const existingTracks =
        await getLocalLibrary();


    const existingById =
        new Map(
            existingTracks.map(
                track => [
                    track.id,
                    track,
                ]
            )
        );


    let nextPosition =
        existingTracks.length;


    const transaction =
        database.transaction(
            STORE_NAME,
            'readwrite'
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    for (
        const importedTrack
        of source.tracks
    ) {

        if (
            !isValidLocalTrack(
                importedTrack
            )
        ) {

            continue;

        }


        const existing =
            existingById.get(
                importedTrack.id
            );


        const now =
            Date.now();


        const track:
            LocalLibraryTrack = {

            ...importedTrack,

            position:
                existing?.position ??
                nextPosition++,

            addedAt:
                existing?.addedAt ??
                now,

            updatedAt:
                now,

        };


        store.put(
            track
        );

    }


    return new Promise(
        (
            resolve,
            reject
        ) => {

            transaction.oncomplete =
                async () => {

                    resolve(
                        await getLocalLibrary()
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


/* =========================================================
   VALIDATION
   ========================================================= */

function isValidLocalTrack(
    value:
        unknown
):
    value is LocalLibraryTrack {

    if (
        typeof value !==
        'object' ||
        value === null
    ) {

        return false;

    }


    const track =
        value as Partial<LocalLibraryTrack>;


    return (
        typeof track.id ===
            'number' &&

        typeof track.title ===
            'string' &&

        typeof track.duration ===
            'number' &&

        typeof track.youtubeVideoId ===
            'string' &&

        typeof track.position ===
            'number' &&

        typeof track.addedAt ===
            'number' &&

        typeof track.updatedAt ===
            'number' &&

        typeof track.artist ===
            'object' &&
        track.artist !==
            null &&

        typeof track.album ===
            'object' &&
        track.album !==
            null
    );

}
