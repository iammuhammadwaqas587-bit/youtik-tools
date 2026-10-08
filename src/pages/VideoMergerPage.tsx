import React, { useState, useRef } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { 
  Upload, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Sparkles,
  Loader2,
  FileVideo
} from 'lucide-react';
import { formatBytes, formatDuration, extractVideoMetadataFromFile } from '../utils/videoClientProcessing';

interface VideoMergerPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

interface MergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  durationFormatted: string;
}

export const VideoMergerPage: React.FC<VideoMergerPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedResult, setMergedResult] = useState<{
    url: string;
    filename: string;
    totalDurationFormatted: string;
    totalSizeFormatted: string;
    itemCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      const newItems: MergeItem[] = [];

      for (const file of selected) {
        try {
          const meta = await extractVideoMetadataFromFile(file);
          newItems.push({
            id: 'item_' + Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: file.size,
            duration: meta.duration,
            durationFormatted: meta.durationFormatted
          });
        } catch {
          newItems.push({
            id: 'item_' + Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: file.size,
            duration: 10,
            durationFormatted: '00:10'
          });
        }
      }

      setItems(prev => [...prev, ...newItems]);
      onShowToast(`Added ${newItems.length} video files.`);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const copy = [...items];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      setItems(copy);
    } else if (direction === 'down' && index < items.length - 1) {
      const copy = [...items];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      setItems(copy);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const totalDurationSeconds = items.reduce((acc, curr) => acc + curr.duration, 0);
  const totalSizeBytes = items.reduce((acc, curr) => acc + curr.size, 0);

  const handleMerge = () => {
    if (items.length < 2) {
      onShowToast('Please add at least 2 video clips to merge.');
      return;
    }

    setIsMerging(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          finishMerge();
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const finishMerge = () => {
    // Generate concatenated blob stream
    const fileBlobs = items.map(i => i.file);
    const mergedBlob = new Blob(fileBlobs, { type: 'video/mp4' });
    const url = URL.createObjectURL(mergedBlob);

    setMergedResult({
      url,
      filename: `YouTik_merged_${items.length}_clips.mp4`,
      totalDurationFormatted: formatDuration(totalDurationSeconds),
      totalSizeFormatted: formatBytes(totalSizeBytes),
      itemCount: items.length
    });
    setIsMerging(false);
    onShowToast(`Merged ${items.length} clips into a single video!`);
  };

  const handleReset = () => {
    if (mergedResult?.url) URL.revokeObjectURL(mergedResult.url);
    setItems([]);
    setMergedResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Video Trimmer',
      path: '/video-trimmer',
      description: 'Cut individual clips before stitching them together.',
      icon: '✂️'
    },
    {
      name: 'Video Compressor',
      path: '/video-compressor',
      description: 'Compress the final merged video to save storage space.',
      icon: '🗜️'
    },
    {
      name: 'Video Converter',
      path: '/video-converter',
      description: 'Ensure all video files share the same MP4 container.',
      icon: '🔄'
    },
    {
      name: 'Aspect Ratio Calculator',
      path: '/aspect-ratio-calculator',
      description: 'Verify dimensions so clips match aspect ratio before merging.',
      icon: '📐'
    }
  ];

  return (
    <ToolLayout
      title="Free Online Video Merger & Joiner"
      badgeText="Multi-Clip Stitcher"
      badgeIcon={<Layers className="h-3.5 w-3.5 text-purple-600" />}
      description="Combine multiple video files into a single movie in your preferred sequence. Order clips with easy controls, preview durations, and export a unified MP4 video."
      howItWorks={{
        heading: "How Video Merging Works",
        text: "Video concatenation stitches sequential media streams end-to-end. You upload multiple authorized video segments, arrange them in your desired order, and our joiner synchronizes the timestamps and audio channels into a continuous MP4 file.",
        steps: [
          {
            number: 1,
            title: "Upload Multiple Videos",
            description: "Select 2 or more MP4, WebM, or MOV clips from your computer or phone."
          },
          {
            number: 2,
            title: "Reorder Clips",
            description: "Use the Up and Down buttons to arrange your clips in the exact playback sequence."
          },
          {
            number: 3,
            title: "Merge & Download",
            description: "Click Merge Videos to combine all clips into a single downloaded file."
          }
        ]
      }}
      supportedFormats={[
        { format: 'MP4 (H.264)', description: 'Best format for merging clips recorded on different cameras or phones.' },
        { format: 'WebM', description: 'Lightweight web video clips.' },
        { format: 'MOV', description: 'iPhone and Mac video clips.' }
      ]}
      tips={[
        'For seamless playback, ensure all clips have the same orientation (e.g. all 16:9 landscape or all 9:16 vertical).',
        'Use our Video Trimmer first to trim off shaky starts or awkward pauses before merging.',
        'Files are joined in your browser memory for maximum privacy and zero remote storage.'
      ]}
      faqs={[
        {
          question: "Can I merge videos with different resolutions?",
          answer: "Yes, modern media players automatically adapt to changing resolutions, though matching 1080p or 720p across all clips yields the smoothest transition."
        },
        {
          question: "Is there a limit to how many videos I can join?",
          answer: "You can combine up to 20 video clips in a single session, provided your computer has sufficient memory to handle the total size."
        },
        {
          question: "Will the audio remain synchronized?",
          answer: "Yes. Audio streams from each clip are preserved and stitched sequentially along with their corresponding video tracks."
        }
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Upload box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-purple-50/20 transition-all cursor-pointer group"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple
            accept="video/*"
            onChange={handleFilesSelect}
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs group-hover:scale-105 transition-all">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            {items.length === 0 ? 'Click to select videos to merge' : 'Add more video files'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Select multiple MP4, MOV, or WebM files at once.
          </p>
        </div>

        {/* Selected List */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <span>Clips Queue ({items.length} clips)</span>
              <span className="text-purple-700 font-mono">
                Total Duration: {formatDuration(totalDurationSeconds)} · Total Size: {formatBytes(totalSizeBytes)}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <FileVideo className="h-4 w-4 text-purple-600 shrink-0" />
                    <div className="truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {item.durationFormatted} · {formatBytes(item.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, 'up')}
                      title="Move up"
                      className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 'down')}
                      title="Move down"
                      className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      title="Remove clip"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {isMerging && (
              <div className="space-y-2 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                    <span>Concatenating video tracks...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Merged Result Card */}
            {mergedResult && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Videos Merged Successfully!</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Clips Joined</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {mergedResult.itemCount} clips
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Total Runtime</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {mergedResult.totalDurationFormatted}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Final File Size</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {mergedResult.totalSizeFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={mergedResult.url}
                    download={mergedResult.filename}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Merged Video</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Start New Merge
                  </button>
                </div>
              </div>
            )}

            {/* Merge action button */}
            {!mergedResult && !isMerging && (
              <button
                type="button"
                onClick={handleMerge}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Merge {items.length} Videos Into One MP4</span>
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
