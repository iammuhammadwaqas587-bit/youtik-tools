import path from 'path';
import fs from 'fs';
import os from 'os';
import { Readable } from 'stream';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { createDecipheriv } from 'crypto';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

// =========================================================================
// LAZY OPTIONAL DEPENDENCY LOADERS (ZERO STARTUP BLOCKING OR CRASHES)
// =========================================================================

let btchCache = undefined;
async function getBtch() {
  if (btchCache !== undefined) return btchCache;
  try {
    const mod = await withTimeout(import('btch-downloader'), 5000, 'import btch-downloader');
    btchCache = mod.default || mod || null;
  } catch (err) {
    console.warn('Optional btch-downloader unavailable:', err?.message || err);
    btchCache = null;
  }
  return btchCache;
}

let snapsaveCache = undefined;
async function getSnapsave() {
  if (snapsaveCache !== undefined) return snapsaveCache;
  try {
    const mod = await withTimeout(
      import('snapsave-media-downloader'),
      5000,
      'import snapsave-media-downloader'
    );
    snapsaveCache = mod.snapsave || mod.default?.snapsave || mod.default || null;
  } catch (err) {
    console.warn('Optional snapsave-media-downloader unavailable:', err?.message || err);
    snapsaveCache = null;
  }
  return snapsaveCache;
}

let innertubeCache = undefined;
async function getInnertube() {
  if (innertubeCache !== undefined) return innertubeCache;
  try {
    const mod = await withTimeout(import('youtubei.js'), 6000, 'import youtubei.js');
    innertubeCache = mod.Innertube || mod.default?.Innertube || null;
  } catch (err) {
    console.warn('Optional youtubei.js unavailable:', err?.message || err);
    innertubeCache = null;
  }
  return innertubeCache;
}

function getDownloadsDir() {
  const dir = path.join(os.tmpdir(), 'youtiktools-downloads');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Fallback if os.tmpdir() is uncreatable
  }
  return dir;
}

function getYtDlpPath() {
  const binPath = path.join(__dirname, 'yt-dlp');
  try {
    if (fs.existsSync(binPath)) {
      try {
        fs.chmodSync(binPath, 0o755);
      } catch {}
      return binPath;
    }
  } catch {}
  return null;
}

// =========================================================================
// SHARED TIMEOUT, FETCH & TOKEN HELPERS
// =========================================================================

export function withTimeout(promise, ms, label = 'Request') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  if (typeof t.unref === 'function') t.unref();
  return controller.signal;
}

export function decodeRapidTokenUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  const trimmed = rawUrl.trim();
  if (!trimmed.includes('rapidcdn.app')) return trimmed;

  try {
    const urlObj = new URL(trimmed);
    const token = urlObj.searchParams.get('token');
    if (token && token.includes('.')) {
      const part = token.split('.')[1];
      let payloadStr = '';
      try {
        payloadStr = Buffer.from(part, 'base64url').toString('utf8');
      } catch {
        payloadStr = Buffer.from(part, 'base64').toString('utf8');
      }
      const payload = JSON.parse(payloadStr);
      if (payload && typeof payload.url === 'string' && payload.url.startsWith('http')) {
        return payload.url;
      }
    }
  } catch {
    // Keep original URL if token cannot be decoded
  }
  return trimmed;
}

export async function resolveRedirects(rawUrl, timeoutMs = 5000) {
  let current = (rawUrl || '').trim();
  if (!current) return current;

  try {
    const res = await fetch(current, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': DEFAULT_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: timeoutSignal(timeoutMs),
    });

    if (res.url && res.url.startsWith('http')) {
      current = res.url;
    }

    if (
      current.includes('/share/') ||
      current.includes('fb.watch') ||
      current.includes('l.facebook.com')
    ) {
      const html = await res.text().catch(() => '');
      const canonicalMatch =
        html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
      if (canonicalMatch && canonicalMatch[1]) {
        current = canonicalMatch[1].replace(/&amp;/g, '&');
      }
    } else {
      await res.body?.cancel().catch(() => {});
    }
  } catch {
    // Keep original URL on redirect failure
  }

  return current;
}

async function verifyMediaStreamUrl(targetUrl, extraHeaders = {}) {
  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    return false;
  }

  const headers = {
    'User-Agent': DEFAULT_UA,
    'Accept': '*/*',
    ...extraHeaders,
  };

  try {
    let res = await fetch(targetUrl, {
      method: 'HEAD',
      headers,
      signal: timeoutSignal(6000),
    }).catch(() => null);

    if (!res || !res.ok) {
      if (res?.body) await res.body.cancel().catch(() => {});
      res = await fetch(targetUrl, {
        method: 'GET',
        headers: { ...headers, Range: 'bytes=0-0' },
        signal: timeoutSignal(6000),
      }).catch(() => null);
    }

    if (!res) return false;
    const ok = res.ok;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    await res.body?.cancel().catch(() => {});
    if (!ok || ct.includes('text/html')) return false;
    return true;
  } catch {
    return false;
  }
}

// =========================================================================
// YOUTUBE & YOUTUBE TO MP3 EXTRACTION (PURE FETCH + FALLBACKS)
// =========================================================================

export function extractYouTubeVideoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const regex =
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|v\/|embed\/|live\/|shorts\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = urlOrId.match(regex);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId.trim())) return urlOrId.trim();
  return null;
}

