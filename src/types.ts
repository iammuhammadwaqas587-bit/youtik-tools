export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  author: string;
  authorUrl?: string;
  thumbnail: string;
  highThumbnail: string;
  maxResThumbnail: string;
  durationFormatted: string;
  durationSeconds: number;
  viewsFormatted: string;
  publishedFormatted: string;
}

export interface TikTokVideoData {
  id: string;
  title: string;
  cover: string;
  origin_cover?: string;
  duration: number;
  play: string; // without watermark
  hdplay?: string; // HD without watermark
  wmplay?: string; // with watermark
  size?: number;
  wm_size?: number;
  hd_size?: number;
  music?: string; // mp3 audio
  music_info?: {
    title: string;
    author: string;
    cover?: string;
  };
  author: {
    nickname: string;
    unique_id: string;
    avatar: string;
  };
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
}

export type FormatSection = 
  | 'ready_video' 
  | 'hq_video' 
  | 'mp3' 
  | 'audio_only';

export interface FormattedDownloadOption {
  id: string;
  section: FormatSection;
  label: string;
  quality: string;
  container: 'MP4' | 'WEBM' | 'MP3' | 'M4A' | 'OPUS';
  extension: 'mp4' | 'webm' | 'mp3' | 'm4a' | 'opus';
  sizeFormatted: string;
  formatParam: string;
  isRecommended?: boolean;
}

export interface HistoryItem {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  format: string;
  resolution?: string;
  size: string;
  downloadedAt: number;
  extension: string;
  url: string;
  downloadUrl?: string;
  source?: 'youtube' | 'tiktok';
}

export interface DownloadTask {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  formatName: string;
  extension: string;
  resolution?: string;
  size: string;
  progress: number;
  speed: string;
  status: 'starting' | 'downloading' | 'converting' | 'completed' | 'error';
  downloadUrl?: string;
  directProxyUrl?: string;
  errorMessage?: string;
}
