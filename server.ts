import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { renderPageHtml, generateSitemapXml, generateRobotsTxt } from './src/seo/ssrRenderer';
// @ts-ignore
import btch from 'btch-downloader';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure yt-dlp binary has executable permissions on startup
try {
  const ytDlpPath = path.join(__dirname, 'yt-dlp');
  if (fs.existsSync(ytDlpPath)) {
    fs.chmodSync(ytDlpPath, 0o755);
  }
} catch (e) {
  console.warn('Could not chmod yt-dlp:', e);
}

const app = express();
// Always bind to port 3000 as required by AI Studio environment
const PORT = 3000;

function getCanonicalHost(req: express.Request): string {
  const forwardedHost = req.headers['x-forwarded-host'];
  const rawHost = typeof forwardedHost === 'string' ? forwardedHost.split(',')[0].trim() : (req.headers.host || 'youtiktools.com');
  return rawHost;
}

function getCanonicalBaseUrl(req: express.Request): string {
  const host = getCanonicalHost(req);
  const cleanHost = host.replace(/^www\./i, '');
  const isLocal = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');
  if (isLocal) {
    return `http://${cleanHost}`;
  }
  return `https://${cleanHost.includes('youtiktools.com') ? 'youtiktools.com' : cleanHost}`;
}

app.use(express.json());

interface ConversionJob {
  id: string;
  url: string;
  format: string;
  progress: number;
  status: 'processing' | 'completed' | 'error';
  text: string;
  download_url?: string;
  error?: string;
  filename?: string;
  startTime: number;
}

const jobs = new Map<string, ConversionJob>();

