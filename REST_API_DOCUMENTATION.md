# REST API v1 — Documentación técnica

## 1. Descripción general

Nuestra API REST funciona como una capa propia sobre Deezer para obtener metadatos musicales y, adicionalmente, incorpora un resolver que utiliza YouTube Music mediante `youtubei.js` para localizar el vídeo que usará el reproductor.

### Flujo general

```text
Frontend
   │
   ▼
REST API v1
   ├── Deezer API
   │    ├── Albums
   │    ├── Tracks
   │    ├── Artists
   │    ├── Playlists
   │    ├── Genres
   │    ├── Charts
   │    ├── Radio
   │    └── Search
   │
   └── YouTube Music / youtubei.js
        └── Resolve → YouTube video ID
```

Las rutas dinámicas de Astro utilizan:

```astro
export const prerender = false;
```

---

# 2. Árbol de endpoints

```text
/api/v1/
│
├── album/
│   ├── [id]
│   └── [id]/tracks
│
├── track/[id]
│
├── artist/
│   ├── [id]
│   ├── top
│   ├── albums
│   └── radio
│
├── playlist/
│   ├── [id]
│   └── tracks
│
├── genre/
│   ├── index
│   └── [id]
│
├── chart/
│   ├── index
│   └── [id]
│
├── radio/index
│
├── search/
│   ├── artist
│   ├── track
│   ├── album
│   └── playlist
│
└── resolve/[...params]
```

### Archivos físicos

```text
src/pages/api/v1/
├── album/
│   ├── [id].astro
│   └── [id]/tracks.astro
├── track/[id].astro
├── artist/
│   ├── [id].astro
│   ├── top.astro
│   ├── albums.astro
│   └── radio.astro
├── playlist/
│   ├── [id].astro
│   └── tracks.astro
├── genre/
│   ├── index.astro
│   └── [id].astro
├── chart/
│   ├── index.astro
│   └── [id].astro
├── radio/index.astro
├── search/
│   ├── artist.astro
│   ├── track.astro
│   ├── album.astro
│   └── playlist.astro
└── resolve/[...params].astro
```

---

# 3. Convenciones generales

Las respuestas utilizan JSON.

Las colecciones siguen, cuando corresponde, una estructura de este tipo:

```json
{
  "data": [],
  "total": 0,
  "next": null,
  "status": "success"
}
```

### Estados utilizados

| Estado | Significado |
|---|---|
| `success` | Petición procesada correctamente |
| `not_found` | No existe información o resolución válida |
| `error` | Ocurrió un error durante el procesamiento |

Los IDs de tracks, artistas, álbumes, playlists y géneros son los IDs originales de Deezer.

---

# 4. Albums

## 4.1 GET `/api/v1/album/{id}`

Obtiene únicamente los metadatos del álbum. No incluye sus canciones.

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del álbum en Deezer |

### Ejemplo

```http
GET /api/v1/album/302127
```

### Respuesta

```json
{
  "id": 302127,
  "title": "Discovery",
  "artist": {
    "id": 27,
    "name": "Daft Punk"
  },
  "cover": "https://...",
  "release_date": "2001-03-12",
  "nb_tracks": 14,
  "fans": 123456,
  "genres": [
    {
      "id": 113,
      "name": "Dance"
    }
  ],
  "status": "success"
}
```

---

## 4.2 GET `/api/v1/album/{id}/tracks`

Obtiene los tracks de un álbum y conserva la paginación de Deezer.

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del álbum |
| `index` | integer | Índice de paginación |
| `limit` | integer | Cantidad solicitada |

### Ejemplo

```http
GET /api/v1/album/302127/tracks?index=0&limit=10
```

### Track devuelto

```json
{
  "id": 3135553,
  "title": "One More Time",
  "title_short": "One More Time",
  "title_version": "",
  "duration": 320,
  "track_position": 1,
  "rank": 1000000,
  "isrc": "US...",
  "explicit_lyrics": false,
  "artist": {
    "id": 27,
    "name": "Daft Punk"
  },
  "album": {
    "id": 302127,
    "title": "Discovery",
    "cover": "https://..."
  }
}
```

Respuesta de colección:

```json
{
  "data": [],
  "total": 14,
  "next": "/api/v1/album/302127/tracks?index=10&limit=10",
  "status": "success"
}
```

`track_position` es la posición dentro del álbum.

---

# 5. Tracks

## 5.1 GET `/api/v1/track/{id}`

Obtiene la información principal de un track.

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del track en Deezer |

### Ejemplo

```http
GET /api/v1/track/1563415072
```

