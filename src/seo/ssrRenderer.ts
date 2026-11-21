import { SEO_ROUTES, SeoRouteInfo } from './routesData';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';
import { YOUTUBE_PLAYER_FAQ, YOUTUBE_PLAYER_SEO } from '../data/youtubePlayerFaq';
import {
  IMAGE_CONVERTER_FAQ,
  IMAGE_CONVERTER_ROUTES,
  FORMAT_COMPARISON_ROWS,
  POPULAR_CONVERSIONS,
  type ImageConverterRoutePath,
} from '../data/imageConverterSeo';
import {
  renderInlineLinksHtml,
  getRelatedBlogPosts,
  getRelatedToolsForPost,
  getRelatedBlogsForTool,
  toIsoDateString,
  toUpdatedIsoDateString,
  POPULAR_TOOL_HUB_LINKS,
} from '../utils/blogInterlinking';

function renderRelatedBlogsSsrSection(toolPath: string): string {
  const posts = getRelatedBlogsForTool(toolPath, BLOG_POSTS, 3);
  if (!posts.length) return '';
  return `
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">Read our guides</h2>
            <a href="/blog" class="text-xs font-bold text-red-600 hover:underline">All ${BLOG_POSTS.length} Guides →</a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            ${posts
              .map(
                (p) => `
              <a href="/blog/${escapeHtml(p.slug)}" class="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 block space-y-1">
                <span class="font-semibold text-red-600">${escapeHtml(p.category)} · ${escapeHtml(p.readTime)}</span>
                <h3 class="font-bold text-slate-900">${escapeHtml(p.title)}</h3>
                <p class="text-slate-600">${escapeHtml(p.excerpt)}</p>
              </a>`
              )
              .join('')}
          </div>
        </section>`;
}

export function getRouteMetadata(pathname: string): {
  isFound: boolean;
  meta: SeoRouteInfo;
  blogPost?: BlogPost;
} {
  // Direct match
  if (SEO_ROUTES[pathname]) {
    return { isFound: true, meta: SEO_ROUTES[pathname] };
  }

  // Blog post match
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').trim();
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (post) {
      const title = post.seoTitle.length < 60 ? post.seoTitle : post.seoTitle.slice(0, 56) + '...';
      const desc = post.metaDescription.length < 160 ? post.metaDescription : post.metaDescription.slice(0, 156) + '...';
      return {
        isFound: true,
        meta: {
          path: pathname,
          title,
          description: desc,
          h1: post.title,
          category: 'blog',
          changefreq: 'weekly',
          priority: '0.8',
          ogType: 'article',
          ogImage: post.coverImage,
        },
        blogPost: post,
      };
    }
  }

  // 404 Route
  return {
    isFound: false,
    meta: {
      path: pathname,
      title: '404 - Page Not Found | YouTikTools',
      description: 'The requested page could not be found on YouTikTools. Explore our free YouTube and TikTok video downloaders and media converters.',
      h1: '404 - Page Not Found',
      category: 'info',
      changefreq: 'monthly',
      priority: '0.1',
    },
  };
}