function decodeSavetubePayload(enc) {
  const data = Buffer.from(enc, 'base64');
  const iv = data.subarray(0, 16);
  const content = data.subarray(16);
  const decipher = createDecipheriv(
    'aes-128-cbc',
    Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex'),
    iv
  );
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

async function resolveYouTubeViaSavetube(videoUrl, targetFormat, isAudio, onProgress) {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return null;

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const savetubeHeaders = {
    'Content-Type': 'application/json',
    'Referer': 'https://save-tube.com/',
    'Origin': 'https://save-tube.com',
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
  };

  let qualityCandidates;
  let downloadType;

  if (isAudio) {
    downloadType = 'audio';
    qualityCandidates = ['320', '128'];
  } else {
    downloadType = 'video';
    if (
      targetFormat === '4k' ||
      targetFormat === '2160' ||
      targetFormat === '1440' ||
      targetFormat === '2k' ||
      targetFormat === '1080' ||
      targetFormat === '1080p'
    ) {
      qualityCandidates = ['1080', '720', '360'];
    } else if (targetFormat === '720' || targetFormat === '720p') {
      qualityCandidates = ['720', '360'];
    } else if (targetFormat === '480' || targetFormat === '480p') {
      qualityCandidates = ['480', '360'];
    } else if (targetFormat === '144' || targetFormat === '144p') {
      qualityCandidates = ['144', '360'];
    } else {
      qualityCandidates = ['360', '720'];
    }
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      onProgress(25 + attempt * 5, 'Connecting to high-speed stream server...');
      const cdnRes = await fetch('https://media.savetube.vip/api/random-cdn', {
        headers: { 'User-Agent': savetubeHeaders['User-Agent'] },
        signal: timeoutSignal(7000),
      });
      if (!cdnRes.ok) continue;
      const cdnJson = await cdnRes.json();
      const cdn = cdnJson?.cdn;
      if (!cdn) continue;

      onProgress(40, 'Extracting video & audio stream metadata...');
      const infoRes = await fetch(`https://${cdn}/v2/info`, {
        method: 'POST',
        headers: savetubeHeaders,
        body: JSON.stringify({ url: canonicalUrl }),
        signal: timeoutSignal(12000),
      });
      if (!infoRes.ok) continue;
      const infoJson = await infoRes.json();
      if (!infoJson?.data) continue;

      const info = decodeSavetubePayload(infoJson.data);
      if (!info?.key) continue;

      for (const q of qualityCandidates) {
        try {
          onProgress(
            60,
            isAudio ? `Converting audio stream (${q} kbps)...` : `Preparing ${q}p MP4 stream...`
          );
          const dlRes = await fetch(`https://${cdn}/download`, {
            method: 'POST',
            headers: savetubeHeaders,
            body: JSON.stringify({
              downloadType,
              quality: q,
              key: info.key,
            }),
            signal: timeoutSignal(25000),
          });

          if (!dlRes.ok) continue;
          const dlJson = await dlRes.json();
          const dlUrl = dlJson?.data?.downloadUrl;
          if (!dlUrl || typeof dlUrl !== 'string') continue;

          const valid = await verifyMediaStreamUrl(dlUrl, {
            'User-Agent': savetubeHeaders['User-Agent'],
            'Referer': 'https://save-tube.com/',
          });
          if (!valid) continue;

          return {
            downloadUrl: dlUrl,
            title: info.title,
            resolvedExt: isAudio ? 'mp3' : 'mp4',
          };
        } catch (qErr) {
          console.warn(`Savetube quality ${q} failed on ${cdn}:`, qErr?.message || qErr);
        }
      }
    } catch (err) {
      console.warn(`Savetube attempt ${attempt + 1} failed:`, err?.message || err);
    }
  }

  return null;
}

async function resolveYouTubeViaBtch(videoUrl, isAudio, onProgress) {
  const btch = await getBtch();
  if (!btch || typeof btch.youtube !== 'function') return null;

  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    onProgress(55, 'Connecting to backup stream extractor...');
    const ytData = await withTimeout(btch.youtube(canonicalUrl), 12000, 'btch.youtube');
    if (!ytData || !ytData.status) return null;

    const dlUrl = isAudio ? ytData.mp3 || ytData.mp4 : ytData.mp4;
    if (!dlUrl || typeof dlUrl !== 'string') return null;

    const valid = await verifyMediaStreamUrl(dlUrl);
    if (!valid) return null;

    return {
      downloadUrl: dlUrl,
      title: ytData.title,
      resolvedExt: isAudio ? (ytData.mp3 ? 'mp3' : 'mp4') : 'mp4',
    };
  } catch (err) {
    console.warn('btch.youtube fallback failed:', err?.message || err);
    return null;
  }
}

async function resolveYouTubeViaInnertube(videoUrl, isAudio, onProgress) {
  const InnertubeClass = await getInnertube();
  if (!InnertubeClass) return null;

  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return null;

  try {
    onProgress(65, 'Resolving direct YouTube stream...');
    const yt = await withTimeout(
      InnertubeClass.create({ generate_session_locally: true }),
      8000,
      'Innertube.create'
    );
    const info = await withTimeout(yt.getBasicInfo(videoId), 8000, 'Innertube.getBasicInfo');
    const title = info?.basic_info?.title;

    const formats = [
      ...(info?.streaming_data?.formats || []),
      ...(info?.streaming_data?.adaptive_formats || []),
    ];

    let chosen = null;
    if (isAudio) {
      const audioFormats = (info?.streaming_data?.adaptive_formats || []).filter(
        (f) => f.has_audio && !f.has_video && f.url
      );
      audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
      chosen = audioFormats[0] || null;
    } else {
      const progFormats = (info?.streaming_data?.formats || []).filter(
        (f) => f.has_video && f.has_audio && f.url
      );
      progFormats.sort((a, b) => (b.height || 0) - (a.height || 0));
      chosen = progFormats[0] || formats.find((f) => f.url) || null;
    }

    if (!chosen?.url) return null;
    const valid = await verifyMediaStreamUrl(chosen.url);
    if (!valid) return null;

    return {
      downloadUrl: chosen.url,
      title,
      resolvedExt: isAudio ? 'm4a' : 'mp4',
    };
  } catch (err) {
    console.warn('Innertube fallback failed:', err?.message || err);
    return null;
  }
}

// =========================================================================
// FACEBOOK NORMALIZATION & EXTRACTION
// =========================================================================

