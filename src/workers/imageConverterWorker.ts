import type { ImageOutputFormat } from '../data/imageConverterSeo';
import {
  computeTargetDimensions,
  encodeBmp24FromRgba,
  encodeIcoFromPngBuffers,
  OUTPUT_FORMAT_MAP,
  type IcoSizeOption,
  type ResizeConfig,
} from '../utils/imageEncoding';

interface WorkerConvertRequest {
  id: string;
  sourceBlob: Blob;
  format: ImageOutputFormat;
  quality: number;
  backgroundColor: string;
  resize: ResizeConfig;
  icoSizes: IcoSizeOption[];
}

interface WorkerConvertResponse {
  id: string;
  ok: boolean;
  blob?: Blob;
  srcWidth?: number;
  srcHeight?: number;
  width?: number;
  height?: number;
  error?: string;
}

self.onmessage = async (event: MessageEvent<WorkerConvertRequest>) => {
  const { id, sourceBlob, format, quality, backgroundColor, resize, icoSizes } =
    event.data;

  let bitmap: ImageBitmap | null = null;
  try {
    if (
      typeof createImageBitmap !== 'function' ||
      typeof OffscreenCanvas === 'undefined'
    ) {
      throw new Error('OffscreenCanvas or createImageBitmap unavailable in worker');
    }

    bitmap = await createImageBitmap(sourceBlob);
    const srcWidth = bitmap.width;
    const srcHeight = bitmap.height;

    if (format === 'ico') {
      const validSizes = (icoSizes.length ? icoSizes : [32]).slice().sort((a, b) => a - b);
      const frames: { size: number; pngBuffer: ArrayBuffer }[] = [];

      for (const size of validSizes) {
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to acquire OffscreenCanvas 2D context');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, size, size);

        // Preserve aspect ratio centered in square ICO canvas
        const scale = Math.min(size / srcWidth, size / srcHeight);
        const drawW = Math.max(1, Math.round(srcWidth * scale));
        const drawH = Math.max(1, Math.round(srcHeight * scale));
        const dx = Math.floor((size - drawW) / 2);
        const dy = Math.floor((size - drawH) / 2);
        ctx.drawImage(bitmap, dx, dy, drawW, drawH);

        const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
        const pngBuffer = await pngBlob.arrayBuffer();
        frames.push({ size, pngBuffer });
      }

      const icoBlob = encodeIcoFromPngBuffers(frames);
      const largest = validSizes[validSizes.length - 1] || 32;
      const response: WorkerConvertResponse = {
        id,
        ok: true,
        blob: icoBlob,
        srcWidth,
        srcHeight,
        width: largest,
        height: largest,
      };
      self.postMessage(response);
      return;
    }

    const { width, height } = computeTargetDimensions(srcWidth, srcHeight, resize);
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to acquire OffscreenCanvas 2D context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const meta = OUTPUT_FORMAT_MAP[format];
    if (!meta.supportsTransparency) {
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    let outBlob: Blob;
    if (format === 'bmp') {
      const imgData = ctx.getImageData(0, 0, width, height);
      outBlob = encodeBmp24FromRgba(imgData.data, width, height);
    } else {
      const q = Math.min(1, Math.max(0.01, quality / 100));
      outBlob = await canvas.convertToBlob({
        type: meta.mime,
        ...(meta.isLossy ? { quality: q } : {}),
      });
      if (outBlob.type !== meta.mime) {
        throw new Error(`Browser worker could not encode MIME ${meta.mime}`);
      }
    }

    const response: WorkerConvertResponse = {
      id,
      ok: true,
      blob: outBlob,
      srcWidth,
      srcHeight,
      width,
      height,
    };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerConvertResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : 'Worker image conversion failed',
    };
    self.postMessage(response);
  } finally {
    if (bitmap) {
      try {
        bitmap.close();
      } catch {
        // Ignore
      }
    }
  }
};
