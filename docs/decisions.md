# Decisions

## 2026-10-16 — Security cleanup

A read-only review of the public GitHub Pages site was followed by a cleanup in October 2026:

- Font Awesome on the public pages moved off the unsigned `6.0.0-beta3` CDN build to stable 6.7.2 on cdnjs, with Subresource Integrity and `crossorigin="anonymous"`. Files under `marketing/` were left unchanged, so those pages still reference the beta stylesheet.
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
