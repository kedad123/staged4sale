# Security follow-ups

These items are not handled by the October 2026 cleanup. They need a person with access to the matching dashboard or host.

## Formspree

The contact form posts to Formspree from `index.html` (`https://formspree.io/f/mnnvrdew`). In the Formspree dashboard:

- Turn on a captcha so the form is not an open spam target.
- Restrict submissions to the production domain (`staged4sale.com`).
- Turn on rate limits.

The form endpoint will stay visible in the page source. Those three settings are what stop abuse.

## `.htaccess` does nothing on GitHub Pages

`.htaccess` is Apache configuration. GitHub Pages does not run Apache, so nothing in that file is applied: compression, cache headers, security headers, the commented HTTPS redirect, `ErrorDocument`, dotfile blocking, or the rewrite that forbids `projects/_template/`.

GitHub Pages still serves `/404.html` on its own when a path is missing, and `robots.txt` is a normal static file, so those two behaviors do not depend on `.htaccess`. Anything that file was meant to enforce has to be done another way (Pages settings, `robots.txt`, meta tags, or a host that actually reads `.htaccess`).
