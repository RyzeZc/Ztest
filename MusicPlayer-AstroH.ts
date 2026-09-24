---
import './MusicPlayer.css';

import LoadingSpinner
    from '../common/LoadingSpinner/LoadingSpinner.astro';
---

<div
  class="music-player is-info-loading is-artwork-loading"
  transition:persist="new-retro-music-player"
  aria-busy="true"
>


  <audio
    class="music-player-audio"
    preload="none"
  ></audio>

<!-- INFORMACIÓN -->

<button
  class="music-player-station-selector"
  type="button"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-label="Abrir estaciones"
>
  <svg
    class="music-player-station-menu-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M4 7H20" />
    <path d="M4 12H20" />
    <path d="M4 17H20" />
  </svg>

  <!-- Se mantienen porque MusicPlayer.ts los utiliza -->
  <span class="music-player-label">
    RADIO
  </span>

  <span class="music-player-station">
    Z Rock & Pop
  </span>

</button>

<div class="music-player-info">

<div class="music-player-track-artwork">

  <div
    class="music-player-track-artwork-skeleton"
    aria-hidden="true"
  ></div>

<img
  class="music-player-track-artwork-image"
  alt=""
  aria-hidden="true"
/>

</div>

<div class="music-player-track-info">

  <div class="music-player-track-title-wrapper">

    <div
      class="music-player-track-title-skeleton"
      aria-hidden="true"
    ></div>

    <div class="music-player-track-title"></div>

  </div>

    <div class="music-player-track-artist-wrapper">

      <div
        class="music-player-track-artist-skeleton"
        aria-hidden="true"
      ></div>

      <div class="music-player-track-artist"></div>

      <div class="music-player-status">

        <span class="music-player-dot"></span>

        <span class="music-player-status-text">
          LISTO
        </span>

      </div>

    </div>

</div>


</div>

<div class="music-player-station-menu">

  <div class="music-player-panel-shell">

    <!-- =================================================
         SIDEBAR
    ================================================== -->

    <aside class="music-player-panel-sidebar">

      <!-- BUSCAR -->

      <button
        class="music-player-youtube-button music-player-panel-search"
        type="button"
      >
        <svg
          class="music-player-youtube-button-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="6.5"
          />
          <path
            d="M16 16L21 21"
          />
        </svg>

        <span>
          BUSCAR
        </span>
      </button>


      <!-- NAVEGACIÓN HOME -->

      <nav
        class="music-player-panel-nav"
        aria-label="Contenido musical"
      >

        <div class="music-player-panel-nav-item-wrap">

          <button
            class="music-player-panel-nav-item is-active"
            type="button"
            data-home-section-button="trending"
            aria-current="page"
          >
            TENDENCIAS
          </button>

          <span
            class="music-player-playback-equalizer"
            data-playback-equalizer="trending"
            aria-hidden="true"
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>

        </div>

        <button
          class="music-player-panel-nav-item"
          type="button"
          data-home-section-button="discover"
        >
          DESCUBRE
        </button>

        <button
          class="music-player-panel-nav-item"
          type="button"
          data-home-section-button="playlist"
        >
          PLAYLIST
        </button>

        <button
          class="music-player-panel-nav-item"
          type="button"
          data-home-section-button="genres"
        >
          GÉNEROS
        </button>

        <button
        class="music-player-panel-nav-item"
        type="button"
        data-home-section-button="stations"
      >
        EMISORAS
      </button>

      </nav>

    </aside>


    <!-- =================================================
         ÁREA PRINCIPAL
    ================================================== -->

    <section class="music-player-panel-main">

      <!-- PESTAÑAS -->

      <nav
        class="music-player-panel-tabs"
        role="tablist"
        aria-label="Panel musical"
      >

        <button
            class="music-player-panel-tab is-active"
            type="button"
            data-panel-tab="home"
            role="tab"
            aria-selected="true"
        >
            HOME
        </button>

        <button
            class="music-player-panel-tab"
            type="button"
            data-panel-tab="search"
            role="tab"
            aria-selected="false"
        >
            BUSCAR
        </button>

        <div class="music-player-panel-tab-wrap">

          <button
              class="music-player-panel-tab"
              type="button"
              data-panel-tab="playback"
              role="tab"
              aria-selected="false"
              hidden
          >
              REPRODUCIENDO
          </button>

          <span
              class="music-player-playback-equalizer"
              data-playback-equalizer="queue"
              aria-hidden="true"
          >
              <span></span>
              <span></span>
              <span></span>
              <span></span>
          </span>

        </div>

        <button
          class="music-player-panel-close"
          type="button"
          data-panel-close
          aria-label="Cerrar panel"
      >
          <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
          >
              <path
                  d="M3 3L13 13"
              />
              <path
                  d="M13 3L3 13"
              />
          </svg>
      </button>

      </nav>


      <!-- =================================================
           VISTAS
      ================================================== -->

      <div class="music-player-panel-views">


        <!-- =================================================
             HOME
        ================================================== -->

        <section
          class="music-player-station-panel music-player-panel-view is-active"
          data-panel="home"
          data-panel-view="home"
        >

          <div class="music-player-home-sections">


            <!-- TENDENCIAS -->

