/* =========================================================
   M'foods — Héros interactif de l'accueil
   Changement de produit : couleurs, rotation 3D, ingrédients aspirés/relâchés
   ========================================================= */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const IMG = 'assets/img/';

  const PRODUCTS = {
    huile: {
      colors: { inner: '#f3a33c', mid: '#b3261a', outer: '#2e0705', accent: '#f5c518', accentText: '#2a0806' },
      img: IMG + 'bouteille.webp', alt: "Bouteille d'huile de piment M'foods", jar: false,
      items: { a: IMG + 'piment1.webp', b: IMG + 'piment2.webp', c: IMG + 'feuille1.webp' },
      title: ['Huile de', 'Piment'],
      tagline: 'Relève tous vos plats',
      desc: "Une huile pimentée aux saveurs authentiques, préparée avec des piments sélectionnés. Elle donne du caractère à vos sauces, grillades et marinades — 100 % naturelle.",
      chips: ['100 % naturel', 'Sans additifs', 'Savoureuse'],
      word: 'HUILE'
    },
    poudre: {
      colors: { inner: '#3f9a4b', mid: '#0f3d24', outer: '#03130a', accent: '#ff5a3c', accentText: '#ffffff' },
      img: IMG + 'poudre.webp', alt: "Pot de piment en poudre M'foods", jar: true,
      items: { a: IMG + 'tas-poudre.webp', b: IMG + 'piment-coupe.webp', c: IMG + 'feuille2.webp' },
      title: ['Piment en', 'Poudre'],
      tagline: 'Une épice au goût intense',
      desc: "Des piments séchés et finement moulus pour une épice franche et parfumée. Idéale pour toutes vos recettes — naturelle et sans colorant.",
      chips: ['Goût intense', 'Sans colorant', 'Naturel'],
      word: 'POUDRE'
    }
  };
  const ORDER = Object.keys(PRODUCTS);

  // Préchargement des autres produits une fois la page chargée (ne concurrence pas l'affichage initial)
  const preload = () => ORDER.forEach(k => {
    const p = PRODUCTS[k];
    [p.img, ...Object.values(p.items)].forEach(src => { const i = new Image(); i.decoding = 'async'; i.src = src; });
  });
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
  if (document.readyState === 'complete') idle(preload);
  else window.addEventListener('load', () => idle(preload), { once: true });

  const product = hero.querySelector('#product-model');
  const center = hero.querySelector('.hero-center');
  const layerFG = hero.querySelector('.layer--fg');
  const layerBG = hero.querySelector('.layer--bg');
  const layerLeaves = hero.querySelector('.layer--leaves');
  const items = [...hero.querySelectorAll('.fruit')];
  const leaves = [...hero.querySelectorAll('.leaf-item')];
  const cards = [...hero.querySelectorAll('.p-card')];
  const arrows = [...hero.querySelectorAll('.hero-arrow')];
  const titleL1 = hero.querySelector('.hero-title .t1');
  const titleL2 = hero.querySelector('.hero-title .t2');
  const tagline = hero.querySelector('.hero-tagline');
  const desc = hero.querySelector('.hero-desc');
  const chips = hero.querySelector('.hero-chips');
  const word = hero.querySelector('.hero-word');
  const count = hero.querySelector('.hero-count');

  let current = 'huile';
  let switching = false;
  let spin = 0;

  const chipIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  function writeCopy(key) {
    const p = PRODUCTS[key];
    titleL1.textContent = p.title[0];
    titleL2.textContent = p.title[1];
    tagline.textContent = p.tagline;
    desc.textContent = p.desc;
    chips.innerHTML = p.chips.map(c => `<span class="chip">${chipIcon}${c}</span>`).join('');
    if (word) word.textContent = p.word;
    if (count) count.textContent = `0${ORDER.indexOf(key) + 1} / 0${ORDER.length}`;
  }

  // État des ingrédients en mémoire (pas d'attributs data-* : évite les recalculs de style)
  const STATE = new WeakMap();
  const st = el => STATE.get(el);
  items.forEach(it => {
    STATE.set(it, { rx: 0, ry: 0, angle: parseFloat(it.dataset.rot || Math.random() * 360), baseX: 0, baseY: 0 });
  });

  function setActiveCard(key) {
    cards.forEach(c => {
      const on = c.dataset.product === key;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
  }

  function switchTo(key) {
    if (switching || key === current || !PRODUCTS[key]) return;
    const p = PRODUCTS[key];
    current = key;
    setActiveCard(key);

    if (!hasGsap || reduceMotion) {
      const r = document.documentElement.style;
      r.setProperty('--bg-inner', p.colors.inner); r.setProperty('--bg-mid', p.colors.mid);
      r.setProperty('--bg-outer', p.colors.outer); r.setProperty('--accent', p.colors.accent);
      r.setProperty('--accent-text', p.colors.accentText);
      product.src = p.img; product.alt = p.alt; product.classList.toggle('is-jar', p.jar);
      items.forEach(it => { it.src = p.items[it.dataset.variant]; });
      writeCopy(key);
      return;
    }

    switching = true;

    // 1. Couleurs (sur :root pour que la nav suive)
    gsap.to(document.documentElement, {
      '--bg-inner': p.colors.inner, '--bg-mid': p.colors.mid, '--bg-outer': p.colors.outer,
      '--accent': p.colors.accent, '--accent-text': p.colors.accentText,
      duration: 1.4, ease: 'power2.inOut'
    });

    // 2. Textes
    const copyEls = [titleL1, titleL2, tagline, desc, chips];
    gsap.timeline()
      .to(copyEls, { y: -24, opacity: 0, duration: .35, stagger: .04, ease: 'power2.in' })
      .add(() => writeCopy(key))
      .fromTo(copyEls, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'expo.out' });
    if (word) gsap.fromTo(word, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: 1.2, delay: .5, ease: 'expo.out' });

    // 3. Produit : rotation + flou
    const s = { val: 0, blur: 0 };
    const shadow = 'drop-shadow(0 40px 60px rgba(0,0,0,.45))';
    gsap.to(s, {
      val: 360, blur: 14, duration: .6, ease: 'power2.in',
      onUpdate: () => { spin = s.val; product.style.filter = `blur(${s.blur}px) ${shadow}`; },
      onComplete: () => {
        product.src = p.img; product.alt = p.alt;
        product.classList.toggle('is-jar', p.jar);
        gsap.to(s, {
          val: 720, blur: 0, duration: 1.5, ease: 'back.out(.7)',
          onUpdate: () => { spin = s.val; product.style.filter = `blur(${s.blur}px) ${shadow}`; },
          onComplete: () => { spin = 0; product.style.filter = shadow; }
        });
      }
    });

    // 4. Ingrédients aspirés vers le produit puis relâchés
    const cRect = center.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2;
    const cy = cRect.top + cRect.height / 2;
    let done = 0;
    items.forEach(it => {
      const r = it.getBoundingClientRect();
      const bx = st(it).baseX;
      const by = st(it).baseY;
      const rx = st(it).rx;
      const ry = st(it).ry;
      const curX = bx + rx, curY = by + ry;
      const tx = curX + (cx - (r.left + r.width / 2));
      const ty = curY + (cy - (r.top + r.height / 2));
      const a0 = st(it).angle;
      const nbx = (Math.random() - .5) * 160;
      const nby = (Math.random() - .5) * 160;

      gsap.set(it, { x: curX, y: curY, rotation: a0 });
      gsap.timeline()
        .to(it, {
          x: tx, y: ty, rotation: a0 + 60, scale: .1, opacity: 0, duration: .5, ease: 'power2.in',
          onComplete: () => { it.src = PRODUCTS[key].items[it.dataset.variant]; center.style.zIndex = 8; }
        })
        .to(it, { duration: .3 })
        .to(it, {
          x: nbx, y: nby, rotation: a0 + 120, scale: 1, opacity: 1, duration: .95, ease: 'back.out(1.5)',
          onStart: () => { center.style.zIndex = ''; },
          onComplete: () => {
            st(it).angle = a0 + 120; st(it).baseX = nbx; st(it).baseY = nby;
            st(it).rx = 0; st(it).ry = 0;
            gsap.set(it, { clearProps: 'transform' });
            if (++done === items.length) switching = false;
          }
        });
    });
  }

  cards.forEach(c => c.addEventListener('click', () => switchTo(c.dataset.product)));
  arrows.forEach(a => a.addEventListener('click', () => {
    const i = ORDER.indexOf(current);
    const step = a.dataset.dir === 'prev' ? -1 : 1;
    switchTo(ORDER[(i + step + ORDER.length) % ORDER.length]);
  }));
  // Clavier : flèches gauche/droite quand le héros est visible
  document.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (hero.getBoundingClientRect().bottom < 100) return;
    const i = ORDER.indexOf(current);
    switchTo(ORDER[(i + (e.key === 'ArrowLeft' ? -1 : 1) + ORDER.length) % ORDER.length]);
  });

  // Défilement automatique doux tant que l'utilisateur n'a pas interagi
  let autoTimer = null, interacted = false;
  const stopAuto = () => { interacted = true; clearInterval(autoTimer); };
  cards.concat(arrows).forEach(el => el.addEventListener('click', stopAuto, { once: true }));

  writeCopy(current);
  setActiveCard(current);

  if (reduceMotion || !hasGsap) return;

  /* ---------- Boucle d'animation ---------- */
  const mouse = { x: 0, y: 0, px: -9999, py: -9999 };
  const cur = { x: 0, y: 0 };
  let pointerActive = false;
  window.addEventListener('pointermove', e => {
    mouse.x = e.clientX / window.innerWidth - .5;
    mouse.y = e.clientY / window.innerHeight - .5;
    mouse.px = e.clientX; mouse.py = e.clientY;
    pointerActive = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { mouse.px = mouse.py = -9999; });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);

  // Positions « au repos » mises en cache : aucune lecture de mise en page dans la boucle
  let heroTop = 0, home = [];
  function measure() {
    heroTop = hero.getBoundingClientRect().top + window.scrollY;
    home = items.map(it => {
      const layer = it.offsetParent || hero;
      return { x: layer.offsetLeft + it.offsetLeft + it.offsetWidth / 2, y: layer.offsetTop + it.offsetTop + it.offsetHeight / 2, fg: layer === layerFG };
    });
  }
  measure();
  let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(measure, 150); }, { passive: true });
  window.addEventListener('load', measure, { once: true });

  const durs = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10];
  function tick() {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = performance.now() / 1000;

    // Sans souris (mobile) : léger balancement automatique
    const ax = pointerActive ? mouse.x : Math.sin(t * .5) * .25;
    const ay = pointerActive ? mouse.y : Math.cos(t * .4) * .15;
    cur.x += (ax - cur.x) * .05;
    cur.y += (ay - cur.y) * .05;

    const tiltY = cur.x * 40 + spin;
    const tiltX = cur.y * -18;
    product.style.transform = `translate(-50%, -50%) perspective(1600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(6deg)`;

    layerFG.style.transform = `translate3d(${cur.x * 60}px, ${cur.y * 60}px, 0)`;
    layerBG.style.transform = `translate3d(${cur.x * -30}px, ${cur.y * -30}px, 0)`;
    layerLeaves.style.transform = `translate3d(${cur.x * -15}px, ${cur.y * -15}px, 0)`;

    if (!switching) {
      const offY = heroTop - window.scrollY;
      const nearHero = pointerActive && mouse.py > offY - 50 && mouse.py < offY + hero.offsetHeight + 50;
      items.forEach((it, i) => {
        let trx = 0, tr_y = 0, speed = 1;
        let rx = st(it).rx;
        let ry = st(it).ry;
        const bx0 = st(it).baseX;
        const by0 = st(it).baseY;
        const h = home[i];
        const lx = h.fg ? cur.x * 60 : cur.x * -30, ly = h.fg ? cur.y * 60 : cur.y * -30;
        const dx = nearHero ? mouse.px - (h.x + lx + bx0 + rx) : 9999;
        const dy = nearHero ? mouse.py - (offY + h.y + ly + by0 + ry) : 9999;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 380) {
          const f = (380 - dist) / 380;
          trx = (dx / dist) * f * -80;
          tr_y = (dy / dist) * f * -80;
          speed = 1 + f * 5;
        }
        let ang = st(it).angle;
        const bx = bx0, by = by0;
        rx += (trx - rx) * .1; ry += (tr_y - ry) * .1;
        ang += .15 * speed * (i % 2 ? -1 : 1);
        st(it).rx = rx; st(it).ry = ry; st(it).angle = ang;
        const d = durs[i % durs.length];
        const ph = (t + i * .7) * (Math.PI * 2 / d);
        const fy = Math.sin(ph) * 15;
        const fa = Math.cos(ph) * 6;
        it.style.transform = `translate3d(${rx + bx}px, ${ry + by + fy}px, 0) rotate(${ang + fa}deg)`;
      });
    }

    leaves.forEach((lf, i) => {
      const d = 10 + i * 2;
      const ph = (t + i * 1.2) * (Math.PI * 2 / d);
      lf.style.transform = `${lf.dataset.flip ? 'scaleX(-1) ' : ''}translate3d(${Math.cos(ph * .5) * 15}px, ${Math.sin(ph) * 20}px, 0) rotate(${Math.sin(ph * .3) * 15 + (parseFloat(lf.dataset.rot) || 0)}deg)`;
    });
  }

  /* ---------- Entrée en scène ---------- */
  const words = hero.querySelectorAll('.hero-copy [data-intro]');
  gsap.set(words, { y: 40, opacity: 0 });
  gsap.set(product, { opacity: 0 });
  gsap.set(items, { scale: 0, opacity: 0 });
  gsap.set(hero.querySelectorAll('.hero-side > *, .hero-bottom, .hero-stamp'), { y: 30, opacity: 0 });

  function intro() {
    const s = { val: -540, blur: 18, o: 0, y: -120 };
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(s, {
      val: 0, blur: 0, o: 1, y: 0, duration: 1.8, ease: 'expo.out',
      onUpdate: () => {
        spin = s.val;
        product.style.opacity = s.o;
        product.style.filter = `blur(${s.blur}px) drop-shadow(0 40px 60px rgba(0,0,0,.45))`;
        center.style.marginTop = s.y + 'px';
      },
      onComplete: () => { spin = 0; center.style.marginTop = ''; }
    })
      .to(words, { y: 0, opacity: 1, duration: 1.1, stagger: .08 }, .15)
      .to(items, { scale: 1, opacity: 1, duration: 1.2, stagger: { each: .05, from: 'random' }, ease: 'back.out(1.6)' }, .4)
      .to(hero.querySelectorAll('.hero-side > *, .hero-bottom, .hero-stamp'), { y: 0, opacity: 1, duration: 1, stagger: .08 }, .7);

    // Lancement d'un auto-défilement si pas d'interaction
    autoTimer = setInterval(() => {
      if (interacted || document.hidden || !visible) return;
      const i = ORDER.indexOf(current);
      switchTo(ORDER[(i + 1) % ORDER.length]);
    }, 7000);
  }

  tick();
  let started = false;
  const go = () => { if (!started) { started = true; intro(); } };
  if (window.__mfReady) go();
  else document.addEventListener('mfoods:ready', go, { once: true });
  setTimeout(go, 1500);

  // Braises
  window.MFoodsEmbers && window.MFoodsEmbers(hero.querySelector('.embers'), 360);
})();
