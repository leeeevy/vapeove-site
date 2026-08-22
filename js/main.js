// VapeOve - HIFANCY B2B Website Scripts
// Mobile menu, scroll animations, language switch

// ===========================================
// GOOGLE ANALYTICS 4 (site-wide, single place)
// TODO: Replace G-XXXXXXXXXX with your real GA4 Measurement ID.
// Get it from GA4 Admin > Data Streams > Web > Measurement ID.
// ===========================================
(function () {
  const GA_ID = 'G-XXXXXXXXXX';
  if (GA_ID === 'G-XXXXXXXXXX') return; // not configured yet — skip silently
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID);
})();

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
    
    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Navbar scroll effect
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Fade-up animations on scroll
  const fadeElements = document.querySelectorAll('.fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  fadeElements.forEach(el => observer.observe(el));

  // Language switch (visual only - full i18n would need more files)
  const langSwitches = document.querySelectorAll('.lang-switch span');
  langSwitches.forEach(span => {
    span.addEventListener('click', function() {
      const lang = this.dataset.lang;
      if (!lang) return;
      
      // Update active state
      langSwitches.forEach(s => s.classList.remove('active'));
      this.classList.add('active');
      
      // Store preference
      localStorage.setItem('vapeove-lang', lang);
      
      // Simple content swap for demo (in production, use proper i18n)
      document.querySelectorAll('[data-en]').forEach(el => {
        if (el.dataset[lang]) {
          el.textContent = el.dataset[lang];
        }
      });
    });
  });

  // Load saved language preference
  const savedLang = localStorage.getItem('vapeove-lang');
  if (savedLang) {
    const langEl = document.querySelector(`.lang-switch span[data-lang="${savedLang}"]`);
    if (langEl) langEl.click();
  }

  // Form validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const required = form.querySelectorAll('[required]');
      let valid = true;
      
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#EF4444';
        } else {
          field.style.borderColor = '';
        }
      });
      
      if (!valid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      }
    });
  });

  // ===========================================
  // LIGHTBOX — click-to-zoom on any product image
  // ===========================================
  // Create lightbox element once
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <img src="" alt="Product image">
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || 'Product image';
    lbCap.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Wire up all product card images + detail page main image
  document.querySelectorAll('.product-image img, .gallery-main img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', e => {
      e.preventDefault();
      const card = img.closest('.product-card');
      const title = card ? card.querySelector('h3')?.textContent : (img.closest('.product-gallery')?.dataset.title || '');
      openLightbox(img.src, title);
    });
  });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  lbClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  // ===========================================
  // PRODUCT GALLERY — thumbnail switcher + slideshow
  // ===========================================
  document.querySelectorAll('.product-gallery').forEach(gallery => {
    const main = gallery.querySelector('.gallery-main img');
    const thumbs = gallery.querySelectorAll('.gallery-thumb');
    const prevBtn = gallery.querySelector('.gallery-prev');
    const nextBtn = gallery.querySelector('.gallery-next');
    const dotsContainer = gallery.querySelector('.gallery-dots');
    if (!main || !thumbs.length) return;

    let currentIdx = 0;
    let autoTimer = null;
    const AUTO_INTERVAL = 5000; // 5s per slide

    // Build dots from thumbs
    if (dotsContainer) {
      thumbs.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(idx) {
      if (idx < 0) idx = thumbs.length - 1;
      if (idx >= thumbs.length) idx = 0;
      currentIdx = idx;

      const tImg = thumbs[idx].querySelector('img');
      if (!tImg) return;

      // Fade swap
      main.style.opacity = '0';
      setTimeout(() => {
        main.src = tImg.src;
        main.dataset.fullSrc = tImg.src;
        main.style.opacity = '1';
      }, 200);

      // Update thumb active state
      thumbs.forEach(t => t.classList.remove('active'));
      thumbs[idx].classList.add('active');

      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
          d.classList.toggle('active', i === idx);
        });
      }

      // Reset auto timer
      resetAuto();
    }

    function next() { goTo(currentIdx + 1); }
    function prev() { goTo(currentIdx - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, AUTO_INTERVAL);
    }
    function stopAuto() { if (autoTimer) clearInterval(autoTimer); }
    function resetAuto() { stopAuto(); startAuto(); }

    // Thumb click
    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => goTo(idx));
    });

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

    // Pause on hover, resume on leave
    gallery.addEventListener('mouseenter', stopAuto);
    gallery.addEventListener('mouseleave', startAuto);

    // Keyboard support (left/right arrows when gallery is in viewport)
    gallery.setAttribute('tabindex', '0');
    gallery.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    main.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    main.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    }, { passive: true });

    // Click main image to open lightbox
    main.addEventListener('click', e => {
      e.preventDefault();
      const title = gallery.dataset.title || '';
      openLightbox(main.src, title);
    });

    // Start auto-rotation
    startAuto();
  });

  // ===========================================
  // INQUIRY FORM — JS-handled submit (Netlify + mailto fallback, no 404)
  // ===========================================
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Let the generic validation handler (above) show the alert for missing required fields.
      if (!inquiryForm.checkValidity()) return;

      const product = (inquiryForm.querySelector('[name=product]') || {}).value || 'unspecified';
      const country = (inquiryForm.querySelector('[name=country]') || {}).value || 'unspecified';
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          currency: 'EUR', value: 1, form_name: 'inquiry', product, country
        });
      }

      const data = new FormData(inquiryForm);
      data.append('form-name', 'inquiry');

      fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error('form-not-detected');
          showInquirySuccess(inquiryForm);
        })
        .catch(function () {
          mailtoFallback(inquiryForm);
        });
    });

    function showInquirySuccess(form) {
      const path = window.location.pathname;
      let msg;
      if (path.indexOf('/de') === 0) msg = 'Vielen Dank! Ihre Anfrage wurde gesendet. Wir antworten innerhalb von 1 Werktag.';
      else if (path.indexOf('/pl') === 0) msg = 'Dziękujemy! Twoje zapytanie zostało wysłane. Odpowiemy w ciągu 1 dnia roboczego.';
      else if (path.indexOf('/es') === 0) msg = '¡Gracias! Tu consulta ha sido enviada. Responderemos en 1 día hábil.';
      else msg = 'Thank you! Your inquiry has been sent. We will reply within 1 business day.';
      form.innerHTML =
        '<div style="text-align:center;padding:30px 10px;">' +
        '<div style="font-size:2.4rem;margin-bottom:12px;">✅</div>' +
        '<p style="font-size:1.05rem;color:var(--text);">' + msg + '</p>' +
        '<p style="margin-top:14px;color:var(--text-muted);">WhatsApp: <a href="https://wa.me/8618902484114" target="_blank" style="color:var(--cyan);">+86 189 0248 4114</a> · Telegram: <a href="https://t.me/vapeove" target="_blank" style="color:var(--cyan);">@vapeove</a></p>' +
        '</div>';
    }

    function mailtoFallback(form) {
      const d = new FormData(form);
      const fields = ['name', 'company', 'country', 'email', 'whatsapp', 'product', 'quantity', 'message'];
      let body = 'New Wholesale Inquiry\n\n';
      fields.forEach(function (f) {
        const v = d.get(f);
        if (v) body += (f.charAt(0).toUpperCase() + f.slice(1)) + ': ' + v + '\n';
      });
      const subject = 'Wholesale Inquiry - ' + (d.get('name') || '');
      showInquirySuccess(form);
      window.location.href = 'mailto:451802229@qq.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  }
});
