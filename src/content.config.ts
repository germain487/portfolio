import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const reseauSchema = z.object({
  plateforme: z.string(),
  url: z.string().url(),
});

const settings = defineCollection({
  loader: file('src/content/settings.json'),
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
  loader: file('src/content/hero.json'),
  schema: z.object({
    eyebrow: z.string(),
    accroche: z.string(),
    roles: z.array(z.string()).min(1),
    ctaPrimaireLabel: z.string(),
    ctaSecondaireLabel: z.string(),
    portrait: z.string().optional(),
  }),
});

const about = defineCollection({
  loader: file('src/content/about.json'),
  schema: z.object({
    titre: z.string(),
    paragraphes: z.array(z.string()).min(1),
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
  loader: file('src/content/skills.json'),
  schema: z.object({
    domaines: z.array(
      z.object({
        icone: z.string(),
        titre: z.string(),
        items: z.array(z.string()).min(1),
      })
    ),
    technologies: z.array(z.string()).min(1),
  }),
});

const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/projets' }),
  schema: z.object({
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
  }),
});

const services = defineCollection({
  loader: file('src/content/services.json'),
  schema: z.object({
    cartes: z.array(
      z.object({
        icone: z.string(),
        titre: z.string(),
        phrase: z.string(),
      })
    ),
    ctaFinalLabel: z.string(),
  }),
});

const contact = defineCollection({
  loader: file('src/content/contact.json'),
  schema: z.object({
    intro: z.string(),
    sujets: z.array(z.string()).min(1),
    messageSucces: z.string(),
    messageErreur: z.string(),
  }),
});

const footer = defineCollection({
  loader: file('src/content/footer.json'),
  schema: z.object({
    mention: z.string(),
    filigraneNimba: z.boolean().default(true),
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
};
