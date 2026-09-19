E:\Proyectos\Websites\new-retro-frontend-2026-astro>npx tsx prueba-youtube.ts

💿 Conectando a YouTube Music para: 6GUm5g8SG4o
⏳ Solicitando Up Next...

================ UP NEXT ================
Keys del objeto Up Next:
[
  'type',
  'title',
  'title_text',
  'contents',
  'playlist_id',
  'is_infinite',
  'continuation',
  'is_editable',
  'preview_description',
  'num_items_to_show'
]

Cantidad de contents: 50

==========================================

================ PRIMER TRACK ================
Constructor: PlaylistPanelVideo
Keys: [
  'type',         'title',
  'thumbnail',    'endpoint',
  'selected',     'video_id',
  'duration',     'author',
  'album',        'artists',
  'badges',       'menu',
  'set_video_id'
]

Objeto completo:
PlaylistPanelVideo {
  type: 'PlaylistPanelVideo',
  title: Text {
    text: 'Locked Away (Official Video) (feat. Adam Levine)',
    runs: [ [TextRun] ],
    endpoint: undefined,
    accessibility: undefined,
    rtl: false
  },
  thumbnail: [
    Thumbnail {
      url: 'https://i.ytimg.com/vi/6GUm5g8SG4o/hq720.jpg?sqp=-oaymwEKCNUGEN8DIABIWg&rs=AMzJL3mrsigf9xlTJd94hdY5FAmfCrTxQQ',
      width: 853,
      height: 479
    },
    Thumbnail {
      url: 'https://i.ytimg.com/vi/6GUm5g8SG4o/hq720.jpg?sqp=-oaymwEKCKAGEMIDIABIWg&rs=AMzJL3lIYVbQamFd4gkJ4nTejZMHoU7mKQ',
      width: 800,
      height: 450
    },
    Thumbnail {
      url: 'https://i.ytimg.com/vi/6GUm5g8SG4o/hqdefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCggAEOADGC0guwJIWg&rs=AMzJL3naKFVQMBgcKw66dsojngi0IRMwrg',
      width: 400,
      height: 225
    }
  ],
  endpoint: NavigationEndpoint {
    type: 'NavigationEndpoint',
    name: 'watchEndpoint',
    payload: {
      videoId: '6GUm5g8SG4o',
      playlistId: 'RDAMVM6GUm5g8SG4o',
      index: 0,
      params: 'OAHyAQQIAXgB6gQLNkdVbTVnOFNHNG8%3D',
      playerParams: '8AUBygYQNTZCNDRGNkQxMDU1N0NDNrAIAg%3D%3D',
      playlistSetVideoId: '56B44F6D10557CC6',
      loggingContext: [Object],
      watchEndpointMusicSupportedConfigs: [Object]
    },
    dialog: undefined,
    modal: undefined,
    open_popup: undefined,
    next_endpoint: undefined,
    metadata: { api_url: '/player' },
    command: WatchEndpoint { type: 'WatchEndpoint' },
    commands: undefined
  },
  selected: true,
  video_id: '6GUm5g8SG4o',
  duration: { text: '4:26', seconds: 266 },
  author: 'R. City',
  album: undefined,
  artists: [
    {
      name: 'R. City',
      channel_id: 'UC6Ilv4j2Gbnz5LXmn3QgzGA',
      endpoint: [NavigationEndpoint]
    }
  ],
  badges: [],
  menu: Menu {
    type: 'Menu',
    items: [
      [MenuNavigationItem],
      [MenuServiceItem],
      [MenuServiceItem],
      [ToggleMenuServiceItem],
      [MenuServiceItemDownload],
      [MenuNavigationItem],
      [MenuServiceItem],
      [MenuServiceItem],
      [MenuNavigationItem],
      [MenuNavigationItem],
      [MenuServiceItem]
    ],
    flexible_items: [],
    top_level_buttons: [],
    accessibility: { accessibility_data: [AccessibilityData] }
  },
  set_video_id: '56B44F6D10557CC6'
}

==============================================

================ CONTINUATION ================
Keys relacionadas con continuation:
continuation : CDISXhILTXJUejV4am1zbzQiEVJEQU1WTTZHVW01ZzhTRzRvMiR3QUVCOGdFQ2VBSHFCQXMyUjFWdE5XYzRVMGMwYnclM0QlM0Q4MdABAfoBEEQ2MjVBQjQwMjk0RDM4MUQYCg%3D%3D

