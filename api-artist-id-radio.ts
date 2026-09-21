---
export const prerender = false;

const id = Astro.params.id;

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

if (!id) {
  return new Response(
    JSON.stringify({
      status: "error",
      message: "Artist ID is required"
    }),
    {
      status: 400,
      headers: jsonHeaders
    }
  );
}


/* =========================================================
   PARÁMETROS DE DEEZER
========================================================= */

const index =
  Astro.url.searchParams.get("index");

const limit =
  Astro.url.searchParams.get("limit");


/* =========================================================
   URL DEEZER
========================================================= */

const deezerUrl =
  new URL(
    `https://api.deezer.com/artist/${encodeURIComponent(id)}/radio`
  );

if (index) {
  deezerUrl.searchParams.set(
    "index",
    index
  );
}

if (limit) {
  deezerUrl.searchParams.set(
    "limit",
    limit
  );
}


/* =========================================================
   PETICIÓN
========================================================= */

try {

  const response = await fetch(
    deezerUrl.toString()
  );

  if (!response.ok) {
    throw new Error(
      `Deezer artist radio returned HTTP ${response.status}`
    );
  }

  const data =
    await response.json();


  /* =======================================================
     TRACKS
  ====================================================== */

  const tracks =
    (data.data ?? []).map(
      (track: any) => ({

        id:
          track.id,

        title:
          track.title,

        title_short:
          track.title_short,

        title_version:
          track.title_version,

        duration:
          track.duration,

        rank:
          track.rank,

        isrc:
          track.isrc,

        explicit_lyrics:
          track.explicit_lyrics,

        artist: {

          id:
            track.artist?.id,

          name:
            track.artist?.name

        },

        album: {

          id:
            track.album?.id,

          title:
            track.album?.title,

          cover:
            track.album?.cover_xl ??
            track.album?.cover_big ??
            track.album?.cover_medium ??
            track.album?.cover

        }

      })
    );


  /* =======================================================
     NEXT
  ====================================================== */

  let next = null;

  if (data.next) {

    const nextUrl =
      new URL(data.next);

    const nextParams =
      nextUrl.searchParams.toString();

    next =
      `/api/v1/artist/${encodeURIComponent(id)}/radio`;

    if (nextParams) {
      next += `?${nextParams}`;
    }
  }


  /* =======================================================
     RESPUESTA
  ====================================================== */

  const result = {

    data:
      tracks,

    total:
      data.total ?? 0,

    next,

    status:
      "success"

  };


  return new Response(
    JSON.stringify(result),
    {
      status: 200,
      headers: jsonHeaders
    }
  );


} catch (error) {

  console.error(
    "Artist radio API error:",
    error
  );

  return new Response(
    JSON.stringify({
      status: "error",
      message: "Unable to fetch artist radio"
    }),
    {
      status: 502,
      headers: jsonHeaders
    }
  );
}
---
