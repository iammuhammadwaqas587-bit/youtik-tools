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

  // Try via local Express proxy first, fallback to direct
  try {
    const res = await fetch(`/api/convert?url=${encodeURIComponent(videoUrl)}&format=${formatParam}`);
    if (res.ok) {
      initData = await res.json();
    }
  } catch (err) {
    console.warn('Backend proxy /api/convert failed, falling back to direct:', err);
  }

  // Fallback to direct call if server proxy wasn't reached
  if (!initData || !initData.id) {
    const directRes = await fetch(
      `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${formatParam}&url=${encodeURIComponent(videoUrl)}`
    );
    if (!directRes.ok) {
      throw new Error('Conversion service returned status ' + directRes.status);
    }
    initData = await directRes.json();
  }

  if (!initData || (!initData.id && !initData.progress_url)) {
    throw new Error(initData?.error || initData?.text || 'Could not initialize conversion job');
  }

  const progressUrl = initData.progress_url || `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;
  const videoTitle = initData.title || initData.info?.title || 'TubeStream_Media';

  onProgress(20, 'Transcoding audio & video streams...');

  // Poll progress endpoint
  let attempts = 0;
  const maxAttempts = 35; // up to ~70 seconds
  let finalDownloadUrl = '';

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    let pollData: any = null;

    try {
      // Try proxy first
      const pRes = await fetch(`/api/progress?url=${encodeURIComponent(progressUrl)}&id=${encodeURIComponent(initData.id || '')}`);
      if (pRes.ok) {
        pollData = await pRes.json();
      }
    } catch {
      // Direct fallback
      try {
        const directP = await fetch(progressUrl);
        if (directP.ok) {
          pollData = await directP.json();
        }
      } catch (e) {
        console.warn('Poll fetch error:', e);
      }
    }

    if (pollData) {
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
        calcPercent = Math.min(90, 25 + attempts * 3);
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
    throw new Error('Media extraction timed out. Please try again with a different format.');
  }

  onProgress(100, 'Media ready for download!');

  const ext = formatParam === 'mp3' ? 'mp3' : formatParam === 'm4a' ? 'm4a' : formatParam === 'wav' ? 'wav' : 'mp4';
  const cleanTitle = videoTitle.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70);
  const safeFilename = `${cleanTitle}.${ext}`;

  const proxyUrl = `/api/download-proxy?download_url=${encodeURIComponent(finalDownloadUrl)}&filename=${encodeURIComponent(safeFilename)}`;

  return {
    downloadUrl: finalDownloadUrl,
    proxyUrl,
    title: videoTitle,
    format: formatParam
  };
}

/**
 * Triggers actual download with universal mobile and laptop compatibility
 */
export async function triggerDirectMediaDownload(url: string, filename: string): Promise<boolean> {
  const isMobile = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

  // On Mobile: Direct link triggers native Safari/Chrome OS download manager
  if (isMobile) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 1500);
    return true;
  }

  // On Laptop: Save verified complete binary blob to disk
  try {
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 1024) {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        return true;
      }
    }
  } catch (err) {
    console.warn('Direct blob fetch failed, falling back to direct anchor link:', err);
  }

  // Fallback anchor click
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 1000);
  return true;
}
