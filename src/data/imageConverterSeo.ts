export type ImageOutputFormat = 'jpg' | 'png' | 'webp' | 'avif' | 'bmp' | 'ico';

export type ImageConverterRoutePath =
  | '/image-converter'
  | '/png-to-jpg'
  | '/webp-to-png'
  | '/heic-to-jpg'
  | '/jpg-to-webp';

export interface ImageConverterFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ImageConverterRouteConfig {
  path: ImageConverterRoutePath;
  defaultOutputFormat: ImageOutputFormat;
  title: string;
  description: string;
  h1: string;
  subheading: string;
  badgeText: string;
  introHeading: string;
  introParagraphs: [string, string];
}

export const IMAGE_CONVERTER_ROUTES: Record<
  ImageConverterRoutePath,
  ImageConverterRouteConfig
> = {
  '/image-converter': {
    path: '/image-converter',
    defaultOutputFormat: 'webp',
    title: 'Image Format Converter - JPG, PNG, WebP, AVIF, HEIC Online', // 58 chars (< 60)
    description:
      'Free online image converter to convert JPG, PNG, WebP, AVIF, BMP, ICO, SVG, and HEIC in your browser. Private batch tool—files never leave your device.', // 151 chars (< 155)
    h1: 'Image Format Converter',
    subheading:
      'Convert images between JPG, PNG, WebP and more. Files never leave your device.',
    badgeText: '100% Browser-Based · Private Batch Tool',
    introHeading: 'What is the Image Format Converter?',
    introParagraphs: [
      'This free online image converter transforms photos, graphics, screenshots, and icons directly inside your web browser without uploading files to any server. Drop up to 50 images at once—including iPhone HEIC photos, scalable SVG graphics, WebP downloads, AVIF files, transparent PNGs, and JPG shots—and convert image format targets in batches with live size comparisons and ZIP packaging.',
      'It is built for web developers shrinking hero assets into WebP or AVIF, designers turning transparent logos into PNG or multi-resolution Windows ICO favicons, marketers fixing stubborn WebP or HEIC uploads that older apps reject, and anyone who wants fast PNG to JPG or WebP to PNG conversion without sacrificing privacy.',
    ],
  },
  '/png-to-jpg': {
    path: '/png-to-jpg',
    defaultOutputFormat: 'jpg',
    title: 'PNG to JPG Converter - Free Online Batch Image Tool', // 51 chars
    description:
      'Convert PNG to JPG online with custom quality and background fill so transparent graphics never turn black. Free, private batch processing in browser.', // 148 chars
    h1: 'PNG to JPG Converter',
    subheading:
      'Turn heavy PNG screenshots and graphics into compact JPG files right inside your browser.',
    badgeText: 'PNG to JPG · Custom Background Fill',
    introHeading: 'Why convert PNG to JPG?',
    introParagraphs: [
      'Lossless PNG screenshots, digital illustrations, and product mockups often weigh several megabytes each—especially when captured on Retina or 4K displays. Converting PNG to JPG slashes file sizes for email attachments, blog posts, ecommerce forms, and CMS upload limits while keeping everyday visual detail clean.',
      'Because JPG does not store an alpha transparency channel, naive converters often fill transparent PNG edges with solid black. This tool lets you pick an exact background color (white by default) before encoding, processes up to 50 files at once in your browser, and strips EXIF metadata automatically.',
    ],
  },
  '/webp-to-png': {
    path: '/webp-to-png',
    defaultOutputFormat: 'png',
    title: 'WebP to PNG Converter - Keep Transparency Free Online', // 53 chars
    description:
      'Convert WebP to PNG in your browser while preserving transparent backgrounds cleanly. Free batch image converter with zero server uploads.', // 138 chars
    h1: 'WebP to PNG Converter',
    subheading:
      'Convert saved WebP images into universal PNG files with full alpha transparency kept intact.',
    badgeText: 'WebP to PNG · Alpha Preserved',
    introHeading: 'Why convert WebP to PNG?',
    introParagraphs: [
      'Many modern websites serve images in WebP format to speed up page loads, which works great in Chrome and Safari but still trips up older office suites, presentation apps, print shops, and desktop editors when you save them locally.',
      'Converting WebP to PNG produces a widely accepted lossless PNG image that preserves transparent backgrounds cleanly for slides, Figma mockups, Canva uploads, and document embeds—all locally in your browser without sending images to a remote server.',
    ],
  },
  '/heic-to-jpg': {
    path: '/heic-to-jpg',
    defaultOutputFormat: 'jpg',
    title: 'HEIC to JPG Converter - Open iPhone Photos Anywhere', // 51 chars
    description:
      'Convert iPhone HEIC and HEIF photos to universal JPG directly in your browser. Free private batch image converter with quality and resize controls.', // 146 chars
    h1: 'HEIC to JPG Converter',
    subheading:
      'Decode iPhone and iPad HEIC photos into universally compatible JPG files privately in your browser.',
    badgeText: 'HEIC / HEIF to JPG · Client-Side',
    introHeading: 'Why convert HEIC to JPG?',
    introParagraphs: [
      'Apple iPhones and iPads save camera shots in High Efficiency Image Container (HEIC) format by default to conserve phone storage. While Apple devices preview HEIC natively, Windows software, legacy portals, job application sites, and many web forms frequently reject .heic uploads.',
      'When you add HEIC or HEIF photos here, the converter loads the decoder library on demand inside your own browser, converts up to 50 photos locally into standard JPG files, removes location and camera EXIF metadata, and lets you grab them individually or inside a single ZIP archive.',
    ],
  },
  '/jpg-to-webp': {
    path: '/jpg-to-webp',
    defaultOutputFormat: 'webp',
    title: 'JPG to WebP Converter - Smaller Web Images Online', // 49 chars
    description:
      'Convert JPG photos into lighter WebP assets right in your browser with quality and resize controls. Free batch image converter for faster web pages.', // 145 chars
    h1: 'JPG to WebP Converter',
    subheading:
      'Shrink heavy JPG photographs into modern WebP images for faster websites—100% locally.',
    badgeText: 'JPG to WebP · Web Performance',
    introHeading: 'Why convert JPG to WebP?',
    introParagraphs: [
      'Large JPG hero banners and blog thumbnails slow down Core Web Vitals and Largest Contentful Paint scores. Switching photographic assets from JPG to WebP typically trims 25% to 35% off file weight at comparable perceived sharpness.',
      'Drag your site images into the drop zone, dial in lossy quality between 75 and 85, optionally cap max pixel width for responsive layouts, and inspect the before/after preview and exact KB savings before downloading your ZIP bundle.',
    ],
  },
};

