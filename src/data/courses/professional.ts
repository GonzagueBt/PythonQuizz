import type { CourseSection } from "@/types";

export const professionalCourses: CourseSection[] = [
  {
    id: "professional-testing",
    level: 3,
    topic: "professional",
    title: "Tests unitaires et pytest",
    summary: "Écrire des tests fiables, isoler les dépendances avec mock.",
    order: 1,
    content: `
\`\`\`python
# test_calcul.py
from calcul import addition

def test_addition_positifs():
    assert addition(2, 3) == 5

def test_addition_leve_sur_types_invalides():
    import pytest
    with pytest.raises(TypeError):
        addition("a", 1)
\`\`\`

\`pytest\` découvre automatiquement les fichiers \`test_*.py\`/\`*_test.py\` et les fonctions \`test_*\` — aucune classe requise (contrairement à \`unittest\`). Les **fixtures** (\`@pytest.fixture\`) fournissent des données/ressources réutilisables et proprement nettoyées entre tests, injectées simplement en paramètre de la fonction de test.

\`unittest.mock.patch\` remplace temporairement une dépendance externe (appel réseau, horloge système, base de données) par un objet contrôlé, pour tester une unité de code **isolément** :

\`\`\`python
from unittest.mock import patch

@patch("module.requests.get")
def test_appel_api(mock_get):
    mock_get.return_value.status_code = 200
    ...
\`\`\`

Un bon test unitaire est **rapide**, **déterministe** (même résultat à chaque exécution) et **isolé** (ne dépend pas de l'ordre d'exécution des autres tests, ni d'un état partagé).
`,
  },
  {
    id: "professional-packaging",
    level: 3,
    topic: "professional",
    title: "Packaging et dépendances",
    summary: "pyproject.toml, requirements, environnements virtuels.",
    order: 2,
    content: `
Un environnement virtuel isole les dépendances d'un projet :

\`\`\`bash
python -m venv .venv
source .venv/bin/activate   # Windows : .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

\`requirements.txt\` liste des dépendances figées (\`requests==2.31.0\`), garantissant des builds reproductibles. \`pyproject.toml\` (standard moderne, PEP 621) unifie métadonnées du projet, dépendances et configuration des outils (formatteur, linter, test runner) en un seul fichier :

\`\`\`toml
[project]
name = "mon-projet"
version = "1.0.0"
dependencies = ["requests>=2.31,<3"]

[project.optional-dependencies]
dev = ["pytest>=8.0", "ruff>=0.5"]
\`\`\`

Épingler une version exacte (\`==\`) garantit la reproductibilité mais peut bloquer des correctifs de sécurité ; une contrainte de plage (\`>=2.31,<3\`) suit les correctifs mineurs tout en évitant les changements majeurs cassants (en supposant le respect du *semantic versioning* par le paquet).
`,
  },
  {
    id: "professional-tooling",
    level: 3,
    topic: "professional",
    title: "Linting, formatting et vérification de types",
    summary: "Outils qui attrapent les bugs avant l'exécution.",
    order: 3,
    content: `
Trois catégories d'outils statiques, complémentaires :

- **Formatage** (\`black\`, \`ruff format\`) : réécrit automatiquement le code selon un style unique, éliminant les débats de style en revue de code.
- **Linting** (\`ruff\`, \`flake8\`, \`pylint\`) : détecte les erreurs probables et mauvaises pratiques (variable non utilisée, import manquant, complexité excessive) sans exécuter le code.
- **Vérification de types** (\`mypy\`, \`pyright\`) : vérifie la cohérence des annotations de type déclarées, attrapant des bugs qui ne se manifesteraient qu'à l'exécution avec certaines entrées.

Ces outils s'exécutent typiquement en **pre-commit hook** (avant chaque commit git) et/ou en **CI** (à chaque push), formant un filet de sécurité avant que le code n'atteigne la branche principale.

Aucun de ces outils ne remplace les tests : le linting/typing attrape des classes d'erreurs *statiques* (structure du code), les tests valident le *comportement* réel à l'exécution — les deux sont complémentaires, pas substituables l'un à l'autre.
`,
  },
  {
    id: "professional-git-cicd",
    level: 3,
    topic: "professional",
    title: "Git et CI/CD",
    summary: "Workflow de collaboration et intégration continue.",
    order: 4,
    content: `
Un workflow Git courant : créer une branche par fonctionnalité (\`git checkout -b feature/x\`), committer par petits incréments logiques avec des messages clairs, ouvrir une **pull request** pour revue de code avant de fusionner dans la branche principale.

\`git rebase\` réécrit l'historique (à éviter sur une branche déjà partagée/poussée) ; \`git merge\` préserve l'historique complet avec un commit de fusion. Un \`.gitignore\` bien configuré évite de committer des artefacts générés (\`__pycache__\`, \`.venv\`, fichiers de build).

L'**intégration continue** (CI) exécute automatiquement, à chaque push, une suite d'étapes de validation (installation des dépendances, lint, tests, build) — GitHub Actions, GitLab CI et CircleCI en sont des implémentations courantes. Le **déploiement continu** (CD) automatise ensuite la mise en production d'une version validée.

Bonne pratique : la CI doit échouer **rapidement** sur la première étape cassée (fail-fast), et le pipeline doit rester **reproductible** — le même commit doit toujours produire le même résultat, qu'il tourne en local ou sur le serveur de CI.
`,
  },
];
