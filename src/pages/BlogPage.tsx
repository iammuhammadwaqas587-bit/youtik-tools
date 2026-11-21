import React, { useState, useMemo, useEffect } from 'react';
import { BLOG_POSTS } from '../data/blogPosts';
import { POPULAR_TOOL_HUB_LINKS } from '../utils/blogInterlinking';
import { BookOpen, Clock, Calendar, ArrowRight, Search, Wrench, Sun, Moon } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 9;
const THEME_STORAGE_KEY = 'youtiktools_blog_theme';

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('category') || 'All';
    }
    return 'All';
  });

  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage error
    }
  }, [isDark]);

  // Dynamically derive categories from BLOG_POSTS so new categories appear automatically
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of BLOG_POSTS) {
      counts.set(post.category, (counts.get(post.category) || 0) + 1);
    }
    const ordered = Array.from(counts.keys());
    return ['All', ...ordered];
  }, []);

  const query = search.trim().toLowerCase();
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCat =
        selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch =
        query === '' ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query)) ||
        (post.keywords?.some((k) => k.toLowerCase().includes(query)) ?? false);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, query]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="max-w-5xl mx-auto space-y-8 px-4 py-4 sm:py-6 rounded-3xl transition-colors dark:bg-slate-900 dark:text-slate-100">
        {/* Header with Light / Dark Reader Toggle */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="w-full flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Knowledge Hub · {BLOG_POSTS.length} Guides</span>
            </span>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Switch to light reading mode' : 'Switch to dark reading mode'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            YouTikTools <span className="text-red-600 dark:text-red-400">Knowledge Hub</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Practical guides written for everyday calculations in Pakistan, Islamic dates &amp; Zakat rules, university GPA planning, QR workflows, and creator tutorials.
          </p>
        </div>

        {/* Topic-to-Tool Internal Linking Hub Strip */}
        <section
          aria-label="Popular free tools"
          className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span>Explore Free Tools Covered in These Guides</span>
            </span>
            <a
              href="/tools"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/tools');
              }}
              className="font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
            >
              All 25+ Tools →
            </a>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { path: '/zakat-calculator', label: 'Zakat Calculator' },
              { path: '/wirasat-calculator', label: 'Wirasat Calculator' },
              { path: '/ramadan-timetable', label: 'Ramadan Timetable' },
              { path: '/hijri-date-converter', label: 'Hijri Converter' },
              { path: '/islamic-baby-names', label: 'Islamic Baby Names' },
              { path: '/land-area-converter', label: 'Land Area Converter' },
              { path: '/gold-calculator', label: 'Gold Rate Calculator' },
              { path: '/gpa-calculator', label: 'GPA & CGPA Calculator' },
              { path: '/qr-code-generator', label: 'QR Code Generator' },
              { path: '/youtube-thumbnail-downloader', label: 'YouTube Thumbnails' },
              { path: '/youtube-tag-generator', label: 'YouTube Tag Generator' },
              ...POPULAR_TOOL_HUB_LINKS.slice(0, 4),
            ].map((tool) => (
              <a
                key={tool.path}
                href={tool.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(tool.path);
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                {tool.label}
              </a>
            ))}
          </div>
        </section>

        {/* Category Filter Chips + Search Bar */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Zakat, Marla, GPA, QR, YouTube..."
                aria-label="Search blog articles and tags"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-red-500 shadow-2xs"
              />
            </div>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
              Showing {visiblePosts.length} of {filteredPosts.length} guides
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No articles matched your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                handleCategorySelect('All');
                handleSearchChange('');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePosts.map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/blog/${post.slug}`);
                  }}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-red-300 dark:hover:border-red-500 transition-all cursor-pointer group flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={post.coverImage}
                        alt={post.imageAlt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="text-red-600 dark:text-red-400 font-bold">{post.category}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.publishDate}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80 mt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                        loading="lazy"
                      />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {post.author.name}
                      </span>
                    </div>

                    <span className="text-red-600 dark:text-red-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Load more guides ({filteredPosts.length - visiblePosts.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
