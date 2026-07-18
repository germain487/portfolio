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
npm run build      # build statique dans dist/
npm run preview    # sert dist/ localement, pour vérifier le build de prod
```

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
├── public/
│   ├── admin/              # Sveltia CMS (index.html + config.yml)
│   ├── uploads/             # médias gérés depuis l'admin
│   ├── og.jpg, favicon.svg
├── src/
│   ├── content/             # settings.json, hero.json, about.json, skills.json,
│   │                         # services.json, contact.json, footer.json, sections.json,
│   │                         # projets/*.md
│   ├── content.config.ts    # 9 collections + schémas Zod (garde-fous au build)
│   ├── layouts/Base.astro   # navbar + footer + curseur + préloader + SEO + <ClientRouter />
│   ├── components/          # un composant par section + blocs condensés (FeaturedProjects,
│   │                         # ServicesPreview, ContactCTA) + StyledText/Icon/Cursor…
│   ├── scripts/
│   │   ├── motion.ts        # GSAP, Lenis, compteurs, filtres, curseur, magnétisme…
│   │   └── bootstrap.ts     # point d'entrée unique, ré-exécuté à chaque astro:page-load
│   └── pages/
│       ├── index.astro · a-propos.astro · services.astro · contact.astro
│       └── projets/index.astro · projets/[slug].astro
├── .github/workflows/deploy-cpanel.yml   # variante cPanel (désactivée par défaut)
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

Depuis `/admin`, on peut créer, modifier, réorganiser, masquer et supprimer : textes, rôles du hero, bio, statistiques, compétences, projets (CRUD complet avec brouillon), services, coordonnées, réseaux sociaux, CV, portrait, couvertures de projets, couleur d'accent et réglages SEO — sans jamais toucher au code.

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
2. Ouvrir `http://localhost:4321/admin`.
3. Cliquer **Work with Local Repository**, puis sélectionner le dossier racine du projet dans la fenêtre native qui s'ouvre.
4. Modifier un champ, enregistrer : le fichier JSON/Markdown correspondant est réécrit directement sur le disque, sans authentification ni commit Git. Un rechargement de `localhost:4321` (le serveur de dev regénère les pages via son *content watcher*) reflète le changement.

C'est le moyen le plus rapide de vérifier une modification de champ ou de tester l'ajout/la réorganisation/la mise en brouillon/la suppression d'un projet avant de pousser une vraie configuration GitHub.

### Flux au quotidien

`monsite.com/admin` → connexion GitHub (un clic) → modification dans un formulaire en français → **Enregistrer** → commit automatique → rebuild → en ligne en 1 à 2 minutes. Tout est historisé dans Git : rien n'est jamais perdu, tout est réversible (historique/rollback via GitHub).

### Couverture des 9 collections

Chaque collection de `src/content.config.ts` a un miroir exact dans `public/admin/config.yml` (mêmes champs, en français, avec hints) :

| Collection | Fichier(s) | Champs |
|---|---|---|
| Réglages généraux | `settings.json` | identité, SEO, couleur d'accent, CV, réseaux sociaux… |
| Hero | `hero.json` | eyebrow, accroche (mise en forme), rôles de la machine à écrire, CTA, portrait |
| À propos | `about.json` | titre, paragraphes (mise en forme), statistiques animées |
| Compétences | `skills.json` | domaines (icône + titre en mise en forme + items) |
| Projets | `projets/*.md` | CRUD complet, tags, ordre, brouillon, mis en avant (accueil), description longue markdown (page de détail) |
| Services | `services.json` | cartes (titre + phrase en mise en forme), CTA final |
| Contact | `contact.json` | intro (mise en forme), sujets du formulaire, microcopies succès/erreur |
| Footer | `footer.json` | phrase de positionnement (mise en forme), mention de signature, filigrane Mont Nimba |
| Titres de section | `sections.json` | titres Compétences / Projets / Services (partagés page complète + aperçu accueil), titre et texte du bandeau contact de l'accueil |

**Mise en forme du texte** : les titres et paragraphes de prose ci-dessus (« mise en forme ») s'éditent avec trois champs — texte, alignement (gauche / centré / droite) et police, limitée aux 3 familles déjà chargées sur le site (Space Grotesk pour les titres, Inter pour le texte courant, JetBrains Mono) afin de préserver l'identité visuelle. Volontairement exclus : titre/description des projets (réutilisés comme texte alternatif, initiale de la couverture générée et balise `<title>` — les rendre éditables indépendamment aurait cassé le SEO), les libellés de bouton, les messages système et la mention de copyright du footer.

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
| URL du site | `astro.config.mjs` → `site` | `https://germain-portfolio.netlify.app` |
| Email de contact | Admin → Réglages généraux | `contact@germainmonemou.dev` |
| Numéro WhatsApp | Admin → Réglages généraux | `224600000000` |
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
