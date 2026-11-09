// V6 Interactions — Micro-interaction handlers, shimmer sweeps, hover enhancements
// AP Music & Audio AWWWARDS-Grade

(function() {
  'use strict';

  const state = {
    interactiveElements: [],
    shimmerElements: [],
  };

  function init() {
    // Find all interactive elements
    const selectors = [
      'a', 'button', '.link-card', '.contact-card', '.fact', '.review-card', '.photo-card',
      '.chapter-dots li', '.tracker-item', '.top-timeline .marker',
      '.search-btn', '.motion-btn', '.menu-btn', '.lang-toggle',
      '.brand', '.nav a', '.dialog-close', '.search-results a',
      '.button-primary', '.action', '.button-secondary', '.text-link'
    ];

    state.interactiveElements = [...document.querySelectorAll(selectors.join(', '))];

    // Add shimmer sweep pseudo-element via JS for elements that need it
    enhanceInteractives();

    // Specific enhancements
    enhanceCards();
    enhanceSceneMedia();
    enhanceDialogInteractions();
    enhanceFormInteractions();
  }

  function enhanceInteractives() {
    state.interactiveElements.forEach(el => {
      // Skip if already enhanced
      if (el.dataset.apEnhanced === 'true') return;
      el.dataset.apEnhanced = 'true';

      // Add shimmer sweep on hover (CSS handles the animation)
      el.classList.add('interactive');
    });
  }

  function enhanceCards() {
    // Link cards - arrow animation
    document.querySelectorAll('.link-card').forEach(card => {
      const arrow = card.querySelector('span:last-child');
      if (arrow) {
        card.addEventListener('mouseenter', () => {
          arrow.style.transform = 'translate3d(8px, -6px, 0)';
          arrow.style.color = 'var(--gold)';
        });
        card.addEventListener('mouseleave', () => {
          arrow.style.transform = 'none';
          arrow.style.color = 'var(--gold-dim)';
        });
      }
    });

    // Contact cards - sweep animation is CSS-driven
    document.querySelectorAll('.contact-card').forEach(card => {
      const arrow = card.querySelector('.contact-arrow');
      if (arrow) {
        card.addEventListener('mouseenter', () => {
          arrow.style.transform = 'translate3d(10px, -8px, 0)';
          arrow.style.color = 'var(--gold)';
        });
        card.addEventListener('mouseleave', () => {
          arrow.style.transform = 'none';
          arrow.style.color = 'var(--gold-dim)';
        });
      }
    });

    // Photo cards - image zoom
    document.querySelectorAll('.photo-card').forEach(card => {
      const img = card.querySelector('img');
      if (img) {
        card.addEventListener('mouseenter', () => {
          img.style.transform = 'scale(1.03)';
          img.style.filter = 'saturate(1.05) brightness(1.02)';
        });
        card.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
          img.style.filter = 'none';
        });
      }
    });
  }

  function enhanceSceneMedia() {
    // Scene media hover - subtle scale boost
    document.querySelectorAll('.scene').forEach(scene => {
      const media = scene.querySelector('.scene-media img');
      if (media) {
        scene.addEventListener('mouseenter', () => {
          if (!document.documentElement.dataset.motion === 'reduced') {
            media.style.transform = 'scale(calc(1.12 - var(--local, 0) * 0.06 + var(--momentum, 0) * 0.02 + 0.015))';
            media.style.filter = 'saturate(1.02) contrast(1.03) brightness(1.01)';
          }
        });
        scene.addEventListener('mouseleave', () => {
          media.style.transform = '';
          media.style.filter = '';
        });
      }
    });

    // Scene credit badge hover
    document.querySelectorAll('.scene').forEach(scene => {
      const credit = scene.querySelector('.scene-credit');
      if (credit) {
        scene.addEventListener('mouseenter', () => {
          credit.style.borderColor = 'var(--divider)';
          credit.style.background = 'rgba(232,197,109,0.1)';
          credit.style.color = 'var(--gold-bright)';
        });
        scene.addEventListener('mouseleave', () => {
          credit.style.borderColor = '';
          credit.style.background = '';
          credit.style.color = '';
        });
      }
    });
  }

  function enhanceDialogInteractions() {
    // Dialog close button
    document.querySelectorAll('.dialog-close').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.color = 'var(--gold-bright)';
        btn.style.transform = 'rotate(90deg)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.color = '';
        btn.style.transform = '';
      });
    });

    // Search results
    document.querySelectorAll('.search-results a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.color = 'var(--gold-bright)';
        link.style.paddingLeft = '0.5rem';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = '';
        link.style.paddingLeft = '';
      });
    });
  }

  function enhanceFormInteractions() {
    // Search input focus
    const searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = 'var(--gold-bright)';
      });
      searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = '';
      });
    }
  }

  // Performance: throttle scroll-heavy interactions
  let shimmerRAF = 0;
  function updateShimmers() {
    // Shimmers are CSS-driven, but we can update positions if needed
    shimmerRAF = requestAnimationFrame(updateShimmers);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Listen for motion changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-motion') {
        const reduced = document.documentElement.dataset.motion === 'reduced';
        document.body.classList.toggle('reduced-motion', reduced);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  window.AP = window.AP || {};
  window.AP.interactions = { enhanceInteractives };
})();