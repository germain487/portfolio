// Génère la base de connaissances de Louise à partir des collections
// src/content/ — exécuté avant chaque build (npm run prebuild) et avant
// `netlify dev` (npm run dev:functions), jamais à la main : toute
// modification faite depuis /admin se reflète ici au déploiement suivant.
// Node pur (pas d'astro:content, qui n'existe qu'au build Astro) : on relit
// les mêmes fichiers JSON/Markdown que content.config.ts, en miroir de ses
// exclusions (brouillon, richText → .texte).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { load as parseYAML } from 'js-yaml';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const contentDir = join(root, 'src/content');
// Le fichier généré vit dans le même sous-dossier que la fonction qui
// l'importe (convention « un dossier = une fonction » de Netlify) : un
// fichier posé directement à la racine de netlify/functions/ serait à tort
// détecté comme une fonction distincte (testé — avertissement « nom de
// fonction invalide », aucun handler exporté), même préfixé par `_`.
const outDir = join(root, 'netlify/functions/chat');
const outFile = join(outDir, 'knowledge.generated.mjs');

const readJSON = (name) => JSON.parse(readFileSync(join(contentDir, name), 'utf-8'));

// Mêmes fichiers Markdown que le loader `glob` d'Astro (frontmatter YAML +
// corps) — on évite gray-matter ici : sa version publiée embarque js-yaml 3
// et entre en conflit avec la v4 déjà présente dans l'arbre de dépendances.
function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, content: raw };
  return { data: parseYAML(match[1]) ?? {}, content: match[2] };
}

const settings = readJSON('settings.json');
const about = readJSON('about.json');
const skills = readJSON('skills.json');
const services = readJSON('services.json');
const contact = readJSON('contact.json');
const footer = readJSON('footer.json');

const projetsDir = join(contentDir, 'projets');
const projets = readdirSync(projetsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { data, content } = parseFrontmatter(readFileSync(join(projetsDir, f), 'utf-8'));
    return { ...data, resume: content.trim().replace(/\s+/g, ' ').slice(0, 600) };
  })
  .filter((p) => !p.brouillon)
  .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

const lignes = [];

lignes.push(`# Profil`);
lignes.push(`Nom : ${settings.nomComplet}`);
lignes.push(`Localisation : ${settings.localisation}`);
lignes.push(`Disponibilité : ${settings.disponible ? settings.badgeTexte : 'non précisée actuellement'}`);
lignes.push(`Email : ${settings.email}`);
lignes.push(`WhatsApp : https://wa.me/${settings.whatsapp}`);
if (settings.reseaux?.length) {
  lignes.push(`Réseaux : ${settings.reseaux.map((r) => `${r.plateforme} (${r.url})`).join(', ')}`);
}

lignes.push(`\n# À propos`);
lignes.push(about.titre?.texte ?? '');
for (const p of about.paragraphes ?? []) lignes.push(p.texte);
if (about.stats?.length) {
  lignes.push(`Statistiques : ${about.stats.map((s) => `${s.valeur}${s.suffixe ?? ''} ${s.label}`).join(' · ')}`);
}

lignes.push(`\n# Compétences`);
for (const d of skills.domaines ?? []) {
  lignes.push(`${d.titre?.texte} : ${d.items.join(', ')}`);
}

lignes.push(`\n# Projets`);
for (const p of projets) {
  lignes.push(
    `## ${p.titre} (${p.annee}, ${p.statut})\nTags : ${(p.tags ?? []).join(', ')}\nStack : ${(p.stack ?? []).join(', ')}\n${p.description}\n${p.resume}${p.lien ? `\nLien : ${p.lien}` : '\nPas de lien public.'}`
  );
}

lignes.push(`\n# Services`);
for (const c of services.cartes ?? []) {
  lignes.push(`- ${c.titre?.texte} : ${c.phrase?.texte}`);
}
lignes.push(`CTA services : ${services.ctaFinalLabel ?? ''}`);

lignes.push(`\n# Contact`);
lignes.push(contact.intro?.texte ?? '');
lignes.push(`Sujets possibles dans le formulaire : ${(contact.sujets ?? []).join(', ')}`);
lignes.push(`Page de contact : /contact`);

lignes.push(`\n# Footer`);
lignes.push(footer.tagline?.texte ?? '');

const knowledgeText = lignes.join('\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(
  outFile,
  `// Fichier généré par scripts/build-knowledge.mjs — ne pas modifier à la main.\nexport const knowledgeText = ${JSON.stringify(knowledgeText)};\n`
);

console.log(`[build-knowledge] Base de connaissances générée (${knowledgeText.length} caractères) → ${outFile}`);
