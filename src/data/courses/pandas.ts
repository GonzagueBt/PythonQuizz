import type { CourseSection } from "@/types";

export const pandasCourses: CourseSection[] = [
  {
    id: "pandas-series-dataframe",
    level: 5,
    topic: "pandas",
    title: "Series et DataFrame",
    summary: "Les deux structures fondamentales de Pandas.",
    order: 1,
    content: `
Une \`Series\` est un tableau 1D **indexé** (comme un dict ordonné + un array NumPy). Un \`DataFrame\` est une table 2D — une collection de \`Series\` partageant le même index, une par colonne :

\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "nom": ["Alice", "Bob", "Charles"],
    "age": [25, 17, 31],
    "departement": ["IT", "RH", "IT"],
})
df["age"]          # une Series
df.dtypes           # type de chaque colonne
df.shape             # (3, 3)
df.head(2)           # les 2 premières lignes
\`\`\`

Chaque colonne d'un DataFrame a son propre \`dtype\` — mélanger des types dans une même colonne (ex. nombres et chaînes) la fait basculer en \`object\`, ce qui empêche les optimisations vectorisées de Pandas/NumPy sur cette colonne.

L'**index** n'est pas juste une numérotation de lignes : c'est un axe à part entière, utilisé pour l'alignement automatique lors d'opérations entre DataFrames (deux DataFrames avec le même index s'additionnent ligne à ligne, même si l'ordre des lignes diffère).
`,
  },
  {
    id: "pandas-selection",
    level: 5,
    topic: "pandas",
    title: "Sélection : loc, iloc et boolean indexing",
    summary: "Les trois façons de sélectionner des données dans un DataFrame.",
    order: 2,
    content: `
\`\`\`python
df.loc[0, "nom"]           # sélection par ÉTIQUETTE (index, colonne)
df.iloc[0, 1]                # sélection par POSITION entière (ligne 0, colonne 1)
df.loc[0:2, "nom":"age"]     # loc : bornes INCLUSES des deux côtés
df.iloc[0:2]                  # iloc : borne haute EXCLUE, comme un slice Python classique

df[df["age"] >= 18]           # boolean indexing : filtre les lignes majeures
df[(df["age"] >= 18) & (df["departement"] == "IT")]   # & / | (pas and/or) entre parenthèses
\`\`\`

**Piège fréquent** : \`loc\` inclut la borne de fin dans un slice (\`df.loc[0:2]\` retourne 3 lignes si l'index est 0,1,2), alors qu'\`iloc\` l'exclut (\`df.iloc[0:2]\` retourne 2 lignes) — comportement hérité de l'indexation par étiquette vs par position.

Avec le boolean indexing, il faut utiliser les opérateurs bit à bit \`&\`, \`|\`, \`~\` (pas \`and\`/\`or\`/\`not\`, réservés aux booléens scalaires Python) et **parenthéser chaque condition**, sinon la priorité des opérateurs cause une erreur ou un résultat incorrect.
`,
  },
  {
    id: "pandas-groupby",
    level: 5,
    topic: "pandas",
    title: "groupby et agrégations",
    summary: "Le split-apply-combine, cœur de l'analyse de données tabulaires.",
    order: 3,
    content: `
\`groupby\` implémente le pattern **split-apply-combine** : diviser les données en groupes selon une clé, appliquer une fonction à chaque groupe, recombiner les résultats.

\`\`\`python
df.groupby("departement")["age"].mean()
# IT    28.0
# RH    17.0

df.groupby("departement").agg(
    age_moyen=("age", "mean"),
    effectif=("nom", "count"),
)
\`\`\`

\`df.groupby("departement")["salaire"].mean()\` retourne une **Series** indexée par département — c'est un objet \`DataFrameGroupBy\` intermédiaire (paresseux) tant qu'aucune agrégation n'est appliquée ; itérer dessus directement donne des paires \`(clé_groupe, sous_dataframe)\`.

\`.agg()\` accepte plusieurs fonctions par colonne, avec renommage explicite comme ci-dessus, ou une liste \`["mean", "sum"]\` pour appliquer plusieurs agrégations à une même colonne.

Pour transformer chaque groupe en conservant la forme originale du DataFrame (au lieu de la réduire), utiliser \`.transform()\` plutôt que \`.agg()\` — utile par exemple pour centrer chaque valeur par rapport à la moyenne de son groupe.
`,
  },
  {
    id: "pandas-merge-join-concat",
    level: 5,
    topic: "pandas",
    title: "merge, join, concat et pivot",
    summary: "Combiner et restructurer plusieurs DataFrames.",
    order: 4,
    content: `
\`\`\`python
pd.merge(clients, commandes, on="client_id", how="left")
# how : "inner" (défaut), "left", "right", "outer"

pd.concat([df1, df2], axis=0)   # empile verticalement (mêmes colonnes)
pd.concat([df1, df2], axis=1)   # accole horizontalement (même index)

df.pivot_table(values="ventes", index="mois", columns="produit", aggfunc="sum")
\`\`\`

\`merge\` (jointure façon SQL) aligne les lignes selon une **clé commune** (\`on=\`), avec un comportement contrôlé par \`how\` : \`"inner"\` ne garde que les clés présentes dans les deux tables, \`"left"\` garde toutes les lignes de gauche (avec \`NaN\` si pas de correspondance à droite), \`"outer"\` garde tout.

\`join\` est une variante de \`merge\` optimisée pour joindre sur l'**index** plutôt que sur une colonne.

\`concat\` empile des DataFrames sans logique de correspondance de clé — juste un alignement sur les axes (colonnes pour \`axis=0\`, index pour \`axis=1\`), avec introduction de \`NaN\` si les colonnes/index ne correspondent pas parfaitement entre les DataFrames.

\`pivot_table\` restructure des données "longues" en format "large" (une valeur par combinaison ligne/colonne), avec agrégation automatique en cas de doublons — contrairement à \`pivot\` (sans agrégation), qui lève une erreur s'il y a des doublons.
`,
  },
  {
    id: "pandas-missing-cleaning",
    level: 5,
    topic: "pandas",
    title: "Valeurs manquantes et nettoyage",
    summary: "isna, fillna, dropna, dtypes et dates.",
    order: 5,
    content: `
\`\`\`python
df.isna().sum()              # nombre de NaN par colonne
df.dropna()                   # supprime les lignes contenant au moins un NaN
df.dropna(subset=["age"])     # seulement si "age" est manquant
df.fillna({"age": df["age"].median()})   # remplace par colonne, valeurs différentes possibles
df["age"] = df["age"].astype(int)         # conversion de type explicite
df["date"] = pd.to_datetime(df["date"])   # parsing de dates
\`\`\`

\`NaN\` (Not a Number) est le marqueur historique de valeur manquante dans Pandas pour les colonnes numériques — c'est en réalité un \`float\`, ce qui fait qu'une colonne d'entiers contenant un NaN est automatiquement convertie en \`float64\` (\`1\` devient \`1.0\`). Les types \`Int64\`/\`boolean\` nullable (avec majuscule) de Pandas récents permettent d'éviter cette conversion.

\`df["col"].apply(fonction)\` applique une fonction Python arbitraire ligne par ligne — flexible mais **plus lent** qu'une opération vectorisée native (\`df["col"] * 2\`), car elle repasse par l'interpréteur Python à chaque ligne au lieu du code C vectorisé. Privilégier systématiquement la version vectorisée quand elle existe.
`,
  },
  {
    id: "pandas-io",
    level: 5,
    topic: "pandas",
    title: "Lecture/écriture CSV et performance",
    summary: "read_csv, to_csv et bonnes pratiques.",
    order: 6,
    content: `
\`\`\`python
df = pd.read_csv("data.csv", sep=",", parse_dates=["date"], dtype={"id": str})
df.to_csv("out.csv", index=False)   # index=False évite d'écrire une colonne d'index parasite
\`\`\`

\`parse_dates\` convertit directement certaines colonnes en \`datetime64\` à la lecture, évitant une conversion manuelle après coup. Préciser \`dtype\` explicitement pour les colonnes ambiguës (ex. codes postaux ou identifiants qui ressemblent à des nombres mais doivent rester des chaînes, pour préserver les zéros de tête).

Pour de gros fichiers, \`pd.read_csv(..., chunksize=10000)\` retourne un itérateur de DataFrames traités par morceaux, évitant de charger tout le fichier en mémoire d'un coup.

Règle de performance générale en Pandas : préférer les opérations **vectorisées** (\`df["a"] + df["b"]\`, méthodes \`.str.\`, \`.dt.\`) à toute boucle \`for\` explicite sur les lignes (\`iterrows()\`, notoirement lent) — un ordre de grandeur de différence est courant sur de gros volumes.
`,
  },
];
