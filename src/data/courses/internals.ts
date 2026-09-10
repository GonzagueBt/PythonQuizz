import type { CourseSection } from "@/types";

export const internalsCourses: CourseSection[] = [
  {
    id: "internals-cpython-bytecode",
    level: 4,
    topic: "internals",
    title: "CPython, compilation et bytecode",
    summary: "Du code source au bytecode, exécuté par la boucle d'évaluation.",
    order: 1,
    content: `
**CPython** est l'implémentation de référence de Python (celle que vous utilisez par défaut) — un interpréteur écrit en C. D'autres implémentations existent (PyPy, avec compilation JIT ; Jython sur la JVM ; GraalPy), avec des caractéristiques de performance et de comportement mémoire différentes.

Le pipeline d'exécution de CPython : le code source est parsé en un **AST** (Abstract Syntax Tree, module \`ast\`), puis compilé en **bytecode** — un jeu d'instructions de bas niveau pour une machine virtuelle à pile, stocké dans des fichiers \`.pyc\` (cache dans \`__pycache__\`). La boucle d'évaluation (*eval loop*) interprète ensuite ce bytecode instruction par instruction.

\`\`\`python
import dis
def f(x):
    return x + 1
dis.dis(f)
# LOAD_FAST  x
# LOAD_CONST 1
# BINARY_ADD
# RETURN_VALUE
\`\`\`

Ce point est important : Python est **interprété** (pas compilé en code machine natif comme C), ce qui explique une partie de son coût en performance pur, compensé par sa flexibilité et sa vitesse de développement.

Le format exact du bytecode **change entre versions mineures** de Python (c'est un détail d'implémentation CPython, jamais garanti par le langage) — ne jamais s'appuyer dessus pour du code portable.
`,
  },
  {
    id: "internals-references-identity",
    level: 4,
    topic: "internals",
    title: "Références, identité et mutabilité",
    summary: "Ce que fait vraiment une affectation, id(), is vs ==.",
    order: 2,
    content: `
En Python, une variable est un **nom** lié à un **objet** en mémoire — l'affectation ne copie jamais l'objet, elle crée ou déplace une référence :

\`\`\`python
a = [1, 2, 3]
b = a          # b référence le MÊME objet que a
b.append(4)
a              # [1, 2, 3, 4] — a a "changé" car a et b pointent vers le même objet
\`\`\`

\`id(obj)\` retourne un identifiant unique pour la durée de vie de l'objet (en CPython, c'est son **adresse mémoire** — un détail d'implémentation). \`a is b\` équivaut exactement à \`id(a) == id(b)\`.

Les types **immuables** (int, float, str, tuple, frozenset) ne peuvent jamais être modifiés en place : toute "modification" apparente crée en réalité un nouvel objet. Les types **mutables** (list, dict, set, et objets définis par l'utilisateur par défaut) peuvent être modifiés en place, ce qui rend le partage de références visible.

Ce mécanisme explique pourquoi passer une liste à une fonction et la modifier à l'intérieur affecte l'appelant : le paramètre est une référence au même objet (Python passe les arguments « par assignation de référence », parfois appelé *pass-by-object-reference* — ni strictement par valeur, ni par référence au sens C++).
`,
  },
  {
    id: "internals-copy",
    level: 4,
    topic: "internals",
    title: "Copie superficielle vs profonde",
    summary: "copy.copy vs copy.deepcopy, et le piège des listes de listes.",
    order: 3,
    content: `
\`\`\`python
import copy

original = [[1, 2], [3, 4]]
superficielle = copy.copy(original)     # ou original[:] ou list(original)
profonde = copy.deepcopy(original)

superficielle[0].append(99)
# original ET superficielle changent : [[1, 2, 99], [3, 4]]
# la copie superficielle ne copie que le premier niveau — les sous-listes
# restent partagées par référence.

profonde[0].append(99)
# original reste inchangé : deepcopy clone récursivement tout l'arbre d'objets.
\`\`\`

**Piège très fréquent** : \`x = [[]] * 3\` crée une liste contenant **trois références vers la même liste interne** (la multiplication de liste ne clone pas les éléments, elle recopie la référence) :

\`\`\`python
x = [[]] * 3
x[0].append(1)
x   # [[1], [1], [1]] — les trois "listes" sont en fait UNE seule
\`\`\`

La bonne construction est \`[[] for _ in range(3)]\`, qui crée trois objets distincts.

\`deepcopy\` gère correctement les références circulaires (il garde un registre \`memo\` des objets déjà copiés) mais est plus coûteux en temps et mémoire qu'une copie superficielle — à réserver aux structures réellement imbriquées.
`,
  },
  {
    id: "internals-memory-gc",
    level: 4,
    topic: "internals",
    title: "Gestion mémoire et garbage collector",
    summary: "Comptage de références et ramasse-miettes cyclique.",
    order: 4,
    content: `
CPython gère la mémoire principalement par **comptage de références** : chaque objet garde un compteur du nombre de références actives vers lui ; quand ce compteur tombe à zéro, l'objet est immédiatement désalloué. \`sys.getrefcount(obj)\` expose ce compteur (avec un biais de +1 dû à l'argument temporaire de l'appel lui-même).

Le comptage de références seul ne peut pas détecter les **cycles de références** (\`a.ref = b; b.ref = a\`, aucun des deux atteignant zéro même si plus rien à l'extérieur ne les référence). C'est le rôle du **ramasse-miettes générationnel** (\`gc\` module) : il détecte périodiquement ces cycles et les libère.

Le GC de CPython est **générationnel** (3 générations) : les objets récemment créés sont scannés plus souvent, sur l'hypothèse que la plupart des objets meurent jeunes ; un objet qui survit à un cycle de collecte est promu à la génération suivante, scannée moins fréquemment.

\`sys.getsizeof(obj)\` retourne la taille en octets d'un objet **seul** (sans compter récursivement les objets qu'il référence) — pour mesurer la taille réelle d'une structure imbriquée, il faut un parcours récursif manuel.

Ce mécanisme (comptage de références + GC cyclique) est un **détail d'implémentation CPython** : PyPy, par exemple, utilise un GC purement générationnel sans comptage de références, ce qui change subtilement le moment exact où \`__del__\` est appelé.
`,
  },
  {
    id: "internals-interning",
    level: 4,
    topic: "internals",
    title: "Internement des petits entiers et chaînes",
    summary: "Pourquoi `a is b` fonctionne parfois pour des entiers ou strings égaux.",
    order: 5,
    content: `
CPython **interne** (met en cache et réutilise) les petits entiers de \`-5\` à \`256\` : toute création de l'un de ces entiers référence le même objet unique.

\`\`\`python
a = 256; b = 256
a is b        # True — entier interné

a = 257; b = 257
a is b        # False (en général) — nouvel objet à chaque fois, hors optimisations locales
\`\`\`

De même, certaines chaînes de caractères sont internées automatiquement — typiquement les identifiants valides en Python (lettres, chiffres, underscore) créés comme littéraux dans le code source, car le compilateur les déduplique.

**Ce comportement est un détail d'implémentation et d'optimisation CPython, jamais garanti par le langage.** Il peut varier selon le contexte d'exécution (REPL vs script), la version de Python, ou même selon que le code a été compilé ensemble ou non. **Ne jamais utiliser \`is\` pour comparer des valeurs** (entiers, chaînes, etc.) — utilisez toujours \`==\`. \`is\` ne doit servir qu'à comparer l'identité d'objets, typiquement contre les singletons \`None\`, \`True\`, \`False\` (\`x is None\`, jamais \`x == None\`).
`,
  },
  {
    id: "internals-complexity",
    level: 4,
    topic: "internals",
    title: "Complexité des opérations Python",
    summary: "Coûts amortis des opérations sur list, dict, set.",
    order: 6,
    content: `
| Opération | list | dict / set |
|---|---|---|
| Accès par index/clé | O(1) | O(1) amorti |
| Recherche \`in\` | O(n) | O(1) amorti |
| Ajout en fin (\`append\`) | O(1) amorti | O(1) amorti |
| Insertion en tête (\`insert(0, x)\`) | O(n) | — |
| \`pop()\` (fin) | O(1) | — |
| \`pop(0)\` (début) | O(n) | — |

Les listes Python sont implémentées comme des **tableaux dynamiques** (contigus en mémoire, avec sur-allocation) : l'ajout en fin est amorti O(1) grâce à cette sur-allocation, mais l'insertion en début décale tous les éléments — O(n).

\`dict\` et \`set\` sont implémentés avec des **tables de hachage** : la complexité O(1) pour l'accès/recherche est **amortie et moyenne** — dans le pire cas théorique (beaucoup de collisions de hash), elle dégrade vers O(n), mais c'est extrêmement rare en pratique avec de bonnes fonctions de hash.

Pour des insertions/suppressions fréquentes **aux deux extrémités**, préférer \`collections.deque\` (liste doublement chaînée optimisée) à \`list\` : O(1) en tête et en queue, contre O(n) en tête pour une liste.
`,
  },
];
