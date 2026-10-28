export interface SeoRouteInfo {
  path: string;
  title: string;
  description: string;
  h1: string;
  category: 'core' | 'download' | 'editing' | 'calculator' | 'info' | 'blog';
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
}

export const SEO_ROUTES: Record<string, SeoRouteInfo> = {
  '/': {
    path: '/',
    title: 'YouTikTools - Free YouTube & TikTok Downloader', // 48 chars
    description: 'Free online video downloader for YouTube, TikTok, Facebook & Instagram. Download HD MP4 videos without watermark and convert audio to MP3.', // 142 chars
    h1: 'Free Video & Audio Downloader Hub',
    category: 'core',
    changefreq: 'daily',
    priority: '1.0'
  },
  '/youtube-video-downloader': {
    path: '/youtube-video-downloader',
    title: 'YouTube Video Downloader - 1080p & 4K MP4', // 41 chars
    description: 'Download YouTube videos in 1080p Full HD, 4K UHD, and 720p with audio. Fast, free, browser-based online YouTube MP4 downloader.', // 130 chars
    h1: 'YouTube Video Downloader (1080p & 4K)',
    category: 'download',
    changefreq: 'daily',
    priority: '0.9'
  },
  '/tiktok-video-downloader': {
    path: '/tiktok-video-downloader',
    title: 'TikTok Downloader - No Watermark HD MP4', // 40 chars
    description: 'Download TikTok videos without watermark in HD quality. Save original TikTok audio in MP3 format with zero watermark on phone or laptop.', // 139 chars
    h1: 'TikTok Downloader (No Watermark)',
    category: 'download',
    changefreq: 'daily',
    priority: '0.9'
  },
  '/facebook-video-downloader': {
    path: '/facebook-video-downloader',
    title: 'Facebook Video Downloader - 1080p & Reels', // 42 chars
    description: 'Download Facebook videos, Reels, and Watch clips in 1080p Full HD and MP3. Free online Facebook video downloader with original quality.', // 137 chars
    h1: 'Facebook Video & Reels Downloader',
    category: 'download',
    changefreq: 'daily',
    priority: '0.9'
  },
  '/instagram-video-downloader': {
    path: '/instagram-video-downloader',
    title: 'Instagram Downloader - Reels, Posts & Video', // 44 chars
    description: 'Download Instagram Reels, carousel posts, photos, and videos in original quality. Save multi-file Instagram media directly to your device.', // 140 chars
    h1: 'Instagram Reels & Post Downloader',
    category: 'download',
    changefreq: 'daily',
    priority: '0.9'
  },
  '/youtube-to-mp3': {
    path: '/youtube-to-mp3',
    title: 'YouTube to MP3 - 320kbps Audio Converter', // 41 chars
    description: 'Convert YouTube videos to high-bitrate 320kbps MP3 audio files. Extract crystal-clear music, speeches, and podcasts online for free.', // 133 chars
    h1: 'YouTube to MP3 Converter (320kbps)',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-captions-downloader': {
    path: '/video-captions-downloader',
    title: 'Video Subtitles Downloader - SRT & VTT', // 39 chars
    description: 'Download subtitles and closed captions from YouTube videos in SRT, VTT, and plain text. Supports multilingual tracks and auto-captions.', // 138 chars
    h1: 'Video Subtitles & Captions Downloader',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/youtube-tags-extractor': {
    path: '/youtube-tags-extractor',
    title: 'YouTube Tags Extractor - SEO Keywords Tool', // 43 chars
    description: 'Extract hidden tags, SEO keywords, and metadata from any YouTube video. Boost your channel ranking with competitor keyword research.', // 134 chars
    h1: 'YouTube Tags & Keywords Extractor',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-script-transcript-downloader': {
    path: '/video-script-transcript-downloader',
    title: 'Video Transcript Downloader - Full Script', // 42 chars
    description: 'Download full video scripts, timecoded transcripts, and dialogue from YouTube videos. Export clean text files for content repurposing.', // 135 chars
    h1: 'Video Script & Transcript Downloader',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/batch-downloader': {
    path: '/batch-downloader',
    title: 'Batch Video Downloader - Multi-Link Queue', // 42 chars
    description: 'Queue and download multiple video links simultaneously. Paste YouTube URLs to batch extract MP4 videos and MP3 audio in one click.', // 132 chars
    h1: 'Batch YouTube Video Downloader',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/tools': {
    path: '/tools',
    title: 'Free Online Video Tools - 20+ Utilities', // 40 chars
    description: 'Explore 20+ free video tools: video converter, compressor, trimmer, merger, GIF maker, metadata viewer, and bitrate calculators.', // 131 chars
    h1: 'Online Video Tools & Utilities Directory',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-converter': {
    path: '/video-converter',
    title: 'Online Video Converter - MP4, WebM, MOV', // 40 chars
    description: 'Convert video files between MP4, WebM, MOV, MKV, and AVI in your browser. Fast, private client-side conversion with zero watermarks.', // 134 chars
    h1: 'Online Video Converter (MP4, WebM, MOV)',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-compressor': {
    path: '/video-compressor',
    title: 'Video Compressor - Reduce File Size Online', // 43 chars
    description: 'Compress video files to reduce size without quality loss. Optimize videos for Discord, email, and web uploads with instant preview.', // 133 chars
    h1: 'Video Compressor - Reduce File Size',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-trimmer': {
    path: '/video-trimmer',
    title: 'Video Trimmer - Cut & Crop Videos Online', // 41 chars
    description: 'Cut and trim video clips online with millisecond precision. Fast browser-based video cutter with real-time preview and export.', // 128 chars
    h1: 'Online Video Trimmer & Cutter',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-merger': {
    path: '/video-merger',
    title: 'Video Merger - Combine Multiple Clips', // 38 chars
    description: 'Merge and stitch multiple video clips into one seamless MP4 file. Drag-and-drop sequencing with instant browser preview.', // 121 chars
    h1: 'Online Video Merger & Combiner',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-to-gif': {
    path: '/video-to-gif',
    title: 'Video to GIF Converter - High-Res GIFs', // 39 chars
    description: 'Convert video clips to animated GIFs. Customize frame rate, resolution, start and end timestamps with live file size estimation.', // 130 chars
    h1: 'Video to GIF Converter & Maker',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-thumbnail': {
    path: '/video-thumbnail',
    title: 'Video Thumbnail Extractor - Save HD Frames', // 43 chars
    description: 'Extract crisp high-resolution thumbnail images from any video. Download still frames in JPG, PNG, and WebP format without watermarks.', // 134 chars
    h1: 'Video Thumbnail Extractor & Grabber',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/video-metadata': {
    path: '/video-metadata',
    title: 'Video Metadata Inspector - Codec & Specs', // 41 chars
    description: 'Inspect technical video properties: codec, bitrate, resolution, frame rate, aspect ratio, audio channels, and container format.', // 129 chars
    h1: 'Video Metadata & Codec Inspector',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/video-frame-extractor': {
    path: '/video-frame-extractor',
    title: 'Video Frame Extractor - HD Still Frames', // 40 chars
    description: 'Extract exact still frames from videos at specific timestamps. Save high-definition snapshots in JPG, PNG, or WebP format.', // 124 chars
    h1: 'Video Frame Extractor & Snapshot Tool',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/video-size-calculator': {
    path: '/video-size-calculator',
    title: 'Video File Size Calculator - Estimate MB', // 41 chars
    description: 'Estimate video file size from duration, bitrate, resolution, and audio settings before encoding or uploading.', // 110 chars
    h1: 'Video File Size Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/video-resolution-checker': {
    path: '/video-resolution-checker',
    title: 'Video Resolution Checker - 1080p, 4K & SD', // 42 chars
    description: 'Check video dimensions, pixel resolution, aspect ratio, and display standard (1080p Full HD, 4K UHD, 720p, 480p) instantly.', // 124 chars
    h1: 'Video Resolution Checker & Analyzer',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/aspect-ratio-calculator': {
    path: '/aspect-ratio-calculator',
    title: 'Aspect Ratio Calculator - 16:9, 9:16 & 4:3', // 43 chars
    description: 'Calculate video aspect ratios, scale dimensions, and find exact pixel sizes for YouTube, TikTok, Instagram, and widescreen screens.', // 134 chars
    h1: 'Video Aspect Ratio Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/bitrate-calculator': {
    path: '/bitrate-calculator',
    title: 'Video Bitrate Calculator - Target MB Limits', // 44 chars
    description: 'Calculate video and audio bitrates to meet strict file size limits on Discord, email, or social media platforms.', // 114 chars
    h1: 'Video & Audio Bitrate Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/fps-calculator': {
    path: '/fps-calculator',
    title: 'Video FPS Calculator - Frames Per Second', // 41 chars
    description: 'Calculate video frame rate (FPS), total frames, and duration using standard frame counting algorithms online.', // 110 chars
    h1: 'Video FPS & Frame Rate Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.7'
  },
  '/blog': {
    path: '/blog',
    title: 'Video Tech Blog & Guides - YouTikTools', // 39 chars
    description: 'Expert tutorials on video downloading, audio conversion, compression techniques, video codecs, aspect ratios, and media optimization.', // 135 chars
    h1: 'Video Technology & Media Guides Blog',
    category: 'blog',
    changefreq: 'daily',
    priority: '0.8'
  },
  '/about': {
    path: '/about',
    title: 'About YouTikTools - Free Video Tools Suite', // 43 chars
    description: 'Learn about YouTikTools: our mission to provide clean, high-speed, browser-based video downloading and editing tools with zero ads and malware.', // 145 chars
    h1: 'About YouTikTools & Our Mission',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.5'
  },
  '/contact': {
    path: '/contact',
    title: 'Contact Support & Feedback - YouTikTools', // 41 chars
    description: 'Get in touch with the YouTikTools engineering team for technical support, feature requests, bug reports, or partnership inquiries.', // 133 chars
    h1: 'Contact YouTikTools Support Team',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.5'
  },
  '/privacy-policy': {
    path: '/privacy-policy',
    title: 'Privacy Policy - YouTikTools', // 28 chars
    description: 'Read the YouTikTools Privacy Policy. We do not store personal videos, collect user credentials, or sell browsing data to third parties.', // 137 chars
    h1: 'Privacy Policy & Data Protection',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.4'
  },
  '/terms-of-service': {
    path: '/terms-of-service',
    title: 'Terms of Service - YouTikTools', // 31 chars
    description: 'Review the terms and conditions for using YouTikTools video conversion, downloading, and media editing services responsibly.', // 126 chars
    h1: 'Terms of Service & Usage Guidelines',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.4'
  },
  '/copyright-policy': {
    path: '/copyright-policy',
    title: 'Copyright & DMCA Policy - YouTikTools', // 38 chars
    description: 'YouTikTools intellectual property principles, DMCA compliance, fair use guidelines, and copyright takedown notice contact information.', // 137 chars
    h1: 'Copyright & DMCA Takedown Policy',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.4'
  },
  '/disclaimer': {
    path: '/disclaimer',
    title: 'Legal Disclaimer - YouTikTools', // 31 chars
    description: 'Official legal disclaimer regarding independence and separation from Google, YouTube, TikTok, Facebook, and Instagram trademarks.', // 132 chars
    h1: 'Legal Disclaimer & Platform Notice',
    category: 'info',
    changefreq: 'monthly',
    priority: '0.4'
  }
};
