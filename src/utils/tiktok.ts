import { TikTokVideoData } from '../types';

export function isTikTokUrl(url: string): boolean {
  if (!url) return false;
  return /(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i.test(url.trim());
}

export const SAMPLE_TIKTOK_VIDEOS = [
  {
    title: 'How many frogs did you find? 🐸 Minecraft community',
    author: '@tiktok',
    url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675'
  },
  {
    title: 'Epic nature cinematic shot in 4K',
    author: '@discovery',
    url: 'https://www.tiktok.com/@discovery/video/7151036814264962350'
  }
];

export async function fetchTikTokVideo(url: string): Promise<TikTokVideoData> {
  const cleanUrl = url.trim();

  // Try server endpoint first
  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(cleanUrl)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as TikTokVideoData;
      }
    }
  } catch (err) {
    console.warn('Backend /api/tiktok proxy failed, trying direct:', err);
  }

  // Fallback direct call
  const directUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`;
  const res = await fetch(directUrl);
  if (!res.ok) {
    throw new Error('TikTok extraction service returned status ' + res.status);
  }

  const json = await res.json();
  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || 'Unable to download this TikTok video. Ensure the video is public.');
  }

  return json.data as TikTokVideoData;
}