function buildFacebookCandidates(rawUrl, resolvedUrl) {
  const candidates = [];
  const add = (u) => {
    if (u && typeof u === 'string' && !candidates.includes(u)) {
      candidates.push(u);
    }
  };

  for (const input of [resolvedUrl, rawUrl]) {
    if (!input) continue;
    const clean = input.trim();

    const fbidMatch = clean.match(/[?&](?:fbid|v)=(\d+)/);
    if (fbidMatch) {
      const vid = fbidMatch[1];
      add(`https://www.facebook.com/watch/?v=${vid}`);
      add(`https://www.facebook.com/reel/${vid}`);
    }

    const pathIdMatch = clean.match(/\/(?:videos|reel|posts)\/(?:[^/?#]+\/)?(\d+)/);
    if (pathIdMatch) {
      const vid = pathIdMatch[1];
      if (clean.includes('/reel/')) {
        add(`https://www.facebook.com/reel/${vid}`);
        add(`https://www.facebook.com/watch/?v=${vid}`);
      } else {
        add(`https://www.facebook.com/watch/?v=${vid}`);
        add(`https://www.facebook.com/reel/${vid}`);
      }
    }

    add(clean);
  }

  return candidates;
}

async function extractFacebookFromHtmlNode(candidateUrls) {
  for (const url of candidateUrls.slice(0, 2)) {
    const idMatch = url.match(/[?&](?:v|fbid)=(\d+)/) || url.match(/\/(?:reel|videos)\/(\d+)/);
    const vid = idMatch ? idMatch[1] : 'video';
    const pagesToFetch = [
      url,
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`,
    ];

    for (const pageUrl of pagesToFetch) {
      try {
        const res = await fetch(pageUrl, {
          headers: {
            'User-Agent': DEFAULT_UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
          },
          signal: timeoutSignal(8000),
        });
        if (!res.ok) continue;

        let html = await res.text();
        html = html
          .replace(/\\\//g, '/')
          .replace(/\\u0025/g, '%')
          .replace(/\\u0026/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"');

        const hdMatch =
          html.match(/"browser_native_hd_url"\s*:\s*"(https:[^"]+)"/) ||
          html.match(/"playable_url_quality_hd"\s*:\s*"(https:[^"]+)"/) ||
          html.match(/hd_src\s*:\s*"(https:[^"]+)"/);

        const sdMatch =
          html.match(/"browser_native_sd_url"\s*:\s*"(https:[^"]+)"/) ||
          html.match(/"playable_url"\s*:\s*"(https:[^"]+)"/) ||
          html.match(/sd_src\s*:\s*"(https:[^"]+)"/);

        const bestUrl = hdMatch?.[1] || sdMatch?.[1];
        if (!bestUrl) continue;

        const titleMatch =
          html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
          html.match(/property="og:title"\s+content="([^"]+)"/i);
        const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/i);

        const title = (titleMatch?.[1] || 'Facebook Video').trim();
        const thumb = ogImage?.[1] || '';

        return {
          success: true,
          platform: 'facebook',
          id: vid,
          title,
          author: 'Facebook Creator',
          thumbnail: thumb,
          isMultiple: false,
          totalFiles: 1,
          files: [
            {
              id: `fb-${vid}-1`,
              index: 1,
              type: 'video',
              thumbnail: thumb,
              downloadUrl: bestUrl,
              resolution: hdMatch ? '1080p Full HD' : 'Standard Quality (SD)',
              filename: `Facebook_Video_${vid}.mp4`,
              sizeFormatted: 'Original Full Quality',
            },
          ],
        };
      } catch {
        // Continue to next URL
      }
    }
  }
  return null;
}

export async function extractFacebookMedia(rawUrl) {
  const cleanUrl = rawUrl.trim();
  const needsRedirect =
    cleanUrl.includes('/share/') ||
    cleanUrl.includes('fb.watch') ||
    cleanUrl.includes('fb.com') ||
    cleanUrl.includes('l.facebook.com');

  const resolvedUrl = needsRedirect ? await resolveRedirects(cleanUrl, 5000) : cleanUrl;
  const candidateUrls = buildFacebookCandidates(cleanUrl, resolvedUrl);

  // Tier 1: snapsave-media-downloader (lazy loaded)
  const snapsaveFn = await getSnapsave();
  if (typeof snapsaveFn === 'function') {
    for (const candidate of candidateUrls.slice(0, 2)) {
      try {
        const snapRes = await withTimeout(snapsaveFn(candidate), 10000, 'snapsave-fb');
        if (snapRes?.success && Array.isArray(snapRes.data?.media) && snapRes.data.media.length > 0) {
          const preview = decodeRapidTokenUrl(snapRes.data.preview || '');
          const desc = (snapRes.data.description || '').trim();

          const decodedItems = snapRes.data.media
            .filter((m) => m && m.url && !m.shouldRender)
            .map((m) => ({
              url: decodeRapidTokenUrl(m.url),
              thumbnail: decodeRapidTokenUrl(m.thumbnail || preview || ''),
              resolution: (m.resolution || '').trim(),
              type: m.type === 'image' ? 'image' : 'video',
            }))
            .filter((m) => m.url && m.url.startsWith('http'));

          const items =
            decodedItems.length > 0
              ? decodedItems
              : snapRes.data.media
                  .filter((m) => m && m.url)
                  .map((m) => ({
                    url: decodeRapidTokenUrl(m.url),
                    thumbnail: decodeRapidTokenUrl(m.thumbnail || preview || ''),
                    resolution: (m.resolution || '').trim(),
                    type: m.type === 'image' ? 'image' : 'video',
                  }));

          items.sort((a, b) => {
            const score = (r) => {
              const s = (r || '').toLowerCase();
              if (s.includes('1080')) return 4;
              if (s.includes('720') || s.includes('hd')) return 3;
              if (s.includes('sd') || s.includes('360')) return 1;
              return 2;
            };
            return score(b.resolution) - score(a.resolution);
          });

          if (items.length > 0) {
            const best = items[0];
            const idMatch =
              candidate.match(/[?&](?:v|fbid)=(\d+)/) ||
              candidate.match(/\/(?:reel|videos)\/(\d+)/);
            const vid = idMatch ? idMatch[1] : `fb_${Date.now()}`;
            const resLabel =
              best.resolution && /hd|720|1080/i.test(best.resolution)
                ? best.resolution.includes('720')
                  ? '720p HD'
                  : '1080p Full HD'
                : best.resolution || '1080p Full HD';

            return {
              success: true,
              platform: 'facebook',
              id: vid,
              title: desc || 'Facebook Video',
              author: 'Facebook Creator',
              thumbnail: best.thumbnail || preview || '',
              isMultiple: false,
              totalFiles: 1,
              files: [
                {
                  id: 'fb-file-1',
                  index: 1,
                  type: best.type,
                  thumbnail: best.thumbnail || preview || '',
                  downloadUrl: best.url,
                  resolution: resLabel,
                  filename: `Facebook_${vid}.${best.type === 'image' ? 'jpg' : 'mp4'}`,
                  sizeFormatted: 'Original Full Quality',
                },
              ],
            };
          }
        }
      } catch (err) {
        console.warn('snapsave fb attempt failed:', err?.message || err);
      }
    }
  }

  // Tier 2: btch.fbdown (lazy loaded)
  const btch = await getBtch();
  if (btch && typeof btch.fbdown === 'function') {
    for (const candidate of candidateUrls.slice(0, 2)) {
      try {
        const fbData = await withTimeout(btch.fbdown(candidate), 10000, 'btch.fbdown');
        if (fbData && fbData.status && (fbData.HD || fbData.Normal_video)) {
          const streamUrl = decodeRapidTokenUrl(fbData.HD || fbData.Normal_video);
          const resolution = fbData.HD ? '1080p Full HD' : 'Standard Quality (SD)';
          return {
            success: true,
            platform: 'facebook',
            id: 'fb_' + Date.now(),
            title: 'Facebook Video',
            author: 'Facebook Creator',
            thumbnail: '',
            isMultiple: false,
            totalFiles: 1,
            files: [
              {
                id: 'fb-file-1',
                index: 1,
                type: 'video',
                thumbnail: '',
                downloadUrl: streamUrl,
                resolution,
                filename: fbData.filename || 'Facebook_Video.mp4',
                sizeFormatted: 'Original Full Quality',
              },
            ],
          };
        }
      } catch (fbErr) {
        console.warn('btch.fbdown attempt failed:', fbErr?.message || fbErr);
      }
    }
  }

  // Tier 3: Pure built-in fetch HTML / embed plugin parser
  const htmlResult = await extractFacebookFromHtmlNode(candidateUrls);
  if (htmlResult) return htmlResult;

  // Tier 4: Optional Python yt-dlp fallback
  const fbScriptPath = path.join(__dirname, 'server_facebook.py');
  if (fs.existsSync(fbScriptPath)) {
    try {
      const { stdout } = await execFileAsync('python3', [fbScriptPath, resolvedUrl], {
        timeout: 10000,
        maxBuffer: 10 * 1024 * 1024,
      });
      if (stdout && stdout.trim()) {
        const firstBrace = stdout.indexOf('{');
        if (firstBrace !== -1) {
          const result = JSON.parse(stdout.slice(firstBrace));
          if (result.success && result.files && result.files.length > 0) {
            return result;
          }
        }
      }
    } catch (pyErr) {
      console.warn('server_facebook.py fallback failed:', pyErr?.message || pyErr);
    }
  }

  return null;
}

// =========================================================================
// INSTAGRAM EXTRACTION (PURE FETCH EMBED + NODE + PYTHON FALLBACKS)
// =========================================================================

async function extractInstagramFromEmbedNode(cleanUrl) {
  const scMatch = cleanUrl.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!scMatch) return null;
  const shortcode = scMatch[1];

  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
      headers: {
        'User-Agent': DEFAULT_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: timeoutSignal(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const key = '"contextJSON":';
    const idx = html.indexOf(key);
    if (idx === -1) return null;

    // Slice literal JSON string following "contextJSON":
    const afterKey = html.slice(idx + key.length).trimStart();
    if (!afterKey.startsWith('"')) return null;

    let escaped = false;
    let endIdx = -1;
    for (let i = 1; i < afterKey.length; i++) {
      const ch = afterKey[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        endIdx = i;
        break;
      }
    }
    if (endIdx === -1) return null;

    const innerJsonStr = JSON.parse(afterKey.slice(0, endIdx + 1));
    const context = JSON.parse(innerJsonStr);
    const media = context?.gql_data?.shortcode_media;
    if (!media) return null;

    const uploader = media.owner?.username || 'instagram_user';
    const edges = media.edge_media_to_caption?.edges || [];
    const title = (edges[0]?.node?.text || `Media by ${uploader}`).slice(0, 120);
    const sidecar = media.edge_sidecar_to_children?.edges || [];
    const children = sidecar.length > 0 ? sidecar.map((e) => e.node) : [media];

    const files = [];
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const videoUrl = node?.video_url;
      const isVid = Boolean(node?.is_video || node?.__typename === 'GraphVideo');
      if (videoUrl) {
        files.push({
          id: `ig-${shortcode}-${i + 1}`,
          index: i + 1,
          type: 'video',
          thumbnail: node.display_url || media.display_url || '',
          downloadUrl: videoUrl,
          resolution: '1080p HD',
          filename: `Instagram_${uploader}_${shortcode}_${i + 1}.mp4`,
          sizeFormatted: 'Original Full Quality',
        });
      } else if (!isVid && node?.display_url) {
        files.push({
          id: `ig-${shortcode}-${i + 1}`,
          index: i + 1,
          type: 'image',
          thumbnail: node.display_url,
          downloadUrl: node.display_url,
          resolution: 'Original Photo',
          filename: `Instagram_${uploader}_${shortcode}_${i + 1}.jpg`,
          sizeFormatted: 'Original Full Quality',
        });
      }
    }

    if (files.length === 0) return null;

    return {
      success: true,
      platform: 'instagram',
      id: shortcode,
      title,
      author: `@${uploader}`,
      thumbnail: files[0]?.thumbnail || media.display_url || '',
      isMultiple: files.length > 1,
      totalFiles: files.length,
      files,
    };
  } catch {
    return null;
  }
}

async function extractInstagramViaNode(cleanUrl) {
  // Tier A: snapsave-media-downloader (lazy loaded)
  const snapsaveFn = await getSnapsave();
  if (typeof snapsaveFn === 'function') {
    try {
      const snapRes = await withTimeout(snapsaveFn(cleanUrl), 10000, 'snapsave-ig');
      if (snapRes?.success && Array.isArray(snapRes.data?.media) && snapRes.data.media.length > 0) {
        const preview = decodeRapidTokenUrl(snapRes.data.preview || '');
        const desc = (snapRes.data.description || '').trim();
        const files = snapRes.data.media
          .filter((item) => item && item.url)
          .map((item, idx) => {
            const urlDirect = decodeRapidTokenUrl(item.url);
            const thumbDirect = decodeRapidTokenUrl(item.thumbnail || preview || urlDirect);
            const isVid = item.type === 'video' || urlDirect.includes('.mp4');
            return {
              id: `ig-file-${idx + 1}`,
              index: idx + 1,
              type: isVid ? 'video' : 'image',
              thumbnail: thumbDirect,
              downloadUrl: urlDirect,
              resolution: isVid ? '1080p HD' : 'Original Photo',
              filename: `Instagram_Post_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
              sizeFormatted: 'Original Full Quality',
            };
          });

        if (files.length > 0) {
          return {
            success: true,
            platform: 'instagram',
            id: 'ig_' + Date.now(),
            title: desc || 'Instagram Post',
            author: '@instagram_user',
            thumbnail: files[0]?.thumbnail || preview || '',
            isMultiple: files.length > 1,
            totalFiles: files.length,
            files,
          };
        }
      }
    } catch (err) {
      console.warn('snapsave ig failed:', err?.message || err);
    }
  }

  // Tier B: btch.igdl (lazy loaded)
  const btch = await getBtch();
  if (btch && typeof btch.igdl === 'function') {
    try {
      const igData = await withTimeout(btch.igdl(cleanUrl), 10000, 'btch.igdl');
      if (igData && igData.status && Array.isArray(igData.result) && igData.result.length > 0) {
        const files = igData.result.map((item, idx) => {
          const urlDirect = decodeRapidTokenUrl(item.url || '');
          const thumbDirect = decodeRapidTokenUrl(item.thumbnail || '');
          const isVid = urlDirect.includes('.mp4') || (item.url || '').includes('.mp4');
          return {
            id: `ig-file-${idx + 1}`,
            index: idx + 1,
            type: isVid ? 'video' : 'image',
            thumbnail: thumbDirect,
            downloadUrl: urlDirect,
            resolution: isVid ? '1080p HD' : 'Original Photo',
            filename: `Instagram_Post_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
            sizeFormatted: 'Original Full Quality',
          };
        });

        return {
          success: true,
          platform: 'instagram',
          id: 'ig_' + Date.now(),
          title: 'Instagram Post',
          author: '@instagram_user',
          thumbnail: files[0]?.thumbnail || '',
          isMultiple: files.length > 1,
          totalFiles: files.length,
          files,
        };
      }
    } catch (err) {
      console.warn('btch.igdl failed:', err?.message || err);
    }
  }

  // Tier C: Built-in pure fetch embed parser (zero npm dependency fallback)
  const embedRes = await extractInstagramFromEmbedNode(cleanUrl);
  if (embedRes) return embedRes;

  return null;
}

export async function extractInstagramMedia(rawUrl) {
  let cleanUrl = rawUrl.trim().replace(/([?&])(igsh|utm_[^=]+)=[^&]*/g, '').replace(/[?&]+$/, '');
  if (cleanUrl.includes('/share/') || cleanUrl.includes('instagr.am')) {
    cleanUrl = await resolveRedirects(cleanUrl, 5000);
  }
  cleanUrl = cleanUrl.replace('instagram.com/reels/', 'instagram.com/reel/');

  // Tier 1: Optional Python extractor with fast 7s timeout
  const igScriptPath = path.join(__dirname, 'server_instagram.py');
  if (fs.existsSync(igScriptPath)) {
    try {
      const { stdout } = await execFileAsync('python3', [igScriptPath, cleanUrl], {
        timeout: 7000,
        maxBuffer: 10 * 1024 * 1024,
      });

      if (stdout && stdout.trim()) {
        const firstBrace = stdout.indexOf('{');
        if (firstBrace !== -1) {
          const result = JSON.parse(stdout.slice(firstBrace));
          if (result.success && result.files && result.files.length > 0) {
            return result;
          }
        }
      }
    } catch (igErr) {
      console.warn('server_instagram.py failed, switching to Node fallbacks:', igErr?.message || igErr);
    }
  }

  // Tier 2 & 3: Pure Node extractors
  return await extractInstagramViaNode(cleanUrl);
}

// =========================================================================
// EXPRESS ROUTE REGISTRATION (USED BY BOTH server.ts AND server.js)
// =========================================================================

export function registerMediaRoutes(app) {
  const jobs = new Map();

  // Periodically purge expired conversion jobs older than 1 hour (.unref prevents exit hang)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    const downloadsDir = getDownloadsDir();
    for (const [id, job] of jobs.entries()) {
      if (now - job.startTime > 3600 * 1000) {
        if (job.filename) {
          try {
            fs.unlinkSync(path.join(downloadsDir, job.filename));
          } catch {}
        }
        jobs.delete(id);
      }
    }
  }, 10 * 60 * 1000);
  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }

  // Enforce strict per-request timeout on JSON API routes so no request ever hangs for minutes
  app.use('/api', (req, res, next) => {
    if (!req.path.startsWith('/download-proxy') && !req.path.startsWith('/download-file')) {
      res.setTimeout(30000, () => {
        if (!res.headersSent) {
          res.status(504).json({
            success: false,
            error: 'Media extraction request timed out. Please try again.',
          });
        }
      });
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      node: process.version,
      timestamp: new Date().toISOString(),
    });
  });

  // API: Initialize conversion job (GET & POST)
  const handleConvert = async (req, res) => {
    try {
      const rawUrl = req.body?.url ?? req.query?.url;
      const format = req.body?.format ?? req.query?.format ?? '1080';
      const rawTitle = req.body?.title ?? req.query?.title;

      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing url parameter' });
      }

      const cleanUrl = rawUrl.trim();
      const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const downloadsDir = getDownloadsDir();

      const targetFormat = String(format).toLowerCase();
      const isAudio =
        targetFormat === 'mp3' ||
        targetFormat === 'm4a' ||
        targetFormat === 'opus' ||
        targetFormat === 'wav' ||
        targetFormat === 'flac';

      let height = 1080;
      if (targetFormat === '4k' || targetFormat === '2160') height = 2160;
      else if (targetFormat === '1440' || targetFormat === '2k') height = 1440;
      else if (targetFormat === '1080' || targetFormat === '1080p') height = 1080;
      else if (targetFormat === '720' || targetFormat === '720p') height = 720;
      else if (targetFormat === '480' || targetFormat === '480p') height = 480;
      else if (targetFormat === '360' || targetFormat === '360p') height = 360;
      else if (targetFormat === '240' || targetFormat === '240p') height = 240;
      else if (targetFormat === '144' || targetFormat === '144p') height = 144;

      const reqTitle =
        typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle.trim() : 'YouTikTools_Media';

      const job = {
        id: jobId,
        url: cleanUrl,
        format: targetFormat,
        progress: 20,
        status: 'processing',
        text: 'Initializing stream parser...',
        startTime: Date.now(),
      };
      jobs.set(jobId, job);

      // Launch extraction asynchronously with overall 60s cap (100% on-site, zero external redirects)
      (async () => {
        try {
          await withTimeout(
            (async () => {
              const updateJob = (progress, text) => {
                const j = jobs.get(jobId);
                if (j && j.status === 'processing') {
                  j.progress = progress;
                  j.text = text;
                }
              };

              const ytId = extractYouTubeVideoId(cleanUrl);
              if (ytId) {
                let resolved = await resolveYouTubeViaSavetube(
                  cleanUrl,
                  targetFormat,
                  isAudio,
                  updateJob
                );

                if (!resolved) {
                  resolved = await resolveYouTubeViaBtch(cleanUrl, isAudio, updateJob);
                }

                if (!resolved) {
                  resolved = await resolveYouTubeViaInnertube(cleanUrl, isAudio, updateJob);
                }

                if (resolved && resolved.downloadUrl) {
                  const j = jobs.get(jobId);
                  if (!j) return;

                  const mediaTitle =
                    reqTitle !== 'YouTikTools_Media'
                      ? reqTitle
                      : resolved.title || 'YouTikTools_Media';
                  const cleanSafeTitle =
                    mediaTitle.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70) ||
                    'YouTikTools_Media';

                  if (isAudio && targetFormat !== (resolved.resolvedExt || 'mp3')) {
                    try {
                      j.progress = 80;
                      j.text = `Transcoding to ${targetFormat.toUpperCase()}...`;

                      const srcExt = resolved.resolvedExt || 'mp3';
                      const srcPath = path.join(downloadsDir, `${jobId}_src.${srcExt}`);
                      const outFilename = `${jobId}.${targetFormat}`;
                      const outPath = path.join(downloadsDir, outFilename);

                      const srcRes = await fetch(resolved.downloadUrl, {
                        signal: timeoutSignal(30000),
                      });
                      if (!srcRes.ok) {
                        throw new Error(`Upstream audio returned ${srcRes.status}`);
                      }
                      const arrBuf = await srcRes.arrayBuffer();
                      fs.writeFileSync(srcPath, Buffer.from(arrBuf));

                      const ffArgs = ['-y', '-i', srcPath];
                      if (targetFormat === 'mp3') {
                        ffArgs.push('-c:a', 'libmp3lame', '-b:a', '192k', outPath);
                      } else if (targetFormat === 'm4a') {
                        ffArgs.push('-c:a', 'aac', '-b:a', '192k', outPath);
                      } else if (targetFormat === 'opus') {
                        ffArgs.push('-c:a', 'libopus', '-b:a', '160k', outPath);
                      } else if (targetFormat === 'flac') {
                        ffArgs.push('-c:a', 'flac', outPath);
                      } else {
                        ffArgs.push(outPath);
                      }

                      await execFileAsync('ffmpeg', ffArgs, { timeout: 30000 });
                      try {
                        fs.unlinkSync(srcPath);
                      } catch {}

                      if (fs.existsSync(outPath)) {
                        j.filename = outFilename;
                        j.progress = 1000;
                        j.status = 'completed';
                        j.text = 'Media ready for download!';
                        j.download_url = `/api/download-file?file=${encodeURIComponent(outFilename)}&title=${encodeURIComponent(mediaTitle)}`;
                        return;
                      }
                    } catch (ffErr) {
                      console.warn(
                        'Audio transcode fallback failed, serving direct audio:',
                        ffErr?.message || ffErr
                      );
                    }
                  }

                  const ext = isAudio ? resolved.resolvedExt || 'mp3' : 'mp4';
                  const filename = `${cleanSafeTitle}.${ext}`;
                  j.progress = 1000;
                  j.status = 'completed';
                  j.text = 'Media ready for download!';
                  j.download_url = `/api/download-proxy?download_url=${encodeURIComponent(resolved.downloadUrl)}&filename=${encodeURIComponent(filename)}`;
                  return;
                }
              }

              // Fallback: local yt-dlp engine if binary exists
              const ytDlpBin = getYtDlpPath();
              if (!ytDlpBin) {
                const j = jobs.get(jobId);
                if (j) {
                  j.status = 'error';
                  j.code = 'EXTRACTION_FAILED';
                  j.error =
                    'Could not extract this media stream right now. Please try 720p or 360p quality, or try again in a moment.';
                }
                return;
              }

              await new Promise((resolveSpawn) => {
                const outTemplate = path.join(downloadsDir, `${jobId}.%(ext)s`);
                const args = ['--js-runtimes', 'node', '--no-warnings'];

                if (isAudio) {
                  const audioCodec =
                    targetFormat === 'm4a' ||
                    targetFormat === 'opus' ||
                    targetFormat === 'wav' ||
                    targetFormat === 'flac'
                      ? targetFormat
                      : 'mp3';
                  args.push(
                    '-x',
                    '--audio-format',
                    audioCodec,
                    '--audio-quality',
                    '0',
                    '-o',
                    outTemplate,
                    cleanUrl
                  );
                } else {
                  args.push(
                    '-f',
                    `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}][ext=mp4]/best`,
                    '--merge-output-format',
                    'mp4',
                    '-o',
                    outTemplate,
                    cleanUrl
                  );
                }

                const child = spawn(ytDlpBin, args);
                let errorOutput = '';
                const killTimer = setTimeout(() => {
                  try {
                    child.kill('SIGKILL');
                  } catch {}
                }, 40000);

                const currentJob = jobs.get(jobId);
                if (currentJob && currentJob.progress < 30) {
                  currentJob.progress = 30;
                  currentJob.text = 'Extracting and transcoding media streams...';
                }

                child.stdout.on('data', (data) => {
                  const str = data.toString();
                  const percentMatch = str.match(/([0-9.]+)%/);
                  if (percentMatch) {
                    const p = parseFloat(percentMatch[1]);
                    const j = jobs.get(jobId);
                    if (j && j.status === 'processing') {
                      j.progress = Math.min(95, Math.max(30, Math.floor(30 + p * 0.65)));
                      j.text = `Transcoding media stream (${Math.floor(p)}%)...`;
                    }
                  }
                });

                child.stderr.on('data', (data) => {
                  errorOutput += data.toString();
                });

                child.on('close', (code) => {
                  clearTimeout(killTimer);
                  const j = jobs.get(jobId);
                  if (j && j.status === 'processing') {
                    if (code === 0) {
                      try {
                        const files = fs
                          .readdirSync(downloadsDir)
                          .filter((f) => f.startsWith(jobId) && !f.includes('_src'));
                        if (files.length > 0) {
                          const finalFilename = files[0];
                          j.filename = finalFilename;
                          j.progress = 1000;
                          j.status = 'completed';
                          j.text = 'Media ready for download!';
                          j.download_url = `/api/download-file?file=${encodeURIComponent(finalFilename)}&title=${encodeURIComponent(reqTitle)}`;
                          resolveSpawn();
                          return;
                        }
                      } catch {
                        j.status = 'error';
                        j.error = 'Failed to locate output media file';
                        resolveSpawn();
                        return;
                      }
                    }

                    j.status = 'error';
                    if (
                      errorOutput.includes('Private video') ||
                      errorOutput.includes('Video unavailable')
                    ) {
                      j.code = 'UNAVAILABLE';
                      j.error = 'Video is private, age-restricted, or unavailable.';
                    } else {
                      j.code = 'EXTRACTION_FAILED';
                      j.error =
                        'Could not extract this media stream right now. Please try another quality (such as 720p or 360p) or try again in a moment.';
                    }
                  }
                  resolveSpawn();
                });

                child.on('error', (err) => {
                  clearTimeout(killTimer);
                  const j = jobs.get(jobId);
                  if (j && j.status === 'processing') {
                    j.status = 'error';
                    j.code = 'EXTRACTION_FAILED';
                    j.error = err.message || 'Extractor process error';
                  }
                  resolveSpawn();
                });
              });
            })(),
            65000,
            'convert-job'
          );
        } catch (err) {
          const j = jobs.get(jobId);
          if (j && j.status === 'processing') {
            j.status = 'error';
            j.code = 'EXTRACTION_FAILED';
            j.error = err?.message || 'Failed to initialize downloader';
          }
        }
      })();

      return res.json({
        success: true,
        id: jobId,
        progress_url: `/api/progress?id=${jobId}`,
        title: reqTitle,
      });
    } catch (error) {
      console.error('Error in /api/convert:', error);
      return res.status(500).json({ success: false, error: error?.message || 'Internal error' });
    }
  };

  app.get('/api/convert', handleConvert);
  app.post('/api/convert', handleConvert);

  // API: Check conversion progress
  app.get('/api/progress', (req, res) => {
    const { id } = req.query;
    const jobId = typeof id === 'string' ? id : '';
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Conversion task not found or expired' });
    }

    if (job.status === 'error') {
      return res
        .status(400)
        .json({ success: false, code: job.code || 'EXTRACTION_FAILED', error: job.error || 'Conversion failed' });
    }

    return res.json({
      success: true,
      id: job.id,
      progress: job.progress,
      text: job.text,
      download_url: job.download_url,
    });
  });

  // API: Serve finished locally transcoded files directly
  app.get('/api/download-file', (req, res) => {
    const { file, title } = req.query;
    if (!file || typeof file !== 'string') {
      return res.status(400).send('Missing file parameter');
    }

    const safeFile = path.basename(file);
    const filePath = path.join(getDownloadsDir(), safeFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found or expired');
    }

    const ext = path.extname(safeFile) || '.mp4';
    const cleanTitle =
      typeof title === 'string' && title
        ? title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70)
        : 'YouTikTools_Media';
    const downloadName = `${cleanTitle}${ext}`;

    res.download(filePath, downloadName);
  });

  // API: TikTok video extraction without watermark (GET & POST, strict timeout)
  const handleTikTok = async (req, res) => {
    try {
      const rawUrl = req.body?.url ?? req.query?.url;
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing url parameter' });
      }

      const cleanUrl = rawUrl.trim();
      const result = await withTimeout(
        (async () => {
          try {
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`;
            const response = await fetch(apiUrl, {
              headers: { 'User-Agent': DEFAULT_UA },
              signal: timeoutSignal(12000),
            });

            if (response.ok) {
              const json = await response.json();
              if (json.code === 0 && json.data && (json.data.play || json.data.hdplay)) {
                return { success: true, data: json.data };
              }
            }
          } catch (tikwmErr) {
            console.warn('tikwm failed, trying btch.ttdl:', tikwmErr?.message || tikwmErr);
          }

          const btch = await getBtch();
          if (btch && typeof btch.ttdl === 'function') {
            try {
              const ttData = await withTimeout(btch.ttdl(cleanUrl), 10000, 'btch.ttdl');
              const videoUrl = Array.isArray(ttData?.video) ? ttData.video[0] : ttData?.video;
              const audioUrl = Array.isArray(ttData?.audio) ? ttData.audio[0] : ttData?.audio;
              if (videoUrl) {
                return {
                  success: true,
                  data: {
                    id: 'tt_' + Date.now(),
                    title: ttData.title || 'TikTok Video',
                    cover: ttData.thumbnail || '',
                    duration: 0,
                    play: videoUrl,
                    hdplay: videoUrl,
                    music: audioUrl || '',
                    author: {
                      nickname: ttData.creator || 'TikTok Creator',
                      unique_id: (ttData.creator || 'tiktok_user').replace(/^@/, ''),
                      avatar: ttData.thumbnail || '',
                    },
                  },
                };
              }
            } catch (btchErr) {
              console.warn('btch.ttdl failed:', btchErr?.message || btchErr);
            }
          }

          return null;
        })(),
        25000,
        'tiktok-extract'
      );

      if (result) {
        return res.json(result);
      }

      return res
        .status(400)
        .json({ success: false, error: 'Failed to extract TikTok video. Make sure the video is public.' });
    } catch (error) {
      console.error('Error in /api/tiktok:', error);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, error: error?.message || 'Internal error' });
      }
    }
  };

  app.get('/api/tiktok', handleTikTok);
  app.post('/api/tiktok', handleTikTok);

  // API: Instagram post / reel / carousel extraction (GET & POST, strict timeout)
  const handleInstagram = async (req, res) => {
    try {
      const rawUrl = req.body?.url ?? req.query?.url;
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing url parameter' });
      }

      const result = await withTimeout(extractInstagramMedia(rawUrl), 25000, 'instagram-extract');
      if (result && result.success && Array.isArray(result.files) && result.files.length > 0) {
        return res.json(result);
      }

      return res
        .status(400)
        .json({ success: false, error: 'Failed to extract Instagram post. Please verify the URL is public.' });
    } catch (error) {
      console.error('Error in /api/instagram:', error);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, error: error?.message || 'Failed to extract Instagram post' });
      }
    }
  };

  app.get('/api/instagram', handleInstagram);
  app.post('/api/instagram', handleInstagram);

  // API: Facebook video / reel / post extraction (GET & POST, strict timeout)
  const handleFacebook = async (req, res) => {
    try {
      const rawUrl = req.body?.url ?? req.query?.url;
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing url parameter' });
      }

      const result = await withTimeout(extractFacebookMedia(rawUrl), 25000, 'facebook-extract');
      if (result && result.success && Array.isArray(result.files) && result.files.length > 0) {
        return res.json(result);
      }

      return res
        .status(400)
        .json({ success: false, error: 'Failed to extract Facebook video. Please verify the URL is public.' });
    } catch (error) {
      console.error('Error in /api/facebook:', error);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, error: error?.message || 'Failed to extract Facebook video' });
      }
    }
  };

  app.get('/api/facebook', handleFacebook);
  app.post('/api/facebook', handleFacebook);

  // API: Proxy download stream with attachment headers (stays 100% on-site)
  app.get('/api/download-proxy', async (req, res) => {
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), 20000);
    if (typeof connectTimer.unref === 'function') connectTimer.unref();

    try {
      const { download_url, filename } = req.query;
      if (!download_url || typeof download_url !== 'string') {
        clearTimeout(connectTimer);
        return res.status(400).send('Missing download_url');
      }

      let targetUrl = download_url.trim();
      if (targetUrl.startsWith('//')) {
        targetUrl = 'https:' + targetUrl;
      } else if (targetUrl.startsWith('/api/download-file')) {
        clearTimeout(connectTimer);
        return res.redirect(targetUrl);
      } else if (targetUrl.startsWith('/')) {
        targetUrl = 'https://www.tikwm.com' + targetUrl;
      }

      targetUrl = decodeRapidTokenUrl(targetUrl);

      const fetchHeaders = {
        'User-Agent': DEFAULT_UA,
        'Accept': '*/*',
      };

      if (targetUrl.includes('cdninstagram') || targetUrl.includes('instagram.com') || targetUrl.includes('instagram.')) {
        fetchHeaders['Referer'] = 'https://www.instagram.com/';
      } else if (targetUrl.includes('fbcdn') || targetUrl.includes('facebook.com')) {
        fetchHeaders['User-Agent'] = 'facebookexternalhit/1.1';
        fetchHeaders['Referer'] = 'https://www.facebook.com/';
      } else if (targetUrl.includes('tikwm.com')) {
        fetchHeaders['Referer'] = 'https://www.tikwm.com/';
      } else if (
        targetUrl.includes('tiktokcdn') ||
        targetUrl.includes('tiktok.com') ||
        targetUrl.includes('byteoversea') ||
        targetUrl.includes('ibytedtos')
      ) {
        fetchHeaders['Referer'] = 'https://www.tiktok.com/';
      } else if (targetUrl.includes('savetube')) {
        fetchHeaders['Referer'] = 'https://save-tube.com/';
      }

      const upstreamMethod = req.method === 'HEAD' ? 'HEAD' : 'GET';
      let response = await fetch(targetUrl, {
        method: upstreamMethod,
        headers: fetchHeaders,
        signal: controller.signal,
      });

      if (req.method === 'HEAD' && !response.ok) {
        await response.body?.cancel().catch(() => {});
        response = await fetch(targetUrl, {
          method: 'GET',
          headers: { ...fetchHeaders, Range: 'bytes=0-0' },
          signal: controller.signal,
        });
      }
      clearTimeout(connectTimer);

      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        console.warn('Proxy download error:', response.status, targetUrl);
        return res
          .status(response.status)
          .json({ success: false, error: `Upstream media server returned ${response.status}` });
      }

      const upstreamCt = (response.headers.get('content-type') || '').toLowerCase();
      if (upstreamCt.includes('text/html')) {
        await response.body?.cancel().catch(() => {});
        console.warn('Upstream returned HTML instead of media:', targetUrl);
        return res.status(502).json({
          success: false,
          error: 'Upstream media link expired or returned a webpage instead of a media file.',
        });
      }

      const cleanFilename =
        typeof filename === 'string' && filename ? filename : 'YouTikTools_download.mp4';
      const isAudio =
        cleanFilename.endsWith('.mp3') ||
        cleanFilename.endsWith('.m4a') ||
        cleanFilename.endsWith('.opus') ||
        cleanFilename.endsWith('.wav') ||
        cleanFilename.endsWith('.flac');
      const isImage =
        cleanFilename.endsWith('.jpg') ||
        cleanFilename.endsWith('.jpeg') ||
        cleanFilename.endsWith('.png') ||
        cleanFilename.endsWith('.webp');
      const contentType =
        upstreamCt || (isAudio ? 'audio/mpeg' : isImage ? 'image/jpeg' : 'video/mp4');

      const safeAsciiFilename = cleanFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`
      );
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');

      let contentLength = response.headers.get('content-length');
      const contentRange = response.headers.get('content-range');
      if (contentRange && contentRange.includes('/')) {
        const total = contentRange.split('/')[1];
        if (total && /^\d+$/.test(total)) {
          contentLength = total;
        }
      }
      if (contentLength && !(req.method === 'HEAD' && contentLength === '1' && !contentRange)) {
        res.setHeader('Content-Length', contentLength);
      }

      if (req.method === 'HEAD') {
        await response.body?.cancel().catch(() => {});
        return res.status(200).end();
      }

      if (!response.body) {
        return res.status(500).json({ success: false, error: 'Empty response body from media source' });
      }

      try {
        const nodeStream = Readable.fromWeb(response.body);
        req.on('close', () => {
          try {
            nodeStream.destroy();
          } catch {}
        });
        nodeStream.pipe(res);
      } catch {
        const arrayBuf = await response.arrayBuffer();
        res.end(Buffer.from(arrayBuf));
      }
    } catch (error) {
      clearTimeout(connectTimer);
      console.error('Error in /api/download-proxy:', error);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, error: 'Proxy download error: ' + error.message });
      }
    }
  });
}
