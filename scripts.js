/**
 * Jorge Suárez Landing Page - Scripts
 * Interactivity and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features
  initLanguage();
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
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (!targetId || targetId.length < 2) return;
      let target = null;
      try { target = document.querySelector(targetId); } catch (_) { return; }

      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        closeMobileNav();
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
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
      navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }
}

function closeMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
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
  @media (max-width: 1100px) {
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
  
  .contact .card {
    padding: var(--space-3xl);
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

/**
 * Language Switching System
 */
function initLanguage() {
  const langToggle = document.querySelector('.lang-switcher');
  if (!langToggle) return;

  const esLink = langToggle.querySelector('.es-btn') || langToggle.children[0];
  const enLink = langToggle.querySelector('.en-btn') || langToggle.children[1];

  const updateUI = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es]').forEach(el => {
      // Prioritize dataset content
      const content = el.getAttribute(`data-${lang}`);
      if (content) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = content;
        } else if (el.tagName === 'META') {
          el.setAttribute('content', content);
        } else {
          el.innerHTML = content;
        }
      }
    });

    // Update switcher state
    if (lang === 'es') {
      esLink.classList.add('active');
      enLink.classList.remove('active');
    } else {
      enLink.classList.add('active');
      esLink.classList.remove('active');
    }

    // Save preference
    try { localStorage.setItem('preferred-lang', lang); } catch (_) {}
  };

  esLink.addEventListener('click', (e) => {
    e.preventDefault();
    updateUI('es');
  });

  enLink.addEventListener('click', (e) => {
    e.preventDefault();
    updateUI('en');
  });

  // URL param (?lang=en) wins, then saved preference, then browser language
  let savedLang = null;
  try { savedLang = localStorage.getItem('preferred-lang'); } catch (_) {}
  const urlLang = new URLSearchParams(location.search).get('lang');
  const browserLang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  const lang = ['es', 'en'].includes(urlLang) ? urlLang : (savedLang || browserLang);
  updateUI(lang);
}


/**
 * "Lo último": trae 6 publicaciones con imagen desde el muro en vivo.
 * Si el muro no responde, la sección se queda oculta.
 */
(function initLatest() {
  const section = document.getElementById('lo-ultimo');
  const grid = document.getElementById('latest-grid');
  if (!section || !grid || !window.fetch) return;
  const API = 'https://muro.jorgesuarez.com.mx';
  const NAMES = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', threads: 'Threads', bluesky: 'Bluesky' };
  let items = [];
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = (iso, lang) => {
    const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
    const es = lang !== 'en';
    if (m < 60) return es ? `hace ${Math.max(m, 1)} min` : `${Math.max(m, 1)} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return es ? `hace ${h} h` : `${h} h ago`;
    const d = Math.round(h / 24);
    return es ? (d === 1 ? 'ayer' : `hace ${d} días`) : (d === 1 ? 'yesterday' : `${d} days ago`);
  };
  const render = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    grid.innerHTML = items.map((p) => `
      <a class="latest-card" href="${esc(p.url)}" target="_blank" rel="noopener">
        <img src="${API}/img?u=${encodeURIComponent(p.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">
        <div class="latest-body">
          <div class="latest-meta"><b>${NAMES[p.network] || esc(p.network)}</b> · ${ago(p.date, lang)}</div>
          <p class="latest-text">${esc((p.text || '').replace(/\s*https?:\/\/\S+/g, ''))}</p>
        </div>
      </a>`).join('');
  };
  fetch(API + '/api/posts?limit=60')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      const seen = new Set();
      items = (d.posts || []).filter((p) => p.image && p.source === 'own' && !seen.has(p.network) && seen.add(p.network)).slice(0, 6);
      if (items.length < 6) items = items.concat((d.posts || []).filter((p) => p.image && p.source === 'own' && !items.includes(p)).slice(0, 6 - items.length));
      if (!items.length) return;
      render();
      section.hidden = false;
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    })
    .catch(() => {});
})();
