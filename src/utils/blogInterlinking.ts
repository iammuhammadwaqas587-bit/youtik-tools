import type { BlogPost } from '../data/blogPosts';

export interface InlineToken {
  type: 'text' | 'link';
  content: string;
  href?: string;
}

export interface ToolLinkItem {
  label: string;
  path: string;
  description: string;
  category: string;
}

export const TOOL_LINK_CATALOG: Record<string, ToolLinkItem> = {
  '/youtube-video-downloader': {
    label: 'YouTube Video Downloader',
    path: '/youtube-video-downloader',
    description: 'Save 1080p Full HD and 4K MP4 videos with muxed AAC audio.',
    category: 'Downloader',
  },
  '/tiktok-video-downloader': {
    label: 'TikTok Downloader (No Watermark)',
    path: '/tiktok-video-downloader',
    description: 'Extract crisp MP4 clips and sounds directly without floating logos.',
    category: 'Downloader',
  },
  '/facebook-video-downloader': {
    label: 'Facebook Video & Reels Downloader',
    path: '/facebook-video-downloader',
    description: 'Download public Facebook Watch videos, Reels, and shared HD clips.',
    category: 'Downloader',
  },
  '/instagram-video-downloader': {
    label: 'Instagram Reels & Post Downloader',
    path: '/instagram-video-downloader',
    description: 'Save Instagram Reels, carousels, and original audio in HD.',
    category: 'Downloader',
  },
  '/youtube-to-mp3': {
    label: 'YouTube to MP3 (320kbps)',
    path: '/youtube-to-mp3',
    description: 'Convert lectures, podcasts, and music tracks to high-bitrate MP3.',
    category: 'Audio',
  },
  '/youtube-player': {
    label: 'Distraction-Free YouTube Player',
    path: '/youtube-player',
    description: 'Watch videos in clean full screen without comments or sidebars.',
    category: 'Player',
  },
  '/video-captions-downloader': {
    label: 'Subtitles & Captions Downloader',
    path: '/video-captions-downloader',
    description: 'Export YouTube captions in SRT, VTT, and clean TXT formats.',
    category: 'Creator SEO',
  },
  '/youtube-tags-extractor': {
    label: 'YouTube Tags & Keyword Extractor',
    path: '/youtube-tags-extractor',
    description: 'Inspect hidden video tags and ranking keywords in one click.',
    category: 'Creator SEO',
  },
  '/video-script-transcript-downloader': {
    label: 'Script & Transcript Downloader',
    path: '/video-script-transcript-downloader',
    description: 'Copy full timecoded transcripts and spoken dialogue fast.',
    category: 'Creator SEO',
  },
  '/batch-downloader': {
    label: 'Batch Video Downloader',
    path: '/batch-downloader',
    description: 'Queue multiple YouTube links together for faster downloads.',
    category: 'Downloader',
  },
  '/video-converter': {
    label: 'Online Video Converter',
    path: '/video-converter',
    description: 'Convert between MP4, WebM, MOV, MKV, and AVI in your browser.',
    category: 'Editor',
  },
  '/image-converter': {
    label: 'Image Format Converter',
    path: '/image-converter',
    description: 'Convert images between JPG, PNG, WebP, AVIF, BMP, ICO, and HEIC privately.',
    category: 'Converter',
  },
  '/png-to-jpg': {
    label: 'PNG to JPG Converter',
    path: '/png-to-jpg',
    description: 'Convert PNG to compact JPG with custom background fill for transparency.',
    category: 'Converter',
  },
  '/webp-to-png': {
    label: 'WebP to PNG Converter',
    path: '/webp-to-png',
    description: 'Convert WebP downloads into transparent PNG files cleanly in browser.',
    category: 'Converter',
  },
  '/heic-to-jpg': {
    label: 'HEIC to JPG Converter',
    path: '/heic-to-jpg',
    description: 'Turn iPhone & iPad HEIC photos into universal JPG files privately.',
    category: 'Converter',
  },
  '/jpg-to-webp': {
    label: 'JPG to WebP Converter',
    path: '/jpg-to-webp',
    description: 'Optimize JPG photos into smaller WebP assets for faster web pages.',
    category: 'Converter',
  },
  '/video-compressor': {
    label: 'Video Compressor',
    path: '/video-compressor',
    description: 'Shrink large MP4 files for Discord, WhatsApp, and email uploads.',
    category: 'Editor',
  },
  '/video-trimmer': {
    label: 'Online Video Trimmer',
    path: '/video-trimmer',
    description: 'Cut and trim exact start/end timestamps locally with zero upload.',
    category: 'Editor',
  },
  '/video-merger': {
    label: 'Online Video Merger',
    path: '/video-merger',
    description: 'Combine multiple clips sequentially into one unified video.',
    category: 'Editor',
  },
  '/video-to-gif': {
    label: 'Video to GIF Converter',
    path: '/video-to-gif',
    description: 'Turn short video moments into lightweight animated GIF loops.',
    category: 'Editor',
  },
  '/video-thumbnail': {
    label: 'Video Thumbnail Extractor',
    path: '/video-thumbnail',
    description: 'Grab sharp JPG, PNG, or WebP still covers from any frame.',
    category: 'Editor',
  },
  '/video-frame-extractor': {
    label: 'Video Frame Extractor',
    path: '/video-frame-extractor',
    description: 'Capture individual still frames at millisecond timestamps.',
    category: 'Editor',
  },
  '/video-metadata': {
    label: 'Video Metadata Inspector',
    path: '/video-metadata',
    description: 'Check codec, FPS, resolution, aspect ratio, and bitrate locally.',
    category: 'Analyzer',
  },
  '/video-size-calculator': {
    label: 'Video File Size Calculator',
    path: '/video-size-calculator',
    description: 'Estimate final MB/GB output weight before rendering or exporting.',
    category: 'Calculator',
  },
  '/video-resolution-checker': {
    label: 'Video Resolution Checker',
    path: '/video-resolution-checker',
    description: 'Verify exact pixel dimensions (720p, 1080p, 4K) in your browser.',
    category: 'Calculator',
  },
  '/aspect-ratio-calculator': {
    label: 'Aspect Ratio Calculator',
    path: '/aspect-ratio-calculator',
    description: 'Resize dimensions cleanly between 16:9 widescreen and 9:16 vertical.',
    category: 'Calculator',
  },
  '/bitrate-calculator': {
    label: 'Video Bitrate Calculator',
    path: '/bitrate-calculator',
    description: 'Calculate optimal video & audio kbps for strict upload limits.',
    category: 'Calculator',
  },
  '/fps-calculator': {
    label: 'Video FPS Calculator',
    path: '/fps-calculator',
    description: 'Compute frame rates, total frame counts, and clip duration.',
    category: 'Calculator',
  },
  '/age-calculator': {
    label: 'Age Calculator (Hijri & Bikrami)',
    path: '/age-calculator',
    description: 'Calculate exact age in years/months/days, Hijri, and Desi/Bikrami dates.',
    category: 'Calculator',
  },
  '/prayer-times': {
    label: 'Prayer Times & Qibla',
    path: '/prayer-times',
    description: 'View Salah timings, live countdown, Hijri date, and Qibla degrees.',
    category: 'Calculator',
  },
  '/land-area-converter': {
    label: 'Land Area Converter (Marla, Kanal, Acre)',
    path: '/land-area-converter',
    description: 'Convert Marla, Kanal, Acre & Sq Ft with 272.25/225 toggle and PKR cost.',
    category: 'Calculator',
  },
  '/gold-calculator': {
    label: 'Gold Rate & Jewellery Calculator',
    path: '/gold-calculator',
    description: 'Convert Tola, Masha, Gram & compute 24K–18K gold and jewellery bills.',
    category: 'Calculator',
  },
  '/qr-code-generator': {
    label: 'QR Code Generator & Scanner',
    path: '/qr-code-generator',
    description: 'Create custom PNG/SVG QR codes with logos or scan QR codes offline.',
    category: 'Utility',
  },
  '/youtube-thumbnail-downloader': {
    label: 'YouTube Thumbnail Downloader',
    path: '/youtube-thumbnail-downloader',
    description: 'Download Maxres (1280x720), SD & HQ thumbnails from any YouTube link.',
    category: 'Downloader',
  },
  '/youtube-tag-generator': {
    label: 'YouTube Tag Generator',
    path: '/youtube-tag-generator',
    description: 'Generate SEO tags under 500 chars, hashtags & alternative titles.',
    category: 'Creator SEO',
  },
  '/gpa-calculator': {
    label: 'GPA & CGPA Calculator',
    path: '/gpa-calculator',
    description: 'Calculate semester GPA, cumulative CGPA, percentage & target GPA.',
    category: 'Calculator',
  },
  '/zakat-calculator': {
    label: 'Zakat Calculator (Pakistan & Nisab)',
    path: '/zakat-calculator',
    description: 'Calculate 2.5% Zakat with Silver/Gold Nisab, jewellery & Fitrana.',
    category: 'Calculator',
  },
  '/hijri-date-converter': {
    label: 'Hijri to Gregorian Date Converter',
    path: '/hijri-date-converter',
    description: 'Convert Hijri, Gregorian & Desi/Bikrami dates with Hilal offset.',
    category: 'Calculator',
  },
  '/ramadan-timetable': {
    label: 'Ramadan Timetable (Sehri & Iftar)',
    path: '/ramadan-timetable',
    description: '30-day Sehri & Iftar times with Hanafi settings, countdown & PDF.',
    category: 'Calculator',
  },
  '/islamic-baby-names': {
    label: 'Islamic Baby Names Finder',
    path: '/islamic-baby-names',
    description: 'Browse 500+ authentic names with Urdu/Arabic script & meanings.',
    category: 'Calculator',
  },
  '/wirasat-calculator': {
    label: 'Wirasat Inheritance Calculator',
    path: '/wirasat-calculator',
    description: 'Calculate Sunni Hanafi Islamic inheritance fractions & PKR shares.',
    category: 'Calculator',
  },
  '/tools': {
    label: 'All 20+ Free Video Tools',
    path: '/tools',
    description: 'Browse the full YouTikTools suite of downloaders and editors.',
    category: 'Directory',
  },
};

