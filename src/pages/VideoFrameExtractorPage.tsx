import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  FileText, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Loader2, 
  Sliders
} from 'lucide-react';
import { 
  formatBytes, 
  formatDuration, 
  captureVideoFrameAtTime 
} from '../utils/videoClientProcessing';

interface VideoFrameExtractorPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const VideoFrameExtractorPage: React.FC<VideoFrameExtractorPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [targetTime, setTargetTime] = useState<number>(1.0);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    timeSec: number;
    blob: Blob;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExtractedResult(null);

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      onShowToast(`Loaded: ${file.name}`);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setTargetTime(dur > 2 ? 2.0 : 0.5);
    }
  };

  const handleExtractFrame = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    try {
      const frame = await captureVideoFrameAtTime(selectedFile, targetTime, format, 0.96);
      setExtractedResult({
        dataUrl: frame.dataUrl,
        width: frame.width,
        height: frame.height,
        timeSec: targetTime,
        blob: frame.blob
      });
      onShowToast(`Frame extracted at ${formatDuration(targetTime)}!`);
    } catch (err: any) {
      onShowToast(err.message || 'Frame extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    if (!extractedResult || !selectedFile) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    const filename = `${baseName}_frame_${extractedResult.timeSec.toFixed(1)}s.${ext}`;

    const a = document.createElement('a');
    a.href = extractedResult.dataUrl;
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
    setExtractedResult(null);
    setDuration(0);
    setTargetTime(1.0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Thumbnail Extractor',
      path: '/video-thumbnail',
      description: 'Grab automated milestone keyframes at 0%, 25%, 50%, 75%, and 100%.',
      icon: '🖼️'
    },
    {
      name: 'Video to GIF',
      path: '/video-to-gif',
      description: 'Convert video scenes into animated looping GIFs.',
      icon: '🎬'
    },
    {
      name: 'Video Resolution Checker',
      path: '/video-resolution-checker',
      description: 'Verify width and height resolution standards.',
      icon: '📐'
    },
    {
      name: 'Video Metadata Inspector',
      path: '/video-metadata',
      description: 'Inspect file properties, stream codecs, and aspect ratio.',
      icon: '🔍'
    }
  ];

  return (
    <ToolLayout
      title="Free Video Frame Extractor (JPG, PNG, WebP)"
      badgeText="Native Resolution Frame Grabber"
      badgeIcon={<FileText className="h-3.5 w-3.5 text-amber-700" />}
      description="Extract high-resolution still images from any video timestamp at full pixel dimensions. Save in uncompressed PNG, standard JPG, or modern WebP format."
      howItWorks={{
        heading: "How Native Frame Extraction Works",
        text: "When extracting an individual frame, YouTik seeks directly to the target timestamp inside the hardware video decoder. It draws the raw pixel buffer onto an off-screen HTML5 Canvas at the video's full native dimensions (e.g. 1920×1080 for Full HD, 3840×2160 for 4K), avoiding screenshot blur or DPI scaling artifacts.",
        steps: [
          {
            number: 1,
            title: "Upload Video",
            description: "Select an MP4, WebM, or MOV video file from your computer or phone."
          },
          {
            number: 2,
            title: "Set Timestamp",
            description: "Drag the timeline slider or type the exact second you wish to capture."
          },
          {
            number: 3,
            title: "Export Frame",
            description: "Download your frame in full native resolution as JPG, PNG, or WebP."
          }
        ]
      }}
      supportedFormats={[
        { format: 'PNG (.png)', description: 'Lossless quality, best for charts, subtitles, and graphic elements.' },
        { format: 'JPG (.jpg)', description: 'Standard photography format with balanced compression.' },
        { format: 'WebP (.webp)', description: 'Next-gen compact web format with high fidelity.' }
      ]}
      tips={[
        'Avoid taking blurry screenshot hotkeys: our native frame extractor pulls raw decode buffers without browser UI distortion.',
        'PNG is recommended if you plan to zoom in or crop details from the extracted frame.',
        'Use the fine-tuning decimal slider to land on the exact action frame between motion blurs.'
      ]}
      faqs={[
        {
          question: "Does frame extraction lower the image resolution?",
          answer: "No. The exported picture matches the video's exact pixel dimensions (1080p yields 1920×1080 px; 4K yields 3840×2160 px)."
        },
        {
          question: "Can I enter timestamps in seconds?",
          answer: "Yes, you can use the interactive slider or enter fractional seconds (e.g., 14.5 seconds) to grab the exact frame."
        },
        {
          question: "Are my frames kept private?",
          answer: "Yes. All frame capture occurs entirely in your browser memory without uploading video data to external servers."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Click to select video for frame capture
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Extracts crystal-clear still images at original resolution.
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

            {/* Video player for preview */}
            {videoSrc && (
              <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-[320px] mx-auto flex items-center justify-center relative shadow-sm">
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

            {/* Timestamp selector */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-700" />
                  <span>Frame Timestamp:</span>
                </span>
                <span className="text-amber-700 font-mono text-sm">
                  {formatDuration(targetTime)} ({targetTime.toFixed(2)}s)
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 10}
                  step={0.05}
                  value={targetTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTargetTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-amber-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>00:00</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Format selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">Image Format:</span>
                  <div className="flex items-center gap-1.5">
                    {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormat(fmt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          format === fmt
                            ? 'bg-amber-700 text-white shadow-2xs'
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
                  disabled={isExtracting}
                  onClick={handleExtractFrame}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md shadow-amber-700/20 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isExtracting ? 'Extracting...' : 'Extract Frame Now'}</span>
                </button>
              </div>
            </div>

            {/* Extracted Frame Result */}
            {extractedResult && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Frame Extracted at Native Resolution ({extractedResult.width} × {extractedResult.height} px)!</span>
                </div>

                <div className="rounded-xl overflow-hidden bg-black border border-slate-200 max-h-[360px] flex items-center justify-center">
                  <img
                    src={extractedResult.dataUrl}
                    alt="Extracted frame"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600">
                    Resolution: <strong>{extractedResult.width} × {extractedResult.height} px</strong> · Format: <strong className="uppercase">{format === 'image/jpeg' ? 'JPG' : format === 'image/png' ? 'PNG' : 'WebP'}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Native Image Frame</span>
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
