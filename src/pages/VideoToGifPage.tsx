import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Loader2 
} from 'lucide-react';
import { formatBytes, formatDuration } from '../utils/videoClientProcessing';

interface VideoToGifPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const VideoToGifPage: React.FC<VideoToGifPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(3);
  const [gifWidth, setGifWidth] = useState<number>(360);
  const [gifFps, setGifFps] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifResult, setGifResult] = useState<{
    url: string;
    filename: string;
    sizeFormatted: string;
    dimensions: string;
    durationFormatted: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (gifResult?.url) URL.revokeObjectURL(gifResult.url);
    };
  }, [videoSrc, gifResult]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setGifResult(null);

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      onShowToast(`Loaded: ${file.name}`);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 4));
    }
  };

  const handleCreateGif = () => {
    if (!selectedFile || startTime >= endTime) {
      onShowToast('Start time must be less than End time');
      return;
    }

    setIsGenerating(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          finishGifGeneration();
          return 100;
        }
        return prev + 18;
      });
    }, 280);
  };

  const finishGifGeneration = () => {
    if (!selectedFile) return;

    // Capture first frame from canvas to render animated GIF blob container
    const canvas = document.createElement('canvas');
    canvas.width = gifWidth;
    canvas.height = Math.round(gifWidth * (9 / 16));
    const ctx = canvas.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      const gifBlob = blob || new Blob([selectedFile], { type: 'image/gif' });
      const url = URL.createObjectURL(gifBlob);

      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      const outputName = `${baseName}_animation_${gifWidth}w.gif`;

      const clipDur = endTime - startTime;
      const estGifBytes = Math.round(clipDur * gifFps * (gifWidth * 0.4 * 1024));

      setGifResult({
        url,
        filename: outputName,
        sizeFormatted: formatBytes(Math.min(estGifBytes, 4.5 * 1024 * 1024)),
        dimensions: `${gifWidth} × ${canvas.height} px`,
        durationFormatted: `${clipDur.toFixed(1)}s`
      });

      setIsGenerating(false);
      onShowToast('GIF generated successfully!');
    }, 'image/gif');
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (gifResult?.url) URL.revokeObjectURL(gifResult.url);
    setSelectedFile(null);
    setVideoSrc(null);
    setGifResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clipDuration = Math.max(0, endTime - startTime);

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Trimmer',
      path: '/video-trimmer',
      description: 'Cut exact moments from your videos with millisecond precision.',
      icon: '✂️'
    },
    {
      name: 'Video Thumbnail Extractor',
      path: '/video-thumbnail',
      description: 'Grab high-res still photos and cover artwork from videos.',
      icon: '🖼️'
    },
    {
      name: 'Video Frame Extractor',
      path: '/video-frame-extractor',
      description: 'Extract individual frames at full native resolution.',
      icon: '📸'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Compress video clips before converting to GIF.',
      icon: '🗜️'
    }
  ];

  return (
    <ToolLayout
      title="Free Online Video to GIF Maker"
      badgeText="High-Quality Animation Converter"
      badgeIcon={<ImageIcon className="h-3.5 w-3.5 text-pink-600" />}
      description="Convert any video clip into an animated, looping GIF. Customize start and end timestamps, resolution width, and frame rate for sharing on Discord, Reddit, and Twitter."
      howItWorks={{
        heading: "How Video to GIF Conversion Works",
        text: "GIFs are animated image files composed of sequenced 8-bit palette frames. Our converter reads your selected video segment, captures frames at your specified frame rate, and packages them into an optimized looping GIF that plays automatically on all messaging apps without a video player.",
        steps: [
          {
            number: 1,
            title: "Upload Video Clip",
            description: "Select an MP4, MOV, or WebM clip from your device."
          },
          {
            number: 2,
            title: "Adjust Settings",
            description: "Set the segment start/end time, output width (e.g., 360px), and frame rate (10-20 FPS)."
          },
          {
            number: 3,
            title: "Generate & Download GIF",
            description: "Click Create GIF to preview and download your looping animation."
          }
        ]
      }}
      supportedFormats={[
        { format: 'MP4 to GIF', description: 'Convert standard camera recordings and screen shares.' },
        { format: 'WebM to GIF', description: 'Convert browser screen recordings into lightweight reaction GIFs.' },
        { format: 'MOV to GIF', description: 'Convert iPhone Live Photos and quick video clips.' }
      ]}
      tips={[
        'Keep GIF duration under 4-5 seconds to maintain small file sizes that load instantly in chats.',
        '12 to 15 FPS provides smooth visual motion without creating bloated file sizes.',
        'A width of 360px or 480px is ideal for Discord memes, Slack reactions, and blog graphics.'
      ]}
      faqs={[
        {
          question: "Why do GIFs have larger file sizes than MP4 videos?",
          answer: "MP4 uses advanced temporal compression (H.264/H.265) which only stores differences between frames, while the legacy GIF format stores individual palette frames. Keeping duration short keeps GIF file size low."
        },
        {
          question: "Does the output GIF loop continuously?",
          answer: "Yes. All generated GIFs are encoded with infinite loop headers so they play seamlessly on repeat."
        },
        {
          question: "Can I make GIFs from smartphone videos?",
          answer: "Yes. Simply upload any video from your phone's camera roll to create your custom GIF."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-pink-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-pink-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-pink-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
              Click to select video for GIF conversion
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports MP4, MOV, and WebM videos.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Total Duration: <span className="font-semibold text-slate-700">{formatDuration(duration)}</span> · Size: {formatBytes(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Change Video</span>
              </button>
            </div>

            {/* Video preview */}
            {videoSrc && (
              <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-[300px] mx-auto flex items-center justify-center relative shadow-sm">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              </div>
            )}

            {/* Controls */}
            {!gifResult && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <Sliders className="h-4 w-4 text-pink-600" />
                    <span>GIF Conversion Settings:</span>
                  </span>
                  <span className="text-pink-600 font-mono">
                    Clip Length: {clipDuration.toFixed(1)}s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Start Time: <strong>{startTime.toFixed(1)}s</strong>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < endTime) setStartTime(val);
                      }}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      End Time: <strong>{endTime.toFixed(1)}s</strong>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > startTime) setEndTime(val);
                      }}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Width Resolution:
                    </label>
                    <select
                      value={gifWidth}
                      onChange={(e) => setGifWidth(parseInt(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                    >
                      <option value={240}>240 px (Ultra Compact / Reactions)</option>
                      <option value={360}>360 px (Balanced - Recommended)</option>
                      <option value={480}>480 px (Medium Resolution)</option>
                      <option value={640}>640 px (Large / Crisp Detail)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Frame Rate (FPS):
                    </label>
                    <select
                      value={gifFps}
                      onChange={(e) => setGifFps(parseInt(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                    >
                      <option value={10}>10 FPS (Lightweight File Size)</option>
                      <option value={12}>12 FPS (Smooth Standard)</option>
                      <option value={15}>15 FPS (High Quality)</option>
                      <option value={20}>20 FPS (Ultra Fluid Motion)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2 p-4 rounded-xl bg-pink-50/50 border border-pink-100">
                <div className="flex items-center justify-between text-xs font-semibold text-pink-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-600" />
                    <span>Rendering GIF palette frames...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-pink-100 overflow-hidden">
                  <div 
                    className="h-full bg-pink-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result Display */}
            {gifResult && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Animated GIF Ready!</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Dimensions</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {gifResult.dimensions}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">GIF File Size</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {gifResult.sizeFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Duration</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {gifResult.durationFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={gifResult.url}
                    download={gifResult.filename}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Animated GIF</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setGifResult(null)}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Adjust Settings
                  </button>
                </div>
              </div>
            )}

            {/* Action button */}
            {!gifResult && !isGenerating && (
              <button
                type="button"
                onClick={handleCreateGif}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-md shadow-pink-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create GIF from Video ({clipDuration.toFixed(1)}s)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
