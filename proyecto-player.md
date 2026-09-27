# NEW RETRO — CONTEXTO MAESTRO DEL PROYECTO

## 1. Qué es el proyecto completo

Estoy migrando el sitio **New Retro** desde WordPress hacia una arquitectura moderna con:

* **Astro** como frontend.
* **WordPress** únicamente como backend/CMS y fuente de contenido.
* **Vercel** como destino del frontend.
* URLs públicas del estilo:
  `dominio/categoria/articulo`
  y no `/blog/articulo`.

El objetivo general no es hacer simplemente una copia del WordPress, sino construir una implementación **rápida, escalable, mantenible y profesional**, con responsabilidades claramente separadas.

El proyecto incluye, entre otras cosas:

* contenido de WordPress mediante WP REST API;
* categorías, tags, autores, media y posts;
* frontend Astro;
* sistema de métricas con Neon;
* MusicPlayer;
* búsqueda y panel lateral;
* Home;
* reproducción de radio;
* reproducción de YouTube;
* biblioteca local;
* persistencia de sesión;
* Repeat / Shuffle / Next / Previous;
* seeker/progreso;
* volumen y mute;
* etc.

---

# 2. Prioridad arquitectónica actual

En este momento el trabajo está concentrado principalmente en **refactorizar el MusicPlayer**.

La finalidad de esta refactorización es dejar de tener un MusicPlayer monolítico que haga demasiadas cosas y convertirlo en una arquitectura donde cada capa tenga una responsabilidad clara.

La idea central es:

```text
                         ┌────────────────────────┐
                         │      MusicPlayer       │
                         │       Facade / UI      │
                         │  DOM + user events     │
                         └────────────┬───────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │    Playback Engine     │
                         │                        │
                         │ Session State          │
                         │ Selection              │
                         │ Queue                  │
                         │ Next / Previous       │
                         │ Shuffle / Repeat      │
                         │ Context               │
                         │ Resolution             │
                         └────────────┬───────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                ┌──────────────────┐      ┌──────────────────┐
                │  YouTube Engine  │      │   Audio Engine   │
                │                  │      │                  │
                │ YouTube API      │      │ HTMLAudioElement │
                │ load/cue/play    │      │ Radio streams    │
                │ pause/seek       │      │ play/pause       │
                │ volume/mute      │      │ volume/mute      │
                └────────┬─────────┘      └────────┬─────────┘
                         │                         │
                         ▼                         ▼
                  YouTube IFrame              Browser Audio

                    Playback Engine
                      │         │
                      ▼         ▼
               Music Service  Local Library

                    Playback Engine
                           │
                           ▼
                   ┌────────────────────┐
                   │ Persistence Store  │
                   │ localStorage       │
                   └────────────────────┘
```

Una versión conceptual todavía más resumida:

```text
MusicPlayer
    │
    ├── Playback Engine
    │      ├── estado
    │      ├── selección
    │      ├── cola
    │      ├── contexto
    │      ├── Repeat
    │      ├── Shuffle
    │      └── resolución
    │
    ├── YouTube Engine
    │      └── YouTube IFrame API
    │
    ├── Audio Engine
    │      └── HTMLAudioElement / radio
    │
    ├── Persistence Store
    │      └── localStorage
    │
    ├── Local Library
    │      └── IndexedDB
    │
    └── UI / Panel / Search / Home
```

La regla fundamental es:

**Playback Engine conoce playback. MusicPlayer conoce UI. Los engines conocen el medio que reproducen. Persistence conoce localStorage. La biblioteca conoce IndexedDB.**

---

# 3. Cómo queremos que quede MusicPlayer

`MusicPlayer.ts` debe actuar principalmente como:

* facade;
* coordinador de UI;
* receptor de eventos del usuario;
* traductor entre estado de playback y UI;
* enlace entre los distintos módulos.

No debe ser el dueño central de toda la lógica de reproducción.

En particular, queremos evitar que MusicPlayer sea responsable directamente de:

* mantener el estado completo de reproducción;
* decidir internamente qué track está activo;
* administrar la cola;
* administrar Repeat;
* administrar Shuffle;
* tener caches de resolución de YouTube;
* gestionar directamente localStorage;
* resolver directamente tracks de YouTube;
* convertirse en una segunda implementación del Playback Engine.