export const POPULAR_TOOL_HUB_LINKS: ToolLinkItem[] = [
  TOOL_LINK_CATALOG['/youtube-video-downloader'],
  TOOL_LINK_CATALOG['/tiktok-video-downloader'],
  TOOL_LINK_CATALOG['/facebook-video-downloader'],
  TOOL_LINK_CATALOG['/instagram-video-downloader'],
  TOOL_LINK_CATALOG['/youtube-to-mp3'],
  TOOL_LINK_CATALOG['/youtube-player'],
  TOOL_LINK_CATALOG['/video-captions-downloader'],
  TOOL_LINK_CATALOG['/batch-downloader'],
  TOOL_LINK_CATALOG['/video-compressor'],
  TOOL_LINK_CATALOG['/video-converter'],
];

/**
 * Parses markdown-style internal links `[label](/route)` AND bare `(/route)` citations
 * (e.g. from legacy blog articles) into safe typed tokens without HTML injection risk.
 */
export function tokenizeInlineLinks(text: string): InlineToken[] {
  if (!text) return [];

  // Match either [anchor text](/internal/path) OR (/internal-path)
  // Carefully avoids external URLs and normal parentheticals like (H.264 / AAC) or (16MB).
  const pattern = /\[([^\]]+)\]\((\/[a-z0-9-]+(?:\/[a-z0-9-]+)*)\)|\((\/[a-z0-9-]+(?:\/[a-z0-9-]+)*)\)/gi;
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, matchIndex) });
    }

    if (match[1] && match[2]) {
      tokens.push({
        type: 'link',
        content: match[1],
        href: match[2],
      });
    } else if (match[3]) {
      const route = match[3];
      const known = TOOL_LINK_CATALOG[route];
      tokens.push({ type: 'text', content: '(' });
      tokens.push({
        type: 'link',
        content: known ? known.label : route,
        href: route,
      });
      tokens.push({ type: 'text', content: ')' });
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return tokens;
}

