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

  if (!isTikTokUrl(cleanUrl)) {
    throw new Error('Please enter a valid TikTok video URL (e.g. tiktok.com/@user/video/... or vt.tiktok.com/...).');
  }

  const res = await fetch(`/api/tiktok?url=${encodeURIComponent(cleanUrl)}`);
  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `TikTok extraction failed (HTTP ${res.status}). Ensure the video is public.`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to extract TikTok video. Make sure the video is public.');
  }

  return json.data as TikTokVideoData;
}

