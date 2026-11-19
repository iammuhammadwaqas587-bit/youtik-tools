import type { ImageOutputFormat } from '../data/imageConverterSeo';

export type ResizeMode = 'original' | 'max' | 'percent';

export type IcoSizeOption = 16 | 32 | 48 | 64 | 128 | 256;

export interface ResizeConfig {
  mode: ResizeMode;
  maxWidth: number;
  maxHeight: number;
  percent: number;
  lockAspectRatio: boolean;
}

export interface OutputFormatMeta {
  id: ImageOutputFormat;
  label: string;
  extension: string;
  mime: string;
  isLossy: boolean;
  supportsTransparency: boolean;
}

export const ICO_AVAILABLE_SIZES: IcoSizeOption[] = [16, 32, 48, 64, 128, 256];

export const OUTPUT_FORMATS: OutputFormatMeta[] = [
  {
    id: 'jpg',
    label: 'JPG',
    extension: 'jpg',
    mime: 'image/jpeg',
    isLossy: true,
    supportsTransparency: false,
  },
  {
    id: 'png',
    label: 'PNG',
    extension: 'png',
    mime: 'image/png',
    isLossy: false,
    supportsTransparency: true,
  },
  {
    id: 'webp',
    label: 'WebP',
    extension: 'webp',
    mime: 'image/webp',
    isLossy: true,
    supportsTransparency: true,
  },
  {
    id: 'avif',
    label: 'AVIF',
    extension: 'avif',
    mime: 'image/avif',
    isLossy: true,
    supportsTransparency: true,
  },
  {
    id: 'bmp',
    label: 'BMP',
    extension: 'bmp',
    mime: 'image/bmp',
    isLossy: false,
    supportsTransparency: false,
  },
  {
    id: 'ico',
    label: 'ICO',
    extension: 'ico',
    mime: 'image/x-icon',
    isLossy: false,
    supportsTransparency: true,
  },
];

export const OUTPUT_FORMAT_MAP: Record<ImageOutputFormat, OutputFormatMeta> =
  OUTPUT_FORMATS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<ImageOutputFormat, OutputFormatMeta>);

export function computeTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  resize: ResizeConfig
): { width: number; height: number } {
  const safeW = Math.max(1, Math.round(srcWidth));
  const safeH = Math.max(1, Math.round(srcHeight));

  if (resize.mode === 'original') {
    return { width: safeW, height: safeH };
  }

  if (resize.mode === 'percent') {
    const pct = Math.min(400, Math.max(5, Number(resize.percent) || 100));
    const scale = pct / 100;
    return {
      width: Math.max(1, Math.round(safeW * scale)),
      height: Math.max(1, Math.round(safeH * scale)),
    };
  }

  // mode === 'max'
  const targetMaxW = Math.max(1, Number(resize.maxWidth) || safeW);
  const targetMaxH = Math.max(1, Number(resize.maxHeight) || safeH);

  if (!resize.lockAspectRatio) {
    return {
      width: Math.min(safeW, targetMaxW),
      height: Math.min(safeH, targetMaxH),
    };
  }

  const ratio = Math.min(targetMaxW / safeW, targetMaxH / safeH, 1);
  return {
    width: Math.max(1, Math.round(safeW * ratio)),
    height: Math.max(1, Math.round(safeH * ratio)),
  };
}

/**
 * Encodes raw RGBA pixels into a standards-compliant 24-bit uncompressed Windows BMP Blob.
 */
export function encodeBmp24FromRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): Blob {
  const rowSize = (width * 3 + 3) & ~3; // padded to 4-byte boundary
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 54, true); // offset to pixel array

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bpp
  view.setUint32(30, 0, true); // BI_RGB
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  // Bottom-up pixel rows, BGR channel order
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    const srcRowStart = srcY * width * 4;
    const dstRowStart = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const s = srcRowStart + x * 4;
      const d = dstRowStart + x * 3;
      bytes[d] = rgba[s + 2]; // B
      bytes[d + 1] = rgba[s + 1]; // G
      bytes[d + 2] = rgba[s]; // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Packages one or more PNG-encoded square frames into a multi-resolution Windows ICO file.
 */
export function encodeIcoFromPngBuffers(
  frames: { size: number; pngBuffer: ArrayBuffer }[]
): Blob {
  const count = frames.length;
  const headerSize = 6 + count * 16;
  let totalSize = headerSize;
  for (const f of frames) {
    totalSize += f.pngBuffer.byteLength;
  }

  const output = new Uint8Array(totalSize);
  const view = new DataView(output.buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type = 1 (icon)
  view.setUint16(4, count, true);

  let dataOffset = headerSize;
  for (let i = 0; i < count; i++) {
    const frame = frames[i];
    const entryOffset = 6 + i * 16;
    const dimByte = frame.size >= 256 ? 0 : frame.size;

    view.setUint8(entryOffset, dimByte); // width
    view.setUint8(entryOffset + 1, dimByte); // height
    view.setUint8(entryOffset + 2, 0); // palette color count
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bpp
    view.setUint32(entryOffset + 8, frame.pngBuffer.byteLength, true);
    view.setUint32(entryOffset + 12, dataOffset, true);

    output.set(new Uint8Array(frame.pngBuffer), dataOffset);
    dataOffset += frame.pngBuffer.byteLength;
  }

  return new Blob([output], { type: 'image/x-icon' });
}
