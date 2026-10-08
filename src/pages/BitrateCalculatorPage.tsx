import React, { useState } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Gauge, 
  HardDrive, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Sliders,
  Volume2,
  Video
} from 'lucide-react';

interface BitrateCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const BitrateCalculatorPage: React.FC<BitrateCalculatorPageProps> = ({
  onNavigate,
}) => {
  const [targetSizeMb, setTargetSizeMb] = useState<number>(25);
  const [minutes, setMinutes] = useState<number>(3);
  const [seconds, setSeconds] = useState<number>(0);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(128);

  // Total duration in seconds
  const totalSeconds = (minutes * 60) + seconds;

  // Formula:
  // Total bits = targetSizeMb * 1024 * 1024 * 8
  // Total bitrate kbps = (Total bits / totalSeconds) / 1000
  // Video bitrate kbps = Total bitrate kbps - audioBitrateKbps
  const totalBits = targetSizeMb * 1024 * 1024 * 8;
  const totalBitrateKbps = totalSeconds > 0 ? Math.round((totalBits / totalSeconds) / 1000) : 0;
  const videoBitrateKbps = Math.max(0, totalBitrateKbps - audioBitrateKbps);

  const totalBitrateMbps = (totalBitrateKbps / 1000).toFixed(2);
  const videoBitrateMbps = (videoBitrateKbps / 1000).toFixed(2);

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Forward calculate expected file size from bitrate and duration.',
      icon: '🧮'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Compress videos to meet Discord, Gmail, and Slack limits.',
      icon: '🗜️'
    },
    {
      name: 'FPS Calculator',
      path: '/fps-calculator',
      description: 'Calculate frame count and compare 24, 30, and 60 FPS.',
      icon: '⏱️'
    },
    {
      name: 'Video Metadata Inspector',
      path: '/video-metadata',
      description: 'Inspect current video bitrates and codec stream details.',
      icon: '🔍'
    }
  ];

  return (
    <ToolLayout
      title="Bitrate Calculator for Video & Audio"
      badgeText="Target Bitrate Budget Solver"
      badgeIcon={<Gauge className="h-3.5 w-3.5 text-violet-600" />}
      description="Reverse calculate the maximum video and audio bitrate you can use to fit within strict file size caps like Discord (10MB/25MB), Gmail (25MB), and web uploads."
      howItWorks={{
        heading: "How Bitrate Allocation Works",
        text: "Bitrate represents the volume of digital data processed per second of video playback. If you have a fixed target file size (e.g. 25 MB for an email attachment) and know your video duration, you can calculate the exact maximum bitrate threshold to guarantee your file will never exceed the limit.",
        steps: [
          {
            number: 1,
            title: "Enter Target Size",
            description: "Specify your maximum desired file size (e.g. 10 MB, 25 MB, or 100 MB)."
          },
          {
            number: 2,
            title: "Enter Duration",
            description: "Input the exact length of your video clip in minutes and seconds."
          },
          {
            number: 3,
            title: "Export Encoder Settings",
            description: "Read the recommended video and audio bitrate values to enter into Handbrake or Premiere Pro."
          }
        ]
      }}
      supportedFormats={[
        { format: 'Discord Limit', description: '25 MB max (Free users) or 10 MB.' },
        { format: 'Gmail Attachment', description: '25 MB maximum file size limit.' },
        { format: 'WhatsApp Attachment', description: '16 MB max for standard video shares.' }
      ]}
      tips={[
        'Always set your video encoder bitrate 5% lower than the calculated maximum to leave safety headroom for container metadata and spikes.',
        'For talking heads or tutorials, setting audio to 128 kbps frees up valuable bandwidth for the video track.',
        'Use 2-Pass VBR (Variable Bitrate) in your rendering software for the closest match to your target file size.'
      ]}
      faqs={[
        {
          question: "What is the formula used to calculate bitrate?",
          answer: "Total Bitrate (kbps) = (Target Size in MB × 8192) ÷ Duration in seconds. Video Bitrate = Total Bitrate − Audio Bitrate."
        },
        {
          question: "What happens if my calculated bitrate is below 1,000 kbps (1 Mbps)?",
          answer: "For resolutions of 1080p, bitrates under 1.5 Mbps may show visible pixelation during fast motion. Consider downscaling resolution to 720p or trimming clip length."
        },
        {
          question: "Does audio bitrate impact video quality?",
          answer: "Yes, because audio and video share the total file size budget. Reducing audio from 320 kbps to 128 kbps allows an extra 192 kbps of visual data for sharper video frames."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-6">
        {/* Preset limits bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Common Platform Target Presets:
          </label>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTargetSizeMb(10)}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
            >
              Discord Free (10 MB)
            </button>
            <button
              type="button"
              onClick={() => setTargetSizeMb(25)}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
            >
              Discord / Gmail (25 MB)
            </button>
            <button
              type="button"
              onClick={() => setTargetSizeMb(16)}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
            >
              WhatsApp (16 MB)
            </button>
            <button
              type="button"
              onClick={() => setTargetSizeMb(50)}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
            >
              Discord Nitro (50 MB)
            </button>
            <button
              type="button"
              onClick={() => setTargetSizeMb(100)}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
            >
              Web Upload (100 MB)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-violet-600" />
              <span>Target File Size:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.5}
                step={1}
                value={targetSizeMb}
                onChange={(e) => setTargetSizeMb(parseFloat(e.target.value) || 1)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
              />
              <span className="font-bold text-slate-500">MB</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-violet-600" />
              <span>Video Duration:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Min</span>
                <input
                  type="number"
                  min={0}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Sec</span>
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
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-violet-600" />
              <span>Audio Bitrate:</span>
            </label>
            <select
              value={audioBitrateKbps}
              onChange={(e) => setAudioBitrateKbps(parseInt(e.target.value))}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-xs mt-3.5"
            >
              <option value={96}>96 kbps (Voice Only)</option>
              <option value={128}>128 kbps (Standard Speech)</option>
              <option value={192}>192 kbps (Clean Audio)</option>
              <option value={256}>256 kbps (High Fidelity)</option>
              <option value={320}>320 kbps (Master Quality)</option>
            </select>
          </div>
        </div>

        {/* Calculated Results Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-slate-50 to-white border-2 border-violet-500/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
              <Gauge className="h-5 w-5 text-violet-600" />
              <span>Recommended Target Bitrates</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Duration: {totalSeconds}s
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Video className="h-3.5 w-3.5 text-violet-600" />
                <span>Video Track Bitrate</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                {videoBitrateKbps.toLocaleString()} kbps
              </span>
              <span className="text-[11px] text-violet-700 font-semibold font-mono">
                (~{videoBitrateMbps} Mbps)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Volume2 className="h-3.5 w-3.5 text-violet-600" />
                <span>Audio Track Bitrate</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                {audioBitrateKbps} kbps
              </span>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                Allocated budget
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Gauge className="h-3.5 w-3.5 text-violet-600" />
                <span>Total Combined Bitrate</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 font-mono block">
                {totalBitrateKbps.toLocaleString()} kbps
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                (~{totalBitrateMbps} Mbps max)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
            Encoder Recommendation: Set Video Target Bitrate to <strong>{Math.round(videoBitrateKbps * 0.95)} kbps</strong> (leaving 5% margin) and Audio Bitrate to <strong>{audioBitrateKbps} kbps</strong>.
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