export function renderPageHtml(pathname: string, canonicalDomain: string): {
  html: string;
  statusCode: number;
} {
  const { isFound, meta, blogPost } = getRouteMetadata(pathname);
  const canonicalUrl = `${canonicalDomain}${pathname === '/' ? '' : pathname}`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage.startsWith('http')
      ? meta.ogImage
      : `${canonicalDomain}${meta.ogImage}`
    : `${canonicalDomain}/pwa-512x512.png`;

  // Organization & WebApplication Schema
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'YouTikTools',
      url: canonicalDomain,
      logo: `${canonicalDomain}/pwa-512x512.png`,
      sameAs: [
        'https://twitter.com/youtiktools',
        'https://github.com/youtiktools'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@youtiktools.com'
      }
    }
  ];

  if (blogPost) {
    const isoDate = toIsoDateString(blogPost);
    const updatedIsoDate = toUpdatedIsoDateString(blogPost);
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['Article', 'BlogPosting'],
      headline: blogPost.title,
      description: meta.description,
      articleSection: blogPost.category,
      ...(blogPost.keywords?.length ? { keywords: blogPost.keywords.join(', ') } : {}),
      image: [ogImageUrl],
      datePublished: `${isoDate}T08:00:00+00:00`,
      dateModified: `${updatedIsoDate}T12:00:00+00:00`,
      author: {
        '@type': 'Organization',
        name: blogPost.author.name,
        url: canonicalDomain,
      },
      publisher: {
        '@type': 'Organization',
        name: 'YouTikTools',
        logo: {
          '@type': 'ImageObject',
          url: `${canonicalDomain}/pwa-512x512.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalDomain },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${canonicalDomain}/blog` },
        { '@type': 'ListItem', position: 3, name: blogPost.category, item: `${canonicalDomain}/blog?category=${encodeURIComponent(blogPost.category)}` },
        { '@type': 'ListItem', position: 4, name: blogPost.title, item: canonicalUrl },
      ],
    });
    if (blogPost.faqs && blogPost.faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: blogPost.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }
  } else if (pathname === '/youtube-player') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'YouTube Player',
      url: canonicalUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Runs in any modern web browser.',
      isAccessibleForFree: true,
      description: YOUTUBE_PLAYER_SEO.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: YOUTUBE_PLAYER_FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  } else if (pathname in IMAGE_CONVERTER_ROUTES) {
    const imgRoute = IMAGE_CONVERTER_ROUTES[pathname as ImageConverterRoutePath];
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: imgRoute.h1,
      url: canonicalUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas. Runs in any modern browser.',
      isAccessibleForFree: true,
      description: imgRoute.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalDomain },
        ...(pathname !== '/image-converter'
          ? [{ '@type': 'ListItem', position: 2, name: 'Image Format Converter', item: `${canonicalDomain}/image-converter` },
             { '@type': 'ListItem', position: 3, name: imgRoute.h1, item: canonicalUrl }]
          : [{ '@type': 'ListItem', position: 2, name: imgRoute.h1, item: canonicalUrl }]),
      ],
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: IMAGE_CONVERTER_FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  } else if (isFound) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'YouTikTools - ' + meta.h1,
      url: canonicalUrl,
      applicationCategory:
        pathname === '/age-calculator' ||
        pathname === '/prayer-times' ||
        pathname === '/land-area-converter' ||
        pathname === '/gold-calculator' ||
        pathname === '/gpa-calculator' ||
        pathname === '/zakat-calculator' ||
        pathname === '/hijri-date-converter' ||
        pathname === '/ramadan-timetable' ||
        pathname === '/islamic-baby-names' ||
        pathname === '/wirasat-calculator'
          ? 'UtilitiesApplication'
          : 'MultimediaApplication',
      operatingSystem: 'All',
      description: meta.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
    if (pathname === '/age-calculator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How is age calculated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Chronological age is computed by subtracting Date of Birth from the target date calendar-by-calendar, borrowing exact days from the previous month when needed, and converting exact calendar days into total months, weeks, and hours.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it handle leap years?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. February is counted as 29 days in leap years and 28 days in common years when borrowing days or calculating birthday countdowns.',
            },
          },
        ],
      });
    } else if (pathname === '/prayer-times') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which calculation method and Asr juristic school are used?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Prayer times use the University of Islamic Sciences, Karachi calculation method (Method 1) and Hanafi Asr timing (School 1) via the Aladhan API.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is the Qibla direction measured?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Qibla is displayed in degrees clockwise from True North toward the Kaaba in Makkah.',
            },
          },
        ],
      });
    } else if (pathname === '/land-area-converter') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How many square feet are in 1 Marla and 1 Kanal in Pakistan?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Under Pakistan’s standard revenue rule, 1 Marla equals 272.25 sq ft and 1 Kanal equals 20 Marlas (5,445 sq ft). Some private housing societies such as DHA use a 225 sq ft Marla (4,500 sq ft Kanal).',
            },
          },
        ],
      });
    } else if (pathname === '/gold-calculator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How many grams in one tola?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '1 Tola equals exactly 11.664 grams (or 12 Masha / 96 Ratti) in Pakistan and South Asian bullion trading.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between 22K and 24K gold?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '24K gold is pure 100% bullion gold, while 22K gold contains 91.67% pure gold alloyed for jewellery durability.',
            },
          },
        ],
      });
    } else if (pathname === '/qr-code-generator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are my QR code links or Wi-Fi passwords stored on a server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Both QR code generation and scanning run 100% locally in your browser without sending data to a server.',
            },
          },
        ],
      });
    } else if (pathname === '/youtube-thumbnail-downloader') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Why is Max Resolution not available on every YouTube video?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'YouTube generates 1280x720 maxresdefault thumbnails only for HD uploads with high-res artwork. Our tool checks every size and automatically hides missing placeholders.',
            },
          },
        ],
      });
    } else if (pathname === '/youtube-tag-generator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do tags still help in 2026?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tags have a small effect in 2026—mainly for common misspellings and topic context—while your title, thumbnail, and watch-time retention matter far more.',
            },
          },
        ],
      });
    } else if (pathname === '/gpa-calculator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How is GPA calculated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Multiply each course’s credit hours by its grade point to find quality points, sum all quality points, and divide by total credit hours.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between GPA and CGPA?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'GPA measures a single semester while CGPA is the credit-weighted average across all completed semesters.',
            },
          },
        ],
      });
    } else if (pathname === '/zakat-calculator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Should I choose Silver Nisab or Gold Nisab for Zakat in Pakistan?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Scholars in Pakistan recommend Silver Nisab (52.5 tola / 612.36 g) whenever holding cash or mixed assets because it helps more deserving recipients.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Zakat payable on 22K or 21K gold jewellery?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, Zakat applies to gold jewellery scaled by purity (91.67% for 22K, 87.5% for 21K, 75% for 18K) when total wealth meets Nisab.',
            },
          },
        ],
      });
    } else if (pathname === '/hijri-date-converter') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Why does Pakistan’s Hijri date differ by 1 day from Saudi Arabia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Pakistan’s Central Ruet-e-Hilal Committee follows physical local moon sighting, which typically begins one day after Umm al-Qura tabular dates.',
            },
          },
        ],
      });
    } else if (pathname === '/ramadan-timetable') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which calculation method is used for Pakistan Ramadan timings?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The timetable defaults to University of Islamic Sciences, Karachi (Method 1) and the Hanafi Asr juristic school.',
            },
          },
        ],
      });
    } else if (pathname === '/islamic-baby-names') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are the names in the Islamic Baby Names Finder authentic?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Every entry in our 500+ database includes authentic English, Urdu Nastaliq, and Arabic scripts with positive Islamic meanings.',
            },
          },
        ],
      });
    } else if (pathname === '/wirasat-calculator') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What deductions apply before Wirasat distribution?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Burial expenses, outstanding debts, and valid bequests (Wasiyyat) capped at 1/3 of the remaining estate are deducted before heir distribution.',
            },
          },
        ],
      });
    }
  }

  // Pre-rendered body content
  let bodyContent = '';

  if (!isFound) {
    bodyContent = `
      <main class="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          HTTP 404 Status
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${meta.h1}</h1>
        <p class="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          The link you followed may be broken, or the page may have been removed. Use the directory below to find all free download and conversion tools.
        </p>
        <div class="pt-4 flex flex-wrap justify-center gap-3">
          <a href="/" class="px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition-colors">
            Go to Home Downloader
          </a>
          <a href="/tools" class="px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-colors">
            Browse All 20+ Tools
          </a>
        </div>
      </main>
    `;
  } else if (blogPost) {
    const tocItems = blogPost.content
      .map((sec, idx) => ({ heading: sec.heading, id: `section-${idx}` }))
      .filter((item): item is { heading: string; id: string } => Boolean(item.heading));
    const relatedTools = getRelatedToolsForPost(blogPost);
    const relatedPosts = getRelatedBlogPosts(blogPost, BLOG_POSTS, 3);
    const updatedDisplay = blogPost.updatedDate || blogPost.publishDate;

    bodyContent = `
      <article class="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <a href="/" class="hover:underline">Home</a>
          <span>&gt;</span>
          <a href="/blog" class="hover:underline">Blog</a>
          <span>&gt;</span>
          <a href="/blog?category=${encodeURIComponent(blogPost.category)}" class="hover:underline">${escapeHtml(blogPost.category)}</a>
          <span>&gt;</span>
          <span class="text-slate-800 font-bold">${escapeHtml(blogPost.title)}</span>
        </nav>
        <header class="space-y-4">
          <div class="text-xs font-bold uppercase tracking-widest text-red-600">
            ${escapeHtml(blogPost.category)}
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">${escapeHtml(blogPost.title)}</h1>
          <p class="text-base font-medium text-slate-600 leading-relaxed">${escapeHtml(blogPost.excerpt)}</p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span>By ${escapeHtml(blogPost.author.name)}</span>
            <span>·</span>
            <span>Published <time datetime="${toIsoDateString(blogPost)}">${escapeHtml(blogPost.publishDate)}</time></span>
            <span>·</span>
            <span>Updated <time datetime="${toUpdatedIsoDateString(blogPost)}">${escapeHtml(updatedDisplay)}</time></span>
            <span>·</span>
            <span>${escapeHtml(blogPost.readTime)}</span>
          </div>
          <img src="${escapeHtml(blogPost.coverImage)}" alt="${escapeHtml(blogPost.imageAlt || blogPost.title)}" class="w-full aspect-video rounded-2xl object-cover shadow-sm mt-4" />
        </header>
        ${tocItems.length > 1 ? `
          <nav aria-label="Table of contents" class="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-900">Table of Contents</h2>
            <ol class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
              ${tocItems.map((item, idx) => `<li><a href="#${item.id}" class="hover:text-red-600 hover:underline">${idx + 1}. ${escapeHtml(item.heading)}</a></li>`).join('')}
            </ol>
          </nav>
        ` : ''}
        <div class="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
          ${blogPost.content.map((c, idx) => `
            <section class="space-y-3">
              ${c.heading ? `<h2 id="section-${idx}" class="text-xl font-bold text-slate-900 pt-2">${escapeHtml(c.heading)}</h2>` : ''}
              ${c.subheading ? `<h3 class="text-base font-bold text-slate-800">${escapeHtml(c.subheading)}</h3>` : ''}
              ${c.body.map(p => `<p class="leading-relaxed">${renderInlineLinksHtml(p)}</p>`).join('')}
              ${c.example ? `<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">${renderInlineLinksHtml(c.example)}</div>` : ''}
              ${c.subsections ? c.subsections.map(sub => `
                <div class="space-y-2">
                  <h3 class="text-base font-bold text-slate-900">${escapeHtml(sub.subheading)}</h3>
                  ${sub.body.map(p => `<p class="leading-relaxed">${renderInlineLinksHtml(p)}</p>`).join('')}
                  ${sub.example ? `<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">${renderInlineLinksHtml(sub.example)}</div>` : ''}
                </div>
              `).join('') : ''}
              ${c.tips && c.tips.length ? `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Takeaways:</h3>
                  <ul class="list-disc list-inside text-xs text-slate-600 space-y-1">
                    ${c.tips.map(t => `<li>${renderInlineLinksHtml(t)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </section>
          `).join('')}
        </div>
        ${blogPost.faqs && blogPost.faqs.length ? `
          <section class="pt-6 border-t border-slate-200 space-y-3">
            <h2 class="text-lg font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <dl class="space-y-3 text-sm">
              ${blogPost.faqs.map(faq => `
                <div class="p-4 rounded-xl bg-white border border-slate-200">
                  <dt class="font-bold text-slate-900">${escapeHtml(faq.question)}</dt>
                  <dd class="text-slate-600 mt-1 text-xs">${escapeHtml(faq.answer)}</dd>
                </div>
              `).join('')}
            </dl>
          </section>
        ` : ''}
        <section class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h2 class="text-base font-extrabold text-slate-900">Related tools</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            ${relatedTools.slice(0, 3).map(tool => `
              <a href="${escapeHtml(tool.path)}" class="p-3 rounded-xl bg-white border border-slate-200 hover:border-red-300 block">
                <span class="font-bold text-slate-900">${escapeHtml(tool.label)}</span>
                <p class="text-slate-600 mt-0.5">${escapeHtml(tool.description)}</p>
              </a>
            `).join('')}
          </div>
        </section>
        <section class="pt-6 border-t border-slate-200 space-y-3">
          <h2 class="text-base font-extrabold text-slate-900">Related articles</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            ${relatedPosts.map(rel => `
              <a href="/blog/${escapeHtml(rel.slug)}" class="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 block space-y-1">
                <span class="text-[10px] font-bold text-red-600 uppercase">${escapeHtml(rel.category)}</span>
                <h3 class="font-bold text-slate-900">${escapeHtml(rel.title)}</h3>
              </a>
            `).join('')}
          </div>
        </section>
        <footer class="pt-6 border-t border-slate-200 flex justify-between items-center text-xs">
          <a href="/blog" class="font-bold text-red-600 hover:underline">← Back to All ${BLOG_POSTS.length} Guides</a>
          <a href="/tools" class="font-bold text-slate-800 hover:underline">Try All 25+ Free Tools →</a>
        </footer>
      </article>
    `;
  } else if (pathname === '/blog') {
    bodyContent = `
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header class="text-center max-w-2xl mx-auto space-y-2.5">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${escapeHtml(meta.h1)}</h1>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">${escapeHtml(meta.description)}</p>
        </header>
        <section class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Explore Tools Covered in These Guides</h2>
          <div class="flex flex-wrap gap-2 text-xs">
            ${POPULAR_TOOL_HUB_LINKS.map(tool => `<a href="${escapeHtml(tool.path)}" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:text-red-600">${escapeHtml(tool.label)}</a>`).join('')}
          </div>
        </section>
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${BLOG_POSTS.map(post => `
            <a href="/blog/${escapeHtml(post.slug)}" class="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 block">
              <span class="text-[11px] font-bold text-red-600">${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</span>
              <h2 class="text-base font-bold text-slate-900">${escapeHtml(post.title)}</h2>
              <p class="text-xs text-slate-600">${escapeHtml(post.excerpt)}</p>
            </a>
          `).join('')}
        </section>
      </main>
    `;
  } else if (pathname === '/youtube-player') {
    bodyContent = `
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header class="text-center max-w-2xl mx-auto space-y-2.5">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${escapeHtml(YOUTUBE_PLAYER_SEO.h1)}</h1>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">${escapeHtml(YOUTUBE_PLAYER_SEO.subheading)}</p>
        </header>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">What is the YouTube Player tool?</h2>
          <p class="text-sm text-slate-700 leading-relaxed">The YouTube Player is a browser-based YouTube link player that opens public YouTube videos inside YouTube's official privacy-enhanced youtube-nocookie.com iframe with full native controls and full-screen support.</p>
          <p class="text-xs text-slate-500">Plays through YouTube's privacy-enhanced embed. Ads can still appear on some monetized videos.</p>
        </section>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">How to use it</h2>
          <ol class="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
            <li>Paste any YouTube link (watch, youtu.be, Shorts, live stream, embed, or timestamped URL).</li>
            <li>Click Watch now or press Enter.</li>
            <li>Enjoy distraction-free playback or expand into full screen.</li>
          </ol>
        </section>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">Frequently asked questions</h2>
          <dl class="space-y-3 text-sm">
            ${YOUTUBE_PLAYER_FAQ.map(
              (item) => `
              <div>
                <dt class="font-bold text-slate-900">${escapeHtml(item.question)}</dt>
                <dd class="text-slate-600 mt-1">${escapeHtml(item.answer)}</dd>
              </div>`
            ).join('')}
          </dl>
        </section>
        ${renderRelatedBlogsSsrSection('/youtube-player')}
      </main>
    `;
  } else if (pathname in IMAGE_CONVERTER_ROUTES) {
    const imgRoute = IMAGE_CONVERTER_ROUTES[pathname as ImageConverterRoutePath];
    bodyContent = `
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header class="text-center max-w-2xl mx-auto space-y-2.5">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${escapeHtml(imgRoute.h1)}</h1>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">${escapeHtml(imgRoute.subheading)}</p>
          <p class="text-xs text-slate-500">Your images are converted in your browser. Nothing is uploaded to a server.</p>
        </header>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">${escapeHtml(imgRoute.introHeading)}</h2>
          ${imgRoute.introParagraphs.map((p) => `<p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(p)}</p>`).join('')}
        </section>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">Which format should I choose?</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="border-b border-slate-200"><th class="py-2 pr-4">Format</th><th class="py-2 pr-4">Best use</th><th class="py-2 pr-4">Transparency</th><th class="py-2">Compression</th></tr></thead>
              <tbody>
                ${FORMAT_COMPARISON_ROWS.map((row) => `<tr class="border-b border-slate-100"><td class="py-2 pr-4 font-bold">${escapeHtml(row.format)}</td><td class="py-2 pr-4">${escapeHtml(row.bestUse)}</td><td class="py-2 pr-4">${escapeHtml(row.transparency)}</td><td class="py-2">${escapeHtml(row.compression)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">Popular conversions</h2>
          <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
            ${POPULAR_CONVERSIONS.map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.explanation)}</li>`).join('')}
          </ul>
        </section>
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 class="text-xl font-extrabold text-slate-900">Frequently asked questions</h2>
          <dl class="space-y-3 text-sm">
            ${IMAGE_CONVERTER_FAQ.map(
              (item) => `
              <div>
                <dt class="font-bold text-slate-900">${escapeHtml(item.question)}</dt>
                <dd class="text-slate-600 mt-1">${escapeHtml(item.answer)}</dd>
              </div>`
            ).join('')}
          </dl>
        </section>
        ${renderRelatedBlogsSsrSection(pathname)}
      </main>
    `;
  } else {
    // Standard tool or legal page
    bodyContent = `
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header class="text-center max-w-3xl mx-auto space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            YouTikTools Universal Platform
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">${meta.h1}</h1>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">${meta.description}</p>
        </header>

        <section class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">Online Service Overview & Features</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">100% Free & Unlimited</h3>
              <p>No subscriptions, no registration, and no artificial daily download limits.</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">Zero Watermark & Native HD</h3>
              <p>Direct original stream quality for iPhone, Android, Windows, and Mac.</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 class="font-bold text-slate-900">Privacy & Security</h3>
              <p>Encrypted transfer, zero tracking cookies, and in-browser processing.</p>
            </div>
          </div>
        </section>

        <section class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <h2 class="text-lg font-bold text-slate-900">How to Use This Tool</h2>
          <ol class="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <li>Copy the link from YouTube, TikTok, Facebook, or Instagram (or upload your file).</li>
            <li>Paste the URL in the downloader box above.</li>
            <li>Select your target format (Full HD MP4, 320kbps MP3 audio, or image).</li>
            <li>Click Download to save the original file directly to your device without redirects.</li>
          </ol>
        </section>
        ${meta.category === 'download' || meta.category === 'editing' || meta.category === 'calculator' ? renderRelatedBlogsSsrSection(pathname) : ''}
      </main>
    `;
  }

  // Crawlable Navigation Bar
  const navHtml = `
    <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" class="flex items-center gap-2.5 font-extrabold text-lg text-slate-900">
          <span class="text-red-600">YouTik</span><span>Tools</span>
        </a>
        <nav class="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-700">
          <a href="/youtube-video-downloader" class="hover:text-red-600 transition-colors">YouTube HD</a>
          <a href="/tiktok-video-downloader" class="hover:text-cyan-700 transition-colors">TikTok No WM</a>
          <a href="/facebook-video-downloader" class="hover:text-blue-600 transition-colors">Facebook 1080p</a>
          <a href="/instagram-video-downloader" class="hover:text-pink-600 transition-colors">Instagram Reels</a>
          <a href="/youtube-to-mp3" class="hover:text-red-600 transition-colors">MP3 320kbps</a>
          <a href="/tools" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">All 20+ Tools</a>
        </nav>
      </div>
    </header>
  `;

  // Crawlable Footer
  const footerHtml = `
    <footer class="mt-20 border-t border-slate-200 bg-white text-xs text-slate-600">
      <div class="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Downloaders</h3>
          <ul class="space-y-1.5">
            <li><a href="/youtube-video-downloader" class="hover:text-red-600 hover:underline">YouTube 1080p & 4K</a></li>
            <li><a href="/tiktok-video-downloader" class="hover:text-cyan-700 hover:underline">TikTok No Watermark</a></li>
            <li><a href="/facebook-video-downloader" class="hover:text-blue-600 hover:underline">Facebook Video & Reels</a></li>
            <li><a href="/instagram-video-downloader" class="hover:text-pink-600 hover:underline">Instagram Reels & Posts</a></li>
            <li><a href="/youtube-to-mp3" class="hover:text-red-600 hover:underline">YouTube to MP3 (320kbps)</a></li>
            <li><a href="/youtube-player" class="hover:text-red-600 hover:underline">YouTube Player (Clean View)</a></li>
            <li><a href="/video-captions-downloader" class="hover:text-red-600 hover:underline">Subtitles & Captions (SRT)</a></li>
            <li><a href="/batch-downloader" class="hover:text-slate-900 hover:underline">Batch Multi-Link Queue</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Video Utilities</h3>
          <ul class="space-y-1.5">
            <li><a href="/tools" class="font-semibold text-slate-900 hover:text-red-600 hover:underline">All Tools Directory →</a></li>
            <li><a href="/video-converter" class="hover:text-red-600 hover:underline">Video Converter (MP4/WebM)</a></li>
            <li><a href="/image-converter" class="hover:text-red-600 hover:underline">Image Format Converter</a></li>
            <li><a href="/video-compressor" class="hover:text-red-600 hover:underline">Video Compressor</a></li>
            <li><a href="/video-trimmer" class="hover:text-red-600 hover:underline">Video Trimmer & Cutter</a></li>
            <li><a href="/video-merger" class="hover:text-red-600 hover:underline">Video Merger & Combiner</a></li>
            <li><a href="/video-to-gif" class="hover:text-red-600 hover:underline">Video to GIF Maker</a></li>
            <li><a href="/video-thumbnail" class="hover:text-red-600 hover:underline">Thumbnail Extractor</a></li>
            <li><a href="/video-metadata" class="hover:text-red-600 hover:underline">Video Metadata Inspector</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Calculators & Hub</h3>
          <ul class="space-y-1.5">
            <li><a href="/video-size-calculator" class="hover:text-red-600 hover:underline">Video Size Calculator</a></li>
            <li><a href="/video-resolution-checker" class="hover:text-red-600 hover:underline">Resolution Checker</a></li>
            <li><a href="/aspect-ratio-calculator" class="hover:text-red-600 hover:underline">Aspect Ratio Calculator</a></li>
            <li><a href="/bitrate-calculator" class="hover:text-red-600 hover:underline">Bitrate Calculator</a></li>
            <li><a href="/fps-calculator" class="hover:text-red-600 hover:underline">FPS Calculator</a></li>
            <li><a href="/age-calculator" class="hover:text-red-600 hover:underline">Age Calculator (Hijri & Desi)</a></li>
            <li><a href="/prayer-times" class="hover:text-emerald-700 hover:underline">Prayer Times &amp; Qibla</a></li>
            <li><a href="/land-area-converter" class="hover:text-emerald-700 hover:underline">Land Area Converter</a></li>
            <li><a href="/gold-calculator" class="hover:text-amber-600 hover:underline">Gold Rate Calculator</a></li>
            <li><a href="/gpa-calculator" class="hover:text-red-600 hover:underline">GPA &amp; CGPA Calculator</a></li>
            <li><a href="/qr-code-generator" class="hover:text-red-600 hover:underline">QR Code Generator</a></li>
            <li><a href="/youtube-thumbnail-downloader" class="hover:text-red-600 hover:underline">YouTube Thumbnail Downloader</a></li>
            <li><a href="/youtube-tag-generator" class="hover:text-red-600 hover:underline">YouTube Tag Generator</a></li>
            <li><a href="/zakat-calculator" class="hover:text-emerald-700 hover:underline">Zakat Calculator</a></li>
            <li><a href="/hijri-date-converter" class="hover:text-emerald-700 hover:underline">Hijri Date Converter</a></li>
            <li><a href="/ramadan-timetable" class="hover:text-emerald-700 hover:underline">Ramadan Timetable</a></li>
            <li><a href="/islamic-baby-names" class="hover:text-emerald-700 hover:underline">Islamic Baby Names</a></li>
            <li><a href="/wirasat-calculator" class="hover:text-emerald-700 hover:underline">Wirasat Calculator</a></li>
            <li><a href="/blog" class="font-semibold text-slate-900 hover:text-red-600 hover:underline">Knowledge Hub &amp; Blog →</a></li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Trust & Legal</h3>
          <ul class="space-y-1.5">
            <li><a href="/about" class="hover:text-slate-900 hover:underline">About YouTikTools</a></li>
            <li><a href="/contact" class="hover:text-slate-900 hover:underline">Contact & Support</a></li>
            <li><a href="/privacy-policy" class="hover:text-slate-900 hover:underline">Privacy Policy</a></li>
            <li><a href="/terms-of-service" class="hover:text-slate-900 hover:underline">Terms of Service</a></li>
            <li><a href="/copyright-policy" class="hover:text-slate-900 hover:underline">Copyright & DMCA</a></li>
            <li><a href="/disclaimer" class="hover:text-slate-900 hover:underline">Legal Disclaimer</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-100 py-6 text-center text-[11px] text-slate-500 max-w-6xl mx-auto px-4">
        © 2026 YouTikTools. All rights reserved. Free, fast, private online video downloading and editing suite.
      </div>
    </footer>
  `;

  const fullHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="google-adsense-account" content="ca-pub-1691427205816245" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1691427205816245" crossorigin="anonymous"></script>

    <!-- Open Graph Social Metadata -->
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${meta.ogType || 'website'}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:site_name" content="YouTikTools" />

    <!-- Twitter Social Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <!-- Favicon & PWA Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#09090b" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Schema.org JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schemas, null, 2)}
    </script>
    <script>
      (function() {
        if (typeof window !== 'undefined' && window.WebSocket) {
          const NativeWebSocket = window.WebSocket;
          window.WebSocket = function(url, protocols) {
            const urlStr = String(url || '');
            const protoStr = String(protocols || '');
            if (urlStr.includes('vite-hmr') || protoStr.includes('vite-hmr')) {
              const listeners = {};
              const fakeWs = {
                readyState: 1,
                CONNECTING: 0,
                OPEN: 1,
                CLOSING: 2,
                CLOSED: 3,
                url: urlStr,
                protocol: 'vite-hmr',
                send: function() {},
                close: function() {},
                addEventListener: function(type, listener) {
                  if (!listeners[type]) listeners[type] = [];
                  listeners[type].push(listener);
                  if (type === 'open') {
                    setTimeout(() => { try { listener({ type: 'open', target: fakeWs }); } catch(e){} }, 0);
                  }
                },
                removeEventListener: function(type, listener) {
                  if (listeners[type]) listeners[type] = listeners[type].filter(l => l !== listener);
                },
                dispatchEvent: function(event) {
                  const type = event && event.type;
                  if (listeners[type]) listeners[type].forEach(l => { try { l(event); } catch(e){} });
                  return true;
                }
              };
              return fakeWs;
            }
            return new NativeWebSocket(url, protocols);
          };
          window.WebSocket.prototype = NativeWebSocket.prototype;
          window.WebSocket.CONNECTING = 0;
          window.WebSocket.OPEN = 1;
          window.WebSocket.CLOSING = 2;
          window.WebSocket.CLOSED = 3;
        }
        window.addEventListener('unhandledrejection', function(event) {
          if (event && event.reason && String(event.reason).includes('WebSocket closed without opened')) {
            event.preventDefault();
          }
        });
      })();
    </script>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased font-sans">
    <div id="root">
      ${navHtml}
      ${bodyContent}
      ${footerHtml}
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  return {
    html: fullHtml,
    statusCode: isFound ? 200 : 404,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function generateSitemapXml(baseUrl: string): string {
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  const cleanBase = isLocal ? baseUrl.replace(/\/+$/, '') : 'https://youtiktools.com';
  const urls: string[] = [];

  for (const [path, info] of Object.entries(SEO_ROUTES)) {
    const loc = `${cleanBase}${path === '/' ? '' : path}`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>2026-11-20</lastmod>
    <changefreq>${info.changefreq}</changefreq>
    <priority>${info.priority}</priority>
  </url>`);
  }

  for (const post of BLOG_POSTS) {
    const loc = `${cleanBase}/blog/${post.slug}`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${toUpdatedIsoDateString(post)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  const cleanBase = isLocal ? baseUrl.replace(/\/+$/, '') : 'https://youtiktools.com';
  return `User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: Google-Display-Ads-Bot
Allow: /

Sitemap: ${cleanBase}/sitemap.xml
`;
}
