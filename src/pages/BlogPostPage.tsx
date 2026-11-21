import React, { useState, useEffect } from 'react';
import { getBlogPostBySlug, BLOG_POSTS } from '../data/blogPosts';
import {
  tokenizeInlineLinks,
  getRelatedBlogPosts,
  getRelatedToolsForPost,
  toIsoDateString,
  toUpdatedIsoDateString,
} from '../utils/blogInterlinking';
import {
  Clock,
  Calendar,
  Tag,
  ArrowRight,
  Sparkles,
  Wrench,
  List,
  HelpCircle,
  BookOpen,
  Copy,
  Check,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

const THEME_STORAGE_KEY = 'youtiktools_blog_theme';

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
              className="text-red-600 dark:text-red-400 font-semibold underline decoration-red-200 dark:decoration-red-800 underline-offset-2 hover:text-red-700 dark:hover:text-red-300 hover:decoration-red-500 transition-colors"
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
  const [copiedLink, setCopiedLink] = useState(false);
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

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
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
          Back to Knowledge Hub
        </a>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      onShowToast('Article link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const pageUrl =
    typeof window !== 'undefined'
      ? `https://youtiktools.com/blog/${post.slug}`
      : `https://youtiktools.com/blog/${post.slug}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const tocSections = post.content
    .map((sec, idx) => ({ heading: sec.heading, id: `section-${idx}` }))
    .filter((item): item is { heading: string; id: string } => Boolean(item.heading));

  const relatedTools = getRelatedToolsForPost(post);
  const relatedPosts = getRelatedBlogPosts(post, BLOG_POSTS, 3);
  const primaryTool = relatedTools[0];
  const displayUpdatedDate = post.updatedDate || post.publishDate;
  const hasIntroBlock = Boolean(post.content[0] && !post.content[0].heading);
  const introSection = hasIntroBlock ? post.content[0] : null;
  const bodySections = hasIntroBlock ? post.content.slice(1) : post.content;
  const bodyOffset = hasIntroBlock ? 1 : 0;

  const tryToolCtaBox = primaryTool ? (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-red-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 border border-red-200 dark:border-red-900/60 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-lg">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Free Browser Tool
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Try {primaryTool.label}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {primaryTool.description}
          </p>
        </div>

        <a
          href={primaryTool.path}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(primaryTool.path);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Open {primaryTool.label}</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  ) : null;

  return (
    <div className={isDark ? 'dark' : ''}>
      <article className="max-w-3xl mx-auto space-y-8 px-4 py-4 sm:py-6 rounded-3xl transition-colors dark:bg-slate-900 dark:text-slate-100">
        {/* Top Row: Breadcrumb (Home > Blog > Category > Post) + Reader Theme Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
            >
              Home
            </a>
            <span>&gt;</span>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/blog');
              }}
              className="hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
            >
              Blog
            </a>
            <span>&gt;</span>
            <a
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blog?category=${encodeURIComponent(post.category)}`);
              }}
              className="hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
            >
              {post.category}
            </a>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[180px] sm:max-w-xs">
              {post.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label={isDark ? 'Switch to light reading mode' : 'Switch to dark reading mode'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            {post.category}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author & Dates Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{post.author.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Published </span>
                <time dateTime={toIsoDateString(post)}>{post.publishDate}</time>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Updated </span>
                <time dateTime={toUpdatedIsoDateString(post)}>{displayUpdatedDate}</time>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{post.readTime}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cover Banner */}
        <figure className="space-y-2">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs">
            <img
              src={post.coverImage}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
          {post.imageAlt && (
            <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic">
              {post.imageAlt}
            </figcaption>
          )}
        </figure>

        {/* Dedicated Introduction + Highlighted "Try the tool" CTA Box */}
        {introSection && (
          <div className="space-y-6">
            <div className="space-y-4 text-slate-800 dark:text-slate-200 text-base leading-relaxed">
              {introSection.body.map((para, pIdx) => (
                <p key={pIdx} className="leading-[1.75]">
                  <RichInlineText text={para} onNavigate={onNavigate} />
                </p>
              ))}
            </div>
            {tryToolCtaBox}
          </div>
        )}

        {/* On-Page Table of Contents (Auto-generated from H2 Headings) */}
        {tocSections.length > 1 && (
          <nav
            aria-label="Table of contents"
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              <List className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Table of Contents</span>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              {tocSections.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="hover:text-red-600 dark:hover:text-red-400 hover:underline font-medium flex items-start gap-1.5"
                  >
                    <span className="text-red-600 dark:text-red-400 font-bold">{index + 1}.</span>
                    <span>{item.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {!introSection && tryToolCtaBox}

        {/* Article Body Content (Max readability measure & leading) */}
        <div className="space-y-8 text-slate-800 dark:text-slate-200 text-[15px] sm:text-base leading-[1.75] font-sans">
          {bodySections.map((section, relIdx) => {
            const idx = relIdx + bodyOffset;
            return (
              <section key={idx} className="space-y-4">
                {section.heading && (
                  <h2
                    id={`section-${idx}`}
                    className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-4 border-t border-slate-200/70 dark:border-slate-700/70 scroll-mt-24"
                  >
                    {section.heading}
                  </h2>
                )}

                {section.subheading && (
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    {section.subheading}
                  </h3>
                )}

                {section.body.map((para, pIdx) => (
                  <p key={pIdx} className="text-slate-700 dark:text-slate-300 leading-[1.75] font-normal">
                    <RichInlineText text={para} onNavigate={onNavigate} />
                  </p>
                ))}

                {section.example && (
                  <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs sm:text-sm space-y-1.5">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                      Worked Example
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      <RichInlineText text={section.example} onNavigate={onNavigate} />
                    </p>
                  </div>
                )}

                {section.subsections && section.subsections.length > 0 && (
                  <div className="space-y-5 pt-1">
                    {section.subsections.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2.5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {sub.subheading}
                        </h3>
                        {sub.body.map((p, spIdx) => (
                          <p key={spIdx} className="text-slate-700 dark:text-slate-300 leading-[1.75]">
                            <RichInlineText text={p} onNavigate={onNavigate} />
                          </p>
                        ))}
                        {sub.example && (
                          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs sm:text-sm space-y-1">
                            <div className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                              Worked Example
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                              <RichInlineText text={sub.example} onNavigate={onNavigate} />
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.tips && section.tips.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-2 my-3">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span>Key Takeaways:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 pl-1">
                      {section.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">
                          <RichInlineText text={tip} onNavigate={onNavigate} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Share Buttons Strip: WhatsApp, Facebook, X, Copy Link */}
        <section
          aria-label="Share this guide"
          className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3"
        >
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Share this guide:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white transition-colors"
            >
              X (Twitter)
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-slate-400 cursor-pointer transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        {post.faqs && post.faqs.length > 0 && (
          <section
            aria-labelledby="guide-faq-heading"
            className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2
                id="guide-faq-heading"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white"
              >
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {post.faqs.map((faq, fIdx) => (
                <details
                  key={fIdx}
                  open={fIdx === 0}
                  className="group rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs"
                >
                  <summary className="cursor-pointer font-bold text-xs sm:text-sm text-slate-900 dark:text-white list-none flex items-center justify-between gap-3">
                    <span>{faq.question}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold text-base leading-none group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Tools Box (2-3 tools) */}
        <section
          aria-labelledby="related-tools-heading"
          className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h2
                id="related-tools-heading"
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white"
              >
                Related tools
              </h2>
            </div>
            <a
              href="/tools"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/tools');
              }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
            >
              View All 25+ Tools →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.slice(0, 3).map((tool) => (
              <a
                key={tool.path}
                href={tool.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(tool.path);
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500 hover:shadow-xs transition-all group block text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {tool.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Bottom High-Converting CTA */}
        <div className="my-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-100/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border border-red-200 dark:border-red-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {primaryTool
                  ? `Ready to use ${primaryTool.label}?`
                  : 'Explore Free Browser Tools on YouTikTools'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {primaryTool
                  ? primaryTool.description
                  : 'Fast, free browser-based calculators and utilities with zero account signup.'}
              </p>
            </div>

            <a
              href={primaryTool ? primaryTool.path : '/tools'}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(primaryTool ? primaryTool.path : '/tools');
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>{primaryTool ? `Try ${primaryTool.label}` : 'Browse Tools'}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <span>Tags:</span>
          </span>
          {post.tags.map((tag, idx) => (
            <a
              key={idx}
              href={`/blog?q=${encodeURIComponent(tag)}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blog?q=${encodeURIComponent(tag)}`);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-700 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              #{tag}
            </a>
          ))}
        </div>

        {/* Related Articles (3 posts) */}
        <section
          aria-labelledby="recommended-reading-heading"
          className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h2
                id="recommended-reading-heading"
                className="text-lg font-extrabold text-slate-900 dark:text-white"
              >
                Related articles
              </h2>
            </div>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/blog');
              }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              All {BLOG_POSTS.length} Guides →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <a
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/blog/${rel.slug}`);
                }}
                className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500 hover:shadow-xs transition-all cursor-pointer space-y-2 group block text-left"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                  <span className="text-red-600 dark:text-red-400 uppercase">{rel.category}</span>
                  <span className="text-slate-400 font-medium">{rel.readTime}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {rel.title}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                  {rel.excerpt}
                </p>
              </a>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};
