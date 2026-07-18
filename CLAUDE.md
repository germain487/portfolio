
# 🎯 PROMPT MAÎTRE — PORTFOLIO PERSONNEL DE GERMAIN
**Version 1.2 — passage en site multi-pages avec transitions (§1, §6, §10, §11)**

> **Usage** : colle ce document comme premier message dans Claude Code, ou place-le en `CLAUDE.md` à la racine d'un dossier vide, puis écris simplement : « Exécute le prompt maître, phase par phase. »
> **Prérequis** : copie la capture d'écran de référence dans `design/reference.png` avant de lancer.

---

## 1. TA MISSION

Tu es à la fois **développeur frontend créatif senior** et **design lead**. Tu construis de A à Z le portfolio personnel de **Germain [NOM DE FAMILLE — À COMPLÉTER]**, développeur fullstack et entrepreneur basé à **Conakry, Guinée** : fondateur de deux SaaS EdTech (Nimba Educ, Ziama Educ), acteur de la civic tech guinéenne (Atlas des OSC de Guinée, Wonmafé) et dirigeant d'une agence web au service des PME francophones d'Afrique de l'Ouest.

**Objectif du site** : convaincre en moins de 10 secondes trois audiences — clients potentiels (PME, ONG), partenaires tech et recruteurs — que Germain conçoit des produits web sérieux, modernes et ancrés dans les réalités ouest-africaines.

**Livrable** : un site **multi-pages** (`/`, `/a-propos`, `/projets`, `/projets/[slug]`, `/services`, `/contact`) **100 % statique**, ultra-rapide, animé avec goût — transitions de page fluides via `<ClientRouter />` —, entièrement **en français**, prêt à déployer — **doté d'une interface d'administration sur `/admin`** permettant à Germain de tout modifier, ajouter, réorganiser et supprimer sans jamais toucher au code (§7).

**Autonomie** : si un point est ambigu, tranche toi-même en cohérence avec la direction créative (§3) et note ta décision dans le README. Ne t'arrête jamais pour poser une question non bloquante.

---

## 2. RÉFÉRENCE VISUELLE — CE QU'ON GARDE, CE QU'ON DÉPASSE

Lis d'abord `design/reference.png`. Description de la référence :

- Mise en page hero en deux colonnes : à gauche « Hello, It's Me / John Kendric / And I'm a Frontend Developer » + paragraphe + icônes sociales rondes en contour + bouton pilule « Download CV » ; à droite un **portrait détouré dans un hexagone cyan** avec halo lumineux, le sujet débordant légèrement du cadre.
- Navbar minimale : wordmark « Portfolio. » à gauche, liens Home / About / Skills / Portfolio / Contact à droite, lien actif en cyan.
- Conteneur global aux coins très arrondis, posé sur un fond plus sombre, avec un **glow cyan diffus** qui s'échappe en bas.
- Palette : fond bleu-anthracite profond, texte blanc, accent unique **cyan néon**.

### ADN à conserver (non négociable)
Fond sombre bleu-anthracite · accent cyan néon lumineux · portrait hexagonal avec halo · navbar épurée · boutons pilule avec glow · sensation « néon tech » élégante.

### À dépasser (obligatoire)
Cette référence est un template de tutoriel vu des milliers de fois. **Interdiction de le cloner pixel-perfect.** Tu en reprends l'ADN et tu livres une identité impossible à confondre avec l'original. Tes leviers : la typographie, le motif hexagonal érigé en langage graphique, des micro-interactions signées, un contenu 100 % réel, et une touche guinéenne subtile.

---

## 3. DIRECTION CRÉATIVE

- **Élément signature — l'hexagone comme langage** : l'hexagone du portrait devient un système. Il réapparaît en monogramme du logo (« G » dans un hexagone), en puces de listes, en motif de fond très discret (grille hexagonale, opacité 3–5 %), en masque des couvertures de projets, en spinner du préloader. Une seule idée forte, déclinée partout — tout le reste demeure sobre.
- **Typographie** (elle porte la personnalité du site) :
  - Display / titres : **Space Grotesk** (700, 500)
  - Texte courant : **Inter** (400, 500)
  - Utilitaire (eyebrows, labels, chiffres, tags) : **JetBrains Mono** — clin d'œil au terminal, crédibilité développeur
  - Fontes auto-hébergées via `@fontsource-variable/*` ou fichiers woff2 locaux. Jamais de CDN Google Fonts.