---

# 4. Playback Engine

El Playback Engine es el dueño del dominio de reproducción.

Debe controlar conceptualmente:

* track actual;
* queue;
* currentIndex;
* playback intent;
* playback source;
* selección;
* Next;
* Previous;
* Repeat;
* Shuffle;
* contexto de reproducción;
* resolución del track cuando sea necesaria;
* restauración de sesión;
* cambios de cola;
* cambios de índice;
* etc.

La intención es que `PlaybackState` pertenezca al Playback Engine y no a MusicPlayer.

Ya se hizo este cambio:

Antes:

```text
MusicPlayer crea/entrega estado
Playback utiliza ese estado
```

Ahora:

```text
Playback Engine crea y posee PlaybackState
MusicPlayer consume una vista del estado
```

Se creó también una vista tipo:

```text
PlaybackStateView
```

para exponer estado sin entregar la propiedad completa del estado interno.

---

# 5. Eventos de Playback

También se desacopló Playback de la UI.

Playback ya no debe recibir callbacks como:

```text
updateTrackInfo
updateUI
updateTrackPlaybackIndicators
renderQueuePanel
scrollQueueTrackIntoView
activatePanelTab
```

La idea ahora es:

```text
Playback Engine
      │
      │ eventos semánticos
      ▼
MusicPlayer
      │
      ▼
UI
```

Se implementó un sistema de eventos/subscripción.

Entre los eventos definidos se encuentran:

```text
track-selected
queue-changed
queue-index-changed
queue-loading-changed
playback-intent-changed
repeat-changed
shuffle-changed
source-changed
```

MusicPlayer se suscribe a esos eventos y decide qué actualización visual debe realizar.

Esto es intencional.

**Playback no debe conocer directamente el DOM ni los controladores visuales.**

---

# 6. playbackSource

Anteriormente existía:

```text
activePlaybackSource
```

como estado local de MusicPlayer.

Se movió al PlaybackState:

```text
playbackState.playbackSource
```

y existe el evento:

```text
source-changed
```

La intención arquitectónica es que la fuente activa sea parte del dominio de Playback y no una variable paralela mantenida por MusicPlayer.

---

# 7. YouTube Track Resolver

Otra separación importante que ya se hizo fue la extracción de la resolución de tracks de YouTube.

Se creó conceptualmente:

```text
youtube-track-resolver.ts
```

Este módulo es responsable de:

* resolver un track hacia su YouTube ID;
* mantener cache de resolución;
* mantener IDs ya resueltos;
* validar YouTube IDs;
* deduplicar peticiones concurrentes;
* permitir `prime(tracks)`;
* indicar si existe una resolución en curso mediante algo equivalente a:
  `hasInFlight(trackId)`.

Funciones que antes estaban dentro de Playback, relacionadas con:

```text
resolveTrack
resolveYouTubeTrack
primeResolvedYouTubeTracks
hasResolveInFlight
```

debían desaparecer del Playback Engine porque ahora esa responsabilidad pertenece al resolver.

La arquitectura deseada es:

```text
MusicPlayer
    │
    ├── crea UNA instancia de YouTubeTrackResolver
    │
    ├── la entrega a Playback
    │
    └── la entrega a LocalLibraryController
```

Así no existen varios caches/resolvers independientes.

---

# 8. Local Library

También se desacopló `LocalLibraryController` de Playback.

La intención es que Local Library no necesite conocer internamente:

* PlaybackState;
* Playback Engine;
* resolución interna de Playback;
* `getCurrentTrack`;
* `getActivePlaybackSource`;
* `getCurrentYouTubeVideoId`;
* `getPlaybackListSource`.

En su lugar, Local Library mantiene solamente el estado mínimo que necesita para su propia UI/reproducción local, mientras MusicPlayer traduce el estado general de Playback hacia los indicadores visuales.

También se introdujo el uso compartido del:

```text
YouTubeTrackResolver
```

en lugar de que Local Library dependa de Playback para resolver YouTube.

---

# 9. YouTube Engine

YouTube tiene su propio engine/adaptador.

Debe encapsular detalles propios de YouTube, como:

* IFrame API;
* load;
* cue;
* play;
* pause;
* seek;
* volume;
* mute;
* eventos de estado;
* comandos pendientes;
* IDs pendientes;
* etc.

Hay variables internas relacionadas con:

```text
pendingVideoId
pendingSeek
pendingVideoStartSeconds
pendingPlaybackAction
pendingPlayVideoId
cuedStartTime
```

La intención final es que todo ese conocimiento quede encapsulado dentro del YouTube Engine y no contamine Playback o MusicPlayer.

---

# 10. Importante: restauración de posición de YouTube

Este punto es especialmente importante.

Decidimos explícitamente **no forzar una restauración de posición que pueda provocar autoplay o comportamientos inseguros con la API de YouTube**.

Se separó:

```text
startSeconds
```

del comportamiento normal de reproducción.

Se añadió a la selección/carga algo equivalente a:

```text
startSeconds?: number
```

y el YouTube adapter:

```text
load(videoId, startSeconds?)
```

usa internamente:

```text
cueVideoById(videoId, startSeconds)
```

para restauración.

Se eliminó la estrategia problemática de:

```text
restore
→ seekTo()
```

porque podía producir comportamientos frágiles.

La restauración debe conservar la semántica:

```text
restaurar posición
+
NO provocar reproducción automática
```

Si la API no permite cumplir eso de forma segura, se prefiere quitar la funcionalidad antes que introducir una solución frágil.

**Esta regla es permanente.**

---

# 11. playbackIntent

También se corrigió la separación entre:

```text
estado persistido
```

y

```text
intención viva de playback
```

`playbackIntent` permanece como estado vivo de la sesión y no debe convertirse en una orden persistida que provoque efectos secundarios al restaurar.

En particular, no debe interpretarse la restauración como:

```text
“la última vez estaba reproduciendo”
→ reproducir automáticamente
```

sin verificar la semántica de la API y la interacción real del usuario.

---

# 12. Guards del YouTube state machine

Se agregaron protecciones a la máquina de estados de YouTube.

Mientras:

```text
status === loading
```

no deben aceptarse determinados estados externos de forma prematura.

Se agregaron guards para evitar que:

```text
PLAYING
BUFFERING
PAUSED
```

se interpreten incorrectamente mientras el proceso todavía está cargando.

También se corrigió la gestión de:

```text
ENDED
```

para evitar que se procese de forma incorrecta cuando el reproductor todavía se encuentra en:

```text
loading
```

o

```text
buffering
```

Esto fue importante porque YouTube puede emitir estados en momentos que no representan todavía el estado lógico final que necesita nuestra aplicación.

---

# 13. Botón Play/Pause durante loading/buffering

También se corrigió el comportamiento cuando el usuario pulsa Play/Pause mientras YouTube está cargando.

La lógica deseada es:

```text
si YouTube está loading/buffering
y playbackIntent === 'play'
y el usuario pulsa pausa:
    cambiar intent a pause
    cancelar la orden pendiente de play
```

La finalidad es que el usuario pueda cancelar una reproducción pendiente de forma consistente, en vez de que un comando retrasado provoque reproducción después.

---

# 14. Initialization order

Se encontraron problemas clásicos de temporal dead zone / orden de inicialización.

Por ejemplo:

```text
currentStationId
```

se estaba usando antes de su inicialización.

También apareció un problema similar con:

```text
currentTrackInfoKey
```

La inicialización fue reorganizada.

Además:

```text
initializeStaticPanelContent()
```

se movió para ejecutarse después de la creación de los controladores necesarios.

Y se eliminó una llamada duplicada desde:

```text
initializeDefaultRadio()
```

Esto solucionó el error:

```text
Cannot access currentStationId before initialization
```

No debemos volver a introducir inicializaciones dependientes de variables todavía no creadas.

---

# 15. Persistencia

El proyecto necesita persistencia profesional de sesión.

La finalidad es guardar y restaurar, cuando sea seguro y válido:

* track;
* posición;
* queue;
* current index;
* Repeat;
* Shuffle;
* contexto;
* y la información necesaria para reconstruir la sesión.

La persistencia está separada conceptualmente como:

```text
Persistence Store
```

y debe ser la única capa responsable de `localStorage`.

