import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { renderPageHtml, generateSitemapXml, generateRobotsTxt } from './src/seo/ssrRenderer';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function getCanonicalHost(req: express.Request): string {
  const forwardedHost = req.headers['x-forwarded-host'];
  const rawHost = typeof forwardedHost === 'string' ? forwardedHost.split(',')[0].trim() : (req.headers.host || 'youtiktools.com');
  return rawHost;
}

function getCanonicalBaseUrl(req: express.Request): string {
  const host = getCanonicalHost(req);
  const cleanHost = host.replace(/^www\./i, '');
  const isLocal = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  return `${protocol}://${cleanHost}`;
}

app.use(express.json());

// API: Initialize conversion job
app.get('/api/convert', async (req, res) => {
  try {
    const { url, format = '1080' } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    // Map format identifiers
    let targetFormat = String(format).toLowerCase();
    if (targetFormat === '2160' || targetFormat === '4k') targetFormat = '4k';
    else if (targetFormat === '1440' || targetFormat === '2k') targetFormat = '1440';
    else if (targetFormat === '1080' || targetFormat === '1080p') targetFormat = '1080';
    else if (targetFormat === '720' || targetFormat === '720p') targetFormat = '720';
    else if (targetFormat === '480' || targetFormat === '480p') targetFormat = '480';
    else if (targetFormat === '360' || targetFormat === '360p') targetFormat = '360';
    else if (targetFormat === 'mp3') targetFormat = 'mp3';
    else if (targetFormat === 'm4a' || targetFormat === 'aac') targetFormat = 'm4a';
    else if (targetFormat === 'wav') targetFormat = 'wav';
    else if (targetFormat === 'flac') targetFormat = 'flac';

    const apiUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${targetFormat}&url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: 'Conversion service returned status ' + response.status });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/convert:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
});

// API: Check conversion progress
app.get('/api/progress', async (req, res) => {
  try {
    const { url, id } = req.query;
    let targetUrl = typeof url === 'string' && url ? url : null;
    if (!targetUrl && id) {
      targetUrl = `https://lto2.affadaffa.com/api/progress?id=${id}`;
    }

    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'Missing progress url or id' });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: 'Progress service returned ' + response.status });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/progress:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
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

    const scriptPath = path.join(__dirname, 'server_instagram.py');
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, url], {
      timeout: 35000,
      maxBuffer: 10 * 1024 * 1024
    });

    if (!stdout.trim()) {
      return res.status(500).json({ success: false, error: stderr || 'No response from Instagram extractor' });
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

    const scriptPath = path.join(__dirname, 'server_facebook.py');
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, url], {
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

    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };
    if (download_url.includes('cdninstagram')) {
      fetchHeaders['Referer'] = 'https://www.instagram.com/';
    } else if (download_url.includes('fbcdn')) {
      fetchHeaders['Referer'] = 'https://www.facebook.com/';
    }

    const response = await fetch(download_url, { headers: fetchHeaders });
    if (!response.ok) {
      return res.status(response.status).send('Downloader upstream error');
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
      return res.status(500).send('Empty body from upstream');
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
      return res.status(500).send('Proxy download error: ' + error.message);
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
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateSitemapXml(baseUrl));
});

// Alias /sitemap to /sitemap.xml
app.get('/sitemap', (req, res) => {
  res.redirect(301, '/sitemap.xml');
});

// Google AdSense ads.txt authorization route
app.get('/ads.txt', (req, res) => {
  const customPub = process.env.ADSENSE_PUB_ID || process.env.VITE_ADSENSE_PUB_ID || 'pub-XXXXXXXXXXXXXXXX';
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
