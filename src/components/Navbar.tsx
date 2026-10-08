import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Sparkles, 
  Music, 
  Layers, 
  History, 
  HelpCircle,
  Languages,
  Tag,
  BookOpen,
  Wrench,
  Scissors,
  Minimize2,
  FileVideo,
  Image,
  Calculator,
  Gauge,
  Maximize2,
  ScrollText,
  Info,
  Menu,
  X,
  Search,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CombinedLogo } from './CombinedLogo';
import { ToolsMenuBar, DIRECT_TOOL_LINKS } from './ToolsMenuBar';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  // Close mobile menu on route change or when pressing Escape
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(path);
  };

  // Filter tools for mobile search
  const filteredMobileTools = DIRECT_TOOL_LINKS.filter(tool => 
    mobileSearchQuery.trim() === '' || 
    tool.name.toLowerCase().includes(mobileSearchQuery.toLowerCase()) ||
    tool.shortName.toLowerCase().includes(mobileSearchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Primary Top Bar */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <CombinedLogo size={34} />
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

        {/* Center Desktop Navigation - Primary Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
          <button
            onClick={() => handleNavClick('/youtube-video-downloader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/youtube-video-downloader'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Film className="h-3.5 w-3.5 text-red-600" />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => handleNavClick('/tiktok-video-downloader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/tiktok-video-downloader'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs font-bold'
                : 'hover:text-cyan-700 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            <span>TikTok</span>
            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-100 text-cyan-800">
              No WM
            </span>
          </button>

          <button
            onClick={() => handleNavClick('/youtube-to-mp3')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/youtube-to-mp3'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Music className="h-3.5 w-3.5 text-amber-600" />
            <span>MP3</span>
          </button>

          {/* Direct link to All Tools Directory */}
          <button
            onClick={() => handleNavClick('/tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath === '/tools' || currentPath.startsWith('/video-') || currentPath.startsWith('/aspect-ratio') || currentPath.startsWith('/bitrate') || currentPath.startsWith('/fps')
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wrench className="h-3.5 w-3.5 text-red-600" />
            <span>All Tools</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
              18+
            </span>
          </button>

          {/* Blog link */}
          <button
            onClick={() => handleNavClick('/blog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPath.startsWith('/blog')
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-600" />
            <span>Blog</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Download History"
            aria-label="Open download history"
          >
            <History className="h-4 w-4 text-slate-600" />
            <span className="hidden sm:inline font-medium">History</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-white bg-slate-900 px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How it works"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="How it works"
          >
            <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-red-600" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Secondary Menubar: Shows ALL links directly rather than as submenu in more tools */}
      <ToolsMenuBar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Mobile Drawer / Responsive Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-b border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Mobile Search Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search 20+ video tools..."
                  className="w-full pl-9 pr-4 py-2 bg-white text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                />
                {mobileSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMobileSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Tool Links Content */}
            <div className="overflow-y-auto p-4 space-y-5 flex-1">
              {/* Quick Primary Links */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Main Hub Links
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleNavClick('/')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-semibold cursor-pointer ${
                      currentPath === '/' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CombinedLogo size={18} />
                    <span>Home Hub</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('/tools')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left font-semibold cursor-pointer ${
                      currentPath === '/tools' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-red-50/50 text-slate-800 border-red-100 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-red-600" />
                      <span>All 18+ Tools</span>
                    </div>
                    <span className="text-[9px] font-mono bg-red-600 text-white px-1.5 py-0.2 rounded">
                      NEW
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('/blog')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-semibold cursor-pointer ${
                      currentPath.startsWith('/blog') 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 text-slate-600" />
                    <span>Tech Guides & Blog</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-left font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-600" />
                      <span>Download History</span>
                    </div>
                    {historyCount > 0 && (
                      <span className="text-[10px] font-mono bg-slate-800 text-white px-1.5 py-0.2 rounded-full">
                        {historyCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Tools List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Tools ({filteredMobileTools.length})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">1-Click Direct Access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredMobileTools.map((tool) => {
                    const isActive = currentPath === tool.path;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'brightness-125' : ''}>{tool.icon}</span>
                          <span>{tool.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {tool.badge && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              isActive 
                                ? 'bg-red-500 text-white' 
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {tool.badge}
                            </span>
                          )}
                          <ChevronRight className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Footer Drawer Actions */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenHelp();
                }}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                <HelpCircle className="h-4 w-4" />
                <span>How It Works & FAQ</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </div>

          {/* Backdrop click to dismiss */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex-1 cursor-pointer" 
          />
        </div>
      )}
    </header>
  );
};
