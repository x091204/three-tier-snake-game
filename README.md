# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a production-ready three-tier application with a complete DevSecOps CI/CD pipeline, containerized with Docker, and deployed on a multi-node Kubernetes cluster using Kind.



## 📐 Architecture

```
                        ┌──────────────────────────────────────────────┐
                        │           Kind Kubernetes Cluster             │
                        │           Namespace: three-tier-dev           │
                        │                                               │
                        │   ┌─────────────┐                            │
  Browser               │   │   Ingress    │  snake-game.com            │
  http://snake-game.com─┼──►│   (Nginx)   │                            │
                        │   └──────┬──────┘                            │
                        │          │                                    │
                        │    /     │     /api                           │
                        │    ▼           ▼                              │
                        │  frontend-svc  backend-svc                   │
                        │       │              │                        │
                        │  frontend pod   backend pod                  │
                        │  (Nginx)        (Node.js)                    │
                        │                      │                        │
                        │               mongodb-svc                    │
                        │               (Headless)                     │
                        │                      │                        │
                        │              mongodb pod                     │
                        │              (StatefulSet)                   │
                        │                      │                        │
                        │                   PVC (100Mi)                │
                        └──────────────────────────────────────────────┘

Cluster: 1 control plane + 2 worker nodes
```

---

## 🔄 CI/CD Pipeline

Both frontend and backend have independent Jenkins pipelines with SonarQube code analysis and Trivy security scanning.

```
GitHub Push
    │
    ▼
┌─────────────────┐
│ Clean Workspace │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Clone Repo    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    SonarQube    │  Code quality analysis
│    Analysis     │  Quality Gate must pass
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Docker   │
│     Image       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Trivy Scan    │  Scans for HIGH/CRITICAL CVEs
│                 │  Generates HTML report
│                 │  Blocks push if vulnerabilities found
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to Docker │
│      Hub        │
└─────────────────┘
         │
    Post Actions:
    - Archive Trivy report
    - Prune old Docker images
    - Clean workspace
```

### Pipeline stages explained

| Stage | What it does |
|-------|-------------|
| Clean workspace | Wipes the Jenkins workspace before starting |
| Clone repo | Pulls latest code from GitHub main branch |
| SonarQube analysis | Scans source code for bugs, vulnerabilities, and code smells |
| Build Docker image | Builds the Docker image from the Dockerfile |
| Trivy scan | Scans the built image for HIGH and CRITICAL CVEs, generates HTML report, blocks push if found |
| Push to Docker Hub | Authenticates and pushes image to Docker Hub using Jenkins credentials |
| Post actions | Archives the Trivy HTML report, prunes old images, cleans workspace |

### Jenkins credentials required

| Credential ID | Type | Used for |
|--------------|------|---------|
| `akifmhd` | Username/Password | Docker Hub login |

### Jenkins tools required

| Tool | Name in Jenkins |
|------|----------------|
| SonarQube Scanner | `sonar-scanner` |
| SonarQube Server | `sonar-server` |

---

## 🎮 What the App Does

- Snake game on a 20×20 grid controlled with arrow keys
- Score increases by 10 points per food eaten
- Score is automatically saved to MongoDB when the game ends
- Scoreboard on the left shows the top 10 highest scores
- Scoreboard refreshes automatically after every game

---

## 🗂️ Project Structure

```
three-tier-snake-game/
│
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── models/Score.js           # Mongoose schema
│   │   ├── routes/scores.js          # POST and GET endpoints
│   │   └── server.js                 # Express entry point
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env                          # Local dev only — never commit
│   └── package.json
│
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx              # Game grid renderer
│   │   │   └── Scoreboard.jsx        # Top 10 scores table
│   │   ├── hooks/
│   │   │   └── useGame.js            # All game logic
│   │   ├── App.jsx                   # Root component
│   │   ├── App.css                   # All styling
│   │   ├── api.js                    # All HTTP calls
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── jenkins-pipeline/                 # CI/CD pipelines
│   ├── backend/
│   │   └── Jenkinsfile               # Backend pipeline
│   └── frontend/
│       └── Jenkinsfile               # Frontend pipeline
│
├── k8s-manifest/                     # Kubernetes manifests
│   ├── namespace.yml
│   ├── ingress.yml
│   ├── cluster.yml                   # Kind cluster config
│   ├── frontend/
│   │   ├── frontend-dep.yml
│   │   └── frontend-svc.yml
│   ├── backend/
│   │   ├── backend-dep.yml
│   │   ├── backend-svc.yml
│   │   └── backend-configmap.yml
│   └── database/
│       ├── mongodb-dep.yml           # StatefulSet
│       ├── mongo-svc.yml             # Headless Service
│       └── mongo-secret.yml
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, Nginx |
| Backend | Node.js, Express, Mongoose, dotenv |
| Database | MongoDB 7.0 |
| CI/CD | Jenkins, SonarQube, Trivy |
| Container | Docker |
| Orchestration | Kubernetes (Kind) |
| Ingress | Nginx Ingress Controller |
| Persistence | PersistentVolumeClaim via StatefulSet (100Mi) |

---

## 🚀 Running Locally

### Option 1 — Manual (two terminals)

**Prerequisites:** Node.js v20+, MongoDB running locally

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

**Environment files needed:**

`backend/.env`
```
MONGO_URI=mongodb://localhost:27017/snakegame
PORT=5000
```

`frontend/.env.development`
```
VITE_API_URL=http://localhost:5000
```

---

### Option 2 — Docker Compose

```bash
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:5000 |
| MongoDB | localhost:27017 |