// Periodically purge completed files older than 1 hour to prevent disk fill
setInterval(() => {
  const now = Date.now();
  const dir = '/tmp/downloads';
  for (const [id, job] of jobs.entries()) {
    if (now - job.startTime > 3600 * 1000) {
      if (job.filename) {
        try {
          fs.unlinkSync(path.join(dir, job.filename));
        } catch {}
      }
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000);

// API: Initialize conversion job (local yt-dlp engine with 0 external redirects)
app.get('/api/convert', async (req, res) => {
  try {
    const { url, format = '1080' } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    const cleanUrl = url.trim();
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const downloadsDir = '/tmp/downloads';
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    let targetFormat = String(format).toLowerCase();
    const isAudio = targetFormat === 'mp3' || targetFormat === 'm4a' || targetFormat === 'wav' || targetFormat === 'flac';

    let height = 1080;
    if (targetFormat === '4k' || targetFormat === '2160') height = 2160;
    else if (targetFormat === '1440' || targetFormat === '2k') height = 1440;
    else if (targetFormat === '1080' || targetFormat === '1080p') height = 1080;
    else if (targetFormat === '720' || targetFormat === '720p') height = 720;
    else if (targetFormat === '480' || targetFormat === '480p') height = 480;
    else if (targetFormat === '360' || targetFormat === '360p') height = 360;

    const job: ConversionJob = {
      id: jobId,
      url: cleanUrl,
      format: targetFormat,
      progress: 20,
      status: 'processing',
      text: 'Initializing stream parser...',
      startTime: Date.now()
    };
    jobs.set(jobId, job);

    // Launch stream resolver & downloader asynchronously
    (async () => {
      try {
        const isYouTube = /(youtube\.com|youtu\.be)/i.test(cleanUrl);
        if (isYouTube) {
          try {
            const currentJob = jobs.get(jobId);
            if (currentJob) {
              currentJob.progress = 40;
              currentJob.text = 'Resolving media streams...';
            }

            const ytData = await btch.youtube(cleanUrl);
            if (ytData && ytData.status) {
              const streamUrl = isAudio ? ytData.mp3 : (ytData.mp4 || ytData.mp3);
              if (streamUrl) {
                const j = jobs.get(jobId);
                if (j) {
                  const mediaTitle = (ytData.title || 'YouTube_Media').replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 60);
                  const ext = isAudio ? 'mp3' : 'mp4';
                  const filename = `${mediaTitle}.${ext}`;
                  j.progress = 1000;
                  j.status = 'completed';
                  j.text = 'Media ready for download!';
                  j.download_url = `/api/download-proxy?download_url=${encodeURIComponent(streamUrl)}&filename=${encodeURIComponent(filename)}`;
                  return;
                }
              }
            }
          } catch (btchErr) {
            console.warn('btch.youtube attempt failed, falling back to yt-dlp:', btchErr);
          }
        }

        const outTemplate = path.join(downloadsDir, `${jobId}.%(ext)s`);
        const args: string[] = ['--js-runtimes', 'node', '--no-warnings'];

        if (isAudio) {
          args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', outTemplate, cleanUrl);
        } else {
          // Select bestvideo + bestaudio or single best stream up to requested height
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

        const ytDlpBin = path.join(__dirname, 'yt-dlp');
        const child = spawn(ytDlpBin, args);

        const currentJob = jobs.get(jobId);
        if (currentJob) {
          currentJob.progress = 35;
          currentJob.text = 'Transcoding video & audio streams...';
        }

        child.stdout.on('data', (data) => {
          const str = data.toString();
          const percentMatch = str.match(/([0-9.]+)%/);
          if (percentMatch) {
            const p = parseFloat(percentMatch[1]);
            const j = jobs.get(jobId);
            if (j && j.status === 'processing') {
              j.progress = Math.min(95, Math.max(35, Math.floor(35 + p * 0.6)));
              j.text = `Transcoding media stream (${Math.floor(p)}%)...`;
            }
          }
        });

        child.on('close', (code) => {
          const j = jobs.get(jobId);
          if (!j) return;

          if (code === 0) {
            try {
              const files = fs.readdirSync(downloadsDir).filter((f) => f.startsWith(jobId));
              if (files.length > 0) {
                const finalFilename = files[0];
                j.filename = finalFilename;
                j.progress = 1000;
                j.status = 'completed';
                j.text = 'Media ready for download!';
                j.download_url = `/api/download-file?file=${encodeURIComponent(finalFilename)}&title=${encodeURIComponent('YouTikTools_Media')}`;
                return;
              }
            } catch (err: any) {
              j.status = 'error';
              j.error = 'Failed to locate output media file';
              return;
            }
          }

          j.status = 'error';
          j.error = 'Failed to extract video stream. Please ensure video is public.';
        });

        child.on('error', (err) => {
          const j = jobs.get(jobId);
          if (j) {
            j.status = 'error';
            j.error = err.message || 'Extractor process error';
          }
        });
      } catch (err: any) {
        const j = jobs.get(jobId);
        if (j) {
          j.status = 'error';
          j.error = err.message || 'Failed to initialize downloader';
        }
      }
    })();

    return res.json({
      success: true,
      id: jobId,
      progress_url: `/api/progress?id=${jobId}`,
      title: 'YouTikTools Media'
    });
  } catch (error: any) {
    console.error('Error in /api/convert:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
});

// API: Check conversion progress
app.get('/api/progress', (req, res) => {
  const { id } = req.query;
  const jobId = typeof id === 'string' ? id : '';
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Conversion task not found or expired' });
  }

  if (job.status === 'error') {
    return res.status(400).json({ success: false, error: job.error || 'Conversion failed' });
  }

  return res.json({
    success: true,
    id: job.id,
    progress: job.progress,
    text: job.text,
    download_url: job.download_url
  });
});

// API: Serve finished downloaded files directly without any third-party redirects
app.get('/api/download-file', (req, res) => {
  const { file, title } = req.query;
  if (!file || typeof file !== 'string') {
    return res.status(400).send('Missing file parameter');
  }

  const safeFile = path.basename(file);
  const filePath = path.join('/tmp/downloads', safeFile);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found or expired');
  }

  const ext = path.extname(safeFile) || '.mp4';
  const cleanTitle = typeof title === 'string' && title ? title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70) : 'YouTikTools_Media';
  const downloadName = `${cleanTitle}${ext}`;

  res.download(filePath, downloadName);
});

// API: TikTok video extraction without watermark
app.get('/api/tiktok', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: 'TikTok service returned ' + response.status });
    }

    const json = await response.json();
    if (json.code !== 0 || !json.data) {
      return res.status(400).json({ success: false, error: json.msg || 'Failed to extract TikTok video. Make sure the video is public.' });
    }

    return res.json({ success: true, data: json.data });
  } catch (error: any) {
    console.error('Error in /api/tiktok:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
});

