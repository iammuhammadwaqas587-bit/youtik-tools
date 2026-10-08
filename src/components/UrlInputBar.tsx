import React, { useState, useRef, useEffect } from 'react';
import { 
  Clipboard, 
  X, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Link2,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_VIDEOS, SampleVideo, extractYouTubeId } from '../utils/youtube';

interface UrlInputBarProps {
  onFetch: (urlOrId: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  onFetch,
  isLoading,
  error,
  onClearError,
}) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onFetch(inputVal.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputVal(text);
        onClearError();
        const parsedId = extractYouTubeId(text);
        if (parsedId || text.includes('tiktok.com')) {
          onFetch(text);
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleClear = () => {
    setInputVal('');
    onClearError();
    inputRef.current?.focus();
  };

  const handleSelectSample = (sample: SampleVideo) => {
    const url = `https://www.youtube.com/watch?v=${sample.id}`;
    setInputVal(url);
    onClearError();
    onFetch(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Form Container */}
      <form 
        onSubmit={handleSubmit}
        className="relative group transition-all"
      >
        <div className={`relative flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-all shadow-lg shadow-slate-200/50 ${
          error 
            ? 'border-red-500 ring-2 ring-red-100' 
            : 'border-slate-200 hover:border-slate-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-50'
        }`}>
          {/* Leading Icon */}
          <div className="pl-4 pr-2 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (error) onClearError();
            }}
            placeholder="Paste YouTube or TikTok video link (e.g., https://youtu.be/...)"
            className="w-full py-4 px-2 text-sm md:text-base bg-transparent text-slate-900 placeholder-slate-400 outline-none font-sans"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 pr-2">
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {!inputVal && (
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Paste</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Sample Quick links */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-red-500" />
          <span>Try samples:</span>
        </span>
        
        {SAMPLE_VIDEOS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className="text-xs text-slate-600 hover:text-red-600 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>{sample.channel}</span>
            <span className="text-slate-400 text-[10px]">({sample.tag})</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
          </button>
        ))}
      </div>
    </div>
  );
};
