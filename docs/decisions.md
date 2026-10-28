# Decisions

## 2026-10-16 — Security cleanup

A read-only review of the public GitHub Pages site was followed by a cleanup in October 2026:

- Every page that loads Font Awesome, including `marketing/index.html` and `marketing/Staged4Sale-hanger.html`, uses stable 6.7.2 from cdnjs, with Subresource Integrity and `crossorigin="anonymous"`.
- The placeholder Font Awesome kit script was removed.
- `target="_blank"` links that were missing `rel="noopener noreferrer"` were updated.
- `index2.html` (an unlinked duplicate homepage) was removed.
- `projects/_template/` stays in the repo as a starter, with `noindex` and out of the sitemap.
- Internal editor and agent files (`.claude/`, `.vscode/`, `CLAUDE.md`, `blog/CLAUDE.md`) were removed from the tree and ignored going forward. Git history was not rewritten.
- `/.well-known/security.txt` `Expires` was set to 2027-12-31.

## API keys stay off this repo

This repository is public. Never commit API keys, service-account files, or other secrets.

Future features that need a third-party key — including a client portal and virtual staging that calls Gemini — must keep those keys server-side. A Firebase or Supabase function (or the same kind of backend) should hold the key and talk to the provider. The static pages on GitHub Pages only call that backend.

## Client portal lives in its own folder

When a client portal is added, it will live in its own folder in this repo. Branding (colors, logos, copy) stays out of the portal's core logic so the folder can be split into its own project later without rewriting the application code.

## HTTPS

Enforce HTTPS is turned on in the GitHub Pages settings for this site.

## 2026-10-17 — Client portal sample

`portal/` is a clickable front-end sample. It shows fake demo data only: any sign-in opens the dashboard, and nothing is authenticated. There is no backend and no API key. Each portal page sends `noindex, nofollow`. `robots.txt` disallows `/portal/`. The folder is not in `sitemap.xml`, and the public navigation does not link to it.

Branding — name, colors, logo, and contact details — lives in `portal/brand.js`. Shared screens and behavior live in `portal/portal.js` and `portal/portal.css`, so the portal can be split into its own product later without rewriting those screens.

Real sign-in is still to be built. The plan is Firebase or Supabase, with keys kept server-side (see "API keys stay off this repo" above). The static pages would call that backend only.

## 2026-10-17 — Sample admin site

`admin/` is a sample admin site with made-up clients, addresses, and amounts. Sign-in is not real: any email and password, or View demo, opens the dashboard. Each admin page sends `noindex, nofollow`. `robots.txt` disallows `/admin/`. Public pages do not link to it, and it is not in `sitemap.xml`. The sample does not include virtual staging.

Branding lives in `admin/brand.js`. Screens and behavior live in `admin/admin.js` and `admin/admin.css`.

Real authentication and real client data need a server-side backend (for example Firebase or Supabase) before this goes live. Keys stay server-side. See "API keys stay off this repo" above.

## 2026-10-25 — Hero trust indicators

The homepage hero trust indicators were added in October 2026. The unverified client and savings counters ("500+ Satisfied Clients" and "$1,000,000+ Saved") were removed. The wording — "20+ Years", "ASPM Certified", and "Award-Winning Stager" — was approved by Joey.

City landing pages under `cities/*/index.html` do not have a hero trust area, so they were left unchanged.

## 2026-10-25 — Years in business

October 2026: years-in-business messaging added to the header, About, Contact, and footer. The wording was approved by Joey.

The homepage header shows "Staging since 2006" in small gold Lato type directly above the phone number. The line is taken out of the document flow so the header stays the same height. It is hidden below 1000px: the nav wraps and the phone number stacks, and the line would crowd the bar. At 768px and narrower the phone number is already hidden as well. Other public pages duplicate the logo and nav, but they do not include the phone number in the header, so the line was not added there.

The About opening now starts "For over 20 years, Staged 4 Sale has done more than stage homes." The Contact intro adds "For over 20 years, we've helped homeowners and their agents get top dollar." The footer line now reads "Accredited, Licensed & Insured | Serving Southern California for Over 20 Years" on every public page that already carried it, including the project starter in `projects/_template/`. `admin/`, `portal/`, and `marketing/` were left unchanged.