<section
  class="music-player-home-section is-active"
  data-home-section="trending"
>

  <div class="music-player-list-header music-player-trending-list-header">

    <span class="music-player-list-column-index">
      #
    </span>

    <span
      class="music-player-list-column-cover"
      aria-hidden="true"
    ></span>

    <span class="music-player-list-column-title">
      TÍTULO
    </span>

    <span class="music-player-list-column-duration">
      DURACIÓN
    </span>

  </div>


  <div class="music-player-trending-list">

    <div class="music-player-trending-item">

      <span class="music-player-trending-skeleton music-player-trending-skeleton-index"></span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-cover"></span>

      <span class="music-player-trending-info">

        <span class="music-player-trending-skeleton music-player-trending-skeleton-title"></span>

        <span class="music-player-trending-skeleton music-player-trending-skeleton-artist"></span>

      </span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-duration"></span>

    </div>


    <div class="music-player-trending-item">

      <span class="music-player-trending-skeleton music-player-trending-skeleton-index"></span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-cover"></span>

      <span class="music-player-trending-info">

        <span class="music-player-trending-skeleton music-player-trending-skeleton-title"></span>

        <span class="music-player-trending-skeleton music-player-trending-skeleton-artist"></span>

      </span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-duration"></span>

    </div>


    <div class="music-player-trending-item">

      <span class="music-player-trending-skeleton music-player-trending-skeleton-index"></span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-cover"></span>

      <span class="music-player-trending-info">

        <span class="music-player-trending-skeleton music-player-trending-skeleton-title"></span>

        <span class="music-player-trending-skeleton music-player-trending-skeleton-artist"></span>

      </span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-duration"></span>

    </div>


    <div class="music-player-trending-item">

      <span class="music-player-trending-skeleton music-player-trending-skeleton-index"></span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-cover"></span>

      <span class="music-player-trending-info">

        <span class="music-player-trending-skeleton music-player-trending-skeleton-title"></span>

        <span class="music-player-trending-skeleton music-player-trending-skeleton-artist"></span>

      </span>

      <span class="music-player-trending-skeleton music-player-trending-skeleton-duration"></span>

    </div>

  </div>

</section>


            <!-- DESCUBRE -->

            <section
              class="music-player-home-section"
              data-home-section="discover"
            >

              <div class="music-player-home-placeholder">
                DESCUBRE
              </div>

            </section>


            <!-- PLAYLIST -->

            <section
              class="music-player-home-section"
              data-home-section="playlist"
            >

              <div class="music-player-home-placeholder">
                PLAYLIST
              </div>

            </section>


            <!-- GÉNEROS -->

            <section
              class="music-player-home-section"
              data-home-section="genres"
            >

              <div class="music-player-home-placeholder">
                GÉNEROS
              </div>

            </section>


            <section
  class="music-player-home-section"
  data-home-section="stations"
>

  <div
    class="music-player-list-header
           music-player-station-list-header"
  >

    <span class="music-player-list-column-index">
      #
    </span>

    <span
      class="music-player-list-column-cover"
      aria-hidden="true"
    ></span>

    <span class="music-player-list-column-title">
      EMISORA
    </span>

    <span
      class="music-player-list-column-duration"
      aria-hidden="true"
    ></span>

  </div>


  <div
    class="music-player-station-options
           music-player-station-home-list"
    role="listbox"
    aria-label="Estaciones de radio"
  >
  </div>

