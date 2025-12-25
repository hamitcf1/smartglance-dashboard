import { YouTubeVideo } from '../types';

// YouTube Data API v3 - requires API key from Google Cloud Console
// https://console.cloud.google.com/

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured');
    return [];
  }

  try {
    // Get uploads playlist ID for the channel using channel ID directly
    const channelRes = await fetch(
      `${API_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelRes.ok) {
      console.error('Channel fetch failed:', await channelRes.text());
      throw new Error('Failed to fetch channel');
    }
    const channelData = await channelRes.json();
    
    if (!channelData.items?.length) {
      console.error('No channel found for ID:', channelId);
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from the uploads playlist
    const videosRes = await fetch(
      `${API_BASE}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosRes.ok) {
      console.error('Videos fetch failed:', await videosRes.text());
      throw new Error('Failed to fetch videos');
    }
    const videosData = await videosRes.json();

    return videosData.items?.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    })) || [];
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

export async function searchChannelByName(channelName: string): Promise<Array<{ id: string; name: string }>> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured');
    return [];
  }

  try {
    const res = await fetch(
      `${API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&maxResults=5&key=${YOUTUBE_API_KEY}`
    );

    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();

    return data.items?.map((item: any) => ({
      id: item.snippet.channelId,
      name: item.snippet.title
    })) || [];
  } catch (error) {
    console.error('Error searching channels:', error);
    return [];
  }
}
