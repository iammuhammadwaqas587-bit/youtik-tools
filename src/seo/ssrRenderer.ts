import { SEO_ROUTES, SeoRouteInfo } from './routesData';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export function getRouteMetadata(pathname: string): {
  isFound: boolean;
  meta: SeoRouteInfo;
  blogPost?: BlogPost;
} {
  // Direct match
  if (SEO_ROUTES[pathname]) {
    return { isFound: true, meta: SEO_ROUTES[pathname] };
  }

  // Blog post match
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').trim();
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (post) {
      const title = post.seoTitle.length < 60 ? post.seoTitle : post.seoTitle.slice(0, 56) + '...';
      const desc = post.metaDescription.length < 160 ? post.metaDescription : post.metaDescription.slice(0, 156) + '...';
      return {
        isFound: true,
        meta: {
          path: pathname,
          title,
          description: desc,
          h1: post.title,
          category: 'blog',
          changefreq: 'weekly',
          priority: '0.8',
          ogType: 'article',
          ogImage: post.coverImage,
        },
        blogPost: post,
      };
    }
  }

  // 404 Route
  return {
    isFound: false,
    meta: {
      path: pathname,
      title: '404 - Page Not Found | YouTikTools',
      description: 'The requested page could not be found on YouTikTools. Explore our free YouTube and TikTok video downloaders and media converters.',
      h1: '404 - Page Not Found',
      category: 'info',
      changefreq: 'monthly',
      priority: '0.1',
    },
  };
}