MusicPlayer no debería terminar teniendo lógica directa de:

```text
localStorage.getItem()
localStorage.setItem()
```

para el estado de Playback.

El diseño previsto es:

```text
Playback Engine
      │
      ▼
Persistence Store
      │
      ▼
localStorage
```

---

# 16. Estado actual de persistencia

La persistencia se ha endurecido con validación real de JSON.

Se agregaron validadores equivalentes a:

```text
isRecord
isFiniteNumber
isMusicTrackSnapshot
```

También se contempla:

```text
duration
```

como dato opcional del snapshot.

Importante:

Una sesión válida puede tener:

```text
queue = []
currentIndex = -1
```

No debe considerarse automáticamente un snapshot inválido.

Sin embargo, la persistencia completa end-to-end sigue siendo una de las áreas que todavía deben verificarse con pruebas reales.

En pruebas anteriores se observó que después de F5 el reproductor podía volver a radio, por lo que **no debemos asumir que la restauración completa ya está resuelta**.

---

# 17. Repeat

Repeat ya funciona técnicamente.

Cuando un track termina y Repeat está activo:

```text
mismo track
→ vuelve a reproducirse
```

sin necesidad de volver a resolver innecesariamente el track.

Además:

```text
Next manual
Previous manual
```

siguen siendo independientes de Repeat.

Existe un detalle visual conocido:

después de F5 o navegación interna, el estado visual del botón Repeat puede no reflejar inmediatamente que Repeat está activo aunque la lógica sí lo esté.

Ese problema es antiguo y explícitamente se decidió **no mezclarlo con esta refactorización**.

---

# 18. Shuffle

Shuffle forma parte de la arquitectura del Playback Engine y debe coexistir correctamente con:

```text
Next
Previous
Repeat
queue
context
```

La implementación debe preservar un comportamiento normal y predecible de navegación.

No se debe implementar simplemente:

```text
Math.random()
```

sin respetar el contexto y el historial de reproducción que necesita el reproductor.

---

# 19. Reproducción actual del sistema

El reproductor soporta:

### Radio

Mediante:

```text
HTMLAudioElement
```

con:

* Play/Pause;
* Volume;
* Mute;
* indicadores;
* estaciones.

### YouTube

Mediante YouTube IFrame API con:

* Play/Pause;
* carga;
* selección;
* búsqueda;
* reproducción;
* Volume;
* Mute;
* Repeat;
* Shuffle;
* Next;
* Previous;
* seeker;
* progreso;
* duración;
* seek manual.

---

# 20. Seeker de YouTube

El seeker ya fue terminado antes de la refactorización.

Funciona con:

* tiempo actual;
* duración total;
* progreso automático;
* seek manual;
* seek en reproducción;
* seek en pausa.

Se corrigió además el salto visual que aparecía después de:

```text
seekTo()
```

La UI usa:

```text
.music-player-seek-wrapper
.music-player-seek-progress
```

más un input transparente encima.

El segmento naranja del progreso tiene bordes redondeados.

El pointer está oculto normalmente y aparece al hacer hover.

Esto ya estaba funcionando y **no debe romperse durante la refactorización**.

---

# 21. Audio Engine

El Audio Engine actual es relativamente pequeño y razonablemente encapsulado.

Existen tipos como:

```text
AudioSourceType =
  'radio' | 'track'
```

y:

```text
AudioPlaybackStatus =
  'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error'
```

Además existe:

```text
AudioSource
AudioPlayerState
```

La implementación usa HTMLAudioElement.

No hay intención de hacer una sobreingeniería innecesaria aquí si ya cumple bien su responsabilidad.

---

# 22. Music Service

`music-service` debe continuar siendo un servicio de datos/HTTP.

No debe convertirse en un cache genérico de reproducción.

Su responsabilidad es obtener/proporcionar datos.

La lógica de playback debe permanecer en Playback Engine.

---

# 23. Panel, Search y Home

Los controladores de:

```text
panel
search
home
```

son principalmente componentes de presentación/UI.

Se busca preservar esa separación conceptual.

No hay intención de meter la lógica de dominio de reproducción dentro de ellos.

---

# 24. Fuentes de reproducción y contexto

