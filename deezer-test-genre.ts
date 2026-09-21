---
export const prerender = false;

const { id } = Astro.params;

if (!id) {
  throw new Error("No se proporcionó el ID del género.");
}


/* =========================================================
   GENERO
========================================================= */

const genreResponse = await fetch(
  `https://api.deezer.com/genre/${id}`
);

if (!genreResponse.ok) {
  throw new Error(
    `Deezer respondió con HTTP ${genreResponse.status}`
  );
}

const genre = await genreResponse.json();

if (!genre?.id) {
  throw new Error(
    "Deezer no devolvió información válida del género."
  );
}


/* =========================================================
   CHART DEL GENERO
========================================================= */

const chartResponse = await fetch(
  `https://api.deezer.com/chart/${id}?limit=20`
);

if (!chartResponse.ok) {
  throw new Error(
    `Deezer respondió con HTTP ${chartResponse.status}`
  );
}

const chart = await chartResponse.json();

const tracks = chart?.tracks?.data ?? [];
const albums = chart?.albums?.data ?? [];
const artists = chart?.artists?.data ?? [];


/* =========================================================
   DURACION
========================================================= */

function formatDuration(seconds: number) {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = String(
    seconds % 60
  ).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}
---

<div class="genre-page">

  <!-- =====================================================
       VOLVER
  ====================================================== -->

  <a href="/deezer-test" class="back">
    ← Volver
  </a>


  <!-- =====================================================
       HEADER
  ====================================================== -->

  <section class="genre-header">

    {genre.picture_xl && (
      <div class="genre-cover">

        <img
          src={genre.picture_xl}
          alt={genre.name}
        />

      </div>
    )}

    <div class="genre-info">

      <span class="label">
        GÉNERO
      </span>

      <h1>
        {genre.name}
      </h1>

      <p>
        Música destacada de {genre.name}
      </p>

    </div>

  </section>


  <!-- =====================================================
       TRACKS
  ====================================================== -->

  {tracks.length > 0 && (

    <section class="genre-section">

      <div class="section-header">

        <h2>
          TOP TRACKS
        </h2>

      </div>


      <div class="track-list">

        {tracks.map((track, index) => (

          <a
            href={`/deezer-test/track/${track.id}`}
            class="track-row"
          >

            <span class="track-number">
              {index + 1}
            </span>


            <img
              src={track.album?.cover_medium}
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


            <span class="duration">
              {formatDuration(track.duration ?? 0)}
            </span>

          </a>

        ))}

      </div>

    </section>

  )}


  <!-- =====================================================
       ALBUMES
  ====================================================== -->

  {albums.length > 0 && (

    <section class="genre-section">

      <div class="section-header">

        <h2>
          ÁLBUMES
        </h2>

      </div>


      <div class="card-grid">

        {albums.map((album) => (

          <a
            href={`/deezer-test/${album.id}`}
            class="card"
          >

            <img
              src={album.cover_medium}
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


  <!-- =====================================================
       ARTISTAS
  ====================================================== -->

  {artists.length > 0 && (

    <section class="genre-section">

      <div class="section-header">

        <h2>
          ARTISTAS
        </h2>

      </div>


      <div class="card-grid">

        {artists.map((artist) => (

          <a
            href={`/deezer-test/artist/${artist.id}`}
            class="card artist-card"
          >

            <img
              src={artist.picture_medium}
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


  <!-- =====================================================
       SIN CONTENIDO
  ====================================================== -->

  {tracks.length === 0 &&
   albums.length === 0 &&
   artists.length === 0 && (

    <div class="empty">
      No hay contenido disponible para este género.
    </div>

  )}

</div>


<style>

  .genre-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px 80px;
    color: #fff;
  }


  /* =====================================================
     VOLVER
  ====================================================== */

  .back {
    display: inline-block;
    margin-bottom: 35px;
    color: #aaa;
    text-decoration: none;
  }

  .back:hover {
    color: #fff;
  }


  /* =====================================================
     HEADER
  ====================================================== */

  .genre-header {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 60px;
  }

  .genre-cover img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
  }

  .genre-info {
    padding: 20px 0;
  }

  .label {
    color: #888;
    font-size: 13px;
    letter-spacing: 2px;
  }

  h1 {
    margin: 10px 0;
    font-size: 52px;
    line-height: 1.1;
  }

  .genre-info p {
    margin: 0;
    color: #888;
  }


  /* =====================================================
     SECCIONES
  ====================================================== */

  .genre-section {
    margin-bottom: 60px;
  }

  .section-header {
    margin-bottom: 20px;
  }

  .section-header h2 {
    margin: 0;
    font-size: 20px;
    letter-spacing: .5px;
  }


  /* =====================================================
     TRACKS
  ====================================================== */

  .track-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #222;
  }

  .track-row {
    display: grid;

    grid-template-columns:
      35px
      55px
      1fr
      70px;

    align-items: center;

    gap: 15px;

    padding: 10px;

    border-bottom: 1px solid #222;

    background: #111;

    color: #fff;

    text-decoration: none;

    transition: background .2s ease;
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

  .duration {
    color: #777;
    font-size: 13px;
    text-align: right;
  }


  /* =====================================================
     CARDS
  ====================================================== */

  .card-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }

  .card {
    display: block;
    padding: 12px;

    background: #151515;
    border: 1px solid #222;

    color: #fff;
    text-decoration: none;

    transition:
      background .2s ease,
      transform .2s ease;
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


  /* =====================================================
     EMPTY
  ====================================================== */

  .empty {
    padding: 50px 20px;
    text-align: center;
    color: #888;
    background: #151515;
    border: 1px solid #222;
  }


  /* =====================================================
     RESPONSIVE
  ====================================================== */

  @media (max-width: 900px) {

    .card-grid {
      grid-template-columns: repeat(3, 1fr);
    }

  }


  @media (max-width: 700px) {

    .genre-header {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .genre-cover {
      max-width: 280px;
    }

    h1 {
      font-size: 38px;
    }

    .track-row {
      grid-template-columns:
        30px
        50px
        1fr;
    }

    .track-row img {
      width: 50px;
      height: 50px;
    }

    .duration {
      display: none;
    }

    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }

  }

</style>
