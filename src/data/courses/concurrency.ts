import type { CourseSection } from "@/types";

export const concurrencyCourses: CourseSection[] = [
  {
    id: "concurrency-gil",
    level: 6,
    topic: "concurrency",
    title: "Le GIL (Global Interpreter Lock)",
    summary: "Pourquoi le threading Python ne parallélise pas le calcul CPU.",
    order: 1,
    content: `
Le **GIL** est un verrou global qui garantit qu'un seul thread exécute du bytecode Python à un instant donné dans un même processus CPython. C'est un **détail d'implémentation CPython** (PyPy en a un aussi ; Jython et certains projets expérimentaux comme le "no-GIL" build en Python 3.13+ n'en ont pas).

Conséquence directe : plusieurs threads Python **ne peuvent pas** exécuter du bytecode Python en parallèle sur plusieurs cœurs, même sur une machine multi-cœurs. \`threading\` n'accélère donc **pas** un calcul CPU-bound pur.

Le GIL est relâché automatiquement pendant les opérations d'**I/O bloquantes** (lecture fichier, appel réseau) et par certaines bibliothèques C (NumPy pour de grosses opérations) — c'est pourquoi \`threading\` reste très utile pour du code **I/O-bound** : pendant qu'un thread attend une réponse réseau, un autre peut s'exécuter.

Depuis Python 3.13, une build expérimentale **sans GIL** (PEP 703, "free-threading") existe, activable explicitement — un changement majeur en cours de stabilisation, à ne pas confondre avec le comportement par défaut de CPython.

Pour du calcul CPU-bound réellement parallèle, il faut \`multiprocessing\` : chaque processus a son propre interpréteur et donc son propre GIL indépendant.
`,
  },
  {
    id: "concurrency-threading-multiprocessing",
    level: 6,
    topic: "concurrency",
    title: "threading vs multiprocessing",
    summary: "Deux modèles de parallélisme aux garanties très différentes.",
    order: 2,
    content: `
\`\`\`python
from threading import Thread
from multiprocessing import Process

def travail():
    ...

t = Thread(target=travail); t.start(); t.join()
p = Process(target=travail); p.start(); p.join()
\`\`\`

| | threading | multiprocessing |
|---|---|---|
| Mémoire | Partagée entre threads | Isolée par processus (copie) |
| Contourne le GIL | Non | Oui |
| Coût de création | Faible | Plus élevé |
| Adapté à | I/O-bound | CPU-bound |
| Communication | Variables partagées + locks | \`Queue\`, \`Pipe\`, mémoire partagée explicite |

La mémoire partagée du threading rend la communication entre threads facile (mêmes objets accessibles directement) mais dangereuse sans synchronisation (**race conditions**). Les processus, eux, ne partagent rien par défaut : toute donnée échangée doit être explicitement sérialisée (souvent via \`pickle\`) et transmise par \`Queue\` ou \`Pipe\`, ce qui a un coût mais élimine toute une classe de bugs de concurrence.

\`concurrent.futures\` offre une API unifiée de haut niveau au-dessus des deux : \`ThreadPoolExecutor\` et \`ProcessPoolExecutor\` partagent la même interface (\`.submit()\`, \`.map()\`), ce qui permet de changer de stratégie de parallélisation en changeant une seule ligne.
`,
  },
  {
    id: "concurrency-race-conditions",
    level: 6,
    topic: "concurrency",
    title: "Race conditions, locks et deadlocks",
    summary: "Les dangers de l'état partagé entre threads.",
    order: 3,
    content: `
Une **race condition** survient quand le résultat d'un programme dépend de l'ordre d'exécution imprévisible d'opérations concurrentes sur un état partagé :

\`\`\`python
compteur = 0
def incrementer():
    global compteur
    for _ in range(100_000):
        compteur += 1   # PAS atomique : lecture, +1, écriture — 3 étapes

# Deux threads exécutant incrementer() en parallèle produisent souvent
# un résultat final < 200_000, des incréments étant "perdus".
\`\`\`

Un \`threading.Lock\` garantit qu'une seule section critique s'exécute à la fois :

\`\`\`python
verrou = threading.Lock()
def incrementer():
    global compteur
    for _ in range(100_000):
        with verrou:
            compteur += 1
\`\`\`

Un **deadlock** (interblocage) survient quand deux threads attendent chacun un verrou détenu par l'autre, bloquant indéfiniment les deux. Prévention classique : toujours acquérir les verrous multiples dans le **même ordre** partout dans le code, ou utiliser des timeouts sur les acquisitions.

Note : le GIL protège les opérations **atomiques au niveau bytecode** (comme \`liste.append(x)\`) contre la corruption interne, mais ne rend pas pour autant vos opérations composites (lire-modifier-écrire) thread-safe.
`,
  },
  {
    id: "concurrency-asyncio",
    level: 6,
    topic: "concurrency",
    title: "asyncio : coroutines et event loop",
    summary: "Concurrence coopérative à un seul thread.",
    order: 4,
    content: `
\`asyncio\` fournit de la **concurrence coopérative** dans un seul thread : une **event loop** exécute des **coroutines**, qui cèdent volontairement la main (via \`await\`) plutôt que d'être préemptées.

\`\`\`python
import asyncio

async def recuperer(url):
    print(f"début {url}")
    await asyncio.sleep(1)   # cède la main pendant l'attente I/O
    print(f"fin {url}")
    return url

async def main():
    resultats = await asyncio.gather(
        recuperer("a"), recuperer("b"), recuperer("c")
    )

asyncio.run(main())
# Les trois "début" s'affichent quasi immédiatement,
# puis les trois "fin" ~1 seconde plus tard (exécution concurrente, pas séquentielle)
\`\`\`

Ceci n'est **pas** du parallélisme réel (un seul thread, un seul cœur utilisé) mais de la **concurrence** : pendant qu'une coroutine attend une I/O (réseau, fichier, minuterie), l'event loop en exécute une autre. C'est très efficace pour des milliers de connexions réseau simultanées, mais **inutile** pour du calcul CPU-bound — un \`await asyncio.sleep(0)\` ne libère jamais réellement le CPU pour un calcul en cours.

Une fonction \`async def\` appelée sans \`await\` ne s'exécute pas : elle retourne un objet coroutine non démarré. Mélanger du code bloquant synchrone (ex. \`time.sleep\`) dans une coroutine bloque **toute** l'event loop, annulant l'intérêt d'asyncio.
`,
  },
];
