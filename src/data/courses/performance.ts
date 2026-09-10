import type { CourseSection } from "@/types";

export const performanceCourses: CourseSection[] = [
  {
    id: "performance-big-o",
    level: 5,
    topic: "performance",
    title: "Complexité algorithmique (Big O)",
    summary: "Raisonner sur le passage à l'échelle, pas seulement la vitesse brute.",
    order: 1,
    content: `
La notation Big O décrit comment le **temps** (ou la mémoire) d'un algorithme croît avec la taille de l'entrée \`n\`, en ignorant les constantes. Ordres courants du plus rapide au plus lent : \`O(1)\` < \`O(log n)\` < \`O(n)\` < \`O(n log n)\` < \`O(n²)\` < \`O(2ⁿ)\`.

\`\`\`python
# O(n) : une recherche linéaire dans une liste
def contient(liste, x):
    return x in liste

# O(1) amorti : une recherche dans un set/dict
def contient_rapide(ensemble, x):
    return x in ensemble
\`\`\`

Un piège classique : une boucle contenant un \`in\` sur une liste à l'intérieur d'une autre boucle produit un coût **O(n²)**, alors que remplacer la liste par un \`set\` ramène le tout à **O(n)**.

La complexité asymptotique ne dit rien des **constantes cachées** : un algorithme O(n) avec une lourde constante peut être plus lent qu'un O(n log n) optimisé, pour des \`n\` petits ou modérés. C'est pourquoi il faut toujours **mesurer**, pas seulement raisonner en théorie.
`,
  },
  {
    id: "performance-profiling",
    level: 5,
    topic: "performance",
    title: "Profiling : timeit et cProfile",
    summary: "Mesurer avant d'optimiser.",
    order: 2,
    content: `
« *Premature optimization is the root of all evil* » — toujours mesurer avant d'optimiser.

\`timeit\` mesure précisément le temps d'exécution d'un petit bout de code, en répétant l'exécution pour lisser le bruit et en désactivant le GC pendant la mesure :

\`\`\`python
import timeit
timeit.timeit("[x**2 for x in range(1000)]", number=1000)
\`\`\`

\`cProfile\` profile un programme entier, fonction par fonction, en indiquant le nombre d'appels et le temps cumulé/propre par fonction — idéal pour trouver **où** est le goulot d'étranglement avant d'optimiser à l'aveugle :

\`\`\`python
python -m cProfile -s cumulative mon_script.py
\`\`\`

Règle empirique (loi de Pareto) : dans la plupart des programmes, ~80% du temps est passé dans ~20% du code. Profiler permet de cibler l'effort d'optimisation là où il aura un impact réel, plutôt que de micro-optimiser du code déjà rapide.
`,
  },
  {
    id: "performance-idioms",
    level: 5,
    topic: "performance",
    title: "Idiomes performants et lru_cache",
    summary: "Compréhensions vs boucles, générateurs, mémoïsation.",
    order: 3,
    content: `
Les compréhensions de liste sont généralement plus rapides qu'une boucle \`for\` équivalente avec \`.append()\`, car la boucle de construction est exécutée en code C interne à CPython plutôt qu'en bytecode interprété pas à pas.

Pour des séquences volumineuses qu'on ne parcourt qu'une fois, une expression génératrice économise la mémoire en évitant de matérialiser toute la liste :

\`\`\`python
somme = sum(x**2 for x in range(10**8))   # mémoire quasi constante
\`\`\`

\`functools.lru_cache\` mémoïse automatiquement les résultats d'une fonction pure selon ses arguments, transformant par exemple un Fibonacci naïf exponentiel en linéaire :

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
\`\`\`

Le cache est indexé par les arguments (qui doivent être **hashables**) — inadapté si les arguments changent à chaque appel ou si la fonction a des effets de bord dépendant d'un état externe. \`maxsize=None\` désactive la limite (cache illimité, attention à la mémoire pour des entrées très variées).
`,
  },
  {
    id: "performance-cpu-io-bound",
    level: 5,
    topic: "performance",
    title: "CPU-bound vs I/O-bound",
    summary: "Diagnostiquer le type de goulot d'étranglement avant de choisir une stratégie.",
    order: 4,
    content: `
Un programme **CPU-bound** passe le plus clair de son temps à calculer (boucles, calculs numériques) — le processeur est le facteur limitant. Un programme **I/O-bound** passe le plus clair de son temps à **attendre** (réseau, disque, base de données) — le processeur est inactif la plupart du temps.

Cette distinction guide le choix de stratégie de parallélisation :

- **I/O-bound** → \`threading\` ou \`asyncio\` fonctionnent très bien : pendant qu'une tâche attend une réponse réseau, une autre peut avancer, malgré le GIL (voir le cours sur la concurrence).
- **CPU-bound** → le GIL empêche deux threads Python d'exécuter du bytecode simultanément sur des cœurs différents ; il faut \`multiprocessing\` (des processus séparés, chacun avec son propre interpréteur et sa mémoire) pour exploiter plusieurs cœurs, ou déléguer le calcul lourd à une bibliothèque en C qui relâche le GIL (NumPy, par exemple).

Diagnostiquer : un programme qui sature un cœur CPU à 100% pendant son exécution est CPU-bound ; un programme dont l'utilisation CPU reste faible alors qu'il "prend du temps" est I/O-bound.
`,
  },
  {
    id: "performance-numpy-vectorization",
    level: 5,
    topic: "performance",
    title: "Vectorisation avec NumPy",
    summary: "Pourquoi les opérations vectorisées battent les boucles Python pures.",
    order: 5,
    content: `
Une boucle Python pure sur un grand tableau paie le coût de l'interprétation bytecode à **chaque itération**. NumPy, lui, délègue les boucles à du code C compilé et optimisé (souvent vectorisé au niveau CPU via SIMD), en opérant sur des blocs mémoire contigus typés :

\`\`\`python
import numpy as np

# Lent : boucle Python, un objet PyFloat par élément
resultat = [x * 2 for x in gros_tableau_python]

# Rapide : une seule opération C sur tout le tableau
resultat = tableau_numpy * 2
\`\`\`

Le gain vient de deux facteurs combinés : l'élimination de l'overhead d'interprétation par élément, et une meilleure utilisation du cache CPU grâce à un stockage mémoire compact et homogène (contrairement à une liste Python, qui stocke des pointeurs vers des objets dispersés en mémoire).

Règle pratique : dès qu'une boucle \`for\` manipule un tableau numérique élément par élément, chercher l'opération NumPy vectorisée équivalente avant d'envisager toute autre optimisation (Cython, multiprocessing...).
`,
  },
];
