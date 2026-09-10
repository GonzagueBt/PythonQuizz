import type { CourseSection } from "@/types";

export const advancedCourses: CourseSection[] = [
  {
    id: "advanced-mro",
    level: 3,
    topic: "advanced",
    title: "Modèle objet et MRO",
    summary: "Résolution de méthodes en héritage multiple, C3 linearization.",
    order: 1,
    content: `
Avec l'héritage multiple, Python doit décider dans quel ordre chercher une méthode. Cet ordre — le **MRO** (Method Resolution Order) — est calculé par l'algorithme **C3 linearization**, consultable via \`ClasseX.__mro__\` ou \`ClasseX.mro()\`.

\`\`\`python
class A:
    def qui(self): return "A"
class B(A):
    def qui(self): return "B"
class C(A):
    def qui(self): return "C"
class D(B, C):
    pass

D().qui()          # "B" : B précède C dans le MRO de D
D.__mro__           # (D, B, C, A, object)
\`\`\`

Règle clé du C3 : un enfant apparaît toujours avant ses parents, et l'ordre déclaré dans \`class D(B, C)\` est respecté (B avant C). C'est ce qui résout le fameux « problème du diamant » de manière cohérente et prévisible.

\`super()\` sans argument suit le **MRO courant**, pas simplement « la classe parente directe » — c'est essentiel pour que des mixins coopératifs s'enchaînent correctement dans un héritage multiple.

Si aucune linéarisation cohérente n'existe (ordres de déclaration contradictoires entre classes), Python lève un \`TypeError: Cannot create a consistent method resolution order\`.
`,
  },
  {
    id: "advanced-closures-legb",
    level: 3,
    topic: "advanced",
    title: "Closures et règle LEGB",
    summary: "Comment Python résout les noms de variables.",
    order: 2,
    content: `
Python résout un nom de variable en cherchant successivement dans quatre portées, dans cet ordre : **L**ocal → **E**nclosing (fonction englobante) → **G**lobal (module) → **B**uilt-in.

Une **closure** est une fonction qui capture des variables de sa portée englobante, même après que celle-ci a terminé son exécution :

\`\`\`python
def multiplicateur(facteur):
    def multiplier(x):
        return x * facteur   # capture "facteur"
    return multiplier

double = multiplicateur(2)
double(5)   # 10, "facteur" (=2) reste accessible
\`\`\`

**Piège classique** avec les boucles : une closure capture la **variable**, pas sa valeur au moment de la création. Toutes les closures créées dans une boucle partagent la même variable :

\`\`\`python
fonctions = [lambda: i for i in range(3)]
[f() for f in fonctions]   # [2, 2, 2], pas [0, 1, 2] !
\`\`\`

La correction classique fixe la valeur via un argument par défaut, évalué immédiatement : \`lambda i=i: i\`.

Pour modifier (pas seulement lire) une variable de la portée englobante depuis une fonction imbriquée, le mot-clé \`nonlocal\` est requis.
`,
  },
  {
    id: "advanced-descriptors",
    level: 3,
    topic: "advanced",
    title: "Descripteurs",
    summary: "Le mécanisme derrière @property, les méthodes et bien d'autres.",
    order: 3,
    content: `
Un **descripteur** est un objet qui définit au moins une des méthodes \`__get__\`, \`__set__\` ou \`__delete__\`, et qui est stocké comme **attribut de classe**. Quand on accède à cet attribut sur une instance, Python délègue à ces méthodes plutôt que de faire une simple recherche dans \`__dict__\`.

\`\`\`python
class Positif:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value < 0:
            raise ValueError("doit être positif")
        setattr(obj, self.name, value)

class Compte:
    solde = Positif()
\`\`\`

Un descripteur avec \`__get__\` **et** \`__set__\` (ou \`__delete__\`) est un **descripteur de données** : il prend systématiquement la priorité sur le \`__dict__\` de l'instance. Un descripteur avec seulement \`__get__\` (descripteur non-data) peut être **masqué** par une entrée dans \`__dict__\`.

\`@property\`, les méthodes ordinaires (via leur type \`function\`, qui implémente \`__get__\` pour produire la liaison à \`self\`), \`classmethod\` et \`staticmethod\` sont tous implémentés grâce aux descripteurs — c'est un mécanisme fondamental, pas un cas particulier.
`,
  },
  {
    id: "advanced-metaclasses",
    level: 3,
    topic: "advanced",
    title: "Métaclasses",
    summary: "Les classes des classes : personnaliser la création de types.",
    order: 4,
    content: `
En Python, les classes sont elles-mêmes des objets, instances d'une **métaclasse** — par défaut, \`type\`. Écrire \`class Foo: ...\` équivaut, en substance, à appeler \`type("Foo", bases, namespace)\`.

Une métaclasse personnalisée hérite de \`type\` et peut intercepter/modifier la création de classe :

\`\`\`python
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=Singleton):
    pass
\`\`\`

Cas d'usage réels : imposer des conventions de nommage, enregistrer automatiquement des sous-classes dans un registre, valider la structure d'une classe à sa définition (ORMs, frameworks de validation). C'est un outil puissant mais rarement nécessaire en code applicatif — la citation de Tim Peters s'applique : « *metaclasses are deeper magic than 99% of users should ever worry about* ».

Alternative plus légère souvent suffisante : \`__init_subclass__\`, un hook appelé automatiquement à chaque sous-classement, sans avoir à écrire de métaclasse.
`,
  },
  {
    id: "advanced-typing",
    level: 3,
    topic: "advanced",
    title: "Typing, Protocol et generics",
    summary: "Annotations de type modernes, structural typing, généricité.",
    order: 5,
    content: `
Les annotations de type sont **purement indicatives à l'exécution** : Python ne les vérifie jamais lui-même. Elles servent aux outils externes (\`mypy\`, \`pyright\`) et à la documentation/l'auto-complétion des éditeurs.

\`\`\`python
def addition(a: int, b: int) -> int:
    return a + b

addition("x", "y")   # s'exécute quand même, retourne "xy" — aucune erreur levée !
\`\`\`

\`Protocol\` (module \`typing\`) permet le **typage structurel** (« duck typing » vérifiable statiquement) : un objet est conforme à un Protocol s'il possède les bonnes méthodes/attributs, sans avoir besoin d'en hériter explicitement :

\`\`\`python
from typing import Protocol

class Dessinable(Protocol):
    def dessiner(self) -> None: ...
\`\`\`

Les génériques permettent de paramétrer une classe/fonction par un type :

\`\`\`python
from typing import TypeVar, Generic
T = TypeVar("T")

class Pile(Generic[T]):
    def empiler(self, item: T) -> None: ...
\`\`\`

Depuis Python 3.12, une syntaxe native simplifie cela : \`class Pile[T]: ...\` et \`def premier[T](items: list[T]) -> T: ...\`, sans import de \`TypeVar\`.
`,
  },
  {
    id: "advanced-import-system",
    level: 3,
    topic: "advanced",
    title: "Système d'import, packages et environnements",
    summary: "sys.path, sys.modules, packages, venv, pyproject.toml.",
    order: 6,
    content: `
Quand vous faites \`import x\`, Python : 1) vérifie si \`x\` est déjà dans \`sys.modules\` (cache), 2) sinon cherche un module/package \`x\` dans les chemins de \`sys.path\`, 3) exécute son code une seule fois, 4) l'enregistre dans \`sys.modules\`.

Un **package** est un dossier contenant un \`__init__.py\` (optionnel depuis les *namespace packages*, PEP 420, mais toujours recommandé pour la clarté). Les imports relatifs (\`from . import module\`, \`from ..pkg import x\`) ne fonctionnent qu'**à l'intérieur** d'un package, jamais dans un script exécuté directement.

Un **environnement virtuel** (\`python -m venv .venv\`) isole les dépendances d'un projet du système global — indispensable pour éviter les conflits de versions entre projets.

\`pyproject.toml\` est devenu le standard unifié (PEP 518/621) pour déclarer métadonnées, dépendances et configuration de build d'un projet, remplaçant progressivement \`setup.py\` :

\`\`\`toml
[project]
name = "mon-projet"
version = "1.0.0"
dependencies = ["requests>=2.31"]
\`\`\`

Le module \`inspect\` permet d'introspecter dynamiquement signatures, code source et objets (\`inspect.signature(f)\`, \`inspect.getsource(f)\`), utile pour du méta-programmation ou des outils de debug.
`,
  },
];
