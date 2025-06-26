document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Your message has been beamed to the mothership!');
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

// Crazy Hero section animation
const hero = document.getElementById('hero');
let hue = 0;
setInterval(() => {
    hue = (hue + 1) % 360;
    hero.style.filter = `hue-rotate(${hue}deg)`;
}, 100);

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Back to Top button functionality
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) { // Show button after scrolling 400px
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

// Number animation for trust indicators (slower and more dramatic)
const counters = document.querySelectorAll('.count');
const heroSection = document.getElementById('hero');
let hasAnimated = false;

const animateNumber = (counter) => {
    const target = +counter.getAttribute('data-target');
    const speed = 5000; // Much slower animation
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
    if (rect.top < window.innerHeight && rect.bottom >= 0 && !hasAnimated) {
        counters.forEach(animateNumber);
        hasAnimated = true;
    }
};

// Initial check on load
checkVisibilityAndAnimate();

// Check on scroll
window.addEventListener('scroll', checkVisibilityAndAnimate);

// Add a custom cursor effect
document.addEventListener('DOMContentLoaded', () => {
    const customCursor = document.createElement('div');
    customCursor.classList.add('custom-cursor');
    document.body.appendChild(customCursor);

    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        customCursor.style.backgroundColor = '#ff00ff';
    });

    document.addEventListener('mouseup', () => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        customCursor.style.backgroundColor = '#00ffff';
    });
});

// Add CSS for custom cursor
const cursorStyle = document.createElement('style');
cursorStyle.innerHTML = `
.custom-cursor {
    position: fixed;
    width: 30px;
    height: 30px;
    background-color: #00ffff; /* Cyan */
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out, background-color 0.1s ease-out;
    z-index: 9999;
    box-shadow: 0 0 15px #00ffff;
}
`;
document.head.appendChild(cursorStyle);
