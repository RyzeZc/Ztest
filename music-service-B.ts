import type {
    MusicAlbum,
    MusicApiCollection,
    MusicApiStatus,
    MusicArtist,
    MusicChart,
    MusicGenre,
    MusicPlaylist,
    MusicRadioStation,
    MusicRadioTrack,
    MusicResolveResponse,
    MusicSearchResponse,
    MusicTrack,
} from './music-types';


/* ============================================================
 * CONFIGURATION
 * ============================================================ */

const MUSIC_API_BASE_URL =
    '/api/v1';


export type MusicGlobalSearchCategory =
    | 'tracks'
    | 'artists'
    | 'albums'
    | 'playlists';


export interface MusicGlobalSearchPreview<T> {

    data:
        T[];

    total:
        number;
}


export interface MusicGlobalSearchResponse {

    query:
        string;

    preview_limit:
        number;

    tracks:
        MusicGlobalSearchPreview<MusicTrack>;

    artists:
        MusicGlobalSearchPreview<MusicArtist>;

    albums:
        MusicGlobalSearchPreview<MusicAlbum>;

    playlists:
        MusicGlobalSearchPreview<MusicPlaylist>;

    available:
        MusicGlobalSearchCategory[];

    status:
        'success'
        | 'partial'
        | 'not_found'
        | 'error';

    errors?:
        string[];
}

/* ============================================================
 * INTERNAL REQUEST HELPER
 * ============================================================ */

async function requestJSON<T>(
    path: string
): Promise<T> {

    const response =
        await fetch(
            `${MUSIC_API_BASE_URL}${path}`
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '[Music Service] Request failed:',
            response.status,
            path,
            errorText
        );

        throw new Error(
            `Music API request failed: ${response.status}`
        );
    }


    return response.json() as Promise<T>;
}


async function requestNextJSON<T>(
    next: string
): Promise<T> {

    if (
        !next.startsWith('/api/v1/')
    ) {
        throw new Error(
            'Invalid Music API next URL.'
        );
    }

    const response =
        await fetch(next);

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '[Music Service] Next request failed:',
            response.status,
            next,
            errorText
        );

        throw new Error(
            `Music API next request failed: ${response.status}`
        );
    }

    const data:
        unknown =
        await response.json();

    return data as T;
}


export async function getMusicApiNext<T>(
    next: string
): Promise<T> {

    return requestNextJSON<T>(
        next
    );
}

/* ============================================================
 * ARTISTS
 * ============================================================ */

export async function getArtist(
    artistId: number
): Promise<MusicArtist> {

    return requestJSON<MusicArtist>(
        `/artist/${artistId}`
    );
}


export async function getArtistTop(
    artistId: number,
    index = 0,
    limit = 10
): Promise<
    MusicApiCollection<MusicTrack>
> {

    return requestJSON<
        MusicApiCollection<MusicTrack>
    >(
        `/artist/${artistId}/top?index=${index}&limit=${limit}`
    );
}


export async function getArtistAlbums(
    artistId: number,
    index = 0,
    limit = 10
): Promise<
    MusicApiCollection<MusicAlbum>
> {

    return requestJSON<
        MusicApiCollection<MusicAlbum>
    >(
        `/artist/${artistId}/albums?index=${index}&limit=${limit}`
    );
}


/* ============================================================
 * ARTIST RADIO
 * ============================================================ */

export async function getArtistRadio(
    artistId: number
): Promise<
    MusicApiCollection<MusicRadioTrack>
> {

    return requestJSON<
        MusicApiCollection<MusicRadioTrack>
    >(
        `/artist/${artistId}/radio`
    );
}


/* ============================================================
 * TRACKS
 * ============================================================ */

export async function getTrack(
    trackId: number
): Promise<MusicTrack> {

    return requestJSON<MusicTrack>(
        `/track/${trackId}`
    );
}


/* ============================================================
 * ALBUMS
 * ============================================================ */

export async function getAlbum(
    albumId: number
): Promise<MusicAlbum> {

    return requestJSON<MusicAlbum>(
        `/album/${albumId}`
    );
}


