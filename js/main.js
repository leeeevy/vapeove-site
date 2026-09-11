// VapeOve - HIFANCY B2B Website Scripts
// Mobile menu, scroll animations, language switch

// ===========================================
// AGE VERIFICATION GATE (site-wide, single place)
// Injected here so it runs immediately (before DOMContentLoaded) to avoid flash.
// Store consent in localStorage so returning visitors skip it.
//
// Threshold: 18+. This site's market is the EU (DE / PL / ES), where the legal
// purchase age for vaping products is 18. The US "Tobacco 21" rule does not
// apply here — vapeove.com does not sell into the US.
// ===========================================
(function () {
  var storage = null;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  var KEY = 'vapeove-age-verified';
  var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Path-based language detection — mirrors the pageLang helper used by the GA4 block.
  // Matches the path SEGMENT only: a root file like /ploox-hookah.html must stay EN,
  // so a bare startsWith('/pl') would be wrong.
  var LANG = (function () {
    var m = /^\/(de|pl|es)(?:\/|$)/.exec(window.location.pathname);
    return m ? m[1] : 'en';
  })();

  var T = {
    en: {
      age: '18+',
      title: 'Are you 18 or older?',
      sub: 'This website sells vaping products intended for adults only. You must be at least 18 years old to enter.',
      accept: 'I am 18 or older — Enter',
      deny: 'I am under 18 — Leave',
      foot: 'Nicotine is an addictive substance. This product is for adults only.',
      blocked: 'You must be 18 or older to access this site.'
    },
    de: {
      age: '18+',
      title: 'Sind Sie 18 Jahre oder älter?',
      sub: 'Diese Website verkauft Produkte zum Dampfen, die ausschließlich für Erwachsene bestimmt sind. Sie müssen mindestens 18 Jahre alt sein, um fortzufahren.',
      accept: 'Ich bin 18 Jahre oder älter — Eintreten',
      deny: 'Ich bin unter 18 — Verlassen',
      foot: 'Nikotin ist eine süchtig machende Substanz. Dieses Produkt ist nur für Erwachsene bestimmt.',
      blocked: 'Sie müssen mindestens 18 Jahre alt sein, um auf diese Website zuzugreifen.'
    },
    pl: {
      age: '18+',
      title: 'Czy masz ukończone 18 lat?',
      sub: 'Ta strona sprzedaje produkty do wapowania przeznaczone wyłącznie dla osób dorosłych. Aby wejść, musisz mieć ukończone 18 lat.',
      accept: 'Mam ukończone 18 lat — Wejdź',
      deny: 'Nie mam 18 lat — Wyjdź',
      foot: 'Nikotyna jest substancją uzależniającą. Ten produkt jest przeznaczony wyłącznie dla osób dorosłych.',
      blocked: 'Dostęp do tej strony mają wyłącznie osoby, które ukończyły 18 lat.'
    },
    es: {
      age: '18+',
      title: '¿Tienes 18 años o más?',
      sub: 'Este sitio web vende productos de vapeo destinados únicamente a adultos. Debes tener al menos 18 años para entrar.',
      accept: 'Tengo 18 años o más — Entrar',
      deny: 'Tengo menos de 18 — Salir',
      foot: 'La nicotina es una sustancia adictiva. Este producto es solo para adultos.',
      blocked: 'Debes tener al menos 18 años para acceder a este sitio web.'
    }
  };
  var t = T[LANG] || T.en;

  // If the visitor was redirected here as "under 18", force re-show and clear consent.
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
    ov.setAttribute('lang', LANG);
    ov.innerHTML =
      '<div class="age-gate-modal" role="document">' +
      '  <div class="age-gate-icon"><span class="age-gate-age">' + t.age + '</span></div>' +
      '  <h2 id="age-gate-title">' + t.title + '</h2>' +
      '  <p class="age-gate-sub">' + t.sub + '</p>' +
      '  <div class="age-gate-actions">' +
      '    <button type="button" class="age-gate-btn accept" id="age-gate-accept">' + t.accept + '</button>' +
      '    <button type="button" class="age-gate-btn deny" id="age-gate-deny">' + t.deny + '</button>' +
      '  </div>' +
      '  <p class="age-gate-foot">' + t.foot + '</p>' +
      '</div>';

    // Self-contained inline styles so the gate renders correctly even before style.css loads.
    // The scrim is intentionally light (no blur): page content stays readable behind it.
    var css = document.createElement('style');
    css.textContent =
      '.age-gate-overlay{position:fixed;inset:0;z-index:999999;background:rgba(5,5,12,.62);display:flex;align-items:center;justify-content:center;padding:20px;transition:opacity .22s ease;}' +
      '.age-gate-overlay.age-gate-fade{opacity:0;pointer-events:none;}' +
      '.age-gate-modal{background:#0d0d1a;border:1px solid #2a2a4a;border-radius:16px;max-width:440px;width:100%;padding:36px 30px 28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);}' +
      '.age-gate-icon{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:linear-gradient(135deg,#00e5ff,#7c3aed);display:flex;align-items:center;justify-content:center;}' +
      '.age-gate-age{font-family:"Sora",system-ui,sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:1px;}' +
      '.age-gate-modal h2{font-family:"Sora",system-ui,sans-serif;font-size:20px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;}' +
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
      document.body.innerHTML = '<div style="color:#fff;text-align:center;padding:80px 20px;font-family:sans-serif;">' + t.blocked + '</div>';
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
// BROWSER LANGUAGE AUTO-DETECT (SEO-safe, progressive)
// Only runs on the English root page (/) and only when:
//   - the visitor has NOT already chosen a language (localStorage), AND
//   - the browser's primary UI language is one of our 4 languages (default EN).
// It performs a soft client-side redirect (location.replace) to the language
// sub-path. Because every language page has its own rel=canonical + hreflang,
// the crawl graph stays intact: crawlers generally present en-US or no language,
// so they stay on the English default. This is a UX enhancement, NOT a URL
// rewrite that alters what crawlers index — risk to SEO is negligible.
// ===========================================
(function () {
  try {
    // Only act on English root page.
    var path = window.location.pathname.replace(/\/+$/, '');
    if (path !== '' && path !== '/' && path !== '/index') return;
  } catch (e) { return; }

  // Respect a previously chosen language (set by the language switcher).
  var chosen = null;
  try { chosen = window.localStorage.getItem('vapeove-lang'); } catch (e) {}
  if (chosen) return;

  // Determine preferred language from the browser.
  var lang = (navigator.language || navigator.languages && navigator.languages[0] || 'en').toLowerCase();
  var map = { de: 'de', 'de-de': 'de', 'de-at': 'de', 'de-ch': 'de',
              pl: 'pl', 'pl-pl': 'pl', 'es': 'es', 'es-es': 'es', 'es-mx': 'es' };
  var target = map[lang] || null;

  // If the primary language isn't one of ours, keep English (default). No redirect.
  if (target === 'en') return;

  // Soft redirect so the back-button / referrer stops here on re-entry.
  if (target) {
    // Skip redirect for privacy-sensitive contexts where a page nav is undesirable.
    try {
      window.location.replace('/' + target + '/');
    } catch (e) {}
  }
})();
(function () {
  const GA_ID = 'G-FHYV8R12Q7';
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

// ===========================================
// GA4 EVENT TRACKING — browsing & inquiry funnel
// Each helper is a no-op when gtag isn't loaded (e.g. before GA script arrives).
// Product identity is derived from the page itself (h1 / og:title / data-title),
// so this works across all 4 language subdirs without per-page code.
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
  var pageLang = (function () {
    // Match the path SEGMENT, not a bare prefix: /ploox-hookah.html is an EN page.
    var m = /^\/(de|pl|es)(?:\/|$)/.exec(window.location.pathname);
    return m ? m[1] : 'en';
  })();
  var currency = 'EUR';

  // Track events only when GA4 is actually configured + reachable.
  function track() {
    if (typeof window.gtag !== 'function') return;
    try { window.gtag.apply(null, Array.prototype.slice.call(arguments)); } catch (e) {}
  }

  // Resolve the current page's product name (live on product detail pages).
  function productName() {
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    var og = document.querySelector('meta[property="og:title"]');
    if (og && og.content && og.content.indexOf('VAPEOVE') === -1) return og.content.trim();
    return (document.title || '').replace(/\s*\|\s*VAPEOVE.*$/i, '').trim() || document.title;
  }

  function isProductPage() {
    return /\/product-/.test(window.location.pathname);
  }
  function isProductListPage() {
    return /\/products$|\/products\.html$|\/products\//.test(window.location.pathname);
  }

  // --- 1) view_item_list: fired on products listing + homepage self-serving ---
  if (isProductListPage()) {
    track('event', 'view_item_list', {
      currency: currency,
      item_list_name: pageLang + '_products',
      items: Array.prototype.slice.call(document.querySelectorAll('.product-card')).map(function (card) {
        var title = card.querySelector('h3');
        var link = card.querySelector('a');
        return {
          item_name: title ? title.textContent.trim() : '',
          item_id: link ? link.getAttribute('href').split('/').pop().replace('.html', '') : '',
          item_category: 'disposable_vape'
        };
      })
    });
  }

  // --- 2) view_item: product detail page ---
  if (isProductPage()) {
    var itemId = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'unknown';
    track('event', 'view_item', {
      currency: currency,
      value: 1,
      items: [{ item_id: itemId, item_name: productName(), item_category: 'disposable_vape' }]
    });
  }

  // --- 3) select_item: clicking a product card → treat as item selection ---
  document.querySelectorAll('.product-card a').forEach(function (link) {
    link.addEventListener('click', function () {
      var card = link.closest('.product-card');
      var title = card && card.querySelector('h3');
      track('event', 'select_item', {
        currency: currency,
        items: [{
          item_name: title ? title.textContent.trim() : '',
          item_id: link.getAttribute('href').split('/').pop().replace('.html', ''),
          item_category: 'disposable_vape'
        }]
      });
    });
  });

  // --- 4) begin_checkout: user focuses an inquiry/contact form (wholesale intent) ---
  var leadForms = document.querySelectorAll('#inquiry-form, form[data-inquiry], form[data-lead]');
  leadForms.forEach(function (form) {
    form.addEventListener('focusin', function (e) {
      if (form.dataset.sent) return;
      form.dataset.sent = '1';
      track('event', 'begin_checkout', { currency: currency, form_name: form.getAttribute('id') || 'lead' });
    });
  });

  // --- 5) outbound_click: WhatsApp / mailto links (high-intent contact) ---
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var isWhatsApp = /wa\.me|whatsapp/i.test(href);
    var isEmail = /^mailto:/i.test(href);
    if (isWhatsApp || isEmail) {
      var channel = isWhatsApp ? 'whatsapp' : 'email';
      track('event', 'outbound_click', {
        currency: currency,
        link_channel: channel,
        link_domain: a.hostname || '',
        form_name: a.closest('form') ? (a.closest('form').id || 'lead') : ''
      });
    }
  });

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
      const formType = isProductPage() ? 'product_inquiry' : 'contact';
      track('event', 'generate_lead', {
        currency: 'EUR',
        value: 1,
        form_name: 'inquiry',
        form_type: formType,
        product: product,
        country: country,
        page_language: pageLang
      });

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
      const langMatch = /^\/(de|pl|es)(?:\/|$)/.exec(path);
      const pageLang = langMatch ? langMatch[1] : 'en';
      let msg;
      if (pageLang === 'de') msg = 'Vielen Dank! Ihre Anfrage wurde gesendet. Wir antworten innerhalb von 1 Werktag.';
      else if (pageLang === 'pl') msg = 'Dziękujemy! Twoje zapytanie zostało wysłane. Odpowiemy w ciągu 1 dnia roboczego.';
      else if (pageLang === 'es') msg = '¡Gracias! Tu consulta ha sido enviada. Responderemos en 1 día hábil.';
      else msg = 'Thank you! Your inquiry has been sent. We will reply within 1 business day.';
      form.innerHTML =
        '<div style="text-align:center;padding:30px 10px;">' +
        '<div style="font-size:2.4rem;margin-bottom:12px;">✅</div>' +
        '<p style="font-size:1.05rem;color:var(--text);">' + msg + '</p>' +
        '<p style="margin-top:14px;color:var(--text-muted);">WhatsApp: <a href="https://web.whatsapp.com/send?phone=8618002544151" target="_blank" style="color:var(--cyan);">+86 180 0254 4151</a></p>' +
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
      window.location.href = 'mailto:qjlw19970817@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  }

  // ===========================================
  // HERO BRAND CAROUSEL — auto-rotating featured brands
  // ===========================================
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll('.hc-slide');
    const dotsWrap = heroCarousel.querySelector('.hc-dots');
    const prevBtn = heroCarousel.querySelector('.hc-prev');
    const nextBtn = heroCarousel.querySelector('.hc-next');
    let current = 0;
    let heroTimer = null;
    const HERO_INTERVAL = 5000;

    // Build dots
    slides.forEach(function (_, i) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', function () { goHero(i); });
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.dot');

    function goHero(idx) {
      if (idx < 0) idx = slides.length - 1;
      if (idx >= slides.length) idx = 0;
      current = idx;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      resetHero();
    }
    function nextHero() { goHero(current + 1); }
    function prevHero() { goHero(current - 1); }
    function startHero() { stopHero(); heroTimer = setInterval(nextHero, HERO_INTERVAL); }
    function stopHero() { if (heroTimer) clearInterval(heroTimer); }
    function resetHero() { stopHero(); startHero(); }

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prevHero(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); nextHero(); });
    heroCarousel.addEventListener('mouseenter', stopHero);
    heroCarousel.addEventListener('mouseleave', startHero);

    // Start auto-rotate
    startHero();
  }
});

