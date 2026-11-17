import React, { useState } from 'react';
import {
  ShieldCheck,
  Maximize2,
  Sliders,
  Link2,
  Clock,
  Smartphone,
  ChevronDown,
  ArrowUp,
  MessageSquare,
  Check,
  Minus,
} from 'lucide-react';
import { YOUTUBE_PLAYER_FAQ } from '../data/youtubePlayerFaq';

interface YouTubePlayerSeoContentProps {
  onScrollToInput: () => void;
  onNavigate?: (path: string) => void;
}

const FEATURE_CARDS = [
  {
    title: 'Privacy-enhanced embed',
    description:
      'Loads videos through YouTube’s official youtube-nocookie.com domain, which limits tracking cookies unless you interact directly with the video or sign in.',
    icon: ShieldCheck,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Full-screen playback',
    description:
      'Jump straight into a dedicated full-screen mode with a single click, complete with Escape key support and an expanded theater fallback on restricted mobile browsers.',
    icon: Maximize2,
    accent: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    title: 'All native controls',
    description:
      'Keeps every official YouTube player control intact, including play, pause, timeline scrubbing, volume, closed captions, playback speed, and video quality selection.',
    icon: Sliders,
    accent: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  {
    title: 'Works with Shorts, live & timestamps',
    description:
      'Paste regular watch URLs, shortened youtu.be links, YouTube Shorts, live stream links, or URLs with t= or start= timestamps and begin at the exact second.',
    icon: Link2,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    title: 'Recently watched (browser only)',
    description:
      'Remembers up to your last 5 watched links inside your browser’s localStorage so you can resume a tutorial or talk later. Nothing is ever sent to a server.',
    icon: Clock,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    title: 'Works on phone, tablet and desktop',
    description:
      'Built around a responsive 16:9 layout with inline mobile playback so lectures, music sets, and product demos look clean on any screen size.',
    icon: Smartphone,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
  },
];

const SUPPORTED_LINK_ROWS = [
  {
    type: 'Standard watch link',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    notes: 'Full desktop URLs, including extra parameters such as &list= or &ab_channel=.',
  },
  {
    type: 'Shortened link',
    example: 'https://youtu.be/dQw4w9WgXcQ',
    notes: 'Compact share links copied from the YouTube Share dialog.',
  },
  {
    type: 'YouTube Shorts',
    example: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    notes: 'Vertical short clips loaded inside the clean 16:9 embed frame.',
  },
  {
    type: 'Live stream URL',
    example: 'https://www.youtube.com/live/jfKfPfyJRdk',
    notes: 'Active broadcasts and archived live streams with full DVR controls.',
  },
  {
    type: 'Mobile YouTube link',
    example: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    notes: 'Links copied from mobile web browsers or Android and iOS share sheets.',
  },
  {
    type: 'Embed link',
    example: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    notes: 'Existing embed or youtube-nocookie.com iframe URLs.',
  },
  {
    type: 'Timestamped link',
    example: 'https://youtu.be/dQw4w9WgXcQ?t=1m30s',
    notes: 'Supports ?t=90, ?t=1m30s, &start=90, and #t=45 to start at an exact second.',
  },
];

export const YouTubePlayerSeoContent: React.FC<YouTubePlayerSeoContentProps> = ({
  onScrollToInput,
  onNavigate,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(YOUTUBE_PLAYER_FAQ[0]?.id ?? null);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-10 pt-4">
      {/* 1. What is the YouTube Player tool? */}
      <section
        aria-labelledby="what-is-youtube-player"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <h2
          id="what-is-youtube-player"
          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
        >
          What is the YouTube Player tool?
        </h2>
        <div className="space-y-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
          <p>
            The YouTube Player is a lightweight, browser-based YouTube link player built for focused viewing. When you paste any public YouTube address into the box above, it opens the video inside a responsive 16:9 YouTube embed player hosted on YouTube’s official privacy-enhanced domain. There are no user accounts to create, no software extensions to install, and no clutter surrounding the video canvas. Unlike bulky media portals that require multiple clicks or extra scripts, this page converts a shared link straight into a clean viewing window right in your current tab.
          </p>
          <p>
            This distraction-free YouTube viewer is designed for students reviewing recorded university lectures, developers following step-by-step coding tutorials, teachers presenting educational clips on a classroom projector, and anyone who wants to watch YouTube in full screen without scrolling through comment threads or getting pulled into endless homepage recommendations. Everything runs directly on the client side in your browser using standard embed parameters, keeping every native playback control—closed captions, resolution switching, playback speed, volume, and timeline scrubbing—right where you expect it.
          </p>
        </div>
      </section>

      {/* 2. How to use it */}
      <section
        aria-labelledby="how-to-use-youtube-player"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="space-y-1.5">
          <h2
            id="how-to-use-youtube-player"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            How to use it
          </h2>
          <p className="text-sm text-slate-600">
            Open any supported video in three straightforward steps—no registration, account linking, or browser extensions needed.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Paste your YouTube link</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Copy any link from YouTube—standard watch pages, youtu.be short links, Shorts, live streams, or timestamped URLs—and drop it into the input box or click the Paste button to read directly from your clipboard.
            </p>
          </li>

          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-red-600 text-white font-mono text-xs font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Click Watch now</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Press the Watch now button or hit Enter on your keyboard. The YouTube player extracts the video ID and any optional start timestamp in milliseconds and begins playback inside the 16:9 frame right on the page.
            </p>
          </li>

          <li className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Enjoy full screen</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Click the Full screen button above the frame—or the native full-screen icon inside the video bar—to expand the video edge-to-edge on your monitor or phone, and press Escape whenever you want to exit.
            </p>
          </li>
        </ol>
      </section>

      {/* 3. Feature cards (6) */}
      <section aria-labelledby="youtube-player-features" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="youtube-player-features"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Key features of the privacy-enhanced YouTube player
          </h2>
          <p className="text-sm text-slate-600">
            Built with clean web standards so playback remains reliable, fast, and easy to control on any device.
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
                <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Why use a distraction-free player? */}
      <section
        aria-labelledby="why-distraction-free"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <h2
          id="why-distraction-free"
          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
        >
          Why use a distraction-free player?
        </h2>
        <div className="space-y-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
          <p>
            A standard video page is crowded by design. Alongside the main video sit an algorithmic recommendation sidebar, an autoplay next queue, live chat boxes, merch shelves, and hundreds of comments pulling your eyes away from what you opened the tab to watch. When you are trying to study a math proof, follow a detailed recipe, practice an instrument, or show a short clip during a team meeting, all of those surrounding panels create visual noise and break concentration before the video even finishes.
          </p>
          <p>
            Opening a clip inside a dedicated distraction-free YouTube player removes comments, strips away the recommendation feed, and eliminates sidebar suggestions so only the video frame stays on screen. Because the page loads YouTube’s official privacy-enhanced domain (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">youtube-nocookie.com</code>), YouTube does not store viewing behavior cookies in your browser simply from loading the player. That gives you a cleaner, calmer viewing environment with fewer cookies while still keeping full captioning, keyboard shortcuts, speed controls, and HD resolution switching intact.
          </p>
          <p>
            Teams, educators, and parents also appreciate having a neutral watch surface when sharing screen demos or assigning homework videos. Instead of exposing viewers to unrelated trending thumbnails or off-topic comment arguments, you share a single link and watch the intended video cleanly from start to finish.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 text-xs sm:text-sm text-slate-700">
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>No comments section beneath the frame</span>
          </li>
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>No homepage or algorithmic recommendation feed</span>
          </li>
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>No distracting sidebar video suggestions</span>
          </li>
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Cleaner presentation view for classrooms & calls</span>
          </li>
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Fewer cookies via youtube-nocookie.com</span>
          </li>
          <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Related videos limited to the same channel</span>
          </li>
        </ul>
      </section>

      {/* 5. YouTube Player vs YouTube Premium */}
      <section
        aria-labelledby="player-vs-premium"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="space-y-1.5">
          <h2
            id="player-vs-premium"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            YouTube Player vs YouTube Premium
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            These two tools serve completely different needs and are not substitutes for one another. This YouTube embed player focuses strictly on quiet, clutter-free browser viewing using YouTube’s official privacy-enhanced iframe, whereas YouTube Premium is Google’s official paid membership for ad-free streaming, background mobile playback, and offline downloads. Review the accurate feature comparison below before choosing what fits your workflow:
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
                <th scope="col" className="py-3 px-4 font-bold">Feature</th>
                <th scope="col" className="py-3 px-4 font-bold">This YouTube Player</th>
                <th scope="col" className="py-3 px-4 font-bold">YouTube Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  Price
                </th>
                <td className="py-3 px-4">Free to use in any browser</td>
                <td className="py-3 px-4">Paid monthly or annual subscription</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  Ad-free guaranteed
                </th>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <Minus className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>No — ads can still appear on some monetized videos</span>
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Yes — guaranteed ad-free across YouTube apps and web</span>
                  </span>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  Background play
                </th>
                <td className="py-3 px-4">No — requires an active browser tab</td>
                <td className="py-3 px-4">Yes — continues playing with screen locked or in other apps</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  Offline downloads
                </th>
                <td className="py-3 px-4">No — streams online only via YouTube embed</td>
                <td className="py-3 px-4">Yes — save videos inside the official YouTube mobile app</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  Privacy-enhanced embed
                </th>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Yes — uses youtube-nocookie.com by default</span>
                  </span>
                </td>
                <td className="py-3 px-4">No — uses standard signed-in youtube.com playback</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 px-4 font-semibold text-slate-900">
                  No sign-up needed
                </th>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Yes — paste a link and watch immediately</span>
                  </span>
                </td>
                <td className="py-3 px-4">No — requires a signed-in Google account</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Supported link formats */}
      <section
        aria-labelledby="supported-link-formats"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="space-y-1.5">
          <h2
            id="supported-link-formats"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Supported link formats
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not need to clean up tracking queries or reformat links manually. The parser handles all common YouTube URL structures automatically, including extra sharing parameters and start timestamps.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
                <th scope="col" className="py-3 px-4 font-bold">Link Type</th>
                <th scope="col" className="py-3 px-4 font-bold">Example URL</th>
                <th scope="col" className="py-3 px-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {SUPPORTED_LINK_ROWS.map((row) => (
                <tr key={row.type}>
                  <th scope="row" className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {row.type}
                  </th>
                  <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {row.example}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section
        aria-labelledby="youtube-player-faq"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="space-y-1.5">
          <h2
            id="youtube-player-faq"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-600">
            Clear, accurate answers about privacy, playback controls, ads, mobile support, and link compatibility.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          {YOUTUBE_PLAYER_FAQ.map((item) => {
            const isOpen = openFaqId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-button-${item.id}`;
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
        aria-labelledby="ready-to-watch-cta"
        className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm"
      >
        <div className="space-y-1.5 max-w-xl">
          <h2 id="ready-to-watch-cta" className="text-lg sm:text-xl font-extrabold tracking-tight">
            Ready to watch without distractions?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Scroll back to the link box above, paste any YouTube URL, and open a clean full-screen video in seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onScrollToInput}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            <span>Back to video input</span>
          </button>

          <a
            href="/contact"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/contact');
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Send feedback</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default YouTubePlayerSeoContent;
