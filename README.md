# Portfolio — Germain Monemou

Site multi-pages statique (Astro 5 + Tailwind 4), transitions de page fluides (`<ClientRouter />`), animé avec GSAP/Lenis, entièrement pilotable depuis une interface d'administration (`/admin`) sans jamais toucher au code.

## Sommaire

- [Lancement en local](#lancement-en-local)
- [Stack technique](#stack-technique)
- [Pages](#pages)
- [Structure du projet](#structure-du-projet)
- [Déploiement Netlify](#déploiement-netlify-pas-à-pas)
- [Variante cPanel](#variante-cpanel)
- [Administration (`/admin`)](#administration-admin)
- [Louise (chatbot IA)](#louise-chatbot-ia)
- [Animations](#animations)
- [Décisions prises en autonomie](#décisions-prises-en-autonomie)
- [Champs à compléter avant mise en ligne](#champs-à-compléter-avant-mise-en-ligne)

---

## Lancement en local

Prérequis : Node.js 20+.

```bash
npm install
npm run dev       # http://localhost:4321
```

Autres commandes :

```bash
npm run build          # build statique dans dist/ (régénère aussi la base de connaissances de Louise)
npm run preview        # sert dist/ localement, pour vérifier le build de prod
npm run dev:functions  # astro + fonctions Netlify (dont /api de Louise) en local via netlify dev
```

`npm run dev` seul (sans fonctions) suffit pour travailler sur le site : la bulle de Louise s'affiche normalement mais indique poliment qu'elle est indisponible tant que `npm run dev:functions` n'est pas utilisé — voir [Louise (chatbot IA)](#louise-chatbot-ia).

## Stack technique

| Rôle | Choix |
|---|---|
| Framework | Astro 5 (sortie 100 % statique) |
| Styles | Tailwind CSS 4 |
| Animations | GSAP + ScrollTrigger |
| Défilement | Lenis |
| Contenu | Astro Content Collections + schémas Zod |
| Administration | Sveltia CMS (Git-based) sur `/admin` |
| Icônes | Lucide (SVG inline, via `src/components/Icon.astro`) |
| Formulaire | Netlify Forms (AJAX + honeypot) |
| Chatbot IA (Louise) | Netlify Functions + API Groq (gratuite, compatible OpenAI) |
| Déploiement | Netlify (par défaut) ou cPanel via GitHub Actions |

## Pages

| Route | Contenu |
|---|---|
| `/` | Hero complet + à-propos condensé + 3 projets mis en avant + aperçu des services + CTA contact |
| `/a-propos` | Bio complète, statistiques à compteurs animés, compétences + bandeau technologies |
| `/projets` | Grille complète filtrable (Tous · SaaS · Civic Tech · Data · Web Design) |
| `/projets/[slug]` | Détail d'un projet : description longue, stack, lien live, navigation précédent/suivant |
| `/services` | Les 4 services détaillés + CTA contact |
| `/contact` | Formulaire Netlify + WhatsApp + coordonnées |

Navbar et footer sont communs à toutes les pages (rendus depuis `Base.astro`) ; le lien actif de la navbar suit la page courante. Les transitions entre pages sont gérées par `<ClientRouter />` (View Transitions natives d'Astro) : navbar, curseur personnalisé et défilement fluide (Lenis) restent continus d'une page à l'autre, tandis que le hero, les compteurs, les filtres et le formulaire sont ré-initialisés à chaque navigation (`scripts/bootstrap.ts`, sur l'événement `astro:page-load`). Le préloader ne s'affiche qu'à la toute première visite de la session.

## Structure du projet

```
portfolio/
├── netlify/
│   └── functions/
│       └── chat/
│           ├── chat.mjs                 # fonction Louise (appel Groq) — voir § Louise
│           └── knowledge.generated.mjs  # généré par scripts/build-knowledge.mjs, jamais commité
│                                         # (même dossier que chat.mjs : importé, pas exposé comme fonction à part)
├── public/
│   ├── admin/              # Sveltia CMS : config.yml + logo.svg (la page /admin est src/pages/admin.astro)
│   ├── uploads/             # médias gérés depuis l'admin
│   ├── og.jpg, favicon.svg
├── scripts/
│   └── build-knowledge.mjs  # génère la base de connaissances de Louise depuis src/content/
├── src/
│   ├── content/             # settings.json, hero.json, about.json, skills.json,
│   │                         # services.json, contact.json, footer.json, sections.json,
│   │                         # chatbot.json, navigation.json, seo.json, interface.json,
│   │                         # projets/*.md
│   ├── content.config.ts    # 13 collections + schémas Zod (garde-fous au build)
│   ├── layouts/Base.astro   # navbar + footer + curseur + préloader + SEO + <ClientRouter />
│   ├── components/          # un composant par section + blocs condensés (FeaturedProjects,
│   │                         # ServicesPreview, ContactCTA) + StyledText/Icon/Cursor/ChatWidget…
│   ├── scripts/
│   │   ├── motion.ts        # GSAP, Lenis, compteurs, filtres, curseur, magnétisme,
│   │   │                     # galerie horizontale, parallaxe, révélation des titres…
│   │   ├── chat-widget.ts   # logique du panneau de Louise, importée dynamiquement à l'ouverture
│   │   └── bootstrap.ts     # point d'entrée unique, ré-exécuté à chaque astro:page-load
│   └── pages/
│       ├── index.astro · a-propos.astro · services.astro · contact.astro
│       ├── admin.astro          # page /admin (Sveltia CMS + thème), hors sitemap, noindex
│       └── projets/index.astro · projets/[slug].astro
├── .github/workflows/deploy-cpanel.yml   # variante cPanel (désactivée par défaut)
├── netlify.toml
└── astro.config.mjs
```

Tout le contenu visible sur le site provient de `src/content/` — jamais de texte en dur dans les composants. Chaque collection est validée par un schéma Zod : une valeur invalide fait échouer `npm run build` avec un message explicite.

## Déploiement Netlify (pas à pas)

1. Créer un dépôt GitHub et y pousser ce projet.
2. Sur [app.netlify.com](https://app.netlify.com), cliquer **Add new site → Import an existing project**, choisir le dépôt.
3. Paramètres de build : `npm run build` / dossier de sortie `dist`. Astro les détecte automatiquement, rien à changer.
4. Cliquer **Deploy** : le site est en ligne en 1 à 2 minutes.
5. Chaque nouveau commit sur `main` (y compris ceux créés par l'admin, voir plus bas) redéclenche un build automatique.
6. (Optionnel) Dans **Site settings → Forms**, vérifier que le formulaire « contact » a bien été détecté après le premier déploiement — c'est automatique dès que `data-netlify="true"` est présent dans le HTML généré, ce qui est déjà le cas ici.

## Variante cPanel

Si l'hébergement final est un cPanel plutôt que Netlify, le dépôt contient `.github/workflows/deploy-cpanel.yml` : à chaque exécution, GitHub Actions build le site et dépose `dist/` par FTPS sur le serveur.

**Il est livré désactivé par défaut** (déclenchement manuel uniquement). Pour l'activer :

1. Dans le cPanel, récupérer l'hôte FTP, un utilisateur et un mot de passe FTP.
2. Sur GitHub : **Settings → Secrets and variables → Actions**, ajouter les secrets `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`.
3. Ouvrir `.github/workflows/deploy-cpanel.yml` et décommenter le déclencheur `push` (les lignes sous `# push:`) pour que chaque commit sur `main` déploie automatiquement. Sans cette étape, le workflow reste disponible en déclenchement manuel (onglet **Actions** du dépôt → **Run workflow**).
4. Vérifier/adapter `server-dir` dans le workflow si le dossier public du cPanel n'est pas `public_html/`.

Le contenu (fichiers dans `src/content/`) et le mécanisme de sauvegarde restent identiques quel que soit l'hébergeur choisi : c'est GitHub qui reçoit les commits dans les deux cas. L'authentification de `/admin` décrite ci-dessous s'appuie en revanche sur le fournisseur OAuth intégré de Netlify — si le site est finalement servi uniquement depuis un cPanel (sans Netlify du tout), il faudra un autre mécanisme d'authentification pour l'admin (ex. un worker OAuth externe).

## Administration (`/admin`)

### Principe

`monsite.com/admin` ouvre **Sveltia CMS**, un panneau d'administration Git-based : chaque sauvegarde crée un commit sur le dépôt GitHub, Netlify (ou le workflow cPanel) reconstruit automatiquement le site, la modification est en ligne en 1 à 2 minutes. Aucune base de données, aucun serveur à maintenir — le site reste 100 % statique et les scores de performance ne bougent pas (le CMS n'est chargé que sur `/admin`, jamais dans le bundle du site).

Depuis `/admin`, on peut créer, modifier, réorganiser, masquer et supprimer : textes, rôles du hero, bio, statistiques, compétences, projets (CRUD complet avec brouillon), services, coordonnées, réseaux sociaux, CV, portrait, couvertures de projets, couleur d'accent, réglages SEO de chaque page, liens du menu, libellés des boutons/liens/filtres/formulaire et textes de Louise — sans jamais toucher au code.

### Apparence de l'administration

L'interface reprend le format d'un tableau de bord classique : barre latérale bleue listant les sections (la section active en blanc), contenu en carte blanche arrondie, palette claire forcée quel que soit le mode sombre/clair du système. Sveltia CMS n'offrant officiellement que le logo (`logo.src`, `public/admin/logo.svg`) et le titre (`app_title`) comme options d'apparence, le reste est un thème CSS dans `src/pages/admin.astro` qui surcharge ses variables `--sui-*` et quelques éléments de structure (`nav.primary-sidebar`, `main.wrapper`).

**Conséquence : la version de Sveltia CMS est épinglée** dans `src/pages/admin.astro` (`@sveltia/cms@0.217.0`). Pour la mettre à jour, changer le numéro de version, ouvrir `/admin` et vérifier que la barre latérale et la carte de contenu s'affichent toujours correctement (les noms de classes internes peuvent changer d'une version à l'autre). Sans thème, on pourrait revenir à l'URL non épinglée (`@sveltia/cms/dist/sveltia-cms.js`) pour suivre automatiquement les mises à jour.

### Mise en service (à faire une fois, par Germain)

L'authentification passe par le **fournisseur OAuth GitHub intégré de Netlify** — pas de worker externe à déployer, pas d'URL à faire correspondre entre deux services.

1. **Créer le dépôt GitHub** et y pousser ce projet ✅ fait (`germain487/portfolio`).
2. **Connecter le dépôt à Netlify** si ce n'est pas déjà fait (voir [Déploiement Netlify](#déploiement-netlify-pas-à-pas) ci-dessus).
3. **Activer le fournisseur OAuth GitHub** : dans Netlify, ouvrir le site → **Project configuration → Access & security → OAuth**, activer le fournisseur **GitHub** (Netlify guide la création de la GitHub OAuth App et le renseignement du Client ID/Secret directement dans son interface — rien à faire côté GitHub séparément).
4. **Vérifier `public/admin/config.yml`** : `backend.repo` doit correspondre au dépôt (`germain487/portfolio`) ✅ fait — aucune autre valeur à renseigner, Netlify gère le reste automatiquement.

Une fois ces étapes faites : ouvrir `monsite.com/admin`, cliquer **Sign In with GitHub** (un clic), et le panneau d'administration est utilisable — y compris depuis un téléphone.

### Tester en local sans configurer GitHub

Sveltia CMS propose un mode **« Work with Local Repository »**, visible directement sur l'écran de connexion de `/admin` (nécessite un navigateur à base de Chromium — Chrome, Edge — pour la File System Access API) :

1. Lancer `npm run dev`.
2. Ouvrir `http://localhost:4321/admin` dans **Chrome ou Edge** (Safari et Firefox n'ont pas l'API nécessaire ; Brave la désactive par défaut).
3. Cliquer **Travailler avec un dépôt local**. Dans la fenêtre macOS qui s'ouvre, **sélectionner le dossier du projet lui-même** (`Portfolio`, celui qui contient `.git`) — cliquer une fois dessus pour le surligner puis « Ouvrir », ou entrer dedans puis « Ouvrir ». Ne pas valider depuis le dossier parent (`Téléchargements`) : Chrome le refuse comme dossier protégé.
4. Chrome demande alors « Autoriser localhost:4321 à consulter les fichiers ? » → **Afficher les fichiers**. À la première sauvegarde, il demande aussi l'autorisation de **modifier** les fichiers → autoriser.
5. Modifier un champ, enregistrer : le fichier JSON/Markdown correspondant est réécrit directement sur le disque, sans authentification ni commit Git. Un rechargement de `localhost:4321` (le serveur de dev regénère les pages via son *content watcher*) reflète le changement.

Si l'écran affiche **« Impossible de sélectionner un répertoire racine de dépôt »**, c'est que le sélecteur s'est fermé sans dossier valide (annulation, dossier `Téléchargements` refusé, ou prompt d'accès aux fichiers refusé) : recommencer l'étape 3 en sélectionnant bien `Portfolio`. Vérifier aussi que `chrome://settings/content/filesystem` est sur « Les sites peuvent demander… » et que, pour `localhost:4321` (icône à gauche de l'adresse → Paramètres du site), « Modification de fichiers » n'est pas bloquée. Le message « Le dossier sélectionné n'est pas la racine d'un dépôt » signifie, lui, que le dossier choisi ne contient pas `.git`.

C'est le moyen le plus rapide de vérifier une modification de champ ou de tester l'ajout/la réorganisation/la mise en brouillon/la suppression d'un projet avant de pousser une vraie configuration GitHub.

### Flux au quotidien

`monsite.com/admin` → connexion GitHub (un clic) → modification dans un formulaire en français → **Enregistrer** → commit automatique → rebuild → en ligne en 1 à 2 minutes. Tout est historisé dans Git : rien n'est jamais perdu, tout est réversible (historique/rollback via GitHub).

### Couverture des 13 collections

Chaque collection de `src/content.config.ts` a un miroir exact dans `public/admin/config.yml` (mêmes champs, en français, avec hints). **Test de couverture (§7.3 du prompt maître)** : aucun texte, image ou réglage visible sur le site n'est codé en dur dans un composant — tout provient de l'une de ces collections. Seules exceptions, volontaires : les libellés d'accessibilité purement techniques (aria-labels de boutons d'icônes comme « Ouvrir le menu », « Fermer la discussion », « Envoyer », le champ anti-robot caché du formulaire), le « © année » généré automatiquement et le lien « Propulsé par Sveltia CMS » de l'écran de connexion de l'admin.

| Collection | Fichier(s) | Champs |
|---|---|---|
| Réglages généraux | `settings.json` | identité, SEO de l'accueil, couleur d'accent (injectée au build : `--accent`, `--accent-soft`, halos et motif hexagonal en sont dérivés), CV, réseaux sociaux… |
| Hero | `hero.json` | eyebrow, accroche (mise en forme), rôles de la machine à écrire, CTA, portrait |
| À propos | `about.json` | titre, paragraphes (mise en forme), statistiques animées |
| Compétences | `skills.json` | domaines (icône + titre en mise en forme + items) |
| Projets | `projets/*.md` | CRUD complet, tags, ordre, brouillon, mis en avant (accueil), description longue markdown (page de détail) |
| Services | `services.json` | cartes (titre + phrase en mise en forme), CTA final |
| Contact | `contact.json` | intro (mise en forme), sujets du formulaire, microcopies succès/erreur, intitulés des champs et du bouton, libellés des cartes email/WhatsApp/localisation |
| Footer | `footer.json` | phrase de positionnement (mise en forme), mention de signature, filigrane Mont Nimba, titres des colonnes Navigation/Contact |
| Titres de section | `sections.json` | titres Compétences / Projets / Services (partagés page complète + aperçu accueil), titre et texte du bandeau contact de l'accueil, eyebrows (« // projets »…) de chaque section |
| Navigation | `navigation.json` | liens du menu principal et du footer (libellé + page cible parmi les routes du site), réordonnables |
| SEO des pages | `seo.json` | titre d'onglet et meta description de `/a-propos`, `/projets`, `/services`, `/contact` ; suffixe du titre des fiches projet |
| Libellés d'interface | `interface.json` | projets (« Voir tous les projets → », « Découvrir », filtre « Tous », retour à la liste, « Voir le projet en ligne », précédent/suivant) et services (« Voir tous les services → ») |
| Louise (chatbot IA) | `chatbot.json` | activer/désactiver, message d'accueil, questions suggérées, mention IA, animation d'attention de la bulle, couleur de la bulle, icône de la bulle (emoji), infobulle d'invitation, titre du panneau, texte d'invite du champ, message d'indisponibilité (partagé avec la fonction Netlify), libellé du bouton d'ouverture — voir [Louise (chatbot IA)](#louise-chatbot-ia) |

**Mise en forme du texte** : les titres et paragraphes de prose ci-dessus (« mise en forme ») s'éditent avec quatre champs — texte, alignement (gauche / centré / droite), police (limitée aux 3 familles déjà chargées sur le site — Space Grotesk pour les titres, Inter pour le texte courant, JetBrains Mono — afin de préserver l'identité visuelle) et taille (de très petit à très grand, sur l'échelle Tailwind). Volontairement exclus de la mise en forme (mais bien éditables en texte simple) : titre/description des projets (réutilisés comme texte alternatif, initiale de la couverture générée et balise `<title>` — les rendre éditables indépendamment aurait cassé le SEO), les libellés de bouton et de lien, les eyebrows, les messages système et la mention de copyright du footer.

---

## Louise (chatbot IA)

Louise est l'assistante IA du site : une bulle flottante (hexagone cyan avec un « L ») présente sur toutes les pages, qui répond en français aux questions des visiteurs sur Germain (profil, projets, services, contact). Coût zéro : API **Groq** (gratuite, compatible OpenAI) + **Netlify Functions** (plan gratuit).

### Principe

- Le site reste 100 % statique : aucune clé API n'existe côté client. Le widget (`src/components/ChatWidget.astro`) envoie les messages à une fonction serverless (`netlify/functions/chat.mjs`), qui seule connaît la clé Groq (`process.env.GROQ_API_KEY`).
- La base de connaissances de Louise n'est **jamais dupliquée à la main** : `scripts/build-knowledge.mjs` la régénère à chaque build à partir des mêmes fichiers `src/content/` que le CMS édite (réglages, à-propos, projets non-brouillons, services, contact). Toute modification faite depuis `/admin` se reflète chez Louise au déploiement suivant.
- Le JS du panneau de discussion (`src/scripts/chat-widget.ts`) n'est chargé qu'à la première ouverture de la bulle (import dynamique depuis `src/scripts/motion.ts`) — aucun impact sur le score Lighthouse tant que le visiteur n'a pas cliqué.
- Garde-fous côté fonction : `max_tokens` ≤ 350, historique tronqué aux 8 derniers messages, message utilisateur tronqué à 500 caractères, `temperature` 0.4, appels acceptés uniquement depuis l'origine du site. En cas d'échec de l'API (clé absente, quota dépassé, erreur réseau…), Louise répond avec un message de repli qui oriente vers WhatsApp ou `/contact` plutôt que de laisser une erreur brute.

### Mise en service (à faire une fois, par Germain)

1. Créer un compte sur [console.groq.com](https://console.groq.com) — gratuit, sans carte bancaire.
2. Dans **API Keys**, créer une nouvelle clé et la copier (elle ne sera plus affichée en entier ensuite).
3. Sur Netlify : ouvrir le site → **Project configuration → Environment variables** → **Add a variable** → nom `GROQ_API_KEY`, valeur = la clé copiée.
4. Redéployer le site (**Deploys → Trigger deploy**, ou pousser n'importe quel commit) pour que la fonction récupère la nouvelle variable d'environnement.

Sans cette clé, le site continue de fonctionner normalement : Louise affiche simplement son message de repli orientant vers WhatsApp/`/contact`.

### Limites du plan gratuit

Le plan gratuit de Groq applique des limites de débit (nombre de requêtes et de tokens par minute/jour, variables selon le modèle — voir [console.groq.com/settings/limits](https://console.groq.com/settings/limits)). Largement suffisant pour un portfolio ; en cas de dépassement ponctuel, Louise bascule automatiquement sur son message de repli.

### Changer de fournisseur (Gemini, Mistral…)

Toute la logique d'appel au modèle est isolée dans `netlify/functions/chat.mjs` — rien d'autre à toucher. Pour changer de fournisseur : remplacer `GROQ_URL`, `MODEL` et l'en-tête d'authentification par l'équivalent du nouveau fournisseur (la plupart proposent une API compatible OpenAI, comme Groq), et renommer la variable d'environnement en conséquence côté Netlify.

### Tester en local

```bash
npm run dev:functions   # régénère la base de connaissances puis lance `netlify dev`
```

Nécessite `GROQ_API_KEY` dans un fichier `.env` local (non commité, voir `.gitignore`) ou dans les variables d'environnement du shell. `netlify dev` sert le site Astro **et** les fonctions sur le même port, donc le widget fonctionne à l'identique de la production.

### Administration

Collection **Louise (chatbot IA)** dans `/admin` (`src/content/chatbot.json`) : activer/désactiver la bulle, message d'accueil, jusqu'à 3 questions suggérées, mention IA affichée dans l'en-tête du panneau, **animation d'attention de la bulle** (battement de cœur seul / battement + onde radar / aucune), **couleur de la bulle** (fond, halo, onde radar et monogramme du panneau — indépendante de l'accent du site, glows dérivés automatiquement), **icône de la bulle** (un emoji, ex. 👩 ou 👩🏾, ou une lettre — affiché dans la bulle et dans l'en-tête du panneau) et **infobulle d'invitation** (activer/désactiver + texte). Le reste de la base de connaissances (bio, projets, services, contact) n'est pas dupliqué ici — il est déjà éditable depuis les autres collections et se synchronise automatiquement.

### Animation d'attention sur la bulle

Pour attirer l'œil à l'arrivée sur le site sans devenir agaçante, la bulle de Louise peut battre comme un cœur (« lub-dub », rythme ≈55 bpm) et faire naître une onde radar hexagonale, réglable depuis `/admin` :

- **Cycle de vie** : la bulle apparaît 1,5 s après le chargement, puis bat 3 fois, se repose 8 s, rebat 3 fois, etc. — en boucle jusqu'à la première ouverture du chat.
- **Coupure définitive par session** : dès que le visiteur ouvre le chat une première fois, le battement s'arrête pour toute la session (`sessionStorage`) — la bulle reste sobre ensuite, y compris après un rechargement de page. Un nouvel onglet en navigation privée repart avec le battement.
- **Survol** : interrompt le battement, laisse place au glow renforcé existant.
- **`prefers-reduced-motion`** : aucun battement, jamais — la bulle reste statique avec son glow, immédiatement visible.
- **Infobulle d'invitation** (indépendante, sa propre case à cocher dans `/admin`) : après 6 s sans ouverture du chat, une infobulle apparaît au-dessus de la bulle avec une petite flèche vers celle-ci. Elle reste affichée et ouvre le chat au clic ; elle disparaît dès l'ouverture de Louise ou si le visiteur la ferme (croix) — dans les deux cas, plus jamais pour la session (`sessionStorage`), et le battement s'arrête aussi.
- Implémentation en CSS pur (`@keyframes`, propriétés `transform`/`box-shadow` uniquement, `will-change: transform`) : chaque salve est une animation à 3 itérations que la CSS arrête d'elle-même en fin de cycle ; le JS ne fait que poser la classe de salve, attendre `animationend` pour programmer la pause (`setTimeout`) et lire/écrire `sessionStorage` — sans impact sur le score Lighthouse.

---

## Animations

Toute la couche animation vit dans `src/scripts/motion.ts` et est (ré)initialisée par `src/scripts/bootstrap.ts` à chaque `astro:page-load`. **Règle commune : `prefers-reduced-motion` désactive tout**, et le site reste complet et lisible sans la moindre animation.

### Galerie horizontale (services, accueil)

La section services de l'accueil se parcourt latéralement. **Le défilement horizontal reste disponible en `prefers-reduced-motion`** : il est déclenché par le visiteur, jamais joué tout seul, et ne relève donc pas du mouvement que ce réglage vise à supprimer. Seule la *course pilotée* — section épinglée, piste translatée au fil du défilement vertical — est réservée à ceux qui acceptent le mouvement.

Deux rendus pour un seul balisage (`ServicesPreview.astro`), choisis par la CSS et `initHorizontalGallery` :

| Contexte | Rendu |
|---|---|
| ≥ 1024 px, animations acceptées | Section épinglée, la piste se déplace horizontalement au fil du défilement (GSAP ScrollTrigger, `pin` + `scrub`), avec un repère de progression sous les cartes |
| Partout ailleurs — petit écran, tactile, `prefers-reduced-motion` | Carrousel natif, aucun JavaScript |

**Accessibilité du carrousel** : la piste est atteignable au clavier (`tabindex="0"`, `role="group"`, `aria-label`) et défile aux flèches. Le dernier panneau dépasse volontairement du cadre — c'est l'indice qu'il reste du contenu, les barres de défilement étant masquées par défaut sous macOS. Le `tabindex` est retiré quand la piste est épinglée : elle ne défile plus par elle-même, ce serait un arrêt de tabulation sans effet. En `prefers-reduced-motion`, l'accroche (`scroll-snap`) est neutralisée, elle déplacerait la piste sans demande.

**Ce n'est pas du scrolljacking** (interdit §13.6 du prompt maître) : la molette garde exactement son rythme et sa réversibilité, seul l'axe du mouvement change, et la section se quitte normalement par le haut ou par le bas. Le montage et le démontage du pin sont confiés à `gsap.matchMedia()`, de sorte qu'un redimensionnement ou l'activation de « réduire les animations » en cours de visite rebascule proprement sur le bon rendu.

### Autres effets

- **Révélation des titres ligne par ligne** (`data-split`) : le titre est découpé en lignes réelles (telles que le navigateur les a cassées), chacune montant derrière un masque. Le balisage d'origine est **restauré en fin d'animation**, donc aucun regroupement de lignes figé ne gêne un redimensionnement ultérieur. Réservé au texte simple — jamais aux paragraphes rendus en `set:html`.
- **Parallaxe de profondeur** (`data-parallax`) sur les couvertures de projets : le visuel est volontairement plus haut que son cadre (`.parallax-media`), il glisse donc sans jamais découvrir de vide.
- **Progression de lecture** : un filet fin sous la navbar. Volontairement hors ScrollTrigger — la navbar étant persistée entre les pages (`transition:persist`), rien ici ne doit être « revert » pendant une transition. Animé en `scaleX` seul (composité par le GPU, aucun recalcul de mise en page) et limité par `requestAnimationFrame`.
- **Halo hexagonal au curseur** : la trame hexagonale du fond ne s'allume qu'autour du pointeur (intersection de deux masques CSS, sous `@supports` — sans `mask-composite`, la trame entière s'allumerait). Le JS ne publie que la position du pointeur en variables CSS, une écriture par frame. Bureau et pointeur fin uniquement.
- **Transition de page en iris hexagonal** : la page entrante se découvre à travers un hexagone qui s'ouvre depuis le centre, en CSS pure sur les pseudo-éléments de l'API View Transitions. L'animation de groupe par défaut du navigateur doit être neutralisée (`::view-transition-group(root) { animation: none }`) — elle redimensionne l'instantané et rend le découpage sans effet.

### Mesures

Lighthouse sur le build de production (`npm run build`, puis `npm run preview`) :

| | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Bureau | 100 | 100 | 100 | 100 |
| Mobile | 97 | 100 | 100 | 100 |

`CLS = 0` malgré la section épinglée : le `pin-spacer` de ScrollTrigger réserve la place à l'avance, aucun décalage de mise en page. JS initial ≈ **58 Ko gzip** pour un plafond de 130 Ko (§9) — GSAP et ScrollTrigger étaient déjà embarqués, les ajouts ne pèsent rien.

Le tout n'ajoute rien au budget de performance : GSAP et ScrollTrigger étaient déjà embarqués, et le JS initial reste à **≈58 Ko gzip** pour un plafond de 130 Ko (§9).

---

## Décisions prises en autonomie

Le prompt maître autorisait à trancher les points ambigus sans bloquer. Décisions prises :

- **Conteneur global arrondi flottant sur fond plus sombre** (visible sur `design/reference.png`) : délibérément **non repris**. Il fait partie des éléments « template de tutoriel » à dépasser (§2 du prompt maître) plutôt que de l'ADN à conserver ; le site utilise un fond plein bleu-anthracite avec des cartes/boutons arrondis ponctuels, ce qui différencie mieux l'identité de la référence.
- **Icône « X »** : Lucide ne fournit pas le logo X (marque), l'icône Twitter (oiseau) historique a été utilisée comme meilleur équivalent disponible dans le set d'icônes imposé.
- **Statistiques « À propos »** (années d'expérience, projets livrés) : valeurs plausibles (4+ ans, 15+ projets) en attendant confirmation.
- **Format des fichiers de contenu singleton** (`settings.json`, `hero.json`…) : stockés en JSON plat (ex. `{"nomComplet": "…"}`) plutôt qu'enveloppés dans une clé portant le nom du fichier — c'est le format qu'écrit nativement Sveltia CMS pour une « file collection ». Le loader Astro (`src/content.config.ts`) fait le pont via un petit `parser` dédié, donc le code des composants (`getEntry('settings', 'settings')`) n'a pas à changer.

## Champs à compléter avant mise en ligne

Récapitulatif de tous les `[À COMPLÉTER]` du prompt maître. Tout est modifiable directement depuis `/admin`, sauf les deux premières lignes (configuration technique du CMS lui-même) :

| Champ | Emplacement | Valeur actuelle (placeholder) |
|---|---|---|
| Dépôt GitHub | `public/admin/config.yml` → `backend.repo` | ✅ `germain487/portfolio` (fait) |
| Fournisseur OAuth GitHub | Netlify → Project configuration → Access & security → OAuth | à activer (§ Administration) |
| URL du site | `astro.config.mjs` → `site` **et** `public/admin/config.yml` → `site_url` / `display_url` (lien « voir le site » dans l'admin) | `https://germain-portfolio.netlify.app` |
| Clé API Groq (Louise) | Netlify → Project configuration → Environment variables → `GROQ_API_KEY` | non renseignée (Louise répond avec son message de repli en attendant) |
| Email de contact | Admin → Réglages généraux | ✅ `grmnmonemou@gmail.com` (fait) |
| Numéro WhatsApp | Admin → Réglages généraux | ✅ `224613712573` (fait) |
| CV (PDF) | Admin → Réglages généraux | non fourni (lien pointe vers un fichier inexistant) |
| URLs réseaux sociaux | Admin → Réglages généraux | comptes placeholder à corriger |
| Portrait du hero | Admin → Hero | silhouette SVG de secours (aucune photo) |
| Description publique — Ziama Educ | Admin → Projets | texte de travail à valider |
| Lien externe — Atlas des OSC de Guinée | Admin → Projets | non renseigné |
| Nom de l'agence web | Admin → Projets | « Monemou Digital » (à valider) |
| Bio (3 paragraphes) | Admin → À propos | texte du prompt maître, à valider par Germain |
| Statistiques (années d'expérience, projets livrés) | Admin → À propos | valeurs plausibles à confirmer |

---

*Fin du README. Généré à l'issue de la Phase 6 du prompt maître, mis à jour après le passage en multi-pages — voir `CLAUDE.md` pour le cahier des charges complet.*
