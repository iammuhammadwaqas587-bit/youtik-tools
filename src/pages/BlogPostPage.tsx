import React, { useEffect } from 'react';
import { getBlogPostBySlug, BLOG_POSTS } from '../data/blogPosts';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  Share2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Film 
} from 'lucide-react';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  slug,
  onNavigate,
  onShowToast,
}) => {
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-xs text-slate-500">The requested guide may have moved or been updated.</p>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('Article link copied to clipboard!');
    }
  };

  return (
    <article className="max-w-3xl mx-auto space-y-8 px-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2">
        <button 
          onClick={() => onNavigate('/')} 
          className="hover:text-slate-900 hover:underline cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button 
          onClick={() => onNavigate('/blog')} 
          className="hover:text-slate-900 hover:underline cursor-pointer"
        >
          Blog
        </button>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-sm">
          {post.title}
        </span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <span>{post.category}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Author & Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="font-bold text-slate-900">{post.author.name}</p>
              <p className="text-[11px] text-slate-500">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{post.publishDate}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{post.readTime}</span>
            </span>
            <span>·</span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer font-bold"
              title="Share article"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Banner */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Body Content */}
      <div className="space-y-8 text-slate-800 text-sm sm:text-base leading-relaxed font-sans">
        {post.content.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {section.heading && (
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-2 border-t border-slate-100">
                {section.heading}
              </h2>
            )}

            {section.body.map((para, pIdx) => (
              <p key={pIdx} className="text-slate-700 leading-relaxed font-normal">
                {para}
              </p>
            ))}

            {section.tips && (
              <div className="p-4 rounded-xl bg-slate-100 border-l-4 border-red-600 text-xs sm:text-sm space-y-1 my-3">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  <span>Pro Tip:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {section.tips.map((tip, tIdx) => (
                    <li key={tIdx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* High-Converting CTA Card */}
      <div className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-100/50 border border-red-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-lg font-bold text-slate-900">
              Ready to Download Videos Without Watermark?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Paste your link into YouTikTools to get 1080p MP4 or MP3 files in seconds. 100% free with universal mobile & laptop playback.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Try YouTikTools</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1">
          <Tag className="h-3.5 w-3.5 text-slate-500" />
          <span>Tags:</span>
        </span>
        {post.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Related articles */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recommended Reading</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 2).map((rel) => (
            <div
              key={rel.slug}
              onClick={() => onNavigate(`/blog/${rel.slug}`)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer space-y-2 group"
            >
              <span className="text-[10px] font-bold text-red-600 uppercase">
                {rel.category}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                {rel.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
