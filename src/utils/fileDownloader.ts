/**
 * Utility to download generated files directly in browser
 */

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Downloads image file from URL as an actual file
 */
export async function downloadImageAsFile(imgUrl: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(imgUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return true;
    }
  } catch {
    // If CORS blocks direct fetch, draw image onto offscreen canvas
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
        if (blob) {
          triggerBlobDownload(blob, filename);
          return true;
        }
      }
    } catch {
      // Fallback: open link in tab if blob failed
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = filename;
      a.target = '_blank';
      a.click();
      return true;
    }
  }
  return false;
}

/**
 * Generates an actual, playable WAV audio file with pleasant musical chords using Web Audio API
 */
export async function generatePlayableAudioFile(title: string, durationSeconds: number = 8): Promise<Blob> {
  // We generate a valid 44.1kHz 16-bit PCM WAV file
  const sampleRate = 44100;
  const clipLength = Math.min(10, Math.max(3, durationSeconds)); // 3-10 sec pleasant preview
  const numSamples = sampleRate * clipLength;
  const numChannels = 2; // Stereo
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // Bits per sample (16 bits)
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Pentatonic melody chords for a pleasing sound
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C, E, G, C5, E5
  let offset = 44;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Harmonic bell/synth tones
    const noteIndex = Math.floor(t * 2) % notes.length;
    const freq = notes[noteIndex];
    const envelope = Math.exp(-((t % 0.5) * 4)); // pluck decay

    const sample = Math.sin(2 * Math.PI * freq * t) * 0.4 * envelope +
                   Math.sin(2 * Math.PI * (freq * 2) * t) * 0.15 * envelope +
                   Math.sin(2 * Math.PI * 130.81 * t) * 0.2; // warm bass note

    // Clamp
    const clamped = Math.max(-1, Math.min(1, sample));
    const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;

    // Left and Right channels
    view.setInt16(offset, intSample, true);
    view.setInt16(offset + 2, intSample, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generates formatted subtitle text (SRT or VTT)
 */
export function generateSubtitleContent(
  videoTitle: string,
  language: string,
  format: 'srt' | 'vtt' | 'txt'
): string {
  const lines = [
    { start: '00:00:01,000', end: '00:00:04,500', text: `[TubeStream] ${videoTitle}` },
    { start: '00:00:05,000', end: '00:00:09,200', text: 'Welcome to this presentation. Let’s get started.' },
    { start: '00:00:10,000', end: '00:00:15,800', text: 'In today’s episode, we explore the core concepts and highlights.' },
    { start: '00:00:16,500', end: '00:00:22,000', text: 'Notice how every detail comes together seamlessly in high fidelity.' },
    { start: '00:00:23,000', end: '00:00:29,400', text: 'Thank you for watching and supporting the channel.' },
    { start: '00:00:30,000', end: '00:00:35,000', text: 'Don’t forget to like and subscribe for more content.' }
  ];

  if (format === 'vtt') {
    let out = 'WEBVTT\n\n';
    lines.forEach((item, idx) => {
      out += `${idx + 1}\n`;
      out += `${item.start.replace(',', '.')} --> ${item.end.replace(',', '.')}\n`;
      out += `${item.text}\n\n`;
    });
    return out;
  }

  if (format === 'srt') {
    let out = '';
    lines.forEach((item, idx) => {
      out += `${idx + 1}\n`;
      out += `${item.start} --> ${item.end}\n`;
      out += `${item.text}\n\n`;
    });
    return out;
  }

  // txt
  return lines.map(l => `[${l.start.slice(3, 8)}] ${l.text}`).join('\n');
}

/**
 * Clean sanitization of filenames
 */
export function sanitizeFilename(str: string): string {
  return str
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim()
    .slice(0, 80);
}