export function escapeHtmlBasic(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderInlineLinksHtml(text: string): string {
  return tokenizeInlineLinks(text)
    .map((tok) => {
      if (tok.type === 'link' && tok.href) {
        return `<a href="${escapeHtmlBasic(tok.href)}" class="text-red-600 font-semibold hover:underline">${escapeHtmlBasic(tok.content)}</a>`;
      }
      return escapeHtmlBasic(tok.content);
    })
    .join('');
}

/**
 * Extracts all internal tool routes referenced within a post's content.
 */
function extractMentionedToolPaths(post: BlogPost): string[] {
  const found = new Set<string>();
  const textChunks: string[] = [];
  for (const section of post.content) {
    textChunks.push(...section.body, ...(section.tips || []));
    if (section.example) textChunks.push(section.example);
    if (section.subsections) {
      for (const sub of section.subsections) {
        textChunks.push(...sub.body);
        if (sub.example) textChunks.push(sub.example);
      }
    }
  }

  for (const tok of tokenizeInlineLinks(textChunks.join(' '))) {
    if (tok.type === 'link' && tok.href && TOOL_LINK_CATALOG[tok.href]) {
      found.add(tok.href);
    }
  }
  return Array.from(found);
}

/**
 * Resolves 2-4 relevant free tools for any blog post (supporting `tools`,
 * `relatedTools`, inline links, and smart topical inference).
 */
export function getRelatedToolsForPost(post: BlogPost): ToolLinkItem[] {
  const result: ToolLinkItem[] = [];
  const seen = new Set<string>();

  const pushPath = (path: string, customLabel?: string, customDesc?: string) => {
    if (seen.has(path)) return;
    const base = TOOL_LINK_CATALOG[path];
    if (!base && (!customLabel || !customDesc)) return;
    seen.add(path);
    result.push({
      label: customLabel || base.label,
      path,
      description: customDesc || base.description,
      category: base?.category || 'Tool',
    });
  };

  if (post.tools?.length) {
    for (const tool of post.tools) {
      pushPath(tool.path, tool.name, tool.description);
    }
  }

  if (post.relatedTools?.length) {
    for (const tool of post.relatedTools) {
      pushPath(tool.path, tool.label, tool.description);
    }
  }

  for (const path of extractMentionedToolPaths(post)) {
    if (result.length >= 4) break;
    pushPath(path);
  }

  // Fallback topical matching based on category/tags/slug
  const haystack = `${post.slug} ${post.category} ${post.tags.join(' ')} ${post.title}`.toLowerCase();
  const isVideoCategory = /content creation|video|audio|creator|youtube|tiktok|instagram|facebook|media|tech/i.test(post.category);
  const candidates: Array<[RegExp, string[]]> = [
    [/zakat|nisab|fitrana/, ['/zakat-calculator', '/gold-calculator', '/wirasat-calculator']],
    [/wirasat|miras|inheritance/, ['/wirasat-calculator', '/zakat-calculator']],
    [/ramadan|sehri|iftar/, ['/ramadan-timetable', '/prayer-times', '/hijri-date-converter']],
    [/hijri|bikrami|moon sighting|calendar/, ['/hijri-date-converter', '/ramadan-timetable', '/age-calculator']],
    [/baby name|muslim name|islamic name/, ['/islamic-baby-names', '/hijri-date-converter']],
    [/marla|kanal|acre|land|plot/, ['/land-area-converter', '/gold-calculator']],
    [/gold|tola|masha|karat|jewellery/, ['/gold-calculator', '/zakat-calculator']],
    [/\bage\b|birthday/, ['/age-calculator', '/hijri-date-converter']],
    [/gpa|cgpa|grade point|semester/, ['/gpa-calculator', '/age-calculator']],
    [/qr code|qr scanner|wifi qr|vcard/, ['/qr-code-generator']],
    [/thumbnail|maxresdefault/, ['/youtube-thumbnail-downloader', '/youtube-tag-generator']],
    [/tag generator|youtube tags|hashtags/, ['/youtube-tag-generator', '/youtube-thumbnail-downloader']],
    ...(isVideoCategory
      ? ([
          [/tiktok|watermark/, ['/tiktok-video-downloader', '/video-trimmer', '/aspect-ratio-calculator']],
          [/instagram|reels/, ['/instagram-video-downloader', '/aspect-ratio-calculator', '/video-compressor']],
          [/facebook/, ['/facebook-video-downloader', '/youtube-to-mp3', '/video-compressor']],
          [/mp3|audio|podcast|320kbps/, ['/youtube-to-mp3', '/youtube-video-downloader', '/video-script-transcript-downloader']],
          [/caption|subtitle|\bsrt\b|\bvtt\b|transcript|video script/, ['/video-captions-downloader', '/video-script-transcript-downloader', '/youtube-tags-extractor']],
          [/youtube tag|seo keyword|metadata/, ['/youtube-tags-extractor', '/youtube-tag-generator', '/video-thumbnail']],
          [/batch|playlist/, ['/batch-downloader', '/youtube-video-downloader', '/youtube-to-mp3']],
          [/compress|video size|discord|bitrate/, ['/video-compressor', '/bitrate-calculator', '/video-size-calculator']],
          [/codec|webm|mp4|av1|vp9|h\.?264|metadata/, ['/video-converter', '/video-metadata', '/video-compressor']],
          [/\bfps\b|resolution|1080p|\b4k\b|aspect|9:16|16:9/, ['/video-resolution-checker', '/aspect-ratio-calculator', '/fps-calculator']],
          [/trim|merge|gif|frame|thumbnail/, ['/video-trimmer', '/video-merger', '/video-to-gif', '/video-thumbnail']],
          [/youtube player|distraction/, ['/youtube-player', '/video-script-transcript-downloader', '/video-captions-downloader']],
          [/image|heic|webp|avif|png|jpg|favicon|ico|exif|transparency/, ['/image-converter', '/png-to-jpg', '/webp-to-png', '/heic-to-jpg']],
        ] as Array<[RegExp, string[]]>)
      : ([
          [/youtube player|distraction/, ['/youtube-player']],
          [/image|heic|webp|avif|png|jpg|favicon|ico/, ['/image-converter']],
          [/compress video|video compressor|mp4/, ['/video-compressor']],
        ] as Array<[RegExp, string[]]>)),
  ];

  for (const [regex, paths] of candidates) {
    if (result.length >= 4) break;
    if (regex.test(haystack)) {
      for (const p of paths) {
        if (result.length >= 4) break;
        pushPath(p);
      }
    }
  }

  // Only pad if fewer than 2 relevant tools were matched
  if (result.length < 2) {
    const isIslamicOrPakistani = /zakat|wirasat|ramadan|hijri|prayer|baby name|marla|gold|age|gpa|islamic|pakistan/.test(haystack);
    const defaults = isIslamicOrPakistani
      ? ['/hijri-date-converter', '/age-calculator', '/zakat-calculator']
      : ['/youtube-video-downloader', '/tiktok-video-downloader', '/youtube-to-mp3', '/tools'];
    for (const p of defaults) {
      if (result.length >= 2) break;
      pushPath(p);
    }
  }

  return result.slice(0, 4);
}

/**
 * Returns the top N most topically related blog posts via explicit `relatedSlugs`,
 * tag overlap, category match, and shared tool context.
 */
export function getRelatedBlogPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  count = 4
): BlogPost[] {
  const currentTags = new Set(currentPost.tags.map((t) => t.toLowerCase()));
  const currentTools = new Set(extractMentionedToolPaths(currentPost));
  const explicit = new Set(currentPost.relatedSlugs || []);

  const scored = allPosts
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate, idx) => {
      let score = 0;
      if (explicit.has(candidate.slug)) score += 100;
      if (candidate.category === currentPost.category) score += 12;

      for (const tag of candidate.tags) {
        if (currentTags.has(tag.toLowerCase())) score += 15;
      }

      for (const toolPath of extractMentionedToolPaths(candidate)) {
        if (currentTools.has(toolPath)) score += 10;
      }

      // Small recency tiebreaker so newer posts surface cleanly when scores tie
      score += Math.max(0, 5 - idx * 0.1);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((entry) => entry.candidate);
}

