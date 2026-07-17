---
titre: "Atlas des OSC de Guinée"
description: "Cartographie de la société civile guinéenne : 1 869 OSC recensées, consolidées et validées (dédoublonnage flou, contrôle GPS), avec l'ONG Ouvrir Les Horizons."
stack: ["Laravel", "Livewire", "KoboToolbox"]
tags: ["Civic Tech", "Data"]
annee: 2024
statut: "En ligne"
ordre: 3
brouillon: false
misEnAvant: true
---

## Le contexte

L'ONG Ouvrir Les Horizons voulait disposer d'une vue d'ensemble fiable des organisations de la société civile (OSC) guinéenne, jusque-là dispersée dans des registres partiels et des fichiers non harmonisés. L'Atlas des OSC de Guinée est né de ce besoin : un recensement nationale, consolidé et vérifié.

## L'approche

La collecte terrain s'est appuyée sur KoboToolbox, avec des enquêteurs déployés dans les huit régions administratives du pays. Les données remontées ont ensuite été nettoyées via un pipeline de dédoublonnage flou (correspondance approximative de noms d'organisations, tolérante aux variantes d'orthographe et de transcription) et un contrôle de cohérence GPS pour écarter les coordonnées aberrantes. La plateforme finale, en Laravel/Livewire, permet d'explorer les organisations recensées par région, secteur d'intervention et statut juridique.

## Résultats

- **1 869 organisations** recensées, consolidées et validées.
- Un outil de référence utilisé par l'ONG et ses partenaires pour orienter leurs actions de renforcement de la société civile.
- Une méthodologie de nettoyage de données réutilisée depuis sur d'autres projets de cartographie.

*L'Atlas est un outil interne à l'ONG Ouvrir Les Horizons et n'a pas d'accès public — pas de lien de démonstration pour cette fiche.*
