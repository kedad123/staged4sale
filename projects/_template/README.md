# Project Template System

This template system provides a standardized approach for creating static HTML project pages from markdown files for the Staged4Sale portfolio.

## Overview

The template system converts project markdown files into SEO-optimized static HTML pages with consistent styling and functionality. It supports two main project types:

1. **Simple Gallery Projects** - Standard image galleries with captions
2. **Before/After Projects** - Interactive slider comparisons with before/after images

## File Structure

```
/projects/_template/
├── README.md                    # This documentation file
├── index.html                   # HTML template with placeholders
├── example-simple-gallery.md    # Example simple project
├── example-before-after.md      # Example before/after project
├── build-process.md             # Step-by-step build guide
└── markdown-format.md           # Markdown specification
```

## Quick Start

1. **Create Project Markdown** - Write your project details in markdown format (see examples)
2. **Copy HTML Template** - Copy `index.html` to your project directory
3. **Replace Placeholders** - Substitute `{{VARIABLE}}` placeholders with project data
4. **Build Gallery** - Add image HTML for simple gallery or before/after sliders
5. **Test & Deploy** - Verify all links and functionality work correctly

## Variable Mapping

| Markdown Field | HTML Placeholder | Example |
|---------------|------------------|---------|
| `# Title` | `{{PROJECT_NAME}}` | Monte Fuego Ranch |
| `location:` | `{{LOCATION}}` | Rancho Santa Fe, CA |
| `slug:` | `{{PROJECT_SLUG}}` | monte-fuego-ranch |
| `featured:` | `{{FEATURED_IMAGE}}` | project-01.jpg |
| `tags: [tag1, tag2]` | `{{TAG_1}}`, `{{TAG_2}}` | ranch, transitional |
| `## Notes` content | `{{PROJECT_NOTES}}` | Project description text |

## Project Types

### Simple Gallery Projects
- Use standard `<div class="gallery-item">` structure
- Each image gets its own gallery item with caption
- No special JavaScript required
- See `example-simple-gallery.md` for reference

### Before/After Projects  
- Use `<div class="gallery-item before-after-item">` structure
- Requires before/after slider CSS and JavaScript
- Paired images with `-before.webp` and `.jpg` suffixes
- Interactive slider functionality for comparisons
- See `example-before-after.md` and monte-fuego-ranch implementation

## Key Features

- **SEO Optimized** - Complete meta tags, structured data, and semantic HTML
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Accessibility** - Proper alt text, keyboard navigation, and ARIA labels
- **Performance** - Lazy loading, optimized images, and minimal JavaScript
- **Consistency** - Standardized styling and structure across all projects

## Dependencies

- Main stylesheet: `../../style.css`
- JavaScript: `../../script.js`
- Fonts: Google Fonts (Playfair Display, Lato)
- Icons: Font Awesome 6.0

## Best Practices

1. **Images** - Use high-quality images with descriptive filenames
2. **Alt Text** - Write descriptive, meaningful alt text for accessibility
3. **Loading** - Use `loading="lazy"` for performance optimization
4. **Consistency** - Follow naming conventions and file structure
5. **Testing** - Test on mobile and desktop before deploying

## Support

For detailed implementation guides:
- See `build-process.md` for step-by-step instructions
- See `markdown-format.md` for complete markdown specification
- Reference existing projects in `/projects/` for working examples

## Updates

When updating the template system:
1. Update this README with any changes
2. Update example files to reflect new features
3. Consider backward compatibility with existing projects
4. Test changes across all project types