// API: Instagram post / reel / carousel extraction
app.get('/api/instagram', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    const cleanUrl = url.trim();

    // Try server_instagram.py first
    try {
      const scriptPath = path.join(__dirname, 'server_instagram.py');
      const { stdout } = await execFileAsync('python3', [scriptPath, cleanUrl], {
        timeout: 35000,
        maxBuffer: 10 * 1024 * 1024
      });

      if (stdout && stdout.trim()) {
        const firstBrace = stdout.indexOf('{');
        if (firstBrace !== -1) {
          const result = JSON.parse(stdout.slice(firstBrace));
          if (result.success && result.files && result.files.length > 0) {
            return res.json(result);
          }
        }
      }
    } catch (igErr) {
      console.warn('server_instagram.py failed, trying btch.igdl:', igErr);
    }

    // Fallback to btch.igdl
    try {
      const igData = await btch.igdl(cleanUrl);
      if (igData && igData.status && Array.isArray(igData.result) && igData.result.length > 0) {
        const files = igData.result.map((item: any, idx: number) => {
          const isVid = (item.url || '').includes('.mp4');
          return {
            id: `ig-file-${idx + 1}`,
            index: idx + 1,
            type: isVid ? 'video' : 'image',
            thumbnail: item.thumbnail || '',
            downloadUrl: item.url,
            resolution: isVid ? '1080p HD' : 'Original Photo',
            filename: `Instagram_Post_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
            sizeFormatted: 'Original Full Quality'
          };
        });

        return res.json({
          success: true,
          platform: 'instagram',
          id: 'ig_' + Date.now(),
          title: 'Instagram Post',
          author: '@instagram_user',
          thumbnail: files[0]?.thumbnail || '',
          isMultiple: files.length > 1,
          totalFiles: files.length,
          files
        });
      }
    } catch (fallbackErr) {
      console.warn('btch.igdl failed:', fallbackErr);
    }

    return res.status(400).json({ success: false, error: 'Failed to extract Instagram post. Please verify the URL is public.' });
  } catch (error: any) {
    console.error('Error in /api/instagram:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to extract Instagram post' });
  }
});

// API: Facebook video / reel / post extraction
app.get('/api/facebook', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    const cleanUrl = url.trim();

    // Try btch.fbdown first (fast, reliable, handles reel/watch links without login issues)
    try {
      const fbData = (await btch.fbdown(cleanUrl)) as any;
      if (fbData && fbData.status && (fbData.HD || fbData.Normal_video)) {
        const streamUrl = fbData.HD || fbData.Normal_video;
        const resolution = fbData.HD ? '1080p Full HD' : 'Standard Quality (SD)';
        const filename = fbData.filename || 'Facebook_Video.mp4';
        return res.json({
          success: true,
          platform: 'facebook',
          id: 'fb_' + Date.now(),
          title: 'Facebook Video',
          author: 'Facebook Creator',
          thumbnail: '',
          isMultiple: false,
          totalFiles: 1,
          files: [{
            id: 'fb-file-1',
            index: 1,
            type: 'video',
            thumbnail: '',
            downloadUrl: streamUrl,
            resolution,
            filename,
            sizeFormatted: 'Original Full Quality'
          }]
        });
      }
    } catch (fbErr) {
      console.warn('btch.fbdown attempt failed, trying python extractor:', fbErr);
    }

    // Fallback to server_facebook.py
    const scriptPath = path.join(__dirname, 'server_facebook.py');
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, cleanUrl], {
      timeout: 35000,
      maxBuffer: 10 * 1024 * 1024
    });

    if (!stdout.trim()) {
      return res.status(500).json({ success: false, error: stderr || 'No response from Facebook extractor' });
    }

    const firstBrace = stdout.indexOf('{');
    if (firstBrace === -1) {
      return res.status(500).json({ success: false, error: stdout.trim() });
    }

    const result = JSON.parse(stdout.slice(firstBrace));
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/facebook:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to extract Facebook video' });
  }
});

// API: Proxy download stream with attachment headers
app.get('/api/download-proxy', async (req, res) => {
  try {
    const { download_url, filename } = req.query;
    if (!download_url || typeof download_url !== 'string') {
      return res.status(400).send('Missing download_url');
    }

    let targetUrl = download_url.trim();
    if (targetUrl.startsWith('//')) {
      targetUrl = 'https:' + targetUrl;
    } else if (targetUrl.startsWith('/api/download-file')) {
      return res.redirect(targetUrl);
    } else if (targetUrl.startsWith('/')) {
      targetUrl = 'https://www.tikwm.com' + targetUrl;
    }

    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };

    if (targetUrl.includes('cdninstagram') || targetUrl.includes('instagram.com')) {
      fetchHeaders['Referer'] = 'https://www.instagram.com/';
    } else if (targetUrl.includes('fbcdn') || targetUrl.includes('facebook.com')) {
      fetchHeaders['Referer'] = 'https://www.facebook.com/';
    } else if (targetUrl.includes('tikwm.com')) {
      fetchHeaders['Referer'] = 'https://www.tikwm.com/';
    } else if (targetUrl.includes('tiktokcdn') || targetUrl.includes('tiktok.com') || targetUrl.includes('byteoversea') || targetUrl.includes('ibytedtos')) {
      fetchHeaders['Referer'] = 'https://www.tiktok.com/';
    } else if (targetUrl.includes('rapidcdn.app')) {
      fetchHeaders['Referer'] = 'https://snapsave.app/';
    } else if (targetUrl.includes('vidsnap.app') || targetUrl.includes('googlevideo.com')) {
      fetchHeaders['Referer'] = 'https://vidsnap.app/';
    }

    const response = await fetch(targetUrl, { headers: fetchHeaders });
    if (!response.ok) {
      console.warn('Proxy download error:', response.status, targetUrl);
      return res.status(response.status).json({ success: false, error: `Upstream media server returned ${response.status}` });
    }

    const cleanFilename = typeof filename === 'string' && filename ? filename : 'YouTikTools_download.mp4';
    const isAudio = cleanFilename.endsWith('.mp3') || cleanFilename.endsWith('.m4a') || cleanFilename.endsWith('.opus');
    const isImage = cleanFilename.endsWith('.jpg') || cleanFilename.endsWith('.jpeg') || cleanFilename.endsWith('.png') || cleanFilename.endsWith('.webp');
    const contentType = response.headers.get('content-type') || (isAudio ? 'audio/mpeg' : (isImage ? 'image/jpeg' : 'video/mp4'));

    const safeAsciiFilename = cleanFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (!response.body) {
      return res.status(500).json({ success: false, error: 'Empty response body from media source' });
    }

    // Pipe response body stream cleanly using Readable.fromWeb
    try {
      const nodeStream = Readable.fromWeb(response.body as any);
      nodeStream.pipe(res);
    } catch {
      const arrayBuf = await response.arrayBuffer();
      res.end(Buffer.from(arrayBuf));
    }
  } catch (error: any) {
    console.error('Error in /api/download-proxy:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: 'Proxy download error: ' + error.message });
    }
  }
});

// 301 Canonical Redirect Middleware
// Rules:
// 1. Redirect www to non-www
// 2. Redirect trailing slash to non-trailing slash (except root /)
// 3. Skip API routes, Vite internals, and file assets
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  // Skip API, Vite internals, and files with extensions
  if (req.path.startsWith('/api/') || req.path.startsWith('/@') || req.path.includes('.')) {
    return next();
  }

  const host = req.headers.host || '';
  const isWww = host.toLowerCase().startsWith('www.');
  const pathname = req.path;
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');

  if (isWww || hasTrailingSlash) {
    const cleanHost = host.replace(/^www\./i, '');
    const cleanPath = hasTrailingSlash ? pathname.replace(/\/+$/, '') : pathname;
    const isLocal = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';

    const queryIndex = req.originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? req.originalUrl.slice(queryIndex) : '';
    const redirectTarget = `${protocol}://${cleanHost}${cleanPath}${queryString}`;

    return res.redirect(301, redirectTarget);
  }

  next();
});

// Dynamic robots.txt with AdSense crawler authorization
app.get('/robots.txt', (req, res) => {
  const baseUrl = getCanonicalBaseUrl(req);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(generateRobotsTxt(baseUrl));
});

// Dynamic sitemap.xml with proper XML content-type and headers
app.get(['/sitemap.xml', '/sitemap_index.xml'], (req, res) => {
  const baseUrl = getCanonicalBaseUrl(req);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateSitemapXml(baseUrl));
});

// Alias /sitemap to /sitemap.xml
app.get('/sitemap', (req, res) => {
  res.redirect(301, '/sitemap.xml');
});

// Google AdSense ads.txt authorization route
app.get('/ads.txt', (req, res) => {
  const customPub = process.env.ADSENSE_PUB_ID || process.env.VITE_ADSENSE_PUB_ID || 'pub-1691427205816245';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`# Google AdSense Publisher Authorization File\ngoogle.com, ${customPub}, DIRECT, f08c47fec0942fa0\n`);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: mount Vite middlewares in custom appType
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'custom',
    });

    // Vite handles module transformations (/src/..., /@vite/client, etc.)
    app.use(vite.middlewares);

    // Serve static files from public
    app.use(express.static(path.join(__dirname, 'public')));

    // Pre-rendered SSR HTML handler for all pages
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/@') || req.path.includes('.')) {
        return next();
      }

      try {
        const baseUrl = getCanonicalBaseUrl(req);
        const { html, statusCode } = renderPageHtml(req.path, baseUrl);
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, html);
        return res
          .status(statusCode)
          .setHeader('Content-Type', 'text/html; charset=utf-8')
          .send(transformedHtml);
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        console.error('SSR render error in dev:', err);
        return next(err);
      }
    });
  } else {
    // In prod: serve public assets and built client assets
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

    // Pre-rendered SSR HTML handler in production
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.includes('.')) {
        return next();
      }

      const baseUrl = getCanonicalBaseUrl(req);
      const { html, statusCode } = renderPageHtml(req.path, baseUrl);
      return res
        .status(statusCode)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTikTools server running on port ${PORT}`);
  });
}

startServer();
