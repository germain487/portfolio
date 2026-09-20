import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

// Sveltia CMS édite chaque fichier de réglages comme un objet JSON plat
// (un « file collection » standard). Le loader Astro attend en interne une
// entrée nommée : ce parser fait le pont sans changer le format sur disque
// ni le code des composants (getEntry('settings', 'settings') etc.).
const singleton = (id: string) => ({
  parser: (text: string) => ({ [id]: JSON.parse(text) }),
});

const reseauSchema = z.object({
  plateforme: z.string(),
  url: z.string().url(),
});

// Texte éditable avec mise en forme (alignement + police + taille) depuis
// l'admin. Réservé aux titres et paragraphes de prose affichés une seule
// fois ; exclu des champs réutilisés comme identifiants ailleurs (texte
// alternatif, balises <title>/<meta>, aria-label…) — voir CLAUDE.md §7.3
// pour le détail des exclusions.
const richText = z.object({
  texte: z.string(),
  alignement: z.enum(['gauche', 'centre', 'droite']).default('gauche'),
  police: z.enum(['display', 'sans', 'mono']).default('sans'),
  taille: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']).default('base'),
});

const settings = defineCollection({
  loader: file('src/content/settings.json', singleton('settings')),
  schema: z.object({
    nomComplet: z.string(),
    wordmark: z.string(),
    titreSEO: z.string(),
    metaDescription: z.string().max(180),
    imageOG: z.string().optional(),
    couleurAccent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#00E5FF'),
    email: z.string().email(),
    whatsapp: z.string(),
    localisation: z.string(),
    disponible: z.boolean().default(true),
    badgeTexte: z.string(),
    cv: z.string().optional(),
    reseaux: z.array(reseauSchema),
  }),
});

const hero = defineCollection({
  loader: file('src/content/hero.json', singleton('hero')),
  schema: z.object({
    eyebrow: richText,
    accroche: richText,
    roles: z.array(z.string()).min(1),
    ctaPrimaireLabel: z.string(),
    ctaSecondaireLabel: z.string(),
    portrait: z.string().optional(),
  }),
});

const about = defineCollection({
  loader: file('src/content/about.json', singleton('about')),
  schema: z.object({
    titre: richText,
    paragraphes: z.array(richText).min(1),
    stats: z.array(
      z.object({
        valeur: z.number(),
        suffixe: z.string().default(''),
        label: z.string(),
      })
    ),
  }),
});

const skills = defineCollection({
  loader: file('src/content/skills.json', singleton('skills')),
  schema: z.object({
    domaines: z.array(
      z.object({
        icone: z.string(),
        titre: richText,
        items: z.array(z.string()).min(1),
      })
    ),
  }),
});

const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/projets' }),
  schema: z.object({
    // titre/description restent en texte simple : réutilisés comme texte
    // alternatif, initiale du monogramme de couverture, balise <title> et
    // navigation précédent/suivant — pas de mise en forme indépendante.
    titre: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    tags: z.array(z.enum(['SaaS', 'Civic Tech', 'Data', 'Web Design'])),
    annee: z.number().int(),
    statut: z.enum(['En ligne', 'En cours', 'Archivé']),
    // Le widget CMS enregistre un champ vide laissé vide comme "" plutôt que
    // d'omettre la clé : on le traite comme "non renseigné" avant validation.
    lien: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
    couverture: z.string().optional(),
    ordre: z.number().int().default(0),
    brouillon: z.boolean().default(false),
    misEnAvant: z.boolean().default(false),
  }),
});

const services = defineCollection({
  loader: file('src/content/services.json', singleton('services')),
  schema: z.object({
    cartes: z.array(
      z.object({
        icone: z.string(),
        titre: richText,
        phrase: richText,
      })
    ),
    ctaFinalLabel: z.string(),
  }),
});

const contact = defineCollection({
  loader: file('src/content/contact.json', singleton('contact')),
  schema: z.object({
    intro: richText,
    sujets: z.array(z.string()).min(1),
    messageSucces: z.string(),
    messageErreur: z.string(),
    // Intitulés des champs et du bouton du formulaire, libellés des cartes de
    // coordonnées (la carte WhatsApp est aussi reprise dans le footer).
    champNom: z.string().default('Nom'),
    champEmail: z.string().default('Email'),
    champSujet: z.string().default('Sujet'),
    champMessage: z.string().default('Message'),
    boutonEnvoyer: z.string().default('Envoyer le message'),
    carteEmailLabel: z.string().default('Email'),
    carteWhatsappLabel: z.string().default('WhatsApp'),
    carteWhatsappTexte: z.string().default('Discuter directement'),
    carteLocalisationLabel: z.string().default('Localisation'),
  }),
});

const footer = defineCollection({
  loader: file('src/content/footer.json', singleton('footer')),
  schema: z.object({
    tagline: richText,
    mention: z.string(),
    filigraneNimba: z.boolean().default(true),
    titreNavigation: z.string().default('Navigation'),
    titreContact: z.string().default('Contact'),
  }),
});