El reproductor puede iniciar reproducción desde diferentes partes de la aplicación:

* Descubre;
* Playlist;
* Géneros;
* Trending/Home;
* Search;
* Artist Radio;
* Local Library;
* etc.

Una parte importante de la refactorización es asegurar que seleccionar una pista desde cualquiera de esas superficies:

```text
crea/actualiza correctamente el contexto
→ crea/actualiza queue
→ establece índice
→ resuelve track si hace falta
→ inicia reproducción
```

y que volver a seleccionar el mismo elemento no produzca peticiones/resoluciones innecesarias.

En particular, anteriormente se detectó un problema donde volver a hacer click sobre el mismo elemento podía provocar una nueva petición.

Ese tipo de comportamiento debe resolverse desde la arquitectura, no mediante parches aislados.

---

# 25. Artist Radio / Local Library / Trending

El Playback Engine debe ser la pieza que unifique la semántica de reproducción sin importar desde dónde se originó:

```text
Trending
Search
Playlist
Genre
Artist Radio
Local Library
```

La UI de origen no debe tener que saber cómo funcionan internamente:

* queue;
* resolver;
* Repeat;
* Shuffle;
* transición de tracks;
* etc.

---

# 26. Estructura conceptual que queremos alcanzar

Se propuso una estructura parecida a:

```text
MusicPlayer/
├── MusicPlayer.ts
├── MusicPlayer.types.ts
├── MusicPlayer.events.ts
│
├── playback/
│   ├── PlaybackEngine.ts
│   ├── PlaybackState.ts
│   ├── PlaybackResolver.ts
│   ├── PlaybackQueue.ts
│   └── PlaybackContext.ts
│
├── media/
│   ├── YouTubeEngine.ts
│   ├── AudioEngine.ts
│   └── MediaTypes.ts
│
├── persistence/
│   ├── PlaybackSessionStore.ts
│   └── PlaybackSessionSchema.ts
│
├── library/
│   ├── LocalLibraryRepository.ts
│   └── LocalLibraryController.ts
│
├── ui/
│   ├── panel.ts
│   ├── search.ts
│   └── home.ts
│
└── services/
    └── music-service.ts
```

Los nombres exactos pueden cambiar.

**La estructura conceptual es más importante que crear archivos por crear archivos.**

No queremos una fragmentación artificial.

---

# 27. Tamaño actual

Antes de la refactorización:

* `MusicPlayer.ts` era de aproximadamente 4.4k líneas.
* `playback.ts` aproximadamente 2.1k líneas.
* `youtube-player.ts` aproximadamente 2.1k líneas.

No se decidió dividirlos simplemente porque sean grandes.

La regla es:

```text
separar por responsabilidad
NO separar por cantidad de líneas
```

---

# 28. Métricas del proyecto

El proyecto también tiene un sistema de métricas con:

```text
src/lib/metrics/
├── client.ts
├── db.ts
├── events.ts
├── identity.ts
└── rate-limit.ts
```

y APIs:

```text
src/pages/api/metrics/
├── index.ts
├── test.ts
└── debug-db.ts
```

La prioridad arquitectónica del sistema de métricas es:

```text
events
→ abuse protection
→ daily aggregates
→ totals
→ visitors/sessions
→ "Más leídos"
```

La tabla `events` es la fuente de verdad.

Se probó rate limiting con:

```text
BUCKET_CAPACITY = 120
REFILL_RATE_PER_SECOND = 2
```

y se comprobó que llegaban respuestas:

```text
201
```

hasta comenzar:

```text
429
```

y luego podían aparecer algunos `201` nuevamente por el refill del bucket.

Esto forma parte del proyecto general, aunque **no es el problema actual del MusicPlayer**.

---

# 29. WordPress / Astro

El backend WP usado actualmente es:

```text
https://dev-newretro.pantheonsite.io
```

y la API:

```text
/wp-json/wp/v2/posts
```

funciona.

El objetivo es utilizar WordPress como backend y Astro como frontend.

Hay módulos de WordPress como:

```text
api.ts
authors.ts
categories.ts
category-path.ts
media.ts
post-path.ts
posts.ts
tags.ts
types.ts
```

y páginas como:

```text
index.astro
movies.astro
[...category].astro
```

