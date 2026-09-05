# Flower — le petit jardin

Petit jeu web responsive dans lequel le joueur prend soin d'une fleur. Il peut l'arroser et lui donner de la lumière pour maintenir son équilibre et faire progresser sa vitalité.

Le jeu et sa progression sont gérés côté frontend et sauvegardés dans le `localStorage` du navigateur. Le backend Express sert les fichiers statiques et conserve la route `/api/verify` disponible pour les évolutions futures.

## Lancer en local

```bash
npm install
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000).

- `GET /health` pour les sondes AWS

## Solutions AWS pour héberger ce site

AWS propose plusieurs familles d’hébergement. Pour **ce** projet (pages statiques + petite API), voici les options les plus pertinentes.

### 1. Recommandé pour commencer — AWS Amplify Hosting + Lambda / API Gateway

- **Amplify Hosting** : build et HTTPS depuis GitHub, CDN mondial, adapté au frontend.
- **API Gateway + AWS Lambda** : la route `/api/verify` sans serveur à gérer.
- Idéal si tu veux rester proche du dépôt GitHub et payer à l’usage.

### 2. Le plus simple en un seul service — AWS App Runner

Tu déploies le **Dockerfile** (ou le dépôt Node). App Runner expose HTTPS, met à l’échelle et lit `PORT`. Front et back restent ensemble, comme en local.

### 3. Classique et économique pour le front — Amazon S3 + CloudFront

- **S3** : fichiers du dossier `frontend/`.
- **CloudFront** : HTTPS et cache mondial.
- Le backend n’est **pas** dans S3 : il faut une API à part (Lambda, App Runner, etc.).

AWS recommande souvent Amplify Hosting plutôt que le « website hosting » S3 brut, surtout pour HTTPS et le déploiement.

### 4. Serverless API — Amazon API Gateway + AWS Lambda

La vérification du mot tourne dans une fonction Lambda. Très peu de coût au repos, bon couple avec un front S3/CloudFront ou Amplify.

### 5. Conteneurs — Amazon ECS (Fargate) + Application Load Balancer

Tu lances le même Docker image. Plus de contrôle (réseau, IAM, observabilité), plus d’ops qu’App Runner.

### 6. Plateforme classique — AWS Elastic Beanstalk

Tu pousses l’app Node (`Procfile` déjà fourni). Beanstalk gère load balancer, instances et déploiements. Moins « à la mode » qu’App Runner, encore très utilisé.

### 7. Machine virtuelle — Amazon EC2

Tu installes Node (ou Docker) toi-même. Maximum de liberté, tout l’entretien (OS, TLS, pare-feu) est à ta charge.

### 8. Petit serveur clé en main — Amazon Lightsail

VPS simplifié (prix forfaitaire), suffisant pour un site pédagogique. Moins d’écosystème qu’EC2 / App Runner.

### 9. Si le front devient une vraie app SSR — Amplify Hosting (SSR) ou ECS

Inutile pour l’instant : ce site est du HTML/CSS/JS statique + une API JSON.

### Comment choisir pour Flower

| Besoin | Service |
| --- | --- |
| Un seul bouton « déployer le repo » | **App Runner** ou **Amplify** |
| Front mondial + API minuscule | **S3/CloudFront ou Amplify** + **Lambda** |
| Même process qu’en local (Express) | **App Runner**, **Elastic Beanstalk**, **Lightsail**, **EC2** |
| Contrôle fin / prod sérieuse | **ECS Fargate** |

**Route 53** peut pointer un nom de domaine vers n’importe laquelle de ces cibles. **ACM** fournit le certificat TLS.

## Déploiement App Runner (exemple)

1. Pousse ce dépôt sur GitHub.
2. Console AWS → App Runner → source GitHub ou image Docker.
3. Commande de démarrage : `npm start` (ou image Docker, port **8080**).
4. Variable d’environnement : `SECRET_WORD=fleur` si la route API de vérification est utilisée.

## Mettre à jour le jeu sur Lightsail

Depuis la machine de développement :

```bash
git add .
git commit -m "Mettre à jour le jeu"
git push origin main
```

Puis sur le serveur :

```bash
cd ~/Flower
git pull origin main
sudo docker build -t flower .
sudo docker rm -f flower 2>/dev/null || true
sudo docker run -d --name flower --restart unless-stopped -p 80:8080 -e SECRET_WORD='fleur' flower
```
