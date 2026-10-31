# Blog Posts Database

This file manages all blog post metadata for the Staged4Sale blog. Each post entry should include all required fields for proper SEO and content management.

## Posts

<!--
  /blog/20-years/ is a draft. published is false on purpose.
  Do not add it to blog/index.html, sitemap.xml, the nav, the homepage, or a feed.
  At launch, after Tawni approves the quotes, set published to true and follow docs/decisions.md.
-->
- title: "Staged4Sale Celebrates 20 Years: How a North County Stager Weathered the Housing Crash, a Pandemic and the Rise of AI"
  subtitle: "Oceanside staging pioneer combines traditional staging with new technology instead of fighting it"
  slug: "20-years"
  date: "2026-11-01"
  author: "Staged4Sale"
  category: "Press Release"
  image: ""
  alt_text: ""
  tags: ["Anniversary", "Press Release", "Oceanside", "Home Staging"]
  summary: "Staged4Sale marks 20 years in Oceanside, from the housing crash and the pandemic to pairing traditional staging with new technology."
  meta_description: "Oceanside staging pioneer combines traditional staging with new technology instead of fighting it."
  read_time: 4
  featured: false
  published: false
  related_posts: []

- title: "Fall Home Staging Tips & Buyer Psychology"
  subtitle: "Help buyers feel at home this fall, one thoughtful detail at a time."
  slug: "fall-home-staging-tips-buyer-psychology"
  date: "2026-10-25"
  author: "Staged4Sale"
  category: "Home Staging Tips"
  image: "/images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg"
  alt_text: "Staged4Sale living room at Monte Fuego Ranch with soft textures and warm evening light"
  tags: ["Fall Staging", "Buyer Psychology", "Home Staging", "Southern California"]
  summary: "Six practical fall staging tips, a showing checklist, and research on buyer visualization, with a Southern California perspective."
  meta_description: "Make your home feel inviting this fall with practical staging tips, thoughtful seasonal touches, and research on how buyers imagine living in their own home."
  read_time: 7
  featured: true
  published: true
  related_posts: ["monte-fuego-ranch-transformation"]

- title: "New NAR Report Confirms: Home Staging Works — and Here's the Proof"
  subtitle: "Fresh data shows staging delivers higher offers, faster sales, and happier buyers"
  slug: "nar-report-confirms-home-staging-works"
  date: "2025-08-12"
  author: "Tawni Oppenheim"
  category: "Market Insights"
  image: "/images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg"
  alt_text: "Before and after home staging comparison showing dramatic transformation"
  tags: ["NAR Report", "Home Staging", "Market Data", "ROI", "North County San Diego"]
  summary: "NAR's 2025 Profile of Home Staging delivers compelling data showing staging increases offers by 29% and reduces time on market. Here's what it means for North County San Diego sellers."
  meta_description: "New NAR 2025 report confirms home staging works: 29% higher offers, faster sales, and 83% better buyer visualization. Real data for Oceanside & North County sellers."
  read_time: 5
  featured: true
  published: true
  related_posts: ["why-smart-sellers-stage-5-data-backed-reasons", "monte-fuego-ranch-transformation"]

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
- The blog index is hand-authored HTML. It is not generated from this file at runtime. When rebuilding `blog/index.html`, include only entries with `published: true`

## Adding New Posts

1. Add new post entry to the Posts section above
2. Create corresponding directory: `/blog/[slug]/`
3. Create static HTML file: `/blog/[slug]/index.html`
4. Add featured image to `/images/blog/`
5. Update sitemap.xml if needed
6. Test all links and metadata before publishing

Leave `published: false` entries off `blog/index.html`, `sitemap.xml`, the nav, the homepage, and any feed. `/blog/20-years/` is one of those drafts until launch. See `docs/decisions.md`.