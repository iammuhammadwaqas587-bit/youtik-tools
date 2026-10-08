import { useState, useEffect } from 'react';

export type AppRoute = 
  | '/'
  | '/youtube-video-downloader'
  | '/tiktok-video-downloader'
  | '/youtube-to-mp3'
  | '/video-captions-downloader'
  | '/youtube-tags-extractor'
  | '/video-script-transcript-downloader'
  | '/batch-downloader'
  | '/blog'
  | '/blog/:slug';

export interface RouteMatch {
  path: string;
  route: AppRoute;
  params: Record<string, string>;
}

export function parseRoute(pathname: string): RouteMatch {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '/home') {
    return { path: '/', route: '/', params: {} };
  }
  if (cleanPath === '/youtube-video-downloader' || cleanPath === '/youtube') {
    return { path: '/youtube-video-downloader', route: '/youtube-video-downloader', params: {} };
  }
  if (cleanPath === '/tiktok-video-downloader' || cleanPath === '/tiktok') {
    return { path: '/tiktok-video-downloader', route: '/tiktok-video-downloader', params: {} };
  }
  if (cleanPath === '/youtube-to-mp3' || cleanPath === '/audio') {
    return { path: '/youtube-to-mp3', route: '/youtube-to-mp3', params: {} };
  }
  if (cleanPath === '/video-captions-downloader' || cleanPath === '/subtitles' || cleanPath === '/captions') {
    return { path: '/video-captions-downloader', route: '/video-captions-downloader', params: {} };
  }
  if (cleanPath === '/youtube-tags-extractor' || cleanPath === '/tags' || cleanPath === '/tags-extractor') {
    return { path: '/youtube-tags-extractor', route: '/youtube-tags-extractor', params: {} };
  }
  if (cleanPath === '/video-script-transcript-downloader' || cleanPath === '/scripts' || cleanPath === '/transcript') {
    return { path: '/video-script-transcript-downloader', route: '/video-script-transcript-downloader', params: {} };
  }
  if (cleanPath === '/batch-downloader' || cleanPath === '/batch') {
    return { path: '/batch-downloader', route: '/batch-downloader', params: {} };
  }
  if (cleanPath === '/blog') {
    return { path: '/blog', route: '/blog', params: {} };
  }

  // Match /blog/:slug
  const blogMatch = cleanPath.match(/^\/blog\/([a-zA-Z0-9_-]+)$/);
  if (blogMatch) {
    return { 
      path: cleanPath, 
      route: '/blog/:slug', 
      params: { slug: blogMatch[1] } 
    };
  }

  // Fallback to home
  return { path: '/', route: '/', params: {} };
}

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentRoute = parseRoute(currentPath);

  return {
    path: currentPath,
    route: currentRoute.route,
    params: currentRoute.params,
    navigate
  };
}
