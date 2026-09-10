import type { CourseSection } from "@/types";

export const intermediateCourses: CourseSection[] = [
  {
    id: "intermediate-args-kwargs",
    level: 2,
    topic: "intermediate",
    title: "*args, **kwargs et unpacking",
    summary: "Arguments variadiques, dépaquetage de séquences et de dictionnaires.",
    order: 1,
    content: `
\`*args\` collecte les arguments positionnels excédentaires dans un **tuple**, \`**kwargs\` collecte les arguments nommés excédentaires dans un **dict** :

\`\`\`python
def f(a, *args, b=1, **kwargs):
    print(a, args, b, kwargs)

f(1, 2, 3, b=9, x=10)   # 1 (2, 3) 9 {'x': 10}
\`\`\`

Tout ce qui suit \`*args\` dans la signature devient **keyword-only** (ne peut être passé que par nom).

L'unpacking fonctionne aussi à l'appel, dans le sens inverse :

\`\`\`python
nombres = [1, 2, 3]
print(*nombres)          # équivaut à print(1, 2, 3)

options = {"b": 9}
f(1, **options)
\`\`\`

Unpacking de séquences avec le reste capturé par \`*\` :

\`\`\`python
premier, *milieu, dernier = [1, 2, 3, 4, 5]
# premier = 1, milieu = [2, 3, 4], dernier = 5
\`\`\`

Fusionner deux dictionnaires : \`{**d1, **d2}\` (les clés de \`d2\` écrasent celles de \`d1\` en cas de conflit), ou depuis Python 3.9, l'opérateur \`d1 | d2\`.
`,
  },
  {
    id: "intermediate-functional",
    level: 2,
    topic: "intermediate",
    title: "lambda, map, filter, zip, enumerate",
    summary: "Programmation fonctionnelle légère et itération enrichie.",
    order: 2,
    content: `
\`lambda\` crée une fonction anonyme à **une seule expression** (pas d'instructions, pas de \`return\` explicite) :

\`\`\`python
carre = lambda x: x ** 2
\`\`\`

\`map\` et \`filter\` retournent des **itérateurs paresseux** (pas des listes) en Python 3 :

\`\`\`python
list(map(str.upper, ["a", "b"]))       # ['A', 'B']
list(filter(lambda x: x > 0, [-1, 2, -3, 4]))  # [2, 4]
\`\`\`

En pratique, une compréhension de liste est souvent préférée à \`map\`/\`filter\` pour la lisibilité (« *there should be one obvious way to do it* »).

\`zip\` combine plusieurs itérables élément par élément, en s'arrêtant au plus court :

\`\`\`python
list(zip([1, 2, 3], ["a", "b"]))   # [(1, 'a'), (2, 'b')]
\`\`\`

\`enumerate\` fournit un index en plus de la valeur, en évitant \`range(len(...))\` :

\`\`\`python
for i, valeur in enumerate(["x", "y"], start=1):
    print(i, valeur)   # 1 x  puis  2 y
\`\`\`
`,
  },
  {
    id: "intermediate-generators",
    level: 2,
    topic: "intermediate",
    title: "Générateurs, itérateurs et yield",
    summary: "Le protocole d'itération et l'évaluation paresseuse.",
    order: 3,
    content: `
Un **itérable** implémente \`__iter__\` (retourne un itérateur). Un **itérateur** implémente \`__iter__\` (se retourne lui-même) et \`__next__\` (retourne la valeur suivante ou lève \`StopIteration\`).

Une fonction contenant \`yield\` devient une **fonction génératrice** : l'appeler ne l'exécute pas immédiatement, elle retourne un objet générateur qui exécute le corps **à la demande**, en suspendant son état entre chaque \`next()\` :

\`\`\`python
def compteur(n):
    i = 0
    while i < n:
        yield i
        i += 1

g = compteur(3)
next(g)   # 0
next(g)   # 1
\`\`\`

Avantage majeur : la **mémoire constante**, quelle que soit la taille de la séquence produite — utile pour traiter de gros fichiers ou des flux infinis.

Un générateur ne peut être parcouru **qu'une seule fois** : une fois épuisé, il reste épuisé (contrairement à une liste, qu'on peut reparcourir).

Depuis Python 3.3, \`yield from sous_generateur\` délègue à un sous-générateur, en propageant ses valeurs et son éventuelle valeur de retour.
`,
  },
  {
    id: "intermediate-decorators",
    level: 2,
    topic: "intermediate",
    title: "Décorateurs et context managers",
    summary: "Fonctions qui enveloppent d'autres fonctions, et le protocole `with`.",
    order: 4,
    content: `
Un décorateur est une fonction qui prend une fonction et en retourne une autre :

\`\`\`python
import functools

def chronometre(func):
    @functools.wraps(func)   # préserve __name__, __doc__ de la fonction d'origine
    def wrapper(*args, **kwargs):
        debut = time.perf_counter()
        resultat = func(*args, **kwargs)
        print(func.__name__, time.perf_counter() - debut)
        return resultat
    return wrapper

@chronometre
def calcul():
    ...
\`\`\`

\`@chronometre\` au-dessus de \`def calcul\` équivaut à \`calcul = chronometre(calcul)\`. Oublier \`functools.wraps\` fait perdre les métadonnées de la fonction originale (nom, docstring), ce qui casse l'introspection et la documentation.

Un **context manager** implémente \`__enter__\` et \`__exit__\`, utilisé via \`with\` pour garantir l'acquisition/libération d'une ressource :

\`\`\`python
class Connexion:
    def __enter__(self):
        self.ouvrir()
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.fermer()
        return False   # ne pas avaler l'exception éventuelle

with Connexion() as c:
    ...
\`\`\`

\`contextlib.contextmanager\` permet d'écrire un context manager avec une simple fonction génératrice (le code avant \`yield\` est \`__enter__\`, celui après est \`__exit__\`).
`,
  },
  {
    id: "intermediate-oop",
    level: 2,
    topic: "intermediate",
    title: "Classes, héritage et polymorphisme",
    summary: "Le modèle objet de base : classes, super(), propriétés, dataclasses.",
    order: 5,
    content: `
\`\`\`python
class Animal:
    def __init__(self, nom):
        self.nom = nom
    def parler(self):
        raise NotImplementedError

class Chien(Animal):
    def parler(self):
        return f"{self.nom} aboie"
\`\`\`

\`super()\` appelle la méthode de la classe parente sans nommer celle-ci explicitement — essentiel pour l'héritage multiple, où le bon parent est déterminé par le **MRO** (Method Resolution Order).

Le **polymorphisme** en Python est essentiellement du *duck typing* : n'importe quel objet possédant une méthode \`parler()\` peut être utilisé de façon interchangeable, sans relation d'héritage explicite requise.

\`@property\` transforme une méthode en attribut calculé à la lecture, avec un setter optionnel :

\`\`\`python
class Cercle:
    def __init__(self, rayon):
        self._rayon = rayon
    @property
    def aire(self):
        return 3.14159 * self._rayon ** 2
\`\`\`

\`@dataclass\` génère automatiquement \`__init__\`, \`__repr__\` et \`__eq__\` pour une classe qui ne fait que porter des données :

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int
\`\`\`
`,
  },
  {
    id: "intermediate-dunder",
    level: 2,
    topic: "intermediate",
    title: "Méthodes spéciales (dunder)",
    summary: "__str__, __repr__, __eq__, __hash__, __iter__, __next__.",
    order: 6,
    content: `
- \`__repr__\` : représentation **non ambiguë**, destinée aux développeurs (idéalement, \`eval(repr(x)) == x\`). Utilisée dans la console et par défaut si \`__str__\` est absent.
- \`__str__\` : représentation **lisible**, destinée à l'utilisateur final (\`print(x)\`, \`str(x)\`, f-strings sans \`!r\`).

Si vous ne définissez qu'une seule méthode, définissez \`__repr__\` : elle sert de repli pour \`__str__\`.

\`__eq__\` définit l'égalité par valeur. **Règle critique** : si vous redéfinissez \`__eq__\`, Python met automatiquement \`__hash__\` à \`None\` (l'objet devient non hashable), sauf si vous redéfinissez \`__hash__\` aussi. Un objet mutable ne devrait généralement **pas** être hashable, car son hash changerait s'il était modifié après avoir été inséré dans un \`set\` ou utilisé comme clé de \`dict\`.

Le protocole d'itération repose sur \`__iter__\` (retourne un itérateur) et \`__next__\` (retourne l'élément suivant, lève \`StopIteration\` en fin de séquence) :

\`\`\`python
class Compteur:
    def __init__(self, n):
        self.n, self.i = n, 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i
\`\`\`
`,
  },
];