export function renderPageHtml(pathname: string, canonicalDomain: string): {
  html: string;
  statusCode: number;
} {
  const { isFound, meta, blogPost } = getRouteMetadata(pathname);
  const canonicalUrl = `${canonicalDomain}${pathname === '/' ? '' : pathname}`;
  const ogImageUrl = meta.ogImage || `${canonicalDomain}/pwa-512x512.png`;

  // Organization & WebApplication Schema
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'YouTikTools',
      url: canonicalDomain,
      logo: `${canonicalDomain}/pwa-512x512.png`,
      sameAs: [
        'https://twitter.com/youtiktools',
        'https://github.com/youtiktools'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@youtiktools.com'
      }
    }
  ];

  if (blogPost) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blogPost.title,
      description: meta.description,
      image: [blogPost.coverImage],
      datePublished: '2026-10-07T08:00:00+00:00',
      dateModified: '2026-10-20T12:00:00+00:00',
      author: {
        '@type': 'Person',
        name: blogPost.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'YouTikTools',
        logo: {
          '@type': 'ImageObject',
          url: `${canonicalDomain}/pwa-512x512.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    });
  } else if (isFound) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'YouTikTools - ' + meta.h1,
      url: canonicalUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      description: meta.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
  }

  // Pre-rendered body content
  let bodyContent = '';

  if (!isFound) {
    bodyContent = `
      <main class="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          HTTP 404 Status
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${meta.h1}</h1>
        <p class="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          The link you followed may be broken, or the page may have been removed. Use the directory below to find all free download and conversion tools.
        </p>
        <div class="pt-4 flex flex-wrap justify-center gap-3">
          <a href="/" class="px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition-colors">
            Go to Home Downloader
          </a>
          <a href="/tools" class="px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-colors">
            Browse All 20+ Tools
          </a>
        </div>
      </main>
    `;
  } else if (blogPost) {
    bodyContent = `
      <article class="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <header class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            ${blogPost.category}
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">${blogPost.title}</h1>
          <div class="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>By ${blogPost.author.name} (${blogPost.author.role})</span>
            <span>·</span>
            <span>${blogPost.publishDate}</span>
            <span>·</span>
            <span>${blogPost.readTime}</span>
          </div>
          <img src="${blogPost.coverImage}" alt="${blogPost.title}" class="w-full aspect-video rounded-2xl object-cover shadow-sm mt-4" />
        </header>
        <div class="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
          <p class="text-base font-medium text-slate-900 leading-relaxed">${blogPost.excerpt}</p>
          ${blogPost.content.map(c => `
            <section class="space-y-3">
              ${c.heading ? `<h2 class="text-xl font-bold text-slate-900 pt-2">${c.heading}</h2>` : ''}
              ${c.body.map(p => `<p class="leading-relaxed">${p}</p>`).join('')}
              ${c.tips && c.tips.length ? `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Expert Tips:</h3>
                  <ul class="list-disc list-inside text-xs text-slate-600 space-y-1">
                    ${c.tips.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </section>
          `).join('')}
        </div>
        <footer class="pt-8 border-t border-slate-200 flex justify-between items-center text-xs">
          <a href="/blog" class="font-bold text-red-600 hover:underline">← Back to All Guides</a>
          <a href="/tools" class="font-bold text-slate-800 hover:underline">Try Free Media Tools →</a>
        </footer>
      </article>
    `;
  } else {
    // Standard tool or legal page
    bodyContent = `
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header class="text-center max-w-3xl mx-auto space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            YouTikTools Universal Platform
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${meta.h1}</h1>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">${meta.description}</p>
        </header>

        <section class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">Online Service Overview & Features</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">100% Free & Unlimited</h3>
              <p>No subscriptions, no registration, and no artificial daily download limits.</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">Zero Watermark & Native HD</h3>
              <p>Direct original stream quality for iPhone, Android, Windows, and Mac.</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">Privacy & Security</h3>
              <p>Encrypted transfer, zero tracking cookies, and in-browser processing.</p>
            </div>
          </div>
        </section>

        <section class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <h2 class="text-lg font-bold text-slate-900">How to Use This Tool</h2>
          <ol class="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <li>Copy the link from YouTube, TikTok, Facebook, or Instagram (or upload your file).</li>
            <li>Paste the URL in the downloader box above.</li>
            <li>Select your target format (Full HD MP4, 320kbps MP3 audio, or image).</li>
            <li>Click Download to save the original file directly to your device without redirects.</li>
          </ol>
        </section>
      </main>
    `;
  }

  // Crawlable Navigation Bar
  const navHtml = `
    <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" class="flex items-center gap-2.5 font-extrabold text-lg text-slate-900">
          <span class="text-red-600">YouTik</span><span>Tools</span>
        </a>
        <nav class="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-700">
          <a href="/youtube-video-downloader" class="hover:text-red-600 transition-colors">YouTube HD</a>
          <a href="/tiktok-video-downloader" class="hover:text-cyan-700 transition-colors">TikTok No WM</a>
          <a href="/facebook-video-downloader" class="hover:text-blue-600 transition-colors">Facebook 1080p</a>
          <a href="/instagram-video-downloader" class="hover:text-pink-600 transition-colors">Instagram Reels</a>
          <a href="/youtube-to-mp3" class="hover:text-red-600 transition-colors">MP3 320kbps</a>
          <a href="/tools" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">All 20+ Tools</a>
        </nav>
      </div>
    </header>
  `;

  // Crawlable Footer
  const footerHtml = `
    <footer class="mt-20 border-t border-slate-200 bg-white text-xs text-slate-600">
      <div class="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Downloaders</h3>
          <ul class="space-y-1.5">
            <li><a href="/youtube-video-downloader" class="hover:text-red-600 hover:underline">YouTube 1080p & 4K</a></li>
            <li><a href="/tiktok-video-downloader" class="hover:text-cyan-700 hover:underline">TikTok No Watermark</a></li>
            <li><a href="/facebook-video-downloader" class="hover:text-blue-600 hover:underline">Facebook Video & Reels</a></li>
            <li><a href="/instagram-video-downloader" class="hover:text-pink-600 hover:underline">Instagram Reels & Posts</a></li>
            <li><a href="/youtube-to-mp3" class="hover:text-red-600 hover:underline">YouTube to MP3 (320kbps)</a></li>
            <li><a href="/video-captions-downloader" class="hover:text-red-600 hover:underline">Subtitles & Captions (SRT)</a></li>
            <li><a href="/batch-downloader" class="hover:text-slate-900 hover:underline">Batch Multi-Link Queue</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Video Utilities</h3>
          <ul class="space-y-1.5">
            <li><a href="/tools" class="font-semibold text-slate-900 hover:text-red-600 hover:underline">All Tools Directory →</a></li>
            <li><a href="/video-converter" class="hover:text-red-600 hover:underline">Video Converter (MP4/WebM)</a></li>
            <li><a href="/video-compressor" class="hover:text-red-600 hover:underline">Video Compressor</a></li>
            <li><a href="/video-trimmer" class="hover:text-red-600 hover:underline">Video Trimmer & Cutter</a></li>
            <li><a href="/video-merger" class="hover:text-red-600 hover:underline">Video Merger & Combiner</a></li>
            <li><a href="/video-to-gif" class="hover:text-red-600 hover:underline">Video to GIF Maker</a></li>
            <li><a href="/video-thumbnail" class="hover:text-red-600 hover:underline">Thumbnail Extractor</a></li>
            <li><a href="/video-metadata" class="hover:text-red-600 hover:underline">Video Metadata Inspector</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Calculators & Hub</h3>
          <ul class="space-y-1.5">
            <li><a href="/video-size-calculator" class="hover:text-red-600 hover:underline">Video Size Calculator</a></li>
            <li><a href="/video-resolution-checker" class="hover:text-red-600 hover:underline">Resolution Checker</a></li>
            <li><a href="/aspect-ratio-calculator" class="hover:text-red-600 hover:underline">Aspect Ratio Calculator</a></li>
            <li><a href="/bitrate-calculator" class="hover:text-red-600 hover:underline">Bitrate Calculator</a></li>
            <li><a href="/fps-calculator" class="hover:text-red-600 hover:underline">FPS Calculator</a></li>
            <li><a href="/blog" class="font-semibold text-slate-900 hover:text-red-600 hover:underline">Knowledge Hub & Blog →</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Trust & Legal</h3>
          <ul class="space-y-1.5">
            <li><a href="/about" class="hover:text-slate-900 hover:underline">About YouTikTools</a></li>
            <li><a href="/contact" class="hover:text-slate-900 hover:underline">Contact & Support</a></li>
            <li><a href="/privacy-policy" class="hover:text-slate-900 hover:underline">Privacy Policy</a></li>
            <li><a href="/terms-of-service" class="hover:text-slate-900 hover:underline">Terms of Service</a></li>
            <li><a href="/copyright-policy" class="hover:text-slate-900 hover:underline">Copyright & DMCA</a></li>
            <li><a href="/disclaimer" class="hover:text-slate-900 hover:underline">Legal Disclaimer</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-100 py-6 text-center text-[11px] text-slate-500 max-w-6xl mx-auto px-4">
        © 2026 YouTikTools. All rights reserved. Free, fast, private online video downloading and editing suite.
      </div>
    </footer>
  `;

  const fullHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

    <!-- Open Graph Social Metadata -->
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${meta.ogType || 'website'}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:site_name" content="YouTikTools" />

    <!-- Twitter Social Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <!-- Favicon & PWA Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#09090b" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Schema.org JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schemas, null, 2)}
    </script>
    <script>
      (function() {
        if (typeof window !== 'undefined' && window.WebSocket) {
          const NativeWebSocket = window.WebSocket;
          window.WebSocket = function(url, protocols) {
            const urlStr = String(url || '');
            const protoStr = String(protocols || '');
            if (urlStr.includes('vite-hmr') || protoStr.includes('vite-hmr')) {
              const listeners = {};
              const fakeWs = {
                readyState: 1,
                CONNECTING: 0,
                OPEN: 1,
                CLOSING: 2,
                CLOSED: 3,
                url: urlStr,
                protocol: 'vite-hmr',
                send: function() {},
                close: function() {},
                addEventListener: function(type, listener) {
                  if (!listeners[type]) listeners[type] = [];
                  listeners[type].push(listener);
                  if (type === 'open') {
                    setTimeout(() => { try { listener({ type: 'open', target: fakeWs }); } catch(e){} }, 0);
                  }
                },
                removeEventListener: function(type, listener) {
                  if (listeners[type]) listeners[type] = listeners[type].filter(l => l !== listener);
                },
                dispatchEvent: function(event) {
                  const type = event && event.type;
                  if (listeners[type]) listeners[type].forEach(l => { try { l(event); } catch(e){} });
                  return true;
                }
              };
              return fakeWs;
            }
            return new NativeWebSocket(url, protocols);
          };
          window.WebSocket.prototype = NativeWebSocket.prototype;
          window.WebSocket.CONNECTING = 0;
          window.WebSocket.OPEN = 1;
          window.WebSocket.CLOSING = 2;
          window.WebSocket.CLOSED = 3;
        }
        window.addEventListener('unhandledrejection', function(event) {
          if (event && event.reason && String(event.reason).includes('WebSocket closed without opened')) {
            event.preventDefault();
          }
        });
      })();
    </script>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased font-sans">
    <div id="root">
      ${navHtml}
      ${bodyContent}
      ${footerHtml}
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  return {
    html: fullHtml,
    statusCode: isFound ? 200 : 404,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function generateSitemapXml(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const urls: string[] = [];

  for (const [path, info] of Object.entries(SEO_ROUTES)) {
    const loc = `${cleanBase}${path === '/' ? '' : path}`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>${info.changefreq}</changefreq>
    <priority>${info.priority}</priority>
  </url>`);
  }

  for (const post of BLOG_POSTS) {
    const loc = `${cleanBase}/blog/${post.slug}`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: Google-Display-Ads-Bot
Allow: /

Sitemap: ${cleanBase}/sitemap.xml
`;
}