The homepage LocalBusiness structured data (`HomeAndConstructionBusiness`) includes `"foundingDate": "2006"`.

## 2026-10-25 — Agent VIP portal sample

`portal/` is now a clickable sample of a real estate agent VIP portal, still front-end only. Any sign-in opens My Listings. Nothing is authenticated. There is no backend and no API key. Addresses, invoices, the agent profile, and every market figure are fake and labeled as sample data. Each portal page sends `noindex, nofollow`. `robots.txt` disallows `/portal/`. The folder is not in `sitemap.xml`, and the public navigation does not link to it.

Desktop navigation is a left sidebar. Narrow screens use a bottom tab bar: My Listings, Book Staging, Seller Packets, Market Info, and More for the rest. Virtual Staging stays below the main menu items. Opening a listing reuses the existing project screen (status, dates, invoice, gallery, documents).

Branding — name, colors, logo, contact details, the VIP label, and the "Staged by" line — lives in `portal/brand.js`. Screens and behavior live in `portal/portal.js` and `portal/portal.css`. Demo content lives in `portal/sample-data.js`.

The virtual staging page does not call an image API. It shows a labeled sample pair and states that California AB 723 requires disclosing digitally altered listing photos and providing the original.

Real sign-in is still to be built. See "API keys stay off this repo" above.

## 2026-10-25 — Admin studio shell

`admin/` is still a front-end sample for the owner's view. Sign-in is not real. There is no backend and no API key. The home screen is "This week": new leads from the last seven days, upcoming installs and destages, and invoices marked unpaid in the sample. Added sample sections are furniture inventory, VIP members (gone quiet after 60 days with no activity), a quote pipeline (needs a nudge after about seven days with no answer), and a marketing queue of before/after pairs marked Ready, Drafted, or Posted. The marketing page does not post anywhere.

Desktop navigation is a left sidebar with Pipeline, Office, and Studio groups. Narrow screens use a bottom tab bar: This week, Projects, Calendar, Clients, and More. Virtual Stager stays in the Studio group. It does not call an image API. Virtual staging shows a labeled sample pair and the California AB 723 note. Markup mode shows a stored sample board, not a board drawn from the uploaded photo. Rescue leads and open houses read `admin/weekly-leads.js`, so a weekly refresh can replace that file without changing the screens. Addresses, agents, and phones in that file are fictional. Redfin and map controls are placeholders.

Branding stays in `admin/brand.js`. Screens and behavior stay in `admin/admin.js` and `admin/admin.css`. Demo jobs, inventory, members, quotes, and marketing stay in `admin/sample-data.js`. The 2026-10-17 admin entry still describes the earlier sample; this entry supersedes the note that the sample does not include virtual staging.

Each admin page sends `noindex, nofollow`. `robots.txt` disallows `/admin/`. The folder is not in `sitemap.xml`, and the public navigation does not link to it. Real authentication still needs a server-side backend. See "API keys stay off this repo" above.

## 2026-10-25 — Fall staging article

Added `/blog/fall-home-staging-tips-buyer-psychology/`, a researched seasonal article with Southern California staging tips, buyer-visualization context, a showing checklist, and linked sources. The hero reuses the existing Monte Fuego Ranch photo; it does not depict a newly commissioned fall installation. The byline is Staged4Sale.

Article-specific styling lives beside the page in `fall-staging.css`; shared `style.css` and `script.js` were not changed. The static blog listing in `blog/index.html`, metadata in `blog/posts.md`, and `sitemap.xml` all include this article. The listing is hand-authored HTML, not generated from `posts.md` at runtime.

For future website updates, start from the current GitHub branch head and preserve the article, its stylesheet, metadata entry, blog card, and sitemap URL unless intentionally changing them. When rebuilding the blog listing, include every published entry in `blog/posts.md`. This note documents the convention; it cannot prevent an external bot from overwriting files.

The article distinguishes agent survey observations from experimental findings and does not promise that seasonal decor raises offers or shortens selling time.

## 2026-10-28 — Monte Fuego kitchen photos

On Oct 28, 2026 the Monte Fuego kitchen before/after photos were removed from the site at Joey's request because the after photo's colors were off.
