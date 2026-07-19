import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pointerIsFine = () => window.matchMedia('(pointer: fine)').matches;

let lenis: Lenis | null = null;

const PRELOADER_KEY = 'portfolio-preloader-shown';

// État de module partagé : un événement DOM fire-and-forget perdrait son
// signal si le préloader se termine de façon synchrone (reduced-motion)
// avant que le Hero ait eu le temps de s'abonner. Une promesse mémorisée
// garantit la livraison quel que soit l'ordre d'exécution des scripts.
let preloaderResolved = false;
let resolvePreloader: () => void;
const preloaderDone = new Promise<void>((resolve) => {
  resolvePreloader = resolve;
});

export function onPreloaderDone(callback: () => void) {
  if (preloaderResolved) callback();
  else preloaderDone.then(callback);
}

/** Dessine l'hexagone du préloader (~1s) puis lève le rideau. Une fois par session. */
export function initPreloader() {
  const root = document.querySelector<HTMLElement>('[data-preloader]');

  const alreadyShown = sessionStorage.getItem(PRELOADER_KEY) === '1';
  sessionStorage.setItem(PRELOADER_KEY, '1');

  const finish = () => {
    root?.remove();
    document.documentElement.classList.remove('overflow-hidden');
    preloaderResolved = true;
    resolvePreloader();
  };

  if (!root || alreadyShown || prefersReducedMotion()) {
    finish();
    return;
  }

  const path = root.querySelector<SVGPathElement>('[data-preloader-hex]');
  const tl = gsap.timeline({ onComplete: finish });

  if (path) {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    tl.to(path, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' });
  }
  tl.to(root, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '+=0.1');
}

/** Machine à écrire maison : tape, marque une pause, efface, passe au mot suivant. */
export function initTypewriter(
  el: HTMLElement,
  words: string[],
  { typingSpeed = 65, deletingSpeed = 35, pause = 1800 } = {}
) {
  if (!words.length) return;

  if (prefersReducedMotion()) {
    el.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    // Navigation client-side (ClientRouter) : si cet élément a quitté le DOM
    // entre-temps, on arrête la chaîne de setTimeout plutôt que d'écrire
    // dans le vide indéfiniment.
    if (!el.isConnected) return;

    const word = words[wordIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(tick, pause);
        return;
      }
      setTimeout(tick, typingSpeed);
    } else {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, typingSpeed);
        return;
      }
      setTimeout(tick, deletingSpeed);
    }
  };

  setTimeout(tick, typingSpeed);
}

/** Timeline d'entrée du hero en stagger, jouée une fois le préloader terminé. */
export function initHeroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const targets = {
    eyebrow: hero.querySelector('[data-hero-eyebrow]'),
    name: hero.querySelector('[data-hero-name]'),
    role: hero.querySelector('[data-hero-role]'),
    tagline: hero.querySelector('[data-hero-tagline]'),
    cta: hero.querySelector('[data-hero-cta]'),
    hex: hero.querySelector('[data-hero-hex-glow]'),
  };

  const start = () => {
    if (prefersReducedMotion()) {
      gsap.set(hero, { autoAlpha: 1 });
      if (targets.hex) gsap.set(targets.hex, { opacity: 1 });
      return;
    }

    gsap.set(hero, { autoAlpha: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (targets.eyebrow) tl.from(targets.eyebrow, { y: 16, opacity: 0, duration: 0.5 });
    if (targets.name)
      tl.from(
        targets.name,
        { clipPath: 'inset(0 100% 0 0)', duration: 0.7, ease: 'power4.out' },
        '-=0.2'
      );
    if (targets.role) tl.from(targets.role, { y: 12, opacity: 0, duration: 0.4 }, '-=0.3');
    if (targets.tagline) tl.from(targets.tagline, { y: 12, opacity: 0, duration: 0.5 }, '-=0.2');
    if (targets.cta) tl.from(targets.cta, { y: 12, opacity: 0, duration: 0.5 }, '-=0.3');
    if (targets.hex) tl.to(targets.hex, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.5');
  };

  onPreloaderDone(start);
}

/** Léger tilt 3D au mouvement de la souris (desktop uniquement) — portrait, cartes projets… */
export function initCardTilt(selector: string, max = 8) {
  if (prefersReducedMotion() || !pointerIsFine()) return;

  document.querySelectorAll<HTMLElement>(selector).forEach((wrap) => {
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(wrap, {
        rotateY: px * max,
        rotateX: -py * max,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 700,
      });
    };

    const onLeave = () => {
      gsap.to(wrap, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
  });
}

/** Filtres de la grille projets avec réorganisation animée douce (technique FLIP). */
export function initProjectFilters() {
  const grid = document.querySelector<HTMLElement>('[data-projects-grid]');
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  if (!grid || !buttons.length) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-project-card]'));

  const applyFilter = (filter: string) => {
    const first = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));

    cards.forEach((card) => {
      const tags: string[] = JSON.parse(card.dataset.tags ?? '[]');
      const show = filter === 'Tous' || tags.includes(filter);
      // style inline plutôt qu'une classe : garantit de gagner sur les
      // utilitaires Tailwind (ex. .flex) posés sur le même élément, quel
      // que soit l'ordre de bundling des feuilles de style.
      card.style.display = show ? '' : 'none';
    });

    if (prefersReducedMotion()) return;

    requestAnimationFrame(() => {
      cards.forEach((card) => {
        if (card.style.display === 'none') return;
        const from = first.get(card);
        const to = card.getBoundingClientRect();
        if (!from) return;
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (dx || dy) {
          gsap.fromTo(card, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
        }
      });
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter ?? 'Tous');
    });
  });
}

