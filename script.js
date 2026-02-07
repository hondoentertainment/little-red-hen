// ============================================
// THE LITTLE RED HEN — Site Interactions
// ============================================

// Global function: apply reveal animations to dynamically rendered elements
function applyRevealAnimations() {
  const revealElements = document.querySelectorAll(
    '.upcoming-week, .show-card, .schedule-card, .special-item, .visit-card, .visit-map'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    }
  });

  // Stagger animation for grid items
  const staggerGroups = [
    document.querySelectorAll('.show-card'),
    document.querySelectorAll('.schedule-card'),
    document.querySelectorAll('.special-item'),
    document.querySelectorAll('.visit-card')
  ];

  staggerGroups.forEach(group => {
    group.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.08}s`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll behavior ---
  const navbar = document.getElementById('navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Mobile menu toggle ---
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // --- Initial scroll reveal for static elements ---
  const staticRevealElements = document.querySelectorAll(
    '.about-text, .about-stats, .stat-card'
  );

  const staticObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          staticObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  staticRevealElements.forEach(el => {
    el.classList.add('reveal');
    staticObserver.observe(el);
  });

  // Stagger stat cards
  document.querySelectorAll('.stat-card').forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.08}s`;
  });

  // Apply reveal to any already-rendered dynamic elements
  applyRevealAnimations();

});
