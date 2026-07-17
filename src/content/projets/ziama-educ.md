---
titre: "Ziama Educ"
description: "Gestion scolaire cloud-first et résiliente hors-ligne pour les écoles guinéennes. Paiements des frais par Mobile Money, expérience parents au premier plan."
stack: ["Django 5", "DRF", "HTMX", "Alpine.js", "PostgreSQL"]
tags: ["SaaS"]
annee: 2026
statut: "En cours"
ordre: 1
brouillon: false
misEnAvant: true
---

## Le contexte

Après Nimba Educ, plusieurs directions d'écoles m'ont demandé une version plus légère à déployer, pensée dès le départ pour les connexions instables et l'usage mobile des parents. Ziama Educ reprend les acquis du premier produit et les reconstruit sur une architecture cloud-first plus simple à opérer.

## L'approche

Le backend Django 5 / DRF expose une API claire consommée par des interfaces HTMX + Alpine.js : peu de JavaScript, des pages qui restent rapides même sur un réseau 3G, et un rendu serveur qui limite les surprises hors-ligne. Les paiements de frais scolaires passent par les API Mobile Money (Orange Money, MTN MoMo), avec un suivi des transactions visible aussi bien par l'administration que par les parents.

## Ce qui compte

- **Expérience parents en premier plan** : suivi des frais, des présences et des résultats sans créer de compte compliqué.
- **Résilience réseau** : les écrans critiques (présence, paiement) sont conçus pour tolérer une connexion intermittente.
- **Déploiement progressif** : le produit est actuellement en cours de déploiement pilote dans plusieurs établissements de Conakry.

Le projet est encore en développement actif — cette fiche sera mise à jour au fil des jalons.
