import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Sliders,
  Droplets,
  Archive,
  Smartphone,
  ChevronDown,
  ArrowUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  FORMAT_COMPARISON_ROWS,
  IMAGE_CONVERTER_FAQ,
  POPULAR_CONVERSIONS,
  type ImageConverterRouteConfig,
} from '../data/imageConverterSeo';

interface ImageConverterSeoContentProps {
  routeConfig: ImageConverterRouteConfig;
  onScrollToDropZone: () => void;
  onNavigate?: (path: string) => void;
}

const FEATURE_CARDS = [
  {
    title: 'Private',
    description:
      'Runs completely in your browser using the Canvas API and Web Workers. Your photos and screenshots are never uploaded to a remote server.',
    icon: ShieldCheck,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Batch conversion',
    description:
      'Add up to 50 images at once via drag and drop, file picker, or clipboard paste. Files process sequentially so your browser tab stays responsive.',
    icon: Layers,
    accent: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    title: 'Quality and resize controls',
    description:
      'Dial in lossy quality from 1 to 100 for JPG, WebP, and AVIF, or cap maximum pixel dimensions and percentage scale with an aspect-ratio lock.',
    icon: Sliders,
    accent: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  {
    title: 'Transparency handled correctly',
    description:
      'Keeps alpha channels intact in PNG, WebP, AVIF, and ICO, and applies your chosen background color (white by default) when saving to JPG or BMP.',
    icon: Droplets,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    title: 'Download everything as a ZIP',
    description:
      'Save finished files one by one or package your entire converted batch into a single clean ZIP archive with original filenames preserved.',
    icon: Archive,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    title: 'Works on phone and desktop',
    description:
      'Responsive controls work smoothly on iPhone Safari, Android Chrome, Windows, and macOS—including on-demand HEIC decoding for mobile photo libraries.',
    icon: Smartphone,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
  },
];

export const ImageConverterSeoContent: React.FC<
  ImageConverterSeoContentProps
> = ({ routeConfig, onScrollToDropZone, onNavigate }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    IMAGE_CONVERTER_FAQ[0]?.id ?? null
  );

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-10 pt-4">
      {/* 1. What is the Image Format Converter? */}
      <section
        aria-labelledby="what-is-image-converter"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <h2
          id="what-is-image-converter"
          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
        >
          {routeConfig.introHeading}
        </h2>
        <div className="space-y-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
          {routeConfig.introParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 2. How to convert an image */}
      <section
        aria-labelledby="how-to-convert-images"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="space-y-1.5">
          <h2
            id="how-to-convert-images"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            How to convert an image
          </h2>
          <p className="text-sm text-slate-600">
            Convert single files or batches of up to 50 images in three quick steps without installing desktop software.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Add your images</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Drag and drop up to 50 images into the zone above, click Choose images, or paste a screenshot directly with Ctrl+V. JPG, PNG, WebP, GIF, BMP, AVIF, SVG, and HEIC are supported up to 25 MB each.
            </p>
          </li>

          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-red-600 text-white font-mono text-xs font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Choose format and quality
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pick an output format for all files or override individual rows. Adjust lossy quality (1–100), set a background color for JPG or BMP, choose ICO icon sizes, or apply optional resize dimensions.
            </p>
          </li>

          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Convert and download
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Click Convert to process your queue smoothly in your browser, compare the before/after preview and exact size change, then save individual files or click Download all as ZIP.
            </p>
          </li>
        </ol>
      </section>

      {/* 3. Feature cards (6) */}
      <section aria-labelledby="image-converter-features" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="image-converter-features"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Built for clean, private browser conversions
          </h2>
          <p className="text-sm text-slate-600">
            Practical controls for everyday image workflows without server queues, hidden tracking, or watermarks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
              >
                <div
                  className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border ${card.accent}`}
                >
                  <IconComponent className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Which format should I choose? */}
      <section
        aria-labelledby="format-comparison-heading"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="space-y-1.5">
          <h2
            id="format-comparison-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Which format should I choose?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every image format trades off file size, visual detail, transparency support, and software compatibility differently. Use this side-by-side reference before you convert image format batches:
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
                <th scope="col" className="py-3 px-4 font-bold">
                  Format
                </th>
                <th scope="col" className="py-3 px-4 font-bold">
                  Best use
                </th>
                <th scope="col" className="py-3 px-4 font-bold">
                  Transparency
                </th>
                <th scope="col" className="py-3 px-4 font-bold">
                  Compression
                </th>
                <th scope="col" className="py-3 px-4 font-bold">
                  Typical size
                </th>
                <th scope="col" className="py-3 px-4 font-bold">
                  Browser support
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {FORMAT_COMPARISON_ROWS.map((row) => (
                <tr key={row.format}>
                  <th
                    scope="row"
                    className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap"
                  >
                    {row.format}
                  </th>
                  <td className="py-3 px-4">{row.bestUse}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {row.transparency}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {row.compression}
                  </td>
                  <td className="py-3 px-4">{row.typicalSize}</td>
                  <td className="py-3 px-4">{row.browserSupport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Popular conversions */}
      <section
        aria-labelledby="popular-conversions-heading"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="space-y-1.5">
          <h2
            id="popular-conversions-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Popular conversions
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you need a smaller web asset or a universally readable photo for an older application, here is why people rely on these nine common format switches:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POPULAR_CONVERSIONS.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
              {item.route && item.route !== routeConfig.path && (
                <a
                  href={item.route}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item.route!);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline pt-1"
                >
                  <span>Open {item.title} page</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Tips for smaller files without visible quality loss */}
      <section
        aria-labelledby="compression-tips-heading"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-600" aria-hidden="true" />
          <h2
            id="compression-tips-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Tips for smaller files without visible quality loss
          </h2>
        </div>

        <div className="space-y-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
          <p>
            You rarely need a 100 quality setting when saving photographs. Pushing JPG or WebP quality above 92 dramatically increases file size while adding detail most displays and human eyes cannot distinguish. Keeping the slider between <strong>80 and 90</strong> preserves clean skin tones and natural textures at a fraction of the byte count, while <strong>75 to 82 in WebP or AVIF</strong> works well for high-volume blog galleries and product cards.
          </p>
          <p>
            Resizing oversized dimensions almost always saves more storage than heavy compression alone. A modern smartphone shoots 4000-pixel photos, yet a blog column or portfolio card rarely renders wider than 1200 to 1600 pixels. Setting a maximum width of 1600 px with aspect-ratio lock enabled shrinks raw pixel count by over 80% before the encoder even touches compression—leaving crisp edges instead of blocky compression artifacts.
          </p>
          <p>
            Finally, match the format to the artwork. Photographs belong in WebP, AVIF, or JPG rather than PNG. Flat screenshots with sharp UI text, diagrams, or transparent logos belong in PNG or WebP so crisp letter edges stay sharp without fuzzy ringing around dark text.
          </p>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section
        aria-labelledby="image-converter-faq-heading"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="space-y-1.5">
          <h2
            id="image-converter-faq-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-600">
            Clear answers about browser privacy, file limits, quality trade-offs, HEIC support, EXIF removal, and transparency.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          {IMAGE_CONVERTER_FAQ.map((item) => {
            const isOpen = openFaqId === item.id;
            const panelId = `img-faq-panel-${item.id}`;
            const buttonId = `img-faq-button-${item.id}`;
            return (
              <div key={item.id} className="bg-white">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(item.id)}
                    className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left text-sm sm:text-[15px] font-bold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 transition-colors motion-reduce:transition-none cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 shrink-0 transition-transform motion-reduce:transition-none ${
                        isOpen ? 'rotate-180 text-red-600' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-4 sm:px-5 pb-4 pt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/40"
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Closing Call to Action */}
      <section
        aria-labelledby="ready-to-convert-cta"
        className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm"
      >
        <div className="space-y-1.5 max-w-xl">
          <h2
            id="ready-to-convert-cta"
            className="text-lg sm:text-xl font-extrabold tracking-tight"
          >
            Ready to convert your images privately?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Jump back to the drop zone above, add up to 50 images, pick your target format and quality, and download everything straight from your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={onScrollToDropZone}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white transition-colors motion-reduce:transition-none cursor-pointer shrink-0"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          <span>Back to image drop zone</span>
        </button>
      </section>
    </div>
  );
};

export default ImageConverterSeoContent;
