import { BlogPost } from '../data/blogPosts';

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  schema?: Record<string, any>;
}

export function updatePageSeo(config: PageSeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  document.title = config.title;

  // 2. Meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', config.description);

  // 3. OpenGraph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  const fullUrl = window.location.origin + config.canonicalPath;
  if (ogUrl) {
    ogUrl.setAttribute('content', fullUrl);
  } else {
    const newOgUrl = document.createElement('meta');
    newOgUrl.setAttribute('property', 'og:url');
    newOgUrl.setAttribute('content', fullUrl);
    document.head.appendChild(newOgUrl);
  }

  // 4. Canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // 5. Schema.org JSON-LD injection
  if (config.schema) {
    let scriptTag = document.getElementById('dynamic-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(config.schema);
  }
}

export function getHomePageSchema(): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://youtik.tools/#app",
        "name": "YouTik Downloader",
        "url": "https://youtik.tools",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Windows, macOS, Android, iOS, Linux",
        "description": "Free high-speed online video downloader for YouTube and TikTok. Download 1080p and 4K MP4 videos, remove TikTok watermarks, and convert to 320kbps MP3 audio.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "YouTube 1080p and 4K MP4 download",
          "TikTok download without watermark",
          "YouTube to MP3 320 kbps converter",
          "Mobile and Laptop compatible H.264 playback",
          "Zero software installation required"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to download YouTube videos in 1080p Full HD?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paste your YouTube link into YouTik Downloader, select '1080p MP4' from the format menu, and click Download. YouTik automatically merges high-definition video and sound into a single playable MP4 file."
            }
          },
          {
            "@type": "Question",
            "name": "Can I download TikTok videos without any watermark?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! YouTik Downloader extracts the raw original stream directly from TikTok CDNs, completely stripping the bouncing logo watermark in crisp HD quality."
            }
          },
          {
            "@type": "Question",
            "name": "Will the downloaded MP4 files play on both mobile and laptop?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Every video is encoded using the standard H.264 video codec and AAC audio codec in an MP4 container, which is natively supported on Windows Media Player, Mac QuickTime, iPhone, and Android."
            }
          },
          {
            "@type": "Question",
            "name": "Is YouTik Downloader 100% free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, YouTik is completely free with no limits, no registration, and no hidden subscriptions."
            }
          }
        ]
      }
    ]
  };
}

export function getBlogPostSchema(post: BlogPost): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription,
    "image": post.coverImage,
    "datePublished": "2026-10-07T00:00:00Z",
    "dateModified": "2026-10-07T12:00:00Z",
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "YouTik Downloader",
      "logo": {
        "@type": "ImageObject",
        "url": "https://youtik.tools/favicon.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://youtik.tools/blog/${post.slug}`
    }
  };
}