además de endpoints para author/tag.

---

# 30. Header / Theme

También existe una migración importante del diseño original New Retro.

El Header usa:

* textura metálica;
* sprites;
* botones;
* animaciones;
* mangueras;
* distintos estados hover.

El encabezado tiene conceptual/históricamente:

```text
header-top
header-middle
header-parts
```

y se mantuvo la estética original.

Se escogió:

```text
Black Han Sans
```

para el título `NEW RETRO`.

Las animaciones del header se migraron desde WordPress a Astro.

Esto no debe mezclarse innecesariamente con el refactor del MusicPlayer.

---

# 31. Regla MUY importante para continuar el trabajo

No utilizar versiones antiguas del código para rellenar huecos de versiones nuevas.

La regla es:

```text
Si el usuario dice que un archivo actual es:
A45
B8
M30c
etc.

esa es la única versión que se debe usar como fuente de verdad.
```

Si el archivo actual no puede recuperarse:

**pedir el contenido actual en lugar de reconstruirlo desde versiones anteriores.**

No asumir que una función sigue existiendo solo porque existía en una versión anterior.

---

# 32. Regla para los cambios

No quiero respuestas del tipo:

> "Busca donde tengas X y cámbialo."

Quiero instrucciones concretas:

```text
En la función X,
encuentra exactamente este bloque:
...

ELIMINA desde:
...
hasta:
...

Y reemplázalo completamente por:
...
```

Cuando sea necesario cambiar un archivo grande:

* indicar qué función afecta;
* indicar qué bloque debe eliminarse;
* indicar qué debe añadirse;
* explicar brevemente la razón;
* no dejar cambios ambiguos.

---

# 33. Regla contra los parches

Este proyecto se considera de calidad **empresarial/profesional**.

Por ello:

No queremos acumular:

```text
if (...parche...)
if (...otro parche...)
try (...otro parche...)
variable auxiliar...
compatibilidad temporal...
```

solo para hacer desaparecer un error inmediato.

La solución debe respetar la arquitectura.

Puede implicar mover una responsabilidad, retirar una función o rediseñar una parte completa.

Eso es preferible a mantener una arquitectura frágil.

---

# 34. Regla especial para YouTube

No forzar funcionalidades que la API de YouTube no permita implementar de manera segura.

Especialmente:

```text
restore
+
seek
+
autoplay
+
F5
+
navegación
```

Si una característica no puede funcionar de manera robusta sin violar la semántica de la API:

**se elimina o se rediseña.**

No se acepta un comportamiento "casi funciona".

---

# 35. Regla para pruebas

Cada cambio arquitectónico importante debe verificarse contra:

* compilación;
* imports/exports;
* flujo de inicialización;
* tipos;
* reproducción;
* cola;
* navegación;
* persistencia;
* radio;
* YouTube;
* Local Library;
* UI.

Un error de:

```text
export not found
```

o:

```text
undefined
```

debe analizarse desde el contrato real entre módulos.

No debemos resolverlo simplemente reexportando algo sin entender por qué dejó de pertenecer a ese módulo.

---

# 36. PUNTO EXACTO DONDE NOS QUEDAMOS

Este es el punto más importante para continuar.

Durante la extracción de:

```text
YouTubeTrackResolver
```

apareció este error en el navegador:

```text
Uncaught SyntaxError:
The requested module
'/src/lib/MusicPlayer/playback.ts?...'
does not provide an export named
'isPlaybackPanelSource'
```

Esto significa que `MusicPlayer.ts` está intentando importar:

```text
isPlaybackPanelSource
```

desde:

```text
playback.ts
```

pero la versión actual de Playback ya no está exportando ese símbolo.

NO se decidió todavía simplemente volver a exportarlo.

Primero hay que revisar el código actual y determinar:

1. por qué `MusicPlayer.ts` todavía necesita `isPlaybackPanelSource`;
2. dónde se usa exactamente;
3. si esa función todavía pertenece conceptualmente a Playback;
4. si fue eliminada accidentalmente durante la extracción;
5. o si ahora debe vivir en otro módulo/utilidad;
6. y cuáles son todas sus referencias.

La finalidad es corregir el contrato entre módulos, no ocultar el error mediante un re-export improvisado.

