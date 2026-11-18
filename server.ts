import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { renderPageHtml, generateSitemapXml, generateRobotsTxt } from './src/seo/ssrRenderer';
import { registerMediaRoutes } from './serverMediaHandlers.mjs';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Global CORS headers for seamless preview, iframe, and API connectivity
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Register all unified multi-tier media extraction, conversion & proxy routes
registerMediaRoutes(app);

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
