// Dynamic Portfolio System for Staged4Sale
// Loads and displays staging projects from Markdown files

class PortfolioManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.currentImageIndex = 0;
        this.lightboxOpen = false;
        this.basePath = 'images/projects/';
    }

    async init() {
        try {
            console.log('Initializing portfolio...');
            await this.loadProjects();
            console.log(`Loaded ${this.projects.length} projects`);
            this.renderGrid();
            this.setupEventListeners();
            console.log('Portfolio initialization complete');
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            this.showError('Failed to load portfolio. Please try again later.');
        }
    }

    async loadProjects() {
        try {
            const projectsResponse = await fetch(`${this.basePath}projects.md`);
            if (!projectsResponse.ok) throw new Error('Failed to load projects index');
            
            const projectsText = await projectsResponse.text();
            const projectSlugs = this.parseProjectsList(projectsText);
            
            const projectPromises = projectSlugs.map(slug => this.loadProject(slug));
            this.projects = await Promise.all(projectPromises);
            
            // Filter out any failed loads
            this.projects = this.projects.filter(project => project !== null);
            
        } catch (error) {
            console.error('Error loading projects:', error);
            throw error;
        }
    }

    parseProjectsList(text) {
        const lines = text.split('\n');
        const slugs = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
                slugs.push(trimmed);
            } else if (trimmed.startsWith('- ')) {
                // Handle list format
                const slug = trimmed.substring(2).trim();
                if (slug) slugs.push(slug);
            }
        }
        
        return slugs;
    }

    async loadProject(slug) {
        try {
            const projectResponse = await fetch(`${this.basePath}${slug}/${slug}.md`);
            if (!projectResponse.ok) {
                console.warn(`Failed to load project: ${slug}`);
                return null;
            }
            
            const projectText = await projectResponse.text();
            return this.parseProject(slug, projectText);
        } catch (error) {
            console.error(`Error loading project ${slug}:`, error);
            return null;
        }
    }

    parseProject(slug, markdown) {
        const lines = markdown.split('\n');
        const project = {
            slug: slug,
            title: '',
            location: '',
            featured: '',
            tags: [],
            gallery: [],
            beforeAfterPairs: [],
            notes: ''
        };

        let currentSection = '';
        let inGallery = false;
        let inNotes = false;

        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('# ')) {
                project.title = trimmed.substring(2).trim();
            } else if (trimmed.startsWith('location:')) {
                project.location = trimmed.substring(9).trim();
            } else if (trimmed.startsWith('slug:')) {
                // Already have slug, skip
            } else if (trimmed.startsWith('featured:')) {
                project.featured = trimmed.substring(9).trim();
            } else if (trimmed.startsWith('tags:')) {
                const tagsStr = trimmed.substring(5).trim();
                project.tags = this.parseTags(tagsStr);
            } else if (trimmed === '## Gallery') {
                inGallery = true;
                inNotes = false;
            } else if (trimmed === '## Notes') {
                inGallery = false;
                inNotes = true;
            } else if (inGallery && trimmed.startsWith('- ')) {
                const galleryItem = this.parseGalleryItem(trimmed);
                if (galleryItem) project.gallery.push(galleryItem);
            } else if (inNotes && trimmed && !trimmed.startsWith('#')) {
                project.notes += (project.notes ? ' ' : '') + trimmed;
            }
        }

        // Build full paths for images
        project.featuredPath = `${this.basePath}${slug}/${project.featured}`;
        project.gallery = project.gallery.map(item => ({
            ...item,
            path: `${this.basePath}${slug}/${item.filename}`
        }));

        // Detect before/after pairs
        project.beforeAfterPairs = this.detectBeforeAfterPairs(project.gallery, slug);
        
        // Filter gallery for thumbnails - exclude 'before' images
        project.thumbnailGallery = project.gallery.filter(item => !item.filename.includes('-before'));

        return project;
    }

    parseTags(tagsStr) {
        if (!tagsStr) return [];
        
        // Remove brackets and split by comma
        const cleaned = tagsStr.replace(/[\[\]]/g, '').trim();
        return cleaned.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    parseGalleryItem(line) {
        // Format: - filename.ext | caption
        const match = line.match(/^-\s*([^|]+)\s*\|\s*(.+)$/);
        if (match) {
            return {
                filename: match[1].trim(),
                caption: match[2].trim()
            };
        }
        return null;
    }

    renderGrid() {
        const container = document.getElementById('portfolio-container');
        if (!container) {
            console.error('Portfolio container not found');
            return;
        }

        // Clear any fallback content
        container.innerHTML = '';

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="portfolio-empty">No projects found.</p>';
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="portfolio-item${project.beforeAfterPairs.length > 0 ? ' has-before-after' : ''}" data-slug="${project.slug}" role="button" tabindex="0" aria-label="View ${project.title} project">
                <img src="${project.featuredPath}" alt="${project.title}" loading="lazy" class="portfolio-image" 
                     onload="this.style.opacity=1" 
                     onerror="this.src='images/logo.png';this.style.opacity=0.5" 
                     style="opacity:0;transition:opacity 0.3s ease">
                <div class="portfolio-image-count">
                    <i class="fas fa-camera"></i>
                    <span>${project.thumbnailGallery.length}</span>
                </div>
                <div class="portfolio-overlay">
                    <h3 class="portfolio-title">${this.escapeHtml(project.title)}</h3>
                    <p class="portfolio-location">${this.escapeHtml(project.location)}</p>
                    <div class="portfolio-tags">
                        ${project.tags.map(tag => `<span class="portfolio-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners
        container.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                this.openLightbox(slug);
            });
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const slug = e.currentTarget.dataset.slug;
                    this.openLightbox(slug);
                }
            });
        });

        // Setup intersection observer for performance and animations
        this.setupIntersectionObserver();
        this.setupPortfolioAnimations();
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all lazy-loaded images
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    setupPortfolioAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers - just show all overlays
            document.querySelectorAll('.portfolio-overlay').forEach(overlay => {
                overlay.classList.add('animate-in');
            });
            return;
        }

        // Detect if mobile device for different timing
        const isMobile = window.innerWidth <= 768;
        const baseDelay = isMobile ? 800 : 1000; // Shorter delay on mobile
        const reEntryDelay = 300;
        const staggerDelay = isMobile ? 100 : 150;
        
        const animationObserver = new IntersectionObserver((entries) => {
            // Handle entries that are entering viewport
            const enteringEntries = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => {
                    const rectA = a.boundingClientRect;
                    const rectB = b.boundingClientRect;
                    return rectA.top - rectB.top;
                });

            // Handle entries that are leaving viewport
            const leavingEntries = entries.filter(entry => !entry.isIntersecting);

            // Animate in entering items
            enteringEntries.forEach((entry, index) => {
                const portfolioItem = entry.target;
                const overlay = portfolioItem.querySelector('.portfolio-overlay');
                
                if (overlay) {
                    // Clear any existing timeouts
                    if (portfolioItem.animationTimeout) {
                        clearTimeout(portfolioItem.animationTimeout);
                    }
                    
                    // Determine delay based on whether it's been seen before
                    const isFirstView = !overlay.dataset.hasBeenAnimated;
                    const delay = isFirstView ? baseDelay : reEntryDelay;
                    
                    // Clear exit animation classes
                    overlay.classList.remove('animate-out');
                    
                    // Set up animation with delay and stagger
                    portfolioItem.animationTimeout = setTimeout(() => {
                        overlay.classList.add('animate-in');
                        portfolioItem.classList.add('has-visible-overlay'); // Fallback for :has() selector
                        overlay.dataset.hasBeenAnimated = 'true';
                    }, delay + (index * staggerDelay));
                }
            });

            // Animate out leaving items
            leavingEntries.forEach(entry => {
                const portfolioItem = entry.target;
                const overlay = portfolioItem.querySelector('.portfolio-overlay');
                
                if (overlay) {
                    // Clear any pending animations
                    if (portfolioItem.animationTimeout) {
                        clearTimeout(portfolioItem.animationTimeout);
                    }
                    
                    // Animate out
                    overlay.classList.remove('animate-in');
                    overlay.classList.add('animate-out');
                    portfolioItem.classList.remove('has-visible-overlay'); // Remove fallback class
                }
            });
        }, {
            threshold: 0.25, // Trigger when 25% of the item is visible
            rootMargin: '0px 0px -10% 0px'
        });

        // Observe all portfolio items
        document.querySelectorAll('.portfolio-item').forEach(item => {
            animationObserver.observe(item);
        });
    }

    openLightbox(slug) {
        const project = this.projects.find(p => p.slug === slug);
        if (!project) return;

        this.currentProject = project;
        this.currentImageIndex = 0;
        this.lightboxOpen = true;

        this.renderLightbox();
        this.preloadImages();
        document.body.style.overflow = 'hidden';
    }

    preloadImages() {
        if (!this.currentProject) return;

        // Preload the first few images for better performance
        const imagesToPreload = this.currentProject.gallery.slice(0, 3);
        
        imagesToPreload.forEach(item => {
            const img = new Image();
            img.src = item.path;
        });
    }

    renderLightbox() {
        if (!this.currentProject) return;

        const currentItem = this.currentProject.gallery[this.currentImageIndex];
        const beforeAfterPair = this.getBeforeAfterPair(currentItem);
        
        const imageContentHTML = beforeAfterPair ? 
            this.renderBeforeAfterComparison(beforeAfterPair) : 
            `<img src="${currentItem.path}" 
                 alt="${currentItem.caption}" 
                 class="lightbox-image">`;

        const lightboxHTML = `
            <div class="lightbox-overlay" id="lightbox-overlay">
                <div class="lightbox-content">
                    <button class="lightbox-close" aria-label="Close gallery">&times;</button>
                    
                    <div class="lightbox-main">
                        <div class="lightbox-image-container">
                            ${imageContentHTML}
                            
                            <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="lightbox-nav lightbox-next" aria-label="Next image">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        
                        <div class="lightbox-info">
                            <h3>${this.escapeHtml(this.currentProject.title)}</h3>
                            <p class="lightbox-location">${this.escapeHtml(this.currentProject.location)}</p>
                            <div class="lightbox-caption">${this.renderCaptionContent(currentItem, beforeAfterPair)}</div>
                            <p class="lightbox-notes">${this.escapeHtml(this.currentProject.notes)}</p>
                        </div>
                    </div>
                    
                    <div class="lightbox-thumbnails">
                        ${this.currentProject.thumbnailGallery.map((item, thumbnailIndex) => {
                            const galleryIndex = this.currentProject.gallery.findIndex(g => g.filename === item.filename);
                            return `
                                <div class="lightbox-thumbnail ${galleryIndex === this.currentImageIndex ? 'active' : ''}" 
                                     data-index="${galleryIndex}">
                                    <img src="${item.path}" alt="${item.caption}" loading="lazy">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.setupLightboxEvents();
        
        // Setup before/after slider if present
        if (beforeAfterPair) {
            this.setupBeforeAfterSlider();
        }
    }

    setupLightboxEvents() {
        const overlay = document.getElementById('lightbox-overlay');
        const closeBtn = overlay.querySelector('.lightbox-close');
        const prevBtn = overlay.querySelector('.lightbox-prev');
        const nextBtn = overlay.querySelector('.lightbox-next');
        const thumbnails = overlay.querySelectorAll('.lightbox-thumbnail');
        const imageContainer = overlay.querySelector('.lightbox-image-container');

        // Close events
        closeBtn.addEventListener('click', () => this.closeLightbox());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeLightbox();
        });

        // Navigation
        prevBtn.addEventListener('click', () => this.showPrevImage());
        nextBtn.addEventListener('click', () => this.showNextImage());

        // Thumbnails
        thumbnails.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const galleryIndex = parseInt(thumb.dataset.index);
                this.showImage(galleryIndex);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // Touch gesture support for mobile
        this.setupTouchGestures(imageContainer);
    }

    setupTouchGestures(element) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let isDragging = false;

        element.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isDragging = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!isDragging) {
                const diffX = Math.abs(e.touches[0].clientX - touchStartX);
                const diffY = Math.abs(e.touches[0].clientY - touchStartY);
                
                // Only consider it a drag if horizontal movement is greater than vertical
                if (diffX > diffY && diffX > 10) {
                    isDragging = true;
                }
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Minimum swipe distance and ensure horizontal swipe
            if (Math.abs(diffX) > 50 && diffY < 100) {
                if (diffX > 0) {
                    // Swipe left - next image
                    this.showNextImage();
                } else {
                    // Swipe right - previous image
                    this.showPrevImage();
                }
            }
        }, { passive: true });
    }

    handleKeydown(e) {
        if (!this.lightboxOpen) return;

        switch (e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                this.showPrevImage();
                break;
            case 'ArrowRight':
                this.showNextImage();
                break;
        }
    }

    showPrevImage() {
        const currentThumbnailIndex = this.getCurrentThumbnailIndex();
        if (currentThumbnailIndex > 0) {
            const prevThumbnail = this.currentProject.thumbnailGallery[currentThumbnailIndex - 1];
            const prevGalleryIndex = this.currentProject.gallery.findIndex(g => g.filename === prevThumbnail.filename);
            this.showImage(prevGalleryIndex);
        }
    }

    showNextImage() {
        const currentThumbnailIndex = this.getCurrentThumbnailIndex();
        if (currentThumbnailIndex < this.currentProject.thumbnailGallery.length - 1) {
            const nextThumbnail = this.currentProject.thumbnailGallery[currentThumbnailIndex + 1];
            const nextGalleryIndex = this.currentProject.gallery.findIndex(g => g.filename === nextThumbnail.filename);
            this.showImage(nextGalleryIndex);
        }
    }

    getCurrentThumbnailIndex() {
        const currentItem = this.currentProject.gallery[this.currentImageIndex];
        
        // If current image is a 'before' image, find its corresponding 'after' image in thumbnails
        if (currentItem.filename.includes('-before')) {
            const beforeAfterPair = this.getBeforeAfterPair(currentItem);
            if (beforeAfterPair) {
                return this.currentProject.thumbnailGallery.findIndex(item => 
                    item.filename === beforeAfterPair.after.filename
                );
            }
        }
        
        // Otherwise, find the current item directly in thumbnails
        return this.currentProject.thumbnailGallery.findIndex(item => 
            item.filename === currentItem.filename
        );
    }

    showImage(index) {
        if (index < 0 || index >= this.currentProject.gallery.length) return;

        this.currentImageIndex = index;
        const overlay = document.getElementById('lightbox-overlay');
        const imageContainer = overlay.querySelector('.lightbox-image-container');
        const caption = overlay.querySelector('.lightbox-caption');
        const thumbnails = overlay.querySelectorAll('.lightbox-thumbnail');

        const currentItem = this.currentProject.gallery[index];
        const beforeAfterPair = this.getBeforeAfterPair(currentItem);
        
        // Update image content
        const imageContentHTML = beforeAfterPair ? 
            this.renderBeforeAfterComparison(beforeAfterPair) : 
            `<img src="${currentItem.path}" 
                 alt="${currentItem.caption}" 
                 class="lightbox-image">`;
        
        // Find and preserve navigation buttons
        const prevBtn = imageContainer.querySelector('.lightbox-prev');
        const nextBtn = imageContainer.querySelector('.lightbox-next');
        
        // Update container content
        imageContainer.innerHTML = imageContentHTML;
        
        // Re-add navigation buttons
        if (prevBtn) imageContainer.appendChild(prevBtn);
        if (nextBtn) imageContainer.appendChild(nextBtn);
        
        // Update caption
        caption.innerHTML = this.renderCaptionContent(currentItem, beforeAfterPair);

        // Update thumbnail active state
        thumbnails.forEach((thumb) => {
            const thumbIndex = parseInt(thumb.dataset.index);
            thumb.classList.toggle('active', thumbIndex === index);
        });

        // Scroll thumbnail into view if it exists
        const activeThumbnail = Array.from(thumbnails).find(thumb => 
            parseInt(thumb.dataset.index) === index
        );
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Setup before/after slider if present
        if (beforeAfterPair) {
            this.setupBeforeAfterSlider();
        }
    }

    closeLightbox() {
        this.lightboxOpen = false;
        document.body.style.overflow = '';
        
        const overlay = document.getElementById('lightbox-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
    }

    setupEventListeners() {
        // Setup any additional event listeners
        window.addEventListener('resize', () => {
            // Handle responsive adjustments if needed
        });
    }

    showError(message) {
        const container = document.getElementById('portfolio-container');
        if (container) {
            container.innerHTML = `<div class="portfolio-error">${message}</div>`;
        }
    }

    detectBeforeAfterPairs(gallery, slug) {
        const pairs = [];
        const beforeImages = gallery.filter(item => item.filename.includes('-before'));
        
        beforeImages.forEach(beforeItem => {
            // Extract the base number from filename (e.g., '01' from 'project-01-before.webp')
            const beforeMatch = beforeItem.filename.match(/-([0-9]+)-before\./i);
            if (beforeMatch) {
                const imageNumber = beforeMatch[1];
                
                // Find corresponding after image (without -before suffix)
                const afterItem = gallery.find(item => {
                    const afterMatch = item.filename.match(new RegExp(`-${imageNumber}\\.[^.]+$`));
                    return afterMatch && !item.filename.includes('-before');
                });
                
                if (afterItem) {
                    pairs.push({
                        before: beforeItem,
                        after: afterItem,
                        imageNumber: imageNumber
                    });
                }
            }
        });
        
        return pairs;
    }

    getBeforeAfterPair(currentItem) {
        if (!this.currentProject.beforeAfterPairs) return null;
        
        return this.currentProject.beforeAfterPairs.find(pair => 
            pair.before.filename === currentItem.filename || 
            pair.after.filename === currentItem.filename
        );
    }

    renderBeforeAfterComparison(pair) {
        return `
            <div class="before-after-container" id="before-after-container">
                <img src="${pair.before.path}" alt="${pair.before.caption}" class="before-image">
                <img src="${pair.after.path}" alt="${pair.after.caption}" class="after-image">
                <div class="before-after-slider" id="before-after-slider">
                    <div class="before-after-handle"></div>
                </div>
                <div class="before-after-labels">
                    <div class="before-label">Before</div>
                    <div class="after-label">After</div>
                </div>
            </div>
        `;
    }

    setupBeforeAfterSlider() {
        const container = document.getElementById('before-after-container');
        const slider = document.getElementById('before-after-slider');
        const afterImage = container.querySelector('.after-image');
        
        if (!container || !slider || !afterImage) return;

        let isDragging = false;
        let startX = 0;
        let currentX = 50; // Start at 50%

        const updateSlider = (percentage) => {
            // Clamp percentage between 0 and 100
            percentage = Math.max(0, Math.min(100, percentage));
            
            // Update slider position
            slider.style.left = percentage + '%';
            
            // Update clip path for after image
            afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
            
            currentX = percentage;
        };

        const getPercentageFromEvent = (event) => {
            const rect = container.getBoundingClientRect();
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            return ((clientX - rect.left) / rect.width) * 100;
        };

        // Mouse events
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = getPercentageFromEvent(e);
            updateSlider(startX);
            container.style.cursor = 'ew-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const percentage = getPercentageFromEvent(e);
            updateSlider(percentage);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'ew-resize';
        });

        // Touch events
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = getPercentageFromEvent(e);
            updateSlider(startX);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const percentage = getPercentageFromEvent(e);
            updateSlider(percentage);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Keyboard accessibility
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                updateSlider(currentX - 5);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                updateSlider(currentX + 5);
                e.preventDefault();
            }
        });

        // Make container focusable for keyboard navigation
        container.setAttribute('tabindex', '0');
        container.setAttribute('aria-label', 'Before and after comparison slider');
        
        // Initialize slider position
        updateSlider(50);
    }

    renderCaptionContent(currentItem, beforeAfterPair) {
        if (!beforeAfterPair) {
            return this.escapeHtml(currentItem.caption);
        }
        
        // For before/after pairs, show both captions
        return `
            <div class="before-after-captions">
                <div class="caption-before">
                    <strong>Before:</strong> ${this.escapeHtml(beforeAfterPair.before.caption.replace('Before: ', ''))}
                </div>
                <div class="caption-after">
                    <strong>After:</strong> ${this.escapeHtml(beforeAfterPair.after.caption.replace('After: ', ''))}
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('portfolio-container')) {
        const portfolio = new PortfolioManager();
        portfolio.init();
    }
});