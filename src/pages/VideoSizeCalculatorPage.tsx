import React, { useState } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Calculator, 
  Clock, 
  Gauge, 
  Maximize2, 
  Sliders, 
  HelpCircle, 
  FileCheck2,
  HardDrive
} from 'lucide-react';

interface VideoSizeCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const VideoSizeCalculatorPage: React.FC<VideoSizeCalculatorPageProps> = ({
  onNavigate,
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(30);
  const [resolutionPreset, setResolutionPreset] = useState<'480p' | '720p' | '1080p' | '1440p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [videoBitrateMbps, setVideoBitrateMbps] = useState<number>(8.0);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(192);

  // Preset mapper
  const handlePresetChange = (preset: '480p' | '720p' | '1080p' | '1440p' | '4k') => {
    setResolutionPreset(preset);
    switch (preset) {
      case '480p':
        setVideoBitrateMbps(2.5);
        break;
      case '720p':
        setVideoBitrateMbps(fps === 60 ? 6.5 : 4.5);
        break;
      case '1080p':
        setVideoBitrateMbps(fps === 60 ? 12.0 : 8.0);
        break;
      case '1440p':
        setVideoBitrateMbps(fps === 60 ? 24.0 : 16.0);
        break;
      case '4k':
        setVideoBitrateMbps(fps === 60 ? 55.0 : 40.0);
        break;
    }
  };

  // Total duration in seconds
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

  // Formula:
  // Total bitrate in kbps = (videoBitrateMbps * 1000) + audioBitrateKbps
  // Total bits = Total bitrate kbps * 1000 * totalSeconds
  // Total bytes = Total bits / 8
  const totalBitrateKbps = (videoBitrateMbps * 1000) + audioBitrateKbps;
  const totalBytes = totalSeconds > 0 ? (totalBitrateKbps * 1000 * totalSeconds) / 8 : 0;
  const totalMegabytes = totalBytes / (1024 * 1024);
  const totalGigabytes = totalBytes / (1024 * 1024 * 1024);

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Bitrate Calculator',
      path: '/bitrate-calculator',
      description: 'Reverse calculate bitrates from a target file size limit.',
      icon: '⚡'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Compress existing videos to hit your target MB size.',
      icon: '🗜️'
    },
    {
      name: 'Video Resolution Checker',
      path: '/video-resolution-checker',
      description: 'Learn differences between 720p, 1080p, and 4K UHD.',
      icon: '📐'
    },
    {
      name: 'FPS Calculator',
      path: '/fps-calculator',
      description: 'Calculate frame count and compare 24, 30, and 60 FPS.',
      icon: '⏱️'
    }
  ];

  return (
    <ToolLayout
      title="Video File Size Calculator"
      badgeText="Accurate Storage Estimator"
      badgeIcon={<Calculator className="h-3.5 w-3.5 text-emerald-700" />}
      description="Estimate video file sizes based on duration, resolution, frame rate, and bitrate settings. Plan storage needs for YouTube uploads, Discord attachments, and hard drives."
      howItWorks={{
        heading: "The Exact Video File Size Formula",
        text: "File size is strictly a mathematical product of duration and data transfer speed (bitrate). Resolution and FPS do not directly determine file size; rather, higher resolutions require higher bitrates to avoid compression artifacts.",
        steps: [
          {
            number: 1,
            title: "Calculate Total Bitrate",
            description: "Add Video Bitrate (in kbps) + Audio Bitrate (in kbps) to get the combined data stream rate."
          },
          {
            number: 2,
            title: "Multiply by Duration",
            description: "Multiply the total bitrate by duration in seconds to calculate the total bits transferred."
          },
          {
            number: 3,
            title: "Convert to Megabytes",
            description: "Divide by 8 to convert bits to bytes, then divide by (1024 × 1024) to get Megabytes (MB)."
          }
        ]
      }}
      supportedFormats={[
        { format: 'Formula', description: 'File Size (MB) = [(Video kbps + Audio kbps) × Seconds] / (8 × 1024)' },
        { format: 'YouTube 1080p 30fps', description: 'Standard recommendation: 8 Mbps video + 192 kbps audio (~60 MB/min).' },
        { format: 'YouTube 4K 60fps', description: 'Standard recommendation: 55 Mbps video + 320 kbps audio (~415 MB/min).' }
      ]}
      tips={[
        'Resolution itself does NOT increase file size—bitrate does. A 1080p video encoded at 3 Mbps will be smaller than a 720p video encoded at 8 Mbps.',
        'Audio bitrate matters: a 2-hour podcast at 320 kbps audio alone consumes ~288 MB before any video is added.',
        'Use VBR (Variable Bitrate) 2-pass in your video editor to hit exact size targets with optimal picture quality.'
      ]}
      faqs={[
        {
          question: "How big is a 10-minute 1080p video?",
          answer: "At standard YouTube upload recommendations (8 Mbps video + 192 kbps audio), a 10-minute 1080p video will be approximately 614 MB."
        },
        {
          question: "How big is a 1-hour 4K video?",
          answer: "At recommended 4K 60fps bitrates (55 Mbps), a 1-hour video will be roughly 24.8 Gigabytes."
        },
        {
          question: "Why is my exported video larger than this calculator predicts?",
          answer: "Container overhead (embedded audio tracks, multiple subtitle streams, and thumbnail metadata) can add 1% to 3% to the total file size."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-6">
        {/* Presets Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Select Resolution Preset (Auto-fills recommended bitrates):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold">
            {(['480p', '720p', '1080p', '1440p', '4k'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`py-2 px-3 rounded-lg border transition-all cursor-pointer ${
                  resolutionPreset === preset
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {preset.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Duration Input */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Clock className="h-4 w-4 text-emerald-700" />
              <span>Video Duration:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Hours</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Minutes</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Seconds</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Total runtime: {totalSeconds} seconds
            </div>
          </div>

          {/* Frame Rate & Bitrate Inputs */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Gauge className="h-4 w-4 text-emerald-700" />
              <span>Frame Rate & Video Bitrate:</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Frame Rate (FPS)</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium text-xs bg-white"
                >
                  <option value={24}>24 FPS (Cinema)</option>
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={60}>60 FPS (High Motion)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Video Bitrate (Mbps)</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={videoBitrateMbps}
                  onChange={(e) => setVideoBitrateMbps(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Audio Bitrate (kbps)</label>
              <select
                value={audioBitrateKbps}
                onChange={(e) => setAudioBitrateKbps(parseInt(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 font-medium text-xs bg-white"
              >
                <option value={128}>128 kbps (Speech & Quick Clips)</option>
                <option value={192}>192 kbps (Standard Audio)</option>
                <option value={256}>256 kbps (High Fidelity)</option>
                <option value={320}>320 kbps (Master Quality)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculated Result Display Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white border-2 border-emerald-500/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <HardDrive className="h-5 w-5 text-emerald-700" />
            <span>Estimated Video File Size</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-xs text-slate-500 block">Megabytes (MB)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {totalMegabytes.toFixed(2)} MB
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-xs text-slate-500 block">Gigabytes (GB)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
                {totalGigabytes.toFixed(3)} GB
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
            Calculation: ({videoBitrateMbps} Mbps video + {audioBitrateKbps} kbps audio) × {totalSeconds}s ÷ 8 = <strong>{totalMegabytes.toFixed(1)} MB</strong>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
