import { gsap } from 'gsap';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;

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

/** Navbar compacte au scroll + scrollspy avec indicateur animé sous le lien actif. */
export function initNavbar() {
  const nav = document.querySelector<HTMLElement>('[data-navbar]');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const indicator = nav.querySelector<HTMLElement>('[data-nav-indicator]');
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((s): s is HTMLElement => Boolean(s));

  const moveIndicator = (link: HTMLAnchorElement) => {
    if (!indicator) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  const setActive = (id: string) => {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) moveIndicator(link);
    });
  };

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  const activeLink = links.find((l) => l.classList.contains('is-active')) ?? links[0];
  if (activeLink) moveIndicator(activeLink);
  window.addEventListener('resize', () => {
    const current = links.find((l) => l.classList.contains('is-active')) ?? links[0];
    if (current) moveIndicator(current);
  });

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
