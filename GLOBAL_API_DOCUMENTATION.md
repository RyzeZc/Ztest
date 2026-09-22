# REST API v1 — Buscador global

## 1. Propósito

El buscador global es un endpoint agregado diseñado específicamente para el buscador principal del reproductor.

Su responsabilidad es:

1. Recibir una única consulta de búsqueda desde el frontend.
2. Consultar en paralelo los cuatro tipos de contenido disponibles en Deezer.
3. Devolver únicamente una vista previa de hasta 5 elementos por tipo.
4. Informar qué tipos de contenido realmente tienen resultados mediante `available`.
5. Permitir que el frontend construya dinámicamente las pestañas `CANCIONES`, `ARTISTAS`, `ÁLBUMES` y `PLAYLISTS`.

El endpoint **no sustituye** a los endpoints específicos de búsqueda existentes.

Los endpoints específicos siguen siendo los responsables de cargar el contenido completo y su paginación cuando el usuario entra en una pestaña o hace scroll.

---

# 2. Endpoint

## GET `/api/v1/search?q={query}`

Ejemplo:

```http
GET /api/v1/search?q=don%20omar
```

También se aceptan consultas con otros caracteres y espacios siempre que se envíen correctamente codificadas en la URL.

Ejemplo:

```http
GET /api/v1/search?q=daddy%20yankee
```

---

# 3. Responsabilidad del endpoint

La búsqueda global está pensada como una **vista previa**.

Para cada consulta se realizan estas búsquedas contra Deezer:

```text
/search/track
/search/artist
/search/album
/search/playlist
```

Todas se ejecutan en paralelo mediante `Promise.allSettled()`.

Flujo:

```text
Frontend
   │
   │ GET /api/v1/search?q=don%20omar
   ▼
REST API v1
   │
   ├───────────────┬───────────────┬───────────────┐
   ▼               ▼               ▼               ▼
Deezer Track   Deezer Artist   Deezer Album   Deezer Playlist
   │               │               │               │
   └───────────────┴───────────────┴───────────────┘
                           │
                           ▼
                 respuesta global
                           │
                           ▼
             frontend crea las pestañas
```

No se realizan las cuatro peticiones de forma secuencial.

---

# 4. Límite de la vista previa

El endpoint global tiene un límite interno fijo:

```text
PREVIEW_LIMIT = 5
```

El cliente **no puede cambiar este valor** mediante `index` o `limit`.

Cada recurso consultado a Deezer utiliza:

```text
index = 0
limit = 5
```

Por tanto, una búsqueda global produce como máximo:

```text
5 canciones
5 artistas
5 álbumes
5 playlists
```

Es decir, un máximo teórico de 20 elementos en la vista previa.

El campo `total` sigue reflejando el total que Deezer informa para cada búsqueda, aunque solo se devuelvan los primeros 5 elementos.

Ejemplo:

```json
{
  "tracks": {
    "data": [ /* hasta 5 */ ],
    "total": 120
  }
}
```

Esto permite al frontend saber que existen más resultados sin cargar todos todavía.

---

# 5. Parámetro `q`

## `q`

Tipo:

```text
string
```

Obligatorio.

Es la consulta enviada a Deezer.

### Normalización

Antes de realizar las búsquedas, la consulta se normaliza mediante:

```text
Unicode NFC
+ espacios consecutivos → un solo espacio
+ trim
```

Ejemplo conceptual:

```text
"   Daddy    Yankee   "
```

se convierte en:

```text
"Daddy Yankee"
```

La longitud máxima permitida es:

```text
200 caracteres
```

La constante utilizada por la implementación es:

```ts
MAX_QUERY_LENGTH = 200;
```

---

# 6. Respuesta exitosa

Cuando existe al menos un resultado y las cuatro consultas a Deezer terminan correctamente:

