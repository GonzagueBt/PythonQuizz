import type { CourseSection } from "@/types";

export const gotchasCourses: CourseSection[] = [
  {
    id: "gotchas-mutable-defaults",
    level: 2,
    topic: "gotchas",
    title: "Arguments par défaut mutables",
    summary: "Le piège le plus classique de Python.",
    order: 1,
    content: `
Les valeurs par défaut d'une fonction sont évaluées **une seule fois**, au moment de la définition (\`def\`), et non à chaque appel :

\`\`\`python
def f(x, historique=[]):
    historique.append(x)
    return historique

f(1)   # [1]
f(2)   # [1, 2]  <- même liste réutilisée entre appels !
\`\`\`

L'objet liste par défaut est créé une fois, attaché à la fonction elle-même (visible via \`f.__defaults__\`), et **partagé** entre tous les appels qui n'overrident pas ce paramètre. Ce comportement est **garanti par le langage** (pas un détail CPython) — c'est une conséquence directe du modèle d'exécution des définitions de fonction.

Solution standard : utiliser \`None\` comme sentinelle et créer l'objet mutable à l'intérieur du corps de la fonction :

\`\`\`python
def f(x, historique=None):
    if historique is None:
        historique = []
    historique.append(x)
    return historique
\`\`\`

Ce piège touche tous les types mutables par défaut : \`list\`, \`dict\`, \`set\`, ou toute instance mutable d'une classe utilisateur.
`,
  },
  {
    id: "gotchas-identity-caching",
    level: 4,
    topic: "gotchas",
    title: "is vs ==, et le cache des petits entiers",
    summary: "Pourquoi `a is b` peut être True ou False selon la valeur.",
    order: 2,
    content: `
\`\`\`python
a = 256
b = 256
a is b        # True — CPython interne les entiers de -5 à 256

a = 257
b = 257
a is b        # False (en général) — hors de la plage internée
\`\`\`

Ce comportement est un **détail d'implémentation et d'optimisation de CPython**, jamais garanti par la spécification du langage. Il peut même varier selon le contexte (deux littéraux \`257\` dans la **même** ligne de code source peuvent être dédupliqués par le compilateur et donner \`is True\`, alors qu'ils viendraient de deux calculs séparés à l'exécution, non).

**Règle absolue** : ne jamais utiliser \`is\` pour comparer des valeurs numériques, des chaînes, ou tout objet où seule l'**égalité** compte. \`is\` doit être réservé à la comparaison d'identité contre des singletons connus : \`x is None\`, \`x is True\`, \`x is False\`. Utiliser \`==\` pour toute comparaison de valeur.

\`True == 1\` et \`False == 0\` sont \`True\` car \`bool\` est une **sous-classe** de \`int\` en Python — un choix de conception du langage, pas un hasard d'implémentation.
`,
  },
  {
    id: "gotchas-list-multiplication",
    level: 2,
    topic: "gotchas",
    title: "Multiplication de listes imbriquées",
    summary: "`[[]] * 3` ne crée pas trois listes indépendantes.",
    order: 3,
    content: `
\`\`\`python
x = [[]] * 3
x[0].append(1)
x        # [[1], [1], [1]] — pas [[1], [], []] !
\`\`\`

\`[[]] * 3\` duplique la **référence** vers l'unique liste interne trois fois, sans jamais créer de nouvel objet liste. Les trois éléments de \`x\` pointent donc vers **le même objet** — modifier l'un modifie apparemment "les trois", car il n'y en a en réalité qu'un.

Ce comportement découle directement de la sémantique de \`*\` sur les séquences : c'est une duplication de **références**, pas un clonage profond des éléments — cohérent avec le fait que Python ne copie jamais implicitement les objets lors d'une affectation.

La construction correcte utilise une compréhension, qui évalue \`[]\` à **chaque itération**, créant bien trois objets distincts :

\`\`\`python
x = [[] for _ in range(3)]
x[0].append(1)
x        # [[1], [], []]
\`\`\`

Ce même principe s'applique à \`[{}] * 3\` (dictionnaires partagés) et à toute structure mutable.
`,
  },
  {
    id: "gotchas-aliasing",
    level: 1,
    topic: "gotchas",
    title: "Aliasing : `b = a` ne copie rien",
    summary: "Deux noms, un seul objet mutable.",
    order: 4,
    content: `
\`\`\`python
a = [1, 2, 3]
b = a           # b et a référencent le MÊME objet liste
b.append(4)
a               # [1, 2, 3, 4] — "a" a changé alors qu'on n'a modifié que "b" !
\`\`\`

L'affectation \`b = a\` ne copie jamais l'objet : elle crée une seconde étiquette pointant vers le même objet en mémoire (\`a is b\` vaut \`True\`). Toute mutation via l'une des deux références est donc visible via l'autre.

Pour obtenir une copie indépendante : \`b = a.copy()\`, \`b = a[:]\`, ou \`b = list(a)\` (copie superficielle — suffisante pour une liste plate de valeurs immuables ; insuffisante pour une liste de listes, voir le cours sur la copie profonde).

Ce même piège survient très souvent avec les **arguments de fonction** : passer une liste à une fonction qui la modifie en place affecte l'appelant, car aucune copie n'est faite au passage :

\`\`\`python
def vider(liste):
    liste.clear()

donnees = [1, 2, 3]
vider(donnees)
donnees   # [] — la fonction a modifié l'original, pas une copie
\`\`\`
`,
  },
  {
    id: "gotchas-floats",
    level: 2,
    topic: "gotchas",
    title: "Imprécision des flottants",
    summary: "Pourquoi 0.1 + 0.2 != 0.3.",
    order: 5,
    content: `
\`\`\`python
0.1 + 0.2            # 0.30000000000000004
0.1 + 0.2 == 0.3      # False !
\`\`\`

Les nombres flottants sont stockés en **binaire à virgule flottante double précision** (norme IEEE 754), qui ne peut représenter **exactement** que certaines fractions (puissances de 2). \`0.1\` et \`0.2\` n'ont pas de représentation binaire exacte, tout comme \`1/3\` n'a pas de représentation décimale exacte. Ce n'est **pas un bug de Python** — c'est le comportement standard de tout langage utilisant IEEE 754 (C, Java, JavaScript...).

Pour comparer des flottants, ne jamais utiliser \`==\` directement — utiliser une tolérance :

\`\`\`python
import math
math.isclose(0.1 + 0.2, 0.3)   # True — tolérance relative configurable
\`\`\`

Pour des calculs nécessitant une précision décimale exacte (finance, comptabilité), utiliser \`decimal.Decimal\` plutôt que \`float\` :

\`\`\`python
from decimal import Decimal
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")   # True
\`\`\`
`,
  },
  {
    id: "gotchas-late-binding-closures",
    level: 3,
    topic: "gotchas",
    title: "Closures et liaison tardive dans les boucles",
    summary: "Pourquoi toutes les lambdas d'une boucle renvoient la même valeur.",
    order: 6,
    content: `
\`\`\`python
fonctions = [lambda: i for i in range(3)]
[f() for f in fonctions]   # [2, 2, 2], pas [0, 1, 2] !
\`\`\`

Une closure capture la **variable** \`i\` elle-même (par référence à la portée englobante), pas sa valeur au moment de la création de la lambda. Toutes les lambdas de la liste partagent donc la même variable \`i\`, qui vaut \`2\` (sa dernière valeur) une fois la boucle terminée — c'est ce que chaque \`f()\` observe, quel que soit le moment de sa création.

C'est un exemple de **liaison tardive** (*late binding*) : le nom est résolu au moment de l'**appel**, pas au moment de la **définition**.

Correction classique : forcer l'évaluation immédiate via un argument par défaut (les valeurs par défaut, elles, **sont** évaluées à la définition — voir le piège des arguments mutables) :

\`\`\`python
fonctions = [lambda i=i: i for i in range(3)]
[f() for f in fonctions]   # [0, 1, 2]
\`\`\`

Ce piège touche aussi bien les lambdas que les fonctions imbriquées classiques créées en boucle.
`,
  },
];
