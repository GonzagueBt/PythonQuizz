import type { CourseSection } from "@/types";

export const fundamentalsCourses: CourseSection[] = [
  {
    id: "fundamentals-types",
    level: 1,
    topic: "fundamentals",
    title: "Types de base et dynamisme",
    summary: "int, float, str, bool, None et le typage dynamique de Python.",
    order: 1,
    content: `
Python est un langage à **typage dynamique et fort** :

- *Dynamique* : le type d'une variable n'est connu qu'à l'exécution, et une même variable peut recevoir successivement des valeurs de types différents.
- *Fort* : Python ne convertit jamais implicitement entre types incompatibles (\`"3" + 3\` lève une \`TypeError\`).

Les types de base :

- \`int\` : entiers de précision arbitraire (pas de dépassement silencieux comme en C).
- \`float\` : nombres à virgule flottante double précision (IEEE 754).
- \`str\` : chaînes de caractères Unicode, **immuables**.
- \`bool\` : sous-type de \`int\` (\`True == 1\`, \`False == 0\`).
- \`None\` : valeur unique représentant "aucune valeur", de type \`NoneType\`.

\`\`\`python
x = 3        # int
x = "trois"  # x est maintenant une str : c'est la variable qui change de type,
             # pas la valeur 3 qui se transforme.
\`\`\`

Toute valeur en Python est un **objet**, y compris les entiers, les fonctions et les types eux-mêmes. Une variable n'est jamais une "boîte" contenant une valeur : c'est une **étiquette (référence)** pointant vers un objet en mémoire. Cette distinction est centrale pour comprendre la mutabilité et l'opérateur \`is\`.
`,
  },
  {
    id: "fundamentals-operators",
    level: 1,
    topic: "fundamentals",
    title: "Opérateurs et comparaisons",
    summary: "Arithmétique, comparaisons, opérateurs logiques et de court-circuit.",
    order: 2,
    content: `
Python distingue deux opérateurs de division :

- \`/\` : division réelle, retourne toujours un \`float\` (\`7 / 2 == 3.5\`).
- \`//\` : division entière (floor division), arrondit vers \`-∞\` (\`-7 // 2 == -4\`, pas \`-3\`).
- \`%\` : modulo, garde le signe du **diviseur** (\`-7 % 2 == 1\`).

Comparaisons chaînées : \`1 < x < 10\` équivaut à \`1 < x and x < 10\`, mais \`x\` n'est évalué qu'une seule fois.

Les opérateurs \`and\` / \`or\` sont des **opérateurs de court-circuit** qui retournent l'un des deux opérandes (pas forcément un booléen) :

\`\`\`python
resultat = None or "défaut"   # "défaut"
resultat = "" or "défaut"     # "défaut" (chaîne vide falsy)
resultat = 0 and "jamais vu"  # 0 (court-circuit avant d'évaluer le second)
\`\`\`

**Égalité vs identité** :

- \`==\` compare les **valeurs** (appelle \`__eq__\`).
- \`is\` compare l'**identité** des objets (même emplacement mémoire, équivalent à \`id(a) == id(b)\`).

\`True == 1\` est vrai car \`bool\` hérite de \`int\`, mais \`True is 1\` est faux : ce sont deux objets distincts.
`,
  },
  {
    id: "fundamentals-control-flow",
    level: 1,
    topic: "fundamentals",
    title: "Conditions et boucles",
    summary: "if/elif/else, for, while, range, break/continue/else.",
    order: 3,
    content: `
La boucle \`for\` de Python itère sur des **itérables** (listes, chaînes, \`range\`, etc.), contrairement à une boucle C indexée :

\`\`\`python
for i in range(5):      # 0, 1, 2, 3, 4 (borne haute exclue)
    print(i)
\`\`\`

Particularité peu connue : les boucles \`for\` et \`while\` acceptent une clause \`else\`, exécutée seulement si la boucle se termine **sans** \`break\` :

\`\`\`python
for n in candidats:
    if est_valide(n):
        break
else:
    print("Aucun candidat valide")
\`\`\`

\`range(start, stop, step)\` génère une séquence paresseuse (un objet \`range\`, pas une liste) : \`range(10, 0, -2)\` produit \`10, 8, 6, 4, 2\`.

Tout objet possède une valeur de vérité (« truthiness ») utilisée par \`if\`/\`while\` : sont **falsy** \`None\`, \`False\`, \`0\`, \`0.0\`, les chaînes/listes/dicts/sets **vides**, et tout le reste est **truthy**.
`,
  },
  {
    id: "fundamentals-functions",
    level: 1,
    topic: "fundamentals",
    title: "Fonctions, paramètres et portée",
    summary: "def, return, paramètres par défaut, portée locale/globale.",
    order: 4,
    content: `
Une fonction sans \`return\` explicite retourne \`None\`.

**Piège classique** : les valeurs par défaut mutables sont évaluées **une seule fois**, à la définition de la fonction, et partagées entre tous les appels :

\`\`\`python
def ajouter(x, liste=[]):   # dangereux !
    liste.append(x)
    return liste

ajouter(1)   # [1]
ajouter(2)   # [1, 2]  <- la même liste par défaut est réutilisée
\`\`\`

La bonne pratique est d'utiliser \`None\` comme sentinelle :

\`\`\`python
def ajouter(x, liste=None):
    if liste is None:
        liste = []
    liste.append(x)
    return liste
\`\`\`

**Portée (scope)** : par défaut, affecter une variable dans une fonction la rend **locale** à cette fonction, même si une variable de même nom existe à l'extérieur. Pour modifier une variable englobante, il faut le mot-clé \`global\` (portée module) ou \`nonlocal\` (fonction englobante). Lire une variable globale ne nécessite aucun mot-clé particulier — seule l'**écriture** en a besoin.
`,
  },
  {
    id: "fundamentals-collections",
    level: 1,
    topic: "fundamentals",
    title: "Listes, tuples, dicts et sets",
    summary: "Mutabilité, syntaxe et cas d'usage des quatre collections de base.",
    order: 5,
    content: `
| Collection | Ordonnée | Mutable | Doublons | Syntaxe |
|---|---|---|---|---|
| \`list\` | oui | oui | oui | \`[1, 2, 3]\` |
| \`tuple\` | oui | **non** | oui | \`(1, 2, 3)\` |
| \`dict\` | oui (depuis 3.7) | oui | clés uniques | \`{"a": 1}\` |
| \`set\` | non | oui | **non** | \`{1, 2, 3}\` |

Un tuple d'un seul élément nécessite une virgule : \`(1,)\` — \`(1)\` est juste l'entier \`1\` entre parenthèses.

Les tuples sont immuables mais peuvent **contenir** des objets mutables : \`([1, 2], 3)\` — c'est le tuple qui est figé (on ne peut pas réassigner ses éléments), pas le contenu de la liste à l'intérieur.

Les clés de dictionnaire et les éléments de set doivent être **hashables** (immuables en pratique : \`int\`, \`str\`, \`tuple\` de hashables — pas de \`list\` ni de \`dict\`).

Les tuples sont généralement plus rapides à créer et légèrement plus économes en mémoire que les listes, et leur immuabilité les rend sûrs comme clés de dictionnaire ou dans des sets.
`,
  },
  {
    id: "fundamentals-slicing-comprehensions",
    level: 1,
    topic: "fundamentals",
    title: "Slicing et compréhensions",
    summary: "Slicing avancé, list/dict/set comprehensions.",
    order: 6,
    content: `
Le slicing \`sequence[start:stop:step]\` fonctionne sur toute séquence (str, list, tuple) :

\`\`\`python
x = [0, 1, 2, 3, 4, 5]
x[1:4]    # [1, 2, 3]
x[::2]    # [0, 2, 4]      (un élément sur deux)
x[::-1]   # [5, 4, 3, 2, 1, 0]  (inversion)
x[:3]     # [0, 1, 2]
\`\`\`

Le slicing **ne lève jamais d'IndexError**, même hors bornes : \`x[100:200]\` retourne simplement \`[]\`.

Les compréhensions offrent une syntaxe concise pour construire des collections :

\`\`\`python
carres = [n**2 for n in range(10) if n % 2 == 0]
mapping = {n: n**2 for n in range(5)}
uniques = {n % 3 for n in range(10)}
\`\`\`

Une compréhension crée sa **propre portée** (depuis Python 3) : la variable de boucle ne fuite pas dans le scope englobant, contrairement à une boucle \`for\` classique. Pour de grands volumes de données où l'on n'a pas besoin de tout garder en mémoire, une expression génératrice \`(n**2 for n in range(10**8))\` (parenthèses au lieu de crochets) est préférable : elle produit les valeurs à la demande.
`,
  },
  {
    id: "fundamentals-exceptions",
    level: 1,
    topic: "fundamentals",
    title: "Exceptions et gestion d'erreurs",
    summary: "try/except/else/finally, hiérarchie des exceptions.",
    order: 7,
    content: `
Structure complète :

\`\`\`python
try:
    resultat = 10 / diviseur
except ZeroDivisionError:
    print("Division par zéro")
except (TypeError, ValueError) as e:
    print(f"Erreur : {e}")
else:
    print("Pas d'erreur, resultat =", resultat)
finally:
    print("Toujours exécuté (nettoyage)")
\`\`\`

- \`else\` s'exécute uniquement si **aucune exception** n'a été levée dans le \`try\`.
- \`finally\` s'exécute **toujours**, même en cas de \`return\` ou d'exception non interceptée.

Attrapez toujours l'exception la plus **spécifique** possible : \`except Exception:\` masque des bugs (y compris des fautes de frappe qui lèvent \`NameError\`). Utilisez \`raise\` seul dans un \`except\` pour relancer l'exception courante en préservant sa trace, et \`raise NouvelleErreur(...) from original\` pour chaîner explicitement les causes.

Toutes les exceptions natives héritent de \`BaseException\`, mais les erreurs applicatives doivent hériter d'\`Exception\` (pas de \`BaseException\`, réservé à \`SystemExit\`/\`KeyboardInterrupt\`).
`,
  },
  {
    id: "fundamentals-modules-files",
    level: 1,
    topic: "fundamentals",
    title: "Modules, imports et fichiers",
    summary: "import, from...import, context managers pour les fichiers.",
    order: 8,
    content: `
\`import module\` exécute le fichier module une seule fois (résultat mis en cache dans \`sys.modules\`) puis lie le nom \`module\` dans l'espace courant. \`from module import x\` copie la référence \`x\` dans l'espace courant — si \`module.x\` change ensuite, votre copie locale ne le voit pas.

Éviter \`from module import *\` : cela pollue l'espace de noms et rend le code difficile à auditer.

Pour les fichiers, toujours utiliser un **context manager** (\`with\`), qui garantit la fermeture même en cas d'exception :

\`\`\`python
with open("data.txt", encoding="utf-8") as f:
    contenu = f.read()
# f est fermé ici, automatiquement
\`\`\`

Modes courants : \`"r"\` (lecture), \`"w"\` (écriture, écrase), \`"a"\` (ajout), \`"rb"\`/\`"wb"\` (binaire). Toujours préciser \`encoding="utf-8"\` explicitement pour un comportement portable entre systèmes d'exploitation.
`,
  },
];