- **Touche locale, jamais folklorique** : badge « Disponible · Conakry 🇬🇳 » avec point vert pulsant dans le hero ; silhouette en line-art SVG du **Mont Nimba** en filigrane du footer (opacité ≤ 8 %). Rien d'autre.
- **Ton rédactionnel** : première personne, direct, concret. Zéro jargon marketing creux, zéro superlatif gratuit. Chaque phrase dit quelque chose de vérifiable.

---

## 4. STACK TECHNIQUE (imposée)

| Rôle | Choix | Justification |
|---|---|---|
| Framework | **Astro 5** (sortie statique pure) | Performance maximale, zéro JS inutile, DX excellente |
| Styles | **Tailwind CSS 4** | Cohérence avec le workflow existant de Germain |
| Animations | **GSAP + ScrollTrigger** | Orchestration fine des reveals et timelines |
| Défilement | **Lenis** | Smooth scroll léger |
| Contenu structuré | **Astro Content Collections** + schémas **zod** | Contenu typé, validé au build, éditable par le CMS |
| Administration | **Sveltia CMS** (Git-based) monté sur `/admin` | Édition totale sans code ni base de données (§7) |
| Auth admin | **GitHub OAuth**, fournisseur intégré de Netlify (Access & security → OAuth) | Accès réservé au propriétaire du dépôt, sans worker externe |
| Icônes | **Lucide** en SVG inline | Jamais de font-icons, jamais d'émojis en guise d'icônes |
| Effet machine à écrire | Implémentation maison (~30 lignes) | Pas de dépendance pour si peu |
| Formulaire | **Netlify Forms** + honeypot, fallback lien WhatsApp et mailto | Statique, gratuit, fiable |
| Déploiement | **Netlify** (auto-rebuild à chaque commit) · variante cPanel via GitHub Actions (§7.6) | Double option d'hébergement |

**Interdits techniques** : jQuery, Bootstrap, Tailwind via CDN en production, three.js ou systèmes de particules lourds, toute bibliothèque d'animation supplémentaire > 30 KB.

---

## 5. DESIGN SYSTEM — TOKENS À IMPLÉMENTER TELS QUELS

```css
:root {
  /* Couleurs */
  --bg: #171B22;             /* fond de page, un cran plus profond que la référence */
  --surface: #1F242D;        /* conteneur principal, cartes */
  --surface-2: #2A313C;      /* survols, bordures douces */
  --accent: #00E5FF;         /* cyan néon : CTA, liens actifs, glows */
  --accent-soft: #7DF3E9;    /* remplissages doux (hexagone du portrait) */
  --text: #F4F7FA;
  --text-muted: #9AA5B5;

  /* Effets */
  --glow: 0 0 24px rgba(0, 229, 255, 0.35);
  --glow-strong: 0 0 48px rgba(0, 229, 255, 0.45);

  /* Rayons */
  --radius-card: 1.25rem;
  --radius-container: 2rem;
  --radius-pill: 999px;
}
```