```json
{
  "query": "don omar",
  "preview_limit": 5,
  "tracks": {
    "data": [
      {
        "id": 123,
        "title": "...",
        "title_short": "...",
        "title_version": "",
        "duration": 224,
        "rank": 123456,
        "isrc": "...",
        "explicit_lyrics": false,
        "artist": {
          "id": 456,
          "name": "Don Omar"
        },
        "album": {
          "id": 789,
          "title": "...",
          "cover": "https://..."
        }
      }
    ],
    "total": 120
  },
  "artists": {
    "data": [
      {
        "id": 456,
        "name": "Don Omar",
        "picture": "https://...",
        "nb_album": 20,
        "nb_fan": 5000000,
        "type": "artist"
      }
    ],
    "total": 1
  },
  "albums": {
    "data": [
      {
        "id": 789,
        "title": "...",
        "cover": "https://...",
        "genre_id": 132,
        "fans": 100000,
        "release_date": "2020-01-01",
        "nb_tracks": 15,
        "record_type": "album",
        "explicit_lyrics": false,
        "artist": {
          "id": 456,
          "name": "Don Omar"
        },
        "type": "album"
      }
    ],
    "total": 20
  },
  "playlists": {
    "data": [
      {
        "id": 321,
        "title": "Don Omar Hits",
        "public": true,
        "nb_tracks": 50,
        "picture": "https://...",
        "creation_date": "2020-01-01",
        "add_date": "2020-01-01",
        "mod_date": "2020-01-01",
        "picture_type": "playlist",
        "user": {
          "id": 10,
          "name": "User",
          "type": "user"
        }
      }
    ],
    "total": 10
  },
  "available": [
    "tracks",
    "artists",
    "albums",
    "playlists"
  ],
  "status": "success"
}
```

---

# 7. Campo `available`

Este es uno de los campos más importantes para el frontend.

Contiene únicamente las categorías que tienen al menos un elemento dentro de `data`.

Valores posibles:

```text
tracks
artists
albums
playlists
```

Ejemplo con todos los tipos:

```json
"available": [
  "tracks",
  "artists",
  "albums",
  "playlists"
]
```

Ejemplo cuando solo existen canciones y playlists:

```json
"available": [
  "tracks",
  "playlists"
]
```

El frontend puede usar este campo directamente para crear las pestañas.

---

# 8. Ejemplo de creación dinámica de pestañas

Consulta:

```http
GET /api/v1/search?q=juramentos%20kaliente
```

Respuesta conceptual:

```json
{
  "available": [
    "tracks",
    "playlists"
  ],
  "status": "success"
}
```

La interfaz debe crear únicamente:

```text
CANCIONES | PLAYLISTS
```

No debe mostrar pestañas para `artists` o `albums`.

---

# 9. Campo `preview_limit`

Siempre indica el tamaño máximo de la vista previa:

```json
"preview_limit": 5
```

Actualmente su valor está fijado en 5 por el servidor.

El frontend no debe asumir que siempre habrá exactamente 5 resultados. Puede haber entre 0 y 5 por categoría.

---

# 10. Estructura de las secciones

Cada categoría tiene la misma estructura base:

```json
{
  "data": [],
  "total": 0
}
```

## `data`

Array con los elementos de la vista previa.

Puede contener entre 0 y 5 elementos.

## `total`

Cantidad total reportada por Deezer para esa búsqueda y ese recurso.

`total` no representa necesariamente la cantidad devuelta en `data`.

Ejemplo:

```json
{
  "data": [ /* 5 elementos */ ],
  "total": 84
}
```

significa que Deezer informó 84 coincidencias, pero la búsqueda global solo cargó 5 como preview.

---

# 11. Campos de `tracks`

Cada elemento de `tracks.data` se reduce a los campos útiles para el frontend:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number/null | ID del track en Deezer |
| `title` | string | Título completo |
| `title_short` | string | Título corto |
| `title_version` | string | Versión del track |
| `duration` | number | Duración en segundos |
| `rank` | number | Rank de Deezer |
| `isrc` | string/null | Código ISRC |
| `explicit_lyrics` | boolean | Indica contenido explícito |
| `artist` | object/null | Artista principal proporcionado por Deezer |
| `album` | object/null | Álbum asociado |

### `artist`

```json
{
  "id": 456,
  "name": "Don Omar"
}
```

### `album`

```json
{
  "id": 789,
  "title": "Album",
  "cover": "https://..."
}
```

---

# 12. Campos de `artists`

Cada elemento de `artists.data` contiene:

```json
{
  "id": 456,
  "name": "Don Omar",
  "picture": "https://...",
  "nb_album": 20,
  "nb_fan": 5000000,
  "type": "artist"
}
```

---

# 13. Campos de `albums`

Cada elemento de `albums.data` contiene:

```json
{
  "id": 789,
  "title": "Album",
  "cover": "https://...",
  "genre_id": 132,
  "fans": 100000,
  "release_date": "2020-01-01",
  "nb_tracks": 15,
  "record_type": "album",
  "explicit_lyrics": false,
  "artist": {
    "id": 456,
    "name": "Don Omar"
  },
  "type": "album"
}
```

---

# 14. Campos de `playlists`

Cada elemento de `playlists.data` contiene:

