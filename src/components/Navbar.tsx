import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Music, 
  Layers, 
  History, 
  HelpCircle,
  Sparkles,
  ChevronDown,
  Languages,
  Tag,
  FileText,
  BookOpen,
  Wrench,
  Scissors,
  Minimize2,
  FileVideo
} from 'lucide-react';
import { CombinedLogo } from './CombinedLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  historyCount: number;
  onOpenHelp: () => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  historyCount,
  onOpenHelp,
  onOpenHistory,
}) => {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMoreToolActive = 
    currentPath === '/tools' ||
    currentPath.startsWith('/video-') ||
    currentPath.startsWith('/aspect-ratio') ||
    currentPath.startsWith('/bitrate') ||
    currentPath.startsWith('/fps') ||
    currentPath === '/youtube-tags-extractor' || 
    currentPath === '/batch-downloader';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="flex items-center justify-center transition-transform group-hover:scale-105">
            <CombinedLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-sans">
                YouTik<span className="text-red-600 font-bold">Tools</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-none hidden sm:block">
              YouTube & TikTok · Mobile & Laptop MP4
            </p>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('/youtube-video-downloader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/youtube-video-downloader'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Film className="h-3.5 w-3.5 text-red-600" />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => onNavigate('/tiktok-video-downloader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/tiktok-video-downloader'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs'
                : 'hover:text-cyan-700 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            <span>TikTok</span>
            <span className="hidden md:inline text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-100 text-cyan-800">
              No WM
            </span>
          </button>

          <button
            onClick={() => onNavigate('/youtube-to-mp3')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/youtube-to-mp3'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Music className="h-3.5 w-3.5 text-amber-600" />
            <span>MP3</span>
          </button>

          {/* More Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                isMoreToolActive
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>More Tools</span>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in">
                {/* Highlighted All Tools Directory Link */}
                <button
                  onClick={() => {
                    onNavigate('/tools');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-slate-900 bg-red-50/70 hover:bg-red-50 font-bold border-b border-slate-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-red-600" />
                    <span>All 18+ Tools Directory</span>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono">NEW</span>
                </button>

                <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Editing & Processing
                </div>

                <button
                  onClick={() => {
                    onNavigate('/video-converter');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <FileVideo className="h-4 w-4 text-slate-500" />
                  <span>Video Converter (MP4/WebM)</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('/video-compressor');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4 text-slate-500" />
                  <span>Video Compressor</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('/video-trimmer');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <Scissors className="h-4 w-4 text-slate-500" />
                  <span>Video Trimmer & Cutter</span>
                </button>

                <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                  Creator Utilities
                </div>

                <button
                  onClick={() => {
                    onNavigate('/video-captions-downloader');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  <Languages className="h-4 w-4 text-emerald-600" />
                  <span>Captions & Subtitles (SRT)</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('/youtube-tags-extractor');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span>Video Tags & SEO Keywords</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('/video-script-transcript-downloader');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-violet-700 font-semibold cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-violet-600" />
                  <span>Full Script & Transcript</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    onNavigate('/batch-downloader');
                    setIsToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-slate-500" />
                  <span>Batch Multi-URL Downloader</span>
                </button>
              </div>
            )}
          </div>

          {/* Blog link */}
          <button
            onClick={() => onNavigate('/blog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath.startsWith('/blog')
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-600" />
            <span>Blog</span>
          </button>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Download History"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHelp}
            aria-label="How it works"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="How it works"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
