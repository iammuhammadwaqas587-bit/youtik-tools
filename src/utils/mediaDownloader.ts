/**
 * Real Media Conversion & Download Service (100% On-Site)
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
  if (extension === 'opus') return 'opus';
  if (extension === 'wav') return 'wav';
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
  onProgress: (percent: number, statusText: string) => void,
  title?: string
): Promise<ConversionResult> {
  onProgress(5, 'Connecting to high-speed stream server...');

  let initData: any = null;

  // Call in-house stream conversion engine on /api/convert
  try {
    const titleParam = title ? `&title=${encodeURIComponent(title)}` : '';
    const res = await fetch(`/api/convert?url=${encodeURIComponent(videoUrl)}&format=${formatParam}${titleParam}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Conversion server returned status ${res.status}`);
    }
    initData = data;
  } catch (err: any) {
    if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
      throw err;
    }
    throw new Error('Could not reach stream converter. Please try again in a moment.');
  }

  if (!initData || !initData.id) {
    throw new Error(initData?.error || 'Could not initialize conversion job.');
  }

  const videoTitle = title || initData.title || 'YouTikTools_Media';

  onProgress(20, 'Transcoding audio & video streams...');

  // Poll local progress endpoint (up to 120 seconds for large 1080p streams)
  let attempts = 0;
  const maxAttempts = 80;
  let finalDownloadUrl = '';

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 1500));
    attempts++;

    let pollData: any = null;

    try {
      const pRes = await fetch(`/api/progress?id=${encodeURIComponent(initData.id)}`);
      const pData = await pRes.json().catch(() => null);
      if (!pRes.ok) {
        throw new Error(pData?.error || `Conversion failed (HTTP ${pRes.status})`);
      }
      pollData = pData;
    } catch (e: any) {
      if (e.message && !e.message.toLowerCase().includes('failed to fetch')) {
        throw e;
      }
      console.warn('Poll fetch error:', e);
    }

    if (pollData) {
      if (pollData.success === false || pollData.status === 'error' || pollData.error) {
        throw new Error(pollData.error || 'Conversion failed. Please try another format or try again.');
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
        calcPercent = Math.min(95, 25 + attempts * 2);
      }

      onProgress(calcPercent, pollData.text || 'Processing stream...');

      if (pollData.download_url && pollData.download_url.trim()) {
        finalDownloadUrl = pollData.download_url;
        break;
      }
    } else {
      onProgress(Math.min(90, 25 + attempts * 2), 'Extracting media chunks...');
    }
  }

  if (!finalDownloadUrl) {
    throw new Error('Media conversion timed out. Please try 720p or 360p quality.');
  }

  onProgress(100, 'Media ready for download!');

  const ext = formatParam === 'mp3' ? 'mp3' : formatParam === 'm4a' ? 'm4a' : formatParam === 'opus' ? 'opus' : formatParam === 'wav' ? 'wav' : formatParam === 'flac' ? 'flac' : 'mp4';
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
 * Triggers verified media file download via Blob (preventing HTML/JSON files from being saved as .mp4
 * and using verified streaming attachment download for large >25MB files so native browser progress starts immediately).
 */
export async function triggerDirectMediaDownload(url: string, filename: string): Promise<boolean> {
  const cleanFilename = (filename || 'download.mp4').replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 80);
  const downloadUrl = getProxyDownloadUrl(url, cleanFilename);

  let useDirectAnchor = false;
  try {
    const headRes = await fetch(downloadUrl, { method: 'HEAD', cache: 'no-store' });
    if (!headRes.ok) {
      const errRes = await fetch(downloadUrl, { cache: 'no-store' });
      const errJson = await errRes.json().catch(() => null);
      throw new Error(errJson?.error || `Media stream unavailable (HTTP ${headRes.status})`);
    }
    const ct = (headRes.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html') || ct.includes('application/json')) {
      throw new Error('Media stream returned an invalid response instead of a video/audio file.');
    }
    const len = parseInt(headRes.headers.get('content-length') || '0', 10);
    if (len > 25 * 1024 * 1024) {
      useDirectAnchor = true;
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('Media stream') || err.message.includes('invalid response'))) {
      throw err;
    }
  }

  if (!useDirectAnchor) {
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `Download failed (HTTP ${res.status})`);
    }
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html') || ct.includes('application/json')) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || 'Upstream server returned an error page instead of media.');
    }

    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Downloaded media file was empty.');
    }
    if (blob.type.includes('text/html') || blob.type.includes('application/json')) {
      throw new Error('Upstream server returned non-media data.');
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.setAttribute('download', cleanFilename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(blobUrl);
    }, 60000);

    return true;
  }

  // Verified large (>25MB) streams use native Content-Disposition attachment download immediately
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