export const IMAGE_CONVERTER_FAQ: ImageConverterFaqItem[] = [
  {
    id: 'is-free',
    question: 'Is this free online image converter really free?',
    answer:
      'Yes. You can convert batches of images between JPG, PNG, WebP, AVIF, BMP, and ICO without watermarks, sign-ups, or usage subscriptions.',
  },
  {
    id: 'privacy-uploads',
    question: 'Are my images uploaded anywhere?',
    answer:
      'No. Every decoding, resizing, and Canvas encoding step runs locally in your own web browser. Your files never leave your computer or phone.',
  },
  {
    id: 'file-limits',
    question: 'Is there a file count or size limit?',
    answer:
      'Each batch accepts up to 50 files at a time, with a 25 MB limit per file so browser memory stays responsive on laptops and smartphones.',
  },
  {
    id: 'quality-loss',
    question: 'Does converting reduce image quality?',
    answer:
      'Converting to lossy formats (JPG, WebP, AVIF) discards subtle visual data according to the quality slider (default 90). Converting a raster image to PNG or BMP stores uncompressed or lossless pixel data, though decoding a lossy JPG first cannot restore detail that was already compressed away.',
  },
  {
    id: 'png-bigger-than-jpg',
    question: 'Why is my converted PNG much bigger than the original JPG?',
    answer:
      'JPG uses lossy photographic compression designed to make smooth gradients tiny, whereas PNG uses lossless compression that preserves every exact pixel value. A 300 KB JPG photograph often expands to 2 MB or more as PNG.',
  },
  {
    id: 'transparency',
    question: 'Does the converter keep transparent backgrounds?',
    answer:
      'Yes when converting to PNG, WebP, AVIF, or ICO. When converting transparent PNG, WebP, or SVG graphics to JPG or BMP (which have no alpha channel), the tool fills transparent pixels with your chosen background color (white by default) so they do not turn solid black.',
  },
  {
    id: 'exif-metadata',
    question: 'Does it keep EXIF camera or GPS location data?',
    answer:
      'No. Drawing images onto an HTML Canvas naturally removes EXIF metadata such as GPS coordinates, camera serial details, and orientation tags while baking visual orientation cleanly into the pixels.',
  },
  {
    id: 'avif-unavailable',
    question: 'Why is AVIF disabled or unavailable in my browser?',
    answer:
      'Browser engines support decoding AVIF widely, but encoding AVIF via canvas.toBlob depends on your specific browser version (Chrome and Firefox support it cleanly on most desktops, while some Safari or mobile browsers do not). The tool checks encoding support at runtime and disables unsupported output formats rather than silently giving you a mislabeled PNG.',
  },
  {
    id: 'heic-iphone',
    question: 'Can I convert HEIC and HEIF photos from my iPhone?',
    answer:
      'Yes. Drop .heic or .heif photos taken on iOS devices and the page loads a browser-side HEIC decoder on demand, converting them cleanly to JPG, PNG, or WebP right on your device.',
  },
  {
    id: 'animated-gifs',
    question: 'Do animated GIFs stay animated after conversion?',
    answer:
      'No. Browser Canvas decoding renders only the first frame of an animated GIF, producing a static image in your chosen output format.',
  },
  {
    id: 'works-offline',
    question: 'Does the image converter work offline once loaded?',
    answer:
      'Yes for standard formats (JPG, PNG, WebP, AVIF, SVG, BMP, ICO) and ZIP downloads once the page bundle has loaded. Note that if your first HEIC file is added while offline and the lazy HEIC decoder chunk was not yet cached, you will need a connection the first time that decoder downloads.',
  },
  {
    id: 'works-mobile',
    question: 'Does it work on iPhone and Android phones?',
    answer:
      'Yes. You can tap Choose images on iOS Safari or Android Chrome to pick from your photo library or Files app, adjust quality or resize rules, and save individual files or a ZIP archive directly to your phone.',
  },
];

