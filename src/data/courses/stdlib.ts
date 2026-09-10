import type { CourseSection } from "@/types";

export const stdlibCourses: CourseSection[] = [
  {
    id: "stdlib-os-pathlib",
    level: 2,
    topic: "stdlib",
    title: "os, pathlib et sys",
    summary: "Manipuler chemins et fichiers de façon portable.",
    order: 1,
    content: `
\`pathlib\` (moderne, orienté objet) est aujourd'hui préféré à \`os.path\` (fonctionnel, chaînes de caractères) pour manipuler des chemins :

\`\`\`python
from pathlib import Path

p = Path("data") / "fichiers" / "rapport.csv"   # / surchargé pour joindre des chemins
p.exists()
p.suffix       # ".csv"
p.stem         # "rapport"
p.parent       # Path("data/fichiers")
list(p.parent.glob("*.csv"))
\`\`\`

\`pathlib\` gère automatiquement les différences entre systèmes (\`/\` vs \`\\\`), contrairement à la construction manuelle de chaînes.

\`sys.argv\` contient les arguments de ligne de commande (\`sys.argv[0]\` est le nom du script). \`sys.path\` est la liste des répertoires où Python cherche les modules à importer. \`sys.exit(code)\` termine le programme avec un code de sortie.
`,
  },
  {
    id: "stdlib-itertools-functools",
    level: 2,
    topic: "stdlib",
    title: "itertools, functools et operator",
    summary: "Combinatoire, composition fonctionnelle, opérateurs comme fonctions.",
    order: 2,
    content: `
\`itertools\` fournit des outils d'itération efficaces en mémoire (tout est paresseux) :

\`\`\`python
from itertools import chain, combinations, groupby, product

list(chain([1, 2], [3, 4]))          # [1, 2, 3, 4] — concatène sans copier
list(combinations([1, 2, 3], 2))     # [(1,2), (1,3), (2,3)]
list(product([0, 1], repeat=2))      # [(0,0), (0,1), (1,0), (1,1)]
\`\`\`

\`groupby\` regroupe des éléments **consécutifs** ayant la même clé — les données doivent être **triées** par cette clé au préalable, sinon un même groupe logique peut apparaître plusieurs fois.

\`functools.reduce\` applique cumulativement une fonction à deux arguments sur une séquence : \`reduce(lambda a, b: a + b, [1,2,3,4])\` vaut 10. \`functools.partial\` fixe certains arguments d'une fonction à l'avance, produisant une nouvelle fonction.

\`operator\` fournit les opérateurs sous forme de fonctions (\`operator.add\`, \`operator.itemgetter("cle")\`), utile avec \`sorted(key=...)\` ou \`reduce\` sans écrire de lambda.
`,
  },
  {
    id: "stdlib-collections",
    level: 2,
    topic: "stdlib",
    title: "collections : Counter, defaultdict, deque, namedtuple",
    summary: "Structures de données spécialisées prêtes à l'emploi.",
    order: 3,
    content: `
\`\`\`python
from collections import Counter, defaultdict, deque, namedtuple

Counter("abracadabra")        # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})
Counter("abracadabra").most_common(2)   # [('a', 5), ('b', 2)]

d = defaultdict(list)
d["clé_absente"].append(1)    # pas de KeyError : crée automatiquement une liste vide

file = deque(maxlen=3)         # file à double extrémité, O(1) aux deux bouts
file.extend([1, 2, 3, 4])      # [2, 3, 4] — maxlen éjecte automatiquement le plus ancien

Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
p.x, p[0]                      # accès par nom ET par index
\`\`\`

\`defaultdict(fabrique)\` appelle \`fabrique()\` (sans argument) pour créer une valeur par défaut dès qu'une clé absente est accédée — pratique pour construire des regroupements sans vérifier \`if clé not in dict\`.

\`Counter\` supporte l'arithmétique entre compteurs (\`+\`, \`-\`, \`&\`, \`|\`) pour combiner ou comparer des distributions.
`,
  },
  {
    id: "stdlib-re-datetime",
    level: 2,
    topic: "stdlib",
    title: "re et datetime",
    summary: "Expressions régulières et manipulation de dates.",
    order: 4,
    content: `
\`\`\`python
import re

re.match(r"^\\d+$", "123")        # objet Match si tout le début matche
re.search(r"\\d+", "abc123def")   # cherche n'importe où dans la chaîne
re.findall(r"\\d+", "a1 b22 c333") # ['1', '22', '333']
re.sub(r"\\s+", " ", "a   b  c")   # "a b c"
\`\`\`

\`match\` ancre au **début** de la chaîne, \`fullmatch\` exige que **toute** la chaîne corresponde, \`search\` cherche n'importe où. Compiler un pattern réutilisé plusieurs fois avec \`re.compile(pattern)\` évite de le reparser à chaque appel.

\`\`\`python
from datetime import date, datetime, timedelta

aujourdhui = date.today()
demain = aujourdhui + timedelta(days=1)
maintenant = datetime.now()
maintenant.strftime("%Y-%m-%d %H:%M")   # formatage vers chaîne
datetime.strptime("2024-01-15", "%Y-%m-%d")   # parsing depuis chaîne
\`\`\`

Un \`datetime\` **naïf** (sans fuseau horaire) ne doit jamais être comparé à un \`datetime\` **aware** (avec fuseau, via \`tzinfo\`) — cela lève une \`TypeError\`. Pour du code robuste manipulant plusieurs fuseaux, toujours utiliser des objets *aware* (\`datetime.now(tz=...)\`).
`,
  },
  {
    id: "stdlib-json-csv",
    level: 1,
    topic: "stdlib",
    title: "json et csv",
    summary: "Sérialisation de données structurées et tabulaires.",
    order: 5,
    content: `
\`\`\`python
import json

texte = json.dumps({"nom": "Ada", "actif": True}, indent=2)
donnees = json.loads(texte)
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(donnees, f)
with open("data.json", encoding="utf-8") as f:
    donnees = json.load(f)
\`\`\`

JSON ne connaît pas les tuples (convertis en listes), ni les clés non-chaînes (converties en chaînes), ni \`None\`→\`null\`, \`True\`/\`False\`→\`true\`/\`false\`.

\`\`\`python
import csv

with open("data.csv", newline="", encoding="utf-8") as f:
    lecteur = csv.DictReader(f)     # chaque ligne devient un dict {en-tête: valeur}
    for ligne in lecteur:
        print(ligne["nom"])

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    ecrivain = csv.DictWriter(f, fieldnames=["nom", "age"])
    ecrivain.writeheader()
    ecrivain.writerow({"nom": "Ada", "age": 30})
\`\`\`

\`newline=""\` à l'ouverture est **recommandé explicitement** par la documentation du module \`csv\` sous peine de lignes vides parasites sur certains systèmes (le module gère lui-même la traduction des retours à la ligne).
`,
  },
  {
    id: "stdlib-subprocess-logging",
    level: 3,
    topic: "stdlib",
    title: "subprocess, logging et sqlite3",
    summary: "Interagir avec des processus externes, journaliser, persister.",
    order: 6,
    content: `
\`\`\`python
import subprocess

resultat = subprocess.run(
    ["ls", "-la"], capture_output=True, text=True, check=True
)
print(resultat.stdout)
\`\`\`

Toujours passer une **liste** d'arguments plutôt qu'une chaîne shell brute (évite les injections de commande), et éviter \`shell=True\` sauf nécessité absolue avec une entrée totalement fiable.

\`logging\` est préférable à \`print\` dans du code applicatif : niveaux (\`DEBUG\`, \`INFO\`, \`WARNING\`, \`ERROR\`, \`CRITICAL\`), configuration centralisée, sortie vers fichier/réseau, filtrage sans toucher au code appelant.

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Traitement démarré")
\`\`\`

\`sqlite3\` (module standard, base de données embarquée en un seul fichier) permet de persister des données sans serveur externe — voir le cours dédié « SQL / sqlite3 » pour la prévention des injections SQL via requêtes paramétrées.
`,
  },
];
