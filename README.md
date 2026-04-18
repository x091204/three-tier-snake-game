# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a production-ready three-tier application with a complete DevSecOps CI/CD pipeline, containerized with Docker, and deployed on a multi-node Kubernetes cluster using Kind. Supports both raw Kubernetes manifests and Helm chart deployment.



## 📐 Architecture

```
                        ┌──────────────────────────────────────────────┐
                        │           Kind Kubernetes Cluster            │
                        │           Namespace: three-tier-dev          │
                        │                                              │
                        │   ┌─────────────┐                            │
  Browser               │   │   Ingress    │  snake-game.com           │
  http://snake-game.com─┼──►│   (Nginx)   │                            │
                        │   └──────┬──────┘                            │
                        │          │                                   │
                        │    /     │     /api                          │
                        │    ▼           ▼                             │
                        │  frontend-svc  backend-svc                   │
                        │       │              │                       │
                        │  frontend pod   backend pod                  │
                        │  (Nginx)        (Node.js)                    │
                        │                      │                       │
                        │               mongodb-svc                    │
                        │               (Headless)                     │
                        │                      │                       │
                        │              mongodb pod                     │
                        │              (StatefulSet)                   │
                        │                      │                       │
                        │                   PVC (100Mi)                │
                        └──────────────────────────────────────────────┘

Cluster: 1 control plane + 2 worker nodes
```



## 🔄 CI/CD Pipeline

```
GitHub Push
    │
    ▼
Clean Workspace → Clone Repo → SonarQube Analysis → Build Docker Image → Trivy Scan → Push to Docker Hub
                                                                              │
                                                                    blocks on HIGH/CRITICAL CVEs
                                                                    generates HTML report
```

| Stage | What it does |
|-------|-------------|
| Clean workspace | Wipes Jenkins workspace before starting |
| Clone repo | Pulls latest code from GitHub main branch |
| SonarQube analysis | Scans source code for bugs, vulnerabilities, code smells |
| Build Docker image | Builds image from Dockerfile |
| Trivy scan | Scans image for HIGH/CRITICAL CVEs, blocks push if found |
| Push to Docker Hub | Pushes image using Jenkins credentials |
| Post actions | Archives Trivy HTML report, prunes old images, cleans workspace |



## 🎮 What the App Does

- Snake game on a 20×20 grid controlled with arrow keys
- Score increases by 10 points per food eaten
- Score automatically saved to MongoDB when the game ends
- Scoreboard shows the top 10 highest scores
- Scoreboard refreshes automatically after every game



## 🗂️ Project Structure

```
three-tier-snake-game/
│
├── backend/                            # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js                # MongoDB connection
│   │   ├── models/Score.js             # Mongoose schema
│   │   ├── routes/scores.js            # POST and GET endpoints
│   │   └── server.js                   # Express entry point
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .trivyignore
│   ├── .env                            # Local dev only — never commit
│   └── package.json
│
├── frontend/                           # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx                # Game grid renderer
│   │   │   └── Scoreboard.jsx          # Top 10 scores table
│   │   ├── hooks/
│   │   │   └── useGame.js              # All game logic
│   │   ├── App.jsx                     # Root component
│   │   ├── App.css                     # All styling
│   │   ├── api.js                      # All HTTP calls
│   │   └── main.jsx                    # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── Dockerfile
│   └── package.json
│
├── helm-chart/                         # Helm chart deployment
│   └── three-tier-snake-game/
│       ├── Chart.yaml                  # Chart metadata
│       ├── values.yaml                 # All configurable values
│       └── templates/
│           ├── frontend-dep.yml
│           ├── frontend-svc.yml
│           ├── backend-dep.yml
│           ├── backend-svc.yml
│           ├── backend-configmap.yml
│           ├── mongodb-dep.yml         # StatefulSet
│           ├── mongo-svc.yml           # Headless service
│           ├── mongo-secret.yml
│           └── ingress.yml
│
├── k8s-manifest/                       # Raw Kubernetes manifests
│   ├── namespace.yml
│   ├── ingress.yml
│   ├── frontend/
│   ├── backend/
│   └── database/
│
├── jenkins-pipeline/                   # CI/CD pipelines
│   ├── backend/Jenkinsfile
│   └── frontend/Jenkinsfile
│
├── z-documentation/                    # Full project documentation
│   └── three-tier-snake-game-docs.docx
│
├── docker-compose.yml
└── README.md
```



## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, Nginx |
| Backend | Node.js, Express, Mongoose, dotenv |
| Database | MongoDB 7.0 |
| CI/CD | Jenkins, SonarQube, Trivy |
| Container | Docker |
| Orchestration | Kubernetes (Kind) |
| Package Manager | Helm |
| Ingress | Nginx Ingress Controller |
| Persistence | PersistentVolumeClaim via StatefulSet (100Mi) |



## 🚀 Running Locally

### Option 1 — Manual

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

`backend/.env`
```
MONGO_URI=mongodb://localhost:27017/snakegame
PORT=5000
```

`frontend/.env.development`
```
VITE_API_URL=http://localhost:5000
```

### Option 2 — Docker Compose

