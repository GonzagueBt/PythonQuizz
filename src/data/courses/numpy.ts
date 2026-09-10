import type { CourseSection } from "@/types";

export const numpyCourses: CourseSection[] = [
  {
    id: "numpy-arrays-basics",
    level: 5,
    topic: "numpy",
    title: "ndarray : shape, dtype, dimensions",
    summary: "L'objet central de NumPy : un tableau typé et homogène.",
    order: 1,
    content: `
Un \`ndarray\` est **homogène** (tous les éléments ont le même type, contrairement à une liste Python) et stocké en mémoire **contiguë**, ce qui permet des opérations vectorisées rapides.

\`\`\`python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
a.shape      # (2, 3) — 2 lignes, 3 colonnes
a.ndim       # 2 dimensions
a.dtype      # dtype('int64') (ou int32 selon la plateforme)
a.size       # 6 (nombre total d'éléments)

np.zeros((3, 3))     # tableau 3x3 de zéros
np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
np.linspace(0, 1, 5) # 5 valeurs équiréparties entre 0 et 1
\`\`\`

\`reshape\` change la forme **sans copier les données** quand c'est possible (vue) : \`a.reshape(3, 2)\` réorganise les 6 éléments en 3 lignes de 2. Le nombre total d'éléments doit rester identique — \`reshape(4, 2)\` sur un tableau de 6 éléments lève une \`ValueError\`.

Le \`dtype\` détermine la taille mémoire et le comportement numérique (\`int32\` peut déborder silencieusement en overflow selon les opérations, contrairement aux \`int\` Python natifs qui ont une précision arbitraire).
`,
  },
  {
    id: "numpy-indexing-slicing",
    level: 5,
    topic: "numpy",
    title: "Indexing, slicing et vues",
    summary: "Pourquoi modifier un slice NumPy modifie l'original.",
    order: 2,
    content: `
\`\`\`python
a = np.array([0, 1, 2, 3, 4, 5])
a[1:4]           # array([1, 2, 3])
a[:, None]        # ajoute une dimension (utile pour le broadcasting)

matrice = np.arange(12).reshape(3, 4)
matrice[1, 2]     # élément ligne 1, colonne 2
matrice[:, 1]     # toute la colonne d'index 1
matrice[0:2, 1:3] # sous-bloc
\`\`\`

**Point crucial, à l'inverse des listes Python** : un slice sur un ndarray retourne une **vue** (référence sur les mêmes données), pas une copie :

\`\`\`python
sous = a[1:4]
sous[0] = 999
a        # array([0, 999, 2, 3, 4, 5]) — l'original a changé !
\`\`\`

Pour obtenir une vraie copie indépendante : \`a[1:4].copy()\`.

Le **fancy indexing** (indexer avec une liste ou un tableau d'indices/booléens) retourne, lui, toujours une **copie** : \`a[[0, 2, 4]]\` ou \`a[a > 2]\` (masque booléen) créent un nouveau tableau, sans lien avec l'original.
`,
  },
  {
    id: "numpy-broadcasting",
    level: 5,
    topic: "numpy",
    title: "Broadcasting",
    summary: "Comment NumPy applique des opérations entre tableaux de formes différentes.",
    order: 3,
    content: `
Le **broadcasting** permet des opérations élément par élément entre tableaux de formes différentes, sans boucle explicite ni copie de données inutile, selon des règles précises :

1. Les formes sont comparées de droite à gauche.
2. Deux dimensions sont compatibles si elles sont égales, ou si l'une d'elles vaut 1.
3. La dimension de taille 1 est "étirée" virtuellement pour correspondre à l'autre.

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])   # shape (2, 3)
b = np.array([10, 20, 30])              # shape (3,)
a + b
# [[11, 22, 33],
#  [14, 25, 36]]
# b est "diffusé" sur chaque ligne de a, sans copie réelle en mémoire
\`\`\`

Un scalaire (shape \`()\`) se diffuse toujours sur n'importe quelle forme : \`a * 2\`.

Si les formes ne sont pas compatibles (ex. \`(2, 3)\` et \`(4,)\`), NumPy lève \`ValueError: operands could not be broadcast together\`. Le broadcasting est ce qui rend le code NumPy à la fois concis et rapide : il évite d'écrire des boucles Python explicites tout en restant lisible.
`,
  },
  {
    id: "numpy-aggregations-masks",
    level: 5,
    topic: "numpy",
    title: "Agrégations et masques booléens",
    summary: "sum, mean, axis, et filtrage par condition.",
    order: 4,
    content: `
\`\`\`python
m = np.array([[1, 2, 3], [4, 5, 6]])

m.sum()          # 21 — somme de tous les éléments
m.sum(axis=0)    # [5, 7, 9]  — somme par colonne (on "écrase" les lignes)
m.sum(axis=1)    # [6, 15]    — somme par ligne (on "écrase" les colonnes)
m.mean()         # 3.5
m.max(axis=1)    # [3, 6]
\`\`\`

**Astuce mnémotechnique pour \`axis\`** : \`axis=0\` agit **le long des lignes** (résultat par colonne), \`axis=1\` agit **le long des colonnes** (résultat par ligne) — c'est l'axe qui **disparaît** dans le résultat.

Les masques booléens filtrent efficacement sans boucle :

\`\`\`python
donnees = np.array([1, -2, 3, -4, 5])
donnees[donnees > 0]           # array([1, 3, 5])
donnees[donnees > 0] = 0       # remplace en place tous les positifs par 0
np.where(donnees > 0, donnees, 0)   # équivalent fonctionnel, sans muter l'original
\`\`\`

\`a > 2\` sur un tableau retourne un tableau de booléens de même forme (comparaison élément par élément), pas un simple \`True\`/\`False\` — c'est ce tableau qui sert ensuite d'indexeur.
`,
  },
];