### Respuesta

```json
{
  "id": 1563415072,
  "title": "Desesperados",
  "duration": 224,
  "track_position": 1,
  "disk_number": 1,
  "rank": 1234567,
  "release_date": "2021-12-10",
  "isrc": "...",
  "artist": {
    "id": 12345,
    "name": "Rauw Alejandro",
    "picture": "https://..."
  },
  "album": {
    "id": 98765,
    "title": "...",
    "cover": "https://..."
  },
  "status": "success"
}
```

### Campos no utilizados

`preview` y `readable` fueron excluidos porque la reproducción se resuelve mediante YouTube.

---

# 6. Artists

## 6.1 GET `/api/v1/artist/{id}`

Obtiene la información básica del artista.

```json
{
  "id": 12345,
  "name": "Rauw Alejandro",
  "picture": "https://...",
  "nb_album": 10,
  "nb_fan": 5000000,
  "type": "artist",
  "status": "success"
}
```

---

## 6.2 GET `/api/v1/artist/{id}/top`

Obtiene los principales tracks del artista.

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del artista |
| `index` | integer | Índice de paginación |
| `limit` | integer | Cantidad solicitada |

Ejemplo:

```http
GET /api/v1/artist/12345/top?index=0&limit=10
```

La respuesta conserva `data`, `total` y `next` cuando Deezer los proporciona.

---

## 6.3 GET `/api/v1/artist/{id}/albums`

Obtiene los álbumes del artista.

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del artista |
| `index` | integer | Índice de paginación |
| `limit` | integer | Cantidad solicitada |

### Campos de cada álbum

```json
{
  "id": 123,
  "title": "Album name",
  "cover": "https://...",
  "genre_id": 113,
  "fans": 123456,
  "release_date": "2020-01-01",
  "record_type": "album",
  "explicit_lyrics": false,
  "type": "album"
}
```

---

## 6.4 GET `/api/v1/artist/{id}/radio`

Obtiene una selección de tracks relacionada con el artista. Está pensada principalmente para generar la cola del reproductor.

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del artista |

### Respuesta conceptual

```json
{
  "data": [
    {
      "id": 1563415072,
      "title": "Desesperados",
      "duration": 224,
      "artist": {
        "id": 12345,
        "name": "Rauw Alejandro"
      },
      "album": {
        "id": 98765,
        "title": "...",
        "cover": "https://..."
      }
    }
  ],
  "next": "...",
  "status": "success"
}
```

No se fabrican resultados cuando Deezer devuelve una colección vacía.

---

# 7. Playlists

## 7.1 GET `/api/v1/playlist/{id}`

Devuelve los metadatos de la playlist. La lista de canciones se obtiene mediante el endpoint de tracks.

---

## 7.2 GET `/api/v1/playlist/{id}/tracks`

Obtiene los tracks de una playlist.

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID de playlist |
| `index` | integer | Índice de paginación |
| `limit` | integer | Cantidad solicitada |

### Track

```json
{
  "id": 123,
  "title": "Song",
  "title_short": "Song",
  "title_version": "",
  "duration": 200,
  "rank": 123456,
  "isrc": "...",
  "explicit_lyrics": false,
  "artist": {
    "id": 1,
    "name": "Artist"
  },
  "album": {
    "id": 2,
    "title": "Album",
    "cover": "https://..."
  }
}
```

Respuesta de colección:

```json
{
  "data": [],
  "total": 0,
  "next": null,
  "status": "success"
}
```

---

# 8. Genres

## 8.1 GET `/api/v1/genre`

Lista los géneros disponibles.

```json
{
  "data": [
    {
      "id": 132,
      "name": "Pop",
      "picture": "https://..."
    }
  ],
  "total": 0,
  "next": null,
  "status": "success"
}
```

En la colección no se añade el campo redundante `type`.

---

## 8.2 GET `/api/v1/genre/{id}`

Obtiene un género individual.

```json
{
  "id": 132,
  "name": "Pop",
  "picture": "https://...",
  "type": "genre",
  "status": "success"
}
```

---

# 9. Charts

## 9.1 GET `/api/v1/chart`

Obtiene el chart general con las colecciones de:

```text
tracks
albums
artists
playlists
```

Estructura conceptual:

```json
{
  "tracks": {
    "data": [],
    "total": 0
  },
  "albums": {
    "data": [],
    "total": 0
  },
  "artists": {
    "data": [],
    "total": 0
  },
  "playlists": {
    "data": [],
    "total": 0
  },
  "next": null,
  "status": "success"
}
```

---

