// VapeOve - HIFANCY B2B Website Scripts
// Mobile menu, scroll animations, language switch

// ===========================================
// AGE VERIFICATION GATE (site-wide, single place)
// Injected here so it runs immediately (before DOMContentLoaded) to avoid flash.
// Store consent in localStorage so returning visitors skip it.
// ===========================================
(function () {
  var storage = null;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  var KEY = 'vapeove-age-verified';
  var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // If the visitor was redirected here as "under 21", force re-show and clear consent.
  var params = new URLSearchParams(window.location.search || '');
  var deniedNow = params.get('agegate') === 'denied';
  if (deniedNow && storage) {
    try { storage.removeItem(KEY); } catch (e) {}
  }

  // Already verified within 30 days → skip gate entirely.
  if (storage && !deniedNow) {
    var stored = storage.getItem(KEY);
    if (stored) {
      var ts = parseInt(stored, 10);
      if (!isNaN(ts) && (Date.now() - ts) < THIRTY_DAYS) return;
    }
  }

  function buildOverlay() {
    var ov = document.createElement('div');
    ov.className = 'age-gate-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'age-gate-title');
    ov.innerHTML =
      '<div class="age-gate-modal" role="document">' +
      '  <div class="age-gate-icon"><span class="age-gate-age">21+</span></div>' +
      '  <h2 id="age-gate-title">Are you 21 or older?</h2>' +
      '  <p class="age-gate-sub">This website sells vaping products intended for adults only. You must be at least 21 years old to enter.</p>' +
      '  <div class="age-gate-actions">' +
      '    <button type="button" class="age-gate-btn accept" id="age-gate-accept">I am 21 or older — Enter</button>' +
      '    <button type="button" class="age-gate-btn deny" id="age-gate-deny">I am under 21 — Leave</button>' +
      '  </div>' +
      '  <p class="age-gate-foot">Nicotine is an addictive substance. This product is for adults only.</p>' +
      '</div>';

    // Self-contained inline styles so the gate renders correctly even before style.css loads.
    var css = document.createElement('style');
    css.textContent =
      '.age-gate-overlay{position:fixed;inset:0;z-index:999999;background:rgba(5,5,12,.94);display:flex;align-items:center;justify-content:center;padding:20px;transition:opacity .22s ease;}' +
      '.age-gate-overlay.age-gate-fade{opacity:0;pointer-events:none;}' +
      '.age-gate-modal{background:#0d0d1a;border:1px solid #2a2a4a;border-radius:16px;max-width:440px;width:100%;padding:36px 30px 28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);}' +
      '.age-gate-icon{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:linear-gradient(135deg,#00e5ff,#7c3aed);display:flex;align-items:center;justify-content:center;}' +
      '.age-gate-age{font-family:"Orbitron",sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:1px;}' +
      '.age-gate-modal h2{font-family:"Orbitron",sans-serif;font-size:20px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;}' +
      '.age-gate-sub{font-size:14px;color:#aab;line-height:1.6;margin:0 0 24px;}' +
      '.age-gate-actions{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}' +
      '.age-gate-btn{display:block;width:100%;padding:13px 16px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;border:none;transition:transform .1s ease,opacity .2s ease;}' +
      '.age-gate-btn:active{transform:scale(.98);}' +
      '.age-gate-btn.accept{background:#00e5ff;color:#031018;}' +
      '.age-gate-btn.accept:hover{opacity:.9;}' +
      '.age-gate-btn.deny{background:transparent;border:1px solid #3a3a5a;color:#98a;}' +
      '.age-gate-btn.deny:hover{background:#1a1a30;color:#cfd;}' +
      '.age-gate-foot{font-size:11px;color:#667;margin:0;line-height:1.5;}';

    ov.insertBefore(css, ov.firstChild);
    return ov;
  }

  var overlay = buildOverlay();
  var accepted = false;
  function blockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  function unblockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  function accept() {
    if (accepted) return;
    accepted = true;
    if (storage) { try { storage.setItem(KEY, String(Date.now())); } catch (e) {} }
    overlay.classList.add('age-gate-fade');
    setTimeout(function () { overlay.remove(); unblockScroll(); }, 220);
  }
  function deny() {
    // Clip consent and send to a neutral adult-safety page via a query flag.
    try {
      var url = window.location.href;
      var sep = url.indexOf('?') > -1 ? '&' : '?';
      window.location.href = url + sep + 'agegate=denied';
    } catch (e) {
      document.body.innerHTML = '<div style="color:#fff;text-align:center;padding:80px 20px;font-family:sans-serif;">You must be 21 or older to access this site.</div>';
    }
  }

  // main.js is loaded synchronously at the end of <body>, so the DOM is ready.
  blockScroll();
  document.body.appendChild(overlay);
  document.addEventListener('DOMContentLoaded', function () {
    var acceptBtn = document.getElementById('age-gate-accept');
    var denyBtn = document.getElementById('age-gate-deny');
    if (acceptBtn) acceptBtn.addEventListener('click', accept);
    if (denyBtn) denyBtn.addEventListener('click', deny);
  });
})();

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

  // P0-2: Map a (compressed) thumbnail src to its full-resolution original.
  // Thumbnails live at images/x.jpg / ../../images/x.jpg; originals live at images/full/x.jpg.
  // Returns the full path when a matching full image exists, otherwise the original src.
  function fullSrcFor(src) {
    if (!src) return src;
    var name = src.split('/').pop().split('?')[0];
    if (!name) return src;
    // Skip if it's already in full/ or an external URL.
    if (src.indexOf('images/full/') > -1 || src.indexOf('http') === 0) return src;
    var base = src.slice(0, src.lastIndexOf('/'));
    // Handle paths like "images/x.jpg", "../images/x.jpg", "../../images/x.jpg".
    return base + '/full/' + name;
  }

  function openLightbox(src, caption) {
    // P0-2: load the full-resolution original when opening the lightbox.
    lbImg.src = fullSrcFor(src) || src;
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
