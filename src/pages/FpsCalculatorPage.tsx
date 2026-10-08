import React, { useState } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Gauge, 
  Clock, 
  Film, 
  HelpCircle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { formatDuration } from '../utils/videoClientProcessing';

interface FpsCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const FpsCalculatorPage: React.FC<FpsCalculatorPageProps> = ({
  onNavigate,
}) => {
  // Mode A: Calculate FPS from Total Frames & Duration
  const [totalFrames, setTotalFrames] = useState<number>(1800);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);

  // Mode B: Calculate Total Frames from FPS & Duration
  const [knownFps, setKnownFps] = useState<number>(30);
  const [targetMinutes, setTargetMinutes] = useState<number>(2);
  const [targetSecs, setTargetSecs] = useState<number>(30);

  // Calculation
  const calculatedFps = durationSeconds > 0 ? (totalFrames / durationSeconds).toFixed(2) : '0';
  const totalTargetDuration = (targetMinutes * 60) + targetSecs;
  const calculatedTotalFrames = Math.round(knownFps * totalTargetDuration);

  const fpsStandards = [
    { fps: '24 FPS', label: 'Cinematic Standard', desc: 'The universal motion picture frame rate since the 1920s. Creates natural motion blur and organic film aesthetic.' },
    { fps: '30 FPS', label: 'Broadcast & YouTube Standard', desc: 'Default for television, vlogs, interviews, and smartphone recordings. Balances motion clarity with data efficiency.' },
    { fps: '60 FPS', label: 'High Frame Rate (HFR)', desc: 'Crucial for gameplay capture, fast-action sports, and modern high-motion YouTube videos. Eliminates stuttering.' },
    { fps: '120+ FPS', label: 'Ultra High Speed / Slow Motion', desc: 'Recorded to allow 4x or 5x slow-motion playback when slowed down to 24 or 30 FPS in post-production.' },
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'See how 30 FPS vs 60 FPS changes your video file size.',
      icon: '🧮'
    },
    {
      name: 'Bitrate Calculator',
      path: '/bitrate-calculator',
      description: 'Calculate bitrate budgets for 30fps and 60fps streams.',
      icon: '⚡'
    },
    {
      name: 'Video Frame Extractor',
      path: '/video-frame-extractor',
      description: 'Capture any individual frame at full native resolution.',
      icon: '📸'
    },
    {
      name: 'Video to GIF',
      path: '/video-to-gif',
      description: 'Set custom 10-20 FPS for animated looping GIFs.',
      icon: '🖼️'
    }
  ];

  return (
    <ToolLayout
      title="FPS Calculator & Video Frame Rate Guide"
      badgeText="Frame Frequency Solver"
      badgeIcon={<Gauge className="h-3.5 w-3.5 text-indigo-700" />}
      description="Calculate frames per second (FPS), convert between duration and total frame counts, and learn standard frame rates for cinema (24p), broadcast (30p), and gaming (60p)."
      howItWorks={{
        heading: "The Fundamentals of Video Frame Rate (FPS)",
        text: "Frames Per Second (FPS) measures how many individual still images are captured and rendered each second to create the illusion of smooth motion. The mathematical relationship is direct and linear: FPS = Total Frames ÷ Duration in seconds.",
        steps: [
          {
            number: 1,
            title: "Calculate FPS from Counts",
            description: "Divide your render's total frame count by clip runtime to determine the exact playback frame rate."
          },
          {
            number: 2,
            title: "Calculate Total Render Frames",
            description: "Multiply duration by target FPS (e.g. 60 FPS × 150 seconds = 9,000 frames) to set 3D animation timelines."
          },
          {
            number: 3,
            title: "Select Industry Standard",
            description: "Choose 24 FPS for film looks, 30 FPS for talking head content, or 60 FPS for sports and gaming."
          }
        ]
      }}
      supportedFormats={[
        { format: 'Formula', description: 'FPS = Total Frames ÷ Duration (seconds)' },
        { format: '24 FPS', description: 'Cinema & film projects (1,440 frames per minute).' },
        { format: '30 FPS', description: 'YouTube, web, and television standard (1,800 frames per minute).' },
        { format: '60 FPS', description: 'Smooth gaming and sports action (3,600 frames per minute).' }
      ]}
      tips={[
        'Doubling your frame rate from 30 FPS to 60 FPS requires roughly 35% to 50% more bitrate to maintain the same visual clarity per frame.',
        'If you plan to create slow-motion B-roll, record at 60 FPS or 120 FPS so you can slow down by 50% or 80% without jitter.',
        'In 3D modeling (Blender, Cinema 4D), use our Total Frames solver to calculate exact render frame limits for your deadlines.'
      ]}
      faqs={[
        {
          question: "Why do movies use 24 FPS instead of 60 FPS?",
          answer: "24 FPS produces a characteristic motion blur that audiences associate with cinematic storytelling. High frame rates (like 48 or 60 FPS) in drama can produce the 'soap opera effect', making cinematic scenes look like low-budget video recordings."
        },
        {
          question: "Does YouTube support 60 FPS video?",
          answer: "Yes, YouTube natively supports 60 FPS at 720p, 1080p, 1440p, and 4K resolutions, displaying a '60' badge next to the resolution in the quality selector."
        },
        {
          question: "How many frames are in a 1-minute video at 30 FPS?",
          answer: "There are exactly 1,800 frames in a 1-minute video at 30 FPS (60 seconds × 30 frames/sec = 1,800 frames)."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-8">
        {/* Tool Section 1: Calculate FPS from Frames & Duration */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              1. Calculate FPS (Frame Rate)
            </h2>
            <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md">
              Result: {calculatedFps} FPS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Total Rendered Frames:
              </label>
              <input
                type="number"
                min={1}
                value={totalFrames}
                onChange={(e) => setTotalFrames(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Clip Duration (Seconds):
              </label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            Formula: {totalFrames} frames ÷ {durationSeconds}s = <strong>{calculatedFps} FPS</strong>
          </div>
        </div>

        {/* Tool Section 2: Calculate Total Frames from Duration & FPS */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              2. Calculate Total Frames from Target Duration
            </h2>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
              Total: {calculatedTotalFrames.toLocaleString()} Frames
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Target Frame Rate (FPS):
              </label>
              <select
                value={knownFps}
                onChange={(e) => setKnownFps(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
              >
                <option value={24}>24 FPS (Cinema)</option>
                <option value={25}>25 FPS (PAL European Standard)</option>
                <option value={30}>30 FPS (Standard YouTube/Vlogs)</option>
                <option value={60}>60 FPS (Gaming & Smooth Motion)</option>
                <option value={120}>120 FPS (High Speed)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Duration (Minutes):
              </label>
              <input
                type="number"
                min={0}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Duration (Seconds):
              </label>
              <input
                type="number"
                min={0}
                max={59}
                value={targetSecs}
                onChange={(e) => setTargetSecs(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            Total Frames: {knownFps} FPS × {totalTargetDuration} seconds = <strong>{calculatedTotalFrames.toLocaleString()} frames to render</strong>
          </div>
        </div>

        {/* Industry Standards Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Industry Frame Rates Comparison:
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {fpsStandards.map((std, i) => (
              <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-sm">{std.fps}</span>
                  <span className="font-semibold text-slate-700">({std.label})</span>
                </div>
                <div className="text-slate-500 text-[11px] sm:text-right max-w-sm">
                  {std.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