```json
{
  "id": 321,
  "title": "Don Omar Hits",
  "public": true,
  "nb_tracks": 50,
  "picture": "https://...",
  "creation_date": "2020-01-01",
  "add_date": "2020-01-01",
  "mod_date": "2020-01-01",
  "picture_type": "playlist",
  "user": {
    "id": 10,
    "name": "User",
    "type": "user"
  }
}
```

---

# 15. Estados HTTP y API

## 15.1 Consulta correcta con resultados

HTTP:

```text
200 OK
```

```json
"status": "success"
```

---

## 15.2 Consulta correcta sin resultados

Si las cuatro búsquedas terminan correctamente pero ninguna contiene resultados:

HTTP:

```text
200 OK
```

Respuesta:

```json
{
  "query": "algo inexistente",
  "preview_limit": 5,
  "tracks": {
    "data": [],
    "total": 0
  },
  "artists": {
    "data": [],
    "total": 0
  },
  "albums": {
    "data": [],
    "total": 0
  },
  "playlists": {
    "data": [],
    "total": 0
  },
  "available": [],
  "status": "not_found"
}
```

---

## 15.3 Resultado parcial

Si una o más categorías fallan pero otras sí responden, el endpoint no descarta las respuestas correctas.

Ejemplo:

```json
{
  "tracks": {
    "data": [ /* resultados */ ],
    "total": 20
  },
  "artists": {
    "data": [],
    "total": 0
  },
  "albums": {
    "data": [ /* resultados */ ],
    "total": 10
  },
  "playlists": {
    "data": [],
    "total": 0
  },
  "available": [
    "tracks",
    "albums"
  ],
  "status": "partial",
  "errors": [
    "artists"
  ]
}
```

Esto permite que el frontend siga funcionando con las categorías disponibles.

---

## 15.4 Falta el parámetro `q`

Petición incorrecta:

```http
GET /api/v1/search
```

HTTP:

```text
400 Bad Request
```

Respuesta:

```json
{
  "query": "",
  "preview_limit": 5,
  "tracks": {
    "data": [],
    "total": 0
  },
  "artists": {
    "data": [],
    "total": 0
  },
  "albums": {
    "data": [],
    "total": 0
  },
  "playlists": {
    "data": [],
    "total": 0
  },
  "available": [],
  "status": "error",
  "error": "missing_query"
}
```

---

## 15.5 Consulta vacía

Ejemplo:

```http
GET /api/v1/search?q=
```

No se realizan consultas a Deezer.

La API devuelve:

```text
200 OK
```

con:

```json
"status": "not_found"
```

---

## 15.6 Consulta demasiado larga

Si `q` supera 200 caracteres:

HTTP:

```text
400 Bad Request
```

Respuesta conceptual:

```json
{
  "status": "error",
  "error": "query_too_long",
  "max_query_length": 200
}
```

---

# 16. Caché

El endpoint utiliza una caché en memoria sobre `globalThis`.

Configuración actual:

```text
TTL = 30 segundos
Máximo de entradas = 200
```

La clave se construye a partir de la consulta normalizada en minúsculas.

Ejemplo conceptual:

```text
"  Daddy  Yankee "
       ↓
"Daddy Yankee"
       ↓
"daddy yankee"
```

## Objetivo de la caché

Evitar repetir cuatro consultas a Deezer cuando la misma búsqueda se solicita nuevamente durante un periodo corto.

Esto es especialmente útil para un buscador donde el usuario puede repetir consultas o donde distintas partes de la interfaz pueden solicitar la misma búsqueda.

---

# 17. Pending Map

Además de la caché existe un mapa de peticiones pendientes.

Si llegan varias solicitudes simultáneas para la misma consulta antes de que termine la primera búsqueda, no se ejecutan cuatro búsquedas de Deezer por cada cliente.

Flujo:

```text
Cliente A ─┐
Cliente B ─┼──► misma consulta
Cliente C ─┘
            │
            ▼
     una ejecución real
            │
       ┌────┼────┐
       ▼    ▼    ▼
       A    B    C
```

Esto reduce la multiplicación de solicitudes concurrentes idénticas.

---

# 18. Timeout por proveedor

Cada consulta individual a Deezer utiliza `AbortController`.

Timeout actual:

```text
8 segundos
```

La finalidad es evitar que una petición individual quede pendiente indefinidamente y bloquee la respuesta global.

Como las cuatro operaciones se ejecutan con `Promise.allSettled()`, una operación lenta o fallida puede convertirse en un resultado parcial en vez de cancelar automáticamente las demás.