## 9.2 GET `/api/v1/chart/{genreId}`

Obtiene el chart filtrado por género.

### Diferencia importante: `position` vs `track_position`

En los tracks del chart:

```json
"position": 1
```

representa la posición del track en el chart.

En cambio:

```json
"track_position": 3
```

representa la posición del track dentro de su álbum.

---

# 10. Radio

## 10.1 GET `/api/v1/radio`

Obtiene la lista de radios de Deezer.

Fuente utilizada:

```text
https://api.deezer.com/radio/
```

### Respuesta

```json
{
  "data": [
    {
      "id": 1,
      "title": "Radio",
      "description": "...",
      "picture": "https://...",
      "type": "radio"
    }
  ],
  "next": null,
  "status": "success"
}
```

No se agregan límites artificiales cuando Deezer ya controla la cantidad de resultados.

---

# 11. Search

La búsqueda se separa por recurso.

## 11.1 GET `/api/v1/search/artist?q={query}`

Ejemplo:

```http
GET /api/v1/search/artist?q=Rauw%20Alejandro
```

Busca artistas.

---

## 11.2 GET `/api/v1/search/track?q={query}`

Ejemplo:

```http
GET /api/v1/search/track?q=Desesperados
```

Busca canciones/tracks.

---

## 11.3 GET `/api/v1/search/album?q={query}`

Ejemplo:

```http
GET /api/v1/search/album?q=Discovery
```

Busca álbumes.

---

## 11.4 GET `/api/v1/search/playlist?q={query}`

Ejemplo:

```http
GET /api/v1/search/playlist?q=Workout
```

### Campos principales

```json
{
  "id": 123,
  "title": "Playlist",
  "public": true,
  "nb_tracks": 50,
  "picture": "https://...",
  "creation_date": "2020-01-01",
  "add_date": "2020-01-01",
  "mod_date": "2020-01-01",
  "picture_type": "playlist",
  "user": {
    "id": 123,
    "name": "User",
    "type": "user"
  }
}
```

Se eliminan campos de imagen redundantes (`picture_small`, `picture_medium`, `picture_big`, `picture_xl`) y campos internos que no necesitamos para el frontend actual, como checksum, tracklist y otros metadatos auxiliares.

---

# 12. Resolve — Deezer → YouTube Music

## 12.1 Propósito

`resolve` es el endpoint encargado de convertir la información de un track de Deezer en uno o más posibles IDs de vídeo de YouTube Music para la reproducción.

Flujo:

```text
Deezer track
   │
   ├── Deezer ID
   ├── Artist
   └── Title
          │
          ▼
/api/v1/resolve/...
          │
          ▼
YouTube Music search
          │
          ▼
     youtubei.js
          │
          ▼
YouTube video ID
          │
          ▼
      Player
```

---

## 12.2 GET `/api/v1/resolve/{...params}`

La implementación usa una ruta catch-all:

```text
src/pages/api/v1/resolve/[...params].astro
```

La forma utilizada durante las pruebas es:

```http
GET /api/v1/resolve/{deezerId}/{artist}/{title}
```

Ejemplo:

```http
GET /api/v1/resolve/1563415072/Rauw%20Alejandro/Desesperados
```

El `deezerId` se valida. El nombre del artista y el título se utilizan para formar la consulta de YouTube Music.

---

## 12.3 Respuesta exitosa

```json
{
  "results": [
    {
      "id": "j-UZMyi6YHA",
      "artist": "Rauw Alejandro",
      "title": "Desesperados"
    }
  ],
  "status": "success"
}
```

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `results` | array | Posibles coincidencias obtenidas desde YouTube Music |
| `results[].id` | string | YouTube video ID |
| `results[].artist` | string | Artista devuelto por YouTube Music |
| `results[].title` | string | Título devuelto por YouTube Music |
| `status` | string | Estado de la resolución |

---

## 12.4 Sin resultados

```json
{
  "results": [],
  "status": "not_found"
}
```

---

## 12.5 Error

```json
{
  "results": [],
  "status": "error"
}
```

---

# 13. Implementación de YouTube

Archivo:

```text
src/lib/youtube.ts
```

Implementación actual:

```ts
import { Innertube, UniversalCache } from "youtubei.js";

let youtubeInstance: Innertube | null = null;
let youtubePromise: Promise<Innertube> | null = null;

export async function getYouTube(): Promise<Innertube> {
  if (youtubeInstance) return youtubeInstance;

  if (!youtubePromise) {
    youtubePromise = Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
      retrieve_player: false,
      enable_session_cache: true
    });
  }

  youtubeInstance = await youtubePromise;
  return youtubeInstance;
}
```

