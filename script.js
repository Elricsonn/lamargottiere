/* ============================================
   La Margottiere - Shared JavaScript
   ============================================ */

(function() {
  'use strict';

  /* ---- Hamburger Menu Toggle ---- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('open');
    });

    // Handle dropdown expand on mobile
    var dropdownParents = document.querySelectorAll('.main-nav > ul > li.has-dropdown');
    dropdownParents.forEach(function(item) {
      item.querySelector(':scope > a').addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('expanded');
        }
      });
    });

    // Close menu on link click (mobile)
    var navLinks = mainNav.querySelectorAll('.dropdown a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          mainNav.classList.remove('open');
          menuToggle.classList.remove('active');
        }
      });
    });
  }

  /* ---- Scroll Animations (IntersectionObserver) ---- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });
    fadeEls.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: just show them
    fadeEls.forEach(function(el) {
      el.classList.add('visible');
    });
  }

  /* ---- Lightbox with Navigation ---- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var galleryItems = document.querySelectorAll('.gallery-item');
  var lightboxImages = [];
  var lightboxIndex = 0;

  if (lightbox && galleryItems.length > 0) {
    // Build images array from gallery items
    galleryItems.forEach(function(item, index) {
      var img = item.querySelector('img');
      if (img) {
        lightboxImages.push(img.src);
      }
      item.addEventListener('click', function() {
        lightboxIndex = index;
        openLightbox(lightboxImages[lightboxIndex]);
      });
    });

    // Close button
    var closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Prev button
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
      });
    }

    // Next button
    var nextBtn = lightbox.querySelector('.lightbox-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
      });
    }

    // Click overlay background to close
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Make globally available for any inline onclick fallback
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  /* ---- Keyboard Navigation ---- */
  document.addEventListener('keydown', function(e) {
    // Lightbox keyboard nav
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && lightboxImages.length > 0) {
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
      } else if (e.key === 'ArrowRight' && lightboxImages.length > 0) {
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
      }
      return;
    }

    // Slideshow keyboard nav (only when lightbox is not active)
    var track = document.getElementById('slideshow-track');
    if (track) {
      if (e.key === 'ArrowRight' && window.slideNext) window.slideNext();
      if (e.key === 'ArrowLeft' && window.slidePrev) window.slidePrev();
    }
  });

  /* ---- Slideshow with Thumbnails ---- */
  var track = document.getElementById('slideshow-track');
  var thumbsContainer = document.querySelector('.slideshow-thumbs');

  if (track) {
    var current = 0;
    var images = track.querySelectorAll('img');
    var total = images.length;
    var slideTotal = document.getElementById('slide-total');
    var slideCurrent = document.getElementById('slide-current');

    if (slideTotal) slideTotal.textContent = total;

    // Build thumbnails if container exists
    var thumbs = [];
    if (thumbsContainer) {
      images.forEach(function(img, i) {
        var thumb = document.createElement('img');
        thumb.src = img.src;
        thumb.alt = img.alt;
        if (i === 0) thumb.classList.add('active');
        thumb.addEventListener('click', function() {
          current = i;
          update();
        });
        thumbsContainer.appendChild(thumb);
        thumbs.push(thumb);
      });
    }

    function update() {
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (slideCurrent) slideCurrent.textContent = current + 1;
      // Update thumbnails
      thumbs.forEach(function(t, i) {
        t.classList.toggle('active', i === current);
      });
    }

    window.slideNext = function() {
      current = (current + 1) % total;
      update();
    };

    window.slidePrev = function() {
      current = (current - 1 + total) % total;
      update();
    };
  }

  /* ---- Scroll indicator click ---- */
  var scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
      var hero = document.querySelector('.hero');
      if (hero) {
        var nextSection = hero.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

})();