---

# 19. Peticiones a Deezer

Para cada búsqueda global se generan como máximo cuatro solicitudes externas:

```text
https://api.deezer.com/search/track?q=...&index=0&limit=5
https://api.deezer.com/search/artist?q=...&index=0&limit=5
https://api.deezer.com/search/album?q=...&index=0&limit=5
https://api.deezer.com/search/playlist?q=...&index=0&limit=5
```

Estas cuatro solicitudes se hacen en paralelo.

El endpoint global no consulta más páginas ni intenta cargar todo el contenido de los resultados.

---

# 20. Importante: el endpoint global NO es paginable

No se utilizan:

```text
index
limit
next
```

como mecanismos de paginación del endpoint global para el frontend.

La única finalidad de esta ruta es:

```text
búsqueda global
      ↓
preview de 5
      ↓
descubrir categorías disponibles
```

La paginación real pertenece a los endpoints específicos.

---

# 21. Flujo del frontend recomendado

## Paso 1 — búsqueda global

El usuario escribe:

```text
Don Omar
```

El frontend realiza:

```http
GET /api/v1/search?q=Don%20Omar
```

Obtiene:

```text
tracks
artists
albums
playlists
available
```

---

## Paso 2 — generar pestañas

El frontend inspecciona:

```json
"available": [
  "tracks",
  "artists",
  "albums",
  "playlists"
]
```

Y genera:

```text
CANCIONES | ARTISTAS | ÁLBUMES | PLAYLISTS
```

Si la respuesta fuera:

```json
"available": [
  "tracks",
  "playlists"
]
```

solo se generan:

```text
CANCIONES | PLAYLISTS
```

---

# 22. Vista previa y botón "Ver todo"

Cada sección puede mostrar sus 5 resultados y un botón:

```text
Ver todo
```

El botón debe activar la pestaña correspondiente.

No necesita realizar una nueva búsqueda global.

Ejemplo:

```text
Búsqueda global
       ↓
5 canciones
       ↓
[ Ver todo ]
       ↓
activar pestaña CANCIONES
       ↓
usar /api/v1/search/track
```

---

# 23. Búsqueda completa de cada pestaña

Los endpoints específicos existentes siguen siendo los responsables de la colección completa.

### Canciones

```http
GET /api/v1/search/track?q=don%20omar&index=0&limit=10
```

### Artistas

```http
GET /api/v1/search/artist?q=don%20omar&index=0&limit=10
```

### Álbumes

```http
GET /api/v1/search/album?q=don%20omar&index=0&limit=10
```

### Playlists

```http
GET /api/v1/search/playlist?q=don%20omar&index=0&limit=10
```

El frontend puede seguir usando los `next` de estas respuestas específicas para cargar nuevas páginas cuando el usuario haga scroll.

---

# 24. Reutilización del preview

El frontend puede reutilizar los 5 resultados que ya recibió del endpoint global en lugar de descartarlos y volver a pedir inmediatamente la primera página del endpoint específico.

Ejemplo:

```text
/api/v1/search
        ↓
5 canciones
        ↓
usuario entra en CANCIONES
        ↓
mostrar las mismas 5 canciones
        ↓
al llegar al final
        ↓
/api/v1/search/track?... próxima página
```

Esto evita una solicitud redundante para recuperar nuevamente los mismos primeros elementos.

---

# 25. Scroll infinito limitado

La REST API no impone un número fijo de scrolls para el frontend.

La interfaz puede establecer, por ejemplo:

```text
máximo 3 o 4 cargas adicionales
```

y detenerse aunque Deezer tenga más resultados.

Esta decisión pertenece al frontend.

---

# 26. Diferencia entre `total` y resultados cargados

Ejemplo:

```json
"tracks": {
  "data": [ /* 5 elementos */ ],
  "total": 120
}
```

Significa:

```text
Total en Deezer: 120
Preview cargado: 5
```

El frontend debe utilizar `total` solo como información de disponibilidad/cantidad, no como obligación de cargar todos los resultados.

---

# 27. Headers y caché HTTP

La respuesta utiliza:

```http
Content-Type: application/json; charset=utf-8
```

Y actualmente envía:

```http
Cache-Control: public, max-age=10, s-maxage=30, stale-while-revalidate=60
```

Esto se suma a la caché interna en memoria de 30 segundos.

También se expone el resultado de caché mediante:

```http
X-Search-Cache: HIT
X-Search-Cache: MISS
X-Search-Cache: PENDING
```

### Significado

`HIT`:

