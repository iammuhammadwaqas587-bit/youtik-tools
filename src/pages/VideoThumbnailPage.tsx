import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Loader2, 
  Eye
} from 'lucide-react';
import { 
  formatBytes, 
  formatDuration, 
  captureThumbnailIntervals,
  captureVideoFrameAtTime
} from '../utils/videoClientProcessing';

interface VideoThumbnailPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

interface ThumbnailCandidate {
  label: string;
  percent: number;
  timeSec: number;
  dataUrl: string;
  blob: Blob;
}

export const VideoThumbnailPage: React.FC<VideoThumbnailPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [customTime, setCustomTime] = useState<number>(0);
  const [candidates, setCandidates] = useState<ThumbnailCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ThumbnailCandidate | null>(null);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setCandidates([]);
      setSelectedCandidate(null);
      setIsExtracting(true);
      onShowToast(`Scanning frames in ${file.name}...`);

      try {
        const intervalThumbs = await captureThumbnailIntervals(file);
        setCandidates(intervalThumbs);
        if (intervalThumbs.length > 0) {
          setSelectedCandidate(intervalThumbs[1] || intervalThumbs[0]);
        }
      } catch (err) {
        console.error('Interval scan error', err);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleCaptureCustomTime = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    try {
      const frame = await captureVideoFrameAtTime(selectedFile, customTime, format, 0.95);
      const customCandidate: ThumbnailCandidate = {
        label: `Custom Frame (${formatDuration(customTime)})`,
        percent: Math.round((customTime / (duration || 1)) * 100),
        timeSec: customTime,
        dataUrl: frame.dataUrl,
        blob: frame.blob,
      };
      setCandidates(prev => [customCandidate, ...prev]);
      setSelectedCandidate(customCandidate);
      onShowToast('Captured custom frame!');
    } catch {
      onShowToast('Failed to grab frame at selected timestamp.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    if (!selectedCandidate || !selectedFile) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    const filename = `${baseName}_thumbnail_${Math.round(selectedCandidate.timeSec)}s.${ext}`;

    const a = document.createElement('a');
    a.href = selectedCandidate.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`Downloaded ${filename}!`);
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setSelectedFile(null);
    setVideoSrc(null);
    setCandidates([]);
    setSelectedCandidate(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Frame Extractor',
      path: '/video-frame-extractor',
      description: 'Capture any individual frame at full native resolution.',
      icon: '📸'
    },
    {
      name: 'Aspect Ratio Calculator',
      path: '/aspect-ratio-calculator',
      description: 'Check 16:9 or 9:16 dimensions for YouTube & TikTok covers.',
      icon: '📐'
    },
    {
      name: 'Video to GIF',
      path: '/video-to-gif',
      description: 'Create an animated preview snippet instead of a static image.',
      icon: '🖼️'
    },
    {
      name: 'Video Metadata Inspector',
      path: '/video-metadata',
      description: 'Check video resolution, codecs, and container information.',
      icon: '🔍'
    }
  ];

  return (
    <ToolLayout
      title="Free Video Thumbnail Extractor"
      badgeText="Cover Artwork & Frame Picker"
      badgeIcon={<ImageIcon className="h-3.5 w-3.5 text-red-500" />}
      description="Extract crisp cover photos and thumbnails from your videos at 0%, 25%, 50%, 75%, and 100%, or scrub to any custom timestamp. Export in high-res JPG, PNG, or WebP."
      howItWorks={{
        heading: "How Thumbnail Extraction Works",
        text: "Video thumbnails are high-resolution still photographs pulled directly from internal keyframe streams (I-frames). YouTik decodes the video frame buffer in your browser and exports pixel-perfect images at native video resolution (up to 4K 3840×2160) without lossy compression.",
        steps: [
          {
            number: 1,
            title: "Upload Video",
            description: "Select any video from your computer or phone camera roll."
          },
          {
            number: 2,
            title: "Choose Frame",
            description: "Pick from auto-extracted milestones (0%, 25%, 50%, 75%, 100%) or scrub the timeline."
          },
          {
            number: 3,
            title: "Download Image",
            description: "Select your image format (JPG, PNG, WebP) and download your thumbnail."
          }
        ]
      }}
      supportedFormats={[
        { format: 'JPEG (.jpg)', description: 'Standard format for YouTube video thumbnails and web publishing.' },
        { format: 'PNG (.png)', description: 'Lossless format preserving razor-sharp text overlays and graphics.' },
        { format: 'WebP (.webp)', description: 'Next-gen image format with ultra-compact file sizes.' }
      ]}
      tips={[
        'YouTube recommends 1280×720 (16:9) thumbnails with file sizes under 2 MB.',
        'Frames captured at the 25% or 50% mark often have the best action shots and facial expressions.',
        'Use PNG format if your video contains high-contrast graphic overlays or text slides.'
      ]}
      faqs={[
        {
          question: "What resolution will my extracted thumbnail be?",
          answer: "Thumbnails are extracted at the video's exact native resolution. If you upload a 1080p video, your thumbnail will be 1920×1080; for a 4K video, it will be 3840×2160."
        },
        {
          question: "Can I choose an exact millisecond timestamp?",
          answer: "Yes. Use the Custom Frame Scrubber slider to pause at any exact moment in the video and click 'Capture Frame'."
        },
        {
          question: "Are my thumbnails watermarked?",
          answer: "No. YouTik never adds watermarks or logos to any extracted images."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-red-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-red-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              Click to select video for thumbnail extraction
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Extracts high-resolution JPG, PNG, and WebP still images.
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
                  {formatBytes(selectedFile.size)} · Duration: {formatDuration(duration)}
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

            {/* Hidden video tag for duration and seek operations */}
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration || 0);
                  setCustomTime(Math.round((e.currentTarget.duration || 0) * 0.3));
                }}
                className="hidden"
              />
            )}

            {/* Loading Indicator */}
            {isExtracting && (
              <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                <span>Extracting high-resolution video frames...</span>
              </div>
            )}

            {/* Preview of currently selected thumbnail */}
            {selectedCandidate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Selected Cover Frame:</span>
                  <span className="text-red-600 font-mono">{selectedCandidate.label}</span>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-sm relative group max-h-[380px] flex items-center justify-center">
                  <img
                    src={selectedCandidate.dataUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-900/80 text-white font-mono text-[11px] backdrop-blur-xs">
                      {formatDuration(selectedCandidate.timeSec)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone Candidates Grid */}
            {candidates.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Frame Milestone:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {candidates.map((cand, idx) => {
                    const isSelected = selectedCandidate?.timeSec === cand.timeSec;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCandidate(cand)}
                        className={`rounded-xl border-2 overflow-hidden transition-all cursor-pointer group bg-slate-100 relative ${
                          isSelected
                            ? 'border-red-600 ring-2 ring-red-100'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={cand.dataUrl}
                            alt={cand.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-1.5 bg-white text-center">
                          <span className="text-[10px] font-bold text-slate-800 block truncate">
                            {cand.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom scrubber */}
            {duration > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-slate-500" />
                    <span>Scrub to Custom Timestamp:</span>
                  </span>
                  <span className="font-mono text-slate-900">{formatDuration(customTime)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={customTime}
                    onChange={(e) => setCustomTime(parseFloat(e.target.value))}
                    className="flex-1 accent-red-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleCaptureCustomTime}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Capture
                  </button>
                </div>
              </div>
            )}

            {/* Export Format & Download */}
            {selectedCandidate && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Output Image Format:</span>
                    <div className="flex items-center gap-1.5">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            format === fmt 
                              ? 'bg-red-600 text-white shadow-2xs' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {fmt === 'image/jpeg' ? 'JPG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Thumbnail ({format === 'image/jpeg' ? 'JPG' : format === 'image/png' ? 'PNG' : 'WebP'})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
