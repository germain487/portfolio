import {
  initPreloader,
  initTypewriter,
  initHeroIntro,
  initCardTilt,
  initCounters,
  initNavbarChrome,
  updateNavbarActiveLink,
  initSmoothScroll,
  cleanupScrollTriggers,
  initScrollReveals,
  initCustomCursor,
  initMagneticButtons,
  initProjectFilters,
  initContactForm,
} from './motion';

/**
 * Point d'entrée unique de toute la couche animation du site.
 *
 * Avec le <ClientRouter /> d'Astro, les <script> de chaque composant ne
 * se ré-exécutent pas à chaque navigation côté client — seul l'événement
 * `astro:page-load` est garanti de se déclencher à chaque fois (chargement
 * initial ET chaque transition). On centralise donc ici tout ce qui doit
 * réagir au contenu de la page courante, et on distingue :
 *   - le « chrome » persistant (navbar, curseur, Lenis) : initialisé une
 *     seule fois pour toute la session de navigation ;
 *   - le contenu spécifique à chaque page (hero, compteurs, filtres,
 *     formulaire, reveals) : ré-initialisé à chaque `astro:page-load`.
 */

let chromeInitialized = false;

function initPageContent() {
  initPreloader();
  updateNavbarActiveLink();

  const heroSection = document.querySelector<HTMLElement>('[data-hero]');
  if (heroSection) {
    const typewriterEl = document.querySelector<HTMLElement>('[data-typewriter]');
    const roles = JSON.parse(heroSection.getAttribute('data-roles') ?? '[]');
    if (typewriterEl && roles.length) initTypewriter(typewriterEl, roles);
    initHeroIntro();
    initCardTilt('[data-portrait-tilt]', 8);
  }

  if (document.querySelector('[data-counter]')) initCounters();
  if (document.querySelector('[data-projects-grid]')) initProjectFilters();
  if (document.querySelector('[data-project-tilt]')) initCardTilt('[data-project-tilt]', 6);
  if (document.querySelector('[data-contact-form]')) initContactForm();

  initScrollReveals();
  initMagneticButtons();
}

export function initPageLifecycle() {
  if (!chromeInitialized) {
    chromeInitialized = true;
    initNavbarChrome();
    initCustomCursor();
    initSmoothScroll();
  }

  // `astro:page-load` se déclenche aussi au tout premier chargement, donc
  // pas besoin d'appeler initPageContent() séparément ici : l'écouteur
  // suffit à couvrir le chargement initial ET chaque transition suivante.
  document.addEventListener('astro:before-swap', cleanupScrollTriggers);
  document.addEventListener('astro:page-load', initPageContent);
}
