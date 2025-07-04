# Build Process Guide

This guide provides step-by-step instructions for creating a new project page from a markdown file.

## Prerequisites

- Project markdown file in `/images/projects/[project-slug]/[project-slug].md`
- Project images in `/images/projects/[project-slug]/` directory
- Basic understanding of HTML and the project structure

## Step 1: Analyze the Markdown File

1. **Open the markdown file** for your project
2. **Identify the project type**:
   - **Simple Gallery**: Images have single descriptions (e.g., `image.jpg | Description`)
   - **Before/After**: Images have before/after pairs (e.g., `image-before.webp | Before: ...` and `image.jpg | After: ...`)
3. **Extract key information**:
   - Project title (# heading)
   - Location, slug, featured image, tags (metadata)
   - Gallery images and descriptions
   - Notes section content

## Step 2: Create Project Directory

```bash
mkdir -p /workspace/projects/[project-slug]
```

## Step 3: Copy and Customize HTML Template

1. **Copy the template**:
   ```bash
   cp /workspace/projects/_template/index.html /workspace/projects/[project-slug]/index.html
   ```

2. **Replace basic placeholders**:
   - `{{PROJECT_NAME}}` → Project title from markdown
   - `{{LOCATION}}` → Location from markdown
   - `{{PROJECT_SLUG}}` → Slug from markdown
   - `{{FEATURED_IMAGE}}` → Featured image filename
   - `{{PROJECT_NOTES}}` → Content from Notes section

3. **Replace tag placeholders**:
   - `{{TAG_1}}`, `{{TAG_2}}`, `{{TAG_3}}` → Tags from markdown array
   - Add or remove tag spans as needed

4. **Update SEO content**:
   - Customize meta descriptions with project-specific keywords
   - Update `{{PROJECT_STYLE}}` and `{{PROJECT_DESCRIPTION_SHORT}}` placeholders

## Step 4: Build the Gallery Section

### For Simple Gallery Projects:

Replace the gallery-grid content with:

```html
<div class="gallery-item">
    <img src="../../images/projects/[project-slug]/[image-filename]" 
         alt="[descriptive-alt-text]" 
         width="800" 
         height="600"
         loading="lazy">
    <div class="gallery-caption">[image-caption]</div>
</div>
```

Repeat for each image in the markdown gallery section.

### For Before/After Projects:

1. **Add slider CSS**: Copy the complete before/after slider styles from `monte-fuego-ranch/index.html`

2. **Add slider HTML**: For each before/after pair:

```html
<div class="gallery-item before-after-item">
    <div class="gallery-item-header">
        <h3>[Room/Area Name]</h3>
    </div>
    <div class="before-after-container" data-pair="[room-identifier]">
        <img src="../../images/projects/[project-slug]/[image-before.webp]" 
             alt="Before: [before-description]" 
             class="before-image"
             width="800" 
             height="600">
        <img src="../../images/projects/[project-slug]/[image-after.jpg]" 
             alt="After: [after-description]" 
             class="after-image"
             width="800" 
             height="600">
        <div class="before-after-slider">
            <div class="before-after-handle"></div>
        </div>
        <div class="before-label">BEFORE</div>
        <div class="after-label">AFTER</div>
    </div>
    <div class="gallery-item-description">
        <div class="before-after-text">
            <div class="before-text">
                <strong>Before:</strong> [before-description]
            </div>
            <div class="after-text">
                <strong>After:</strong> [after-description]
            </div>
        </div>
    </div>
</div>
```

3. **Add single images**: For non-paired images, use simple gallery item structure

4. **Add slider JavaScript**: Copy the complete slider JavaScript from `monte-fuego-ranch/index.html`

## Step 5: Data Extraction Guide

### From Markdown Gallery Section:

**Simple Gallery Format:**
```
- image-01.jpg | Caption text here
```
→ Extract: filename = `image-01.jpg`, caption = `Caption text here`

**Before/After Format:**
```
- image-01-before.webp | Before: Description of before state
- image-01.jpg | After: Description of after state  
```
→ Extract: before_file = `image-01-before.webp`, after_file = `image-01.jpg`, before_desc = `Description of before state`, after_desc = `Description of after state`

### From Markdown Metadata:
```
# Project Title
location: City, State
slug: project-slug
featured: featured-image.jpg
tags: [tag1, tag2, tag3]
```

## Step 6: Quality Checklist

- [ ] All placeholders replaced with actual content
- [ ] Project-specific meta tags and descriptions
- [ ] Correct image paths and filenames
- [ ] Proper alt text for all images
- [ ] Working breadcrumb navigation
- [ ] Mobile responsive design
- [ ] Before/after sliders functional (if applicable)
- [ ] SEO structured data complete
- [ ] No broken links or missing images

## Step 7: Testing

1. **Local Testing**:
   - Open the HTML file in browser
   - Test on mobile and desktop viewports
   - Verify all images load correctly
   - Test before/after sliders (if applicable)

2. **Navigation Testing**:
   - Verify breadcrumb links work
   - Test header navigation
   - Check footer links

3. **SEO Testing**:
   - Validate HTML structure
   - Check meta tags in browser dev tools
   - Verify structured data with Google's Rich Results Test

## Step 8: Integration

1. **Update main portfolio page**: Add project to `/projects/index.html` portfolio grid
2. **Test integration**: Verify links between portfolio and project page work
3. **Deploy**: Push changes to production

## Common Issues & Solutions

### Image Path Problems
- **Issue**: Images not loading
- **Solution**: Check that image paths are correct relative to HTML file location (`../../images/projects/...`)

### Before/After Slider Not Working  
- **Issue**: Slider doesn't respond to mouse/touch
- **Solution**: Ensure before/after CSS and JavaScript are completely copied from working example

### Meta Tag Issues
- **Issue**: Poor SEO or social sharing
- **Solution**: Verify all placeholder variables are replaced and content is project-specific

### Mobile Layout Problems
- **Issue**: Layout breaks on mobile
- **Solution**: Test with browser dev tools and ensure responsive CSS is included

## Advanced Customization

### Custom Styling
- Add project-specific CSS in the `<style>` section
- Maintain consistency with overall site design
- Test across all viewports

### Additional Features
- Add custom JavaScript for enhanced interactions
- Include additional SEO schema markup
- Implement custom animations or effects

### Performance Optimization
- Use WebP format for images when supported
- Implement progressive image loading
- Minimize CSS and JavaScript where possible