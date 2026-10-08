import React, { useState, useRef } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Maximize2, 
  CheckCircle2, 
  Tv, 
  Monitor, 
  Smartphone, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { extractVideoMetadataFromFile, getResolutionCategory } from '../utils/videoClientProcessing';

interface VideoResolutionCheckerPageProps {
  onNavigate: (path: string) => void;
}

export const VideoResolutionCheckerPage: React.FC<VideoResolutionCheckerPageProps> = ({
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedWidth, setDetectedWidth] = useState<number>(1920);
  const [detectedHeight, setDetectedHeight] = useState<number>(1080);
  const [hasFile, setHasFile] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      try {
        const meta = await extractVideoMetadataFromFile(file);
        setDetectedWidth(meta.width);
        setDetectedHeight(meta.height);
        setHasFile(true);
      } catch {
        setHasFile(true);
      }
    }
  };

  const currentCategory = getResolutionCategory(detectedWidth, detectedHeight);
  const totalPixels = detectedWidth * detectedHeight;
  const megapixels = (totalPixels / 1000000).toFixed(2);

  const resolutionStandards = [
    { label: '2160p (4K UHD)', dims: '3840 × 2160', pixels: '8.29 MP', ideal: 'Large 4K TVs, cinematic YouTube videos, professional video production.' },
    { label: '1440p (2K Quad HD)', dims: '2560 × 1440', pixels: '3.68 MP', ideal: 'High-end PC gaming monitors, high-density creator uploads.' },
    { label: '1080p (Full HD)', dims: '1920 × 1080', pixels: '2.07 MP', ideal: 'Global standard for laptops, YouTube, streaming, and modern smartphones.' },
    { label: '720p (HD Ready)', dims: '1280 × 720', pixels: '0.92 MP', ideal: 'Minimum definition for HD broadcasts, fast loading on mobile data.' },
    { label: '480p (Standard Definition)', dims: '854 × 480', pixels: '0.41 MP', ideal: 'DVD quality, legacy television formats, podcast video thumbnails.' },
    { label: '360p (Mobile Compact)', dims: '640 × 360', pixels: '0.23 MP', ideal: 'Ultra-low bandwidth environments and mobile quick previews.' }
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Aspect Ratio Calculator',
      path: '/aspect-ratio-calculator',
      description: 'Check display proportions like 16:9, 9:16, 4:3, and 21:9.',
      icon: '📐'
    },
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Estimate required storage based on resolution and bitrate.',
      icon: '🧮'
    },
    {
      name: 'Video Metadata Inspector',
      path: '/video-metadata',
      description: 'View codecs, bitrates, audio tracks, and container info.',
      icon: '🔍'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Compress high-resolution 4K or 1080p videos for fast sharing.',
      icon: '🗜️'
    }
  ];

  return (
    <ToolLayout
      title="Video Resolution Checker & Standard Standards Guide"
      badgeText="Display Quality Inspector"
      badgeIcon={<Maximize2 className="h-3.5 w-3.5 text-teal-600" />}
      description="Inspect video pixel dimensions or enter custom widths and heights to check exact resolution classifications from 240p up to 4K Ultra HD."
      howItWorks={{
        heading: "Understanding Video Resolutions",
        text: "Resolution defines the number of individual colored pixels that compose each frame. It is traditionally denoted by the vertical pixel count accompanied by 'p' (for progressive scan). Higher pixel counts deliver sharper image details, smoother curves, and greater clarity on large displays.",
        steps: [
          {
            number: 1,
            title: "Upload or Enter Dimensions",
            description: "Drop any video file for automated pixel detection or test custom width × height numbers."
          },
          {
            number: 2,
            title: "Check Classification",
            description: "View the official resolution standard (e.g. 1080p Full HD vs 4K UHD) and total megapixel density."
          },
          {
            number: 3,
            title: "Review Viewing Standards",
            description: "Compare recommendations for YouTube, TikTok, PC monitors, and mobile displays."
          }
        ]
      }}
      tips={[
        '1080p (1920×1080) contains more than double the total pixel data of 720p (1280×720).',
        '4K UHD (3840×2160) packs exactly 4 times the pixel count of standard 1080p Full HD.',
        'Vertical social media video (TikTok, Instagram Reels, Shorts) reverses standard dimensions to 1080×1920 (9:16).'
      ]}
      faqs={[
        {
          question: "What does the 'p' in 1080p or 720p mean?",
          answer: "The 'p' stands for progressive scan, meaning all horizontal scan lines are rendered sequentially in each frame, creating smooth motion without the interlacing flicker found in old '1080i' TV broadcasts."
        },
        {
          question: "Is 4K resolution always better than 1080p?",
          answer: "On 55-inch and larger screens, 4K provides noticeably sharper text and textures. However, on small smartphone screens, the human eye often cannot distinguish between 1080p and 4K at typical viewing distances."
        },
        {
          question: "What is 1440p (2K Quad HD)?",
          answer: "1440p refers to 2560×1440 pixels. It is called Quad HD because it contains four times the resolution of standard 720p (1280×720), making it extremely popular for high-framerate PC gaming monitors."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-6">
        {/* Upload or Manual Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden" 
            />
            <Upload className="h-6 w-6 text-teal-600 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">
              {selectedFile ? selectedFile.name : 'Upload Video to Auto-Detect'}
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedFile ? 'Click to change file' : 'Reads native width & height'}
            </span>
          </div>

          {/* Manual Width / Height */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">Or Enter Custom Dimensions (Pixels):</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  value={detectedWidth}
                  onChange={(e) => setDetectedWidth(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  value={detectedHeight}
                  onChange={(e) => setDetectedHeight(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current Classification Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-slate-50 to-white border-2 border-teal-500/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <Tv className="h-5 w-5 text-teal-600" />
              <span>Resolution Classification</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-extrabold uppercase tracking-wider">
              {currentCategory}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-teal-100">
              <span className="text-[11px] text-slate-500 block">Total Pixels</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {megapixels} MP
              </span>
              <span className="text-[10px] text-slate-400 block">{totalPixels.toLocaleString()} total pixels</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-teal-100">
              <span className="text-[11px] text-slate-500 block">Orientation</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {detectedWidth >= detectedHeight ? 'Landscape (16:9)' : 'Vertical (9:16)'}
              </span>
              <span className="text-[10px] text-slate-400 block">{detectedWidth}w × {detectedHeight}h</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-teal-100">
              <span className="text-[11px] text-slate-500 block">Viewing Grade</span>
              <span className="text-lg font-bold text-teal-700 font-mono">
                {detectedWidth >= 1920 ? 'High Definition' : detectedWidth >= 1280 ? 'Standard HD' : 'Standard Def'}
              </span>
              <span className="text-[10px] text-slate-400 block">Cross-platform ready</span>
            </div>
          </div>
        </div>

        {/* Reference Guide Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard Video Resolutions Reference Guide:
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {resolutionStandards.map((std, i) => (
              <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{std.label}</span>
                  <span className="font-mono text-slate-500 text-[11px]">({std.dims})</span>
                </div>
                <div className="text-slate-600 text-[11px] max-w-sm sm:text-right">
                  {std.ideal}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