export async function getAlbumTracks(
    albumId: number,
    index = 0,
    limit = 10
): Promise<
    MusicApiCollection<MusicTrack>
> {

    return requestJSON<
        MusicApiCollection<MusicTrack>
    >(
        `/album/${albumId}/tracks?index=${index}&limit=${limit}`
    );
}


/* ============================================================
 * PLAYLISTS
 * ============================================================ */

export async function getPlaylist(
    playlistId: number
): Promise<MusicPlaylist> {

    return requestJSON<MusicPlaylist>(
        `/playlist/${playlistId}`
    );
}


export async function getPlaylistTracks(
    playlistId: number,
    index = 0,
    limit = 10
): Promise<
    MusicApiCollection<MusicTrack>
> {

    return requestJSON<
        MusicApiCollection<MusicTrack>
    >(
        `/playlist/${playlistId}/tracks?index=${index}&limit=${limit}`
    );
}


/* ============================================================
 * GENRES
 * ============================================================ */

export async function getGenres(): Promise<
    MusicApiCollection<MusicGenre>
> {

    return requestJSON<
        MusicApiCollection<MusicGenre>
    >(
        '/genre'
    );
}


export async function getGenre(
    genreId: number
): Promise<MusicGenre> {

    return requestJSON<MusicGenre>(
        `/genre/${genreId}`
    );
}


/* ============================================================
 * CHART
 * ============================================================ */

export async function getChart(): Promise<MusicChart> {

    return requestJSON<MusicChart>(
        '/chart'
    );
}


export async function getGenreChart(
    genreId: number
): Promise<MusicChart> {

    return requestJSON<MusicChart>(
        `/chart/${genreId}`
    );
}


/* ============================================================
 * RADIO
 * ============================================================ */

export async function getRadioStations(): Promise<
    MusicApiCollection<MusicRadioStation>
> {

    return requestJSON<
        MusicApiCollection<MusicRadioStation>
    >(
        '/radio'
    );
}


/* ============================================================
 * SEARCH
 * ============================================================ */

export async function searchGlobal(
    query: string
): Promise<
    MusicGlobalSearchResponse
> {

    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );

    return requestJSON<
        MusicGlobalSearchResponse
    >(
        `/search?q=${encodedQuery}`
    );
}

export async function searchArtists(
    query: string,
    index = 0,
    limit = 10
): Promise<
    MusicSearchResponse<MusicArtist>
> {

    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );

    return requestJSON<
        MusicSearchResponse<MusicArtist>
    >(
        `/search/artist?q=${encodedQuery}&index=${index}&limit=${limit}`
    );
}

export async function searchTracks(
    query: string,
    index = 0,
    limit = 10
): Promise<
    MusicSearchResponse<MusicTrack>
> {

    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );

    return requestJSON<
        MusicSearchResponse<MusicTrack>
    >(
        `/search/track?q=${encodedQuery}&index=${index}&limit=${limit}`
    );
}


export async function searchAlbums(
    query: string,
    index = 0,
    limit = 10
): Promise<
    MusicSearchResponse<MusicAlbum>
> {

    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );

    return requestJSON<
        MusicSearchResponse<MusicAlbum>
    >(
        `/search/album?q=${encodedQuery}&index=${index}&limit=${limit}`
    );
}

export async function searchPlaylists(
    query: string,
    index = 0,
    limit = 10
): Promise<
    MusicSearchResponse<MusicPlaylist>
> {

    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );

    return requestJSON<
        MusicSearchResponse<MusicPlaylist>
    >(
        `/search/playlist?q=${encodedQuery}&index=${index}&limit=${limit}`
    );
}


/* ============================================================
 * RESOLVE
 * ============================================================ */

export async function resolveTrack(
    deezerId: number,
    artist: string,
    title: string
): Promise<MusicResolveResponse> {

    const encodedArtist =
        encodeURIComponent(
            artist
        );

    const encodedTitle =
        encodeURIComponent(
            title
        );


    return requestJSON<MusicResolveResponse>(
        `/resolve/${deezerId}/${encodedArtist}/${encodedTitle}`
    );
}