const TOOL_KEYWORD_MAP: Record<string, RegExp> = {
  '/youtube-video-downloader': /youtube|1080p|\b4k\b|dash|mux|shorts|live/i,
  '/tiktok-video-downloader': /tiktok|watermark|9:16|vertical|short-form/i,
  '/facebook-video-downloader': /facebook|fb\.watch|reels|watch/i,
  '/instagram-video-downloader': /instagram|reels|carousel|igtv/i,
  '/youtube-to-mp3': /mp3|320kbps|audio|podcast|aac|soundtrack/i,
  '/youtube-player': /player|distraction|nocookie|study|fullscreen/i,
  '/video-captions-downloader': /caption|subtitle|srt|vtt|bilingual/i,
  '/youtube-tags-extractor': /\btag\b|tags|seo|keyword|ranking|metadata/i,
  '/video-script-transcript-downloader': /transcript|script|dialogue|summary|blog/i,
  '/batch-downloader': /batch|playlist|queue|bulk|multi-link/i,
  '/video-converter': /convert|mkv|mov|avi|webm|mp4|codec/i,
  '/image-converter': /image|webp|avif|png|jpg|heic|ico|bmp|exif|favicon/i,
  '/png-to-jpg': /png to jpg|transparent|black background|alpha|2mb|thumbnail/i,
  '/webp-to-png': /webp to png|webp|transparent|alpha|favicon|logo/i,
  '/heic-to-jpg': /heic|heif|iphone|exif|gps/i,
  '/jpg-to-webp': /jpg to webp|webp|avif|core web vitals|lcp|thumbnail/i,
  '/video-compressor': /compress|size|25mb|whatsapp|discord|email|slack|bitrate/i,
  '/video-trimmer': /trim|cut|repurpose|shorts|gif|timestamps/i,
  '/video-merger': /merge|combine|join|stitch|trim/i,
  '/video-to-gif': /gif|loop|fps|slack|github/i,
  '/video-thumbnail': /thumbnail|cover|frame|1280x720|youtube/i,
  '/video-frame-extractor': /frame|keyframe|still|snapshot|cover|thumbnail/i,
  '/video-metadata': /metadata|codec|h\.?264|av1|vp9|mux|exif|resolution/i,
  '/video-size-calculator': /file size|storage|gb|mb|calculate|estimate|memory/i,
  '/video-resolution-checker': /resolution|1080p|\b4k\b|720p|pixel|upscaled/i,
  '/aspect-ratio-calculator': /aspect ratio|16:9|9:16|vertical|shorts|crop/i,
  '/bitrate-calculator': /bitrate|kbps|discord|email|25mb|compression/i,
  '/fps-calculator': /fps|frame rate|24fps|30fps|60fps|timing/i,
  '/age-calculator': /age|birthday|hijri|bikrami|calendar|leap year/i,
  '/prayer-times': /prayer|salah|qibla|hijri|hanafi|fajr/i,
  '/land-area-converter': /marla|kanal|acre|sq ft|sarsai|bigha|land|plot/i,
  '/gold-calculator': /gold|tola|masha|ratti|karat|jewellery|bullion/i,
  '/qr-code-generator': /qr code|qr scanner|wifi qr|vcard|whatsapp link/i,
  '/youtube-thumbnail-downloader': /thumbnail|maxresdefault|hqdefault|youtube cover|1280x720/i,
  '/youtube-tag-generator': /tag generator|youtube tags|hashtags|video title|seo tags/i,
  '/gpa-calculator': /gpa|cgpa|grade point|credit hours|semester/i,
  '/zakat-calculator': /zakat|nisab|fitrana|silver|gold|charity|hawl/i,
  '/hijri-date-converter': /hijri|gregorian|islamic date|bikrami|desi|moon sighting/i,
  '/ramadan-timetable': /ramadan|sehri|iftar|fasting|roza|suhoor/i,
  '/islamic-baby-names': /baby name|islamic name|muslim name|urdu name|arabic name/i,
  '/wirasat-calculator': /wirasat|miras|inheritance|hanafi|awl|radd|estate/i,
};

