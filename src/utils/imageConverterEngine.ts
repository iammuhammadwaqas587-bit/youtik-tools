import type { ImageOutputFormat } from '../data/imageConverterSeo';
import {
  computeTargetDimensions,
  encodeBmp24FromRgba,
  encodeIcoFromPngBuffers,
  OUTPUT_FORMAT_MAP,
  OUTPUT_FORMATS,
  type IcoSizeOption,
  type ResizeConfig,
} from './imageEncoding';

export interface FormatSupportStatus {
  supported: boolean;
  reason?: string;
}

export type FormatSupportMap = Record<ImageOutputFormat, FormatSupportStatus>;

export interface ConvertImageOptions {
  format: ImageOutputFormat;
  quality: number; // 1-100
  backgroundColor: string;
  resize: ResizeConfig;
  icoSizes: IcoSizeOption[];
}

export interface ConvertImageResult {
  blob: Blob;
  srcWidth: number;
  srcHeight: number;
  width: number;
  height: number;
  outputFormat: ImageOutputFormat;
  engine: 'worker' | 'main-thread';
}

export const MAX_IMAGE_FILES = 50;
export const MAX_IMAGE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

const SUPPORTED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'avif',
  'svg',
  'heic',
  'heif',
]);

const SUPPORTED_MIME_PREFIXES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/x-ms-bmp',
  'image/avif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
];

export function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx + 1).toLowerCase().trim();
}

export function isHeicFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  return (
    ext === 'heic' ||
    ext === 'heif' ||
    mime === 'image/heic' ||
    mime === 'image/heif'
  );
}

export function isSvgFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  return ext === 'svg' || mime === 'image/svg+xml';
}

export function isAcceptedImageFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  if (SUPPORTED_EXTENSIONS.has(ext)) return true;
  if (SUPPORTED_MIME_PREFIXES.includes(mime)) return true;
  return false;
}

export function detectFriendlyInputFormat(file: File): string {
  const ext = getFileExtension(file.name);
  if (ext === 'jpeg') return 'JPG';
  if (ext) return ext.toUpperCase();
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('jpeg')) return 'JPG';
  if (mime.includes('png')) return 'PNG';
  if (mime.includes('webp')) return 'WebP';
  if (mime.includes('gif')) return 'GIF';
  if (mime.includes('bmp')) return 'BMP';
  if (mime.includes('avif')) return 'AVIF';
  if (mime.includes('svg')) return 'SVG';
  if (mime.includes('heic')) return 'HEIC';
  if (mime.includes('heif')) return 'HEIF';
  return 'IMAGE';
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function testCanvasToBlobMime(mime: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof document === 'undefined') {
        resolve(mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof canvas.toBlob !== 'function') {
        resolve(false);
        return;
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 2, 2);
      canvas.toBlob(
        (blob) => {
          resolve(Boolean(blob && blob.type === mime));
        },
        mime,
        0.9
      );
    } catch {
      resolve(false);
    }
  });
}

/**
 * Tests runtime Canvas encoding support for every output format via canvas.toBlob
 * and checks returned MIME types accurately.
 */
export async function detectBrowserOutputSupport(): Promise<FormatSupportMap> {
  const results = await Promise.all(
    OUTPUT_FORMATS.map(async (fmt) => {
      if (fmt.id === 'bmp' || fmt.id === 'ico') {
        // BMP encodes directly from Canvas 2D getImageData; ICO wraps Canvas PNG frames
        const pngOk = await testCanvasToBlobMime('image/png');
        return [
          fmt.id,
          pngOk
            ? { supported: true }
            : {
                supported: false,
                reason: `This browser could not create Canvas pixel data for ${fmt.label}.`,
              },
        ] as const;
      }
      const supported = await testCanvasToBlobMime(fmt.mime);
      return [
        fmt.id,
        supported
          ? { supported: true }
          : {
              supported: false,
              reason: `Your browser's canvas.toBlob() does not support encoding ${fmt.label} (${fmt.mime}). Try Chrome, Edge, or Firefox.`,
            },
      ] as const;
    })
  );

  return Object.fromEntries(results) as FormatSupportMap;
}

/**
 * Lazy-loads `heic2any` only when a HEIC/HEIF file is actually decoded.
 */
export async function decodeHeicToPngBlob(file: File): Promise<Blob> {
  const mod = await import('heic2any');
  const heic2any = mod.default || (mod as unknown as (opts: any) => Promise<Blob | Blob[]>);
  const result = await heic2any({
    blob: file,
    toType: 'image/png',
    quality: 1,
  });
  return Array.isArray(result) ? result[0] : result;
}

