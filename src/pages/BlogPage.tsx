import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/blogPosts';
import { POPULAR_TOOL_HUB_LINKS } from '../utils/blogInterlinking';
import { BookOpen, Clock, ArrowRight, Search, Wrench } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'YouTube Tutorials',
    'TikTok Tutorials',
    'Video Guides',
    'Video Compression',
    'Video Formats',
    'Content Creation',
    'Technical Guides',
    'Software Reviews',
    'Audio Conversion',
    'Troubleshooting',
  ];

  const query = search.trim().toLowerCase();
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCat =
      selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      query === '' ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3 shadow-xs">
          <BookOpen className="h-3.5 w-3.5 text-red-600" />
          <span>{BLOG_POSTS.length} Guides, Tutorials & Tech Articles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          YouTikTools <span className="text-red-600">Knowledge Hub</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
          In-depth tutorials on YouTube 4K & 1080p extraction, TikTok watermark removal, 320kbps audio bitrates, browser editing, and codec compatibility.
        </p>
      </div>

      {/* Topic-to-Tool Internal Linking Hub Strip */}
      <section
        aria-label="Popular free video tools"
        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-red-600" />
            <span>Explore Tools Covered in These Guides</span>
          </span>
          <a
            href="/tools"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/tools');
            }}
            className="font-bold text-red-600 hover:underline"
          >
            All 20+ Tools →
          </a>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TOOL_HUB_LINKS.map((tool) => (
            <a
              key={tool.path}
              href={tool.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(tool.path);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 text-[11px] font-semibold text-slate-700 transition-colors"
            >
              {tool.label}
            </a>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides & tags..."
            aria-label="Search blog articles and tags"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-slate-500 shadow-xs"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            No articles matched your filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearch('');
            }}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blog/${post.slug}`);
              }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-red-200 transition-all cursor-pointer group flex flex-col justify-between text-left"
            >
              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="text-red-600 font-bold">{post.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between border-t border-slate-100 mt-2 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-slate-700 font-medium">
                    {post.author.name}
                  </span>
                </div>

                <span className="text-red-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Read</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
