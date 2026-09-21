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

export async function searchArtists(
    query: string
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
        `/search/artist?q=${encodedQuery}`
    );
}


export async function searchTracks(
    query: string
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
        `/search/track?q=${encodedQuery}`
    );
}


export async function searchAlbums(
    query: string
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
        `/search/album?q=${encodedQuery}`
    );
}


export async function searchPlaylists(
    query: string
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
        `/search/playlist?q=${encodedQuery}`
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
