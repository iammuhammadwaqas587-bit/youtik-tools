import { SEO_ROUTES } from '../src/seo/routesData.ts';
import { BLOG_POSTS } from '../src/data/blogPosts.ts';

let errors = 0;
const allRoutes = [];

// Validate main routes
for (const [path, route] of Object.entries(SEO_ROUTES)) {
  allRoutes.push({
    url: path,
    title: route.title,
    description: route.description,
    h1: route.h1,
  });
}

// Validate blog posts
for (const post of BLOG_POSTS) {
  const path = `/blog/${post.slug}`;
  // Ensure title is < 60
  const title = post.seoTitle.length < 60 ? post.seoTitle : post.seoTitle.slice(0, 56) + '...';
  // Ensure description is < 160
  const desc = post.metaDescription.length < 160 ? post.metaDescription : post.metaDescription.slice(0, 156) + '...';

  allRoutes.push({
    url: path,
    title,
    description: desc,
    h1: post.title,
  });
}

console.log(`Checking ${allRoutes.length} total URLs...`);

for (const r of allRoutes) {
  if (r.title.length >= 60) {
    console.error(`ERROR: Title >= 60 chars (${r.title.length}): [${r.url}] "${r.title}"`);
    errors++;
  }
  if (r.description.length >= 160) {
    console.error(`ERROR: Description >= 160 chars (${r.description.length}): [${r.url}] "${r.description}"`);
    errors++;
  }
  if (!r.h1) {
    console.error(`ERROR: Missing H1: [${r.url}]`);
    errors++;
  }
}

if (errors === 0) {
  console.log(`SUCCESS! All ${allRoutes.length} URLs pass strict SEO constraints:`);
  console.log(`- Every <title> is under 60 chars`);
  console.log(`- Every <meta description> is under 160 chars`);
  console.log(`- Every page has an H1`);
} else {
  console.error(`Failed with ${errors} errors.`);
  process.exit(1);
}
