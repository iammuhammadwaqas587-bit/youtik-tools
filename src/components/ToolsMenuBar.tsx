import React, { useRef, useState, useEffect } from 'react';
import { 
  Film, 
  Sparkles, 
  Music, 
  FileVideo, 
  Minimize2, 
  Scissors, 
  Layers, 
  Image, 
  Languages, 
  Tag, 
  FileText, 
  Wrench, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Maximize2,
  Calculator,
  Gauge,
  ScrollText,
  SlidersHorizontal
} from 'lucide-react';

export interface ToolMenuItem {
  id: string;
  name: string;
  shortName: string;
  path: string;
  category: 'download' | 'editing' | 'creator' | 'calculator';
  icon: React.ReactNode;
  badge?: string;
}

export const DIRECT_TOOL_LINKS: ToolMenuItem[] = [
  {
    id: 'tools-all',
    name: 'All 18+ Tools Directory',
    shortName: 'All Tools',
    path: '/tools',
    category: 'download',
    icon: <Wrench className="h-3.5 w-3.5 text-red-600" />,
    badge: '18+'
  },
  {
    id: 'yt-down',
    name: 'YouTube 1080p / 4K',
    shortName: 'YouTube HD',
    path: '/youtube-video-downloader',
    category: 'download',
    icon: <Film className="h-3.5 w-3.5 text-red-600" />,
    badge: '1080p'
  },
  {
    id: 'tt-down',
    name: 'TikTok (No Watermark)',
    shortName: 'TikTok No WM',
    path: '/tiktok-video-downloader',
    category: 'download',
    icon: <Sparkles className="h-3.5 w-3.5 text-cyan-600" />,
    badge: 'HD'
  },
  {
    id: 'mp3-rip',
    name: 'YouTube to MP3 (320k)',
    shortName: 'YouTube to MP3',
    path: '/youtube-to-mp3',
    category: 'download',
    icon: <Music className="h-3.5 w-3.5 text-amber-600" />,
    badge: '320k'
  },
  {
    id: 'batch-down',
    name: 'Batch Multi-Downloader',
    shortName: 'Batch Queue',
    path: '/batch-downloader',
    category: 'download',
    icon: <Layers className="h-3.5 w-3.5 text-slate-700" />
  },
  {
    id: 'vid-conv',
    name: 'Video Converter',
    shortName: 'Converter',
    path: '/video-converter',
    category: 'editing',
    icon: <FileVideo className="h-3.5 w-3.5 text-indigo-600" />,
    badge: 'MP4/WebM'
  },
  {
    id: 'vid-comp',
    name: 'Video Compressor',
    shortName: 'Compressor',
    path: '/video-compressor',
    category: 'editing',
    icon: <Minimize2 className="h-3.5 w-3.5 text-emerald-600" />
  },
  {
    id: 'vid-trim',
    name: 'Video Trimmer & Cutter',
    shortName: 'Trimmer',
    path: '/video-trimmer',
    category: 'editing',
    icon: <Scissors className="h-3.5 w-3.5 text-orange-600" />
  },
  {
    id: 'vid-merge',
    name: 'Video Merger & Joiner',
    shortName: 'Merger',
    path: '/video-merger',
    category: 'editing',
    icon: <Layers className="h-3.5 w-3.5 text-purple-600" />
  },
  {
    id: 'vid-gif',
    name: 'Video to GIF Maker',
    shortName: 'To GIF',
    path: '/video-to-gif',
    category: 'editing',
    icon: <Image className="h-3.5 w-3.5 text-pink-600" />
  },
  {
    id: 'thumb-gen',
    name: 'Thumbnail Grabber',
    shortName: 'Thumbnail',
    path: '/video-thumbnail',
    category: 'editing',
    icon: <Image className="h-3.5 w-3.5 text-rose-500" />
  },
  {
    id: 'captions-tool',
    name: 'Captions & Subtitles (SRT)',
    shortName: 'Captions SRT',
    path: '/video-captions-downloader',
    category: 'creator',
    icon: <Languages className="h-3.5 w-3.5 text-emerald-600" />
  },
  {
    id: 'tags-tool',
    name: 'YouTube Tags & SEO',
    shortName: 'Tags & SEO',
    path: '/youtube-tags-extractor',
    category: 'creator',
    icon: <Tag className="h-3.5 w-3.5 text-blue-600" />
  },
  {
    id: 'transcript-tool',
    name: 'Script & Full Transcript',
    shortName: 'Script / Transcript',
    path: '/video-script-transcript-downloader',
    category: 'creator',
    icon: <ScrollText className="h-3.5 w-3.5 text-violet-600" />
  },
  {
    id: 'vid-meta',
    name: 'Video Metadata Inspector',
    shortName: 'Metadata',
    path: '/video-metadata',
    category: 'calculator',
    icon: <Info className="h-3.5 w-3.5 text-blue-600" />
  },
  {
    id: 'frame-ext',
    name: 'Frame Extractor (HD)',
    shortName: 'Frame Extractor',
    path: '/video-frame-extractor',
    category: 'calculator',
    icon: <FileText className="h-3.5 w-3.5 text-amber-700" />
  },
  {
    id: 'size-calc',
    name: 'File Size Calculator',
    shortName: 'Size Calc',
    path: '/video-size-calculator',
    category: 'calculator',
    icon: <Calculator className="h-3.5 w-3.5 text-emerald-700" />
  },
  {
    id: 'res-check',
    name: 'Resolution Checker',
    shortName: 'Res Checker',
    path: '/video-resolution-checker',
    category: 'calculator',
    icon: <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
  },
  {
    id: 'aspect-calc',
    name: 'Aspect Ratio Calculator',
    shortName: 'Aspect Ratio',
    path: '/aspect-ratio-calculator',
    category: 'calculator',
    icon: <Maximize2 className="h-3.5 w-3.5 text-blue-700" />
  },
  {
    id: 'bitrate-calc',
    name: 'Bitrate Calculator',
    shortName: 'Bitrate',
    path: '/bitrate-calculator',
    category: 'calculator',
    icon: <Gauge className="h-3.5 w-3.5 text-violet-600" />
  },
  {
    id: 'fps-calc',
    name: 'FPS Calculator',
    shortName: 'FPS Calc',
    path: '/fps-calculator',
    category: 'calculator',
    icon: <Gauge className="h-3.5 w-3.5 text-indigo-700" />
  }
];