---

# 37. Versiones actuales relacionadas con este punto

La versión que se intentó usar más recientemente fue:

```text
playback-B8.ts
```

La URL proporcionada fue:

```text
https://raw.githubusercontent.com/RyzeZc/Ztest/refs/heads/main/playback-B8.ts
```

Antes se había utilizado:

```text
playback-A45.ts
```

Pero B8 es la versión que el usuario declaró como actual más recientemente.

También existe un `MusicPlayer.ts` actualizado relacionado con esta fase y otros módulos recientes, pero **si el nuevo chat necesita revisar un archivo y no tiene el contenido exacto actual, debe pedir ese archivo en vez de usar una versión antigua**.

Durante este problema, GitHub Raw estaba devolviendo:

```text
Cache miss
```

y también se intentó temporalmente Pastebin Raw.

Por eso todavía no se pudo inspeccionar el contenido exacto de `playback-B8.ts`.

---

# 38. Lo que NO debemos hacer al retomar

No hacer inmediatamente:

```text
export { isPlaybackPanelSource }
```

sin revisar B8.

No copiar esa función desde una versión antigua.

No reconstruir Playback desde A40/A45 u otra versión.

No deshacer la extracción de YouTubeTrackResolver simplemente porque apareció el error.

No mezclar este problema con:

* Repeat visual;
* botones;
* CSS;
* indicadores;
* otras mejoras cosméticas.

El primer objetivo es dejar nuevamente consistente el contrato:

```text
MusicPlayer
↔ Playback
↔ YouTubeTrackResolver
↔ LocalLibraryController
```

---

# 39. Objetivo final de toda esta refactorización

Queremos llegar a esto:

```text
                    USER
                     │
                     ▼
             ┌───────────────┐
             │  MusicPlayer  │
             │  Facade / UI  │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │    Playback   │
             │     Engine    │
             └───────┬───────┘
                     │
          ┌──────────┼───────────┐
          │          │           │
          ▼          ▼           ▼
      YouTube      Audio      Persistence
       Engine      Engine        Store
          │          │           │
          ▼          ▼           ▼
      YouTube      Radio     localStorage

             Playback Engine
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Music Service     Local Library
                           │
                           ▼
                       IndexedDB
```

Con estas propiedades:

### Una sola fuente de verdad para Playback

```text
PlaybackState
```

### Una sola instancia del resolver

```text
YouTubeTrackResolver
```

### Sin dependencia de Playback → UI

Playback emite eventos.

### Sin MusicPlayer → localStorage directo

Persistence Store.

### Sin Local Library → Playback directo

Local Library usa su contrato propio.

### Sin duplicar lógica de reproducción

La decisión de:

```text
qué track
qué queue
qué índice
qué source
qué siguiente
qué anterior
repeat
shuffle
```

pertenece a Playback.

### Sin forzar YouTube

La API define qué es posible hacer de forma segura.

---

# 40. Criterio general del proyecto

La prioridad es:

```text
correctitud
→ arquitectura
→ estabilidad
→ rendimiento
→ mantenibilidad
→ después detalles visuales
```

No se busca simplemente "hacer que funcione".

Se busca que el sistema siga funcionando correctamente cuando:

* el usuario recarga;
* navega;
* cambia de fuente;
* cambia de track;
* cambia de playlist;
* utiliza Shuffle;
* utiliza Repeat;
* pausa mientras carga;
* vuelve atrás;
* entra a Local Library;
* reproduce radio;
* reproduce YouTube;
* cambia de volumen;
* busca;
* usa diferentes paneles.

La solución final debe ser coherente como sistema.

---

# 41. Próximo paso exacto

Al retomar la conversación:

1. Obtener/revisar el contenido actual de `playback-B8.ts`.
2. Obtener/revisar el `MusicPlayer.ts` actual que está generando el import.
3. Localizar todas las referencias a:

   ```text
   isPlaybackPanelSource
   ```
4. Determinar su responsabilidad correcta.
5. Corregir el contrato entre módulos.
6. Verificar exports/imports.
7. Solo después continuar con el siguiente problema de arquitectura.

No avanzar a otra refactorización hasta que este contrato quede consistente.
