/**
 * Jorge Suárez Landing Page - Scripts
 * Interactivity and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features
  initSmoothScroll();
  initScrollReveal();
  initMobileNav();
  initNavbarScroll();
});

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile nav if open
        closeMobileNav();
      }
    });
  });
}

/**
 * Scroll reveal animation for elements with .reveal class
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }
}

function closeMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  }
}

/**
 * Navbar background change on scroll
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/**
 * Add additional CSS for mobile nav and scrolled navbar
 */
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  /* Mobile nav styles */
  @media (max-width: 768px) {
    .nav-links {
      position: fixed;
      top: var(--nav-height);
      left: 0;
      right: 0;
      background: var(--bg-primary);
      padding: var(--space-lg);
      flex-direction: column;
      gap: var(--space-md);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-base);
      border-bottom: 1px solid var(--border-color);
    }
    
    .nav-links.active {
      display: flex;
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
    
    .nav-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
      opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
  
  /* Scrolled navbar */
  .navbar.scrolled {
    background: rgba(10, 10, 10, 0.95);
    box-shadow: var(--shadow-md);
  }
  
  /* Amber section specific styles */
  .amber {
    background: var(--bg-secondary);
  }
  
  .amber-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-lg);
  }
  
  .amber-logo {
    margin-bottom: var(--space-sm);
  }
  
  .amber-description {
    max-width: 700px;
    font-size: 1.125rem;
  }
  
  .amber-stats {
    display: flex;
    gap: var(--space-2xl);
    margin: var(--space-md) 0;
  }
  
  .amber-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .amber-stat-number {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-primary);
  }
  
  .amber-stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  /* Stats section */
  .stats-section {
    padding: var(--space-2xl) 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }
  
  /* Contact section CTA */
  .contact {
    padding: var(--space-4xl) 0;
  }
  
  .contact .card {
    padding: var(--space-3xl);
  }
`;
document.head.appendChild(additionalStyles);
