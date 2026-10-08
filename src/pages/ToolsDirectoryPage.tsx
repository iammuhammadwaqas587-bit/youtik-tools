import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  ArrowRight, 
  Film, 
  Sparkles, 
  Music, 
  FileVideo, 
  Minimize2, 
  Scissors, 
  Layers, 
  Image, 
  FileText, 
  Info, 
  Calculator, 
  Gauge, 
  Maximize2, 
  Languages, 
  Tag, 
  ScrollText,
  ShieldCheck
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';

interface ToolsDirectoryPageProps {
  onNavigate: (path: string) => void;
}

interface ToolDefinition {
  id: string;
  name: string;
  path: string;
  description: string;
  category: 'download' | 'conversion' | 'compression' | 'editing' | 'analysis' | 'calculators' | 'creator';
  icon: React.ReactNode;
  badge?: string;
}

const ALL_TOOLS: ToolDefinition[] = [
  // Download Tools
  {
    id: 'yt-down',
    name: 'YouTube Video Downloader',
    path: '/youtube-video-downloader',
    description: 'Save authorized YouTube videos in full 1080p and 4K MP4 with synchronized H.264 audio.',
    category: 'download',
    icon: <Film className="h-5 w-5 text-red-600" />,
    badge: '1080p & 4K'
  },
  {
    id: 'tt-down',
    name: 'TikTok Video Downloader',
    path: '/tiktok-video-downloader',
    description: 'Download TikTok clips without watermarks or username logos for personal archiving.',
    category: 'download',
    icon: <Sparkles className="h-5 w-5 text-cyan-600" />,
    badge: 'No Watermark'
  },
  {
    id: 'mp3-rip',
    name: 'YouTube to MP3 Converter',
    path: '/youtube-to-mp3',
    description: 'Extract studio-quality 320 kbps constant bitrate audio from videos for offline listening.',
    category: 'download',
    icon: <Music className="h-5 w-5 text-amber-600" />,
    badge: '320 kbps CBR'
  },
  {
    id: 'batch-down',
    name: 'Batch Multi-Link Downloader',
    path: '/batch-downloader',
    description: 'Queue and process multiple video links in a single organized batch session.',
    category: 'download',
    icon: <Layers className="h-5 w-5 text-slate-700" />,
  },

  // Conversion Tools
  {
    id: 'video-conv',
    name: 'Video Converter',
    path: '/video-converter',
    description: 'Convert authorized video files between MP4, WebM, MOV, MKV, and AVI containers.',
    category: 'conversion',
    icon: <FileVideo className="h-5 w-5 text-indigo-600" />,
    badge: 'Multi-Format'
  },
  {
    id: 'vid-gif',
    name: 'Video to GIF Creator',
    path: '/video-to-gif',
    description: 'Transform short video clips into lightweight, animated GIFs with custom FPS and width.',
    category: 'conversion',
    icon: <Image className="h-5 w-5 text-pink-600" />,
  },

  // Compression Tools
  {
    id: 'vid-comp',
    name: 'Video Compressor',
    path: '/video-compressor',
    description: 'Reduce heavy video file sizes for email and web sharing while preserving visual clarity.',
    category: 'compression',
    icon: <Minimize2 className="h-5 w-5 text-emerald-600" />,
    badge: 'Lossless Mode'
  },

  // Editing Tools
  {
    id: 'vid-trim',
    name: 'Video Trimmer & Cutter',
    path: '/video-trimmer',
    description: 'Cut unnecessary beginnings or endings from your video files with millisecond precision.',
    category: 'editing',
    icon: <Scissors className="h-5 w-5 text-orange-600" />,
  },
  {
    id: 'vid-merge',
    name: 'Video Merger & Joiner',
    path: '/video-merger',
    description: 'Combine multiple video clips into a single continuous stream in your chosen order.',
    category: 'editing',
    icon: <Layers className="h-5 w-5 text-purple-600" />,
  },

  // Video Analysis & Inspection
  {
    id: 'vid-meta',
    name: 'Video Metadata Inspector',
    path: '/video-metadata',
    description: 'Inspect exact codec profiles, duration, bitrate, resolution, and audio stream data.',
    category: 'analysis',
    icon: <Info className="h-5 w-5 text-blue-600" />,
  },
  {
    id: 'res-check',
    name: 'Video Resolution Checker',
    path: '/video-resolution-checker',
    description: 'Detect whether a clip is standard definition, 720p HD, 1080p Full HD, or 4K UHD.',
    category: 'analysis',
    icon: <Maximize2 className="h-5 w-5 text-teal-600" />,
  },
  {
    id: 'frame-ext',
    name: 'Video Frame Extractor',
    path: '/video-frame-extractor',
    description: 'Capture any individual frame at full native resolution in JPG, PNG, or WebP.',
    category: 'analysis',
    icon: <FileText className="h-5 w-5 text-amber-700" />,
  },
  {
    id: 'thumb-gen',
    name: 'Video Thumbnail Extractor',
    path: '/video-thumbnail',
    description: 'Extract cover artwork and preview keyframes at 0%, 25%, 50%, 75%, and 100%.',
    category: 'analysis',
    icon: <Image className="h-5 w-5 text-red-500" />,
  },

  // Video Calculators
  {
    id: 'size-calc',
    name: 'Video File Size Calculator',
    path: '/video-size-calculator',
    description: 'Calculate expected video file sizes based on duration, resolution, and bitrate.',
    category: 'calculators',
    icon: <Calculator className="h-5 w-5 text-emerald-700" />,
  },
  {
    id: 'aspect-calc',
    name: 'Aspect Ratio Calculator',
    path: '/aspect-ratio-calculator',
    description: 'Calculate proportional dimensions for 16:9, 9:16, 4:3, 1:1, and 21:9 displays.',
    category: 'calculators',
    icon: <Maximize2 className="h-5 w-5 text-blue-700" />,
  },
  {
    id: 'bitrate-calc',
    name: 'Bitrate Calculator',
    path: '/bitrate-calculator',
    description: 'Determine ideal video and audio bitrate allocations for target file sizes.',
    category: 'calculators',
    icon: <Gauge className="h-5 w-5 text-violet-600" />,
  },
  {
    id: 'fps-calc',
    name: 'FPS Calculator & Guide',
    path: '/fps-calculator',
    description: 'Calculate frame rates from duration and total frame counts with broadcast standards.',
    category: 'calculators',
    icon: <Gauge className="h-5 w-5 text-indigo-700" />,
  },

  // Creator & Text Tools
  {
    id: 'captions-tool',
    name: 'Subtitles & Captions Downloader',
    path: '/video-captions-downloader',
    description: 'Extract multi-language closed captions into standard SRT, VTT, or plain TXT files.',
    category: 'creator',
    icon: <Languages className="h-5 w-5 text-emerald-600" />,
  },
  {
    id: 'tags-tool',
    name: 'YouTube Tags & Keywords Extractor',
    path: '/youtube-tags-extractor',
    description: 'Extract video metadata tags and SEO search terms to optimize your video reach.',
    category: 'creator',
    icon: <Tag className="h-5 w-5 text-blue-600" />,
  },
  {
    id: 'transcript-tool',
    name: 'Video Script & Transcript Downloader',
    path: '/video-script-transcript-downloader',
    description: 'Download timestamped speech transcripts for research, note-taking, or translations.',
    category: 'creator',
    icon: <ScrollText className="h-5 w-5 text-violet-600" />,
  },
];