```bash
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:5000 |
| MongoDB | localhost:27017 |



## ☸️ Kubernetes Deployment

### Prerequisites

- Kind cluster running
- Nginx Ingress Controller installed
- Docker images pushed to registry
- `snake-game.com` added to `/etc/hosts`

### Create Kind cluster

```bash
kind create cluster --config k8s-manifest/cluster.yml --name three-tier
```

### Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

### Add host entry

```bash
# Add to /etc/hosts
127.0.0.1   snake-game.com
```



## 🎯 Deploy with Helm (Recommended)

Helm deploys the entire application with a single command.

### Install

```bash
helm install snake-game ./helm-chart/three-tier-snake-game
```

### Verify

```bash
helm list
kubectl get all -n three-tier-dev
```

### Upgrade (e.g. new image tag)

```bash
helm upgrade snake-game ./helm-chart/three-tier-snake-game --set backend.tag=2.0
```

### Change replicas

```bash
helm upgrade snake-game ./helm-chart/three-tier-snake-game --set backend.replicasCount=2
```

### Rollback

```bash
helm rollback snake-game 1
```

### Uninstall

```bash
helm uninstall snake-game
```

### values.yaml — all configurable values

```yaml
namespace: three-tier-dev

frontend:
  image: akifmhd/frontend
  tag: "1.1"
  replicasCount: 1

backend:
  image: akifmhd/backend
  tag: "1.0"
  replicasCount: 1

mongodb:
  image: mongo
  tag: "7.0"
  replicasCount: 1
```



## 📋 Deploy with Raw Manifests

```bash
kubectl apply -f k8s-manifest/namespace.yml
kubectl apply -f k8s-manifest/database/
kubectl apply -f k8s-manifest/backend/
kubectl apply -f k8s-manifest/frontend/
kubectl apply -f k8s-manifest/ingress.yml
```



## 📡 API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Kubernetes liveness probe |
| POST | `/api/scores` | `{ score: Number }` | Save a score |
| GET | `/api/scores` | — | Get top 10 scores |



## 🔧 Jenkins Pipeline Setup

### Jenkins credentials required

| Credential ID | Type | Used for |
|--------------|------|---------|
| `akifmhd` | Username/Password | Docker Hub login |

### Jenkins tools required

| Tool | Name in Jenkins |
|------|----------------|
| SonarQube Scanner | `sonar-scanner` |
| SonarQube Server | `sonar-server` |

### Create pipelines

Create two Pipeline jobs in Jenkins:
- `frontend-snake-game` → `jenkins-pipeline/frontend/Jenkinsfile`
- `backend` → `jenkins-pipeline/backend/Jenkinsfile`



## 🛡️ Security Features

| Feature | Applied To |
|---------|-----------|
| SonarQube code analysis | Frontend and Backend pipelines |
| Trivy image scanning (HIGH/CRITICAL) | Frontend and Backend pipelines |
| `seccompProfile: RuntimeDefault` | Frontend pod, Backend pod |
| `allowPrivilegeEscalation: false` | Frontend container, Backend container |
| `privileged: false` | Frontend container, Backend container |
| Credentials via Kubernetes Secret | MongoDB — never hardcoded |
| Docker Hub credentials via Jenkins | Never hardcoded in pipeline |



## 📊 Resource Limits

| Tier | Memory Request | Memory Limit | CPU Request | CPU Limit |
|------|---------------|-------------|-------------|-----------|
| Frontend | 100Mi | 100Mi | 100m | 200m |
| Backend | 250Mi | 250Mi | 300m | 500m |
| MongoDB | 256Mi | 512Mi | 250m | 500m |



## 🔍 Health Checks

| Tier | Type | Path | Readiness Delay | Liveness Delay |
|------|------|------|----------------|----------------|
| Frontend | HTTP GET | `/` port 80 | 10s | 15s |
| Backend | HTTP GET | `/health` port 5000 | 10s | 15s |
| MongoDB | exec mongosh ping | — | 30s | 60s |



## 🛑 Useful Commands

```bash
# Check pod status
kubectl get pods -n three-tier-dev -o wide

# Stream logs
kubectl logs -f deployment/backend-dep -n three-tier-dev
kubectl logs -f statefulset/mongodb-deployment -n three-tier-dev

# Helm status
helm status snake-game
helm history snake-game

# Restart a deployment
kubectl rollout restart deployment/backend-dep -n three-tier-dev

# Port forward for quick testing
kubectl port-forward svc/frontend-svc 8080:80 -n three-tier-dev

# Delete everything (Helm)
helm uninstall snake-game

# Delete everything (raw manifests)
kubectl delete namespace three-tier-dev
```



## 🔧 Common Modifications

| What to change | File | What to edit |
|----------------|------|-------------|
| Image tag | `helm-chart/.../values.yaml` | `frontend.tag` or `backend.tag` |
| Replicas | `helm-chart/.../values.yaml` | `backend.replicasCount` |
| Game speed | `frontend/src/hooks/useGame.js` | `const SPEED = 150` |
| Grid size | `frontend/src/hooks/useGame.js` | `const COLS` and `const ROWS` |
| Points per food | `frontend/src/hooks/useGame.js` | `setScore((s) => s + 10)` |
| Top scores shown | `backend/src/routes/scores.js` | `.limit(10)` |



## 📄 License

MIT
