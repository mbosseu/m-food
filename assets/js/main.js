/* =========================================================
   M'foods — scripts communs à toutes les pages
   ========================================================= */
(function () {
  const root = document.documentElement;
  const WA_NUMBER = '237672766288';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const curtain = document.querySelector('.curtain');

  if (!hasGsap || reduceMotion) root.classList.add('no-motion');
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Année du footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Rideau de transition ---------- */
  function curtainOut() {
    // Première visite : aucun rideau, le contenu s'affiche tout de suite
    if (!curtain || !root.classList.contains('is-nav')) return Promise.resolve();
    const panel = curtain.querySelector('.curtain-panel');
    const done = () => { root.classList.remove('is-nav'); curtain.style.visibility = 'hidden'; };
    if (!hasGsap || reduceMotion) { done(); return Promise.resolve(); }
    return new Promise(resolve => {
      gsap.timeline({ onComplete: () => { done(); resolve(); } })
        .set(curtain, { visibility: 'visible' })
        .fromTo(panel, { scaleY: 1 }, { scaleY: 0, transformOrigin: 'top', duration: .6, ease: 'expo.inOut' });
      // On libère les animations d'entrée pendant que le rideau s'ouvre
      setTimeout(resolve, 250);
    });
  }
  function curtainIn(href) {
    if (!curtain || !hasGsap || reduceMotion) { window.location.href = href; return; }
    try { sessionStorage.setItem('mf-nav', '1'); } catch (e) {}
    prefetch(href);
    const panel = curtain.querySelector('.curtain-panel');
    const logo = curtain.querySelector('.logo');
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .set(curtain, { visibility: 'visible', pointerEvents: 'auto' })
      .fromTo(panel, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: .5, ease: 'expo.inOut' })
      .fromTo(logo, { opacity: 0, y: 20, scale: 1.6 }, { opacity: 1, y: 0, duration: .25, ease: 'power2.out' }, '-=.15');
  }

  /* ---------- Préchargement des pages au survol / toucher ---------- */
  const prefetched = new Set();
  function prefetch(href) {
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || prefetched.has(url.pathname) || url.pathname === location.pathname) return;
      prefetched.add(url.pathname);
      const l = document.createElement('link');
      l.rel = 'prefetch'; l.href = url.pathname;
      document.head.appendChild(l);
    } catch (e) {}
  }
  const onIntent = e => {
    const a = e.target.closest && e.target.closest('a[href$=".html"]');
    if (a) prefetch(a.getAttribute('href'));
  };
  document.addEventListener('pointerover', onIntent, { passive: true });
  document.addEventListener('touchstart', onIntent, { passive: true });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download') ||
        /^(mailto:|tel:|https?:|whatsapp:)/i.test(href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) return;
    e.preventDefault();
    closeMenu();
    curtainIn(url.href);
  });
  // Retour arrière (bfcache) : on cache le rideau
  window.addEventListener('pageshow', e => {
    if (e.persisted && curtain) {
      const panel = curtain.querySelector('.curtain-panel');
      if (hasGsap) gsap.set(panel, { scaleY: 0 });
      curtain.style.visibility = 'hidden';
      curtain.style.pointerEvents = '';
      root.classList.remove('is-nav');
    }
  });

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav-burger');
  const menu = document.querySelector('.mobile-menu');
  const page = document.body.dataset.page;

  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
  });

  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && hasGsap && !reduceMotion) {
        gsap.fromTo(menu.querySelectorAll('.mm-link, .mm-foot > *'),
          { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: 'expo.out', delay: .15 });
      }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);
      const goingDown = y > lastY && y > 300;
      nav.classList.toggle('is-hidden', goingDown && !(menu && menu.classList.contains('is-open')));
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Découpage des titres en mots ---------- */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          // On ne coupe pas sur les espaces insécables (ex. « relève !»)
          const parts = child.textContent.split(/([ \t\n\r]+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span');
            outer.className = 'split-line';
            const inner = document.createElement('span');
            inner.textContent = p;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('split-line')) {
          walk(child);
        }
      });
    };
    walk(el);
    return el.querySelectorAll('.split-line > span');
  }

  /* ---------- Animations au défilement ---------- */
  function initReveals() {
    if (!hasGsap || reduceMotion || !window.ScrollTrigger) {
      document.querySelectorAll('[data-reveal]').forEach(el => { el.style.opacity = 1; });
      return;
    }

    // Les hauts de page (.hero / .page-hero) sont animés en CSS dès le premier affichage
    const ABOVE = '.hero, .page-hero';
    document.querySelectorAll('[data-split]').forEach(el => {
      if (el.closest(ABOVE)) return;
      const words = splitWords(el);
      if (el.hasAttribute('data-reveal')) el.style.opacity = 1;
      gsap.from(words, {
        yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .045,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    const presets = {
      up: { y: 60, opacity: 0 },
      fade: { opacity: 0 },
      left: { x: -70, opacity: 0 },
      right: { x: 70, opacity: 0 },
      scale: { scale: .86, opacity: 0 },
      rise: { y: 120, rotate: -4, opacity: 0 }
    };
    document.querySelectorAll('[data-reveal]:not([data-split])').forEach(el => {
      if (el.closest(ABOVE)) return;
      const from = presets[el.dataset.reveal] || presets.up;
      gsap.fromTo(el, from, {
        x: 0, y: 0, scale: 1, rotate: 0, opacity: 1,
        duration: 1.1, ease: 'expo.out', delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    document.querySelectorAll('[data-stagger]').forEach(group => {
      const items = group.children;
      gsap.set(items, { y: 70, opacity: 0 });
      ScrollTrigger.batch(items, {
        start: 'top 92%', once: true,
        onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .1 })
      });
    });

    // Parallaxe au défilement
    document.querySelectorAll('[data-speed]').forEach(el => {
      const s = parseFloat(el.dataset.speed);
      gsap.to(el, {
        yPercent: s * -30, ease: 'none',
        scrollTrigger: { trigger: el.closest('section, .section, header') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    document.querySelectorAll('[data-rotate]').forEach(el => {
      gsap.to(el, {
        rotate: parseFloat(el.dataset.rotate), ease: 'none',
        scrollTrigger: { trigger: el.closest('section, .section, header') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Compteurs
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(obj, {
        v: end, duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
      });
    });

    // Frise (page histoire)
    const tl = document.querySelector('.tl-progress');
    if (tl) {
      gsap.to(tl, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    }
  }

  /* ---------- Parallaxe souris (héros des pages) ---------- */
  function initMouseParallax() {
    const items = document.querySelectorAll('[data-depth]');
    if (!items.length || !hasGsap || reduceMotion) return;
    const setters = [...items].map(el => ({
      d: parseFloat(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
    }));
    window.addEventListener('pointermove', e => {
      const mx = e.clientX / window.innerWidth - .5;
      const my = e.clientY / window.innerHeight - .5;
      setters.forEach(s => { s.x(mx * s.d * 60); s.y(my * s.d * 60); });
    }, { passive: true });
    // Flottement doux continu
    items.forEach((el, i) => {
      const inner = el.querySelector('img') || el;
      if (inner === el) return;
      gsap.to(inner, { y: '+=16', rotate: '+=4', duration: 3 + i * .6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });
  }

  /* ---------- Braises (particules) ---------- */
  window.MFoodsEmbers = function (container, every = 380) {
    if (!container || reduceMotion) return;
    const mobile = window.innerWidth < 760;
    const spawn = () => {
      if (document.hidden) return;
      const e = document.createElement('span');
      e.className = 'ember';
      const size = Math.random() * 7 + 3;
      const dur = Math.random() * 6 + 6;
      e.style.width = e.style.height = size + 'px';
      e.style.left = Math.random() * 100 + '%';
      e.style.setProperty('--dx', (Math.random() - .5) * 220 + 'px');
      e.style.animationDuration = dur + 's';
      e.style.opacity = Math.random() * .5 + .4;
      container.appendChild(e);
      setTimeout(() => e.remove(), dur * 1000);
    };
    setInterval(spawn, mobile ? every * 1.3 : every);
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 120);
  };
  document.querySelectorAll('.embers[data-auto]').forEach(c => window.MFoodsEmbers(c, 520));

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
      if (hasGsap && !reduceMotion) {
        gsap.to(a, { height: open ? 'auto' : 0, duration: .6, ease: 'expo.out' });
      } else {
        a.style.height = open ? 'auto' : '0';
      }
    });
  });

  /* ---------- Formulaires → WhatsApp ---------- */
  document.querySelectorAll('form[data-wa]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.field');
        const valid = input.value.trim() !== '' && (input.type !== 'tel' || /^[\d\s+().-]{8,}$/.test(input.value));
        field && field.classList.toggle('is-error', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        const first = form.querySelector('.is-error input, .is-error select');
        first && first.focus();
        return;
      }
      const data = new FormData(form);
      const lines = [];
      const intro = form.dataset.wa === 'revendeur'
        ? "Bonjour M'foods ! Je souhaite devenir revendeur de vos produits."
        : "Bonjour M'foods !";
      lines.push(intro, '');
      const labels = {
        nom: 'Nom', ville: 'Ville / Quartier', commerce: 'Type de commerce', telephone: 'Téléphone',
        produits: 'Produits souhaités', message: 'Message'
      };
      const produits = data.getAll('produits');
      for (const [k, label] of Object.entries(labels)) {
        if (k === 'produits') { if (produits.length) lines.push(`• ${label} : ${produits.join(', ')}`); continue; }
        const v = (data.get(k) || '').toString().trim();
        if (v) lines.push(`• ${label} : ${v}`);
      }
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
    });
    form.querySelectorAll('input, select').forEach(i => i.addEventListener('input', () => {
      const f = i.closest('.field'); f && f.classList.remove('is-error');
    }));
  });

  /* ---------- Démarrage ---------- */
  function start() {
    curtainOut().then(() => {
      if (window.__mfReady) return;
      window.__mfReady = true;
      document.dispatchEvent(new CustomEvent('mfoods:ready'));
    });
    initReveals();
    initMouseParallax();
    if (window.ScrollTrigger) window.addEventListener('load', () => ScrollTrigger.refresh());
  }
  // Scripts en « defer » : on attend que tous soient exécutés (hero.js compris)
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', start);
  else start();

  // Sécurité : si quelque chose bloque, on retire le rideau
  setTimeout(() => {
    if (curtain && root.classList.contains('is-nav') && !curtain.style.pointerEvents) {
      root.classList.remove('is-nav');
      curtain.style.visibility = 'hidden';
    }
  }, 3000);
})();
