---
export const prerender = false;

const { id } = Astro.params;

if (!id) {
  throw new Error("No se proporcionó el ID del artista.");
}


/* =========================================================
   ARTISTA
========================================================= */

const artistResponse = await fetch(
  `https://api.deezer.com/artist/${id}`
);

if (!artistResponse.ok) {
  throw new Error(
    `Deezer respondió con HTTP ${artistResponse.status}`
  );
}

const artist = await artistResponse.json();

if (!artist?.id) {
  throw new Error(
    "Deezer no devolvió información válida del artista."
  );
}


/* =========================================================
   TOP TRACKS
========================================================= */

const topResponse = await fetch(
  `https://api.deezer.com/artist/${id}/top?limit=10`
);

if (!topResponse.ok) {
  throw new Error(
    `Deezer respondió con HTTP ${topResponse.status}`
  );
}

const topResult = await topResponse.json();

const tracks = topResult?.data ?? [];


/* =========================================================
   ÁLBUMES
========================================================= */

const albumsResponse = await fetch(
  `https://api.deezer.com/artist/${id}/albums?limit=20`
);

if (!albumsResponse.ok) {
  throw new Error(
    `Deezer respondió con HTTP ${albumsResponse.status}`
  );
}

const albumsResult = await albumsResponse.json();

const albums = albumsResult?.data ?? [];


/* =========================================================
   FUNCIONES
========================================================= */

function formatDuration(seconds: number) {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = String(
    seconds % 60
  ).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}
---

<div class="artist-page">

  <!-- =====================================================
       VOLVER
  ====================================================== -->

  <a href="/deezer-test" class="back">
    ← Volver
  </a>


  <!-- =====================================================
       ARTISTA
  ====================================================== -->

  <section class="artist-header">

    <div class="artist-image">

      {artist.picture_xl && (
        <img
          src={artist.picture_xl}
          alt={artist.name}
        />
      )}

    </div>


    <div class="artist-info">

      <span class="label">
        ARTISTA
      </span>

      <h1>
        {artist.name}
      </h1>

      {artist.nb_fan !== undefined && (
        <p class="fans">
          {artist.nb_fan.toLocaleString("es-ES")} fans
        </p>
      )}

    </div>

  </section>


  <!-- =====================================================
       TOP TRACKS
  ====================================================== -->

  {tracks.length > 0 && (

    <section class="artist-section">

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
                {track.album?.title}
              </span>

            </div>


            <span class="duration">
              {formatDuration(track.duration)}
            </span>

          </a>

        ))}

      </div>

    </section>

  )}


  <!-- =====================================================
       ÁLBUMES
  ====================================================== -->

  {albums.length > 0 && (

    <section class="artist-section">

      <div class="section-header">

        <h2>
          ÁLBUMES
        </h2>

      </div>


      <div class="album-grid">

        {albums.map((album) => (

          <a
            href={`/deezer-test/${album.id}`}
            class="album-card"
          >

            <img
              src={album.cover_medium}
              alt={album.title}
            />

            <strong>
              {album.title}
            </strong>

            {album.release_date && (
              <span>
                {album.release_date.substring(0, 4)}
              </span>
            )}

          </a>

        ))}

      </div>

    </section>

  )}

</div>


<style>

  .artist-page {
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
     ARTISTA
  ====================================================== */

  .artist-header {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 60px;
  }

  .artist-image img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .artist-info {
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

  .fans {
    margin: 0;
    color: #888;
    font-size: 15px;
  }


  /* =====================================================
     SECCIONES
  ====================================================== */

  .artist-section {
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
     ÁLBUMES
  ====================================================== */

  .album-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }

  .album-card {
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

  .album-card:hover {
    background: #202020;
    transform: translateY(-2px);
  }

  .album-card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
    margin-bottom: 12px;
  }

  .album-card strong {
    display: block;
    font-size: 15px;
    line-height: 1.3;
  }

  .album-card span {
    display: block;
    margin-top: 5px;
    color: #888;
    font-size: 13px;
  }


  /* =====================================================
     RESPONSIVE
  ====================================================== */

  @media (max-width: 900px) {

    .album-grid {
      grid-template-columns: repeat(3, 1fr);
    }

  }


  @media (max-width: 700px) {

    .artist-header {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .artist-image {
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

    .album-grid {
      grid-template-columns: repeat(2, 1fr);
    }

  }

</style>
