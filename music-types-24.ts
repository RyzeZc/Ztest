/*
 * ============================================================
 * MUSIC API — TYPES
 * ============================================================
 *
 * Tipos utilizados por la Music API propia de New Retro.
 *
 * Importante:
 * - Los IDs de música pertenecen al espacio de Deezer.
 * - Los IDs de reproducción de YouTube pertenecen a otro
 *   espacio y nunca deben mezclarse con los anteriores.
 *
 * MusicPlayer no debería necesitar conocer la estructura
 * interna de Deezer ni de YouTube.
 */


/* ============================================================
 * COMMON
 * ============================================================ */

export type MusicApiStatus =
    | 'success'
    | 'not_found'
    | 'error';


export interface MusicApiCollection<T> {

    data: T[];

    total: number;

    next: string | null;

    status: MusicApiStatus;
}


/* ============================================================
 * ARTIST
 * ============================================================ */

export interface MusicArtist {

    id: number;

    name: string;

    picture?: string;

    nb_album?: number;

    nb_fan?: number;

    type?: string;
}


/* ============================================================
 * ALBUM
 * ============================================================ */

export interface MusicAlbum {

    id: number;

    title: string;

    cover: string;

    release_date?: string;

    nb_tracks?: number;

    fans?: number;

    artist?: MusicArtist;

    genres?: MusicGenre[];

    genre_id?: number;

    record_type?: string;

    explicit_lyrics?: boolean;

    type?: string;
}


/* ============================================================
 * TRACK
 * ============================================================ */

export interface MusicTrack {

    id: number;

    title: string;

    title_short?: string;

    title_version?: string;

    duration: number;

    track_position?: number;

    disk_number?: number;

    position?: number;

    rank?: number;

    isrc?: string;

    explicit_lyrics?: boolean;

    artist: MusicArtist;

    album: MusicAlbum;
}


/* ============================================================
 * ARTIST RADIO
 * ============================================================ */

/*
 * Es el track reducido que devuelve específicamente:
 *
 * /api/v1/artist/{id}/radio
 *
 * Lo mantenemos separado de MusicTrack porque el endpoint
 * tiene una respuesta deliberadamente más pequeña.
 */

export interface MusicRadioTrack {

    id: number;

    title: string;

    title_short: string;

    title_version: string;

    duration: number;

    rank: number;

    explicit_lyrics: boolean;

    artist: MusicArtist;

    album: MusicAlbum;
}


/* ============================================================
 * GENRE
 * ============================================================ */

export interface MusicGenre {

    id: number;

    name: string;

    picture?: string;

    type?: string;
}


/* ============================================================
 * PLAYLIST
 * ============================================================ */

export interface MusicPlaylistUser {

    id: number;

    name: string;

    type: string;
}


export interface MusicPlaylist {

    id: number;

    title: string;

    public?: boolean;

    nb_tracks?: number;

    picture?: string;

    creation_date?: string;

    add_date?: string;

    mod_date?: string;

    picture_type?: string;

    user?: MusicPlaylistUser;
}


/* ============================================================
 * RADIO STATION
 * ============================================================ */

export interface MusicRadioStation {

    id: number;

    title: string;

    description?: string;

    picture?: string;

    type: string;
}


/* ============================================================
 * SEARCH
 * ============================================================ */

export interface MusicSearchResponse<T> {

    data: T[];

    total: number;

    next: string | null;

    status: MusicApiStatus;
}


/* ============================================================
 * CHART
 * ============================================================ */

export interface MusicChart {

    tracks: MusicApiCollection<MusicTrack>;

    albums: MusicApiCollection<MusicAlbum>;

    artists: MusicApiCollection<MusicArtist>;

    playlists: MusicApiCollection<MusicPlaylist>;

    next: string | null;

    status: MusicApiStatus;
}


/* ============================================================
 * RESOLVE
 * ============================================================ */

/*
 * Deezer track → YouTube Music.
 *
 * El "id" de aquí es EXCLUSIVAMENTE un YouTube video ID.
 */

export interface MusicResolveResult {

    id: string;

    artist: string;

    title: string;
}


export interface MusicResolveResponse {

    results: MusicResolveResult[];

    status: MusicApiStatus;
}


/* ============================================================
 * PLAYER TRACK
 * ============================================================ */

/*
 * Esta es la representación que eventualmente utilizará
 * directamente el reproductor.
 *
 * Aquí sí mantenemos explícitamente los dos espacios de IDs.
 */

export interface MusicPlayerTrack {

    deezerId: number;

    youtubeId: string | null;

    title: string;

    artist: string;

    cover: string | null;

    duration: number;

    albumId?: number;

    albumTitle?: string;
}