export interface FormatComparisonRow {
  format: string;
  bestUse: string;
  transparency: string;
  compression: string;
  typicalSize: string;
  browserSupport: string;
}

export const FORMAT_COMPARISON_ROWS: FormatComparisonRow[] = [
  {
    format: 'JPG / JPEG',
    bestUse: 'Photographs, blog hero banners, camera exports, social posts',
    transparency: 'No (uses solid fill)',
    compression: 'Lossy',
    typicalSize: 'Small to medium',
    browserSupport: 'Universal (all browsers & apps)',
  },
  {
    format: 'PNG',
    bestUse: 'Logos, UI screenshots, crisp text, transparent overlays',
    transparency: 'Yes (full alpha channel)',
    compression: 'Lossless',
    typicalSize: 'Large for photos; compact for flat UI',
    browserSupport: 'Universal (all browsers & apps)',
  },
  {
    format: 'WebP',
    bestUse: 'Modern websites, ecommerce galleries, stickers & balanced web assets',
    transparency: 'Yes (full alpha channel)',
    compression: 'Lossy or lossless (lossy here)',
    typicalSize: 'Smaller than JPG & PNG',
    browserSupport: 'Modern Chrome, Safari, Edge, Firefox',
  },
  {
    format: 'AVIF',
    bestUse: 'Next-gen web photography where tiny byte size matters most',
    transparency: 'Yes (full alpha channel)',
    compression: 'Lossy (high efficiency)',
    typicalSize: 'Smallest for high-detail photos',
    browserSupport: 'Modern Chrome, Firefox, Edge (encoding varies on Safari)',
  },
  {
    format: 'BMP',
    bestUse: 'Legacy Windows software, raw pixel workflows, hardware tools',
    transparency: 'No (24-bit RGB)',
    compression: 'Uncompressed',
    typicalSize: 'Very large',
    browserSupport: 'Desktop OS & legacy viewers (heavy for web)',
  },
  {
    format: 'ICO',
    bestUse: 'Website favicons and Windows desktop application icons',
    transparency: 'Yes (multi-size PNG frames)',
    compression: 'Lossless PNG-in-ICO',
    typicalSize: 'Very small (multi-icon bundle)',
    browserSupport: 'All desktop browsers for favicons; Windows native',
  },
];