const ISLAMIC_TOOL_PATHS = new Set([
  '/zakat-calculator',
  '/wirasat-calculator',
  '/ramadan-timetable',
  '/prayer-times',
  '/hijri-date-converter',
  '/islamic-baby-names',
]);

const PAKISTAN_UTILITY_PATHS = new Set([
  '/land-area-converter',
  '/gold-calculator',
  '/age-calculator',
  '/gpa-calculator',
]);

/**
 * Returns the top N blog guides related to a specific tool route based on explicit
 * `tools` / `relatedTools`, inline `[label](/tool)` mentions, and topical keyword overlap.
 */
export function getRelatedBlogsForTool(
  toolPath: string,
  allPosts: BlogPost[],
  count = 3
): BlogPost[] {
  const normalized = toolPath.trim() || '/';
  const matcher = TOOL_KEYWORD_MAP[normalized];
  const isIslamicTool = ISLAMIC_TOOL_PATHS.has(normalized);
  const isUtilityTool = PAKISTAN_UTILITY_PATHS.has(normalized);

  const scored = allPosts.map((post, idx) => {
    let score = 0;

    if (post.tools?.[0]?.path === normalized) {
      score += 140;
    } else if (post.tools?.some((t) => t.path === normalized)) {
      score += 110;
    }

    if (post.relatedTools?.some((t) => t.path === normalized)) {
      score += 100;
    }

    const mentioned = extractMentionedToolPaths(post);
    if (mentioned.includes(normalized)) {
      score += 45;
    }

    const hay = `${post.slug} ${post.title} ${post.category} ${post.tags.join(' ')}`;
    if (matcher && matcher.test(hay)) {
      score += 18;
    }

    if (isIslamicTool && /islamic|ramadan|zakat|wirasat|hijri|quran|muslim|prayer/i.test(hay)) {
      score += 12;
    } else if (isUtilityTool && /pakistan|marla|tola|gold|nadra|gpa|cgpa|age/i.test(hay)) {
      score += 12;
    }

    // Small recency tiebreaker so newly published guides surface naturally
    score += Math.max(0, 6 - idx * 0.08);
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.post);
}

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function parseDateToIso(dateStr?: string): string | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return dateStr.trim();
  const match = dateStr.trim().match(/^([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (match) {
    const mm = MONTH_MAP[match[1].toLowerCase()] || '10';
    const dd = match[2].padStart(2, '0');
    const yyyy = match[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

/**
 * Converts `post.isoDate` or `post.publishDate` (e.g. "Nov 18, 2026") to `YYYY-MM-DD`.
 */
export function toIsoDateString(post: Pick<BlogPost, 'isoDate' | 'publishDate'>): string {
  return parseDateToIso(post.isoDate) || parseDateToIso(post.publishDate) || '2026-10-20';
}

/**
 * Converts `post.updatedIsoDate` or `post.updatedDate` to `YYYY-MM-DD`, falling back to published ISO date.
 */
export function toUpdatedIsoDateString(
  post: Pick<BlogPost, 'updatedIsoDate' | 'updatedDate' | 'isoDate' | 'publishDate'>
): string {
  return (
    parseDateToIso(post.updatedIsoDate) ||
    parseDateToIso(post.updatedDate) ||
    toIsoDateString(post)
  );
}