===============================================
🔎 Encontrado: root.continuation
CDISXhILTXJUejV4am1zbzQiEVJEQU1WTTZHVW01ZzhTRzRvMiR3QUVCOGdFQ2VBSHFCQXMyUjFWdE5XYzRVMGMwYnclM0QlM0Q4MdABAfoBEEQ2MjVBQjQwMjk0RDM4MUQYCg%3D%3D

================ PRIMEROS 15 TRACKS ================
[
  {
    "posicion": 1,
    "id": "6GUm5g8SG4o",
    "title": "Locked Away (Official Video) (feat. Adam Levine)",
    "author": "R. City",
    "duration": {
      "text": "4:26",
      "seconds": 266
    }
  },
  {
    "posicion": 2,
    "id": "T3E9Wjbq44E",
    "title": "Stereo Hearts (feat. Adam Levine) (feat. Adam Levine)",
    "author": "Gym Class Heroes",
    "duration": {
      "text": "3:37",
      "seconds": 217
    }
  },
  {
    "posicion": 3,
    "id": "dYVzJ7QpYTU",
    "title": "Take You Down",
    "author": "R. City",
    "duration": {
      "text": "4:20",
      "seconds": 260
    }
  },
  {
    "posicion": 4,
    "id": "PIh2xe4jnpk",
    "title": "Rude",
    "author": "MAGIC!",
    "duration": {
      "text": "3:46",
      "seconds": 226
    }
  },
  {
    "posicion": 5,
    "id": "lY2yjAdbvdQ",
    "title": "Treat You Better",
    "author": "Shawn Mendes",
    "duration": {
      "text": "4:17",
      "seconds": 257
    }
  },
  {
    "posicion": 6,
    "id": "euCqAq6BRa4",
    "title": "Let Me Love You (feat. Justin Bieber)",
    "author": "DJ Snake",
    "duration": {
      "text": "3:26",
      "seconds": 206
    }
  },
  {
    "posicion": 7,
    "id": "aJOTlE1K90k",
    "title": "Girls Like You",
    "author": "Maroon 5",
    "duration": {
      "text": "4:31",
      "seconds": 271
    }
  },
  {
    "posicion": 8,
    "id": "jGflUbPQfW8",
    "title": "Cheerleader (Felix Jaehn Remix Radio Edit)",
    "author": "OMI",
    "duration": {
      "text": "3:10",
      "seconds": 190
    }
  },
  {
    "posicion": 9,
    "id": "zABLecsR5UE",
    "title": "Someone You Loved",
    "author": "Lewis Capaldi",
    "duration": {
      "text": "3:06",
      "seconds": 186
    }
  },
  {
    "posicion": 10,
    "id": "EJb9s-bc8e0",
    "title": "Locked Away Again (The Remix) (Audio) (feat. Adam Levine)",
    "author": "R. City",
    "duration": {
      "text": "4:11",
      "seconds": 251
    }
  },
  {
    "posicion": 11,
    "id": "RgKAFK5djSk",
    "title": "See You Again (feat. Charlie Puth)",
    "author": "Wiz Khalifa",
    "duration": {
      "text": "3:58",
      "seconds": 238
    }
  },
  {
    "posicion": 12,
    "id": "bg1sT4ILG0w",
    "title": "Am I Wrong",
    "author": "Nico & Vinz",
    "duration": {
      "text": "5:05",
      "seconds": 305
    }
  },
  {
    "posicion": 13,
    "id": "1G4isv_Fylg",
    "title": "Paradise",
    "author": "Coldplay",
    "duration": {
      "text": "4:21",
      "seconds": 261
    }
  },
  {
    "posicion": 14,
    "id": "P4JEuv07iAU",
    "title": "Crazy Love (feat. Tarrus Riley)",
    "author": "R. City",
    "duration": {
      "text": "3:55",
      "seconds": 235
    }
  },
  {
    "posicion": 15,
    "id": "e-fA-gBCkj0",
    "title": "Locked Out of Heaven",
    "author": "Bruno Mars",
    "duration": {
      "text": "3:55",
      "seconds": 235
    }
  }
]

======================================================
