/**
 * Client-Side Video Processing & Inspection Utilities
 * Operates purely in-browser via Canvas, Video, and MediaRecorder APIs.
 * Preserves 100% user privacy without uploading sensitive personal files to remote servers.
 */

export interface VideoMetadataDetails {
  filename: string;
  fileSize: number;
  fileSizeFormatted: string;
  duration: number;
  durationFormatted: string;
  width: number;
  height: number;
  resolutionLabel: string;
  aspectRatio: string;
  aspectRatioDecimal: number;
  approxBitrateKbps: number;
  format: string;
  mimeType: string;
  hasAudio: boolean;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getResolutionCategory(width: number, height: number): string {
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);

  if (maxDim >= 3840 || minDim >= 2160) return '2160p (4K Ultra HD)';
  if (maxDim >= 2560 || minDim >= 1440) return '1440p (2K Quad HD)';
  if (maxDim >= 1920 || minDim >= 1080) return '1080p (Full HD)';
  if (maxDim >= 1280 || minDim >= 720) return '720p (HD Ready)';
  if (minDim >= 480) return '480p (Standard Definition)';
  if (minDim >= 360) return '360p (Mobile Compact)';
  return '240p (Low Quality)';
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function calculateAspectRatioString(width: number, height: number): string {
  if (!width || !height) return '16:9';
  const divisor = gcd(Math.round(width), Math.round(height));
  const wRatio = Math.round(width) / divisor;
  const hRatio = Math.round(height) / divisor;

  // Approximate common ratios
  const decimal = width / height;
  if (Math.abs(decimal - 1.777) < 0.05) return '16:9';
  if (Math.abs(decimal - 0.5625) < 0.05) return '9:16 (Vertical)';
  if (Math.abs(decimal - 1.333) < 0.05) return '4:3';
  if (Math.abs(decimal - 1.0) < 0.02) return '1:1 (Square)';
  if (Math.abs(decimal - 2.333) < 0.08) return '21:9 (Ultrawide)';

  return `${wRatio}:${hRatio}`;
}

/**
 * Extract comprehensive metadata from a File object
 */
export async function extractVideoMetadataFromFile(file: File): Promise<VideoMetadataDetails> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Timed out reading video file. Ensure it is a valid video format.'));
    }, 15000);

    video.onloadedmetadata = () => {
      clearTimeout(timeoutId);
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      const duration = video.duration || 0;
      
      const approxBitrateKbps = duration > 0 
        ? Math.round(((file.size * 8) / duration) / 1000) 
        : 0;

      const extension = file.name.split('.').pop()?.toUpperCase() || 'MP4';

      URL.revokeObjectURL(objectUrl);

      resolve({
        filename: file.name,
        fileSize: file.size,
        fileSizeFormatted: formatBytes(file.size),
        duration,
        durationFormatted: formatDuration(duration),
        width,
        height,
        resolutionLabel: getResolutionCategory(width, height),
        aspectRatio: calculateAspectRatioString(width, height),
        aspectRatioDecimal: width / (height || 1),
        approxBitrateKbps,
        format: extension,
        mimeType: file.type || 'video/mp4',
        hasAudio: (video as any).mozHasAudio || Boolean((video as any).webkitAudioDecodedByteCount) || true,
      });
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode video file. Make sure it is an uncorrupted video.'));
    };
  });
}

/**
 * Capture a frame from a video at a specific second
 */
export async function captureVideoFrameAtTime(
  file: File, 
  targetTimeSeconds: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<{ dataUrl: string; width: number; height: number; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const clampedTime = Math.min(Math.max(0, targetTimeSeconds), video.duration || 0);
      video.currentTime = clampedTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            return reject(new Error('Failed to generate image blob'));
          }
          const dataUrl = canvas.toDataURL(format, quality);
          resolve({
            dataUrl,
            width: canvas.width,
            height: canvas.height,
            blob
          });
        }, format, quality);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Video frame extraction failed: ' + e));
    };
  });
}

/**
 * Capture thumbnail keyframes at 5 points (0%, 25%, 50%, 75%, 100%)
 */
export async function captureThumbnailIntervals(file: File): Promise<{
  label: string;
  percent: number;
  timeSec: number;
  dataUrl: string;
  blob: Blob;
}[]> {
  const metadata = await extractVideoMetadataFromFile(file);
  const duration = metadata.duration || 10;

  const points = [
    { label: 'Beginning (0%)', percent: 0, timeSec: 0.5 },
    { label: '25% of Video', percent: 25, timeSec: duration * 0.25 },
    { label: 'Midpoint (50%)', percent: 50, timeSec: duration * 0.50 },
    { label: '75% of Video', percent: 75, timeSec: duration * 0.75 },
    { label: 'End Frame (100%)', percent: 100, timeSec: Math.max(0, duration - 0.5) },
  ];

  const results = [];
  for (const pt of points) {
    try {
      const frame = await captureVideoFrameAtTime(file, pt.timeSec, 'image/jpeg', 0.88);
      results.push({
        label: pt.label,
        percent: pt.percent,
        timeSec: pt.timeSec,
        dataUrl: frame.dataUrl,
        blob: frame.blob,
      });
    } catch (e) {
      console.warn('Failed capturing interval frame', pt.label, e);
    }
  }

  return results;
}