---

## 🔧 Jenkins Pipeline Setup

### Prerequisites

- Jenkins installed and running
- Docker installed on the Jenkins agent
- Trivy installed on the Jenkins agent
- SonarQube server running and configured in Jenkins

### Step 1 — Configure SonarQube in Jenkins

Go to `Jenkins → Manage Jenkins → Configure System`:
- Add SonarQube server with name `sonar-server`
- Add SonarQube Scanner tool with name `sonar-scanner`

### Step 2 — Add Docker Hub credentials

Go to `Jenkins → Manage Jenkins → Credentials`:
- Add Username/Password credential
- Set ID as `akifmhd`
- Enter your Docker Hub username and password

### Step 3 — Create pipelines

Create two Pipeline jobs in Jenkins:
- `frontend-snake-game` — point to `jenkins-pipeline/frontend/Jenkinsfile`
- `backend` — point to `jenkins-pipeline/backend/Jenkinsfile`

### Step 4 — Run the pipeline

Click **Build Now** on each pipeline. The Trivy HTML report will be archived as a build artifact after each run.

---

## ☸️ Kubernetes Deployment (Kind)

### Step 1 — Create Kind cluster

```bash
kind create cluster --config k8s-manifest/cluster.yml --name three-tier
```

> Update the `hostPath` values in `cluster.yml` to match your local machine path before creating the cluster.

### Step 2 — Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Step 3 — Apply all manifests

```bash
kubectl apply -f k8s-manifest/namespace.yml
kubectl apply -f k8s-manifest/database/
kubectl apply -f k8s-manifest/backend/
kubectl apply -f k8s-manifest/frontend/
kubectl apply -f k8s-manifest/ingress.yml
```

### Step 4 — Add host entry

```bash
sudo nano /etc/hosts
# Add: 127.0.0.1   snake-game.com
```

### Step 5 — Verify

```bash
kubectl get all -n three-tier-dev
```

### Step 6 — Open the app

```
http://snake-game.com
```

---

## 📡 API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Kubernetes liveness probe |
| POST | `/api/scores` | `{ score: Number }` | Save a score after game over |
| GET | `/api/scores` | — | Get top 10 scores |

---

## 🗄️ Database

- **Type:** StatefulSet with PersistentVolumeClaim
- **Database name:** `snakegame`
- **Collection:** `scores`
- **Credentials:** injected via Kubernetes Secret (`mongo-sec`)
- **Storage:** 100Mi PVC mounted at `/data/db`

---

## 🔧 Kubernetes Resources Summary

| Resource | Name | Details |
|----------|------|---------|
| Namespace | `three-tier-dev` | Isolates all app resources |
| Deployment | `frontend-deployment` | Nginx serving React app |
| Deployment | `backend-dep` | Node.js API |
| StatefulSet | `mongodb-deployment` | MongoDB with stable storage |
| Service | `frontend-svc` | ClusterIP — port 80 |
| Service | `backend-svc` | ClusterIP — port 5000 |
| Service | `mongodb-svc` | Headless — port 27017 |
| ConfigMap | `backend-config` | `MONGO_URI` and `PORT` |
| Secret | `mongo-sec` | MongoDB root credentials |
| PVC | `mongodb-volume-claim` | Auto-created by StatefulSet |
| Ingress | `ingress` | Routes `/` → frontend, `/api` → backend |

---

## 🛡️ Security Features

| Feature | Applied To |
|---------|-----------|
| SonarQube code analysis | Frontend and Backend pipelines |
| Trivy image scanning (HIGH/CRITICAL) | Frontend and Backend pipelines |
| `seccompProfile: RuntimeDefault` | Frontend pod, Backend pod |
| `allowPrivilegeEscalation: false` | Frontend container, Backend container |
| `privileged: false` | Frontend container, Backend container |
| Credentials via Secret | MongoDB — never hardcoded |
| Docker Hub credentials via Jenkins | Never hardcoded in pipeline |

---

## 📊 Resource Limits

| Tier | Memory Request | Memory Limit | CPU Request | CPU Limit |
|------|---------------|-------------|-------------|-----------|
| Frontend | 100Mi | 100Mi | 100m | 200m |
| Backend | 250Mi | 250Mi | 300m | 500m |
| MongoDB | 256Mi | 512Mi | 250m | 500m |

---

## 🔍 Health Checks

| Tier | Type | Path | Initial Delay |
|------|------|------|--------------|
| Frontend | HTTP GET | `/` port 80 | 10s / 15s |
| Backend | HTTP GET | `/health` port 5000 | 10s / 15s |
| MongoDB | exec mongosh ping | — | 15s / 30s |

---

## 🛑 Useful Commands

```bash
# Check pod status
kubectl get pods -n three-tier-dev -o wide

# Stream logs
kubectl logs -f deployment/backend-dep -n three-tier-dev
kubectl logs -f deployment/frontend-deployment -n three-tier-dev
kubectl logs -f statefulset/mongodb-deployment -n three-tier-dev

# Restart a deployment
kubectl rollout restart deployment/backend-dep -n three-tier-dev

# Port forward for quick testing
kubectl port-forward svc/frontend-svc 8080:80 -n three-tier-dev
kubectl port-forward svc/backend-svc 5000:5000 -n three-tier-dev

# Delete everything
kubectl delete namespace three-tier-dev

# Stop local dev
sudo kill $(sudo lsof -t -i :5000)
sudo kill $(sudo lsof -t -i :5173)
```

---

## 📄 License

MIT
