/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ActiveDownloadsModal } from './components/ActiveDownloadsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HelpModal } from './components/HelpModal';
import { MobileApkModal } from './components/MobileApkModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toast } from './components/Toast';
import { CombinedLogo } from './components/CombinedLogo';
import { CookieConsent } from './components/CookieConsent';

import { HomePage } from './pages/HomePage';
import { YouTubePage } from './pages/YouTubePage';
import { TikTokPage } from './pages/TikTokPage';
import { FacebookPage } from './pages/FacebookPage';
import { InstagramPage } from './pages/InstagramPage';
import { AudioPage } from './pages/AudioPage';
import { YouTubePlayerPage } from './pages/YouTubePlayerPage';
import { YOUTUBE_PLAYER_FAQ, YOUTUBE_PLAYER_SEO } from './data/youtubePlayerFaq';
import { CaptionsPage } from './pages/CaptionsPage';
import { TagsPage } from './pages/TagsPage';
import { ScriptPage } from './pages/ScriptPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { getBlogPostBySlug } from './data/blogPosts';
import { toIsoDateString, toUpdatedIsoDateString } from './utils/blogInterlinking';
import { BatchDownloader } from './components/BatchDownloader';
import { RelatedBlogGuides } from './components/RelatedBlogGuides';

import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage';
import { VideoConverterPage } from './pages/VideoConverterPage';
import { ImageConverterPage } from './pages/ImageConverterPage';
import {
  IMAGE_CONVERTER_FAQ,
  IMAGE_CONVERTER_ROUTES,
  type ImageConverterRoutePath,
} from './data/imageConverterSeo';
import { VideoCompressorPage } from './pages/VideoCompressorPage';
import { VideoTrimmerPage } from './pages/VideoTrimmerPage';
import { VideoMergerPage } from './pages/VideoMergerPage';
import { VideoToGifPage } from './pages/VideoToGifPage';
import { VideoThumbnailPage } from './pages/VideoThumbnailPage';
import { VideoMetadataPage } from './pages/VideoMetadataPage';
import { VideoFrameExtractorPage } from './pages/VideoFrameExtractorPage';
import { VideoSizeCalculatorPage } from './pages/VideoSizeCalculatorPage';
import { VideoResolutionCheckerPage } from './pages/VideoResolutionCheckerPage';
import { AspectRatioCalculatorPage } from './pages/AspectRatioCalculatorPage';
import { BitrateCalculatorPage } from './pages/BitrateCalculatorPage';
import { FpsCalculatorPage } from './pages/FpsCalculatorPage';
import { AgeCalculatorPage } from './pages/AgeCalculatorPage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { LandAreaConverterPage } from './pages/LandAreaConverterPage';
import { GoldCalculatorPage } from './pages/GoldCalculatorPage';
import { QrCodeGeneratorPage } from './pages/QrCodeGeneratorPage';
import { YouTubeThumbnailDownloaderPage } from './pages/YouTubeThumbnailDownloaderPage';
import { YouTubeTagGeneratorPage } from './pages/YouTubeTagGeneratorPage';
import { GpaCalculatorPage } from './pages/GpaCalculatorPage';
import { ZakatCalculatorPage } from './pages/ZakatCalculatorPage';
import { HijriDateConverterPage } from './pages/HijriDateConverterPage';
import { RamadanTimetablePage } from './pages/RamadanTimetablePage';
import { IslamicBabyNamesPage } from './pages/IslamicBabyNamesPage';
import { WirasatCalculatorPage } from './pages/WirasatCalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CopyrightPolicyPage } from './pages/CopyrightPolicyPage';
import { DisclaimerPage } from './pages/DisclaimerPage';

import { VideoInfo, HistoryItem, DownloadTask, FormattedDownloadOption } from './types';
import { extractYouTubeId, fetchVideoMetadata, SAMPLE_VIDEOS } from './utils/youtube';
import { isTikTokUrl } from './utils/tiktok';
import { isFacebookUrl } from './utils/facebook';
import { isInstagramUrl } from './utils/instagram';
import { 
  convertAndGetDownloadUrl, 
  triggerDirectMediaDownload
} from './utils/mediaDownloader';
import { Layers, ShieldCheck, Film, Sparkles, Music, Languages, Tag, FileText } from 'lucide-react';

const STORAGE_KEY = 'youtiktools_download_history_v1';
const LEGACY_STORAGE_KEY = 'youtik_download_history_v1';

