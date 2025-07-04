# Markdown Format Specification

This document defines the standard markdown format for Staged4Sale project files.

## File Location

Project markdown files must be located at:
```
/images/projects/[project-slug]/[project-slug].md
```

Example: `/images/projects/monte-fuego-ranch/monte-fuego-ranch.md`

## File Structure

### Required Sections

1. **Title** (H1 heading)
2. **Metadata** (key-value pairs)
3. **Gallery** (H2 section with image list)
4. **Notes** (H2 section with description)

## Format Specification

### 1. Project Title
```markdown
# Project Name
```
- Must be the first line of the file
- Use title case
- Should match the actual project name used in marketing

### 2. Metadata Section
```markdown
location: City, State
slug: project-slug-name
featured: featured-image-filename.jpg
tags: [tag1, tag2, tag3]
```

#### Metadata Fields

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| `location` | Yes | `City, State` | Project location with state abbreviation |
| `slug` | Yes | `kebab-case` | URL-safe identifier matching directory name |
| `featured` | Yes | `filename.ext` | Main project image for hero section |
| `tags` | Yes | `[tag1, tag2, tag3]` | Array of descriptive tags (3-5 recommended) |

#### Tag Guidelines
- Use lowercase
- Separate words with hyphens for multi-word tags
- Common tags: `vacant`, `luxury`, `coastal`, `modern`, `traditional`, `family`, `condo`, `ranch`, `bungalow`, `turnkey`, `neutral-palette`

### 3. Gallery Section
```markdown
## Gallery
- image-01.jpg | Image caption describing the scene
- image-02.jpg | Another image caption
```

#### Gallery Format Rules

**Simple Gallery Images:**
```markdown
- filename.jpg | Caption text describing the image
```

**Before/After Pairs:**
```markdown
- filename-before.webp | Before: Description of the before state
- filename.jpg | After: Description of the after state
```

#### Image Naming Conventions

**Simple Gallery:**
- `[project-slug]-01.jpg`, `[project-slug]-02.jpg`, etc.
- Use `.jpg` for main images
- Use `.webp` for additional formats

**Before/After Projects:**
- Before images: `[project-slug]-01-before.webp`
- After images: `[project-slug]-01.jpg`
- Sequential numbering for multiple pairs

#### Caption Guidelines
- Start with descriptive room/area name
- Include key staging elements or features
- Use title case for consistency
- Be specific but concise (aim for 5-10 words)

**Good Examples:**
- `Spacious Living Room with Modern Furniture and Natural Light`
- `Gourmet Kitchen with Island and Stainless Steel Appliances`
- `Before: Empty Room with Outdated Fixtures`
- `After: Warm Living Space with Strategic Furniture Placement`

**Avoid:**
- Generic descriptions (`Nice room`, `Pretty space`)
- Marketing language (`Stunning`, `Amazing`)
- Overly long descriptions (>15 words)

### 4. Notes Section
```markdown
## Notes
Project description paragraph explaining the staging approach, key features, and results. This content will be used in the hero section and for SEO descriptions.
```

#### Notes Guidelines
- Write in third person
- Focus on staging strategy and outcomes
- Include target buyer information if relevant
- Mention key design elements and staging philosophy
- Length: 3-6 sentences (150-300 words)
- Use professional, descriptive language

## Complete Example Files

### Simple Gallery Project
```markdown
# Sunset Villa Estate
location: Newport Beach, CA
slug: sunset-villa-estate
featured: sunset-villa-estate-01.jpg
tags: [luxury, coastal, vacant, modern]

## Gallery
- sunset-villa-estate-01.jpg | Spacious Living Room with Floor-to-Ceiling Windows
- sunset-villa-estate-02.jpg | Gourmet Kitchen with Waterfall Island and High-End Appliances
- sunset-villa-estate-03.jpg | Master Bedroom with Ocean Views and Neutral Palette
- sunset-villa-estate-04.jpg | Spa-Inspired Bathroom with Marble Finishes
- sunset-villa-estate-05.jpg | Outdoor Terrace Staged for Entertaining

## Notes
This luxury Newport Beach estate was staged to highlight its stunning coastal location and modern architectural features. The vacant property received a complete staging with contemporary furnishings that complement the clean lines and expansive windows. Our team focused on creating sophisticated yet approachable spaces that appeal to affluent buyers seeking a turnkey luxury home. The neutral color palette and strategic lighting enhance the natural beauty of the ocean views while maintaining a sense of warmth and livability.
```

### Before/After Project
```markdown
# Heritage Home Revival
location: San Diego, CA
slug: heritage-home-revival
featured: heritage-home-revival-01.jpg
tags: [transformation, family, traditional, staging]

## Gallery
- heritage-home-revival-01-before.webp | Before: Cluttered Living Room with Mismatched Furniture
- heritage-home-revival-01.jpg | After: Cohesive Living Space with Traditional Staging Elements
- heritage-home-revival-02-before.webp | Before: Outdated Kitchen with Limited Counter Space
- heritage-home-revival-02.jpg | After: Organized Kitchen Showcasing Storage and Functionality
- heritage-home-revival-03.jpg | Charming Breakfast Nook with Natural Light

## Notes
This San Diego family home transformation demonstrates the impact of strategic staging on buyer perception. The property had good bones but suffered from clutter and inconsistent decorating that masked its potential. Through careful editing, professional furniture placement, and cohesive styling, we created inviting spaces that showcase the home's traditional charm and family-friendly layout. The staging emphasizes the home's character features while presenting a move-in-ready environment that appeals to modern families.
```

## Validation Rules

### Required Elements Checklist
- [ ] H1 title is present and descriptive
- [ ] All metadata fields are completed
- [ ] Gallery section contains at least 3 images
- [ ] Image filenames match actual files in directory
- [ ] Notes section provides meaningful project description
- [ ] File is saved with correct naming convention

### Content Quality Checklist
- [ ] Tags are relevant and properly formatted
- [ ] Image captions are descriptive and consistent
- [ ] Notes section is professional and informative
- [ ] Before/after descriptions clearly differentiate states
- [ ] Location includes city and state
- [ ] Slug matches directory name exactly

## Common Errors

### Metadata Errors
- **Missing fields**: All metadata fields are required
- **Incorrect tag format**: Must use array syntax `[tag1, tag2]`
- **Slug mismatch**: Slug must match directory name exactly
- **File extension errors**: Include the file extension in featured field

### Gallery Errors
- **Missing pipe separator**: Must use `|` to separate filename from caption
- **Inconsistent naming**: Follow naming conventions strictly
- **Missing files**: All referenced images must exist in project directory
- **Caption inconsistency**: Maintain consistent style across all captions

### Notes Errors
- **Too brief**: Notes should be substantial (150+ words)
- **Marketing language**: Avoid subjective terms, focus on facts
- **Missing staging context**: Should explain staging approach and goals
- **Poor grammar**: Proofread for professional presentation

## File Management

### Directory Structure
```
/images/projects/[project-slug]/
├── [project-slug].md           # Main project file
├── [project-slug]-01.jpg       # Primary images
├── [project-slug]-01-before.webp  # Before images (if applicable)
├── [project-slug]-02.jpg
└── ...                         # Additional images
```

### Version Control
- Always commit markdown files with corresponding images
- Use descriptive commit messages for project additions
- Review changes before committing to ensure quality

### Backup and Recovery
- Maintain backups of all project files
- Document any manual edits or customizations
- Keep original high-resolution images for future use