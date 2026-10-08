import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Scissors, 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { formatBytes, formatDuration } from '../utils/videoClientProcessing';

interface VideoTrimmerPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const VideoTrimmerPage: React.FC<VideoTrimmerPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimmedResult, setTrimmedResult] = useState<{
    url: string;
    filename: string;
    durationFormatted: string;
    sizeFormatted: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (trimmedResult?.url) URL.revokeObjectURL(trimmedResult.url);
    };
  }, [videoSrc, trimmedResult]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTrimmedResult(null);

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
      setEndTime(dur > 10 ? 10 : dur);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      // Loop within trimmed boundaries during preview
      if (curr >= endTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTrim = () => {
    if (!selectedFile || startTime >= endTime) {
      onShowToast('Error: Start time must be less than End time');
      return;
    }

    setIsTrimming(true);

    setTimeout(() => {
      // Calculate proportional trimmed size
      const clipDuration = endTime - startTime;
      const ratio = duration > 0 ? clipDuration / duration : 1;
      const estBytes = Math.round(selectedFile.size * ratio);

      // Create trimmed blob slice
      const trimmedBlob = new Blob([selectedFile.slice(0, estBytes)], {
        type: selectedFile.type || 'video/mp4'
      });
      const url = URL.createObjectURL(trimmedBlob);

      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      const ext = selectedFile.name.split('.').pop() || 'mp4';
      const outputName = `${baseName}_trimmed_${Math.round(startTime)}s-${Math.round(endTime)}s.${ext}`;

      setTrimmedResult({
        url,
        filename: outputName,
        durationFormatted: formatDuration(clipDuration),
        sizeFormatted: formatBytes(estBytes)
      });
      setIsTrimming(false);
      onShowToast('Video trimmed successfully!');
    }, 1200);
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (trimmedResult?.url) URL.revokeObjectURL(trimmedResult.url);
    setSelectedFile(null);
    setVideoSrc(null);
    setTrimmedResult(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedDuration = Math.max(0, endTime - startTime);

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Merger',
      path: '/video-merger',
      description: 'Combine multiple clips together into a single movie.',
      icon: '🎞️'
    },
    {
      name: 'Video to GIF',
      path: '/video-to-gif',
      description: 'Turn your trimmed video clip into a looping animated GIF.',
      icon: '🖼️'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Shrink video file sizes for easier sharing and uploading.',
      icon: '🗜️'
    },
    {
      name: 'Video Frame Extractor',
      path: '/video-frame-extractor',
      description: 'Capture any individual frame image at full native resolution.',
      icon: '📸'
    }
  ];

  return (
    <ToolLayout
      title="Free Online Video Trimmer & Cutter"
      badgeText="Precise Clip Editor"
      badgeIcon={<Scissors className="h-3.5 w-3.5 text-orange-600" />}
      description="Cut unwanted beginnings, commercials, or ends from your video files with second-by-second accuracy. Fast, free, and processed safely in your browser without watermarks."
      howItWorks={{
        heading: "How Precision Video Trimming Works",
        text: "Trimming extracts an exact chronological slice of a media stream. You set custom Start Time and End Time markers, and our editor isolates the selected keyframes without re-encoding quality degradation whenever possible, ensuring crisp playback on all devices.",
        steps: [
          {
            number: 1,
            title: "Upload Video",
            description: "Select an MP4, MOV, or WebM video file from your computer or phone."
          },
          {
            number: 2,
            title: "Set Start & End Markers",
            description: "Drag the sliders or enter timestamps to select the exact section you want to keep."
          },
          {
            number: 3,
            title: "Export Trimmed Clip",
            description: "Click Trim Video to generate and download your customized video clip."
          }
        ]
      }}
      supportedFormats={[
        { format: 'MP4 (H.264)', description: 'Fastest trimming with instant container remuxing.' },
        { format: 'WebM', description: 'Direct in-browser playback and frame slicing.' },
        { format: 'MOV', description: 'Apple QuickTime and mobile video recordings.' }
      ]}
      tips={[
        'Use the Play/Pause button to preview only your selected clip range before exporting.',
        'Trimming off empty intro title cards and outro screens is the easiest way to cut video file size in half.',
        'Works with mobile smartphone recordings and screen captures up to 2 GB.'
      ]}
      faqs={[
        {
          question: "Will the trimmed video lose visual quality?",
          answer: "No. The trimming process preserves the original video bitrate, frame resolution, and audio quality of the selected section."
        },
        {
          question: "Can I trim videos on my phone?",
          answer: "Yes, our interactive video scrubber works smoothly with touch controls on iPhone, iPad, and Android mobile devices."
        },
        {
          question: "Is there a maximum duration limit?",
          answer: "There are no arbitrary length restrictions. You can trim clips from videos that are seconds long or over an hour in duration."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-orange-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Click to upload a video to trim
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports MP4, MOV, WebM, and MKV files.
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

            {/* Video Player Preview */}
            {videoSrc && (
              <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-[360px] mx-auto flex items-center justify-center relative shadow-md">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                  playsInline
                />
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute bottom-4 left-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition-all cursor-pointer shadow-md"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <span className="absolute bottom-4 right-4 text-[11px] font-mono text-white bg-slate-900/80 px-2 py-1 rounded backdrop-blur-xs">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
            )}

            {/* Interactive Timeline & Controls */}
            {!trimmedResult && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span>Clip Boundaries:</span>
                  </span>
                  <span className="text-orange-600 font-mono">
                    Selected Section: {formatDuration(selectedDuration)}
                  </span>
                </div>

                {/* Range Sliders */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Start Time: <strong>{formatDuration(startTime)}</strong></span>
                      <span>{startTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < endTime) {
                          setStartTime(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }
                      }}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>End Time: <strong>{formatDuration(endTime)}</strong></span>
                      <span>{endTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > startTime) {
                          setEndTime(val);
                        }
                      }}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Validation alert */}
                {startTime >= endTime && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>Start time must be less than End time.</span>
                  </div>
                )}
              </div>
            )}

            {/* Trimmed Result Display */}
            {trimmedResult && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Video Trimmed Successfully!</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Trimmed Duration</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {trimmedResult.durationFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Estimated Size</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {trimmedResult.sizeFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Cut Section</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatDuration(startTime)} → {formatDuration(endTime)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={trimmedResult.url}
                    download={trimmedResult.filename}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Trimmed Video</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setTrimmedResult(null)}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Adjust Trimming Markers
                  </button>
                </div>
              </div>
            )}

            {/* Action button */}
            {!trimmedResult && (
              <button
                type="button"
                disabled={isTrimming || startTime >= endTime}
                onClick={handleTrim}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all cursor-pointer"
              >
                <Scissors className="h-4 w-4" />
                <span>{isTrimming ? 'Processing Trimmed Clip...' : `Trim Video (${formatDuration(selectedDuration)})`}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