</section>

          </div>

        </section>


        <!-- =================================================
             RESULTADOS
        ================================================== -->

          <section
              class="music-player-station-panel music-player-panel-view"
              data-panel="search"
              data-panel-view="search"
          >

          <!--div class="music-player-results-header">

            <div class="music-player-results-eyebrow">
              BUSCAR MÚSICA
            </div>

            <div class="music-player-results-title">
              RESULTADOS
            </div>

          </div-->


          <form
            class="music-player-youtube-search"
          >

            <svg
              class="music-player-youtube-search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path
                d="M16 16L21 21"
              />
            </svg>

            <input
              class="music-player-youtube-search-input"
              type="search"
              maxlength="100"
              autocomplete="off"
              placeholder="Buscar..."
              aria-label="Buscar música"
            />

            <button
              class="music-player-youtube-search-submit"
              type="submit"
            >
              BUSCAR
            </button>

          </form>

<nav
    class="music-player-search-tabs"
    data-music-search-tabs
    role="tablist"
    aria-label="Categorías de búsqueda"
    hidden
></nav>



          <div
              class="music-player-youtube-results"
              aria-live="polite"
          >
              <div
                  class="music-player-search-infinite-loader"
                  data-music-search-loader
              >
                  <LoadingSpinner
                      size="small"
                  />
              </div>
          </div>

        </section>


        <!-- =================================================
             COLA
        ================================================== -->

        <section
            class="music-player-station-panel music-player-panel-view"
            data-panel="playback"
            data-panel-view="playback"
            hidden
        >

<div
    class="music-player-playback-context"
    data-playback-context
    hidden
>
    <img
        class="music-player-playback-context-image"
        data-playback-context-image
        alt=""
    />

    <div class="music-player-playback-context-info">

        <span
            class="music-player-playback-context-label"
            data-playback-context-label
        ></span>

        <div
            class="music-player-playback-context-title"
            data-playback-context-title
        ></div>

        <div
            class="music-player-playback-context-subtitle"
            data-playback-context-subtitle
        ></div>

    </div>
</div>
        
          <div class="music-player-list-header music-player-queue-list-header">

            <span class="music-player-list-column-index">
              #
            </span>

            <span
              class="music-player-list-column-cover"
              aria-hidden="true"
            ></span>

            <span class="music-player-list-column-title">
              TÍTULO
            </span>

            <span class="music-player-list-column-duration">
              DURACIÓN
            </span>

          </div>


          <div class="music-player-queue-list"></div>

        </section>


      </div>

    </section>

  </div>

</div>

<!-- CONTROLES PRINCIPALES -->



  <!-- CONTROLES PRINCIPALES -->

<div class="music-player-controls-area">

  <div class="music-player-controls">

    <!-- ALEATORIA -->

    <button
      class="music-player-button music-player-shuffle"
      type="button"
      aria-label="Aleatoria"
      aria-pressed="false"
      disabled
    >

<svg
  class="music-player-control-icon"
  viewBox="0 0 16 16"
  aria-hidden="true"
>
  <path
    d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"
  />
  <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z" />
</svg>

    </button>

    <!-- ANTERIOR -->

    <button
      class="music-player-button music-player-previous"
      type="button"
      aria-label="Anterior"
      disabled
    >

        <svg
        class="music-player-control-icon"
        viewBox="0 0 15 16"
        aria-hidden="true"
        >
        <path
            d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z"
        />
        </svg>

    </button>

    <!-- PLAY / PAUSE -->

    <button
      class="music-player-button music-player-play"
      type="button"
      aria-label="Reproducir"
      aria-pressed="false"
    >

      <span class="music-player-play-ring"></span>

      <svg
        class="music-player-play-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M9 6.5L18 12L9 17.5V6.5Z"
        />
      </svg>

    </button>

    <!-- SIGUIENTE -->

    <button
      class="music-player-button music-player-next"
      type="button"
      aria-label="Siguiente"
      disabled
    >

        <svg
        class="music-player-control-icon"
        viewBox="0 0 15 16"
        aria-hidden="true"
        >
        <path
            d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"
        />
        </svg>

    </button>

    <!-- REPETIR -->

    <button
      class="music-player-button music-player-repeat"
      type="button"
      aria-label="Repetir"
      aria-pressed="false"
      disabled
    >

      <svg
        class="music-player-control-icon"
        viewBox="0 0 26 26"
        aria-hidden="true"
      >
