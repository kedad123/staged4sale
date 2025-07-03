
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
});

// Hero section zoom and pan effect
const hero = document.getElementById('hero');
let zoom = 110;
let panX = 50;
let panY = 50;
let zoomDirection = 1; // 1 for zooming in, -1 for zooming out
let panDirectionX = 1; // 1 for right, -1 for left
let panDirectionY = 1; // 1 for down, -1 for up

setInterval(() => {
    // Zoom effect
    zoom += 0.1 * zoomDirection;
    if (zoom > 130 || zoom < 90) {
        zoomDirection *= -1;
    }

    // Pan effect
    panX += 0.04 * panDirectionX;
    panY += 0.04 * panDirectionY;

    if (panX > 70 || panX < 30) {
        panDirectionX *= -1;
    }
    if (panY > 70 || panY < 30) {
        panDirectionY *= -1;
    }

    hero.style.backgroundSize = `${zoom}%`;
    hero.style.backgroundPosition = `${panX}% ${panY}%`;
}, 50);

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Back to Top button functionality
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { // Show button after scrolling 300px
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Number animation for trust indicators
const counters = document.querySelectorAll('.count');
const heroSection = document.getElementById('hero');
let hasAnimated = false;

const animateNumber = (counter) => {
    const target = +counter.getAttribute('data-target');
    const speed = 2000; // The higher the speed, the slower the animation
    const increment = target / speed;

    const updateCount = () => {
        const count = +counter.innerText;
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 1);
        } else {
            counter.innerText = target;
        }
    };
    updateCount();
};

const checkVisibilityAndAnimate = () => {
    const rect = heroSection.getBoundingClientRect();
    // Check if the hero section is in the viewport
    if (rect.top < window.innerHeight && rect.bottom >= 0 && !hasAnimated) {
        counters.forEach(animateNumber);
        hasAnimated = true; // Ensure animation runs only once
    }
};

// Update years of experience dynamically
document.addEventListener('DOMContentLoaded', function () {
  // Years of Experience
  const startYear = 2006;
  const currentYear = new Date().getFullYear();
  const yearsElement = document.getElementById('years-experience');
  if (yearsElement) {
    yearsElement.textContent = currentYear - startYear;
  }



// Initial check on load
checkVisibilityAndAnimate();

// Check on scroll
window.addEventListener('scroll', checkVisibilityAndAnimate);

// Active menu highlighting based on scroll position
setupMenuHighlighting();

});

function setupMenuHighlighting() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    console.log('Setting up menu highlighting...');
    console.log('Nav links found:', navLinks.length);
    console.log('Sections found:', sections.length);
    
    // Better intersection observer settings
    const observerOptions = {
        rootMargin: '-10% 0px -80% 0px', // Less restrictive margins
        threshold: 0.1 // Small threshold for better detection
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const targetId = entry.target.id;
            const navLink = document.querySelector(`nav a[href="#${targetId}"]`);
            
            console.log(`Section ${targetId} intersecting:`, entry.isIntersecting);
            
            if (entry.isIntersecting) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                // Add active class to current nav link
                if (navLink) {
                    navLink.classList.add('active');
                    console.log(`Added active class to ${targetId} nav link`);
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
        console.log(`Observing section: ${section.id}`);
    });
    
    // Fallback: Manual scroll detection
    let ticking = false;
    
    function updateActiveNavOnScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollPos = window.scrollY + 150; // Account for header height
                let currentSection = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                        currentSection = section.id;
                    }
                });
                
                if (currentSection) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`nav a[href="#${currentSection}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll listener as fallback
    window.addEventListener('scroll', updateActiveNavOnScroll);
    
    // Initialize active state
    updateActiveNavOnScroll();
}