La instancia es compartida para evitar reinicializar `Innertube` en cada petición.

---

# 14. Búsqueda utilizada por resolve

La búsqueda se realiza con el Music API de `youtubei.js`:

```ts
const search = await youtube.music.search(searchQuery, {
  type: "song"
});
```

Los resultados relevantes se encuentran en el `MusicShelf` y se consideran elementos cuyo `item_type` es `song`.

Ejemplo de estructura original de un resultado:

```json
{
  "videoId": "JhulBGMA7G4",
  "title": "Harder, Better, Faster, Stronger",
  "artists": [
    {
      "id": null,
      "name": "Daft Punk"
    }
  ],
  "artist": "Daft Punk",
  "album": {
    "id": "MPRE...",
    "name": "Discovery"
  },
  "duration": {
    "text": "3:47",
    "seconds": 227
  }
}
```

Nuestra API reduce esta estructura al mínimo necesario para el reproductor.

---

# 15. Caché del resolver

El resolver mantiene un caché en memoria mediante `globalThis`.

### Configuración actual

```text
TTL = 10 minutos
```

La clave utiliza artista y título normalizados:

```text
artist.trim().toLowerCase()::title.trim().toLowerCase()
```

### Flujo

```text
Petición
   │
   ▼
¿Está en caché?
   ├── Sí → devolver resultado
   │
   └── No
        │
        ▼
¿Ya existe una búsqueda idéntica en curso?
   ├── Sí → esperar esa búsqueda
   │
   └── No
        │
        ▼
   YouTube Music
        │
        ▼
   guardar resultado
        │
        ▼
     responder
```

La caché reduce llamadas repetidas a YouTube Music.

---

# 16. Pending map

Además de la caché existe un mapa de peticiones pendientes.

Su función es evitar que varias solicitudes concurrentes para el mismo artista/título disparen varias búsquedas idénticas.

```text
Cliente A ─┐
Cliente B ─┼──► misma búsqueda
Cliente C ─┘
               │
               ▼
        una búsqueda real
               │
          ┌────┼────┐
          ▼    ▼    ▼
          A    B    C
```

Esto reduce el consumo de recursos y ayuda a controlar picos de solicitudes repetidas.

---

# 17. Número de resultados de resolve

La implementación actual conserva hasta dos resultados válidos encontrados en YouTube Music.

El primero suele ser la coincidencia principal y el segundo se mantiene como posible fallback del reproductor.

### Limitación conocida

Todavía no se aplica un sistema avanzado de scoring o validación exacta de artista/título entre Deezer y cada resultado de YouTube Music.

Por ello, el segundo resultado puede ser otra canción del mismo artista. Esta parte se mantiene deliberadamente así hasta realizar una mejora específica del resolver.

---

# 18. Integración con el reproductor

El flujo previsto es:

```text
1. Usuario selecciona un track de Deezer
2. Se obtiene su metadata
3. Se llama a resolve
4. Se obtiene un YouTube video ID
5. Se carga el vídeo en YouTube IFrame Player
6. Se reproduce
```

Ejemplo:

```text
Deezer
ID      = 1563415072
Artist  = Rauw Alejandro
Title   = Desesperados

          ▼

Resolve

          ▼

YouTube
j-UZMyi6YHA

          ▼

Player
```

---

# 19. Identidad de los IDs

Los IDs de Deezer y YouTube pertenecen a espacios diferentes.

Ejemplo de estado interno recomendado para el player:

```json
{
  "deezerId": 1563415072,
  "provider": "youtube",
  "youtubeId": "j-UZMyi6YHA",
  "title": "Desesperados",
  "artist": "Rauw Alejandro",
  "cover": "https://...",
  "duration": 224
}
```

La relación correcta es:

```text
Deezer track ID
      │
      └── resolve ──► YouTube video ID
```

No debe tratarse el YouTube ID como si fuera el ID de Deezer.

---

# 20. Paginación

Los endpoints de colección dependientes de Deezer conservan los parámetros:

```text
index
limit
```

Ejemplo:

```http
GET /api/v1/artist/12345/top?index=0&limit=10
```

La API no inventa una paginación independiente ni realiza cortes arbitrarios cuando Deezer ya controla la colección.

Cuando Deezer proporciona `next`, nuestra API lo normaliza para continuar la navegación mediante la API propia cuando corresponde.

---

# 21. Métricas y datos

Los valores provenientes de Deezer conservan su significado original.

Ejemplos:

```text
rank  → rank de Deezer
fans  → seguidores/fans de Deezer
```

