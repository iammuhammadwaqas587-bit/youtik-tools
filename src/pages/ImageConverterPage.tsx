import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Upload,
  FileImage,
  Download,
  Trash2,
  Archive,
  Play,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Info,
  X,
  Eye,
} from 'lucide-react';
import {
  IMAGE_CONVERTER_ROUTES,
  type ImageConverterRoutePath,
  type ImageOutputFormat,
} from '../data/imageConverterSeo';
import {
  ICO_AVAILABLE_SIZES,
  OUTPUT_FORMAT_MAP,
  OUTPUT_FORMATS,
  type IcoSizeOption,
  type ResizeMode,
} from '../utils/imageEncoding';
import {
  buildOutputFileName,
  convertImageFile,
  decodeHeicToPngBlob,
  detectBrowserOutputSupport,
  detectFriendlyInputFormat,
  formatFileSize,
  isAcceptedImageFile,
  isHeicFile,
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_FILES,
  type FormatSupportMap,
} from '../utils/imageConverterEngine';

const ImageConverterSeoContent = React.lazy(
  () => import('../components/ImageConverterSeoContent')
);

type QueueItemStatus = 'queued' | 'converting' | 'done' | 'error';

interface QueuedImageItem {
  id: string;
  file: File;
  inputFormat: string;
  originalSize: number;
  previewUrl: string;
  decodedSourceBlob?: Blob;
  formatOverride: ImageOutputFormat | 'global';
  status: QueueItemStatus;
  errorMessage?: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedFilename?: string;
  convertedFormat?: ImageOutputFormat;
  convertedSize?: number;
  srcWidth?: number;
  srcHeight?: number;
  outWidth?: number;
  outHeight?: number;
}

interface ImageConverterPageProps {
  routePath?: ImageConverterRoutePath;
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string) => void;
}

const DEFAULT_SUPPORT_MAP: FormatSupportMap = {
  jpg: { supported: true },
  png: { supported: true },
  webp: { supported: true },
  avif: { supported: true },
  bmp: { supported: true },
  ico: { supported: true },
};

