# Portfolio — Germain Camara

Site one-page statique (Astro 5 + Tailwind 4), animé avec GSAP/Lenis, entièrement pilotable depuis une interface d'administration (`/admin`) sans jamais toucher au code.

## Sommaire

- [Lancement en local](#lancement-en-local)
- [Stack technique](#stack-technique)
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

## Structure du projet

```
portfolio/
├── public/
│   ├── admin/              # Sveltia CMS (index.html + config.yml)
│   ├── uploads/             # médias gérés depuis l'admin
│   ├── og.jpg, favicon.svg
├── src/
│   ├── content/             # settings.json, hero.json, about.json, skills.json,
│   │                         # services.json, contact.json, footer.json, projets/*.md
│   ├── content.config.ts    # 8 collections + schémas Zod (garde-fous au build)
│   ├── layouts/Base.astro   # SEO, fontes, OG, JSON-LD
│   ├── components/          # un composant par section + Icon/HexPortrait/MagneticButton/Cursor
│   ├── scripts/motion.ts    # GSAP, Lenis, scrollspy, compteurs, filtres, curseur…
│   └── pages/index.astro
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

L'expérience d'administration (`/admin`) reste strictement identique quel que soit l'hébergeur choisi : c'est GitHub qui reçoit les commits dans les deux cas, seul le mécanisme de mise en ligne change.

## Administration (`/admin`)

### Principe

`monsite.com/admin` ouvre **Sveltia CMS**, un panneau d'administration Git-based : chaque sauvegarde crée un commit sur le dépôt GitHub, Netlify (ou le workflow cPanel) reconstruit automatiquement le site, la modification est en ligne en 1 à 2 minutes. Aucune base de données, aucun serveur à maintenir — le site reste 100 % statique et les scores de performance ne bougent pas (le CMS n'est chargé que sur `/admin`, jamais dans le bundle du site).

Depuis `/admin`, on peut créer, modifier, réorganiser, masquer et supprimer : textes, rôles du hero, bio, statistiques, compétences, projets (CRUD complet avec brouillon), services, coordonnées, réseaux sociaux, CV, portrait, couvertures de projets, couleur d'accent et réglages SEO — sans jamais toucher au code.

### Mise en service (à faire une fois, par Germain)

1. **Créer le dépôt GitHub** et y pousser ce projet (si ce n'est pas déjà fait pour Netlify).
2. **Déployer le worker d'authentification** : aller sur le dépôt officiel [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth), cliquer sur son bouton de déploiement one-click vers **Cloudflare Workers** (compte Cloudflare gratuit suffisant).
3. **Créer une GitHub OAuth App** : sur GitHub, **Settings → Developer settings → OAuth Apps → New OAuth App**. Renseigner comme *Authorization callback URL* l'URL du worker déployé à l'étape 2 (ex. `https://sveltia-cms-auth.mon-compte.workers.dev/callback`). Copier le *Client ID* et générer un *Client Secret*.
4. **Renseigner les secrets du worker** : dans le tableau de bord Cloudflare Workers, ouvrir le worker déployé, ajouter les variables d'environnement `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` avec les valeurs obtenues à l'étape 3.
5. **Compléter `public/admin/config.yml`** : remplacer `repo:` par `votre-compte-github/nom-du-depot` et `base_url:` par l'URL du worker de l'étape 2 (voir la liste des `[À COMPLÉTER]` plus bas). Commiter et pousser.
6. **Connecter le dépôt à Netlify** si ce n'est pas déjà fait (voir section précédente) — chaque sauvegarde depuis l'admin déclenchera un rebuild automatique.

Une fois ces 6 étapes faites : ouvrir `monsite.com/admin`, cliquer **Sign In with GitHub** (un clic), et le panneau d'administration est utilisable — y compris depuis un téléphone.

### Tester en local sans configurer GitHub

Sveltia CMS propose un mode **« Work with Local Repository »**, visible directement sur l'écran de connexion de `/admin` (nécessite un navigateur à base de Chromium — Chrome, Edge — pour la File System Access API) :

1. Lancer `npm run dev`.
2. Ouvrir `http://localhost:4321/admin`.
3. Cliquer **Work with Local Repository**, puis sélectionner le dossier racine du projet dans la fenêtre native qui s'ouvre.
4. Modifier un champ, enregistrer : le fichier JSON/Markdown correspondant est réécrit directement sur le disque, sans authentification ni commit Git. Un rechargement de `localhost:4321` (le serveur de dev regénère les pages via son *content watcher*) reflète le changement.

C'est le moyen le plus rapide de vérifier une modification de champ ou de tester l'ajout/la réorganisation/la mise en brouillon/la suppression d'un projet avant de pousser une vraie configuration GitHub.

### Flux au quotidien

`monsite.com/admin` → connexion GitHub (un clic) → modification dans un formulaire en français → **Enregistrer** → commit automatique → rebuild → en ligne en 1 à 2 minutes. Tout est historisé dans Git : rien n'est jamais perdu, tout est réversible (historique/rollback via GitHub).

### Couverture des 8 collections

Chaque collection de `src/content.config.ts` a un miroir exact dans `public/admin/config.yml` (mêmes champs, en français, avec hints) :

| Collection | Fichier(s) | Champs |
|---|---|---|
| Réglages généraux | `settings.json` | identité, SEO, couleur d'accent, CV, réseaux sociaux… |
| Hero | `hero.json` | eyebrow, accroche, rôles de la machine à écrire, CTA, portrait |
| À propos | `about.json` | titre, paragraphes, statistiques animées |
| Compétences | `skills.json` | domaines (icône + items), technologies du bandeau |
| Projets | `projets/*.md` | CRUD complet, tags, ordre, brouillon |
| Services | `services.json` | cartes, CTA final |
| Contact | `contact.json` | intro, sujets du formulaire, microcopies succès/erreur |
| Footer | `footer.json` | mention de signature, filigrane Mont Nimba |

---

## Décisions prises en autonomie

Le prompt maître autorisait à trancher les points ambigus sans bloquer. Décisions prises :

- **Nom de famille** : « Camara » — plausible pour un développeur basé à Conakry, à valider par Germain (voir liste des champs à compléter).
- **Conteneur global arrondi flottant sur fond plus sombre** (visible sur `design/reference.png`) : délibérément **non repris**. Il fait partie des éléments « template de tutoriel » à dépasser (§2 du prompt maître) plutôt que de l'ADN à conserver ; le site utilise un fond plein bleu-anthracite avec des cartes/boutons arrondis ponctuels, ce qui différencie mieux l'identité de la référence.
- **Icône « X »** : Lucide ne fournit pas le logo X (marque), l'icône Twitter (oiseau) historique a été utilisée comme meilleur équivalent disponible dans le set d'icônes imposé.
- **Statistiques « À propos »** (années d'expérience, projets livrés) : valeurs plausibles (4+ ans, 15+ projets) en attendant confirmation.
- **Format des fichiers de contenu singleton** (`settings.json`, `hero.json`…) : stockés en JSON plat (ex. `{"nomComplet": "…"}`) plutôt qu'enveloppés dans une clé portant le nom du fichier — c'est le format qu'écrit nativement Sveltia CMS pour une « file collection ». Le loader Astro (`src/content.config.ts`) fait le pont via un petit `parser` dédié, donc le code des composants (`getEntry('settings', 'settings')`) n'a pas à changer.

## Champs à compléter avant mise en ligne

Récapitulatif de tous les `[À COMPLÉTER]` du prompt maître. Tout est modifiable directement depuis `/admin`, sauf les deux premières lignes (configuration technique du CMS lui-même) :

| Champ | Emplacement | Valeur actuelle (placeholder) |
|---|---|---|
| Dépôt GitHub | `public/admin/config.yml` → `backend.repo` | `germain-camara/portfolio` |
| URL du worker d'auth | `public/admin/config.yml` → `backend.base_url` | `https://sveltia-cms-auth.VOTRE-COMPTE.workers.dev` |
| URL du site | `astro.config.mjs` → `site` | `https://germain-portfolio.netlify.app` |
| Nom de famille | Admin → Réglages généraux | « Camara » |
| Email de contact | Admin → Réglages généraux | `contact@germaincamara.dev` |
| Numéro WhatsApp | Admin → Réglages généraux | `224600000000` |
| CV (PDF) | Admin → Réglages généraux | non fourni (lien pointe vers un fichier inexistant) |
| URLs réseaux sociaux | Admin → Réglages généraux | comptes placeholder à corriger |
| Portrait du hero | Admin → Hero | silhouette SVG de secours (aucune photo) |
| Description publique — Ziama Educ | Admin → Projets | texte de travail à valider |
| Lien externe — Atlas des OSC de Guinée | Admin → Projets | non renseigné |
| Nom de l'agence web | Admin → Projets | « Camara Digital » (à valider) |
| Bio (3 paragraphes) | Admin → À propos | texte du prompt maître, à valider par Germain |
| Statistiques (années d'expérience, projets livrés) | Admin → À propos | valeurs plausibles à confirmer |

---

*Fin du README. Généré à l'issue de la Phase 6 du prompt maître — voir `CLAUDE.md` pour le cahier des charges complet.*
