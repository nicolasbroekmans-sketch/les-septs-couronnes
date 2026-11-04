# Rapport — Phase 1 : première version jouable

## Audit de départ
- **Existant** : une expérience de visite en 3D (intro, cartes SVG, 16 lieux procéduraux), sans aucun système de jeu. `world3d.js` faisait 721 lignes, `map.js` 334 lignes et `generic.js` 303 lignes.
- **Bug signalé** (grand rectangle noir à l'écran) : une valeur HDR infinie ou NaN, venant du soleil de l'HDRI ou des reflets, était étalée par le flou du bloom. **Corrigé** par une passe `SAFE` placée avant le bloom (`js/engine/Renderer.js`) : elle neutralise les NaN et l'infini et plafonne la luminance.
- **Icônes ◐ / 🔊** (emojis mal rendus) : remplacées par des icônes SVG, et masquées en cours de partie.
- **Bandeau « Advanced Stats… UPGRADE TO PRO »** : il ne vient pas de ce projet mais d'une autre extension WordPress installée sur le site.

## Choix techniques
- **Navigateur, modules ES sans compilation, Three.js r170.** Raison : compatible avec l'extension WordPress existante, sans chaîne de build à maintenir, et la logique reste testable dans Node.
- **TypeScript et React Three Fiber écartés pour cette phase**, car ils imposent une étape de compilation, ce que l'intégration WordPress actuelle ne permet pas. Le JSDoc et les tests Node compensent l'absence de typage.
- **Godot écarté** : l'export web est lourd et s'intègre mal dans WordPress.
- **Modèles humains** : Mixamo et Sketchfab demandent une connexion à un compte, que je n'ai pas. Les personnages sont donc des humanoïdes procéduraux articulés et animés par le code. L'architecture permet de les remplacer plus tard par des modèles GLTF riggés.

## Fonctionnalités terminées
Voir la section « Ce qui est jouable » du README. Les 15 points de la première version demandée sont implémentés et reliés entre eux.

## Tests exécutés
| Suite | Résultat |
|---|---|
| `npm test` (27 tests Node) | 27 / 27 réussis |
| `npm run audit` (lignes, imports, exports, cycles, ressources) | aucun problème |
| `tools/train-tactics.mjs` (entraînement et évaluation sur 400 duels inédits) | réseau 78 % de victoires, utilitaire 53 %, aléatoire 5 % |
| `tests/e2e/rpg-flow.mjs` (navigateur réel, scénario complet) | 12 / 12 étapes réussies, 0 erreur JavaScript |

## Bugs corrigés pendant la phase
- Rectangle noir du bloom (NaN ou infini dans le rendu HDR).
- La liste des sauvegardes lisait aussi l'entrée des réglages, ce qui plantait le menu principal. Un test de non-régression a été ajouté.
- L'IA utilitaire ne fuyait pas à faible moral et attaquait sous la menace : poids corrigés et test ajouté.
- Le marchand méfiant restait aimable, parce que la priorité des nœuds de dialogue était mauvaise.

- Combat de Winterfell trop difficile au niveau 1 (le personnage est mort lors d'un essai) : camp ramené à 3 déserteurs, chef à l'épée longue (100 PV).
- Portée d'interaction portée à 3,5 m (les PNJ flâneurs sortaient de portée).

## Problèmes restants et limites connues
- Les performances n'ont été mesurées qu'en rendu logiciel (SwiftShader), donc lentement. Elles restent à mesurer sur un vrai GPU.
- Il n'y a ni rig ni animations capturées : les animations sont procédurales.
- Les voyages entre régions, les compagnons, les armées et la gestion de domaine ne sont pas encore développés (phases 4 et 6).

## Prochaine étape (phase 4)
Carte du monde jouable pour voyager entre les trois régions, avec temps de trajet, événements (embuscade, marchand, trésor) et brouillard de guerre. Puis les premières régions d'Essos (Braavos, Pentos).