- **Échelle typographique** (desktop → mobile) : h1 `clamp(2.5rem, 6vw, 4.5rem)` ; h2 `clamp(1.75rem, 4vw, 2.75rem)` ; corps 1rem/1.7 ; eyebrows mono 0.8rem, lettrage +0.12em, majuscules.
- **Rythme vertical** : sections `py-24` mobile / `py-32` desktop ; conteneur `max-w-6xl` centré ; grille 12 colonnes.
- **Le cyan est rare donc précieux** : réservé aux CTA, au lien actif, aux glows et aux mots-clés. Jamais de grands aplats cyan hors hexagone du portrait.
- La couleur d'accent est **pilotable depuis l'admin** (§7.3, réglage « Couleur d'accent ») : injecte sa valeur dans `--accent` au build et dérive `--accent-soft` et les glows automatiquement.
- Contrastes AA vérifiés sur chaque combinaison texte/fond.

---

## 6. ARCHITECTURE & CONTENU RÉEL

Tout le contenu éditable vit dans **`src/content/`** sous forme de fichiers JSON/Markdown organisés en collections typées (voir §7) — **jamais en dur dans les composants**. Le contenu ci-dessous constitue le **seed initial** de ces collections : utilise-le exactement. Les champs `[À COMPLÉTER]` reçoivent une valeur plausible en attendant et sont récapitulés dans le README.

### 6.0 Pages & navigation

Le site est **multi-pages** (sortie statique, une route par page + une route dynamique pour le détail projet) :

| Route | Contenu |
|---|---|
| `/` | Hero complet + à-propos condensé (3 lignes + lien) + 3 projets mis en avant + aperçu des 4 services + CTA contact |
| `/a-propos` | Bio complète, stats à compteurs animés, compétences + marquee technologies |
| `/projets` | Grille complète filtrable (Tous · SaaS · Civic Tech · Data · Web Design) |
| `/projets/[slug]` | Détail d'un projet : description longue en markdown, stack, lien live, navigation précédent/suivant |
| `/services` | Les 4 services détaillés + CTA contact |
| `/contact` | Formulaire Netlify + WhatsApp + coordonnées |

Navbar et footer sont communs à toutes les pages (rendus depuis `Base.astro`). Plus de scrollspy : le lien actif de la navbar correspond à la page courante.

### 6.1 Navbar
Logo : monogramme hexagonal « G » + wordmark « Germain » — liens vers les pages : Accueil · À propos · Projets · Services · Contact — indicateur animé sous le lien de la **page courante** (pas de scrollspy) — au scroll, navbar compacte avec fond `--surface` translucide + `backdrop-blur`. Menu mobile plein écran, apparition en stagger. Persistante entre les pages (`transition:persist`) pour un rendu sans à-coup pendant les transitions.

### 6.2 Accueil (`/`)
**Hero**, deux colonnes, comme la référence — mais signée :
- Eyebrow mono : `// salut, moi c'est`
- H1 : **Germain [NOM]**
- Ligne rotative (machine à écrire, curseur clignotant) : `Développeur Fullstack` → `Fondateur EdTech` → `Ingénieur Data Civic Tech` → `Bâtisseur du web ouest-africain`
- Accroche (2 lignes max) : « Je conçois des SaaS et des plateformes web pensés pour les réalités du terrain : mobile-first, résilients hors-ligne, intégrés au Mobile Money. »
- Badge : `● Disponible · Conakry 🇬🇳` (point pulsant — texte et visibilité pilotés depuis l'admin)
- CTA primaire pilule glow : **Télécharger mon CV** (fichier uploadé via l'admin, `[À COMPLÉTER]`) · CTA secondaire fantôme : **Voir mes projets** (→ `/projets`)
- Icônes sociales rondes en contour (hover : remplissage cyan + glow) : LinkedIn, GitHub, X, Facebook — URLs `[À COMPLÉTER]`
- Colonne droite : **portrait détouré débordant d'un hexagone** `--accent-soft`, halo pulsant lent, très léger tilt 3D à la souris. Tant que la vraie photo n'existe pas : silhouette hexagonale stylisée en SVG (jamais d'image cassée). Portrait remplaçable depuis l'admin.

Sous le hero : **à-propos condensé** (titre + 1er paragraphe de bio sur 3 lignes + lien « En savoir plus → » vers `/a-propos`), **3 projets mis en avant** (champ `misEnAvant`, cartes identiques à `/projets` + lien « Voir tous les projets → »), **aperçu des 4 services** (mêmes cartes que `/services` + lien « Voir tous les services → »), **CTA contact** (bandeau avec bouton vers `/contact`).

### 6.3 À propos (`/a-propos`)
Eyebrow `// à-propos` · titre « Construire pour ici, au niveau d'exigence de partout. » · bio en 3 courts paragraphes `[BIO À VALIDER PAR GERMAIN]` :

1. Développeur fullstack basé à Conakry, je conçois des produits web qui tiennent compte du terrain : connexions instables, usage massivement mobile, paiements par Mobile Money.
2. J'ai fondé **Nimba Educ** puis **Ziama Educ**, deux SaaS de gestion scolaire pensés pour les écoles guinéennes — de la modélisation des données (70+ modèles) à la synchronisation online/offline.
3. Côté civic tech, je travaille avec l'ONG Ouvrir Les Horizons sur l'**Atlas des OSC de Guinée** (1 869 organisations cartographiées) et j'ai créé **Wonmafé**, plateforme de datavisualisation des inégalités territoriales.

**Stats à compteurs animés** (mono, hexagones en fond, liste répétable dans l'admin) : `[X]+ années d'expérience` · `[X]+ projets livrés` · `2 SaaS EdTech conçus` · `1 869 OSC cartographiées`.

**Compétences — SANS barres de pourcentage**, sur la même page, sous la bio. Quatre cartes par domaine (icône Lucide + liste puces hexagonales) :
- **Backend** : Python, Django 5, Django REST Framework, PostgreSQL, Laravel (secondaire)
- **Frontend** : HTMX, Alpine.js, Tailwind CSS, JavaScript, Astro
- **Data** : pandas / openpyxl, KoboToolbox, nettoyage & dédoublonnage, validation GPS & cartographie
- **Outils & Cloud** : Claude Code, Git/GitHub, Netlify, cPanel, Brevo, API Mobile Money (Orange Money, MTN MoMo)

Sous les cartes : **marquee infini** des noms de technologies en JetBrains Mono, séparés par des hexagones, pause au survol.

### 6.5 Projets (`/projets` + `/projets/[slug]`)
`/projets` : grille responsive de cartes + **filtres** : Tous · SaaS · Civic Tech · Data · Web Design (vanilla JS, transitions FLIP douces). Chaque carte lie vers sa page de détail `/projets/[slug]`.

Structure d'un projet : `{ slug, titre, description, stack[], tags[], annee, statut, lien?, couverture?, ordre, brouillon, misEnAvant, body (markdown) }`. Données seed :

1. **Ziama Educ** — 2026, en cours — SaaS · EdTech — mis en avant — « Gestion scolaire cloud-first et résiliente hors-ligne pour les écoles guinéennes. Paiements des frais par Mobile Money, expérience parents au premier plan. » — Django 5, DRF, HTMX, Alpine.js, PostgreSQL. `[DESCRIPTION PUBLIQUE À VALIDER]`
2. **Nimba Educ** — SaaS · EdTech — mis en avant — « SaaS de gestion scolaire complet : 70+ modèles de données, présence, emplois du temps avec détection de conflits, paiements Mobile Money, synchronisation online/offline. » — Django, DRF, HTMX, Alpine.js, Tailwind.
3. **Atlas des OSC de Guinée** — Civic Tech · Data — mis en avant — « Cartographie de la société civile guinéenne : 1 869 OSC recensées, consolidées et validées (dédoublonnage flou, contrôle GPS), avec l'ONG Ouvrir Les Horizons. » — Laravel, Livewire, KoboToolbox. — pas de lien public (outil interne à l'ONG)
4. **Wonmafé** — Civic Tech · Data — « Plateforme de datavisualisation citoyenne sur les inégalités territoriales en Guinée. » — lien : wonmafe.com
5. **Agence web [NOM — À COMPLÉTER]** — Web Design — « Sites vitrines et boutiques pour PME francophones d'Afrique de l'Ouest, avec maintenance, hébergement et intégrations sur mesure. » — WordPress, Elementor, Django.

**Couvertures** : aucune image réelle n'existe encore → génère pour chaque projet une **couverture SVG abstraite** cohérente (motif hexagonal, monogramme du projet, variation subtile de teinte autour du cyan). Si une couverture est uploadée depuis l'admin, elle remplace le SVG ; sinon le fallback SVG s'affiche automatiquement.

Carte au survol : tilt 3D léger (≤ 6°), zoom de la couverture (1.05), overlay avec flèche « Découvrir » ; statut « En cours » en badge mono.

`/projets/[slug]` (page de détail, générée via `getStaticPaths`) : statut + année, titre (H1), description courte, stack, bouton « Voir le projet en ligne » si `lien` existe, couverture en grand format, **description longue en markdown** (`body` du fichier), puis navigation **projet précédent / suivant** (selon `ordre`).

### 6.6 Services (`/services`, Germain est aussi entrepreneur)
Quatre cartes sobres, verbe d'action + une phrase :
1. **Développer votre SaaS ou application web sur mesure**
2. **Créer votre site web** (vitrine ou e-commerce) avec maintenance et hébergement
3. **Structurer vos données** : consolidation, nettoyage, cartographie
4. **Intégrer le Mobile Money** à vos produits (Orange Money, MTN MoMo)

CTA de fin de page : « Discutons de votre projet → » (→ `/contact`).

### 6.7 Contact (`/contact`)
Deux colonnes : à gauche coordonnées (email `[À COMPLÉTER]`, bouton **WhatsApp** direct `wa.me/224XXXXXXXXX` `[À COMPLÉTER]`, « Conakry, Guinée ») ; à droite le formulaire.
- Champs : nom, email, sujet (`Projet SaaS / Site web / Data / Autre` — liste modifiable depuis l'admin), message. Attributs Netlify Forms + champ honeypot caché.
- Microcopie précise : bouton « Envoyer le message » ; succès « Message envoyé — je vous réponds sous 24 h. » ; erreur « L'envoi a échoué. Écrivez-moi directement sur WhatsApp ou à [email]. » Les erreurs disent quoi faire, jamais de vague « une erreur est survenue ».

### 6.8 Footer
Rappel nav (liens de page) + réseaux sociaux + « Conçu et développé par Germain · Conakry 🇬🇳 » + filigrane Mont Nimba (§3). Pas de « © tous droits réservés » pompeux — juste l'année. Commun à toutes les pages, persistant entre les transitions (`transition:persist`).

### 6.9 Transitions de page
`<ClientRouter />` (View Transitions natives d'Astro) sur toutes les pages, pour des transitions fluides fidèles à la direction créative (§3). Navbar, curseur personnalisé et Lenis sont `transition:persist` (état/scroll continus, pas de flash). Tout le reste (hero, compteurs, filtres, formulaire, reveals) est ré-initialisé à chaque `astro:page-load` — c'est le seul événement garanti de se déclencher aussi bien au chargement initial qu'après chaque transition côté client ; les `<script>` de composant, eux, ne se ré-exécutent pas automatiquement d'une page à l'autre. Le préloader ne s'affiche qu'à la toute première visite de la session (`sessionStorage`), jamais à chaque page.

---

## 7. ADMINISTRATION — GERMAIN PILOTE TOUT SANS TOUCHER AU CODE

### 7.1 Objectif et principe
Une interface d'administration accessible sur **`monsite.com/admin`** (desktop et mobile) depuis laquelle Germain peut **créer, modifier, réorganiser, masquer et supprimer** l'intégralité du contenu du site : textes, rôles du hero, bio, stats, compétences, projets, services, coordonnées, réseaux sociaux, CV, portrait, images, SEO et couleur d'accent.

**Architecture retenue : CMS Git-based.** Le panneau d'admin écrit directement dans le dépôt GitHub ; chaque sauvegarde = un commit ; Netlify reconstruit automatiquement ; la modification est en ligne en 1 à 2 minutes. **Aucune base de données, aucun serveur à maintenir, aucun coût, aucune surface d'attaque** — le site reste 100 % statique et les scores de performance sont intacts (le CMS n'est chargé que sur `/admin`, jamais dans le bundle du site).

> **Pourquoi pas un back-office Django ?** Surdimensionné ici : il imposerait un serveur, une base de données, de la maintenance et des coûts pour un contenu qui change quelques fois par mois. Les contenus étant des fichiers structurés et versionnés, une migration future vers un backend Django headless (si le site évolue vers un blog multi-auteurs ou un espace client) restera triviale. Bonus du Git-based : historique complet et rollback de chaque modification via l'historique Git.

### 7.2 Implémentation technique
- **CMS : Sveltia CMS** (successeur moderne et maintenu de Decap/Netlify CMS ; compatible avec son format de configuration). Montage minimal : `public/admin/index.html` (qui charge le script Sveltia) + `public/admin/config.yml`.
- **Backend : GitHub.** Authentification OAuth via le **fournisseur intégré de Netlify** (Project configuration → Access & security → OAuth) — aucun worker externe à déployer ni à maintenir. Seuls les comptes GitHub ayant accès en écriture au dépôt peuvent se connecter — donc Germain, et personne d'autre.
- **Contenu : Astro Content Collections** (Content Layer d'Astro 5, loaders `glob`/`file`) avec **schémas zod obligatoires** pour chaque collection. Le CMS édite exactement les fichiers que les collections consomment. Toute entrée invalide fait échouer le build avec un message explicite — garde-fou contre les fausses manipulations.
- **Médias :** `media_folder: "public/uploads"`, `public_folder: "/uploads"`. Le portrait, les couvertures de projets, l'image OG et le CV (PDF) s'uploadent depuis l'admin et sont commités dans le dépôt.
- **Développement local :** utiliser la fonctionnalité « local repository » de Sveltia (aucune auth requise en local) pour tester l'admin pendant le build.
- **Robots/SEO :** `/admin` exclu du sitemap et en `noindex`.

### 7.3 Collections à configurer — couverture totale du site
Chaque champ porte un **label et un hint en français** ; champs requis marqués ; slugs générés depuis le titre.

1. **Réglages généraux** (fichier unique `settings.json`) : nom complet, wordmark, titre SEO, meta description, image OG (upload), **couleur d'accent** (widget color, défaut `#00E5FF`), email, numéro WhatsApp, localisation, **disponibilité** (toggle + texte du badge), fichier CV (upload PDF), liste répétable des réseaux sociaux (plateforme + URL, réordonnables).
2. **Hero** (`hero.json`) : eyebrow, accroche, **liste ordonnée des rôles** de la machine à écrire (ajout / suppression / réorganisation), libellés des deux CTA, portrait (upload image).
3. **À propos** (`about.json`) : titre, paragraphes de bio (markdown), **stats répétables** (valeur numérique, suffixe, label — réordonnables).
4. **Compétences** (`skills.json`) : **domaines répétables** (nom d'icône Lucide, titre, liste d'items) + liste des technologies du marquee.
5. **Projets** (collection dossier `src/content/projets/*.md`) : **CRUD complet** — titre, slug, description, stack (liste), tags (sélection multiple : SaaS / Civic Tech / Data / Web Design), année, statut (En ligne / En cours / Archivé), lien externe, couverture (upload, optionnelle — fallback SVG sinon), **champ `ordre`** pour maîtriser l'affichage, **champ `brouillon`** (booléen : masque le projet du site sans le supprimer).
6. **Services** (`services.json`) : cartes répétables (icône Lucide, titre, phrase) + texte du CTA final.
7. **Contact** (`contact.json`) : textes d'intro, **liste des sujets** du formulaire, microcopies de succès et d'erreur.
8. **Footer** (`footer.json`) : mention de signature, toggle du filigrane Mont Nimba.

**Test de couverture (fait partie de la Definition of Done)** : il ne doit exister **aucun texte, aucune image et aucun réglage visible sur le site qui ne soit pas modifiable depuis `/admin`** — à l'exception des microcopies purement techniques (aria-labels).

### 7.4 Flux de mise à jour vécu par Germain
`monsite.com/admin` → connexion GitHub (un clic) → modification dans un formulaire clair en français → « Enregistrer » → commit automatique → rebuild Netlify → **en ligne en 1 à 2 minutes**, y compris depuis un téléphone. Chaque modification est historisée dans Git : rien n'est jamais perdu, tout est réversible.

### 7.5 Étapes manuelles de mise en service (à documenter pas à pas dans le README, section « Administration »)
Authentification via le **fournisseur OAuth GitHub intégré de Netlify** (pas de worker externe) :
1. Créer le dépôt GitHub et pousser le projet.
2. Connecter le dépôt à Netlify (déploiement automatique à chaque commit).
3. Activer le fournisseur OAuth GitHub dans Netlify : **Project configuration → Access & security → OAuth** — Netlify gère la création de la GitHub OAuth App et les secrets directement dans son interface.
4. Renseigner le nom du dépôt (`backend.repo`) dans `public/admin/config.yml` — pas de `base_url` à fournir, Netlify s'en charge automatiquement.

Le README explique chacune de ces étapes comme pour un débutant : où cliquer, quoi copier, où le coller.

### 7.6 Variante hébergement cPanel
Si l'hébergement final est le cPanel de Germain plutôt que Netlify : fournir **`.github/workflows/deploy-cpanel.yml`** — à chaque commit (donc à chaque sauvegarde dans l'admin), GitHub Actions build le site et déploie `dist/` par FTPS (secrets `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` à renseigner dans le dépôt). Le contenu et le mécanisme de sauvegarde restent identiques ; l'authentification de `/admin` (§7.5) dépend en revanche du fournisseur OAuth de Netlify — si le site n'est plus servi du tout par Netlify, prévoir un autre mécanisme d'authentification. Le workflow est livré désactivé par défaut, avec instructions d'activation dans le README.

---

## 8. ANIMATIONS & MICRO-INTERACTIONS — LE CŒUR DU « DYNAMIQUE »

**Règle d'or** : une seule scène orchestrée par section ; chaque animation sert la lecture ; rien ne bouge en permanence hors halo du portrait et marquee. `prefers-reduced-motion` désactive tout proprement (contenu affiché directement, 100 % lisible).

1. **Préloader** : hexagone SVG qui se dessine (stroke-dashoffset) autour du « G », ~1 s, puis rideau qui se lève. Une fois par session (`sessionStorage`).
2. **Entrée du hero** : timeline GSAP en stagger — eyebrow → nom (léger clip-path) → ligne typée → accroche → CTA → hexagone qui « s'allume » (glow 0 → 100 %).
3. **Machine à écrire** : rotation des rôles, vitesse naturelle, curseur `|` clignotant en `--accent`.
4. **Portrait** : pulsation lente du halo (4 s) + tilt 3D subtil à la souris (desktop uniquement).
5. **Reveals au scroll** : ScrollTrigger, `y: 32 → 0` + fade, stagger 0.08 s, `once: true`.
6. **Lenis** smooth scroll (persistant entre les pages) + navbar dont le lien actif suit la page courante.
7. **Boutons magnétiques** (CTA principaux, desktop) + intensification du glow au survol.
8. **Curseur personnalisé** : point + anneau qui s'agrandit sur les éléments interactifs — desktop uniquement, curseur natif jamais supprimé sur tactile.
9. **Compteurs** des stats déclenchés à l'entrée dans le viewport.
10. **Marquee** technologies : boucle CSS infinie, pause au survol.
11. **Cartes projets** : tilt + zoom + overlay (cf. §6.5).
12. **Filtres projets** : réorganisation animée douce (FLIP), jamais de saut brutal.

---

## 9. EXIGENCES TECHNIQUES

- **Responsive** : impeccable de 360 px à 1536 px+. Mobile-first — la majorité du trafic ouest-africain est mobile. Hero mobile : portrait au-dessus du texte, réduit.
- **Performance** (connexions guinéennes = contrainte de design) : Lighthouse ≥ 95 sur les quatre scores en mobile ; JS initial < 130 KB gzip ; page complète < 1,5 MB ; images AVIF/WebP en lazy ; fontes woff2 sous-ensemble latin, `font-display: swap` ; GSAP chargé après le first paint. Le CMS n'impacte pas ces budgets (chargé uniquement sur `/admin`).
- **SEO** : `lang="fr"`, **title et meta description uniques par page** (accueil : « Germain [NOM] — Développeur Fullstack & Fondateur EdTech · Conakry » ; les autres pages déclinent le pattern), Open Graph + image `og.jpg` 1200×630 générée dans la charte, JSON-LD `Person` sur `/` et `/a-propos` uniquement, sitemap couvrant toutes les pages (statiques + `/projets/[slug]`, sans `/admin`), favicon hexagonal (SVG + PNG).
- **Accessibilité** : HTML sémantique (**un seul `h1` par page**, sections labellisées), contrastes AA, focus visible personnalisé (anneau cyan), `alt` partout (éditables via l'admin pour les images uploadées), labels de formulaire explicites, navigation clavier complète, `prefers-reduced-motion` respecté.

---

## 10. STRUCTURE DU PROJET

```
portfolio/
├── design/
│   └── reference.png              # capture fournie — à lire avant de coder
├── public/
│   ├── admin/
│   │   ├── index.html             # montage Sveltia CMS
│   │   └── config.yml             # collections, labels et hints en français
│   ├── uploads/                   # médias gérés depuis l'admin (portrait, CV, couvertures…)
│   ├── og.jpg · favicon.svg
├── src/
│   ├── content/
│   │   ├── settings.json · hero.json · about.json · skills.json
│   │   ├── services.json · contact.json · footer.json
│   │   └── projets/               # un fichier .md par projet (CRUD via l'admin, body = description longue)
│   ├── content.config.ts          # collections + schémas zod (garde-fous)
│   ├── styles/global.css          # tokens + Tailwind
│   ├── layouts/Base.astro         # navbar + footer + curseur + préloader + SEO + <ClientRouter />
│   ├── components/
│   │   ├── Preloader.astro · Navbar.astro · Hero.astro · HexPortrait.astro
│   │   ├── About.astro · Skills.astro · TechMarquee.astro
│   │   ├── Projects.astro · ProjectCard.astro · ProjectCover.astro
│   │   ├── Services.astro · Contact.astro · Footer.astro
│   │   ├── AboutPreview.astro · FeaturedProjects.astro · ServicesPreview.astro · ContactCTA.astro  # blocs condensés de l'accueil
│   │   └── MagneticButton.astro · Cursor.astro · Icon.astro
│   ├── scripts/
│   │   ├── motion.ts              # GSAP, Lenis, compteurs, filtres, curseur, magnétisme…
│   │   └── bootstrap.ts           # point d'entrée unique : (ré)initialise tout sur astro:page-load
│   └── pages/
│       ├── index.astro            # /
│       ├── a-propos.astro         # /a-propos
│       ├── services.astro         # /services
│       ├── contact.astro          # /contact
│       └── projets/
│           ├── index.astro        # /projets
│           └── [slug].astro       # /projets/[slug] (getStaticPaths, détail + préc/suiv)
├── .github/workflows/
│   └── deploy-cpanel.yml          # variante cPanel (désactivée par défaut)
└── astro.config.mjs
```

---

## 11. PLAN DE TRAVAIL — UNE PHASE = UN COMMIT

Exécute dans l'ordre. À la fin de **chaque** phase : `npm run build` doit passer sans erreur, puis commit conventionnel (`feat(phase-1): hero, navbar, préloader`). Liste les éventuelles questions non bloquantes en fin de phase et continue avec une hypothèse raisonnable.

- **Phase 0 — Fondations** : init Astro 5 + Tailwind 4, fontes locales, tokens §5, **collections `src/content/` + schémas zod + seed complet du §6**, `Base.astro` avec tout le SEO, page vide qui build.
- **Phase 1 — Première impression** : Preloader, Navbar (+ mobile), Hero complet (typing, hexagone, badge, CTA, socials) — alimenté par les collections.
- **Phase 2 — Crédibilité** : À propos + compteurs, Compétences + marquee.
- **Phase 3 — Preuve** : grille Projets complète (données réelles, couvertures SVG générées, filtres FLIP, cartes tilt, respect de `ordre` et `brouillon`) + page de détail `/projets/[slug]` (description longue markdown, stack, lien live, navigation précédent/suivant).
- **Phase 4 — Conversion** : Services, Contact (Netlify Forms + états succès/erreur + honeypot), Footer + filigrane Nimba.
- **Phase 5 — Polish** : passe motion globale (Lenis, ScrollTrigger, curseur, magnétisme), audit perf/a11y/SEO contre §9.
- **Phase 6 — Administration** : `public/admin/` (Sveltia + `config.yml` complet en français couvrant les 8 collections §7.3), test local via « local repository » (modifier un texte depuis l'admin doit se refléter au build), workflow cPanel §7.6, puis **`README.md` final** : lancement, déploiement Netlify pas à pas, variante cPanel, **section « Administration » détaillée (§7.5)** et **liste récapitulative de tous les champs `[À COMPLÉTER]`**.
- **Pivot — Multi-pages** (postérieur à la Phase 6) : le site est passé de one-page à multi-pages (§1, §6, §10). Commit dédié `refactor: passage en multi-pages` : éclatement des sections en pages (`/`, `/a-propos`, `/projets`, `/services`, `/contact`), navbar/footer déplacés dans `Base.astro`, navigation par page (fin du scrollspy), `<ClientRouter />` + `scripts/bootstrap.ts` pour ré-initialiser l'animation à chaque `astro:page-load`, champ `misEnAvant` + corps markdown ajoutés à la collection `projets`. La Phase 3 a été reprise dans la foulée pour livrer `/projets/[slug]`.

---

## 12. DEFINITION OF DONE — CHECKLIST FINALE

- [ ] Zéro lorem ipsum, zéro texte anglais résiduel dans l'interface
- [ ] Identité clairement distincte du template de référence (test : côte à côte avec `reference.png`, personne ne les confond)
- [ ] Lighthouse mobile ≥ 95 × 4
- [ ] Aucune casse de 360 px à 1536 px+
- [ ] `prefers-reduced-motion` : site complet et lisible sans aucune animation
- [ ] Navigation clavier de bout en bout, focus visible
- [ ] Formulaire : envoi Netlify OK, honeypot, états succès/erreur conformes §6.7
- [ ] OG + JSON-LD valides, favicon présent, `/admin` hors sitemap et en noindex
- [ ] JS initial < 130 KB gzip, page < 1,5 MB
- [ ] **Admin : test de couverture §7.3 réussi** — chaque texte, image et réglage visible est modifiable depuis `/admin` ; ajout, réorganisation, brouillon et suppression d'un projet fonctionnels en local
- [ ] **Schémas zod : une valeur invalide saisie dans un fichier de contenu fait échouer le build avec un message clair**
- [ ] README complet : déploiement, mise en service de l'admin (§7.5), variante cPanel, liste des `[À COMPLÉTER]`

---

## 13. INTERDITS ABSOLUS

1. Cloner la référence pixel-perfect ou réutiliser ses textes (« Hello, It's Me »… )
2. Lorem ipsum ou contenu inventé non plausible
3. **Contenu en dur dans les composants** — tout texte, image ou réglage visible provient des collections `src/content/`
4. Barres de compétences avec pourcentages arbitraires (« HTML 95 % »)
5. Émojis en guise d'icônes d'interface (exception : les deux 🇬🇳 prévus §3 et §6.8)
6. Scrolljacking, sons, vidéos en autoplay
7. Images cassées ou placeholders gris — toujours un SVG stylisé de substitution
8. Plus de trois familles de polices, ou polices chargées depuis un CDN
9. Dépendances lourdes non listées §4
10. Grands aplats cyan hors hexagone du portrait — l'accent reste rare
11. Texte marketing creux (« passionné par l'innovation », « solutions clés en main »…)

---

*Fin du prompt maître. Commence par la Phase 0 et annonce ton plan avant de coder.*