<path d="M22.1969 4.98846C21.7569 4.66331 21.1341 4.97748 21.1341 5.52465V7.20266C21.1341 7.27629 21.0744 7.33599 21.0008 7.33599H11.1341C8.18859 7.33599 5.80078 9.72381 5.80078 12.6693V14.6693C5.80078 15.0375 6.09925 15.336 6.46744 15.336H8.20078C8.56897 15.336 8.86744 15.0375 8.86744 14.6693V13.0691C8.86744 11.5963 10.0613 10.4024 11.5341 10.4024H21.0008C21.0744 10.4024 21.1341 10.4621 21.1341 10.5357V12.215C21.1341 12.7621 21.7569 13.0763 22.197 12.7511L26.7242 9.40583C27.0849 9.13934 27.0849 8.59995 26.7242 8.33347L22.1969 4.98846Z" />
<path d="M10.8652 24.7975C10.8652 24.7238 10.9249 24.6641 10.9986 24.6641H20.8652C23.8108 24.6641 26.1986 22.2763 26.1986 19.3308V17.3308C26.1986 16.9626 25.9001 16.6641 25.5319 16.6641H23.7986C23.4304 16.6641 23.1319 16.9626 23.1319 17.3308V18.931C23.1319 20.4038 21.938 21.5977 20.4652 21.5977H10.9986C10.9249 21.5977 10.8652 21.538 10.8652 21.4644V19.7851C10.8652 19.238 10.2425 18.9238 9.80239 19.249L5.27512 22.5943C4.91447 22.8608 4.91448 23.4002 5.27514 23.6666L9.80241 27.0116C10.2425 27.3368 10.8652 27.0226 10.8652 26.4755V24.7975Z" />
      </svg>

    </button>

  </div>

  <div class="music-player-progress">

    <span class="music-player-time-current">
      0:00
    </span>

    <div class="music-player-seek-wrapper">

        <div class="music-player-seek-progress"></div>

        <input
            class="music-player-seek"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value="0"
            aria-label="Progreso de la canción"
        />

    </div>

    <span class="music-player-time-total">
      0:00
    </span>

  </div>

</div>

  <!-- VOLUMEN -->
<div class="music-player-right-zone">
  <div class="music-player-volume">

    <button
      class="music-player-button music-player-mute"
      type="button"
      aria-label="Silenciar"
      aria-pressed="false"
    >

      <svg
        class="music-player-volume-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          class="volume-speaker"
          d="M5 9H8L12 5V19L8 15H5V9Z"
        />

        <path
          class="volume-wave volume-wave-1"
          d="M15 9C16.2 10.2 16.2 13.8 15 15"
        />

        <path
          class="volume-wave volume-wave-2"
          d="M17.5 6.8C20 9.3 20 14.7 17.5 17.2"
        />

      </svg>

    </button>

  <div class="music-player-volume-slider-wrapper">

    <div class="music-player-volume-progress"></div>

    <input
      class="music-player-volume-slider"
      type="range"
      min="0"
      max="1"
      step="0.01"
      value="1"
      aria-label="Volumen"
    />

  </div>

</div>

  <!-- VIDEO TOGGLE -->

<!-- LISTA PERSONALIZADA -->

    <button
        class="music-player-button music-player-custom-list-button"
        type="button"
        aria-label="Abrir lista personalizada"
        title="Lista personalizada"
    >
        <svg
            class="music-player-custom-list-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 6.5H13.5" />
            <path d="M4 11.5H13.5" />
            <path d="M4 16.5H10" />
            <path d="M17.5 14V20" />
            <path d="M14.5 17H20.5" />
        </svg>
    </button>  
    
    <button
        class="music-player-button music-player-video-toggle"
        type="button"
        aria-label="Mostrar video de YouTube"
        aria-pressed="false"
    >
    <svg
      class="music-player-video-toggle-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="6"
        width="13"
        height="12"
        rx="2"
      />
      <path
        d="M16 10L21 7.5V16.5L16 14"
      />
    </svg>
  </button>

    <!-- PANEL DE VIDEO -->
  <div
    class="music-player-video-panel"
    hidden
    aria-hidden="true"
  >
    <div class="music-player-video-frame">

      <div
        class="music-player-youtube-player"
        aria-hidden="true"
      ></div>

    </div>
  </div>
</div>

</div>

<script src="./MusicPlayer.ts"></script>

