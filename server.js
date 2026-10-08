import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json());

// Enable CORS for all API routes (safe for public converter)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint for host monitor and Hostinger uptime checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error in /api/tiktok:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
});

// API: Proxy download stream with attachment headers
app.get('/api/download-proxy', async (req, res) => {
  try {
    const { download_url, filename } = req.query;
    if (!download_url || typeof download_url !== 'string') {
      return res.status(400).send('Missing download_url');
    }

    const response = await fetch(download_url);
    if (!response.ok) {
      return res.status(response.status).send('Downloader upstream error');
    }

    const cleanFilename = typeof filename === 'string' && filename ? filename : 'YouTikTools_download.mp4';
    const isAudio = cleanFilename.endsWith('.mp3') || cleanFilename.endsWith('.m4a') || cleanFilename.endsWith('.opus');
    const contentType = response.headers.get('content-type') || (isAudio ? 'audio/mpeg' : 'video/mp4');

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
      const nodeStream = Readable.fromWeb(response.body);
      nodeStream.pipe(res);
    } catch {
      const arrayBuf = await response.arrayBuffer();
      res.end(Buffer.from(arrayBuf));
    }
  } catch (error) {
    console.error('Error in /api/download-proxy:', error);
    if (!res.headersSent) {
      return res.status(500).send('Proxy download error: ' + error.message);
    }
  }
});

// Serve static assets from 'dist' directory created by `npm run build`
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  // Serve static files with caching for immutable assets
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Handle SPA routing: serve index.html for any other route
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // In case user hasn't run `npm run build` yet
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTikTools</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .box { max-width: 500px; padding: 2rem; background: #1e293b; border-radius: 12px; border: 1px solid #334155; text-align: center; }
            h1 { color: #f43f5e; margin-top: 0; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 6px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>YouTikTools</h1>
            <p>Server is running, but the frontend build directory <code>dist/</code> was not found.</p>
            <p>Please run <code>npm run build</code> to compile the frontend assets.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`YouTikTools server running on http://0.0.0.0:${PORT}`);
  console.log(`Ready for Hostinger Node.js deployment`);
});
