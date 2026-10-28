import { SocialPostData } from '../types';

export function isFacebookUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /(facebook\.com|fb\.watch|fb\.com|m\.facebook\.com|web\.facebook\.com)/i.test(trimmed);
}

export const SAMPLE_FACEBOOK_POSTS = [
  {
    title: "NASA's SpaceX Crew-13 Official Launch Stream",
    author: 'NASA - National Aeronautics and Space Administration',
    url: 'https://www.facebook.com/NASA/videos/nasas-spacex-crew-13-launch/1445780450839741/'
  }
];

export async function fetchFacebookPost(url: string): Promise<SocialPostData> {
  const cleanUrl = url.trim();

  if (!isFacebookUrl(cleanUrl)) {
    throw new Error('Please enter a valid Facebook video, reel, or watch link (e.g. facebook.com/reel/... or facebook.com/watch/?v=...).');
  }

  const endpoint = `/api/facebook?url=${encodeURIComponent(cleanUrl)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const msg = errorJson?.error || `Failed to fetch Facebook video (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const data = await response.json();
  if (!data.success || !data.files || data.files.length === 0) {
    throw new Error(data.error || 'No downloadable videos or photos detected for this Facebook post. Ensure the post is publicly accessible.');
  }

  return {
    id: data.id || 'fb_post',
    platform: 'facebook',
    title: data.title || 'Facebook Video',
    author: data.author || 'Facebook Creator',
    thumbnail: data.thumbnail || data.files[0]?.thumbnail || '',
    duration: data.duration || null,
    isMultiple: Boolean(data.isMultiple || data.files.length > 1),
    totalFiles: data.totalFiles || data.files.length,
    files: data.files.map((f: any, idx: number) => ({
      id: f.id || `fb-file-${idx + 1}`,
      index: f.index || idx + 1,
      type: f.type === 'image' ? 'image' : 'video',
      thumbnail: f.thumbnail || data.thumbnail || '',
      downloadUrl: f.downloadUrl,
      resolution: f.resolution || 'Original HD',
      filename: f.filename || `Facebook_Video_${data.id}_${idx + 1}.mp4`,
      sizeFormatted: f.sizeFormatted || 'Original Full Quality'
    }))
  };
}
