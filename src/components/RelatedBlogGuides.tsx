import React from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { getRelatedBlogsForTool } from '../utils/blogInterlinking';

interface RelatedBlogGuidesProps {
  toolPath: string;
  onNavigate?: (path: string) => void;
  heading?: string;
  subheading?: string;
  maxWidthClass?: string;
}

export const RelatedBlogGuides: React.FC<RelatedBlogGuidesProps> = ({
  toolPath,
  onNavigate,
  heading = 'Read our guides',
  subheading = 'Step-by-step walkthroughs, practical formulas, and helpful examples for this tool.',
  maxWidthClass = 'max-w-4xl mx-auto px-4',
}) => {
  const posts = getRelatedBlogsForTool(toolPath, BLOG_POSTS, 3);

  if (!posts.length) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <section
      aria-label={heading}
      className={maxWidthClass}
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-red-600 shrink-0" aria-hidden="true" />
              <span>{heading}</span>
            </h2>
            <p className="text-xs text-slate-500">{subheading}</p>
          </div>

          <a
            href="/blog"
            onClick={(e) => handleLinkClick(e, '/blog')}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline shrink-0"
          >
            <span>Browse all {BLOG_POSTS.length} guides</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={(e) => handleLinkClick(e, `/blog/${post.slug}`)}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-white transition-all group flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                  <span className="text-red-600">{post.category}</span>
                  <span className="inline-flex items-center gap-1 text-slate-500 font-normal">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 group-hover:text-red-600 pt-0.5">
                <span>Read guide</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