No se deben inventar métricas como `plays`, ratings o popularidades propias si el proveedor no las entrega.

---

# 22. Principios de diseño

La API mantiene recursos separados:

```text
album
track
artist
playlist
genre
chart
radio
search
resolve
```

Ejemplos:

```text
/api/v1/album/123
/api/v1/album/123/tracks

/api/v1/artist/456
/api/v1/artist/456/top
/api/v1/artist/456/albums
/api/v1/artist/456/radio

/api/v1/search/track?q=...
/api/v1/search/artist?q=...
```

Esta separación permite que el frontend tenga rutas previsibles y evita mezclar responsabilidades.

---

# 23. Tabla completa de endpoints

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/v1/album/{id}` | Metadatos del álbum |
| GET | `/api/v1/album/{id}/tracks` | Tracks del álbum |
| GET | `/api/v1/track/{id}` | Información del track |
| GET | `/api/v1/artist/{id}` | Información del artista |
| GET | `/api/v1/artist/{id}/top` | Top tracks |
| GET | `/api/v1/artist/{id}/albums` | Álbumes del artista |
| GET | `/api/v1/artist/{id}/radio` | Radio/cola del artista |
| GET | `/api/v1/playlist/{id}` | Metadatos de playlist |
| GET | `/api/v1/playlist/{id}/tracks` | Tracks de playlist |
| GET | `/api/v1/genre` | Lista de géneros |
| GET | `/api/v1/genre/{id}` | Género individual |
| GET | `/api/v1/chart` | Chart general |
| GET | `/api/v1/chart/{genreId}` | Chart por género |
| GET | `/api/v1/radio` | Lista de radios |
| GET | `/api/v1/search/artist?q=...` | Buscar artistas |
| GET | `/api/v1/search/track?q=...` | Buscar tracks |
| GET | `/api/v1/search/album?q=...` | Buscar álbumes |
| GET | `/api/v1/search/playlist?q=...` | Buscar playlists |
| GET | `/api/v1/resolve/{...params}` | Resolver track → YouTube |

---

# 24. Estado actual

## Deezer

```text
✅ Album
✅ Album Tracks
✅ Track
✅ Artist
✅ Artist Top
✅ Artist Albums
✅ Artist Radio
✅ Playlist
✅ Playlist Tracks
✅ Genre
✅ Chart
✅ Radio
✅ Search Artist
✅ Search Track
✅ Search Album
✅ Search Playlist
```

## YouTube / Resolve

```text
✅ Instancia compartida de youtubei.js
✅ YouTube Music search
✅ Resolver Deezer → YouTube
✅ Caché de 10 minutos
✅ Pending map para solicitudes concurrentes
✅ Hasta 2 resultados para fallback
```

## Mejoras conocidas

```text
⏳ Mejorar el matching de resolve
⏳ Integrar definitivamente resolve con el reproductor principal
⏳ Proteger resolve con rate limiting/autenticación de sesión
⏳ Persistir YouTube IDs ya resueltos cuando el player lo requiera
```

---

# 25. Flujo completo del sistema

```text
                   ┌──────────────────┐
                   │     Frontend     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   REST API v1    │
                   └────────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          Deezer          Search         Resolve
             │              │              │
             │              │              ▼
             │              │       YouTube Music
             │              │              │
             │              │              ▼
             │              │       YouTube video ID
             │              │              │
             └──────────────┴──────────────┘
                            │
                            ▼
                       ┌─────────┐
                       │  Player │
                       └─────────┘
```

---

# 26. Ejemplo completo de reproducción

### 1. Obtener metadata

```http
GET /api/v1/track/1563415072
```

### 2. Resolver

```http
GET /api/v1/resolve/1563415072/Rauw%20Alejandro/Desesperados
```

### 3. Recibir resultado

```json
{
  "results": [
    {
      "id": "j-UZMyi6YHA",
      "artist": "Rauw Alejandro",
      "title": "Desesperados"
    }
  ],
  "status": "success"
}
```

### 4. Reproducir

El player carga:

```text
j-UZMyi6YHA
```

como `videoId` de YouTube.

---

# 27. Evolución prevista

La arquitectura actual permite añadir sin cambiar el concepto central:

```text
rate limiting
sesión segura
caché compartida
persistencia de YouTube IDs
matching más preciso
estado persistente del reproductor
cola persistente
canción actual persistente
```

La separación fundamental seguirá siendo:

```text
Deezer      → metadata
YouTube     → resolución/reproducción
REST API    → capa de acceso
Player      → reproducción y estado
```
