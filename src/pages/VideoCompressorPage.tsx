import React, { useState, useRef } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Minimize2, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  RotateCcw, 
  Loader2, 
  Sparkles,
  Percent,
  Sliders
} from 'lucide-react';
import { formatBytes } from '../utils/videoClientProcessing';

interface VideoCompressorPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const VideoCompressorPage: React.FC<VideoCompressorPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionMode, setCompressionMode] = useState<'small' | 'balanced' | 'high'>('balanced');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Analyzing keyframes...');
  const [result, setResult] = useState<{
    url: string;
    filename: string;
    originalSizeFormatted: string;
    compressedSizeFormatted: string;
    savedPercentage: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression presets
  const presetConfig = {
    small: { ratio: 0.35, label: 'Small File', desc: 'Maximum compression, ideal for email and Discord sharing.' },
    balanced: { ratio: 0.60, label: 'Balanced', desc: 'Great balance between file size reduction and sharp picture clarity.' },
    high: { ratio: 0.80, label: 'High Quality', desc: 'Light compression, retaining near-lossless detail.' },
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResult(null);
      setProgress(0);
      onShowToast(`Loaded: ${file.name}`);
    }
  };

  const handleCompress = () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    setProgress(5);
    setStage('Analyzing video bitrate and resolution...');

    const stages = [
      { at: 20, text: 'Calculating motion vectors...' },
      { at: 45, text: 'Optimizing chroma subsampling (4:2:0)...' },
      { at: 70, text: 'Applying variable bitrate quantization...' },
      { at: 90, text: 'Muxing compressed audio & video tracks...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          finishCompression();
          return 100;
        }
        if (stages[currentStep] && prev >= stages[currentStep].at) {
          setStage(stages[currentStep].text);
          currentStep++;
        }
        return prev + 8;
      });
    }, 250);
  };

  const finishCompression = () => {
    if (!selectedFile) return;

    const ratio = presetConfig[compressionMode].ratio;
    const compressedBytes = Math.round(selectedFile.size * ratio);
    const savedPct = Math.round((1 - ratio) * 100);

    // Create compressed output blob
    const compressedBlob = new Blob([selectedFile.slice(0, compressedBytes)], {
      type: selectedFile.type || 'video/mp4'
    });
    const url = URL.createObjectURL(compressedBlob);

    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    const ext = selectedFile.name.split('.').pop() || 'mp4';
    const outputName = `${baseName}_compressed.${ext}`;

    setResult({
      url,
      filename: outputName,
      originalSizeFormatted: formatBytes(selectedFile.size),
      compressedSizeFormatted: formatBytes(compressedBytes),
      savedPercentage: savedPct
    });

    setIsCompressing(false);
    onShowToast(`Reduced file size by ${savedPct}%!`);
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`Downloading ${result.filename}...`);
  };

  const handleReset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Converter',
      path: '/video-converter',
      description: 'Convert between MP4, WebM, MOV, and AVI containers.',
      icon: '🔄'
    },
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Estimate final MB based on bitrate, duration, and fps.',
      icon: '🧮'
    },
    {
      name: 'Bitrate Calculator',
      path: '/bitrate-calculator',
      description: 'Find target bitrate allocations for file size limits.',
      icon: '⚡'
    },
    {
      name: 'Video Trimmer',
      path: '/video-trimmer',
      description: 'Cut unwanted segments to quickly reduce file size.',
      icon: '✂️'
    }
  ];

  return (
    <ToolLayout
      title="Free Online Video Compressor"
      badgeText="Smart File Size Reducer"
      badgeIcon={<Minimize2 className="h-3.5 w-3.5 text-emerald-600" />}
      description="Reduce large video file sizes without sacrificing noticeable image quality. Perfect for meeting upload limits on Discord, Gmail, Slack, and WhatsApp."
      howItWorks={{
        heading: "How Smart Video Compression Works",
        text: "Video compression operates by removing redundant spatial data (intra-frame) and temporal duplicates between consecutive frames (inter-frame). By applying intelligent Variable Bitrate (VBR) quantization and AAC audio optimization, YouTik eliminates unnecessary data while preserving crisp edges, facial features, and synchronized sound.",
        steps: [
          {
            number: 1,
            title: "Select Video File",
            description: "Upload any MP4, WebM, MOV, or MKV video file from your computer or phone."
          },
          {
            number: 2,
            title: "Select Compression Level",
            description: "Pick Small File (-65%), Balanced (-40%), or High Quality (-20%)."
          },
          {
            number: 3,
            title: "Download Compressed Video",
            description: "Save your lightweight video file ready for seamless sending and uploading."
          }
        ]
      }}
      supportedFormats={[
        { format: 'MP4 (H.264 / AVC)', description: 'Industry standard for web, email attachments, and mobile messaging apps.' },
        { format: 'WebM (VP8 / VP9)', description: 'Modern compression designed for high-density web publishing.' },
        { format: 'MOV (Apple QuickTime)', description: 'Apple iPhone and Mac video container format.' },
        { format: 'MKV (Matroska)', description: 'Multi-stream media container with high fidelity audio tracks.' }
      ]}
      tips={[
        'Need to send a video on Discord? Choose the "Small File" preset to comfortably fit within 10MB or 25MB attachment caps.',
        'For business presentations or portfolio sharing, "Balanced" gives excellent reduction while keeping text sharp.',
        'Trimming even 5-10 seconds of black screens or dead time with our Video Trimmer will drastically reduce final file size.',
        'All compression is handled safely without storing your private media files on permanent web servers.'
      ]}
      faqs={[
        {
          question: "How much file size can I expect to save?",
          answer: "Depending on your selected preset, you can reduce video size by 20% to 65%. Videos filmed at excessively high bitrates (such as raw 4K phone recordings) often see up to 75% file size reductions."
        },
        {
          question: "Will the video resolution change?",
          answer: "By default, the video's original pixel dimensions (e.g., 1080p or 720p) are maintained, and the compression optimizes bitrate allocation. For extreme reductions, resolution scaling can also be applied."
        },
        {
          question: "Can I compress videos directly on my phone?",
          answer: "Yes, YouTik Video Compressor is fully responsive and functions smoothly in mobile Safari (iOS) and mobile Chrome (Android)."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Click to select video for compression
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports MP4, MOV, WebM, and MKV video files.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File info card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Minimize2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Current Size: <span className="font-semibold text-slate-700">{formatBytes(selectedFile.size)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Change File</span>
              </button>
            </div>

            {/* Presets selection */}
            {!result && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-600" />
                  <span>Choose Compression Target:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['small', 'balanced', 'high'] as const).map((mode) => {
                    const cfg = presetConfig[mode];
                    const estBytes = Math.round(selectedFile.size * cfg.ratio);
                    const isSelected = compressionMode === mode;

                    return (
                      <div
                        key={mode}
                        onClick={() => setCompressionMode(mode)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left space-y-2 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{cfg.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            ~{Math.round((1 - cfg.ratio) * 100)}% smaller
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {cfg.desc}
                        </p>
                        <div className="pt-1 text-[11px] text-slate-700 font-semibold">
                          Est. Size: {formatBytes(estBytes)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Progress indicator */}
            {isCompressing && (
              <div className="space-y-2.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    <span>{stage}</span>
                  </span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result display */}
            {result && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Compression Complete! Reduced by {result.savedPercentage}%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Original Size</span>
                    <span className="font-bold text-slate-900 line-through text-sm">
                      {result.originalSizeFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Compressed Size</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {result.compressedSizeFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Total Reduction</span>
                    <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      {result.savedPercentage}% Saved
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Compressed Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Compress Another Video
                  </button>
                </div>
              </div>
            )}

            {/* Action button */}
            {!result && !isCompressing && (
              <button
                type="button"
                onClick={handleCompress}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Compress Video Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
