import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve built dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTikTools server running on port ${PORT}`);
  });
}

startServer();
