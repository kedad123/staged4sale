# Blog Posts Database

This file manages all blog post metadata for the Staged4Sale blog. Each post entry should include all required fields for proper SEO and content management.

## Posts

- title: "Why Smart Sellers Stage: 5 Data-Backed Reasons"
  subtitle: "Is staging really worth it? The latest numbers say yes."
  slug: "why-smart-sellers-stage-5-data-backed-reasons"
  date: "2025-07-06"
  author: "Tawni Oppenheim"
  category: "Home Staging Tips"
  image: "/images/blog/smart-sellers-stage.jpg"
  alt_text: "Beautifully staged living room with modern decor and natural light"
  tags: ["Home Staging", "ROI", "Sellers", "Real Estate Tips", "Data"]
  summary: "Is staging really worth it? The latest numbers say yes. Five compelling, data-backed reasons why smart sellers choose professional staging — with real testimonials and 2025 market insights."
  meta_description: "Discover 5 data-backed reasons why smart sellers stage their homes. Real ROI numbers, faster sales, and expert insights from 2025 market data."
  read_time: 6
  featured: false
  published: true
  related_posts: ["monte-fuego-ranch-transformation"]

- title: "Before & After: How Strategic Staging Transformed This Rancho Santa Fe Ranch"
  subtitle: "See how transitional design choices turned architectural challenges into selling points."
  slug: "monte-fuego-ranch-transformation"
  date: "2025-07-06"
  author: "Tawni Oppenheim"
  category: "Case Studies"
  image: "/images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg"
  alt_text: "Monte Fuego Ranch living room transformation showing before and after staging"
  tags: ["Before After", "Case Study", "Ranch Staging", "Transitional Design", "Architectural Staging"]
  summary: "See how strategic staging transformed a stark Rancho Santa Fe ranch into a warm, inviting home. Complete before/after photos and expert insights into every staging decision."
  meta_description: "See how strategic staging transformed a stark Rancho Santa Fe ranch into a warm, inviting home. Before/after photos and expert insights."
  read_time: 8
  featured: true
  published: true
  related_posts: ["why-smart-sellers-stage-5-data-backed-reasons"]

## Field Definitions

### Required Fields
- **title**: Main headline for the blog post
- **subtitle**: Secondary description or hook
- **slug**: URL-safe identifier (used for directory name)
- **date**: Publication date in YYYY-MM-DD format
- **author**: Content author name
- **category**: Primary category for organization
- **image**: Path to featured image (relative to site root)
- **alt_text**: Accessibility description for featured image
- **tags**: Array of relevant keywords/topics
- **summary**: Brief description for excerpts and SEO
- **meta_description**: Specific SEO meta description
- **read_time**: Estimated reading time in minutes
- **featured**: Boolean - show in featured sections
- **published**: Boolean - live/draft status
- **related_posts**: Array of related post slugs

### Content Guidelines
- Keep titles under 60 characters for SEO
- Meta descriptions should be 150-160 characters
- Use descriptive alt text for accessibility
- Tags should be 2-4 words maximum
- Categories help organize content (Home Staging Tips, Market Insights, Case Studies, etc.)
- Featured posts appear prominently on blog index
- Unpublished posts are hidden from public view

## Adding New Posts

1. Add new post entry to the Posts section above
2. Create corresponding directory: `/blog/[slug]/`
3. Create static HTML file: `/blog/[slug]/index.html`
4. Add featured image to `/images/blog/`
5. Update sitemap.xml if needed
6. Test all links and metadata before publishing