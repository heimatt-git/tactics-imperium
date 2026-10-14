# TACTICS: Imperium

Army builder (constructeur de listes d'armée) **gratuit, de fan et non officiel** pour Warhammer 40,000, fondé sur les règles de fans « Dust Imperium » (Ork, Space Marines, Astra Militarum, Chevaliers Impériaux, Chaos Space Marines).

Ce site n'est pas affilié à Games Workshop. Warhammer 40,000 et ses marques appartiennent à leurs ayants droit. Aucun logo ni emblème officiel n'est utilisé ; les textes de compétences sont reformulés. Les photos viennent de fans et restent la propriété de leurs auteurs.

## Contenu

Builder de listes, cartes d'unités générées, export PDF/PNG, collection personnelle, Shot Format (parties courtes), atelier de créations, éditeur de base, français/anglais, deux thèmes (acier et rouge sang, machine antique), site installable sur téléphone.

## Corriger une erreur

Ouvrez un ticket sur le dépôt GitHub (Issues) : « Signaler une erreur d'unité » ou « Proposer une photo ».

## Pour les mainteneurs

- `node scripts/validate.mjs` : vérifie la base de données (`data/`).
- `node scripts/bump-version.mjs` : change la version anti-cache.
- Voir le site en local : `python3 -m http.server 8000`.
- L'éditeur de base (`editeur-2k26hdl.html`) publie sur GitHub avec un jeton personnel qui reste dans le navigateur. Fermez-le avant de déposer des fichiers à la main dans `data/`.
- `js/rules.js` contient encore les règles de construction d'origine : à adapter.
