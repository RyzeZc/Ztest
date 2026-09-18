    import type {
        YouTubeSearchResponse,
        YouTubeSearchResult,
    } from './youtube-types';

interface YouTubeApiSearchItem {
    id?: {
        kind?: string;
        videoId?: string;
        playlistId?: string;
    };

    snippet?: {
        publishedAt?: string;
        title?: string;
        description?: string;
        channelTitle?: string;
        thumbnails?: {
            default?: {
                url?: string;
            };
            medium?: {
                url?: string;
            };
            high?: {
                url?: string;
            };
        };
    };
}

    interface YouTubeApiResponse {
        nextPageToken?: string;
        prevPageToken?: string;
        items?: YouTubeApiSearchItem[];
    }

    export async function searchYouTube(
        query: string,
        pageToken?: string
    ): Promise<YouTubeSearchResponse> {

        const apiKey =
            import.meta.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error(
                'YOUTUBE_API_KEY is not configured.'
            );
        }

        const params =
            new URLSearchParams({
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: '10',
                regionCode: 'PE',
                relevanceLanguage: 'es',
                safeSearch: 'moderate',
                videoEmbeddable: 'true',
                key: apiKey,
            });

        if (pageToken) {
            params.set(
                'pageToken',
                pageToken
            );
        }

        const response =
            await fetch(
                `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                '[YouTube API] Request failed:',
                errorText
            );

            throw new Error(
                `YouTube API request failed: ${response.status}`
            );
        }

        const data: YouTubeApiResponse =
        await response.json();

        const results: YouTubeSearchResult[] =
            (data.items ?? [])
                .filter(
                    item =>
                        item.id?.videoId &&
                        item.snippet?.title
                )
                .map(
                    item => ({
                        videoId:
                            item.id!.videoId!,

                        title:
                            item.snippet!.title!,

                        channelTitle:
                            item.snippet!
                                .channelTitle ??
                            '',

                        description:
                            item.snippet!
                                .description ??
                            '',

                        thumbnail:
                            item.snippet!
                                .thumbnails
                                ?.high
                                ?.url ??
                            item.snippet!
                                .thumbnails
                                ?.medium
                                ?.url ??
                            item.snippet!
                                .thumbnails
                                ?.default
                                ?.url ??
                            '',

                        publishedAt:
                            item.snippet!
                                .publishedAt ??
                            '',
                    })
                );

        return {
            results,

            nextPageToken:
                data.nextPageToken,

            prevPageToken:
                data.prevPageToken,
        };
    }

    export interface YouTubePlaylistSearchResult {

    playlistId:
        string;

    title:
        string;

    channelTitle:
        string;

    description:
        string;

    thumbnail:
        string;

    publishedAt:
        string;
}


export async function searchYouTubePlaylists(
    query: string,
    pageToken?: string
): Promise<{
    results:
        YouTubePlaylistSearchResult[];

    nextPageToken?:
        string;

    prevPageToken?:
        string;
}> {

    const apiKey =
        import.meta.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            'YOUTUBE_API_KEY is not configured.'
        );
    }

    const params =
        new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'playlist',
            maxResults: '10',
            regionCode: 'PE',
            relevanceLanguage: 'es',
            safeSearch: 'moderate',
            key: apiKey,
        });

    if (pageToken) {
        params.set(
            'pageToken',
            pageToken
        );
    }

    const response =
        await fetch(
            `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '[YouTube API] Playlist search failed:',
            errorText
        );

        throw new Error(
            `YouTube playlist search failed: ${response.status}`
        );
    }

    const data:
        YouTubeApiResponse =
        await response.json();

    const results:
        YouTubePlaylistSearchResult[] =
        (data.items ?? [])
            .filter(
                item =>
                    item.id?.playlistId &&
                    item.snippet?.title
            )
            .map(
                item => ({
                    playlistId:
                        item.id!
                            .playlistId!,

                    title:
                        item.snippet!
                            .title!,

                    channelTitle:
                        item.snippet!
                            .channelTitle ??
                        '',

                    description:
                        item.snippet!
                            .description ??
                        '',

                    thumbnail:
                        item.snippet!
                            .thumbnails
                            ?.high
                            ?.url ??
                        item.snippet!
                            .thumbnails
                            ?.medium
                            ?.url ??
                        item.snippet!
                            .thumbnails
                            ?.default
                            ?.url ??
                        '',

                    publishedAt:
                        item.snippet!
                            .publishedAt ??
                        '',
                })
            );

    return {
        results,

        nextPageToken:
            data.nextPageToken,

        prevPageToken:
            data.prevPageToken,
    };
}

export interface YouTubePlaylistTrack {

    videoId:
        string;

    title:
        string;

    channelTitle:
        string;

    description:
        string;

    thumbnail:
        string;

    publishedAt:
        string;
}


interface YouTubeApiPlaylistItem {

    snippet?: {

        title?:
            string;

        description?:
            string;

        channelTitle?:
            string;

        publishedAt?:
            string;

        thumbnails?: {

            default?: {
                url?: string;
            };

            medium?: {
                url?: string;
            };

            high?: {
                url?: string;
            };
        };

        resourceId?: {
            videoId?: string;
        };
    };
}


interface YouTubePlaylistItemsResponse {

    nextPageToken?:
        string;

    prevPageToken?:
        string;

    items?:
        YouTubeApiPlaylistItem[];
}


export async function getYouTubePlaylistItems(
    playlistId: string,
    pageToken?: string
): Promise<{
    results:
        YouTubePlaylistTrack[];

    nextPageToken?:
        string;

    prevPageToken?:
        string;
}> {

    const apiKey =
        import.meta.env.YOUTUBE_API_KEY;

    if (!apiKey) {

        throw new Error(
            'YOUTUBE_API_KEY is not configured.'
        );
    }

    const params =
        new URLSearchParams({

            part:
                'snippet',

            playlistId,

            maxResults:
                '50',

            key:
                apiKey,
        });

    if (pageToken) {

        params.set(
            'pageToken',
            pageToken
        );
    }

    const response =
        await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '[YouTube API] Playlist items request failed:',
            errorText
        );

        throw new Error(
            `YouTube playlist items request failed: ${response.status}`
        );
    }

    const data:
        YouTubePlaylistItemsResponse =
        await response.json();

    const results:
        YouTubePlaylistTrack[] =
        (data.items ?? [])
            .filter(
                item =>
                    item.snippet
                        ?.resourceId
                        ?.videoId &&
                    item.snippet
                        ?.title
            )
            .map(
                item => ({

                    videoId:
                        item.snippet!
                            .resourceId!
                            .videoId!,

                    title:
                        item.snippet!
                            .title!,

                    channelTitle:
                        item.snippet!
                            .channelTitle ??
                        '',

                    description:
                        item.snippet!
                            .description ??
                        '',

                    thumbnail:
                        item.snippet!
                            .thumbnails
                            ?.high
                            ?.url ??
                        item.snippet!
                            .thumbnails
                            ?.medium
                            ?.url ??
                        item.snippet!
                            .thumbnails
                            ?.default
                            ?.url ??
                        '',

                    publishedAt:
                        item.snippet!
                            .publishedAt ??
                        '',
                })
            );

    return {

        results,

        nextPageToken:
            data.nextPageToken,

        prevPageToken:
            data.prevPageToken,
    };
}
