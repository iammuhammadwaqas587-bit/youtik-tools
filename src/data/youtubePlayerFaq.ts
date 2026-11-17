export interface YouTubePlayerFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const YOUTUBE_PLAYER_SEO = {
  path: '/youtube-player',
  title: 'YouTube Player - Distraction-Free, Full Screen Video Viewer',
  description:
    'Watch YouTube videos distraction-free in a full-screen, privacy-enhanced YouTube embed player. Supports Shorts, live streams, and timestamps.',
  h1: 'Distraction-Free YouTube Player',
  subheading:
    'Paste any YouTube link and watch it in a clean, full-screen player with all controls.',
};

export const YOUTUBE_PLAYER_FAQ: YouTubePlayerFaqItem[] = [
  {
    id: 'is-free',
    question: 'Is this YouTube Player tool free?',
    answer:
      'Yes. The YouTube Player is completely free to use in your browser with no paid tiers, accounts, or daily watch limits.',
  },
  {
    id: 'need-sign-in',
    question: 'Do I need to sign in to watch videos?',
    answer:
      'No sign-in is required. Paste any public YouTube link and press Watch now to load the privacy-enhanced YouTube embed player immediately.',
  },
  {
    id: 'block-ads',
    question: 'Does this player block all YouTube ads?',
    answer:
      'No. Ads can still appear on monetized videos because playback runs through YouTube’s official embed player and scripts. Subscribing to YouTube Premium is the only official way to guarantee ad-free playback across YouTube.',
  },
  {
    id: 'shorts-and-live',
    question: 'Does it work with YouTube Shorts and live streams?',
    answer:
      'Yes. You can paste standard watch links, shortened youtu.be links, YouTube Shorts URLs, live stream links, mobile links, and embed URLs. As long as the creator allows embedding, the video or live stream plays right in the frame.',
  },
  {
    id: 'mobile-support',
    question: 'Does it work on mobile phones and tablets?',
    answer:
      'Yes. The player scales responsively in a 16:9 frame on iPhone, iPad, Android phones, and desktop browsers. It uses playsinline playback on mobile so controls remain smooth and easy to tap.',
  },
  {
    id: 'viewing-history',
    question: 'Is my viewing history stored on your servers?',
    answer:
      'No. Your Recently watched list stores up to your last 5 links locally inside your own browser using localStorage. Nothing is uploaded, tracked, or saved on our servers, and you can erase the list at any time with the Clear button.',
  },
  {
    id: 'video-wont-play',
    question: 'Why do some YouTube videos fail to play in the embed?',
    answer:
      'Certain creators, music labels, or broadcasters disable external embedding in their YouTube studio settings, or mark videos as private or age-restricted. When a video owner blocks embedding, YouTube shows a playback unavailable message inside the frame.',
  },
  {
    id: 'download-videos',
    question: 'Can I download videos using the YouTube Player?',
    answer:
      'No. This YouTube link player is strictly for distraction-free streaming through YouTube’s official privacy-enhanced iframe embed. It does not scrape streams or save video files.',
  },
  {
    id: 'playlists',
    question: 'Does it work with playlist links?',
    answer:
      'If you paste a link that includes both a video ID (?v=...) and a playlist parameter (&list=...), the player extracts the video ID and plays that specific video cleanly without distraction sidebars.',
  },
  {
    id: 'timestamps',
    question: 'How do I start playback at a specific timestamp?',
    answer:
      'Include a standard YouTube time parameter in your link, such as ?t=90, ?t=1m30s, &start=120, or #t=45. The player converts the timestamp automatically into seconds and starts the embed from that exact moment.',
  },
  {
    id: 'legal-and-safe',
    question: 'Is this distraction-free YouTube viewer legal and safe to use?',
    answer:
      'Yes. Everything runs in your browser using YouTube’s official youtube-nocookie.com iframe embed with standard playback parameters. It does not bypass paywalls, alter YouTube scripts, or proxy copyrighted streams.',
  },
];
