import React, { useState } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Maximize2, 
  Tv, 
  Smartphone, 
  Monitor, 
  Film, 
  Square, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { calculateAspectRatioString } from '../utils/videoClientProcessing';

interface AspectRatioCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const AspectRatioCalculatorPage: React.FC<AspectRatioCalculatorPageProps> = ({
  onNavigate,
}) => {
  // Mode 1: Calculate ratio from width & height
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);

  // Mode 2: Calculate missing dimension from known ratio
  const [selectedPresetRatio, setSelectedPresetRatio] = useState<string>('16:9');
  const [knownDimension, setKnownDimension] = useState<'width' | 'height'>('width');
  const [knownValue, setKnownValue] = useState<number>(1280);

  // Calculate ratio
  const ratioString = calculateAspectRatioString(width, height);
  const decimalRatio = width > 0 && height > 0 ? (width / height).toFixed(3) : '1.778';

  // Calculate missing dimension
  const calculateMissing = () => {
    const [rw, rh] = selectedPresetRatio.split(':').map(Number);
    if (!rw || !rh) return 720;
    if (knownDimension === 'width') {
      return Math.round((knownValue * rh) / rw);
    } else {
      return Math.round((knownValue * rw) / rh);
    }
  };

  const calculatedMissingValue = calculateMissing();

  const commonRatios = [
    { ratio: '16:9', name: 'Widescreen Standard', usage: 'YouTube, laptops, desktop monitors, standard HDTV.' },
    { ratio: '9:16', name: 'Vertical Mobile', usage: 'TikTok, Instagram Reels, YouTube Shorts, Snapchat.' },
    { ratio: '1:1', name: 'Square', usage: 'Instagram Feed posts, Facebook mobile carousel ads.' },
    { ratio: '4:3', name: 'Classic Television', usage: 'Standard definition displays, iPad screens, retro gaming.' },
    { ratio: '21:9', name: 'Cinematic Ultrawide', usage: 'Anamorphic film format, curved ultrawide gaming monitors.' },
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Resolution Checker',
      path: '/video-resolution-checker',
      description: 'Check resolution standards from 360p up to 4K UHD.',
      icon: '📐'
    },
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Estimate video file size based on bitrate and duration.',
      icon: '🧮'
    },
    {
      name: 'Video Trimmer',
      path: '/video-trimmer',
      description: 'Cut start or end points to create shorter clips.',
      icon: '✂️'
    },
    {
      name: 'Video Frame Extractor',
      path: '/video-frame-extractor',
      description: 'Grab full-resolution still images from any timestamp.',
      icon: '📸'
    }
  ];

  return (
    <ToolLayout
      title="Aspect Ratio Calculator & Dimensions Tool"
      badgeText="Proportional Dimension Solver"
      badgeIcon={<Maximize2 className="h-3.5 w-3.5 text-blue-700" />}
      description="Calculate video aspect ratios from custom pixel dimensions or calculate missing width/height values for 16:9 (YouTube), 9:16 (TikTok), 1:1, 4:3, and 21:9 displays."
      howItWorks={{
        heading: "What is an Aspect Ratio?",
        text: "An aspect ratio is the proportional relationship between the width and height of a display or video frame. It is represented as two numbers separated by a colon (e.g. 16:9). The ratio is independent of physical screen size; a 6-inch phone and an 85-inch television can share the exact same 16:9 aspect ratio.",
        steps: [
          {
            number: 1,
            title: "Enter Width and Height",
            description: "Type pixel counts (such as 1920 and 1080) to compute the simplified aspect ratio."
          },
          {
            number: 2,
            title: "Calculate Missing Dimension",
            description: "Select a target ratio (e.g. 16:9) and enter a width to immediately compute the required height."
          },
          {
            number: 3,
            title: "Match Platform Standards",
            description: "Verify dimensions against social media standards for YouTube, TikTok, and Instagram."
          }
        ]
      }}
      tips={[
        'Posting 16:9 videos on TikTok or Instagram Reels results in large black bars on top and bottom; use 9:16 (1080×1920) for full-screen immersive playback.',
        'When uploading to YouTube, always stick to 16:9 to avoid pillarboxing on computers and TVs.',
        'Use the Missing Dimension Calculator when resizing images or setting up canvas sizes in Photoshop or Premiere Pro.'
      ]}
      faqs={[
        {
          question: "How do I calculate an aspect ratio manually?",
          answer: "Divide width and height by their greatest common divisor (GCD). For 1920×1080, the GCD is 120 (1920÷120 = 16, 1080÷120 = 9), producing 16:9."
        },
        {
          question: "What is the difference between 16:9 and 9:16?",
          answer: "16:9 is horizontal landscape orientation (wider than tall), whereas 9:16 is vertical portrait orientation (taller than wide)."
        },
        {
          question: "What is the aspect ratio of 4K video?",
          answer: "Standard 4K UHD (3840×2160) has a 16:9 aspect ratio. DCI 4K (4096×2160) used in digital cinema has a slightly wider ~1.90:1 (256:135) aspect ratio."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-8">
        {/* Tool Section 1: Calculate Ratio from Width × Height */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              1. Calculate Aspect Ratio from Custom Dimensions
            </h2>
            <span className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md">
              Ratio: {ratioString} ({decimalRatio}:1)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Width (Pixels):
              </label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Height (Pixels):
              </label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick presets:</span>
            <button
              type="button"
              onClick={() => { setWidth(1920); setHeight(1080); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
            >
              1920×1080 (16:9)
            </button>
            <button
              type="button"
              onClick={() => { setWidth(1080); setHeight(1920); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
            >
              1080×1920 (9:16)
            </button>
            <button
              type="button"
              onClick={() => { setWidth(1080); setHeight(1080); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
            >
              1080×1080 (1:1)
            </button>
            <button
              type="button"
              onClick={() => { setWidth(3840); setHeight(2160); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
            >
              3840×2160 (4K 16:9)
            </button>
            <button
              type="button"
              onClick={() => { setWidth(2560); setHeight(1080); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
            >
              2560×1080 (21:9)
            </button>
          </div>
        </div>

        {/* Tool Section 2: Calculate Missing Dimension */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              2. Calculate Missing Dimension (Resize Solver)
            </h2>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
              Target: {selectedPresetRatio}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Target Aspect Ratio:
              </label>
              <select
                value={selectedPresetRatio}
                onChange={(e) => setSelectedPresetRatio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
              >
                <option value="16:9">16:9 (Landscape YouTube)</option>
                <option value="9:16">9:16 (Vertical TikTok / Reels)</option>
                <option value="1:1">1:1 (Square Instagram)</option>
                <option value="4:3">4:3 (Classic TV / iPad)</option>
                <option value="21:9">21:9 (Ultrawide Cinema)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Known Dimension:
              </label>
              <select
                value={knownDimension}
                onChange={(e) => setKnownDimension(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
              >
                <option value="width">I know the Width (Find Height)</option>
                <option value="height">I know the Height (Find Width)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {knownDimension === 'width' ? 'Known Width (px):' : 'Known Height (px):'}
              </label>
              <input
                type="number"
                min={1}
                value={knownValue}
                onChange={(e) => setKnownValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Missing calculation output banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Calculated Output Dimension:</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {knownDimension === 'width'
                  ? `${knownValue}w × ${calculatedMissingValue}h px (Height = ${calculatedMissingValue} px)`
                  : `${calculatedMissingValue}w × ${knownValue}h px (Width = ${calculatedMissingValue} px)`}
              </span>
            </div>
            <span className="text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shrink-0">
              Matches {selectedPresetRatio} Exactly
            </span>
          </div>
        </div>

        {/* Common Standards Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard Aspect Ratios Overview:
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {commonRatios.map((item, i) => (
              <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-sm">{item.ratio}</span>
                  <span className="font-semibold text-slate-700">({item.name})</span>
                </div>
                <div className="text-slate-500 text-[11px] sm:text-right">
                  {item.usage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
