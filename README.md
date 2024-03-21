# <p align="center">**Guide d'installation et d'utilisation**</p>

Ce guide vous aidera à configurer et à exécuter l'application en utilisant Docker ou en exécutant directement sur votre machine. Assurez-vous de suivre attentivement les instructions pour une configuration correcte.


----------



## **Configuration de l'environnement**

Avant de commencer, vous devez configurer un fichier .env dans le répertoire du backend. Voici les variables d'environnement nécessaires :

```
DB_ROOT_USER=root
DB_ROOT_PASSWORD=root
DB_DATABASE_NAME=graph_visualisation_db
DB_USERNAME=user
DB_PASSWORD=user_password
DB_PORT=3306
DB_TYPE=mysql
DB_HOST=mysql
DB_DATA_FOLDER=C:\chemin\vers\le\dossier\data\mysql(pour créer un volume de docker)

NEO4J_SCHEME=bolt
NEO4J_HOST=host.docker.internal
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=test1234
NEO4J_DATABASE=graph1

# for tests
NEO4J_TEST_SCHEME=bolt
NEO4J_TEST_HOST=host.docker.internal
NEO4J_TEST_USERNAME=neo4j
NEO4J_TEST_PASSWORD=test1234

# for jwt
JWT_SECRET=8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb
JWT_EXPIRE=20s

# URL du frontend
FRONT_END_ORIGIN=http://localhost:3000

# Chemin vers les modules Node.js
NODE_MODULES=C:\chemin\vers\le\dossier\node_modules(pour créer un volume de docker)


```

Assurez-vous de remplacer les valeurs par celles correspondant à votre configuration.

### Utilisation avec Docker

Si vous souhaitez utiliser Docker, exécutez la commande suivante dans le répertoire où se trouve le fichier docker-compose.yml :
`docker-compose up`

Cela lancera l'application en mode développement.

### Utilisation sans Docker

Si vous préférez exécuter l'application directement sur votre machine, suivez ces étapes :

Assurez-vous que le serveur MySQL est en cours d'exécution.

Dans le répertoire du backend, exécutez la commande suivante pour installer les dépendances :
`npm install`

Ensuite, lancez l'application en mode développement avec la commande :
`npm run start:dev`

### Configuration de la base de données Neo4j

Pour que l'application communique avec la base de données Neo4j, vous devez configurer les variables suivantes dans le fichier .env :

```
NEO4J_SCHEME : le schéma à utiliser pour la connexion (par exemple, bolt).
NEO4J_HOST : l'hôte de la base de données Neo4j.
NEO4J_USERNAME : le nom d'utilisateur de la base de données Neo4j.
NEO4J_PASSWORD : le mot de passe de la base de données Neo4j.
```

Assurez-vous de fournir les valeurs correctes pour ces variables.
