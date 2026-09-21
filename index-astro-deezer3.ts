---
export const prerender = false;

const search = Astro.url.searchParams.get("q")?.trim() || "";

function apiUrl(path: string) {
  return new URL(path, Astro.url).toString();
}

async function apiFetch<T = any>(path: string): Promise<T> {
  try {
    const response = await fetch(apiUrl(path));

    if (!response.ok) {
      console.error(`API HTTP ${response.status}: ${path}`);
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("Error consultando API interna:", error);
    return {} as T;
  }
}

/* =========================================================
   SEARCH
========================================================= */

let searchTracks: any[] = [];
let searchArtists: any[] = [];
let searchAlbums: any[] = [];
let searchPlaylists: any[] = [];

if (search) {
  const encodedSearch = encodeURIComponent(search);

  const [
    tracksResult,
    artistsResult,
    albumsResult,
    playlistsResult
  ] = await Promise.all([
    apiFetch(
      `/api/v1/search/track?q=${encodedSearch}&limit=10`
    ),
    apiFetch(
      `/api/v1/search/artist?q=${encodedSearch}&limit=10`
    ),
    apiFetch(
      `/api/v1/search/album?q=${encodedSearch}&limit=10`
    ),
    apiFetch(
      `/api/v1/search/playlist?q=${encodedSearch}&limit=10`
    )
  ]);

  searchTracks = tracksResult?.data ?? [];
  searchArtists = artistsResult?.data ?? [];
  searchAlbums = albumsResult?.data ?? [];
  searchPlaylists = playlistsResult?.data ?? [];
}

/* =========================================================
   HOME - TENDENCIAS
========================================================= */

let trendingTracks: any[] = [];
let trendingAlbums: any[] = [];
let trendingArtists: any[] = [];
let trendingPlaylists: any[] = [];

if (!search) {
  const chart = await apiFetch(
    "/api/v1/chart?limit=10"
  );

  trendingTracks = chart?.tracks?.data ?? [];
  trendingAlbums = chart?.albums?.data ?? [];
  trendingArtists = chart?.artists?.data ?? [];
  trendingPlaylists = chart?.playlists?.data ?? [];
}

/* =========================================================
   HOME - GENEROS
========================================================= */

let genres: any[] = [];

if (!search) {
  const genresResult = await apiFetch(
    "/api/v1/genre"
  );

  genres = genresResult?.data ?? [];
}
---

<div class="deezer-test">

  <!-- =====================================================
       HEADER
  ====================================================== -->

  <header class="header">

    <div class="header-inner">

      <a href="/deezer-test" class="logo">
        Deezer Test
      </a>

      <form method="GET" action="/deezer-test" class="search-form">
        <input
          type="search"
          name="q"
          value={search}
          placeholder="Buscar música, artistas, álbumes..."
          autocomplete="off"
        />

        <button type="submit">
          Buscar
        </button>

      </form>

    </div>

  </header>

  <!-- =====================================================
       CONTENIDO
  ====================================================== -->

  <main class="content">

    <!-- =================================================
         RESULTADOS DE BUSQUEDA
    ================================================== -->

    {search ? (

      <section class="search-results">

        <div class="section-header">

          <h1>
            Resultados para:
            <strong>{search}</strong>
          </h1>

          <a href="/deezer-test" class="back-home">
            ← Volver al inicio
          </a>

        </div>


        <!-- TRACKS -->

        {searchTracks.length > 0 && (

          <section class="result-section">

            <h2>TRACKS</h2>

            <div class="track-list">

              {searchTracks.map((track, index) => (

                <a
                  href={`/deezer-test/track/${track.id}`}
                  class="track-row"
                >

                  <span class="track-number">
                    {index + 1}
                  </span>

                  <img
                    src={track.album?.cover}
                    alt={track.title}
                  />

                  <div class="track-info">

                    <strong>
                      {track.title}
                    </strong>

                    <span>
                      {track.artist?.name}
                    </span>

                  </div>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ARTISTAS -->

        {searchArtists.length > 0 && (

          <section class="result-section">

            <h2>ARTISTAS</h2>

            <div class="card-grid">

              {searchArtists.map((artist) => (

                <a
                  href={`/deezer-test/artist/${artist.id}`}
                  class="card"
                >

                  <img
                    src={artist.picture}
                    alt={artist.name}
                  />

                  <strong>
                    {artist.name}
                  </strong>

                  <span>
                    Artista
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ALBUMES -->

        {searchAlbums.length > 0 && (

          <section class="result-section">

            <h2>ÁLBUMES</h2>

            <div class="card-grid">

              {searchAlbums.map((album) => (

                <a
                  href={`/deezer-test/${album.id}`}
                  class="card"
                >

                  <img
                    src={album.cover}
                    alt={album.title}
                  />

                  <strong>
                    {album.title}
                  </strong>

                  <span>
                    {album.artist?.name}
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- PLAYLISTS -->

        {searchPlaylists.length > 0 && (

          <section class="result-section">

            <h2>PLAYLISTS</h2>

            <div class="card-grid">

              {searchPlaylists.map((playlist) => (

                <a
                  href={`/deezer-test/playlist/${playlist.id}`}
                  class="card"
                >

                  <img
                    src={playlist.picture}
                    alt={playlist.title}
                  />

                  <strong>
                    {playlist.title}
                  </strong>

                  <span>
                    Playlist
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- SIN RESULTADOS -->

        {searchTracks.length === 0 &&
         searchArtists.length === 0 &&
         searchAlbums.length === 0 &&
         searchPlaylists.length === 0 && (

          <div class="empty">
            No encontramos resultados para
            <strong>{search}</strong>.
          </div>

        )}

      </section>


    ) : (

      <section class="home">

        <div class="home-title">

          <h1>
            Explora Deezer
          </h1>

          <p>
            Música, artistas, álbumes y playlists.
          </p>

        </div>


        <!-- ===============================================
             TENDENCIAS - TRACKS
        ================================================ -->

        {trendingTracks.length > 0 && (

          <section class="home-section">

            <div class="section-header">

              <h2>TENDENCIAS · TRACKS</h2>

            </div>

            <div class="track-list">

              {trendingTracks.map((track, index) => (

                <a
                  href={`/deezer-test/track/${track.id}`}
                  class="track-row"
                >

                  <span class="track-number">
                    {index + 1}
                  </span>

                  <img
                    src={track.album?.cover}
                    alt={track.title}
                  />

                  <div class="track-info">

                    <strong>
                      {track.title}
                    </strong>

                    <span>
                      {track.artist?.name}
                    </span>

                  </div>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ===============================================
             ÁLBUMES
        ================================================ -->

        {trendingAlbums.length > 0 && (

          <section class="home-section">

            <div class="section-header">

              <h2>ÁLBUMES</h2>

            </div>

            <div class="card-grid">

              {trendingAlbums.map((album) => (

                <a
                  href={`/deezer-test/${album.id}`}
                  class="card"
                >

                  <img
                    src={album.cover}
                    alt={album.title}
                  />

                  <strong>
                    {album.title}
                  </strong>

                  <span>
                    {album.artist?.name}
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ===============================================
             ARTISTAS
        ================================================ -->

        {trendingArtists.length > 0 && (

          <section class="home-section">

            <div class="section-header">

              <h2>ARTISTAS</h2>

            </div>

            <div class="card-grid">

              {trendingArtists.map((artist) => (

                <a
                  href={`/deezer-test/artist/${artist.id}`}
                  class="card artist-card"
                >

                  <img
                    src={artist.picture}
                    alt={artist.name}
                  />

                  <strong>
                    {artist.name}
                  </strong>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ===============================================
             PLAYLISTS
        ================================================ -->

        {trendingPlaylists.length > 0 && (

          <section class="home-section">

            <div class="section-header">

              <h2>PLAYLISTS</h2>

            </div>

            <div class="card-grid">

              {trendingPlaylists.map((playlist) => (

                <a
                  href={`/deezer-test/playlist/${playlist.id}`}
                  class="card"
                >

                  <img
                    src={playlist.picture}
                    alt={playlist.title}
                  />

                  <strong>
                    {playlist.title}
                  </strong>

                  <span>
                    Playlist
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}


        <!-- ===============================================
             DESCUBRE
        ================================================ -->

        <section class="home-section discover-section">

          <div class="section-header">

            <h2>DESCUBRE</h2>

          </div>

          <div class="discover-box">

            <h3>
              Descubre nueva música
            </h3>

            <p>
              Esta sección la conectaremos con la fuente real
              de Discovery de Deezer una vez que terminemos
              de validar su endpoint.
            </p>

          </div>

        </section>


        <!-- ===============================================
             GENEROS
        ================================================ -->

        {genres.length > 0 && (

          <section class="home-section">

            <div class="section-header">

              <h2>GÉNEROS</h2>

            </div>

            <div class="genre-grid">

              {genres.map((genre) => (

                <a
                  href={`/deezer-test/genre/${genre.id}`}
                  class="genre-card"
                >

                  {genre.picture && (

                    <img
                      src={genre.picture}
                      alt={genre.name}
                    />

                  )}

                  <span>
                    {genre.name}
                  </span>

                </a>

              ))}

            </div>

          </section>

        )}

      </section>

    )}

  </main>

</div>


<style>

  * {
    box-sizing: border-box;
  }

  .deezer-test {
    min-height: 100vh;
    background: #0d0d0d;
    color: #fff;
    font-family: Arial, sans-serif;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #111;
    border-bottom: 1px solid #222;
  }

  .header-inner {
    max-width: 1200px;
    margin: auto;
    padding: 18px 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
  }

  .logo {
    color: #fff;
    text-decoration: none;
    font-size: 22px;
    font-weight: 700;
    white-space: nowrap;
  }

  .search-form {
    display: flex;
    width: 100%;
    max-width: 650px;
  }

  .search-form input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #333;
    background: #1a1a1a;
    color: #fff;
    outline: none;
  }

  .search-form button {
    padding: 12px 20px;
    border: 0;
    background: #fff;
    color: #000;
    cursor: pointer;
    font-weight: 700;
  }

  .content {
    max-width: 1200px;
    margin: auto;
    padding: 40px 20px 80px;
  }

  .home-title {
    margin-bottom: 40px;
  }

  .home-title h1 {
    margin: 0 0 8px;
    font-size: 34px;
  }

  .home-title p {
    margin: 0;
    color: #888;
  }

  .home-section,
  .result-section {
    margin-bottom: 50px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
  }

  .section-header h1,
  .section-header h2 {
    margin: 0;
  }

  .section-header h2 {
    font-size: 20px;
    letter-spacing: .5px;
  }

  .section-header h1 {
    font-size: 25px;
  }

  .back-home {
    color: #aaa;
    text-decoration: none;
  }

  .back-home:hover {
    color: #fff;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }

  .card {
    display: block;
    padding: 12px;
    background: #151515;
    color: #fff;
    text-decoration: none;
    border: 1px solid #222;
    transition: .2s ease;
  }

  .card:hover {
    background: #202020;
    transform: translateY(-2px);
  }

  .card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
    margin-bottom: 12px;
  }

  .card strong {
    display: block;
    font-size: 15px;
    line-height: 1.3;
  }

  .card span {
    display: block;
    margin-top: 5px;
    color: #888;
    font-size: 13px;
  }

  .artist-card img {
    border-radius: 50%;
  }

  .track-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #222;
  }

  .track-row {
    display: grid;
    grid-template-columns: 35px 55px 1fr;
    align-items: center;
    gap: 15px;
    padding: 10px;
    border-bottom: 1px solid #222;
    color: #fff;
    text-decoration: none;
    background: #111;
  }

  .track-row:hover {
    background: #1c1c1c;
  }

  .track-number {
    color: #666;
    text-align: center;
  }

  .track-row img {
    width: 55px;
    height: 55px;
    object-fit: cover;
  }

  .track-info strong {
    display: block;
  }

  .track-info span {
    display: block;
    margin-top: 4px;
    color: #888;
    font-size: 13px;
  }

  .genre-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
  }

  .genre-card {
    position: relative;
    min-height: 130px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    padding: 15px;
    color: #fff;
    text-decoration: none;
    background: #191919;
  }

  .genre-card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .55;
  }

  .genre-card span {
    position: relative;
    z-index: 1;
    font-weight: 700;
    text-shadow: 0 2px 5px #000;
  }

  .discover-box {
    padding: 35px;
    background: #151515;
    border: 1px solid #222;
  }

  .discover-box h3 {
    margin-top: 0;
  }

  .discover-box p {
    color: #888;
    max-width: 700px;
    line-height: 1.6;
  }

  .empty {
    padding: 50px 20px;
    text-align: center;
    color: #888;
    background: #151515;
  }

  @media (max-width: 900px) {

    .card-grid,
    .genre-grid {
      grid-template-columns: repeat(3, 1fr);
    }

  }

  @media (max-width: 600px) {

    .header-inner {
      flex-direction: column;
      align-items: stretch;
    }

    .search-form {
      max-width: none;
    }

    .card-grid,
    .genre-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .track-row {
      grid-template-columns: 30px 50px 1fr;
    }

    .track-row img {
      width: 50px;
      height: 50px;
    }

  }

</style>