export default function App() {
  // Current route pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return window.location.pathname;
    }
    return '/';
  });

  // App-wide Video State
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiktokTargetUrl, setTiktokTargetUrl] = useState<string>('');
  const [facebookTargetUrl, setFacebookTargetUrl] = useState<string>('');
  const [instagramTargetUrl, setInstagramTargetUrl] = useState<string>('');

  // Active download task modal
  const [downloadTask, setDownloadTask] = useState<DownloadTask | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Feedback
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileApkOpen, setIsMobileApkOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to storage', e);
    }
  }, [history]);

  // Synchronize browser popstate (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation (supports optional ?query strings)
  const navigate = useCallback((path: string) => {
    const cleanPathname = path.split('?')[0] || '/';
    const normalizedPath = cleanPathname === '/knowledge-hub' ? '/blog' : cleanPathname;
    const browserTarget = cleanPathname === '/knowledge-hub' ? '/blog' : path;
    setCurrentPath(normalizedPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', browserTarget);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Advanced Dynamic SEO Head & Schema.org JSON-LD Manager
  useEffect(() => {
    let title = 'YouTikTools - Free YouTube & TikTok Video Downloader (1080p, 4K, No Watermark)';
    let desc = 'YouTikTools: Free online tool to download YouTube videos in 1080p/4K MP4 with synced audio, save TikTok videos without watermark, convert to 320kbps MP3, and extract captions.';

    if (currentPath === '/youtube-video-downloader') {
      title = 'YouTube Video Downloader - Download 1080p & 4K MP4 with Audio | YouTikTools';
      desc = 'Best free YouTube video downloader in 1080p Full HD and 4K 60fps. Automatically muxes video and audio for guaranteed playback on Windows, Mac, iPhone, and Android.';
    } else if (currentPath === '/tiktok-video-downloader') {
      title = 'TikTok Video Downloader Without Watermark - Fast HD MP4 | YouTikTools';
      desc = 'Download TikTok videos without watermark or logos in high-definition MP4. Direct CDN extraction with clean audio and zero compression loss.';
    } else if (currentPath === '/facebook-video-downloader') {
      title = 'Facebook Video & Reels Downloader - 1080p Full HD MP4 | YouTikTools';
      desc = 'Download Facebook videos, Reels, and Watch clips in 1080p Full HD MP4 and 320kbps MP3 audio. Fast, free, and no account required.';
    } else if (currentPath === '/instagram-video-downloader') {
      title = 'Instagram Reels & Video Downloader - Save 1080p HD MP4 Free | YouTikTools';
      desc = 'Download Instagram Reels, video posts, and IGTV in 1080p Full HD MP4 without watermark and extract original MP3 audio. 100% free.';
    } else if (currentPath === '/youtube-to-mp3') {
      title = 'YouTube to MP3 Converter - Free 320 kbps Studio Audio Downloader | YouTikTools';
      desc = 'Convert YouTube videos to pure 320 kbps constant bitrate MP3 audio. Fast, lossless transcoding for music, podcasts, speeches, and sound effects.';
    } else if (currentPath === '/youtube-player') {
      title = YOUTUBE_PLAYER_SEO.title;
      desc = YOUTUBE_PLAYER_SEO.description;
    } else if (currentPath === '/video-captions-downloader') {
      title = 'YouTube Captions & Subtitles Downloader (SRT, VTT, TXT) | YouTikTools';
      desc = 'Download YouTube subtitles and closed captions in standard .SRT, .VTT, or clean .TXT formats. Supports English, Spanish, Arabic, Hindi, and 8+ languages.';
    } else if (currentPath === '/youtube-tags-extractor') {
      title = 'YouTube Tags & SEO Keyword Extractor Tool - 1-Click Copy | YouTikTools';
      desc = 'Discover and extract hidden YouTube video tags and high-ranking SEO keywords to optimize your own YouTube videos, Shorts, and creator channel.';
    } else if (currentPath === '/video-script-transcript-downloader') {
      title = 'YouTube Video Script & Transcript Downloader - Clean Text & Timestamps | YouTikTools';
      desc = 'Extract full timestamped scripts and clean text transcripts from any YouTube video. Perfect for creators, researchers, note-taking, and AI summaries.';
    } else if (currentPath === '/batch-downloader') {
      title = 'Batch YouTube Video Downloader - Multi-URL Bulk Download Queue | YouTikTools';
      desc = 'Download multiple YouTube videos and audio files at once. Paste links in bulk to process queues of playlists, lectures, and music tracks.';
    } else if (currentPath === '/blog') {
      title = 'YouTikTools Knowledge Hub - Guides, Tutorials & Video Streaming Tech Articles';
      desc = 'In-depth tech guides on YouTube 4K & 1080p stream muxing, TikTok watermark removal algorithms, audio bitrates (320kbps vs 128kbps), and codec compatibility.';
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '').trim();
      const post = getBlogPostBySlug(slug);
      if (post) {
        title = post.seoTitle.length < 60 ? post.seoTitle : `${post.seoTitle.slice(0, 56)}...`;
        desc = post.metaDescription.length < 160 ? post.metaDescription : `${post.metaDescription.slice(0, 156)}...`;
      } else {
        title = `YouTikTools Guide - ${slug.replace(/-/g, ' ')} | Knowledge Hub`;
        desc = `Read our complete tutorial and technical breakdown on ${slug.replace(/-/g, ' ')} with expert recommendations.`;
      }
    } else if (currentPath === '/tools') {
      title = 'Free Online Video Tools Directory - 18+ Converter, Compressor & Creator Utilities | YouTikTools';
      desc = 'Explore YouTikTools\'s complete suite of free video utilities: converter, compressor, trimmer, merger, GIF maker, frame extractor, bitrate calculator, and metadata inspector.';
    } else if (currentPath === '/video-converter') {
      title = 'Online Video Converter - Convert MP4, WebM, MOV, MKV, AVI Free | YouTikTools';
      desc = 'Convert video files between MP4, WebM, MOV, MKV, and AVI right in your browser. Fast, private, high quality transcoding with zero watermark.';
    } else if (currentPath in IMAGE_CONVERTER_ROUTES) {
      const imgCfg = IMAGE_CONVERTER_ROUTES[currentPath as ImageConverterRoutePath];
      title = imgCfg.title;
      desc = imgCfg.description;
    } else if (currentPath === '/video-compressor') {
      title = 'Video Compressor - Reduce Video File Size Without Quality Loss | YouTikTools';
      desc = 'Compress large video files for Discord, email, and web uploads. Choose Small File, Balanced, or High Quality presets with live size estimation.';
    } else if (currentPath === '/video-trimmer') {
      title = 'Online Video Trimmer - Cut & Crop Videos Fast & Free | YouTikTools';
      desc = 'Trim unwanted sections from your videos. Precise timestamp controls, instant preview player, and fast export for authorized personal clips.';
    } else if (currentPath === '/video-merger') {
      title = 'Online Video Merger - Combine Multiple Video Clips into One | YouTikTools';
      desc = 'Merge and stitch multiple video files together in seconds. Drag-and-drop reordering, seamless sequence preview, and unified MP4 export.';
    } else if (currentPath === '/video-to-gif') {
      title = 'Video to GIF Converter - Create High Quality Animated GIFs Free | YouTikTools';
      desc = 'Turn video clips into animated GIFs. Customize resolution width, FPS frame rate, start and end time with live size estimation.';
    } else if (currentPath === '/video-thumbnail') {
      title = 'Video Thumbnail Generator - Extract High-Res Frames (JPG, PNG, WebP) | YouTikTools';
      desc = 'Generate crisp video thumbnails from any video. Quick interval snapshots (Beginning, 25%, 50%, 75%, End) plus interactive timeline scrubber.';
    } else if (currentPath === '/video-metadata') {
      title = 'Video Metadata Inspector - Codec, Bitrate, Resolution & FPS Viewer | YouTikTools';
      desc = 'Inspect detailed technical video metadata: dimensions, FPS, aspect ratio, duration, approximate bitrate, MIME type, and audio track presence with 1-click copy.';
    } else if (currentPath === '/video-frame-extractor') {
      title = 'Video Frame Extractor - Save Exact Video Still Frames in HD | YouTikTools';
      desc = 'Extract precise individual frames from any video at exact millisecond timestamps. Download in JPG, PNG, or WebP formats.';
    } else if (currentPath === '/video-size-calculator') {
      title = 'Video File Size Calculator - Estimate Output Video Weight | YouTikTools';
      desc = 'Calculate estimated video file size before exporting. Enter duration, resolution, FPS, video bitrate, and audio bitrate for instant predictions.';
    } else if (currentPath === '/video-resolution-checker') {
      title = 'Video Resolution Checker - Detect 1080p, 4K, 720p & Aspect Ratio | YouTikTools';
      desc = 'Check the exact resolution, width, height, and display category (240p to 4K UHD) of your video files instantly in browser.';
    } else if (currentPath === '/aspect-ratio-calculator') {
      title = 'Video Aspect Ratio Calculator - 16:9, 9:16, 4:3 Dimension Resizer | YouTikTools';
      desc = 'Calculate exact aspect ratios from width and height, find missing dimensions, and view common social media standards for YouTube and TikTok.';
    } else if (currentPath === '/bitrate-calculator') {
      title = 'Video Bitrate Calculator - Calculate Video & Audio Bitrate | YouTikTools';
      desc = 'Determine the required bitrate for video and audio to fit strict file size limits on Discord, email, or client portals.';
    } else if (currentPath === '/fps-calculator') {
      title = 'Video FPS Calculator - Check Frames Per Second & Duration | YouTikTools';
      desc = 'Calculate frames per second (FPS), total frame count, and duration using the standard FPS = Frames / Duration formula.';
    } else if (currentPath === '/age-calculator') {
      title = 'Exact Age Calculator - Years, Hijri & Bikrami | YouTikTools';
      desc = 'Calculate your exact age in years, months, days, weeks, and hours, see next birthday countdown, and convert to Islamic (Hijri) & Desi/Bikrami dates.';
    } else if (currentPath === '/prayer-times') {
      title = 'Prayer Times & Qibla - Karachi Hanafi Schedule | YouTikTools';
      desc = 'Check daily Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha timings (Karachi Hanafi method), live next prayer countdown, Hijri date, and Qibla degrees.';
    } else if (currentPath === '/land-area-converter') {
      title = 'Marla to Square Feet, Kanal to Marla Converter Pakistan';
      desc = 'Convert Marla, Kanal, Acre, Square Feet, Sarsai, Bigha, and Hectare in browser. Includes 272.25 vs 225 sq ft Marla toggle, plot size helper & PKR price.';
    } else if (currentPath === '/gold-calculator') {
      title = 'Gold Rate Calculator - Tola, Gram & Jewellery | YouTikTools';
      desc = 'Convert Tola, Masha, Ratti, Gram, and Troy Ounce gold weights. Calculate 24K, 22K, 21K, and 18K gold prices and jewellery bills with wastage, making & GST.';
    } else if (currentPath === '/qr-code-generator') {
      title = 'QR Code Generator & Scanner - Free Custom PNG/SVG | YouTikTools';
      desc = 'Generate custom QR codes for URLs, Wi-Fi, WhatsApp, vCard, Email & SMS with logo upload, color contrast check, PNG/SVG download, and built-in QR scanner.';
    } else if (currentPath === '/youtube-thumbnail-downloader') {
      title = 'YouTube Thumbnail Downloader - HD & Maxres Free | YouTikTools';
      desc = 'Download high-resolution YouTube video thumbnails in Maxres (1280x720), SD, HQ, and MQ sizes free in your browser. Supports Shorts, watch & youtu.be links.';
    } else if (currentPath === '/youtube-tag-generator') {
      title = 'YouTube Tag Generator - AI SEO Tags & Hashtags | YouTikTools';
      desc = 'Generate 25-30 SEO-friendly YouTube video tags under 500 characters, 10 hashtags, and 5 title ideas in English, Urdu, Roman Urdu, or Hindi.';
    } else if (currentPath === '/gpa-calculator') {
      title = 'GPA & CGPA Calculator - 4.0, 5.0 & Marks Scale | YouTikTools';
      desc = 'Free browser GPA and CGPA calculator with 4.0, 5.0, custom & Pakistani marks-to-grade scales, percentage conversion, and target CGPA planner.';
    } else if (currentPath === '/zakat-calculator') {
      title = 'Zakat Calculator Pakistan - Silver & Gold Nisab | YouTikTools';
      desc = 'Calculate 2.5% Zakat in PKR using Silver (52.5 tola) or Gold (7.5 tola) Nisab, purity-adjusted gold jewellery, cash, debts, and Zakat al-Fitr (Fitrana).';
    } else if (currentPath === '/hijri-date-converter') {
      title = 'Hijri to Gregorian Date Converter - Islamic & Desi | YouTikTools';
      desc = 'Convert Hijri, Gregorian, and Desi (Bikrami) calendar dates two ways with Pakistan (-1) and Saudi (0) moon sighting adjustment plus Islamic events.';
    } else if (currentPath === '/ramadan-timetable') {
      title = 'Ramadan Timetable Pakistan - Sehri & Iftar Times | YouTikTools';
      desc = 'Check 30-day Sehri and Iftar Ramadan times for Karachi, Lahore, Islamabad, and global cities with Hanafi timings, countdown, .ics export & A4 PDF print.';
    } else if (currentPath === '/islamic-baby-names') {
      title = 'Islamic Baby Names Finder - 500+ Urdu & Arabic | YouTikTools';
      desc = 'Search 500+ authentic Muslim baby names for boys and girls with Urdu & Arabic script, English/Urdu meanings, Favorites shortlist, Name Combiner & AI finder.';
    } else if (currentPath === '/wirasat-calculator') {
      title = 'Wirasat Calculator - Hanafi Inheritance Shares | YouTikTools';
      desc = 'Calculate Sunni (Hanafi) Islamic inheritance shares and PKR estate amounts with funeral/debt/wasiyyat deductions, hijab blocking, Umariyyatayn, Awl & Radd.';
    } else if (currentPath === '/about') {
      title = 'About YouTikTools - Free, Secure Video & Audio Extraction Hub';
      desc = 'Learn about YouTikTools\'s mission: providing fast, clean, and accessible video tools with universal mobile and laptop compatibility.';
    } else if (currentPath === '/contact') {
      title = 'Contact Support & Feedback - YouTikTools';
      desc = 'Get in touch with the YouTikTools team for inquiries, bug reports, feature suggestions, or technical support.';
    } else if (currentPath === '/privacy-policy') {
      title = 'Privacy Policy - YouTikTools';
      desc = 'Read how YouTikTools respects your privacy. We do not store personal videos, track identities, or sell browsing data.';
    } else if (currentPath === '/terms-of-service') {
      title = 'Terms of Service - YouTikTools';
      desc = 'Review the terms and conditions for utilizing YouTikTools\'s conversion, extraction, and utility services.';
    } else if (currentPath === '/copyright-policy') {
      title = 'Copyright & DMCA Policy - YouTikTools';
      desc = 'Understand YouTikTools\'s intellectual property principles, responsible personal use standards, and DMCA takedown contact process.';
    } else if (currentPath === '/disclaimer') {
      title = 'Legal Disclaimer - YouTikTools';
      desc = 'Official disclaimer regarding independence from third-party platforms including YouTube, TikTok, Google, and ByteDance.';
    }

    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // Update OpenGraph and Twitter tags
    const blogPostMatch = currentPath.startsWith('/blog/')
      ? getBlogPostBySlug(currentPath.replace('/blog/', '').trim())
      : undefined;
    const rawCoverImage = blogPostMatch?.coverImage;
    const ogImageUrl = rawCoverImage
      ? rawCoverImage.startsWith('http')
        ? rawCoverImage
        : `${window.location.origin}${rawCoverImage}`
      : `${window.location.origin}/pwa-512x512.png`;
    const ogTypeValue = blogPostMatch ? 'article' : 'website';

    const setMetaTag = (attr: 'name' | 'property', key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:type', ogTypeValue);
    setMetaTag('property', 'og:image', ogImageUrl);
    setMetaTag('property', 'og:url', window.location.origin + currentPath);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', ogImageUrl);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + currentPath);

    // Inject or update Schema.org JSON-LD
    let scriptTag = document.getElementById('youtiktools-seo-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'youtiktools-seo-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const isYouTubePlayerRoute = currentPath === '/youtube-player';
    const imageConverterRouteConfig =
      currentPath in IMAGE_CONVERTER_ROUTES
        ? IMAGE_CONVERTER_ROUTES[currentPath as ImageConverterRoutePath]
        : null;

    const structuredData = blogPostMatch
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["Article", "BlogPosting"],
              "@id": `${window.location.origin}${currentPath}#article`,
              "headline": blogPostMatch.title,
              "description": desc,
              "articleSection": blogPostMatch.category,
              ...(blogPostMatch.keywords?.length
                ? { "keywords": blogPostMatch.keywords.join(', ') }
                : {}),
              "image": [ogImageUrl],
              "datePublished": `${toIsoDateString(blogPostMatch)}T08:00:00+00:00`,
              "dateModified": `${toUpdatedIsoDateString(blogPostMatch)}T12:00:00+00:00`,
              "author": {
                "@type": "Organization",
                "name": blogPostMatch.author.name,
                "url": window.location.origin
              },
              "publisher": {
                "@type": "Organization",
                "name": "YouTikTools",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/pwa-512x512.png`
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${window.location.origin}${currentPath}`
              }
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${window.location.origin}${currentPath}#breadcrumb`,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": window.location.origin
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": `${window.location.origin}/blog`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": blogPostMatch.category,
                  "item": `${window.location.origin}/blog?category=${encodeURIComponent(blogPostMatch.category)}`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": blogPostMatch.title,
                  "item": `${window.location.origin}${currentPath}`
                }
              ]
            },
            ...(blogPostMatch.faqs && blogPostMatch.faqs.length > 0
              ? [{
                  "@type": "FAQPage",
                  "@id": `${window.location.origin}${currentPath}#faq`,
                  "mainEntity": blogPostMatch.faqs.map((item) => ({
                    "@type": "Question",
                    "name": item.question,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": item.answer
                    }
                  }))
                }]
              : [])
          ]
        }
      : imageConverterRouteConfig
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "@id": `${window.location.origin}${imageConverterRouteConfig.path}#webapp`,
              "name": imageConverterRouteConfig.h1,
              "url": `${window.location.origin}${imageConverterRouteConfig.path}`,
              "description": imageConverterRouteConfig.description,
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript and HTML5 Canvas. Runs in any modern web browser.",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Private local conversion in browser using Canvas API and Web Workers",
                "Batch conversion up to 50 images at once with sequential progress",
                "Supports JPG, PNG, WebP, AVIF, BMP, ICO, SVG, GIF, and HEIC/HEIF",
                "Quality slider, transparent background color fill, and aspect-locked resize",
                "Download all converted images as a single ZIP archive"
              ]
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${window.location.origin}${imageConverterRouteConfig.path}#breadcrumb`,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": window.location.origin
                },
                ...(imageConverterRouteConfig.path !== '/image-converter'
                  ? [
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Image Format Converter",
                        "item": `${window.location.origin}/image-converter`
                      },
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": imageConverterRouteConfig.h1,
                        "item": `${window.location.origin}${imageConverterRouteConfig.path}`
                      }
                    ]
                  : [
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": imageConverterRouteConfig.h1,
                        "item": `${window.location.origin}/image-converter`
                      }
                    ])
              ]
            },
            {
              "@type": "FAQPage",
              "@id": `${window.location.origin}${imageConverterRouteConfig.path}#faq`,
              "mainEntity": IMAGE_CONVERTER_FAQ.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            }
          ]
        }
      : isYouTubePlayerRoute
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "@id": `${window.location.origin}/youtube-player#webapp`,
              "name": "YouTube Player",
              "url": `${window.location.origin}/youtube-player`,
              "description": YOUTUBE_PLAYER_SEO.description,
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Runs in any modern web browser.",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Privacy-enhanced youtube-nocookie.com iframe embed",
                "Full-screen playback with Escape key support",
                "All native YouTube controls preserved",
                "Supports watch, youtu.be, Shorts, live streams, and t=/start= timestamps",
                "Browser-local Recently watched history (last 5 links)"
              ]
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${window.location.origin}/youtube-player#breadcrumb`,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": window.location.origin
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "YouTube Player",
                  "item": `${window.location.origin}/youtube-player`
                }
              ]
            },
            {
              "@type": "FAQPage",
              "@id": `${window.location.origin}/youtube-player#faq`,
              "mainEntity": YOUTUBE_PLAYER_FAQ.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            }
          ]
        }
      : {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "@id": `${window.location.origin}/#webapp`,
              "name": "YouTikTools",
              "url": window.location.origin,
              "description": desc,
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All (Windows, macOS, Linux, iOS, Android)",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "YouTube 1080p Full HD & 4K 60fps Video Download with Synchronized Sound",
                "TikTok Video Download Without Watermark in HD MP4",
                "YouTube to 320 kbps Studio Quality MP3 Audio Conversion",
                "Closed Captions & Subtitles Extraction in SRT, VTT, and TXT",
                "YouTube Video Tags and High-Ranking SEO Keywords Scraper",
                "Full Video Script and Timestamped Transcript Downloader",
                "Guaranteed Native Playback on Mobile Phones and Laptop Players (H.264 / AAC)"
              ]
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${window.location.origin}${currentPath}#breadcrumb`,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": window.location.origin
                },
                ...(currentPath !== '/' ? [{
                  "@type": "ListItem",
                  "position": 2,
                  "name": title.split(' - ')[0].split(' | ')[0],
                  "item": `${window.location.origin}${currentPath}`
                }] : [])
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I download YouTube videos in 1080p Full HD or 4K with audio?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Paste your YouTube link into YouTikTools, select 1080p MP4 or 4K from the format dropdown, and click Download. YouTikTools automatically merges the high-definition video and audio streams so the resulting MP4 plays perfectly with synchronized sound on laptops and phones."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I download TikTok videos without any watermark?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Copy the TikTok video link, open YouTikTools's TikTok Downloader (/tiktok-video-downloader), and click 'Without Watermark (HD MP4)'. The raw stream is extracted directly from TikTok servers without logo watermarks."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Will the downloaded videos play on Windows Media Player and iPhone?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, 100%. All files are encoded in standard H.264 (AVC) and AAC inside an MP4 container, which is universally supported across Windows, Mac QuickTime, iOS Safari & Camera Roll, and Android."
                  }
                }
              ]
            }
          ]
        };

    scriptTag.textContent = JSON.stringify(structuredData);
  }, [currentPath]);

  // Handle URL fetch
  const handleFetchUrl = async (urlOrId: string) => {
    const trimmed = urlOrId.trim();

    // Check if user entered a TikTok URL in the main bar
    if (isTikTokUrl(trimmed)) {
      setTiktokTargetUrl(trimmed);
      navigate('/tiktok-video-downloader');
      setToastMessage('Switching to TikTok Downloader...');
      return;
    }

    // Check if user entered a Facebook URL
    if (isFacebookUrl(trimmed)) {
      setFacebookTargetUrl(trimmed);
      navigate('/facebook-video-downloader');
      setToastMessage('Switching to Facebook Downloader...');
      return;
    }

    // Check if user entered an Instagram URL
    if (isInstagramUrl(trimmed)) {
      setInstagramTargetUrl(trimmed);
      navigate('/instagram-video-downloader');
      setToastMessage('Switching to Instagram Downloader...');
      return;
    }

    // Try YouTube Video ID
    let videoId = extractYouTubeId(trimmed);

    // If not a direct URL, check if query matches any sample videos
    if (!videoId) {
      const matched = SAMPLE_VIDEOS.find(s => 
        s.title.toLowerCase().includes(trimmed.toLowerCase()) || 
        s.channel.toLowerCase().includes(trimmed.toLowerCase()) ||
        s.tag.toLowerCase().includes(trimmed.toLowerCase())
      );
      if (matched) {
        videoId = matched.id;
      }
    }

    if (!videoId) {
      setError('Please provide a valid video link from YouTube, TikTok, Facebook, or Instagram');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const info = await fetchVideoMetadata(videoId);
      setCurrentVideo(info);
      setToastMessage(`Loaded "${info.title.slice(0, 35)}..."`);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch video details. Please verify your link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform REAL media download using backend/upstream conversion
  const handleStartDownload = async (option: FormattedDownloadOption) => {
    if (!currentVideo) return;

    const taskId = 'task_' + Date.now();
    const newTask: DownloadTask = {
      id: taskId,
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      thumbnail: currentVideo.highThumbnail || currentVideo.thumbnail,
      formatName: option.label,
      extension: option.extension,
      resolution: option.quality,
      size: option.sizeFormatted,
      progress: 5,
      speed: 'Connecting...',
      status: 'starting'
    };

    setDownloadTask(newTask);

    try {
      const result = await convertAndGetDownloadUrl(
        currentVideo.url,
        option.formatParam,
        (percent, statusText) => {
          setDownloadTask(prev => prev ? {
            ...prev,
            progress: percent,
            status: percent >= 100 ? 'completed' : percent > 40 ? 'converting' : 'downloading',
            speed: statusText
          } : null);
        },
        currentVideo.title
      );

      const cleanTitle = currentVideo.title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70);
      const filename = `${cleanTitle}.${option.extension}`;

      setDownloadTask(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'completed',
        speed: '100% Complete',
        downloadUrl: result.downloadUrl,
        directProxyUrl: result.proxyUrl
      } : null);

      // Trigger REAL browser download of the actual media file
      await triggerDirectMediaDownload(result.proxyUrl || result.downloadUrl, filename);

      // Save to download history
      const newHistoryItem: HistoryItem = {
        id: 'hist_' + Date.now(),
        videoId: currentVideo.id,
        videoTitle: currentVideo.title,
        thumbnail: currentVideo.thumbnail,
        format: `${option.container} (${option.quality})`,
        resolution: option.quality,
        size: option.sizeFormatted,
        downloadedAt: Date.now(),
        extension: option.extension,
        url: currentVideo.url,
        downloadUrl: result.downloadUrl,
        source: 'youtube'
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 29)]);
      setToastMessage(`Saved ${option.container} file to your device!`);
    } catch (err: any) {
      console.error('Download error:', err);
      const friendlyMessage = err.message?.includes('Failed to fetch') || err.message?.includes('Unable to connect')
        ? 'Stream server is temporarily busy. Please try again or pick another resolution (such as 720p MP4).'
        : (err.message || 'Could not process media stream right now. Please try another quality or try again.');

      setDownloadTask(prev => prev ? {
        ...prev,
        status: 'error',
        errorMessage: friendlyMessage
      } : null);
      setToastMessage('Download failed: ' + friendlyMessage);
    }
  };

  const cancelActiveTask = () => {
    setDownloadTask(null);
    setToastMessage('Download cancelled');
  };

  const handleStartAudioFromRipView = (video: VideoInfo, bitrate: string, format: string) => {
    setCurrentVideo(video);
    const param = format === 'm4a' ? 'm4a' : format === 'opus' ? 'opus' : format === 'wav' ? 'wav' : format === 'flac' ? 'flac' : 'mp3';
    handleStartDownload({
      id: 'audio-custom',
      section: 'mp3',
      label: `${bitrate} ${format.toUpperCase()}`,
      quality: bitrate,
      container: format.toUpperCase() as any,
      extension: format as any,
      sizeFormatted: '4.5 MB',
      formatParam: param
    });
  };

  const handleBatchDownloadAll = (items: VideoInfo[], mode: 'video' | 'audio') => {
    if (items.length === 0) return;
    const first = items[0];
    setCurrentVideo(first);
    if (mode === 'video') {
      handleStartDownload({
        id: '1080p-mp4',
        section: 'hq_video',
        label: '1080p MP4',
        quality: '1080p',
        container: 'MP4',
        extension: 'mp4',
        sizeFormatted: '27.49 MB',
        formatParam: '1080'
      });
    } else {
      handleStartDownload({
        id: 'mp3-320',
        section: 'mp3',
        label: 'MP3 · 320 kbps',
        quality: '320 kbps',
        container: 'MP3',
        extension: 'mp3',
        sizeFormatted: '7.02 MB',
        formatParam: 'mp3'
      });
    }
    setToastMessage(`Starting batch download for ${items.length} items...`);
  };

  const handleRecordTikTokHistory = (item: {
    title: string;
    thumbnail: string;
    format: string;
    url: string;
    downloadUrl: string;
    extension: string;
  }) => {
    const newHistoryItem: HistoryItem = {
      id: 'hist_' + Date.now(),
      videoId: 'tiktok_' + Date.now(),
      videoTitle: item.title,
      thumbnail: item.thumbnail,
      format: item.format,
      size: 'Direct Stream',
      downloadedAt: Date.now(),
      extension: item.extension,
      url: item.url,
      downloadUrl: item.downloadUrl,
      source: 'tiktok'
    };
    setHistory(prev => [newHistoryItem, ...prev.slice(0, 29)]);
  };

  const handleRecordSocialHistory = (
    item: {
      title: string;
      thumbnail: string;
      format: string;
      url: string;
      downloadUrl: string;
      extension: string;
    },
    source: 'facebook' | 'instagram'
  ) => {
    const newHistoryItem: HistoryItem = {
      id: 'hist_' + Date.now(),
      videoId: `${source}_` + Date.now(),
      videoTitle: item.title,
      thumbnail: item.thumbnail,
      format: item.format,
      size: 'Direct Stream',
      downloadedAt: Date.now(),
      extension: item.extension,
      url: item.url,
      downloadUrl: item.downloadUrl,
      source
    };
    setHistory(prev => [newHistoryItem, ...prev.slice(0, 29)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setToastMessage('History cleared');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleRedownloadHistory = (item: HistoryItem) => {
    if (item.downloadUrl) {
      triggerDirectMediaDownload(item.downloadUrl, `${item.videoTitle}.${item.extension}`);
      setToastMessage(`Re-downloading ${item.format}...`);
    } else {
      handleFetchUrl(item.url);
    }
  };

  // Render Page Content based on currentPath
  const renderPage = () => {
    // 1. Home Page (Default)
    if (currentPath === '/') {
      return (
        <HomePage
          onFetchUrl={handleFetchUrl}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError(null)}
          currentVideo={currentVideo}
          onStartDownload={handleStartDownload}
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 2. YouTube Video Downloader (Dedicated 1080p / 4K page)
    if (currentPath === '/youtube-video-downloader') {
      return (
        <YouTubePage
          onFetchUrl={handleFetchUrl}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError(null)}
          currentVideo={currentVideo}
          onStartDownload={handleStartDownload}
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 3. TikTok Video Downloader (Without Watermark)
    if (currentPath === '/tiktok-video-downloader') {
      return (
        <TikTokPage
          onShowToast={setToastMessage}
          onRecordHistory={handleRecordTikTokHistory}
          onNavigate={navigate}
          initialUrl={tiktokTargetUrl}
        />
      );
    }

    // 4. Facebook Video & Reels Downloader
    if (currentPath === '/facebook-video-downloader') {
      return (
        <FacebookPage
          onShowToast={setToastMessage}
          onRecordHistory={(item) => handleRecordSocialHistory(item, 'facebook')}
          onNavigate={navigate}
          initialUrl={facebookTargetUrl}
        />
      );
    }

    // 5. Instagram Video & Reels Downloader
    if (currentPath === '/instagram-video-downloader') {
      return (
        <InstagramPage
          onShowToast={setToastMessage}
          onRecordHistory={(item) => handleRecordSocialHistory(item, 'instagram')}
          onNavigate={navigate}
          initialUrl={instagramTargetUrl}
        />
      );
    }

    // 6. YouTube to MP3 Audio Ripper
    if (currentPath === '/youtube-to-mp3') {
      return (
        <AudioPage
          onStartDownloadAudio={handleStartAudioFromRipView}
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 6b. Distraction-Free YouTube Player
    if (currentPath === '/youtube-player') {
      return (
        <YouTubePlayerPage
          onNavigate={navigate}
        />
      );
    }

    // 5. Captions & Subtitles Downloader (SRT/VTT)
    if (currentPath === '/video-captions-downloader') {
      return (
        <CaptionsPage
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 6. YouTube Tags Extractor
    if (currentPath === '/youtube-tags-extractor') {
      return (
        <TagsPage
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 7. Video Script & Transcript Downloader
    if (currentPath === '/video-script-transcript-downloader') {
      return (
        <ScriptPage
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 8. Batch Downloader
    if (currentPath === '/batch-downloader') {
      return (
        <div className="space-y-8 max-w-4xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-3 border border-slate-200">
              <Layers className="h-3.5 w-3.5 text-slate-700" />
              <span>Multi-Link Bulk Processor</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Batch YouTube Video & Audio Downloader
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Paste multiple YouTube video URLs (one per line) to parse details and queue all downloads in one click.
            </p>
          </div>

          <BatchDownloader
            onStartBatchDownload={handleBatchDownloadAll}
            onShowToast={setToastMessage}
          />

          <RelatedBlogGuides
            toolPath="/batch-downloader"
            onNavigate={navigate}
            maxWidthClass=""
          />
        </div>
      );
    }

    // 9. Blog Post Detail Page
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return (
        <BlogPostPage
          slug={slug}
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 10. Blog Listing Hub (/blog and /knowledge-hub)
    if (currentPath === '/blog' || currentPath === '/knowledge-hub') {
      return (
        <BlogPage
          onNavigate={navigate}
        />
      );
    }

    // 11. Tools Directory
    if (currentPath === '/tools') {
      return (
        <ToolsDirectoryPage
          onNavigate={navigate}
        />
      );
    }

    // 12. Video Converter
    if (currentPath === '/video-converter') {
      return (
        <VideoConverterPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 12b. Image Format Converter & Landing Format Routes
    if (currentPath in IMAGE_CONVERTER_ROUTES) {
      return (
        <ImageConverterPage
          routePath={currentPath as ImageConverterRoutePath}
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 13. Video Compressor
    if (currentPath === '/video-compressor') {
      return (
        <VideoCompressorPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 14. Video Trimmer
    if (currentPath === '/video-trimmer') {
      return (
        <VideoTrimmerPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 15. Video Merger
    if (currentPath === '/video-merger') {
      return (
        <VideoMergerPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 16. Video to GIF
    if (currentPath === '/video-to-gif') {
      return (
        <VideoToGifPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 17. Video Thumbnail Generator
    if (currentPath === '/video-thumbnail') {
      return (
        <VideoThumbnailPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 18. Video Metadata Inspector
    if (currentPath === '/video-metadata') {
      return (
        <VideoMetadataPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 19. Video Frame Extractor
    if (currentPath === '/video-frame-extractor') {
      return (
        <VideoFrameExtractorPage
          onNavigate={navigate}
          onShowToast={setToastMessage}
        />
      );
    }

    // 20. Video Size Calculator
    if (currentPath === '/video-size-calculator') {
      return (
        <VideoSizeCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 21. Video Resolution Checker
    if (currentPath === '/video-resolution-checker') {
      return (
        <VideoResolutionCheckerPage
          onNavigate={navigate}
        />
      );
    }

    // 22. Aspect Ratio Calculator
    if (currentPath === '/aspect-ratio-calculator') {
      return (
        <AspectRatioCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 23. Bitrate Calculator
    if (currentPath === '/bitrate-calculator') {
      return (
        <BitrateCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 24. FPS Calculator
    if (currentPath === '/fps-calculator') {
      return (
        <FpsCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 25. Age Calculator
    if (currentPath === '/age-calculator') {
      return (
        <AgeCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 26. Prayer Times & Qibla
    if (currentPath === '/prayer-times') {
      return (
        <PrayerTimesPage
          onNavigate={navigate}
        />
      );
    }

    // 27. Land Area Converter
    if (currentPath === '/land-area-converter') {
      return (
        <LandAreaConverterPage
          onNavigate={navigate}
        />
      );
    }

    // 28. Gold Rate Calculator
    if (currentPath === '/gold-calculator') {
      return (
        <GoldCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 29. QR Code Generator & Scanner
    if (currentPath === '/qr-code-generator') {
      return (
        <QrCodeGeneratorPage
          onNavigate={navigate}
        />
      );
    }

    // 30. YouTube Thumbnail Downloader
    if (currentPath === '/youtube-thumbnail-downloader') {
      return (
        <YouTubeThumbnailDownloaderPage
          onNavigate={navigate}
        />
      );
    }

    // 31. YouTube Tag Generator
    if (currentPath === '/youtube-tag-generator') {
      return (
        <YouTubeTagGeneratorPage
          onNavigate={navigate}
        />
      );
    }

    // 32. GPA & CGPA Calculator
    if (currentPath === '/gpa-calculator') {
      return (
        <GpaCalculatorPage
          onNavigate={navigate}
        />
      );
    }

    // 33. Zakat Calculator
    if (currentPath === '/zakat-calculator') {
      return <ZakatCalculatorPage onNavigate={navigate} />;
    }

    // 34. Hijri Date Converter
    if (currentPath === '/hijri-date-converter') {
      return <HijriDateConverterPage onNavigate={navigate} />;
    }

    // 35. Ramadan Timetable
    if (currentPath === '/ramadan-timetable') {
      return <RamadanTimetablePage onNavigate={navigate} />;
    }

    // 36. Islamic Baby Names Finder
    if (currentPath === '/islamic-baby-names') {
      return <IslamicBabyNamesPage onNavigate={navigate} />;
    }

    // 37. Wirasat Calculator
    if (currentPath === '/wirasat-calculator') {
      return <WirasatCalculatorPage onNavigate={navigate} />;
    }

    // Trust & Compliance Pages
    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onNavigate={navigate} onShowToast={setToastMessage} />;
    }

    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }

    if (currentPath === '/terms-of-service') {
      return <TermsOfServicePage onNavigate={navigate} />;
    }

    if (currentPath === '/copyright-policy') {
      return <CopyrightPolicyPage onNavigate={navigate} />;
    }

    if (currentPath === '/disclaimer') {
      return <DisclaimerPage onNavigate={navigate} />;
    }

    // Fallback: render Home Page
    return (
      <HomePage
        onFetchUrl={handleFetchUrl}
        isLoading={isLoading}
        error={error}
        onClearError={() => setError(null)}
        currentVideo={currentVideo}
        onStartDownload={handleStartDownload}
        onShowToast={setToastMessage}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500/20 selection:text-red-600">
      {/* Top Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        historyCount={history.length}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenMobileApk={() => setIsMobileApkOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderPage()}
      </main>

      {/* Mobile APK & PWA Installation Modal */}
      <MobileApkModal
        isOpen={isMobileApkOpen}
        onClose={() => setIsMobileApkOpen(false)}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Progress & Real Media Download Dialog */}
      <ActiveDownloadsModal
        task={downloadTask}
        onClose={() => setDownloadTask(null)}
        onCancel={cancelActiveTask}
      />

      {/* History Drawer Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Your Download History</h3>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 mt-4">
              <HistoryDrawer
                items={history}
                onClearHistory={handleClearHistory}
                onDeleteItem={handleDeleteHistoryItem}
                onRedownload={handleRedownloadHistory}
                onShowToast={setToastMessage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Light Theme Footer with high-value SEO Navigation Links */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12 text-xs text-slate-500 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Col 1: Brand & Identity */}
            <div className="space-y-3 sm:col-span-2 md:col-span-1">
              <div 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 cursor-pointer select-none group inline-flex"
              >
                <CombinedLogo size={32} />
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  YouTik<span className="text-red-600 font-bold">Tools</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                All-in-one free media hub. Save 1080p/4K YouTube videos with audio, remove TikTok watermarks, convert to MP3, and edit videos directly in your browser.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Free · No Malware · Privacy-First</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Independent tool. Not affiliated with Google, YouTube, or ByteDance.
              </p>
            </div>

            {/* Col 2: Downloader Tools */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Downloaders</h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="/youtube-video-downloader" onClick={(e) => { e.preventDefault(); navigate('/youtube-video-downloader'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube 1080p & 4K
                  </a>
                </li>
                <li>
                  <a href="/tiktok-video-downloader" onClick={(e) => { e.preventDefault(); navigate('/tiktok-video-downloader'); }} className="text-slate-600 hover:text-cyan-700 hover:underline cursor-pointer block">
                    TikTok No Watermark
                  </a>
                </li>
                <li>
                  <a href="/facebook-video-downloader" onClick={(e) => { e.preventDefault(); navigate('/facebook-video-downloader'); }} className="text-slate-600 hover:text-blue-600 hover:underline cursor-pointer block">
                    Facebook Video & Reels (1080p)
                  </a>
                </li>
                <li>
                  <a href="/instagram-video-downloader" onClick={(e) => { e.preventDefault(); navigate('/instagram-video-downloader'); }} className="text-slate-600 hover:text-pink-600 hover:underline cursor-pointer block">
                    Instagram Reels & Video (HD)
                  </a>
                </li>
                <li>
                  <a href="/youtube-to-mp3" onClick={(e) => { e.preventDefault(); navigate('/youtube-to-mp3'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube to MP3 (320 kbps)
                  </a>
                </li>
                <li>
                  <a href="/youtube-player" onClick={(e) => { e.preventDefault(); navigate('/youtube-player'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube Player (Clean View)
                  </a>
                </li>
                <li>
                  <a href="/video-captions-downloader" onClick={(e) => { e.preventDefault(); navigate('/video-captions-downloader'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Subtitles & Captions (SRT)
                  </a>
                </li>
                <li>
                  <a href="/youtube-tags-extractor" onClick={(e) => { e.preventDefault(); navigate('/youtube-tags-extractor'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube Tags & Keywords
                  </a>
                </li>
                <li>
                  <a href="/video-script-transcript-downloader" onClick={(e) => { e.preventDefault(); navigate('/video-script-transcript-downloader'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Full Video Script Downloader
                  </a>
                </li>
                <li>
                  <a href="/batch-downloader" onClick={(e) => { e.preventDefault(); navigate('/batch-downloader'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Batch Multi-URL Queue
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Video Utilities */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Video Tools</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-mono text-[9px] font-bold">NEW</span>
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="/tools" onClick={(e) => { e.preventDefault(); navigate('/tools'); }} className="text-slate-900 font-semibold hover:text-red-600 hover:underline cursor-pointer block">
                    All 18+ Tools Directory →
                  </a>
                </li>
                <li>
                  <a href="/video-converter" onClick={(e) => { e.preventDefault(); navigate('/video-converter'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Converter (MP4/WebM)
                  </a>
                </li>
                <li>
                  <a href="/image-converter" onClick={(e) => { e.preventDefault(); navigate('/image-converter'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Image Format Converter
                  </a>
                </li>
                <li>
                  <a href="/video-compressor" onClick={(e) => { e.preventDefault(); navigate('/video-compressor'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Compressor
                  </a>
                </li>
                <li>
                  <a href="/video-trimmer" onClick={(e) => { e.preventDefault(); navigate('/video-trimmer'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Trimmer & Cutter
                  </a>
                </li>
                <li>
                  <a href="/video-merger" onClick={(e) => { e.preventDefault(); navigate('/video-merger'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Merger & Joiner
                  </a>
                </li>
                <li>
                  <a href="/video-to-gif" onClick={(e) => { e.preventDefault(); navigate('/video-to-gif'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video to GIF Maker
                  </a>
                </li>
                <li>
                  <a href="/video-thumbnail" onClick={(e) => { e.preventDefault(); navigate('/video-thumbnail'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Thumbnail Extractor
                  </a>
                </li>
                <li>
                  <a href="/video-metadata" onClick={(e) => { e.preventDefault(); navigate('/video-metadata'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Metadata Inspector
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Calculators & Blog */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Calculators & Hub</h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="/video-size-calculator" onClick={(e) => { e.preventDefault(); navigate('/video-size-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Video Size Calculator
                  </a>
                </li>
                <li>
                  <a href="/video-resolution-checker" onClick={(e) => { e.preventDefault(); navigate('/video-resolution-checker'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Resolution Checker
                  </a>
                </li>
                <li>
                  <a href="/aspect-ratio-calculator" onClick={(e) => { e.preventDefault(); navigate('/aspect-ratio-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Aspect Ratio Calculator
                  </a>
                </li>
                <li>
                  <a href="/bitrate-calculator" onClick={(e) => { e.preventDefault(); navigate('/bitrate-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Bitrate Calculator
                  </a>
                </li>
                <li>
                  <a href="/fps-calculator" onClick={(e) => { e.preventDefault(); navigate('/fps-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    FPS Calculator
                  </a>
                </li>
                <li>
                  <a href="/age-calculator" onClick={(e) => { e.preventDefault(); navigate('/age-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    Age Calculator (Hijri & Desi)
                  </a>
                </li>
                <li>
                  <a href="/prayer-times" onClick={(e) => { e.preventDefault(); navigate('/prayer-times'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Prayer Times &amp; Qibla
                  </a>
                </li>
                <li>
                  <a href="/land-area-converter" onClick={(e) => { e.preventDefault(); navigate('/land-area-converter'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Land Area Converter
                  </a>
                </li>
                <li>
                  <a href="/gold-calculator" onClick={(e) => { e.preventDefault(); navigate('/gold-calculator'); }} className="text-slate-600 hover:text-amber-600 hover:underline cursor-pointer block">
                    Gold Rate Calculator
                  </a>
                </li>
                <li>
                  <a href="/gpa-calculator" onClick={(e) => { e.preventDefault(); navigate('/gpa-calculator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    GPA &amp; CGPA Calculator
                  </a>
                </li>
                <li>
                  <a href="/qr-code-generator" onClick={(e) => { e.preventDefault(); navigate('/qr-code-generator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    QR Code Generator
                  </a>
                </li>
                <li>
                  <a href="/youtube-thumbnail-downloader" onClick={(e) => { e.preventDefault(); navigate('/youtube-thumbnail-downloader'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube Thumbnail Downloader
                  </a>
                </li>
                <li>
                  <a href="/youtube-tag-generator" onClick={(e) => { e.preventDefault(); navigate('/youtube-tag-generator'); }} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer block">
                    YouTube Tag Generator
                  </a>
                </li>
                <li>
                  <a href="/zakat-calculator" onClick={(e) => { e.preventDefault(); navigate('/zakat-calculator'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Zakat Calculator
                  </a>
                </li>
                <li>
                  <a href="/hijri-date-converter" onClick={(e) => { e.preventDefault(); navigate('/hijri-date-converter'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Hijri Date Converter
                  </a>
                </li>
                <li>
                  <a href="/ramadan-timetable" onClick={(e) => { e.preventDefault(); navigate('/ramadan-timetable'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Ramadan Timetable
                  </a>
                </li>
                <li>
                  <a href="/islamic-baby-names" onClick={(e) => { e.preventDefault(); navigate('/islamic-baby-names'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Islamic Baby Names
                  </a>
                </li>
                <li>
                  <a href="/wirasat-calculator" onClick={(e) => { e.preventDefault(); navigate('/wirasat-calculator'); }} className="text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer block">
                    Wirasat Calculator
                  </a>
                </li>
                <li>
                  <a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} className="text-slate-900 font-semibold hover:text-red-600 hover:underline cursor-pointer pt-1 block">
                    Knowledge Hub &amp; Blog →
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Company & Legal Trust */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Trust & Legal</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setIsMobileApkOpen(true)} className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1">
                    <span>📱 Get Android APK / App</span>
                  </button>
                </li>
                <li>
                  <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Contact & Support
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" onClick={(e) => { e.preventDefault(); navigate('/terms-of-service'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/copyright-policy" onClick={(e) => { e.preventDefault(); navigate('/copyright-policy'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Copyright & DMCA
                  </a>
                </li>
                <li>
                  <a href="/disclaimer" onClick={(e) => { e.preventDefault(); navigate('/disclaimer'); }} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer block">
                    Legal Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © 2026 <span className="font-bold text-slate-800">YouTikTools</span> · High-Speed Free Video & Audio Extractor.
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-500">
              <button onClick={() => navigate('/privacy-policy')} className="hover:text-slate-800 cursor-pointer">Privacy</button>
              <span>·</span>
              <button onClick={() => navigate('/terms-of-service')} className="hover:text-slate-800 cursor-pointer">Terms</button>
              <span>·</span>
              <button onClick={() => navigate('/copyright-policy')} className="hover:text-slate-800 cursor-pointer">DMCA</button>
              <span>·</span>
              <button onClick={() => navigate('/disclaimer')} className="hover:text-slate-800 cursor-pointer">Disclaimer</button>
              <span>·</span>
              <span>Universal H.264 Playback</span>
            </div>
          </div>
        </div>
      </footer>

      {/* GDPR / Google AdSense Compliant Cookie Consent Banner */}
      <CookieConsent onNavigate={navigate} />
    </div>
  );
}
