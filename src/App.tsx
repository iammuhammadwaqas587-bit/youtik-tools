/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ActiveDownloadsModal } from './components/ActiveDownloadsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HelpModal } from './components/HelpModal';
import { Toast } from './components/Toast';
import { CombinedLogo } from './components/CombinedLogo';

import { HomePage } from './pages/HomePage';
import { YouTubePage } from './pages/YouTubePage';
import { TikTokPage } from './pages/TikTokPage';
import { AudioPage } from './pages/AudioPage';
import { CaptionsPage } from './pages/CaptionsPage';
import { TagsPage } from './pages/TagsPage';
import { ScriptPage } from './pages/ScriptPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { BatchDownloader } from './components/BatchDownloader';

import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage';
import { VideoConverterPage } from './pages/VideoConverterPage';
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
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CopyrightPolicyPage } from './pages/CopyrightPolicyPage';
import { DisclaimerPage } from './pages/DisclaimerPage';

import { VideoInfo, HistoryItem, DownloadTask, FormattedDownloadOption } from './types';
import { extractYouTubeId, fetchVideoMetadata, SAMPLE_VIDEOS } from './utils/youtube';
import { isTikTokUrl } from './utils/tiktok';
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

  // Programmatic navigation
  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
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
    } else if (currentPath === '/youtube-to-mp3') {
      title = 'YouTube to MP3 Converter - Free 320 kbps Studio Audio Downloader | YouTikTools';
      desc = 'Convert YouTube videos to pure 320 kbps constant bitrate MP3 audio. Fast, lossless transcoding for music, podcasts, speeches, and sound effects.';
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
      const slug = currentPath.replace('/blog/', '');
      title = `YouTikTools Guide - ${slug.replace(/-/g, ' ')} | Knowledge Hub`;
      desc = `Read our complete tutorial and technical breakdown on ${slug.replace(/-/g, ' ')} with expert recommendations.`;
    } else if (currentPath === '/tools') {
      title = 'Free Online Video Tools Directory - 18+ Converter, Compressor & Creator Utilities | YouTikTools';
      desc = 'Explore YouTikTools\'s complete suite of free video utilities: converter, compressor, trimmer, merger, GIF maker, frame extractor, bitrate calculator, and metadata inspector.';
    } else if (currentPath === '/video-converter') {
      title = 'Online Video Converter - Convert MP4, WebM, MOV, MKV, AVI Free | YouTikTools';
      desc = 'Convert video files between MP4, WebM, MOV, MKV, and AVI right in your browser. Fast, private, high quality transcoding with zero watermark.';
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

    // Update og:title and og:description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

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

    const structuredData = {
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
      setError('Please provide a valid YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...) or TikTok video URL');
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
        }
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
      setToastMessage(`Downloading actual ${option.container} file...`);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadTask(prev => prev ? {
        ...prev,
        status: 'error',
        errorMessage: err.message || 'Media conversion failed. Please try another format.'
      } : null);
      setToastMessage('Download failed: ' + (err.message || 'Unknown error'));
    }
  };

  const cancelActiveTask = () => {
    setDownloadTask(null);
    setToastMessage('Download cancelled');
  };

  const handleStartAudioFromRipView = (video: VideoInfo, bitrate: string, format: string) => {
    setCurrentVideo(video);
    const param = format === 'm4a' ? 'm4a' : format === 'wav' ? 'wav' : 'mp3';
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

    // 4. YouTube to MP3 Audio Ripper
    if (currentPath === '/youtube-to-mp3') {
      return (
        <AudioPage
          onStartDownloadAudio={handleStartAudioFromRipView}
          onShowToast={setToastMessage}
          onNavigate={navigate}
        />
      );
    }

    // 5. Captions & Subtitles Downloader (SRT/VTT)
    if (currentPath === '/video-captions-downloader') {
      return (
        <CaptionsPage
          onShowToast={setToastMessage}
        />
      );
    }

    // 6. YouTube Tags Extractor
    if (currentPath === '/youtube-tags-extractor') {
      return (
        <TagsPage
          onShowToast={setToastMessage}
        />
      );
    }

    // 7. Video Script & Transcript Downloader
    if (currentPath === '/video-script-transcript-downloader') {
      return (
        <ScriptPage
          onShowToast={setToastMessage}
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

    // 10. Blog Listing Hub
    if (currentPath === '/blog') {
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
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderPage()}
      </main>

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
                  <button onClick={() => navigate('/youtube-video-downloader')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    YouTube 1080p & 4K
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/tiktok-video-downloader')} className="text-slate-600 hover:text-cyan-700 hover:underline cursor-pointer">
                    TikTok No Watermark
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/youtube-to-mp3')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    YouTube to MP3 (320 kbps)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-captions-downloader')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Subtitles & Captions (SRT)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/youtube-tags-extractor')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    YouTube Tags & Keywords
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-script-transcript-downloader')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Full Video Script Downloader
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/batch-downloader')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Batch Multi-URL Queue
                  </button>
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
                  <button onClick={() => navigate('/tools')} className="text-slate-900 font-semibold hover:text-red-600 hover:underline cursor-pointer">
                    All 18+ Tools Directory →
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-converter')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Converter (MP4/WebM)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-compressor')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Compressor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-trimmer')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Trimmer & Cutter
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-merger')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Merger & Joiner
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-to-gif')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video to GIF Maker
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-thumbnail')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Thumbnail Extractor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-metadata')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Metadata Inspector
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Calculators & Blog */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Calculators & Hub</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => navigate('/video-size-calculator')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Video Size Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/video-resolution-checker')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Resolution Checker
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/aspect-ratio-calculator')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Aspect Ratio Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/bitrate-calculator')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    Bitrate Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/fps-calculator')} className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer">
                    FPS Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/blog')} className="text-slate-900 font-semibold hover:text-red-600 hover:underline cursor-pointer pt-1 block">
                    Knowledge Hub & Blog →
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Company & Legal Trust */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Trust & Legal</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => navigate('/about')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Contact & Support
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/privacy-policy')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms-of-service')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/copyright-policy')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Copyright & DMCA
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/disclaimer')} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                    Legal Disclaimer
                  </button>
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
    </div>
  );
}