El resultado fue obtenido desde la caché interna.

`MISS`:

No estaba en caché y se ejecutó una búsqueda.

`PENDING`:

Ya existía una búsqueda idéntica en curso y esta solicitud esperó su resultado.

---

# 28. Manejo de fallos de Deezer

Cada recurso se maneja de manera independiente.

Si, por ejemplo, falla:

```text
artist
```

pero funcionan:

```text
track
album
playlist
```

la API conserva los tres resultados válidos y marca:

```json
"status": "partial"
```

Además incluye:

```json
"errors": [
  "artist"
]
```

El frontend no debería ocultar automáticamente las demás categorías por el fallo de una sola consulta.

---

# 29. Error upstream global

Si la ejecución completa cae fuera del flujo normal y se produce una excepción no controlada, la ruta responde:

HTTP:

```text
502 Bad Gateway
```

con:

```json
{
  "status": "error",
  "error": "upstream_unavailable"
}
```

---

# 30. Relación con `resolve`

El buscador global no llama al resolver.

La responsabilidad de cada componente es diferente:

```text
/search
    ↓
metadatos + descubrimiento de categorías
```

mientras que:

```text
/resolve
    ↓
Deezer track → YouTube video ID
```

Por tanto, una búsqueda global no genera búsquedas en YouTube Music ni consume recursos de `youtubei.js`.

---

# 31. Arquitectura definitiva

```text
                         BUSCADOR DEL PLAYER
                                  │
                                  ▼
                       GET /api/v1/search?q=...
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
             tracks            artists            albums
                │                 │                 │
                └─────────────────┼─────────────────┘
                                  ▼
                              playlists
                                  │
                                  ▼
                          preview de 5 c/u
                                  │
                                  ▼
                             available[]
                                  │
                                  ▼
                    frontend crea las pestañas
                                  │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
        CANCIONES            ARTISTAS            ÁLBUMES
             │                  │                  │
             └──────────────────┼──────────────────┘
                                ▼
                            PLAYLISTS
                                │
                                ▼
                    endpoints específicos
                                │
                                ▼
                         paginación/scroll
```

---

# 32. Principios de diseño

El buscador global sigue estas reglas:

```text
✅ Una única petición desde el frontend para descubrir categorías
✅ Cuatro consultas Deezer en paralelo
✅ Máximo 5 resultados por categoría
✅ No acepta paginación propia
✅ `available[]` determina las pestañas visibles
✅ Caché interna de 30 segundos
✅ Pending Map para solicitudes idénticas simultáneas
✅ Timeout de 8 segundos por consulta Deezer
✅ Resultados parciales cuando una categoría falla
✅ Endpoints específicos conservan la paginación completa
✅ No utiliza YouTube ni `resolve`
```

---

# 33. Resumen de responsabilidades

| Endpoint | Responsabilidad |
|---|---|
| `/api/v1/search` | Búsqueda global + preview + detección de categorías |
| `/api/v1/search/track` | Colección completa de canciones |
| `/api/v1/search/artist` | Colección completa de artistas |
| `/api/v1/search/album` | Colección completa de álbumes |
| `/api/v1/search/playlist` | Colección completa de playlists |
| `/api/v1/resolve/{...params}` | Resolver Deezer → YouTube |

---

# 34. Ejemplo completo de uso

### Usuario escribe

```text
Daddy Yankee
```

### 1. Frontend

```http
GET /api/v1/search?q=Daddy%20Yankee
```

### 2. Global Search

Consulta en paralelo:

```text
Deezer Track       limit=5
Deezer Artist      limit=5
Deezer Album       limit=5
Deezer Playlist    limit=5
```

### 3. Respuesta

```json
"available": [
  "tracks",
  "artists",
  "albums",
  "playlists"
]
```

### 4. Frontend

Crea:

```text
CANCIONES | ARTISTAS | ÁLBUMES | PLAYLISTS
```

### 5. Vista previa

Muestra hasta 5 resultados de cada tipo.

### 6. Usuario pulsa "CANCIONES"

El frontend reutiliza los 5 resultados del preview.

### 7. Usuario hace scroll

Se utiliza:

```http
GET /api/v1/search/track?...next...
```

y se agregan nuevos resultados.

La búsqueda global no vuelve a ejecutarse.

---

# 35. Ubicación en el proyecto

Archivo:

```text
src/pages/api/v1/search/index.astro
```

Endpoint público:

```text
GET /api/v1/search?q={query}
```

La ruta es dinámica en Astro mediante:

```astro
export const prerender = false;
```