export const ImageConverterPage: React.FC<ImageConverterPageProps> = ({
  routePath = '/image-converter',
  onNavigate,
  onShowToast,
}) => {
  const routeConfig =
    IMAGE_CONVERTER_ROUTES[routePath] || IMAGE_CONVERTER_ROUTES['/image-converter'];

  const [items, setItems] = useState<QueuedImageItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Browser runtime encoding support
  const [formatSupport, setFormatSupport] =
    useState<FormatSupportMap>(DEFAULT_SUPPORT_MAP);

  // Settings Panel State
  const [globalFormat, setGlobalFormat] = useState<ImageOutputFormat>(
    routeConfig.defaultOutputFormat
  );
  const [quality, setQuality] = useState<number>(90);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [icoSizes, setIcoSizes] = useState<IcoSizeOption[]>([16, 32, 48, 256]);
  const [keepOriginalNames, setKeepOriginalNames] = useState<boolean>(true);

  // Sequential Conversion Progress
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const [liveStatusText, setLiveStatusText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<QueuedImageItem[]>([]);
  itemsRef.current = items;

  // Reset global output format when navigating between preset routes (/png-to-jpg, /webp-to-png, etc.)
  useEffect(() => {
    setGlobalFormat(routeConfig.defaultOutputFormat);
  }, [routeConfig.defaultOutputFormat]);

  // Detect browser Canvas encoding capabilities at runtime
  useEffect(() => {
    let active = true;
    detectBrowserOutputSupport().then((support) => {
      if (!active) return;
      setFormatSupport(support);
      setGlobalFormat((current) => {
        if (support[current]?.supported) return current;
        const firstSupported = OUTPUT_FORMATS.find((f) => support[f.id]?.supported);
        return firstSupported ? firstSupported.id : 'png';
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Revoke all object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
    };
  }, []);

  const addIncomingFiles = useCallback(
    async (fileList: File[]) => {
      if (!fileList.length) return;
      const errors: string[] = [];
      const currentCount = itemsRef.current.length;
      const remainingSlots = Math.max(0, MAX_IMAGE_FILES - currentCount);

      if (remainingSlots === 0) {
        setRejectionMessages([
          `Batch limit reached: maximum ${MAX_IMAGE_FILES} files per batch. Remove files or Clear all before adding more.`,
        ]);
        return;
      }

      const acceptedFiles: File[] = [];
      for (const file of fileList) {
        if (!isAcceptedImageFile(file)) {
          errors.push(
            `"${file.name || 'Unnamed file'}" is not a supported image format (JPG, PNG, WebP, GIF, BMP, AVIF, SVG, HEIC/HEIF).`
          );
          continue;
        }
        if (file.size > MAX_IMAGE_FILE_BYTES) {
          errors.push(
            `"${file.name}" (${formatFileSize(file.size)}) exceeds the 25 MB per-file limit.`
          );
          continue;
        }
        if (acceptedFiles.length >= remainingSlots) {
          errors.push(
            `Skipped "${file.name}": batch limit is ${MAX_IMAGE_FILES} files maximum.`
          );
          continue;
        }
        acceptedFiles.push(file);
      }

      setRejectionMessages(errors);
      if (!acceptedFiles.length) return;

      const hasHeic = acceptedFiles.some(isHeicFile);
      if (hasHeic) {
        setLiveStatusText('Loading HEIC decoder for Apple photos...');
      }

      const newItems: QueuedImageItem[] = [];
      for (const file of acceptedFiles) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const inputFormat = detectFriendlyInputFormat(file);

        if (isHeicFile(file)) {
          try {
            const decodedPng = await decodeHeicToPngBlob(file);
            const previewUrl = URL.createObjectURL(decodedPng);
            newItems.push({
              id,
              file,
              inputFormat,
              originalSize: file.size,
              previewUrl,
              decodedSourceBlob: decodedPng,
              formatOverride: 'global',
              status: 'queued',
            });
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : 'Failed to decode HEIC image.';
            const fallbackUrl = URL.createObjectURL(file);
            newItems.push({
              id,
              file,
              inputFormat,
              originalSize: file.size,
              previewUrl: fallbackUrl,
              formatOverride: 'global',
              status: 'error',
              errorMessage: `HEIC decode error: ${msg}`,
            });
          }
        } else {
          const previewUrl = URL.createObjectURL(file);
          newItems.push({
            id,
            file,
            inputFormat,
            originalSize: file.size,
            previewUrl,
            formatOverride: 'global',
            status: 'queued',
          });
        }
      }

      setItems((prev) => [...prev, ...newItems]);
      setSelectedItemId((prev) => prev || newItems[0]?.id || null);
      setLiveStatusText(
        `Added ${newItems.length} ${newItems.length === 1 ? 'image' : 'images'} to the queue.`
      );
      if (onShowToast) {
        onShowToast(
          `Added ${newItems.length} ${newItems.length === 1 ? 'image' : 'images'}`
        );
      }
    },
    [onShowToast]
  );

  // Global Ctrl+V / Cmd+V paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        (target as HTMLInputElement).type !== 'file'
      ) {
        return;
      }

      const clipItems = e.clipboardData?.items;
      if (!clipItems) return;

      const pastedFiles: File[] = [];
      let index = 0;
      for (let i = 0; i < clipItems.length; i++) {
        const entry = clipItems[i];
        if (entry.kind === 'file' && entry.type.startsWith('image/')) {
          const rawFile = entry.getAsFile();
          if (rawFile) {
            index += 1;
            const ext = rawFile.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const namedFile =
              rawFile.name && rawFile.name !== 'image.png'
                ? rawFile
                : new File([rawFile], `pasted-image-${Date.now()}-${index}.${ext}`, {
                    type: rawFile.type || 'image/png',
                  });
            pastedFiles.push(namedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        addIncomingFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addIncomingFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length > 0) {
      addIncomingFiles(list);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const list = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length > 0) {
      addIncomingFiles(list);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      const next = prev.filter((item) => item.id !== id);
      if (selectedItemId === id) {
        setSelectedItemId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    for (const item of itemsRef.current) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    }
    setItems([]);
    setSelectedItemId(null);
    setRejectionMessages([]);
    setCompletedCount(0);
    setTotalBatchCount(0);
    setLiveStatusText('Cleared all images from the queue.');
  };

  const toggleIcoSize = (size: IcoSizeOption) => {
    setIcoSizes((prev) => {
      if (prev.includes(size)) {
        return prev.length > 1 ? prev.filter((s) => s !== size) : prev;
      }
      return [...prev, size].sort((a, b) => a - b);
    });
  };

  // Determine which contextual settings to show
  const activeFormatsInUse = new Set<ImageOutputFormat>([
    globalFormat,
    ...items
      .map((item) =>
        item.formatOverride === 'global' ? globalFormat : item.formatOverride
      ),
  ]);

  const showQualitySlider = Array.from(activeFormatsInUse).some(
    (fmt) => OUTPUT_FORMAT_MAP[fmt].isLossy
  );
  const showBgColorPicker = Array.from(activeFormatsInUse).some(
    (fmt) => !OUTPUT_FORMAT_MAP[fmt].supportsTransparency
  );
  const showIcoOptions = activeFormatsInUse.has('ico');

  const handleConvertBatch = async () => {
    const queue = itemsRef.current;
    if (!queue.length || isConvertingBatch) return;

    setIsConvertingBatch(true);
    setRejectionMessages([]);
    setCompletedCount(0);
    setTotalBatchCount(queue.length);
    setLiveStatusText(`Starting batch conversion of ${queue.length} images...`);

    let firstConvertedId: string | null = null;
    let successTotal = 0;

    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      const targetFormat: ImageOutputFormat =
        current.formatOverride === 'global'
          ? globalFormat
          : current.formatOverride;

      // Mark row as converting & release prior converted URL if re-converting
      if (current.convertedUrl) {
        URL.revokeObjectURL(current.convertedUrl);
      }

      setItems((prev) =>
        prev.map((row) =>
          row.id === current.id
            ? {
                ...row,
                status: 'converting',
                errorMessage: undefined,
                convertedUrl: undefined,
                convertedBlob: undefined,
              }
            : row
        )
      );

      if (!formatSupport[targetFormat]?.supported) {
        setItems((prev) =>
          prev.map((row) =>
            row.id === current.id
              ? {
                  ...row,
                  status: 'error',
                  errorMessage:
                    formatSupport[targetFormat]?.reason ||
                    `${targetFormat.toUpperCase()} encoding is not supported in this browser.`,
                }
              : row
          )
        );
        setCompletedCount(i + 1);
        continue;
      }

      try {
        const result = await convertImageFile(
          current.file,
          {
            format: targetFormat,
            quality,
            backgroundColor,
            resize: {
              mode: resizeMode,
              maxWidth,
              maxHeight,
              percent: scalePercent,
              lockAspectRatio,
            },
            icoSizes,
          },
          current.decodedSourceBlob
        );

        const convertedUrl = URL.createObjectURL(result.blob);
        const convertedFilename = buildOutputFileName(
          current.file.name,
          i,
          targetFormat,
          keepOriginalNames
        );

        setItems((prev) =>
          prev.map((row) =>
            row.id === current.id
              ? {
                  ...row,
                  status: 'done',
                  convertedBlob: result.blob,
                  convertedUrl,
                  convertedFilename,
                  convertedFormat: targetFormat,
                  convertedSize: result.blob.size,
                  srcWidth: result.srcWidth,
                  srcHeight: result.srcHeight,
                  outWidth: result.width,
                  outHeight: result.height,
                }
              : row
          )
        );

        successTotal += 1;
        if (!firstConvertedId) firstConvertedId = current.id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to convert this image.';
        setItems((prev) =>
          prev.map((row) =>
            row.id === current.id
              ? {
                  ...row,
                  status: 'error',
                  errorMessage: message,
                }
              : row
          )
        );
      }

      setCompletedCount(i + 1);
      setLiveStatusText(
        `Processed ${i + 1} of ${queue.length} images...`
      );
      // Yield briefly to keep UI responsive between sequential images
      await new Promise((resolve) => setTimeout(resolve, 16));
    }

    if (firstConvertedId) {
      setSelectedItemId((prev) => {
        const currentSelected = itemsRef.current.find((x) => x.id === prev);
        return currentSelected?.convertedUrl ? prev : firstConvertedId;
      });
    }

    setIsConvertingBatch(false);
    setLiveStatusText(
      `Finished: ${successTotal} of ${queue.length} images converted successfully.`
    );
    if (onShowToast) {
      onShowToast(`Converted ${successTotal} of ${queue.length} images`);
    }
  };

  const handleDownloadSingle = (item: QueuedImageItem) => {
    if (!item.convertedUrl || !item.convertedFilename) return;
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = item.convertedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertedItems = items.filter(
    (item) => item.status === 'done' && item.convertedBlob && item.convertedFilename
  );

  const handleDownloadAllZip = async () => {
    if (!convertedItems.length || isCreatingZip) return;
    setIsCreatingZip(true);
    setLiveStatusText('Building ZIP archive in browser...');

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const usedNames = new Map<string, number>();

      for (const item of convertedItems) {
        if (!item.convertedBlob || !item.convertedFilename) continue;
        let fileName = item.convertedFilename;
        const count = usedNames.get(fileName) || 0;
        if (count > 0) {
          const dotIdx = fileName.lastIndexOf('.');
          const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
          const ext = dotIdx > 0 ? fileName.slice(dotIdx) : '';
          fileName = `${base}-${count + 1}${ext}`;
        }
        usedNames.set(item.convertedFilename, count + 1);
        zip.file(fileName, item.convertedBlob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `youtiktools-converted-images-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 4000);

      setLiveStatusText('ZIP archive downloaded.');
      if (onShowToast) onShowToast('Downloaded ZIP archive');
    } catch (err) {
      setRejectionMessages([
        err instanceof Error ? err.message : 'Failed to build ZIP archive.',
      ]);
    } finally {
      setIsCreatingZip(false);
    }
  };

  const handleScrollToDropZone = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        dropZoneRef.current?.focus();
      }, 300);
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedItem =
    items.find((i) => i.id === selectedItemId) ||
    items.find((i) => i.status === 'done') ||
    items[0] ||
    null;

  const progressPercent =
    totalBatchCount > 0 ? Math.round((completedCount / totalBatchCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-4">
      {/* PART 1 - THE TOOL (Above the fold) */}
      <section aria-labelledby="image-converter-heading" className="space-y-5">
        {/* Header & H1 */}
        <header className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 shadow-2xs">
            <FileImage className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
            <span>{routeConfig.badgeText}</span>
          </div>
          <h1
            id="image-converter-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {routeConfig.h1}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {routeConfig.subheading}
          </p>
        </header>

        {/* Main Workspace Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          {/* Drag and Drop Zone */}
          <div
            ref={dropZoneRef}
            role="button"
            tabIndex={0}
            aria-label="Drop images here, press Enter to choose images, or press Ctrl+V to paste from clipboard"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 sm:p-9 text-center transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${
              isDragging
                ? 'border-red-600 bg-red-50/70'
                : 'border-slate-300 bg-slate-50/70 hover:border-red-500 hover:bg-red-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.svg,.heic,.heif,image/*"
              onChange={handleFileInputChange}
              className="hidden"
              aria-hidden="true"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              Drag &amp; drop images here, or click to browse
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
              Supports JPG, PNG, WebP, GIF (first frame), BMP, AVIF, SVG &amp; HEIC/HEIF · Up to 50 files (25 MB each) · Press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700">
                Ctrl+V
              </kbd>{' '}
              to paste
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs">
                <FileImage className="h-4 w-4" aria-hidden="true" />
                <span>Choose images</span>
              </span>
            </div>
          </div>

          {/* Inline Error Alerts */}
          {rejectionMessages.length > 0 && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
                  <span>Some files could not be added</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRejectionMessages([])}
                  aria-label="Dismiss file errors"
                  className="p-1 rounded-md text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {rejectionMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Settings Panel */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Output Format Selector */}
              <div className="lg:col-span-6 space-y-2">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Output Format (All Files)
                </span>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select global output image format">
                  {OUTPUT_FORMATS.map((fmt) => {
                    const support = formatSupport[fmt.id];
                    const isUnsupported = !support?.supported;
                    const isSelected = globalFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        disabled={isUnsupported}
                        title={
                          isUnsupported
                            ? support.reason
                            : `Convert all queued images to ${fmt.label}`
                        }
                        onClick={() => setGlobalFormat(fmt.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                          isUnsupported
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'
                            : isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs cursor-pointer'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {fmt.label}
                        {isUnsupported ? ' (N/A)' : ''}
                      </button>
                    );
                  })}
                </div>
                {Object.entries(formatSupport).some(([, s]) => !s.supported) && (
                  <p className="text-[11px] text-slate-500 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      Disabled formats (N/A) cannot be encoded by your current browser&apos;s{' '}
                      <code className="font-mono">canvas.toBlob()</code> API. Hover any disabled button for details.
                    </span>
                  </p>
                )}
              </div>

              {/* Quality & Background Fill */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showQualitySlider && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <label htmlFor="image-quality-slider">Lossy Quality</label>
                      <span className="font-mono text-red-600">{quality}%</span>
                    </div>
                    <input
                      id="image-quality-slider"
                      type="range"
                      min={1}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1 (Smallest)</span>
                      <span>90 (Recommended)</span>
                      <span>100</span>
                    </div>
                  </div>
                )}

                {showBgColorPicker && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="image-bg-color-input"
                      className="block text-xs font-bold text-slate-800"
                    >
                      Transparent Fill (JPG / BMP)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="image-bg-color-input"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-9 w-12 rounded-lg border border-slate-300 bg-white p-0.5 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        {[
                          { label: 'White', hex: '#ffffff' },
                          { label: 'Slate', hex: '#f8fafc' },
                          { label: 'Black', hex: '#000000' },
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setBackgroundColor(preset.hex)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                              backgroundColor.toLowerCase() === preset.hex
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ICO Sizes Selector */}
            {showIcoOptions && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-800">
                  ICO Icon Sizes (px)
                </span>
                <div className="flex flex-wrap gap-2">
                  {ICO_AVAILABLE_SIZES.map((sz) => {
                    const checked = icoSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleIcoSize(sz)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                          checked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sz}×{sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resize & Naming Controls */}
            <div className="pt-3 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <label
                  htmlFor="resize-mode-select"
                  className="font-bold text-slate-800"
                >
                  Resize:
                </label>
                <select
                  id="resize-mode-select"
                  value={resizeMode}
                  onChange={(e) => setResizeMode(e.target.value as ResizeMode)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  <option value="original">Keep original size</option>
                  <option value="max">Set max width / height</option>
                  <option value="percent">Scale by percentage (%)</option>
                </select>

                {resizeMode === 'max' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-slate-700">
                      <span className="text-[11px]">W:</span>
                      <input
                        type="number"
                        min={16}
                        max={12000}
                        value={maxWidth}
                        onChange={(e) =>
                          setMaxWidth(Math.max(16, Number(e.target.value) || 1920))
                        }
                        aria-label="Maximum width in pixels"
                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900"
                      />
                    </label>
                    <button
                      type="button"
                      aria-pressed={lockAspectRatio}
                      onClick={() => setLockAspectRatio((prev) => !prev)}
                      title={
                        lockAspectRatio
                          ? 'Aspect ratio locked (proportional resize)'
                          : 'Aspect ratio unlocked'
                      }
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                        lockAspectRatio
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      {lockAspectRatio ? (
                        <Lock className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Unlock className="h-3 w-3" aria-hidden="true" />
                      )}
                      <span>Lock ratio</span>
                    </button>
                    <label className="inline-flex items-center gap-1 text-slate-700">
                      <span className="text-[11px]">H:</span>
                      <input
                        type="number"
                        min={16}
                        max={12000}
                        value={maxHeight}
                        onChange={(e) =>
                          setMaxHeight(Math.max(16, Number(e.target.value) || 1080))
                        }
                        aria-label="Maximum height in pixels"
                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900"
                      />
                    </label>
                  </div>
                )}

                {resizeMode === 'percent' && (
                  <label className="inline-flex items-center gap-1.5 text-slate-700">
                    <input
                      type="number"
                      min={5}
                      max={400}
                      value={scalePercent}
                      onChange={(e) =>
                        setScalePercent(
                          Math.min(400, Math.max(5, Number(e.target.value) || 50))
                        )
                      }
                      aria-label="Resize scale percentage"
                      className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900"
                    />
                    <span className="font-semibold">%</span>
                  </label>
                )}
              </div>

              {/* Keep original file names toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepOriginalNames}
                  onChange={(e) => setKeepOriginalNames(e.target.checked)}
                  className="h-4 w-4 accent-red-600 rounded cursor-pointer"
                />
                <span>Keep original file names</span>
              </label>
            </div>
          </div>

          {/* Primary Action Bar & Live Progress */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isConvertingBatch}
                    onClick={handleConvertBatch}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                      isConvertingBatch
                        ? 'bg-red-400 text-white cursor-wait'
                        : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                    }`}
                  >
                    {isConvertingBatch ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    )}
                    <span>
                      {isConvertingBatch
                        ? `Converting (${completedCount}/${totalBatchCount})...`
                        : `Convert (${items.length} ${items.length === 1 ? 'file' : 'files'})`}
                    </span>
                  </button>

                  {convertedItems.length > 0 && (
                    <button
                      type="button"
                      disabled={isCreatingZip || isConvertingBatch}
                      onClick={handleDownloadAllZip}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      {isCreatingZip ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Archive className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>Download all as ZIP ({convertedItems.length})</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isConvertingBatch}
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear all</span>
                </button>
              </div>

              {/* Sequential Progress Bar */}
              {(isConvertingBatch || totalBatchCount > 0) && (
                <div
                  aria-live="polite"
                  className="space-y-1.5 rounded-xl bg-slate-50 border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{liveStatusText}</span>
                    <span className="font-mono text-slate-900">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-200 motion-reduce:transition-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* File Queue List */}
              <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                {items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const deltaPct =
                    item.convertedSize && item.originalSize > 0
                      ? Math.round(
                          ((item.convertedSize - item.originalSize) /
                            item.originalSize) *
                            1000
                        ) / 10
                      : null;

                  return (
                    <li
                      key={item.id}
                      className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isSelected ? 'bg-red-50/35' : 'bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Thumbnail & Original Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setSelectedItemId(item.id)}
                          className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                          title="Inspect before/after preview"
                        >
                          <img
                            src={item.previewUrl}
                            alt={`Preview thumbnail of ${item.file.name}`}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItemId(item.id)}
                            className="text-left block w-full truncate text-xs sm:text-sm font-bold text-slate-900 hover:text-red-600 cursor-pointer"
                          >
                            {item.file.name}
                          </button>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                            <span className="font-mono font-semibold text-slate-700">
                              {item.inputFormat}
                            </span>
                            <span>·</span>
                            <span>{formatFileSize(item.originalSize)}</span>

                            {item.status === 'done' && item.convertedSize !== undefined && (
                              <>
                                <span>→</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {(item.convertedFormat || globalFormat).toUpperCase()}{' '}
                                  ({formatFileSize(item.convertedSize)})
                                </span>
                                {deltaPct !== null && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                                      deltaPct <= 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {deltaPct <= 0
                                      ? `${Math.abs(deltaPct)}% saved`
                                      : `+${deltaPct}% larger`}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {item.errorMessage && (
                            <p className="text-[11px] text-red-600 font-medium">
                              {item.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Per-file Override, Status & Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={item.formatOverride}
                          disabled={isConvertingBatch}
                          aria-label={`Output format override for ${item.file.name}`}
                          onChange={(e) => {
                            const val = e.target.value as
                              | ImageOutputFormat
                              | 'global';
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id
                                  ? { ...row, formatOverride: val }
                                  : row
                              )
                            );
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700"
                        >
                          <option value="global">
                            Use global ({globalFormat.toUpperCase()})
                          </option>
                          {OUTPUT_FORMATS.map((fmt) => {
                            const unsupported = !formatSupport[fmt.id]?.supported;
                            return (
                              <option
                                key={fmt.id}
                                value={fmt.id}
                                disabled={unsupported}
                              >
                                {fmt.label}
                                {unsupported ? ' (Unsupported)' : ''}
                              </option>
                            );
                          })}
                        </select>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold capitalize ${
                            item.status === 'done'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'converting'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.status === 'error'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status === 'done' && (
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          )}
                          {item.status === 'converting' && (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          )}
                          {item.status === 'error' && (
                            <AlertCircle className="h-3 w-3" aria-hidden="true" />
                          )}
                          <span>{item.status}</span>
                        </span>

                        {item.status === 'done' && item.convertedUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                          >
                            <Download className="h-3 w-3" aria-hidden="true" />
                            <span>Download</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isConvertingBatch}
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-[11px] font-semibold border border-slate-200 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                          <span className="hidden md:inline">Remove</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Before / After Preview for Selected File */}
              {selectedItem && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Eye className="h-4 w-4 text-red-600" aria-hidden="true" />
                      <span>Before / After Preview: {selectedItem.file.name}</span>
                    </span>
                    {selectedItem.srcWidth && selectedItem.outWidth && (
                      <span className="text-[11px] font-mono text-slate-600">
                        {selectedItem.srcWidth}×{selectedItem.srcHeight} px →{' '}
                        {selectedItem.outWidth}×{selectedItem.outHeight} px
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Before ({selectedItem.inputFormat})</span>
                        <span className="font-mono">
                          {formatFileSize(selectedItem.originalSize)}
                        </span>
                      </div>
                      <div className="aspect-video rounded-lg bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,#ffffff_25%,#ffffff_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={selectedItem.previewUrl}
                          alt={`Original image preview of ${selectedItem.file.name}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>
                          After (
                          {(
                            selectedItem.convertedFormat ||
                            (selectedItem.formatOverride === 'global'
                              ? globalFormat
                              : selectedItem.formatOverride)
                          ).toUpperCase()}
                          )
                        </span>
                        <span className="font-mono">
                          {selectedItem.convertedSize !== undefined
                            ? formatFileSize(selectedItem.convertedSize)
                            : 'Click Convert to preview'}
                        </span>
                      </div>
                      <div className="aspect-video rounded-lg bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,#ffffff_25%,#ffffff_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] border border-slate-200 overflow-hidden flex items-center justify-center">
                        {selectedItem.convertedUrl ? (
                          <img
                            src={selectedItem.convertedUrl}
                            alt={`Converted ${(
                              selectedItem.convertedFormat || globalFormat
                            ).toUpperCase()} preview of ${selectedItem.file.name}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 px-4 text-center">
                            Converted preview will appear here after you click Convert.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Required Privacy & Honest Limits Notes */}
          <div className="pt-2 border-t border-slate-200 text-center space-y-1 text-xs text-slate-500">
            <p className="font-medium text-slate-700 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                Your images are converted in your browser. Nothing is uploaded to a server.
              </span>
            </p>
            <p>
              Animated GIFs convert as a single frame. Metadata such as EXIF is removed during conversion.
            </p>
          </div>
        </div>
      </section>

      {/* PART 2 - LAZY-LOADED BELOW-THE-FOLD SEO CONTENT */}
      <Suspense
        fallback={
          <div className="py-8 text-center text-xs text-slate-500">
            Loading format guide and frequently asked questions...
          </div>
        }
      >
        <ImageConverterSeoContent
          routeConfig={routeConfig}
          onScrollToDropZone={handleScrollToDropZone}
          onNavigate={onNavigate}
        />
      </Suspense>
    </div>
  );
};