// Liens de la navigation principale, partagés entre la navbar et le footer.
// Les routes existantes du site sont les seules cibles valides : le libellé
// est libre, la cible se choisit dans une liste fermée (admin).
const navigation = defineCollection({
  loader: file('src/content/navigation.json', singleton('navigation')),
  schema: z.object({
    liens: z
      .array(
        z.object({
          label: z.string(),
          href: z.enum(['/', '/a-propos', '/projets', '/services', '/contact']),
        })
      )
      .min(1),
  }),
});

// Balises <title> et meta description propres à chaque page (l'accueil utilise
// le titre SEO et la description des réglages généraux).
const seoPage = z.object({
  titre: z.string(),
  description: z.string().max(180),
});
const seo = defineCollection({
  loader: file('src/content/seo.json', singleton('seo')),
  schema: z.object({
    aPropos: seoPage,
    projets: seoPage,
    services: seoPage,
    contact: seoPage,
    // Page de détail d'un projet : « {titre du projet} — {suffixe} » ; la
    // description reprend la description courte du projet.
    projetDetailSuffixe: z.string(),
  }),
});

// Libellés d'interface (liens, boutons, filtres) auparavant codés en dur.
const interfaceUi = defineCollection({
  loader: file('src/content/interface.json', singleton('interface')),
  schema: z.object({
    projets: z.object({
      voirTous: z.string(),
      decouvrir: z.string(),
      filtreTous: z.string(),
      retourListe: z.string(),
      voirEnLigne: z.string(),
      precedent: z.string(),
      suivant: z.string(),
    }),
    services: z.object({
      voirTous: z.string(),
    }),
  }),
});

// Titres de section auparavant codés en dur dans les composants (Compétences,
// Projets, Services sur l'accueil, bandeau Contact de l'accueil) — regroupés
// ici pour être éditables depuis l'admin sans dupliquer le texte entre la
// page complète et son aperçu sur l'accueil.
const sections = defineCollection({
  loader: file('src/content/sections.json', singleton('sections')),
  schema: z.object({
    skillsTitre: richText,
    projetsTitre: richText,
    servicesTitre: richText,
    contactCtaTitre: richText,
    contactCtaTexte: richText,
    // Eyebrows mono au-dessus de chaque section (« // projets »…). Texte
    // simple : la mise en forme est celle, fixe, de l'eyebrow.
    aProposEyebrow: z.string().default('// à-propos'),
    skillsEyebrow: z.string().default('// compétences'),
    projetsEyebrow: z.string().default('// projets'),
    servicesEyebrow: z.string().default('// services'),
    contactEyebrow: z.string().default('// contact'),
  }),
});

const chatbot = defineCollection({
  loader: file('src/content/chatbot.json', singleton('chatbot')),
  schema: z.object({
    actif: z.boolean().default(true),
    // Texte simple (pas de richText) : consommé aussi bien par le widget que
    // par le prompt système généré côté fonction Netlify — une mise en forme
    // indépendante n'aurait pas de sens hors du rendu HTML du site.
    messageAccueil: z.string(),
    questionsSuggerees: z.array(z.string()).max(3),
    mentionIA: z.string(),
    titrePanneau: z.string().default('Louise · Guide du site'),
    placeholderSaisie: z.string().default('Posez votre question…'),
    // Repris à l'identique par la fonction Netlify (via build-knowledge.mjs)
    // quand l'API ne répond pas, et par le widget quand la fonction elle-même
    // est injoignable.
    messageIndisponible: z
      .string()
      .default('Louise est indisponible pour le moment. Écrivez directement à Germain sur WhatsApp ou via la page Contact.'),
    // Libellé (accessibilité + infobulle native) du bouton d'ouverture.
    libelleBouton: z.string().default('Ouvrir le chat avec Louise, assistante du site'),
    // Animation d'attention sur la bulle (battement de cœur ± onde radar) —
    // purement décorative, se coupe définitivement pour la session dès la
    // première ouverture du chat (sessionStorage, voir scripts/motion.ts).
    animationAttention: z.enum(['heartbeat', 'heartbeat_radar', 'aucune']).default('heartbeat_radar'),
    // Couleur propre à la bulle (fond, halo, onde radar, monogramme du panneau),
    // indépendante de l'accent du site : glows dérivés au build (ChatWidget.astro).
    couleurBulle: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FF3B3B'),
    // Emoji (ou lettre) affiché dans la bulle et l'en-tête du panneau — max
    // en unités UTF-16, une séquence emoji avec carnation + ZWJ en compte ~7.
    iconeBulle: z.string().trim().min(1).max(16).default('👩'),
    badgeInvitationActif: z.boolean().default(true),
    badgeInvitationTexte: z.string().default('Une question ? Je suis Louise, discutons 👋'),
  }),
});

export const collections = {
  settings,
  hero,
  about,
  skills,
  projets,
  services,
  contact,
  footer,
  sections,
  chatbot,
  navigation,
  seo,
  interface: interfaceUi,
};