/** Soumission Netlify Forms en AJAX, avec états succès/erreur explicites. */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const successEl = form.querySelector<HTMLElement>('[data-form-success]');
  const errorEl = form.querySelector<HTMLElement>('[data-form-error]');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const encode = (data: Record<string, string>) =>
    Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');
    submitBtn?.setAttribute('disabled', 'true');

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Statut HTTP ${res.status}`);
        form.reset();
        successEl?.classList.remove('hidden');
      })
      .catch(() => {
        errorEl?.classList.remove('hidden');
      })
      .finally(() => {
        submitBtn?.removeAttribute('disabled');
      });
  });
}

/** Compteurs de stats animés, déclenchés à l'entrée dans le viewport. */
export function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-counter]');
  if (!counters.length) return;

  const animate = (el: HTMLElement) => {
    const target = Number(el.dataset.counter);
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion()) {
      el.textContent = target.toLocaleString('fr-FR');
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString('fr-FR');
      },
    });
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/**
 * Mise en place de la navbar (scroll compact + menu mobile) — la navbar est
 * persistée entre les pages (transition:persist), donc cette fonction ne
 * doit s'exécuter qu'une seule fois pour toute la session de navigation.
 */
export function initNavbarChrome() {
  const nav = document.querySelector<HTMLElement>('[data-navbar]');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateNavbarActiveLink);

  const toggle = document.querySelector<HTMLElement>('[data-nav-toggle]');
  const mobileMenu = document.querySelector<HTMLElement>('[data-nav-mobile]');
  if (toggle && mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll('[data-nav-link]');
    const iconOpen = toggle.querySelector('[data-icon-open]');
    const iconClose = toggle.querySelector('[data-icon-close]');
    const open = () => {
      mobileMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fermer le menu');
      iconOpen?.classList.add('hidden');
      iconClose?.classList.remove('hidden');
      document.documentElement.classList.add('overflow-hidden');
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          mobileLinks,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        );
      }
    };
    const close = () => {
      mobileMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
      iconOpen?.classList.remove('hidden');
      iconClose?.classList.add('hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? close() : open();
    });
    mobileMenu.querySelectorAll('[data-nav-link]').forEach((l) => l.addEventListener('click', close));
  }
}

/**
 * Met à jour le lien actif de la navbar en fonction de la page courante.
 * Appelée à chaque `astro:page-load` (chargement initial + chaque
 * transition), puisque la page courante change à chaque navigation.
 */
export function updateNavbarActiveLink() {
  const nav = document.querySelector<HTMLElement>('[data-navbar]');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const indicator = nav.querySelector<HTMLElement>('[data-nav-indicator]');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

  const moveIndicator = (link: HTMLAnchorElement) => {
    if (!indicator) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  let activeLink: HTMLAnchorElement | undefined;
  links.forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    const active =
      linkPath === '/' ? currentPath === '/' : currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
    link.classList.toggle('is-active', active);
    if (active) activeLink = link;
  });

  if (activeLink) moveIndicator(activeLink);

  // Menu plein écran mobile : miroir du même état actif.
  document.querySelectorAll<HTMLAnchorElement>('[data-nav-mobile] [data-nav-link]').forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    const active =
      linkPath === '/' ? currentPath === '/' : currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
    link.classList.toggle('is-active', active);
  });
}

/**
 * Défilement fluide global (Lenis), synchronisé avec ScrollTrigger. Bascule
 * sur le scroll natif en reduced-motion. Lenis pilote le scroll pour toute
 * la session de navigation : cette fonction est idempotente (un seul
 * ticker/instance), à appeler une fois pour toutes les pages.
 */
export function initSmoothScroll() {
  if (prefersReducedMotion() || lenis) return;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  lenis.on('scroll', ScrollTrigger.update);
}

/** Détruit les ScrollTrigger de la page quittée avant qu'une transition ne remplace le DOM. */
export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/** Reveals au scroll : y:32→0 + fade, stagger léger, une fois par section — recréés à chaque page. */
export function initScrollReveals() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.reveal-section').forEach((section) => {
    const items = Array.from(section.querySelectorAll<HTMLElement>(':scope > div > *'));
    if (!items.length) return;

    gsap.set(items, { y: 32, opacity: 0 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(items, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
      },
    });
  });
}

/**
 * Curseur personnalisé (point + anneau) — desktop uniquement, jamais en
 * reduced-motion ni tactile. Le curseur est persisté entre les pages
 * (transition:persist) : idempotent, à initialiser une seule fois.
 */
export function initCustomCursor() {
  if (prefersReducedMotion() || !pointerIsFine()) return;
  if (document.documentElement.classList.contains('has-custom-cursor')) return;

  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!dot || !ring) return;

  document.documentElement.classList.add('has-custom-cursor');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 1 });

  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    ringX(e.clientX);
    ringY(e.clientY);
    dotX(e.clientX);
    dotY(e.clientY);
  });

  const interactiveSelector = 'a, button, input, textarea, select, [data-magnetic]';
  document.addEventListener('mouseover', (e) => {
    if ((e.target as HTMLElement).closest?.(interactiveSelector)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if ((e.target as HTMLElement).closest?.(interactiveSelector)) ring.classList.remove('is-active');
  });
}

/** Boutons magnétiques : les CTA principaux se laissent légèrement attirer par le curseur. */
export function initMagneticButtons() {
  if (prefersReducedMotion() || !pointerIsFine()) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    const strength = 0.35;
    const moveX = gsap.quickTo(btn, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.3, ease: 'power3.out' });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      moveX((e.clientX - (rect.left + rect.width / 2)) * strength);
      moveY((e.clientY - (rect.top + rect.height / 2)) * strength);
    });

    btn.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

/**
 * Bulle de Louise, persistée entre les pages (transition:persist) — à
 * n'attacher qu'une seule fois par session, comme la navbar et le curseur.
 * Ne fait qu'écouter le clic : la logique du panneau (rendu des messages,
 * appel de la fonction Netlify…) vit dans scripts/chat-widget.ts et n'est
 * importée qu'à la première ouverture, pour ne rien ajouter au JS initial.
 */
export function initChatWidget() {
  const root = document.querySelector<HTMLElement>('[data-chat-widget]');
  const toggle = root?.querySelector<HTMLElement>('[data-chat-toggle]');
  if (!root || !toggle) return;

  let api: { toggle: () => void } | null = null;
  let loading: Promise<{ toggle: () => void }> | null = null;

  const ensureLoaded = () => {
    if (api) return Promise.resolve(api);
    if (!loading) {
      loading = import('./chat-widget').then(({ mountChatWidget }) => {
        api = mountChatWidget(root);
        return api;
      });
    }
    return loading;
  };

  toggle.addEventListener('click', () => {
    ensureLoaded().then((widget) => widget.toggle());
  });
}

const CHAT_SEEN_KEY = 'portfolio-louise-seen';

/**
 * Animation d'attention sur la bulle de Louise (battement de cœur ± onde
 * radar + badge d'invitation) — cycle de vie géré ici via de simples
 * temporisations (setTimeout/setInterval), jamais via une boucle rAF : le
 * battement lui-même reste un @keyframes CSS pur (voir ChatWidget.astro),
 * on ne fait ici que mettre son animation-play-state en pause/lecture.
 * Coupée pour toute la session dès la première ouverture du chat
 * (sessionStorage), et jamais démarrée du tout en prefers-reduced-motion.
 */
export function initChatAttention() {
  const root = document.querySelector<HTMLElement>('[data-chat-widget]');
  const bubble = root?.querySelector<HTMLElement>('[data-chat-toggle]');
  if (!root || !bubble) return;

  const alreadySeen = sessionStorage.getItem(CHAT_SEEN_KEY) === '1';
  if (alreadySeen) return;

  const markSeen = () => sessionStorage.setItem(CHAT_SEEN_KEY, '1');
  bubble.addEventListener('click', markSeen, { once: true });

  const animationMode = root.dataset.chatAnimation;
  if (!prefersReducedMotion() && animationMode && animationMode !== 'aucune') {
    initChatHeartbeat(root, bubble);
  }

  initChatInviteBadge(root, bubble);
}

/** Salves de 3 battements (≈1,3 s chacun) séparées de 8 s de repos, en boucle. */
function initChatHeartbeat(root: HTMLElement, bubble: HTMLElement) {
  const radar = root.querySelector<HTMLElement>('[data-chat-radar]');
  const BEAT_DURATION = 1300;
  const BEATS_PER_BURST = 3;
  const BURST_DURATION = BEAT_DURATION * BEATS_PER_BURST;
  const PAUSE_DURATION = 8000;
  const CYCLE_DURATION = BURST_DURATION + PAUSE_DURATION;
  const START_DELAY = 2100; // laisse le temps à l'entrée de la bulle (1,5 s + 0,5 s) de se terminer

  let burstTimeoutId: number | undefined;

  const burst = () => {
    bubble.style.animationPlayState = 'running, running';
    if (radar) {
      radar.classList.remove('is-pinging');
      void radar.offsetWidth; // force le reflow pour permettre de rejouer l'animation
      radar.classList.add('is-pinging');
    }
    burstTimeoutId = window.setTimeout(() => {
      bubble.style.animationPlayState = 'running, paused';
    }, BURST_DURATION);
  };

  let intervalId: number | undefined;
  const startTimeoutId = window.setTimeout(() => {
    burst();
    intervalId = window.setInterval(burst, CYCLE_DURATION);
  }, START_DELAY);

  bubble.addEventListener(
    'click',
    () => {
      window.clearTimeout(startTimeoutId);
      window.clearTimeout(burstTimeoutId);
      if (intervalId) window.clearInterval(intervalId);
      bubble.style.animationPlayState = 'running, paused';
    },
    { once: true }
  );
}

/** Pastille de texte au-dessus de la bulle après 6 s sans ouverture du chat. */
function initChatInviteBadge(root: HTMLElement, bubble: HTMLElement) {
  const badge = root.querySelector<HTMLElement>('[data-chat-badge]');
  if (!badge) return;

  let hideTimeoutId: number | undefined;

  const hide = () => {
    badge.classList.remove('is-visible');
    window.setTimeout(() => {
      badge.hidden = true;
    }, 300);
  };

  const showTimeoutId = window.setTimeout(() => {
    badge.hidden = false;
    requestAnimationFrame(() => badge.classList.add('is-visible'));
    hideTimeoutId = window.setTimeout(hide, 6000);
  }, 6000);

  bubble.addEventListener(
    'click',
    () => {
      window.clearTimeout(showTimeoutId);
      window.clearTimeout(hideTimeoutId);
      hide();
    },
    { once: true }
  );
}