export const ToolsDirectoryPage: React.FC<ToolsDirectoryPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tools', count: ALL_TOOLS.length },
    { id: 'download', label: 'Downloaders', count: ALL_TOOLS.filter(t => t.category === 'download').length },
    { id: 'conversion', label: 'Conversion', count: ALL_TOOLS.filter(t => t.category === 'conversion').length },
    { id: 'compression', label: 'Compression', count: ALL_TOOLS.filter(t => t.category === 'compression').length },
    { id: 'editing', label: 'Editing', count: ALL_TOOLS.filter(t => t.category === 'editing').length },
    { id: 'analysis', label: 'Video Analysis', count: ALL_TOOLS.filter(t => t.category === 'analysis').length },
    { id: 'calculators', label: 'Calculators', count: ALL_TOOLS.filter(t => t.category === 'calculators').length },
    { id: 'creator', label: 'Creator Metadata', count: ALL_TOOLS.filter(t => t.category === 'creator').length },
  ];

  const filteredTools = ALL_TOOLS.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = search.trim() === '' || 
      tool.name.toLowerCase().includes(search.toLowerCase()) || 
      tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs">
          <Wrench className="h-3.5 w-3.5 text-slate-700" />
          <span>Professional Media Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Complete Video & Audio Tools Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          A comprehensive suite of free, web-based utilities for video conversion, compression, inspection, frame capture, and metadata analysis.
        </p>
      </header>

      {/* Responsible Use Banner */}
      <ResponsibleUseNotice variant="compact" />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`ml-1 text-[10px] ${activeCategory === cat.id ? 'text-slate-300' : 'text-slate-400'}`}>
                ({cat.count})
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {tool.badge}
                  </span>
                )}
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                {tool.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                {tool.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 capitalize">
                {tool.category}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(tool.path)}
                className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors cursor-pointer"
              >
                <span>Use Tool</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">No tools found matching "{search}".</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="mt-3 text-xs font-bold text-red-600 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Mid Ad Slot */}
      <AdSlot position="middle" />

      {/* Informative Platform Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2>Why Use YouTik Media Utilities?</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          YouTik provides client-assisted and server-optimized video processing utilities. Whether you need to inspect raw stream codecs, convert containers, calculate accurate bitrate budgets, or generate social media thumbnails, every tool is engineered with speed, privacy, and zero malware in mind.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">100% Free Access</span>
            <p className="text-slate-500">No account required, no subscription paywalls, and no software installations.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Privacy Focused</span>
            <p className="text-slate-500">Video inspection and frame extraction tools process media directly in your browser memory.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Universal Standards</span>
            <p className="text-slate-500">Outputs standards-compliant H.264, MP4, and WebM files playable on laptops and smartphones.</p>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <AdSlot position="bottom" />
    </div>
  );
};