// ===========================================
// WHATSAPP LINK — MOBILE FALLBACK
// Markup ships with the web.whatsapp.com form, which is what desktop needs: it goes
// straight into WhatsApp Web instead of showing wa.me's "download the app" interstitial.
// On phones that form is worse — it makes the user sign in to WhatsApp Web instead of
// opening the app they already have. So on mobile we rewrite it back to wa.me, which
// hands off to the native app directly.
// ===========================================
(function () {
  var WEB_PREFIX = 'https://web.whatsapp.com/send?phone=';
  var ME_PREFIX = 'https://wa.me/';

  var ua = navigator.userAgent || '';
  var isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)
    // iPadOS 13+ reports itself as "Macintosh", so fall back to touch capability.
    || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));

  if (!isMobile) return;

  function rewrite() {
    var links = document.querySelectorAll('a[href^="' + WEB_PREFIX + '"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      // web.whatsapp.com/send?phone=8618002544151&text=Hi  →  wa.me/8618002544151?text=Hi
      var rest = a.getAttribute('href').slice(WEB_PREFIX.length);
      var q = rest.indexOf('&');
      var phone = q === -1 ? rest : rest.slice(0, q);
      var text = q === -1 ? '' : rest.slice(q + 1); // already starts with "text="
      a.setAttribute('href', ME_PREFIX + phone + (text ? '?' + text : ''));
      // WhatsApp handles its own new-tab behaviour; keep the markup's target intact.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewrite);
  } else {
    rewrite();
  }
})();