export interface PopularConversionItem {
  title: string;
  route?: ImageConverterRoutePath;
  explanation: string;
}

export const POPULAR_CONVERSIONS: PopularConversionItem[] = [
  {
    title: 'PNG to JPG',
    route: '/png-to-jpg',
    explanation:
      'People convert PNG to JPG when high-resolution screenshots or mockups are too large for email attachments, WordPress libraries, or upload forms. Setting a white background fill keeps transparent areas clean instead of turning dark.',
  },
  {
    title: 'JPG to PNG',
    explanation:
      'Designers convert JPG to PNG before importing graphics into presentation decks, print tools, or editors that prefer lossless editing baselines or exact pixel preservation—keeping in mind PNG files will be larger.',
  },
  {
    title: 'WebP to JPG',
    explanation:
      'Saving an image from a modern website often yields a .webp file that older desktop software, photo viewers, or submission portals still refuse to open. Converting WebP to JPG gives you an instant universal photo file.',
  },
  {
    title: 'WebP to PNG',
    route: '/webp-to-png',
    explanation:
      'WebP product cutouts and icons often include transparent backgrounds. Converting WebP to PNG keeps that transparency intact so you can layer the image inside PowerPoint, Photoshop, or Canva.',
  },
  {
    title: 'HEIC to JPG',
    route: '/heic-to-jpg',
    explanation:
      'iPhone camera rolls save Space-saving HEIC files that Windows PCs, Android devices, and many online forms cannot preview natively. Converting HEIC to JPG turns Apple camera shots into standard shareable photos.',
  },
  {
    title: 'AVIF to JPG',
    explanation:
      'Modern content networks serve AVIF images for ultra-low bandwidth, yet email clients and older design programs frequently fail to open them. Converting AVIF to JPG makes downloaded web images usable anywhere.',
  },
  {
    title: 'JPG to WebP',
    route: '/jpg-to-webp',
    explanation:
      'Website owners convert JPG to WebP to improve page speed and Core Web Vitals scores without visibly hurting product or blog photography, commonly cutting payload sizes by a quarter or more.',
  },
  {
    title: 'SVG to PNG',
    explanation:
      'Scalable SVG vector logos look crisp at any zoom level but are often blocked by social media profile uploaders and messaging apps. Rasterizing SVG to PNG lets you lock in exact dimensions with clean edges.',
  },
  {
    title: 'PNG to ICO',
    explanation:
      'Web developers convert square PNG brand marks into multi-size .ico bundles (combining 16px, 32px, 48px, and up to 256px frames) so website favicons and Windows shortcuts stay sharp on both standard and high-DPI screens.',
  },
];