function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Canvas returned empty blob for ${mime}`));
          return;
        }
        if (blob.type !== mime) {
          reject(
            new Error(
              `Browser fell back to ${blob.type || 'unknown'} instead of ${mime}`
            )
          );
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

function loadImageElementFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Browser could not decode this image file.'));
    };
    img.src = url;
  });
}

function runWorkerConversion(
  sourceBlob: Blob,
  options: ConvertImageOptions
): Promise<Omit<ConvertImageResult, 'engine'>> {
  return new Promise((resolve, reject) => {
    if (
      typeof Worker === 'undefined' ||
      typeof OffscreenCanvas === 'undefined' ||
      typeof createImageBitmap !== 'function'
    ) {
      reject(new Error('Worker conversion not supported'));
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker(
        new URL('../workers/imageConverterWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      reject(err);
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const cleanup = () => {
      try {
        worker.terminate();
      } catch {
        // Ignore
      }
    };

    worker.onmessage = (e: MessageEvent<any>) => {
      const payload = e.data;
      if (!payload || payload.id !== requestId) return;
      cleanup();
      if (payload.ok && payload.blob) {
        resolve({
          blob: payload.blob,
          srcWidth: payload.srcWidth,
          srcHeight: payload.srcHeight,
          width: payload.width,
          height: payload.height,
          outputFormat: options.format,
        });
      } else {
        reject(new Error(payload.error || 'Worker conversion error'));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(err.message || 'Worker execution failed'));
    };

    worker.postMessage({
      id: requestId,
      sourceBlob,
      format: options.format,
      quality: options.quality,
      backgroundColor: options.backgroundColor,
      resize: options.resize,
      icoSizes: options.icoSizes,
    });
  });
}

async function runMainThreadConversion(
  sourceBlob: Blob,
  isSvg: boolean,
  options: ConvertImageOptions
): Promise<Omit<ConvertImageResult, 'engine'>> {
  let bitmap: ImageBitmap | null = null;
  let imgEl: HTMLImageElement | null = null;
  let srcWidth = 0;
  let srcHeight = 0;

  try {
    if (!isSvg && typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(sourceBlob);
        srcWidth = bitmap.width;
        srcHeight = bitmap.height;
      } catch {
        bitmap = null;
      }
    }

    if (!bitmap) {
      imgEl = await loadImageElementFromBlob(sourceBlob);
      srcWidth = imgEl.naturalWidth || (isSvg ? 1024 : 512);
      srcHeight = imgEl.naturalHeight || (isSvg ? 1024 : 512);
    }

    const drawable = (bitmap || imgEl) as CanvasImageSource;

    if (options.format === 'ico') {
      const validSizes = (options.icoSizes.length ? options.icoSizes : [32])
        .slice()
        .sort((a, b) => a - b);
      const frames: { size: number; pngBuffer: ArrayBuffer }[] = [];

      for (const size of validSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to initialize 2D canvas context');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, size, size);

        const scale = Math.min(size / srcWidth, size / srcHeight);
        const drawW = Math.max(1, Math.round(srcWidth * scale));
        const drawH = Math.max(1, Math.round(srcHeight * scale));
        const dx = Math.floor((size - drawW) / 2);
        const dy = Math.floor((size - drawH) / 2);
        ctx.drawImage(drawable, dx, dy, drawW, drawH);

        const pngBlob = await canvasToBlobAsync(canvas, 'image/png');
        const pngBuffer = await pngBlob.arrayBuffer();
        frames.push({ size, pngBuffer });
      }

      const icoBlob = encodeIcoFromPngBuffers(frames);
      const largest = validSizes[validSizes.length - 1] || 32;
      return {
        blob: icoBlob,
        srcWidth,
        srcHeight,
        width: largest,
        height: largest,
        outputFormat: 'ico',
      };
    }

    const { width, height } = computeTargetDimensions(
      srcWidth,
      srcHeight,
      options.resize
    );
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to initialize 2D canvas context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const meta = OUTPUT_FORMAT_MAP[options.format];
    if (!meta.supportsTransparency) {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(drawable, 0, 0, width, height);

    let outBlob: Blob;
    if (options.format === 'bmp') {
      const imgData = ctx.getImageData(0, 0, width, height);
      outBlob = encodeBmp24FromRgba(imgData.data, width, height);
    } else {
      const q = Math.min(1, Math.max(0.01, options.quality / 100));
      outBlob = await canvasToBlobAsync(
        canvas,
        meta.mime,
        meta.isLossy ? q : undefined
      );
    }

    return {
      blob: outBlob,
      srcWidth,
      srcHeight,
      width,
      height,
      outputFormat: options.format,
    };
  } finally {
    if (bitmap) {
      try {
        bitmap.close();
      } catch {
        // Ignore
      }
    }
  }
}

export async function convertImageFile(
  file: File,
  options: ConvertImageOptions,
  preDecodedBlob?: Blob
): Promise<ConvertImageResult> {
  const isSvg = isSvgFile(file);
  let sourceBlob: Blob = preDecodedBlob || file;

  if (!preDecodedBlob && isHeicFile(file)) {
    sourceBlob = await decodeHeicToPngBlob(file);
  }

  // SVGs require DOM Image decoding reliably; all raster images prefer Web Worker + OffscreenCanvas
  if (!isSvg) {
    try {
      const workerResult = await runWorkerConversion(sourceBlob, options);
      return { ...workerResult, engine: 'worker' };
    } catch {
      // Fall through seamlessly to main-thread Canvas fallback
    }
  }

  const mainResult = await runMainThreadConversion(sourceBlob, isSvg, options);
  return { ...mainResult, engine: 'main-thread' };
}

export function buildOutputFileName(
  originalName: string,
  index: number,
  outputFormat: ImageOutputFormat,
  keepOriginalNames: boolean
): string {
  const ext = OUTPUT_FORMAT_MAP[outputFormat].extension;
  if (!keepOriginalNames) {
    return `converted-image-${index + 1}.${ext}`;
  }
  const dotIdx = originalName.lastIndexOf('.');
  const base = dotIdx > 0 ? originalName.slice(0, dotIdx) : originalName;
  const safeBase = base.replace(/[<>:"/\\|?*]+/g, '-').trim() || `image-${index + 1}`;
  return `${safeBase}.${ext}`;
}
