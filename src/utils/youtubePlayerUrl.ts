export interface ParsedYouTubeLink {
  videoId: string;
  startSeconds: number | null;
  normalizedWatchUrl: string;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Parses timestamps like "90", "90s", "1m30s", "1h2m3s" into integer seconds.
 */
export function parseYouTubeTimestamp(rawValue: string | null | undefined): number | null {
  if (!rawValue) return null;
  const cleaned = rawValue.trim().toLowerCase();
  if (!cleaned) return null;

  // Plain integer seconds (e.g. "90" or "90s")
  if (/^\d+s?$/.test(cleaned)) {
    const secs = parseInt(cleaned.replace(/s$/, ''), 10);
    return Number.isFinite(secs) && secs > 0 ? secs : null;
  }

  // HMS format (e.g. "1h2m3s", "2m15s", "1h30m")
  const hmsMatch = cleaned.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
    const hours = hmsMatch[1] ? parseInt(hmsMatch[1], 10) : 0;
    const minutes = hmsMatch[2] ? parseInt(hmsMatch[2], 10) : 0;
    const seconds = hmsMatch[3] ? parseInt(hmsMatch[3], 10) : 0;
    const total = hours * 3600 + minutes * 60 + seconds;
    return total > 0 ? total : null;
  }

  return null;
}

/**
 * Extracts YouTube video ID and optional timestamp from any common YouTube URL format:
 * - youtube.com/watch?v=ID
 * - m.youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/shorts/ID
 * - youtube.com/embed/ID
 * - youtube.com/live/ID
 * - youtube-nocookie.com/embed/ID
 * - Links with extra query parameters & t= / start= timestamps
 */
export function parseYouTubeUrl(input: string): ParsedYouTubeLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Support bare links without scheme like "youtu.be/dQw4w9WgXcQ" or "youtube.com/watch?v=..."
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    if (
      /^(www\.|m\.|music\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(candidate)
    ) {
      candidate = `https://${candidate}`;
    } else {
      return null;
    }
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidate);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const isYouTubeHost =
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com';

  if (!isYouTubeHost) {
    return null;
  }

  let videoId: string | null = null;
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    if (pathSegments[0] && YOUTUBE_ID_REGEX.test(pathSegments[0])) {
      videoId = pathSegments[0];
    }
  } else {
    // Check ?v= first (works for /watch, /watch?v=...&list=..., m.youtube.com/watch?v=...)
    const vParam = parsedUrl.searchParams.get('v');
    if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
      videoId = vParam;
    } else if (pathSegments.length >= 2) {
      const prefix = parsedUrl.pathname.split('/').filter(Boolean)[0].toLowerCase();
      const idCandidate = pathSegments[1];
      if (
        (prefix === 'shorts' ||
          prefix === 'embed' ||
          prefix === 'live' ||
          prefix === 'v') &&
        YOUTUBE_ID_REGEX.test(idCandidate)
      ) {
        videoId = idCandidate;
      }
    }
  }

  if (!videoId) {
    return null;
  }

  // Extract timestamp from query (?t= or ?start=) or hash (#t=...)
  let startSeconds =
    parseYouTubeTimestamp(parsedUrl.searchParams.get('t')) ??
    parseYouTubeTimestamp(parsedUrl.searchParams.get('start'));

  if (startSeconds === null && parsedUrl.hash) {
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    startSeconds =
      parseYouTubeTimestamp(hashParams.get('t')) ??
      parseYouTubeTimestamp(hashParams.get('start'));
  }

  const normalizedWatchUrl = startSeconds
    ? `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`
    : `https://www.youtube.com/watch?v=${videoId}`;

  return {
    videoId,
    startSeconds,
    normalizedWatchUrl,
  };
}

export function buildNoCookieEmbedUrl(videoId: string, startSeconds: number | null): string {
  const base = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    controls: '1',
  });
  if (startSeconds && startSeconds > 0) {
    params.set('start', String(startSeconds));
  }
  return `${base}?${params.toString()}`;
}

export function formatTimestampLabel(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
