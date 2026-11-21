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
  '/youtube-player': {
    path: '/youtube-player',
    title: 'YouTube Player - Distraction-Free, Full Screen Video Viewer', // 58 chars
    description: 'Watch YouTube videos distraction-free in a full-screen, privacy-enhanced YouTube embed player. Supports Shorts, live streams, and timestamps.', // 140 chars
    h1: 'Distraction-Free YouTube Player',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.9'
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
  '/image-converter': {
    path: '/image-converter',
    title: 'Image Format Converter - JPG, PNG, WebP, AVIF, HEIC Online', // 58 chars
    description: 'Free online image converter to convert JPG, PNG, WebP, AVIF, BMP, ICO, SVG, and HEIC in your browser. Private batch tool—files never leave your device.', // 151 chars
    h1: 'Image Format Converter',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/png-to-jpg': {
    path: '/png-to-jpg',
    title: 'PNG to JPG Converter - Free Online Batch Image Tool', // 51 chars
    description: 'Convert PNG to JPG online with custom quality and background fill so transparent graphics never turn black. Free, private batch processing in browser.', // 148 chars
    h1: 'PNG to JPG Converter',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/webp-to-png': {
    path: '/webp-to-png',
    title: 'WebP to PNG Converter - Keep Transparency Free Online', // 53 chars
    description: 'Convert WebP to PNG in your browser while preserving transparent backgrounds cleanly. Free batch image converter with zero server uploads.', // 138 chars
    h1: 'WebP to PNG Converter',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/heic-to-jpg': {
    path: '/heic-to-jpg',
    title: 'HEIC to JPG Converter - Open iPhone Photos Anywhere', // 51 chars
    description: 'Convert iPhone HEIC and HEIF photos to universal JPG directly in your browser. Free private batch image converter with quality and resize controls.', // 146 chars
    h1: 'HEIC to JPG Converter',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/jpg-to-webp': {
    path: '/jpg-to-webp',
    title: 'JPG to WebP Converter - Smaller Web Images Online', // 49 chars
    description: 'Convert JPG photos into lighter WebP assets right in your browser with quality and resize controls. Free batch image converter for faster web pages.', // 145 chars
    h1: 'JPG to WebP Converter',
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
  '/age-calculator': {
    path: '/age-calculator',
    title: 'Exact Age Calculator - Years, Hijri & Bikrami', // 46 chars
    description: 'Calculate your exact age in years, months, days, weeks, and hours, see next birthday countdown, and convert to Islamic (Hijri) & Desi/Bikrami dates.', // 149 chars
    h1: 'Exact Age Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/prayer-times': {
    path: '/prayer-times',
    title: 'Prayer Times & Qibla - Karachi Hanafi Schedule', // 47 chars
    description: 'Check daily Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha timings (Karachi Hanafi method), live next prayer countdown, Hijri date, and Qibla degrees.', // 149 chars
    h1: 'Prayer Times & Qibla Direction',
    category: 'calculator',
    changefreq: 'daily',
    priority: '0.8'
  },
  '/land-area-converter': {
    path: '/land-area-converter',
    title: 'Marla to Square Feet, Kanal to Marla Converter Pakistan', // 55 chars
    description: 'Convert Marla, Kanal, Acre, Square Feet, Sarsai, Bigha, and Hectare in browser. Includes 272.25 vs 225 sq ft Marla toggle, plot size helper & PKR price.', // 153 chars
    h1: 'Land Area Converter (Marla, Kanal, Acre)',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/gold-calculator': {
    path: '/gold-calculator',
    title: 'Gold Rate Calculator - Tola, Gram & Jewellery', // 45 chars
    description: 'Convert Tola, Masha, Ratti, Gram, and Troy Ounce gold weights. Calculate 24K, 22K, 21K, and 18K gold prices and jewellery bills with wastage, making & GST.', // 155 chars
    h1: 'Gold Rate Calculator (Tola, Gram, Jewellery Price)',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/qr-code-generator': {
    path: '/qr-code-generator',
    title: 'QR Code Generator & Scanner - Free Custom PNG/SVG', // 49 chars
    description: 'Generate custom QR codes for URLs, Wi-Fi, WhatsApp, vCard, Email & SMS with logo upload, color contrast check, PNG/SVG download, and built-in QR scanner.', // 153 chars
    h1: 'QR Code Generator & Scanner',
    category: 'editing',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/youtube-thumbnail-downloader': {
    path: '/youtube-thumbnail-downloader',
    title: 'YouTube Thumbnail Downloader - HD & Maxres Free', // 47 chars
    description: 'Download high-resolution YouTube video thumbnails in Maxres (1280x720), SD, HQ, and MQ sizes free in your browser. Supports Shorts, watch & youtu.be links.', // 155 chars
    h1: 'YouTube Thumbnail Downloader',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/youtube-tag-generator': {
    path: '/youtube-tag-generator',
    title: 'YouTube Tag Generator - AI SEO Tags & Hashtags', // 46 chars
    description: 'Generate 25-30 SEO-friendly YouTube video tags under 500 characters, 10 hashtags, and 5 title ideas in English, Urdu, Roman Urdu, or Hindi.', // 141 chars
    h1: 'YouTube Tag Generator',
    category: 'download',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/gpa-calculator': {
    path: '/gpa-calculator',
    title: 'GPA & CGPA Calculator - 4.0, 5.0 & Marks Scale', // 46 chars
    description: 'Free browser GPA and CGPA calculator with 4.0, 5.0, custom & Pakistani marks-to-grade scales, percentage conversion, and target CGPA planner.', // 142 chars
    h1: 'GPA & CGPA Calculator',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.8'
  },
  '/zakat-calculator': {
    path: '/zakat-calculator',
    title: 'Zakat Calculator Pakistan - Silver & Gold Nisab', // 47 chars
    description: 'Calculate 2.5% Zakat in PKR using Silver (52.5 tola) or Gold (7.5 tola) Nisab, purity-adjusted gold jewellery, cash, debts, and Zakat al-Fitr (Fitrana).', // 153 chars
    h1: 'Zakat Calculator (Pakistan & Nisab Guide)',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/hijri-date-converter': {
    path: '/hijri-date-converter',
    title: 'Hijri to Gregorian Date Converter - Islamic & Desi', // 50 chars
    description: 'Convert Hijri, Gregorian, and Desi (Bikrami) calendar dates two ways with Pakistan (-1) and Saudi (0) moon sighting adjustment plus Islamic events.', // 147 chars
    h1: 'Hijri to Gregorian Date Converter',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/ramadan-timetable': {
    path: '/ramadan-timetable',
    title: 'Ramadan Timetable Pakistan - Sehri & Iftar Times', // 48 chars
    description: 'Check 30-day Sehri and Iftar Ramadan times for Karachi, Lahore, Islamabad, and global cities with Hanafi timings, countdown, .ics export & A4 PDF print.', // 152 chars
    h1: 'Ramadan Timetable – Sehri & Iftar Times',
    category: 'calculator',
    changefreq: 'daily',
    priority: '0.9'
  },
  '/islamic-baby-names': {
    path: '/islamic-baby-names',
    title: 'Islamic Baby Names Finder - 500+ Urdu & Arabic Names', // 52 chars
    description: 'Search 500+ authentic Muslim baby names for boys and girls with Urdu & Arabic script, English/Urdu meanings, Favorites shortlist, Name Combiner & AI finder.', // 155 chars
    h1: 'Islamic Baby Names Finder (500+ Urdu & Arabic)',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/wirasat-calculator': {
    path: '/wirasat-calculator',
    title: 'Wirasat Calculator - Hanafi Islamic Inheritance Shares', // 54 chars
    description: 'Calculate Sunni (Hanafi) Islamic inheritance shares and PKR estate amounts with funeral/debt/wasiyyat deductions, hijab blocking, Umariyyatayn, Awl & Radd.', // 155 chars
    h1: 'Wirasat Calculator – Islamic Inheritance Shares',
    category: 'calculator',
    changefreq: 'weekly',
    priority: '0.9'
  },
  '/blog': {
    path: '/blog',
    title: 'Knowledge Hub & Free Guides - YouTikTools', // 43 chars
    description: 'Practical guides on Zakat, Wirasat, Ramadan, GPA, Marla land conversion, QR codes, YouTube SEO, and browser media optimization.', // 131 chars
    h1: 'Knowledge Hub & Practical Guides',
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
