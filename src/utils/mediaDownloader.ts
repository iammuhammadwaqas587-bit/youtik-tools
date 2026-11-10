/**
 * Real Media Conversion & Download Service
 */

export interface ConversionResult {
  downloadUrl: string;
  proxyUrl: string;
  title: string;
  format: string;
}

/**
 * Map quality label / extension to backend format parameter
 */
export function resolveFormatParam(resolution?: string, extension?: string): string {
  if (extension === 'mp3') return 'mp3';
  if (extension === 'm4a') return 'm4a';
  if (extension === 'wav' || extension === 'opus') return 'wav';
  if (extension === 'flac') return 'flac';

  const res = (resolution || '').toLowerCase();
  if (res.includes('4k') || res.includes('2160')) return '4k';
  if (res.includes('2k') || res.includes('1440')) return '1440';
  if (res.includes('1080')) return '1080';
  if (res.includes('720')) return '720';
  if (res.includes('480')) return '480';
  if (res.includes('360')) return '360';
  if (res.includes('240')) return '360';
  if (res.includes('144')) return '360';

  return '1080';
}

/**
 * Request real media stream conversion and poll until complete
 */
export async function convertAndGetDownloadUrl(
  videoUrl: string,
  formatParam: string,
  onProgress: (percent: number, statusText: string) => void
): Promise<ConversionResult> {
  onProgress(5, 'Connecting to high-speed stream server...');

  let initData: any = null;

  // Call in-house stream conversion engine on /api/convert
  const res = await fetch(`/api/convert?url=${encodeURIComponent(videoUrl)}&format=${formatParam}`);
  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Conversion server returned HTTP ${res.status}`);
  }

  initData = await res.json();

  if (!initData || !initData.id) {
    throw new Error(initData?.error || initData?.text || 'Could not initialize conversion job');
  }

  const videoTitle = initData.title || 'YouTikTools_Media';

  onProgress(20, 'Transcoding audio & video streams...');

  // Poll local progress endpoint
  let attempts = 0;
  const maxAttempts = 40; // up to ~80 seconds
  let finalDownloadUrl = '';

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 1500));
    attempts++;

    let pollData: any = null;

    try {
      const pRes = await fetch(`/api/progress?id=${encodeURIComponent(initData.id)}`);
      if (pRes.ok) {
        pollData = await pRes.json();
      }
    } catch (e) {
      console.warn('Poll fetch error:', e);
    }

    if (pollData) {
      if (pollData.success === false || pollData.status === 'error') {
        throw new Error(pollData.error || 'Conversion failed. Please verify the URL.');
      }

      let calcPercent = 25;
      if (typeof pollData.progress === 'number') {
        if (pollData.progress >= 1000) {
          calcPercent = 100;
        } else if (pollData.progress <= 100) {
          calcPercent = Math.max(25, Math.min(95, pollData.progress));
        } else {
          calcPercent = Math.max(25, Math.min(95, Math.floor(pollData.progress / 10)));
        }
      } else {
        calcPercent = Math.min(95, 25 + attempts * 4);
      }

      onProgress(calcPercent, pollData.text || 'Processing stream...');

      if (pollData.download_url && pollData.download_url.trim()) {
        finalDownloadUrl = pollData.download_url;
        break;
      }
    } else {
      onProgress(Math.min(90, 25 + attempts * 3), 'Extracting media chunks...');
    }
  }

  if (!finalDownloadUrl) {
    throw new Error('Media extraction timed out. Please try again with a different format.');
  }

  onProgress(100, 'Media ready for download!');

  const ext = formatParam === 'mp3' ? 'mp3' : formatParam === 'm4a' ? 'm4a' : formatParam === 'wav' ? 'wav' : 'mp4';
  const cleanTitle = videoTitle.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70);
  const safeFilename = `${cleanTitle}.${ext}`;

  const proxyUrl = finalDownloadUrl.startsWith('/api/')
    ? finalDownloadUrl
    : `/api/download-proxy?download_url=${encodeURIComponent(finalDownloadUrl)}&filename=${encodeURIComponent(safeFilename)}`;

  return {
    downloadUrl: finalDownloadUrl,
    proxyUrl,
    title: videoTitle,
    format: formatParam
  };
}

/**
 * Returns a guaranteed same-origin proxy download URL so user stays on site.
 */
export function getProxyDownloadUrl(rawUrl: string, filename: string): string {
  if (rawUrl.startsWith('/api/download-proxy') || rawUrl.startsWith('/api/download-file')) {
    return rawUrl;
  }
  const cleanFilename = (filename || 'download.mp4').replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 80);
  return `/api/download-proxy?download_url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(cleanFilename)}`;
}

/**
 * Triggers in-page download without navigating away or redirecting to external websites.
 * Users stay 100% on the YouTikTools domain.
 */
export async function triggerDirectMediaDownload(url: string, filename: string): Promise<boolean> {
  const cleanFilename = (filename || 'download.mp4').replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 80);
  const downloadUrl = getProxyDownloadUrl(url, cleanFilename);

  // Hidden anchor click to same-origin download-proxy
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.setAttribute('download', cleanFilename);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1500);

  return true;
}
