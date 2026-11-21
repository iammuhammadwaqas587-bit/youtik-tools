import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  QrCode,
  ScanLine,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Upload,
  Trash2,
  AlertTriangle,
  Camera,
  CameraOff,
  ExternalLink,
  Link as LinkIcon,
  Type,
  MessageCircle,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Contact,
} from 'lucide-react';

interface QrCodeGeneratorPageProps {
  onNavigate: (path: string) => void;
}

type MainMode = 'generator' | 'scanner';
type QrContentType =
  | 'url'
  | 'text'
  | 'whatsapp'
  | 'wifi'
  | 'email'
  | 'phone'
  | 'sms'
  | 'vcard';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

function escapeWifiField(val: string): string {
  return val.replace(/([\\;,:"])/g, '\\$1');
}

function escapeVCardField(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function parseHexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return null;
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastInfo(fgHex: string, bgHex: string): {
  ratio: number;
  fgLum: number;
  bgLum: number;
  isLowContrast: boolean;
  isInverted: boolean;
} {
  const fgRgb = parseHexToRgb(fgHex) || [15, 23, 42];
  const bgRgb = parseHexToRgb(bgHex) || [255, 255, 255];
  const fgLum = relativeLuminance(fgRgb);
  const bgLum = relativeLuminance(bgRgb);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return {
    ratio,
    fgLum,
    bgLum,
    isLowContrast: ratio < 3.0,
    isInverted: fgLum > bgLum,
  };
}

function getSafeHttpUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export const QrCodeGeneratorPage: React.FC<QrCodeGeneratorPageProps> = ({
  onNavigate,
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
      );
    } catch {
      return false;
    }
  });

  const [mainMode, setMainMode] = useState<MainMode>('generator');
  const [qrType, setQrType] = useState<QrContentType>('url');

  // Content fields per QR type
  const [urlValue, setUrlValue] = useState<string>('https://youtiktools.com');
  const [textValue, setTextValue] = useState<string>('Hello from YouTikTools!');
  const [waPhone, setWaPhone] = useState<string>('923001234567');
  const [waMessage, setWaMessage] = useState<string>('Assalam-o-Alaikum! I found this via QR.');
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('password123');
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('hello@example.com');
  const [emailSubject, setEmailSubject] = useState<string>('Quick Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hi there,');
  const [phoneNumber, setPhoneNumber] = useState<string>('+923001234567');
  const [smsPhone, setSmsPhone] = useState<string>('+923001234567');
  const [smsMessage, setSmsMessage] = useState<string>('Please call me back.');
  const [vcardName, setVcardName] = useState<string>('Ali Hassan');
  const [vcardPhone, setVcardPhone] = useState<string>('+923001234567');
  const [vcardEmail, setVcardEmail] = useState<string>('ali@example.com');
  const [vcardCompany, setVcardCompany] = useState<string>('Studio One');
  const [vcardWebsite, setVcardWebsite] = useState<string>('https://example.com');

  // Customization
  const [qrSize, setQrSize] = useState<number>(400);
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M');
  const [margin, setMargin] = useState<number>(2);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyNote, setCopyNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Scanner state
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedCopied, setScannedCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanFileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveEcLevel: ErrorCorrectionLevel = logoDataUrl ? 'H' : ecLevel;

  const payload = useMemo(() => {
    switch (qrType) {
      case 'url':
        return urlValue.trim();
      case 'text':
        return textValue;
      case 'whatsapp': {
        const digits = waPhone.replace(/[^\d]/g, '');
        if (!digits) return '';
        const msg = waMessage.trim();
        return msg
          ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
          : `https://wa.me/${digits}`;
      }
      case 'wifi': {
        const ssid = wifiSsid.trim();
        if (!ssid) return '';
        const passPart = wifiSecurity === 'nopass' ? '' : `P:${escapeWifiField(wifiPassword)};`;
        const hiddenPart = wifiHidden ? 'H:true;' : '';
        return `WIFI:T:${wifiSecurity};S:${escapeWifiField(ssid)};${passPart}${hiddenPart};`;
      }
      case 'email': {
        const addr = emailAddress.trim();
        if (!addr) return '';
        const params = new URLSearchParams();
        if (emailSubject.trim()) params.set('subject', emailSubject.trim());
        if (emailBody.trim()) params.set('body', emailBody.trim());
        const q = params.toString();
        return q ? `mailto:${addr}?${q}` : `mailto:${addr}`;
      }
      case 'phone': {
        const clean = phoneNumber.replace(/[^\d+]/g, '');
        return clean ? `tel:${clean}` : '';
      }
      case 'sms': {
        const clean = smsPhone.replace(/[^\d+]/g, '');
        if (!clean) return '';
        return `smsto:${clean}:${smsMessage}`;
      }
      case 'vcard': {
        const name = vcardName.trim();
        if (!name && !vcardPhone.trim() && !vcardEmail.trim()) return '';
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${escapeVCardField(name || 'Contact')}`,
          `N:${escapeVCardField(name || 'Contact')};;;;`,
        ];
        if (vcardCompany.trim()) lines.push(`ORG:${escapeVCardField(vcardCompany.trim())}`);
        if (vcardPhone.trim()) lines.push(`TEL;TYPE=CELL:${vcardPhone.trim()}`);
        if (vcardEmail.trim()) lines.push(`EMAIL:${vcardEmail.trim()}`);
        if (vcardWebsite.trim()) lines.push(`URL:${vcardWebsite.trim()}`);
        lines.push('END:VCARD');
        return lines.join('\n');
      }
    }
  }, [
    qrType,
    urlValue,
    textValue,
    waPhone,
    waMessage,
    wifiSsid,
    wifiPassword,
    wifiSecurity,
    wifiHidden,
    emailAddress,
    emailSubject,
    emailBody,
    phoneNumber,
    smsPhone,
    smsMessage,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardCompany,
    vcardWebsite,
  ]);

  const contrast = useMemo(() => getContrastInfo(fgColor, bgColor), [fgColor, bgColor]);

  // Load logo image element whenever logoDataUrl changes
  useEffect(() => {
    if (!logoDataUrl) {
      logoImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      logoImgRef.current = img;
    };
    img.src = logoDataUrl;
  }, [logoDataUrl]);

  // Render QR code to Canvas & SVG whenever inputs change
  useEffect(() => {
    let cancelled = false;

    const renderQr = async () => {
      const canvas = canvasRef.current;
      if (!payload) {
        setSvgMarkup('');
        setRenderError(null);
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      try {
        if (canvas) {
          await QRCode.toCanvas(canvas, payload, {
            width: qrSize,
            margin,
            errorCorrectionLevel: effectiveEcLevel,
            color: {
              dark: fgColor,
              light: bgColor,
            },
          });

          if (logoDataUrl) {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              if (logoImgRef.current && logoImgRef.current.complete) {
                resolve(logoImgRef.current);
                return;
              }
              const tempImg = new Image();
              tempImg.onload = () => resolve(tempImg);
              tempImg.onerror = () => reject(new Error('Could not draw logo image.'));
              tempImg.src = logoDataUrl;
            });

            const ctx = canvas.getContext('2d');
            if (ctx && !cancelled) {
              const boxSize = Math.round(qrSize * 0.22);
              const pad = Math.max(4, Math.round(boxSize * 0.14));
              const cx = Math.round((qrSize - boxSize) / 2);
              const cy = Math.round((qrSize - boxSize) / 2);

              ctx.fillStyle = bgColor;
              ctx.beginPath();
              ctx.roundRect(
                cx - pad,
                cy - pad,
                boxSize + pad * 2,
                boxSize + pad * 2,
                Math.max(6, Math.round(pad * 1.2))
              );
              ctx.fill();

              ctx.drawImage(img, cx, cy, boxSize, boxSize);
            }
          }
        }

        let svg = await QRCode.toString(payload, {
          type: 'svg',
          width: qrSize,
          margin,
          errorCorrectionLevel: effectiveEcLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        if (logoDataUrl && svg.includes('</svg>')) {
          const boxPercent = 22;
          const padPercent = 26;
          const logoOffset = (100 - boxPercent) / 2;
          const padOffset = (100 - padPercent) / 2;
          const escapedHref = logoDataUrl.replace(/"/g, '&quot;');
          const overlay = `<rect x="${padOffset}%" y="${padOffset}%" width="${padPercent}%" height="${padPercent}%" rx="3%" fill="${bgColor}"/><image href="${escapedHref}" x="${logoOffset}%" y="${logoOffset}%" width="${boxPercent}%" height="${boxPercent}%" preserveAspectRatio="xMidYMid meet"/>`;
          svg = svg.replace('</svg>', `${overlay}</svg>`);
        }

        if (!cancelled) {
          setSvgMarkup(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setRenderError(err?.message || 'Unable to generate QR code for this input.');
        }
      }
    };

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [payload, qrSize, margin, effectiveEcLevel, fgColor, bgColor, logoDataUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Please choose an image file (PNG, JPG, SVG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('Logo image must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoDataUrl(reader.result);
      }
    };
    reader.onerror = () => setLogoError('Failed to read selected logo file.');
    reader.readAsDataURL(file);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${qrType}-${qrSize}px.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup || !payload) return;
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${qrType}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    setCopyNote(null);

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not encode PNG.');
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopyStatus('copied');
        window.setTimeout(() => setCopyStatus('idle'), 2000);
      } else {
        await navigator.clipboard.writeText(payload);
        setCopyStatus('copied');
        setCopyNote('Browser blocked image clipboard; copied QR content text instead.');
        window.setTimeout(() => setCopyStatus('idle'), 2400);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(payload);
        setCopyStatus('copied');
        setCopyNote('Image clipboard blocked in this context; copied QR payload text instead.');
        window.setTimeout(() => setCopyStatus('idle'), 2400);
      } catch {
        setCopyStatus('error');
        setCopyNote('Clipboard permission denied. Use Download PNG or SVG below.');
      }
    }
  };

  const handleReset = () => {
    setQrType('url');
    setUrlValue('https://youtiktools.com');
    setTextValue('Hello from YouTikTools!');
    setWaPhone('923001234567');
    setWaMessage('Assalam-o-Alaikum! I found this via QR.');
    setWifiSsid('MyHomeWiFi');
    setWifiPassword('password123');
    setWifiSecurity('WPA');
    setWifiHidden(false);
    setEmailAddress('hello@example.com');
    setEmailSubject('Quick Inquiry');
    setEmailBody('Hi there,');
    setPhoneNumber('+923001234567');
    setSmsPhone('+923001234567');
    setSmsMessage('Please call me back.');
    setVcardName('Ali Hassan');
    setVcardPhone('+923001234567');
    setVcardEmail('ali@example.com');
    setVcardCompany('Studio One');
    setVcardWebsite('https://example.com');
    setQrSize(400);
    setFgColor('#0f172a');
    setBgColor('#ffffff');
    setEcLevel('M');
    setMargin(2);
    setLogoDataUrl(null);
    setLogoError(null);
    setCopyStatus('idle');
    setCopyNote(null);
  };

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanningCamera(false);
  }, []);

  useEffect(() => {
    if (mainMode !== 'scanner') {
      stopCamera();
    }
  }, [mainMode, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setScannerError(null);
    setScannedResult(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setScannerError('Camera scanning requires a modern browser over HTTPS (or localhost). Upload a QR image instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setIsScanningCamera(true);

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const scanFrame = () => {
        if (!streamRef.current || !videoRef.current || !scanCanvasRef.current) return;
        const vid = videoRef.current;
        if (vid.readyState === vid.HAVE_ENOUGH_DATA && vid.videoWidth > 0 && vid.videoHeight > 0) {
          const canvas = scanCanvasRef.current;
          canvas.width = vid.videoWidth;
          canvas.height = vid.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data) {
              setScannedResult(code.data);
              stopCamera();
              return;
            }
          }
        }
        rafRef.current = requestAnimationFrame(scanFrame);
      };

      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      stopCamera();
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setScannerError('Camera permission was denied. Allow camera access in your browser settings or upload a QR image below.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setScannerError('No camera was found on this device. Upload a QR code image to decode it.');
      } else {
        setScannerError(err?.message || 'Unable to start camera. Try uploading a QR code image instead.');
      }
    }
  };

  const handleScanImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannerError(null);
    setScannedResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (decoded && decoded.data) {
          setScannedResult(decoded.data);
        } else {
          setScannerError('No QR code could be detected in that image. Try a sharper, uncropped QR photo.');
        }
      } catch {
        setScannerError('Could not read pixels from the uploaded image.');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setScannerError('Invalid or corrupted image file.');
    };
    img.src = url;
  };

  const scannedSafeUrl = useMemo(
    () => (scannedResult ? getSafeHttpUrl(scannedResult) : null),
    [scannedResult]
  );

  const typeTabs: Array<{ id: QrContentType; label: string; icon: React.ReactNode }> = [
    { id: 'url', label: 'URL', icon: <LinkIcon className="h-3.5 w-3.5" /> },
    { id: 'text', label: 'Plain Text', icon: <Type className="h-3.5 w-3.5" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="h-3.5 w-3.5" /> },
    { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="h-3.5 w-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-3.5 w-3.5" /> },
    { id: 'phone', label: 'Phone', icon: <Phone className="h-3.5 w-3.5" /> },
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: 'vcard', label: 'vCard', icon: <Contact className="h-3.5 w-3.5" /> },
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Image Format Converter',
      path: '/image-converter',
      description: 'Convert PNG, WebP, SVG & JPG images locally in your browser.',
      icon: '🖼️',
    },
    {
      name: 'YouTube Thumbnail Downloader',
      path: '/youtube-thumbnail-downloader',
      description: 'Grab Maxres HD 1280x720 thumbnails from any YouTube link.',
      icon: '📸',
    },
    {
      name: 'YouTube Tag Generator',
      path: '/youtube-tag-generator',
      description: 'Generate SEO tags, hashtags & title ideas for your videos.',
      icon: '🏷️',
    },
    {
      name: 'Land Area Converter',
      path: '/land-area-converter',
      description: 'Convert Marla, Kanal, Acre & calculate PKR plot price.',
      icon: '🗺️',
    },
  ];

  const workspaceShell = isDarkTheme
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-slate-50/70 text-slate-900 border-slate-200';
  const cardSurface = isDarkTheme
    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const inputSurface = isDarkTheme
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
  const labelText = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <ToolLayout
      toolPath="/qr-code-generator"
      title="QR Code Generator & Scanner"
      badgeText="PNG · SVG · Logo · Offline Scanner"
      badgeIcon={<QrCode className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}
      description="Create scannable QR codes for URLs, plain text, WhatsApp messages, Wi-Fi login, Email, Phone, SMS, and vCard contacts right in your browser. Customize size, colors, margin, error correction, and center logo, or switch to the built-in QR Scanner."
      howItWorks={{
        heading: 'How to Create & Scan Custom QR Codes Privately',
        text: 'Every QR code is encoded and rendered locally in your browser using HTML5 Canvas and vector SVG—zero links, Wi-Fi passwords, or contact cards ever touch a server.',
        steps: [
          {
            number: 1,
            title: 'Choose QR Type',
            description:
              'Pick URL, Text, WhatsApp, Wi-Fi, Email, Phone, SMS, or vCard and fill in your details—the preview updates live.',
          },
          {
            number: 2,
            title: 'Customize & Add Logo',
            description:
              'Adjust pixel size (200–1000 px), colors, margin, and optionally upload a center logo (Error Correction auto-locks to H).',
          },
          {
            number: 3,
            title: 'Export or Scan',
            description:
              'Download sharp PNG or scalable SVG, copy the image to clipboard, or scan existing QR codes with your camera or an uploaded file.',
          },
        ],
      }}
      supportedFormats={[
        { format: '8 QR Payloads', description: 'URL, Plain Text, WhatsApp, Wi-Fi, Email, Phone, SMS, and vCard 3.0.' },
        { format: 'Vector & Raster', description: 'Crisp SVG for print flyers and custom 200–1000 px PNG for web & social.' },
        { format: 'Error Correction (L/M/Q/H)', description: 'Auto-upgrades to High (30% recovery) when a center logo is embedded.' },
        { format: 'Built-in QR Scanner', description: 'Decode QR codes offline via device camera or uploaded image.' },
      ]}
      tips={[
        'Always maintain dark modules on a light background (contrast ratio >= 3:1) so older phone cameras scan quickly in dim lighting.',
        'Download SVG when printing business cards, banners, or packaging so edges stay razor-sharp at any physical size.',
      ]}
      faqs={[
        {
          question: 'Are my Wi-Fi passwords or vCard details saved anywhere?',
          answer:
            'No. Both QR generation and QR scanning run 100% locally in your browser memory. Nothing is sent to external servers or stored in a database.',
        },
        {
          question: 'Why does Error Correction switch to H when I upload a logo?',
          answer:
            'A center logo covers modules in the middle of the QR matrix. Level H (High) adds up to 30% Reed-Solomon error-recovery redundancy so smartphones still decode the QR reliably.',
        },
        {
          question: 'Why does it warn me about low color contrast?',
          answer:
            'Camera sensors separate QR modules by luminance contrast. If your foreground and background colors are too similar—or if foreground is lighter than background—some phones fail to focus and scan.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div
        className={`rounded-2xl border p-4 sm:p-6 space-y-6 transition-colors ${workspaceShell}`}
        style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
      >
        {/* Top Mode Tabs + Theme Toggle & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`inline-flex rounded-xl p-1 border ${cardSurface}`} role="tablist" aria-label="QR Tool Mode">
            <button
              type="button"
              role="tab"
              aria-selected={mainMode === 'generator'}
              onClick={() => setMainMode('generator')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                mainMode === 'generator'
                  ? 'bg-red-600 text-white shadow-xs'
                  : labelText
              }`}
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              <span>QR Generator</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainMode === 'scanner'}
              onClick={() => setMainMode('scanner')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                mainMode === 'scanner'
                  ? 'bg-red-600 text-white shadow-xs'
                  : labelText
              }`}
            >
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              <span>QR Scanner</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
            >
              {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
            </button>

            {mainMode === 'generator' && (
              <button
                type="button"
                onClick={handleReset}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {mainMode === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Content Type + Fields + Customization */}
            <div className="lg:col-span-7 space-y-5">
              {/* Type Tabs */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5" role="tablist" aria-label="QR Code Content Type">
                {typeTabs.map((tab) => {
                  const active = qrType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setQrType(tab.id)}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-red-600 border-red-600 text-white shadow-xs'
                          : cardSurface
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate max-w-full">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Content Form */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
                {qrType === 'url' && (
                  <div>
                    <label htmlFor="qr-url-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Website or Link URL
                    </label>
                    <input
                      id="qr-url-input"
                      type="url"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      placeholder="https://example.com"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inputSurface}`}
                    />
                  </div>
                )}

                {qrType === 'text' && (
                  <div>
                    <label htmlFor="qr-text-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Plain Text
                    </label>
                    <textarea
                      id="qr-text-input"
                      rows={4}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter any text, note, or code..."
                      className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inputSurface}`}
                    />
                  </div>
                )}

                {qrType === 'whatsapp' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="qr-wa-phone" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        WhatsApp Number (with country code, no +)
                      </label>
                      <input
                        id="qr-wa-phone"
                        type="tel"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="923001234567"
                        className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-wa-msg" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Pre-filled Message (Optional)
                      </label>
                      <textarea
                        id="qr-wa-msg"
                        rows={3}
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        placeholder="Hello, I'd like more details..."
                        className={`w-full p-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                  </div>
                )}

                {qrType === 'wifi' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="qr-wifi-ssid" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                          Network Name (SSID)
                        </label>
                        <input
                          id="qr-wifi-ssid"
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="Wi-Fi network name"
                          className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                        />
                      </div>
                      <div>
                        <label htmlFor="qr-wifi-sec" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                          Security Type
                        </label>
                        <select
                          id="qr-wifi-sec"
                          value={wifiSecurity}
                          onChange={(e) => setWifiSecurity(e.target.value as WifiSecurity)}
                          className={`w-full h-10 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
                        >
                          <option value="WPA">WPA / WPA2 / WPA3</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">None (Open Network)</option>
                        </select>
                      </div>
                    </div>

                    {wifiSecurity !== 'nopass' && (
                      <div>
                        <label htmlFor="qr-wifi-pass" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                          Wi-Fi Password
                        </label>
                        <input
                          id="qr-wifi-pass"
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Network password"
                          className={`w-full h-10 px-3 rounded-xl border text-sm font-mono ${inputSurface}`}
                        />
                      </div>
                    )}

                    <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className={labelText}>Hidden Wi-Fi SSID</span>
                    </label>
                  </div>
                )}

                {qrType === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="qr-email-addr" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Email Address
                      </label>
                      <input
                        id="qr-email-addr"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-email-sub" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Subject (Optional)
                      </label>
                      <input
                        id="qr-email-sub"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-email-body" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Email Body (Optional)
                      </label>
                      <textarea
                        id="qr-email-body"
                        rows={3}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                  </div>
                )}

                {qrType === 'phone' && (
                  <div>
                    <label htmlFor="qr-phone-num" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Phone Number
                    </label>
                    <input
                      id="qr-phone-num"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+923001234567"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono ${inputSurface}`}
                    />
                  </div>
                )}

                {qrType === 'sms' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="qr-sms-phone" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Recipient Phone Number
                      </label>
                      <input
                        id="qr-sms-phone"
                        type="tel"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="+923001234567"
                        className={`w-full h-10 px-3 rounded-xl border text-sm font-mono ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-sms-msg" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        SMS Message
                      </label>
                      <textarea
                        id="qr-sms-msg"
                        rows={3}
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                  </div>
                )}

                {qrType === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="qr-vc-name" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Full Name
                      </label>
                      <input
                        id="qr-vc-name"
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-vc-phone" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Phone
                      </label>
                      <input
                        id="qr-vc-phone"
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm font-mono ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-vc-email" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Email
                      </label>
                      <input
                        id="qr-vc-email"
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-vc-company" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Company / Organization
                      </label>
                      <input
                        id="qr-vc-company"
                        type="text"
                        value={vcardCompany}
                        onChange={(e) => setVcardCompany(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="qr-vc-web" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                        Website
                      </label>
                      <input
                        id="qr-vc-web"
                        type="url"
                        value={vcardWebsite}
                        onChange={(e) => setVcardWebsite(e.target.value)}
                        className={`w-full h-10 px-3 rounded-xl border text-sm ${inputSurface}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Customization Controls */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
                <h2 className="text-sm font-extrabold">Customize Design</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <label htmlFor="qr-size-range" className={labelText}>Size</label>
                      <span className="font-mono tabular-nums">{qrSize} × {qrSize} px</span>
                    </div>
                    <input
                      id="qr-size-range"
                      type="range"
                      min={200}
                      max={1000}
                      step={20}
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <label htmlFor="qr-margin-range" className={labelText}>Quiet Zone Margin</label>
                      <span className="font-mono tabular-nums">{margin} modules</span>
                    </div>
                    <input
                      id="qr-margin-range"
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="qr-fg-color" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Foreground Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-fg-color"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-10 w-12 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        aria-label="Foreground color hex"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className={`flex-1 min-w-0 h-10 px-2.5 rounded-xl border text-xs font-mono uppercase ${inputSurface}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="qr-bg-color" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-bg-color"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-12 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        aria-label="Background color hex"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className={`flex-1 min-w-0 h-10 px-2.5 rounded-xl border text-xs font-mono uppercase ${inputSurface}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="qr-ec-select" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                      Error Correction
                    </label>
                    <select
                      id="qr-ec-select"
                      value={effectiveEcLevel}
                      disabled={Boolean(logoDataUrl)}
                      onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
                      className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer disabled:opacity-60 ${inputSurface}`}
                    >
                      <option value="L">L — Low (7%)</option>
                      <option value="M">M — Medium (15%)</option>
                      <option value="Q">Q — Quartile (25%)</option>
                      <option value="H">H — High (30%)</option>
                    </select>
                    {logoDataUrl && (
                      <p className={`text-[10px] mt-1 ${mutedText}`}>Auto-locked to H for logo scan safety</p>
                    )}
                  </div>
                </div>

                {/* Contrast Warning */}
                {(contrast.isLowContrast || contrast.isInverted) && (
                  <div
                    role="alert"
                    className={`rounded-xl border px-3.5 py-2.5 flex items-start gap-2.5 text-xs ${
                      isDarkTheme
                        ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong>Low scan contrast ({contrast.ratio.toFixed(2)}:1).</strong>{' '}
                      {contrast.isInverted
                        ? 'Your foreground is lighter than your background—many camera apps struggle with inverted QR codes.'
                        : 'Pick a darker foreground and lighter background (at least 3:1 contrast) so phones can scan reliably.'}
                    </div>
                  </div>
                )}

                {/* Optional Logo Upload */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className={`text-xs font-bold ${labelText}`}>Center Logo (Optional)</div>
                    <p className={`text-[11px] ${mutedText}`}>
                      Placed cleanly in the center with automatic Level H protection.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                      id="qr-logo-upload"
                    />
                    <label
                      htmlFor="qr-logo-upload"
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{logoDataUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    </label>

                    {logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoDataUrl(null);
                          if (logoInputRef.current) logoInputRef.current.value = '';
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
                {logoError && <p className="text-xs text-red-500 font-medium">{logoError}</p>}
              </div>
            </div>

            {/* Right Column: Live Preview & Export Actions */}
            <div className={`lg:col-span-5 rounded-2xl border p-5 flex flex-col items-center space-y-4 ${cardSurface}`}>
              <div className="w-full flex items-center justify-between">
                <h2 className="text-sm font-extrabold">Live QR Preview</h2>
                <span className={`text-[11px] font-mono ${mutedText}`}>
                  EC: {effectiveEcLevel} · {qrSize}px
                </span>
              </div>

              <div
                className={`w-full aspect-square max-w-[320px] rounded-2xl border flex items-center justify-center p-4 overflow-hidden ${
                  isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {payload ? (
                  <canvas
                    ref={canvasRef}
                    aria-label="Live QR code preview"
                    className="max-w-full max-h-full rounded-lg shadow-xs"
                    style={{ width: '100%', height: 'auto' }}
                  />
                ) : (
                  <p className={`text-xs text-center px-4 ${mutedText}`}>
                    Enter content on the left to generate your QR code preview.
                  </p>
                )}
              </div>

              {renderError && (
                <p className="text-xs text-red-500 font-medium text-center">{renderError}</p>
              )}

              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={!payload}
                  onClick={handleDownloadPng}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  disabled={!payload || !svgMarkup}
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  disabled={!payload}
                  onClick={handleCopyImage}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-50 ${inputSurface}`}
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {copyNote && (
                <p className={`text-[11px] text-center ${mutedText}`}>{copyNote}</p>
              )}
            </div>
          </div>
        ) : (
          /* QR Scanner Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className={`rounded-2xl border p-5 space-y-4 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-extrabold">Scan with Camera or Image</h2>
                {isScanningCamera ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                  >
                    <CameraOff className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Start Camera</span>
                  </button>
                )}
              </div>

              <div
                className={`relative aspect-video rounded-xl border overflow-hidden flex items-center justify-center ${
                  isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isScanningCamera ? 'block' : 'hidden'}`}
                />
                <canvas ref={scanCanvasRef} className="hidden" />
                {!isScanningCamera && (
                  <div className="text-center p-4 space-y-2">
                    <ScanLine className={`h-8 w-8 mx-auto ${mutedText}`} aria-hidden="true" />
                    <p className={`text-xs ${mutedText}`}>
                      Click &ldquo;Start Camera&rdquo; to scan live, or upload a QR image below.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className={`text-xs font-semibold ${mutedText}`}>Or decode from image file:</span>
                <input
                  ref={scanFileInputRef}
                  id="qr-scan-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleScanImageUpload}
                  className="sr-only"
                />
                <label
                  htmlFor="qr-scan-file-input"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Upload QR Image</span>
                </label>
              </div>

              {scannerError && (
                <div
                  role="alert"
                  className={`rounded-xl border px-3.5 py-2.5 flex items-start gap-2 text-xs ${
                    isDarkTheme
                      ? 'bg-red-950/60 border-red-800 text-red-200'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{scannerError}</span>
                </div>
              )}
            </div>

            <div className={`rounded-2xl border p-5 space-y-4 ${cardSurface}`}>
              <h2 className="text-sm font-extrabold">Decoded QR Content</h2>

              {scannedResult ? (
                <div className="space-y-3">
                  <div
                    className={`rounded-xl border p-3.5 text-sm font-mono break-all whitespace-pre-wrap ${inputSurface}`}
                  >
                    {scannedResult}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(scannedResult);
                          setScannedCopied(true);
                          window.setTimeout(() => setScannedCopied(false), 1800);
                        } catch {}
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                    >
                      {scannedCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{scannedCopied ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    {scannedSafeUrl && (
                      <a
                        href={scannedSafeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Open Link</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className={`text-xs py-8 text-center ${mutedText}`}>
                  Point your camera at any QR code or upload a screenshot—decoded text or URLs will appear here instantly.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
