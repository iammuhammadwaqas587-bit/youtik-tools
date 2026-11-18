import React from 'react';
import { getBlogPostBySlug, BLOG_POSTS } from '../data/blogPosts';
import {
  tokenizeInlineLinks,
  getRelatedBlogPosts,
  getRelatedToolsForPost,
} from '../utils/blogInterlinking';
import {
  Clock,
  Calendar,
  Tag,
  Share2,
  ArrowRight,
  Sparkles,
  Wrench,
  List,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

const RichInlineText: React.FC<{
  text: string;
  onNavigate: (path: string) => void;
}> = ({ text, onNavigate }) => {
  const tokens = tokenizeInlineLinks(text);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.type === 'link' && tok.href) {
          const href = tok.href;
          return (
            <a
              key={i}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(href);
              }}
              className="text-red-600 font-semibold underline decoration-red-200 underline-offset-2 hover:text-red-700 hover:decoration-red-500 transition-colors"
            >
              {tok.content}
            </a>
          );
        }
        return <React.Fragment key={i}>{tok.content}</React.Fragment>;
      })}
    </>
  );
};

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
        <p className="text-xs text-slate-500">
          The requested guide may have moved or been updated.
        </p>
        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/blog');
          }}
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Blog
        </a>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('Article link copied to clipboard!');
    }
  };

  const tocSections = post.content
    .map((sec, idx) => ({ heading: sec.heading, id: `section-${idx}` }))
    .filter((item): item is { heading: string; id: string } => Boolean(item.heading));

  const relatedTools = getRelatedToolsForPost(post);
  const relatedPosts = getRelatedBlogPosts(post, BLOG_POSTS, 4);
  const primaryTool = relatedTools[0];

  return (
    <article className="max-w-3xl mx-auto space-y-8 px-4">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-slate-900 hover:underline cursor-pointer"
        >
          Home
        </a>
        <span>/</span>
        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/blog');
          }}
          className="hover:text-slate-900 hover:underline cursor-pointer"
        >
          Blog
        </a>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-sm">
          {post.title}
        </span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <span>{post.category}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {post.excerpt}
        </p>

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
              <time dateTime={post.isoDate || post.publishDate}>
                {post.publishDate}
              </time>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{post.readTime}</span>
            </span>
            <span>·</span>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer font-bold"
              title="Share article"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Cover Banner */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* On-Page Table of Contents (Jump Navigation) */}
      {tocSections.length > 1 && (
        <nav
          aria-label="Table of contents"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-900">
            <List className="h-4 w-4 text-red-600" />
            <span>In This Guide</span>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
            {tocSections.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="hover:text-red-600 hover:underline font-medium flex items-start gap-1.5"
                >
                  <span className="text-red-600 font-bold">{index + 1}.</span>
                  <span>{item.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Article Body Content */}
      <div className="space-y-8 text-slate-800 text-sm sm:text-base leading-relaxed font-sans">
        {post.content.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {section.heading && (
              <h2
                id={`section-${idx}`}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-3 border-t border-slate-100 scroll-mt-24"
              >
                {section.heading}
              </h2>
            )}

            {section.subheading && (
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {section.subheading}
              </h3>
            )}

            {section.body.map((para, pIdx) => (
              <p key={pIdx} className="text-slate-700 leading-relaxed font-normal">
                <RichInlineText text={para} onNavigate={onNavigate} />
              </p>
            ))}

            {section.tips && section.tips.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-100 border-l-4 border-red-600 text-xs sm:text-sm space-y-1.5 my-3">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  <span>Pro Tip:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {section.tips.map((tip, tIdx) => (
                    <li key={tIdx}>
                      <RichInlineText text={tip} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Article FAQ Section (Rich Snippet + Reader Clarity) */}
      {post.faqs && post.faqs.length > 0 && (
        <section
          aria-labelledby="guide-faq-heading"
          className="pt-6 border-t border-slate-200 space-y-4"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-red-600" />
            <h2
              id="guide-faq-heading"
              className="text-lg sm:text-xl font-extrabold text-slate-900"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {post.faqs.map((faq, fIdx) => (
              <details
                key={fIdx}
                open={fIdx === 0}
                className="group rounded-xl bg-white border border-slate-200 p-4 shadow-xs"
              >
                <summary className="cursor-pointer font-bold text-xs sm:text-sm text-slate-900 list-none flex items-center justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="text-red-600 font-bold text-base leading-none group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Contextual Free Tools Interlinking Box */}
      <section
        aria-labelledby="related-tools-heading"
        className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-red-600" />
            <h2
              id="related-tools-heading"
              className="text-base sm:text-lg font-extrabold text-slate-900"
            >
              Related Free Tools on YouTikTools
            </h2>
          </div>
          <a
            href="/tools"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/tools');
            }}
            className="text-xs font-bold text-red-600 hover:underline shrink-0"
          >
            View All 20+ Tools →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {relatedTools.map((tool) => (
            <a
              key={tool.path}
              href={tool.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(tool.path);
              }}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-xs transition-all group block text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  {tool.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-600 leading-snug">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* High-Converting Primary Tool CTA Card */}
      <div className="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-100/50 border border-red-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-lg font-bold text-slate-900">
              {primaryTool
                ? `Try ${primaryTool.label} Free`
                : 'Ready to Download Videos Without Watermark?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {primaryTool
                ? primaryTool.description
                : 'Paste your link into YouTikTools to get 1080p MP4 or MP3 files in seconds. 100% free with universal mobile & laptop playback.'}
            </p>
          </div>

          <a
            href={primaryTool ? primaryTool.path : '/'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(primaryTool ? primaryTool.path : '/');
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>{primaryTool ? `Open ${primaryTool.label}` : 'Try YouTikTools'}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1">
          <Tag className="h-3.5 w-3.5 text-slate-500" />
          <span>Tags:</span>
        </span>
        {post.tags.map((tag, idx) => (
          <a
            key={idx}
            href={`/blog?q=${encodeURIComponent(tag)}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/blog');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-medium transition-colors"
          >
            #{tag}
          </a>
        ))}
      </div>

      {/* Topically Matched Recommended Reading (4 Guides) */}
      <section
        aria-labelledby="recommended-reading-heading"
        className="pt-8 border-t border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-red-600" />
            <h2
              id="recommended-reading-heading"
              className="text-lg font-extrabold text-slate-900"
            >
              Recommended Reading
            </h2>
          </div>
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/blog');
            }}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            All {BLOG_POSTS.length} Guides →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedPosts.map((rel) => (
            <a
              key={rel.slug}
              href={`/blog/${rel.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blog/${rel.slug}`);
              }}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-xs transition-all cursor-pointer space-y-2 group block text-left"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                <span className="text-red-600 uppercase">{rel.category}</span>
                <span className="text-slate-400 font-medium">{rel.readTime}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                {rel.title}
              </h3>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                {rel.excerpt}
              </p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
};
