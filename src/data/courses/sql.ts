import type { CourseSection } from "@/types";

export const sqlCourses: CourseSection[] = [
  {
    id: "sql-sqlite3-basics",
    level: 3,
    topic: "sql",
    title: "sqlite3 depuis Python",
    summary: "Se connecter, exécuter des requêtes, gérer les curseurs.",
    order: 1,
    content: `
\`sqlite3\` (module standard) permet d'utiliser une base de données relationnelle complète stockée dans **un seul fichier**, sans serveur à installer :

\`\`\`python
import sqlite3

conn = sqlite3.connect("app.db")
cur = conn.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, nom TEXT, age INTEGER)")
cur.execute("INSERT INTO users (nom, age) VALUES (?, ?)", ("Alice", 25))
conn.commit()   # nécessaire pour persister les écritures

cur.execute("SELECT * FROM users WHERE age > ?", (18,))
for ligne in cur.fetchall():
    print(ligne)

conn.close()
\`\`\`

Utiliser \`with sqlite3.connect(...) as conn:\` gère automatiquement le commit/rollback en fin de bloc (mais **ne ferme pas** la connexion — il faut toujours \`conn.close()\` explicitement, ou l'englober dans un second \`with contextlib.closing(conn)\`).

\`fetchone()\` retourne une seule ligne (ou \`None\`), \`fetchall()\` retourne toutes les lignes restantes en mémoire, \`fetchmany(n)\` en retourne \`n\` — préférable pour de gros résultats afin d'éviter de tout charger d'un coup.
`,
  },
  {
    id: "sql-injections",
    level: 3,
    topic: "sql",
    title: "Requêtes paramétrées et injection SQL",
    summary: "Ne jamais construire une requête par concaténation de chaînes.",
    order: 2,
    content: `
**Ne jamais** construire une requête SQL par concaténation ou f-string avec une valeur venant de l'utilisateur :

\`\`\`python
# DANGEREUX : injection SQL possible
nom = entree_utilisateur
cur.execute(f"SELECT * FROM users WHERE nom = '{nom}'")
# si nom = "' OR '1'='1", la requête devient triviale à contourner
\`\`\`

Toujours utiliser des **requêtes paramétrées**, où la bibliothèque échappe correctement les valeurs :

\`\`\`python
cur.execute("SELECT * FROM users WHERE nom = ?", (nom,))          # sqlite3 : ?
# psycopg2 (PostgreSQL) : %s   |   d'autres drivers : :nom (nommé)
\`\`\`

Le paramètre \`?\` (ou équivalent selon le driver) n'est **jamais** interprété comme du SQL exécutable, quelle que soit la valeur fournie — c'est la seule protection fiable contre l'injection SQL, bien plus robuste que tenter d'échapper les caractères "à la main" (\`replace("'", "''")\`), qui manque presque toujours des cas limites (encodages, caractères de contrôle, etc.).

Cette règle s'applique à **tout** driver SQL en Python (sqlite3, psycopg2, mysql-connector, SQLAlchemy en mode texte brut) — jamais d'exception « pour cette fois, c'est un cas simple ».
`,
  },
  {
    id: "sql-joins-groupby",
    level: 3,
    topic: "sql",
    title: "SELECT, WHERE, JOIN, GROUP BY",
    summary: "Les clauses SQL essentielles utilisées depuis Python.",
    order: 3,
    content: `
\`\`\`sql
SELECT departement, COUNT(*) AS effectif, AVG(salaire) AS salaire_moyen
FROM employes
JOIN departements ON employes.dept_id = departements.id
WHERE employes.actif = 1
GROUP BY departement
HAVING COUNT(*) > 5
ORDER BY salaire_moyen DESC;
\`\`\`

Ordre logique d'exécution (différent de l'ordre d'écriture) : \`FROM\`/\`JOIN\` → \`WHERE\` (filtre les lignes brutes) → \`GROUP BY\` → \`HAVING\` (filtre les **groupes**, pas les lignes individuelles) → \`SELECT\` → \`ORDER BY\`.

\`INNER JOIN\` ne garde que les lignes ayant une correspondance dans les deux tables ; \`LEFT JOIN\` garde toutes les lignes de la table de gauche, avec \`NULL\` côté droit en l'absence de correspondance.

\`WHERE\` ne peut **pas** filtrer sur le résultat d'une agrégation (\`WHERE COUNT(*) > 5\` est invalide) — c'est exactement le rôle de \`HAVING\`, appliqué après le regroupement.
`,
  },
  {
    id: "sql-transactions",
    level: 3,
    topic: "sql",
    title: "Transactions",
    summary: "Garantir la cohérence des données face aux erreurs.",
    order: 4,
    content: `
Une **transaction** regroupe plusieurs opérations en une unité atomique : soit toutes réussissent (\`COMMIT\`), soit aucune n'est appliquée (\`ROLLBACK\`) — propriétés résumées par l'acronyme **ACID** (Atomicité, Cohérence, Isolation, Durabilité).

\`\`\`python
try:
    cur.execute("UPDATE comptes SET solde = solde - 100 WHERE id = 1")
    cur.execute("UPDATE comptes SET solde = solde + 100 WHERE id = 2")
    conn.commit()   # les deux mises à jour sont validées ensemble
except Exception:
    conn.rollback()  # aucune des deux n'est appliquée en cas d'erreur
    raise
\`\`\`

Sans transaction explicite, un virement bancaire qui échoue après le premier \`UPDATE\` (par exemple un crash serveur) laisserait la base dans un état incohérent (argent débité mais jamais crédité). \`sqlite3\` démarre implicitement une transaction dès la première instruction de modification, qu'il faut valider avec \`commit()\`.

Le niveau d'**isolation** détermine si des transactions concurrentes peuvent se voir mutuellement des états intermédiaires — un sujet plus avancé, pertinent surtout avec des bases multi-utilisateurs (PostgreSQL, MySQL) plutôt qu'avec SQLite, généralement mono-utilisateur.
`,
  },
];
