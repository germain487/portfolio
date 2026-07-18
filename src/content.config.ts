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

// Texte éditable avec mise en forme (alignement + police) depuis l'admin.
// Réservé aux titres et paragraphes de prose affichés une seule fois ;
// exclu des champs réutilisés comme identifiants ailleurs (texte alternatif,
// balises <title>/<meta>, aria-label…) — voir CLAUDE.md §7.3 pour le détail
// des exclusions.
const richText = z.object({
  texte: z.string(),
  alignement: z.enum(['gauche', 'centre', 'droite']).default('gauche'),
  police: z.enum(['display', 'sans', 'mono']).default('sans'),
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
    lien: z.string().url().optional(),
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
  }),
});

const footer = defineCollection({
  loader: file('src/content/footer.json', singleton('footer')),
  schema: z.object({
    tagline: richText,
    mention: z.string(),
    filigraneNimba: z.boolean().default(true),
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
};
