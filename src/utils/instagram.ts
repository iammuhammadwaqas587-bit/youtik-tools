import { SocialPostData } from '../types';

export function isInstagramUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /(instagram\.com|instagr\.am)/i.test(trimmed);
}

export const SAMPLE_INSTAGRAM_POSTS = [
  {
    title: 'Concert in the Clouds Alpine Experience (Photo Post)',
    author: '@ud_niko',
    url: 'https://www.instagram.com/p/C2Uo9r9BLnF/'
  },
  {
    title: 'Deep Space Cosmic Exploration (Public Reel)',
    author: '@nasa',
    url: 'https://www.instagram.com/reel/C8JqGgTPrdC/'
  }
];

export async function fetchInstagramPost(url: string): Promise<SocialPostData> {
  const cleanUrl = url.trim();

  if (!isInstagramUrl(cleanUrl)) {
    throw new Error('Please enter a valid Instagram reel, post, or photo link (e.g. instagram.com/p/... or instagram.com/reel/...).');
  }

  const endpoint = `/api/instagram?url=${encodeURIComponent(cleanUrl)}`;
  const response = await fetch(endpoint);

  const rawText = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error('Unable to parse Instagram post data. Please verify the post is public and try again.');
  }

  if (!response.ok || !data || !data.success || !data.files || data.files.length === 0) {
    const msg = data?.error || `Unable to fetch Instagram post (HTTP ${response.status}). Ensure the post is publicly accessible.`;
    throw new Error(msg);
  }

  return {
    id: data.id || 'ig_post',
    platform: 'instagram',
    title: data.title || 'Instagram Post',
    author: data.author || '@instagram_user',
    thumbnail: data.thumbnail || data.files[0]?.thumbnail || '',
    isMultiple: Boolean(data.isMultiple || data.files.length > 1),
    totalFiles: data.totalFiles || data.files.length,
    files: data.files.map((f: any, idx: number) => ({
      id: f.id || `ig-file-${idx + 1}`,
      index: f.index || idx + 1,
      type: f.type === 'video' ? 'video' : 'image',
      thumbnail: f.thumbnail || data.thumbnail || '',
      downloadUrl: f.downloadUrl,
      width: f.width || null,
      height: f.height || null,
      resolution: f.resolution || (f.type === 'video' ? '1080p HD' : 'Original Quality'),
      filename: f.filename || `Instagram_${data.id}_${idx + 1}.${f.type === 'video' ? 'mp4' : 'jpg'}`,
      sizeFormatted: f.sizeFormatted || 'Original Full Quality'
    }))
  };
}
