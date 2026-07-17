---
titre: "Nimba Educ"
description: "SaaS de gestion scolaire complet : 70+ modèles de données, présence, emplois du temps avec détection de conflits, paiements Mobile Money, synchronisation online/offline."
stack: ["Django", "DRF", "HTMX", "Alpine.js", "Tailwind"]
tags: ["SaaS"]
annee: 2024
statut: "En ligne"
ordre: 2
brouillon: false
misEnAvant: true
---

## Le contexte

Nimba Educ est né d'un constat simple : la plupart des écoles guinéennes géraient encore présences, notes et paiements sur papier ou dans des tableurs dispersés. L'objectif était de construire un SaaS complet, capable de couvrir un établissement de bout en bout, sans dépendre d'une connexion internet permanente.

## L'approche

Le modèle de données compte plus de 70 entités — élèves, classes, enseignants, matières, emplois du temps, présences, évaluations, paiements — pensées pour rester cohérentes même en cas de synchronisation différée. Le moteur d'emploi du temps détecte automatiquement les conflits de salle ou d'enseignant avant validation. Les frais de scolarité s'intègrent aux API Mobile Money (Orange Money, MTN MoMo), avec réconciliation automatique des paiements.

## Résultats

- Synchronisation online/offline fiable sur les postes des secrétariats, même avec des coupures réseau fréquentes.
- Détection de conflits d'emploi du temps qui a éliminé la plupart des doubles réservations de salle.
- Base du produit qui a directement nourri la conception de Ziama Educ, sa version cloud-first.
