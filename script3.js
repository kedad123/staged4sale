document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Thank you for your inquiry! We will be in touch shortly.');
});

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
});

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
    const speed = 1500; // Animation speed in milliseconds
    const increment = target / (speed / 10); // Adjust increment based on speed

    let current = 0;
    const updateCount = () => {
        if (current < target) {
            current += increment;
            counter.innerText = Math.ceil(current);
            setTimeout(updateCount, 10);
        } else {
            counter.innerText = target;
        }
    };
    updateCount();
};

const checkVisibilityAndAnimate = () => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0 && !hasAnimated) {
        counters.forEach(animateNumber);
        hasAnimated = true;
    }
};

// Initial check on load
checkVisibilityAndAnimate();

// Check on scroll
window.addEventListener('scroll', checkVisibilityAndAnimate);

// Subtle parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrollPosition = window.pageYOffset;
    hero.style.backgroundPositionY = `${-scrollPosition * 0.2}px`;
});
