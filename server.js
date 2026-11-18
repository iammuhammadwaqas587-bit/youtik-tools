import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dns from 'dns';
import { registerMediaRoutes } from './serverMediaHandlers.mjs';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

// Prevent transient upstream rejections from crashing the live Node process
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Respect numeric ports and Unix domain socket paths passed by Hostinger / Passenger / LiteSpeed
const rawPort = process.env.PORT;
const listenTarget =
  rawPort && String(rawPort).trim() !== ''
    ? /^\d+$/.test(String(rawPort).trim())
      ? Number(String(rawPort).trim())
      : String(rawPort).trim()
    : 3000;

app.use(express.json({ limit: '1mb' }));

// Enable CORS for all API routes and headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register all unified YouTube, MP3, TikTok, Instagram, Facebook & proxy routes
registerMediaRoutes(app);

// 301 Canonical Redirect Middleware (www -> non-www, strip trailing slash)
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

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
    return res.redirect(301, `${protocol}://${cleanHost}${cleanPath}${queryString}`);
  }

  next();
});

// Google AdSense ads.txt fallback
app.get('/ads.txt', (req, res) => {
  const customPub = process.env.ADSENSE_PUB_ID || process.env.VITE_ADSENSE_PUB_ID || 'pub-1691427205816245';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`# Google AdSense Publisher Authorization File\ngoogle.com, ${customPub}, DIRECT, f08c47fec0942fa0\n`);
});

// Serve static assets from public and dist directories created by `npm run build`
const publicPath = path.join(__dirname, 'public');
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { maxAge: '1d' }));
}

if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>YouTikTools</title></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f8fafc;">
          <div style="max-width:480px;padding:2rem;background:#1e293b;border-radius:12px;text-align:center;">
            <h1 style="color:#f43f5e;margin-top:0;">YouTikTools</h1>
            <p>Server is running, but <code>dist/</code> was not found. Please run <code>npm run build</code>.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Listen directly on Hostinger-assigned port or Unix domain socket
const server = app.listen(listenTarget, () => {
  console.log(`YouTikTools server listening on ${listenTarget}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.requestTimeout = 120000;
