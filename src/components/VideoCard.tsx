import React, { useState, useRef, useEffect } from 'react';
import { 
  VideoInfo, 
  FormattedDownloadOption 
} from '../types';
import { getAvailableDownloadFormats } from '../utils/youtube';
import { 
  ChevronDown, 
  Download, 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Eye, 
  CheckCircle2,
  Film
} from 'lucide-react';

interface VideoCardProps {
  video: VideoInfo;
  onStartDownload: (option: FormattedDownloadOption) => void;
  onShowToast: (msg: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onStartDownload,
  onShowToast,
}) => {
  const formats = getAvailableDownloadFormats(video.durationSeconds);
  const [selectedFormat, setSelectedFormat] = useState<FormattedDownloadOption>(
    formats.find(f => f.id === '1080p-mp4') || formats[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlayingEmbed, setIsPlayingEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.url);
    setCopiedLink(true);
    onShowToast('Video URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectOption = (opt: FormattedDownloadOption) => {
    setSelectedFormat(opt);
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    onStartDownload(selectedFormat);
  };

  // Group options by section exactly matching user screenshot
  const readySection = formats.filter(f => f.section === 'ready_video');
  const hqSection = formats.filter(f => f.section === 'hq_video');
  const mp3Section = formats.filter(f => f.section === 'mp3');
  const audioOnlySection = formats.filter(f => f.section === 'audio_only');

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 relative overflow-visible">
      {/* Video Header Area */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Thumbnail / Player preview */}
          <div className="relative aspect-video w-full md:w-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group shadow-sm">
            {isPlayingEmbed ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={video.highThumbnail || video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = video.thumbnail;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlayingEmbed(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Watch Preview</span>
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-medium text-white">
                  {video.durationFormatted}
                </div>
              </>
            )}
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {video.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-800">{video.author}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3 text-slate-400" />
                {video.durationFormatted}
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Eye className="h-3 w-3 text-slate-400" />
                {video.viewsFormatted}
              </span>
            </div>

            {/* Quick links */}
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
              >
                {copiedLink ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <span>Open YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Format Selector Section (Matching user screenshot) */}
      <div className="p-6 bg-slate-50 rounded-b-2xl relative overflow-visible border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 mb-2">
          Choose Format & Quality:
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative overflow-visible">
          {/* Format Dropdown */}
          <div className="relative flex-1 overflow-visible" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-slate-50/80 border-2 border-blue-400 rounded-lg text-sm font-semibold text-slate-900 shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="truncate text-left text-slate-900 font-medium">
                {selectedFormat.label}
              </span>
              <ChevronDown className={`h-4 w-4 text-blue-500 shrink-0 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropped Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute left-0 right-0 top-full mt-1 z-[100] max-h-96 overflow-y-auto bg-white border-2 border-blue-400 rounded-lg shadow-2xl divide-y divide-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-100"
                style={{ minWidth: '100%' }}
              >
                {/* 1. Video + Audio (Ready to Download) */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100/90 flex items-center gap-1.5 select-none">
                    <span>🎬 Video + Audio (Ready to Download)</span>
                  </div>
                  {readySection.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedFormat.id === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-blue-700 font-semibold hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedFormat.id === opt.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* 2. Higher Quality Video — Combine with audio for sound */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100/90 flex items-center gap-1.5 select-none">
                    <span>🎞 Higher Quality Video — Combine with audio for sound</span>
                  </div>
                  {hqSection.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedFormat.id === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-800 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedFormat.id === opt.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* 3. MP3 */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100/90 flex items-center gap-1.5 select-none">
                    <span>🎵 MP3</span>
                  </div>
                  {mp3Section.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedFormat.id === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-800 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedFormat.id === opt.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* 4. Audio Only */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100/90 flex items-center gap-1.5 select-none">
                    <span>🎵 Audio Only</span>
                  </div>
                  {audioOnlySection.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedFormat.id === opt.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-800 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedFormat.id === opt.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow-md shadow-red-600/25 transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>

        {/* Format Summary */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Selected target:</span>
            <span className="text-slate-800 font-mono font-semibold uppercase">
              {selectedFormat.container} ({selectedFormat.quality})
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-600">{selectedFormat.sizeFormatted}</span>
          </div>

          <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Plays natively on Mobile & Laptop (H.264 + AAC MP4)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
