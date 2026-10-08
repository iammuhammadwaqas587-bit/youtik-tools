import React, { useState, useRef } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Info, 
  Copy, 
  Check, 
  RotateCcw, 
  Loader2, 
  Code, 
  FileCheck,
  Maximize2,
  Clock,
  Gauge,
  Film
} from 'lucide-react';
import { extractVideoMetadataFromFile, VideoMetadataDetails } from '../utils/videoClientProcessing';

interface VideoMetadataPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const VideoMetadataPage: React.FC<VideoMetadataPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMetadataDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsLoading(true);
      onShowToast(`Analyzing ${file.name}...`);

      try {
        const details = await extractVideoMetadataFromFile(file);
        setMeta(details);
        onShowToast('Metadata extracted successfully!');
      } catch (err: any) {
        onShowToast(err.message || 'Failed to inspect video headers.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyAll = () => {
    if (!meta) return;
    const text = `
Video Metadata Summary:
-------------------------
Filename: ${meta.filename}
File Size: ${meta.fileSizeFormatted} (${meta.fileSize} bytes)
Duration: ${meta.durationFormatted} (${meta.duration.toFixed(2)} seconds)
Dimensions: ${meta.width} × ${meta.height} px
Resolution: ${meta.resolutionLabel}
Aspect Ratio: ${meta.aspectRatio} (${meta.aspectRatioDecimal.toFixed(3)})
Approx Bitrate: ${meta.approxBitrateKbps} kbps
Container / Format: ${meta.format}
MIME Type: ${meta.mimeType}
Audio Stream Present: ${meta.hasAudio ? 'Yes' : 'No'}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
    onShowToast('Copied full metadata to clipboard!');
  };

  const handleCopyJson = () => {
    if (!meta) return;
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
    setCopiedKey('json');
    setTimeout(() => setCopiedKey(null), 2000);
    onShowToast('Copied JSON metadata to clipboard!');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Resolution Checker',
      path: '/video-resolution-checker',
      description: 'Check resolution standards from 240p to 4K UHD.',
      icon: '📐'
    },
    {
      name: 'Aspect Ratio Calculator',
      path: '/aspect-ratio-calculator',
      description: 'Calculate 16:9, 9:16, 4:3, and custom display ratios.',
      icon: '📏'
    },
    {
      name: 'Bitrate Calculator',
      path: '/bitrate-calculator',
      description: 'Calculate video and audio bitrate distribution.',
      icon: '⚡'
    },
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Estimate file size based on bitrate and duration.',
      icon: '🧮'
    }
  ];

  return (
    <ToolLayout
      title="Video Metadata Inspector & Stream Analyzer"
      badgeText="Technical File Inspection"
      badgeIcon={<Info className="h-3.5 w-3.5 text-blue-600" />}
      description="Inspect video headers and technical stream specifications. Read file size, duration, container format, pixel resolution, aspect ratio, audio channels, and estimated bitrate without uploading to a server."
      howItWorks={{
        heading: "How Browser-Based Metadata Extraction Works",
        text: "Media containers (such as MP4, WebM, and MOV) contain header atoms (like 'moov' and 'trak' in QuickTime/ISO BMFF or EBML elements in Matroska) that store essential stream descriptors before audio/video data packets. YouTik parses these header atoms directly inside your browser memory using HTML5 media decoding pipelines.",
        steps: [
          {
            number: 1,
            title: "Upload Video File",
            description: "Select any video from your computer or phone for immediate inspection."
          },
          {
            number: 2,
            title: "View Technical Specs",
            description: "Review comprehensive video specifications displayed in clean, structured cards."
          },
          {
            number: 3,
            title: "Copy or Export",
            description: "Copy all metrics in formatted text or as structured JSON with one click."
          }
        ]
      }}
      supportedFormats={[
        { format: 'MP4 / M4V', description: 'ISO Base Media File Format with H.264/H.265 video and AAC audio.' },
        { format: 'WebM', description: 'Matroska-based container with VP8/VP9/AV1 video and Opus audio.' },
        { format: 'MOV', description: 'Apple QuickTime container structure with multi-track descriptors.' },
        { format: 'MKV', description: 'Flexible Matroska container with rich chapter and subtitle metadata.' }
      ]}
      tips={[
        'Need to verify whether a video is true 1080p or upscaled 720p? Check the exact pixel width and height metrics.',
        'Use "Copy as JSON" if you need to paste video specifications into developer APIs or documentation.',
        'No files leave your computer—analysis runs 100% client-side in browser memory.'
      ]}
      faqs={[
        {
          question: "Can I inspect videos without uploading them to a remote server?",
          answer: "Yes! All header analysis runs locally in your web browser through HTML5 Video and File APIs, guaranteeing total privacy."
        },
        {
          question: "How is the approximate bitrate calculated?",
          answer: "The total bitrate is derived from the formula: (Total File Size in bits) / (Duration in seconds). This gives the true average data rate per second."
        },
        {
          question: "Why does aspect ratio matter for social media?",
          answer: "YouTube and laptops standardly use 16:9 landscape, while TikTok, Instagram Reels, and YouTube Shorts require 9:16 vertical video. Inspecting your aspect ratio ensures your video won't get black pillarbox bars."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-105 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Click to select video for metadata inspection
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Reads resolution, codecs, duration, aspect ratio, and bitrates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Inspected locally via browser memory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Inspect Another Video</span>
              </button>
            </div>

            {isLoading && (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Reading video atoms and headers...</span>
              </div>
            )}

            {/* Metadata Cards Grid */}
            {meta && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    Technical Specifications:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedKey === 'all' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'all' ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedKey === 'json' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Code className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'json' ? 'Copied JSON!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Resolution</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.width} × {meta.height}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">{meta.resolutionLabel}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Aspect Ratio</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.aspectRatio}
                    </span>
                    <span className="text-[10px] text-slate-500">({meta.aspectRatioDecimal.toFixed(3)}:1)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Duration</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.durationFormatted}
                    </span>
                    <span className="text-[10px] text-slate-500">{meta.duration.toFixed(1)} seconds</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">File Size</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.fileSizeFormatted}
                    </span>
                    <span className="text-[10px] text-slate-500">{meta.fileSize.toLocaleString()} bytes</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Approx. Bitrate</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.approxBitrateKbps} kbps
                    </span>
                    <span className="text-[10px] text-slate-500">{(meta.approxBitrateKbps / 1000).toFixed(2)} Mbps</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Format</span>
                    <span className="font-bold text-slate-900 text-sm block uppercase">
                      {meta.format}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">{meta.mimeType}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Audio Track</span>
                    <span className="font-bold text-emerald-700 text-sm block">
                      {meta.hasAudio ? 'Detected' : 'Silent'}
                    </span>
                    <span className="text-[10px] text-slate-500">Integrated stream</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Orientation</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {meta.width >= meta.height ? 'Landscape' : 'Vertical'}
                    </span>
                    <span className="text-[10px] text-slate-500">{meta.width >= meta.height ? '16:9 Standard' : '9:16 Mobile'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