interface ToolsMenuBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const ToolsMenuBar: React.FC<ToolsMenuBarProps> = ({ currentPath, onNavigate }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'download' | 'editing' | 'creator' | 'calculator'>('all');

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Auto-scroll active item into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentPath]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const distance = 260;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  const filteredLinks = activeCategoryFilter === 'all' 
    ? DIRECT_TOOL_LINKS 
    : DIRECT_TOOL_LINKS.filter(item => item.id === 'tools-all' || item.category === activeCategoryFilter);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-1.5 py-1.5 sm:py-2">
          {/* Label indicator (hidden on very tiny phones to save space) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 border-r border-slate-200 pr-3 mr-1">
            <SlidersHorizontal className="h-3 w-3 text-red-600" />
            <span>Direct Tools:</span>
          </div>

          {/* Left Arrow Button for desktop horizontal scrolling */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll tools left"
            className={`hidden sm:flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white shadow-2xs transition-all shrink-0 cursor-pointer ${
              canScrollLeft 
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50' 
                : 'text-slate-300 opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrollable direct links bar */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-1"
          >
            {filteredLinks.map((tool) => {
              const isActive = currentPath === tool.path;
              return (
                <button
                  key={tool.id}
                  onClick={() => onNavigate(tool.path)}
                  data-active={isActive ? "true" : "false"}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                  }`}
                  title={tool.name}
                >
                  <span className={isActive ? 'brightness-125' : ''}>{tool.icon}</span>
                  <span className="font-medium text-[11.5px] sm:text-xs">
                    {tool.shortName}
                  </span>
                  {tool.badge && (
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                      isActive 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button for desktop horizontal scrolling */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll tools right"
            className={`hidden sm:flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white shadow-2xs transition-all shrink-0 cursor-pointer ${
              canScrollRight 
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50' 
                : 'text-slate-300 opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Quick Category filter button for fast jumping */}
          <div className="shrink-0 pl-1 border-l border-slate-200 hidden md:block">
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value as any)}
              className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer"
              aria-label="Filter direct tools category"
            >
              <option value="all">All Categories (21)</option>
              <option value="download">Downloaders</option>
              <option value="editing">Editing & Converters</option>
              <option value="creator">Creator & Captions</option>
              <option value="calculator">Calculators & Specs</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
