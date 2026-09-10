# Python Training Lab

> Learn it. Break it. Understand it.

Une plateforme interactive pour réviser Python — des fondamentaux (variables,
boucles, fonctions) jusqu'aux sujets avancés (métaclasses, GIL, internals
CPython) et aux bibliothèques courantes (NumPy, Pandas, SQL). 100% côté
navigateur, aucun compte, aucun serveur : progression stockée en
`localStorage`, exécution de code Python réelle via [Pyodide](https://pyodide.org)
dans un Web Worker.

Déployée automatiquement sur GitHub Pages via GitHub Actions.

## Sommaire

- [Installation](#installation)
- [Développement local](#développement-local)
- [Fonctionnalités](#fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Ajouter une question](#ajouter-une-question)
- [Créer un nouveau thème](#créer-un-nouveau-thème)
- [Créer un nouveau niveau](#créer-un-nouveau-niveau)
- [Ajouter du contenu de cours](#ajouter-du-contenu-de-cours)
- [Tests](#tests)
- [Déploiement GitHub Pages](#déploiement-github-pages)
- [Choix techniques](#choix-techniques)
- [Limites connues](#limites-connues)

## Installation

Prérequis : Node.js 20+.

```bash
npm install
```

## Développement local

```bash
npm run dev       # serveur de développement (http://localhost:5173)
npm run build     # build de production dans dist/ (tsc + vite build)
npm run preview   # sert le build de production localement
npm test          # lance la suite de tests (vitest)
npm run test:watch
npm run lint      # vérification TypeScript (tsc --noEmit)
```

## Fonctionnalités

- **Accueil** : progression globale, niveaux/thèmes disponibles, questions
  récentes, questions difficiles, boutons *Continuer* / *Révision rapide* /
  *Mode aléatoire*.
- **Cours** : notions théoriques synthétiques par niveau/thème, en Markdown
  avec coloration syntaxique.
- **Exercices** : filtrage par niveau, thème, difficulté et type de question ;
  lancement d'une session dans l'ordre ou mélangée.
- **Mode entraînement** : correction immédiate, indices progressifs (3
  niveaux), panneau « Besoin d'aide ? » lié au cours (sans jamais donner la
  réponse), explication pédagogique détaillée après chaque réponse (y
  compris pourquoi les mauvaises options d'un QCM sont fausses).
- **Mode examen** : sélection du niveau/thèmes/nombre de questions, minuteur
  optionnel, aucune correction pendant l'épreuve, écran de résultats avec
  score, corrections complètes et thèmes faibles identifiés.
- **Révision** : erreurs jamais réussies, questions marquées difficiles
  (manuellement ou automatiquement selon le taux de réussite), favoris, et
  un moteur *« Que dois-je réviser ? »* qui analyse l'historique local par
  tag/sous-thème pour proposer des sessions ciblées.
- **Progression** : taux de réussite global/par thème/par difficulté,
  streak de jours consécutifs, historique des examens — 100% recalculé à
  partir de `localStorage`, sans backend.
- **8 types de questions** réellement implémentés et validés : QCM (mono/multi),
  Vrai/Faux, réponse textuelle, prédiction de sortie, compléter le code,
  associer, classer, et **écrire du code** avec exécution réelle des tests
  via Pyodide dans un Web Worker (timeout + `terminate()` en cas de boucle
  infinie).

## Structure du projet

```text
src/
  main.tsx, App.tsx, index.css      # bootstrap, routes, styles Tailwind
  types/                             # types TypeScript stricts (Question, CourseSection, ProgressState...)
  data/
    courses/                         # contenu de cours par thème (12 fichiers)
    questions/                       # banque de questions par thème (12 fichiers)
  engine/                            # logique pure, testée, indépendante de React
    validation.ts                    # correction des réponses par type de question
    draft.ts                         # état de saisie initial / complétude par type
    progressStore.ts                 # persistance localStorage, streak, favoris
    stats.ts                         # agrégation des statistiques
    selection.ts                     # filtrage, mélange, sélection pondérée pour la révision
    smartReview.ts                   # moteur "Que dois-je réviser ?"
    pyodideRunner.ts / pyodideWorker.ts  # exécution de code Python sandboxée
  components/
    ui/                               # atomes (Button, Card, Badge, CodeBlock, RichText...)
    layout/                           # Header, Layout
    question/                         # QuestionPlayer + un composant de saisie par type
    charts/                           # graphique en barres SVG minimal
  pages/                              # une page par route
  hooks/                              # useTheme, useProgress (contexte + persistance)
  test/                               # tests vitest (moteur + intégrité des données)
```

Chaque question est un objet TypeScript **autonome** (voir `src/types/question.ts`) :
prompt, difficulté, thème, tags, indices progressifs, explication, et
éventuellement un lien vers une section de cours (`courseId`). Aucune
dépendance entre questions.

## Ajouter une question

1. Ouvrez le fichier du thème concerné dans `src/data/questions/` (ex.
   `fundamentals.ts`).
2. Ajoutez un objet respectant le type `Question` (union discriminée par
   `type` — TypeScript vous guide sur les champs requis selon le type
   choisi : `multiple-choice`, `true-false`, `text`, `code-output`,
   `fill-code`, `matching`, `ordering`, `code-editor`).
3. Donnez-lui un `id` unique (convention : `<prefixe-theme>-<numéro>`, ex.
   `fund-031`) — un test d'intégrité (`dataIntegrity.test.ts`) échoue en cas
   de doublon.
4. Renseignez `hints` (1 à 3 indices progressifs, du plus vague au plus
   précis) et `explanation` (pédagogique, complète).
5. Si pertinent, reliez la question à une section de cours existante via
   `courseId` (voir `src/data/courses/<theme>.ts` pour les ids disponibles).
6. Ajoutez le fichier à `src/data/questions/index.ts` s'il n'y est pas déjà
   (les 12 thèmes existants sont déjà agrégés).

Exemple minimal (QCM) :

```ts
{
  id: "fund-031",
  type: "multiple-choice",
  kind: "knowledge",
  level: 1,
  topic: "fundamentals",
  subtopics: ["str"],
  difficulty: 1,
  cognitiveLevel: "decouverte",
  tags: ["str", "methods"],
  prompt: "Quelle méthode retourne une chaîne en majuscules ?",
  hints: ["C'est une méthode de str.", "Elle fait 5 lettres."],
  explanation: "`str.upper()` retourne une nouvelle chaîne en majuscules...",
  options: [
    { id: "a", text: "upper()", correct: true },
    { id: "b", text: "capitalize()", correct: false, whyWrong: "capitalize() ne met en majuscule que le premier caractère." },
  ],
}
```

Pour un exercice de code (`code-editor`), les tests sont définis comme des
expressions Python évaluées dans le namespace du code de l'étudiant :

```ts
testCases: [
  { call: "is_even(4)", expected: true, description: "4 est pair" },
]
```

## Créer un nouveau thème

1. Ajoutez le slug dans `TOPICS` et un libellé dans `TOPIC_LABELS`
   (`src/types/question.ts`).
2. Créez `src/data/courses/<theme>.ts` et `src/data/questions/<theme>.ts`
   (copiez la structure d'un thème existant).
3. Importez-les dans `src/data/courses/index.ts` et
   `src/data/questions/index.ts`.

Le thème apparaît automatiquement dans les filtres (Exercices, Examen) et
sur la page d'accueil — aucune autre modification n'est nécessaire.

## Créer un nouveau niveau

1. Ajoutez la valeur au type `Level` et un libellé dans `LEVEL_LABELS`
   (`src/types/question.ts`).
2. Utilisez ce niveau dans vos questions/cours (`level: 7`, par exemple).

Les pages Accueil/Cours/Exercices/Examen itèrent sur les niveaux définis
dynamiquement, aucune référence en dur.

## Ajouter du contenu de cours

Les sections de cours (`CourseSection`) sont du Markdown simple (titres,
listes, gras, blocs de code ```python``` avec coloration syntaxique) rendu
via `react-markdown`. Elles sont indépendantes des questions ; une question
s'y réfère via `courseId` pour le panneau « Besoin d'aide ? ».

## Tests

```bash
npm test
```

La suite couvre le moteur (pas les composants React, volontairement) :
correction des réponses pour chaque type de question, normalisation de
texte/sortie, persistance et calcul de streak, filtrage et sélection
pondérée pour la révision, calcul des statistiques, moteur de suggestion
de révision, et un ensemble de tests d'**intégrité de la banque de
questions** (ids uniques, `courseId` valides, QCM avec au moins une bonne
réponse, cohérence des exercices de classement/complétion/code).

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` s'exécute à chaque push sur
`main` : installation, tests, vérification TypeScript, build, puis
déploiement du dossier `dist/` sur GitHub Pages via les actions officielles
(`upload-pages-artifact` + `deploy-pages`).

Configuration côté dépôt (une seule fois) : **Settings → Pages → Source :
GitHub Actions**.

Le `base` Vite est fixé dans `vite.config.ts` sur `/PythonQuizz/`, pour
correspondre à l'URL `https://<votre-utilisateur>.github.io/PythonQuizz/`.
Si vous renommez le dépôt ou déployez ailleurs, ajustez cette valeur (ou
définissez la variable d'environnement `VITE_BASE_PATH` au moment du
build). Le routage utilise `HashRouter` (URLs en `#/...`) pour fonctionner
sans configuration serveur supplémentaire sur GitHub Pages.

## Choix techniques

- **React 18 + TypeScript + Vite** : stack simple, rapide, sans backend.
- **Tailwind CSS** pour un design cohérent clair/sombre sans surcharge de
  classes custom.
- **react-router-dom (HashRouter)** : compatible GitHub Pages sans réécriture
  serveur.
- **CodeMirror** (`@uiw/react-codemirror`) pour l'éditeur de code (coloration
  Python, numéros de ligne) — plus léger que Monaco pour ce cas d'usage.
- **Pyodide**, chargé à la demande depuis le CDN dans un **Web Worker
  dédié** : permet une exécution Python réelle et sandboxée dans le
  navigateur, avec un vrai timeout (`worker.terminate()`) qui stoppe
  effectivement une boucle infinie côté étudiant — un `setTimeout` sur le
  thread principal ne le permettrait pas.
- **localStorage** pour la progression : aucun compte, aucune donnée envoyée
  à un serveur.
- **prism-react-renderer / react-markdown** pour la coloration syntaxique et
  le contenu de cours.

## Limites connues

- L'exécution de code nécessite un navigateur supportant les Web Workers
  (tous les navigateurs modernes) ; un message explicite s'affiche sinon.
- Le premier lancement d'un exercice de code télécharge Pyodide depuis le
  CDN (quelques Mo, mis en cache par le navigateur ensuite) — un délai de
  quelques secondes est normal au premier `▶ Exécuter les tests`.
- La comparaison de texte/sortie est normalisée mais reste littérale (pas
  d'évaluation sémantique de code arbitraire côté QCM/texte) ; les exercices
  `code-editor` sont le seul type qui exécute réellement le code écrit.
