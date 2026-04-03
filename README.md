# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a production-ready three-tier application, containerized with Docker, and deployed on a multi-node Kubernetes cluster using Kind.

---

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
                        │  frontend pod   backend pod (x1)             │
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

| Tier | Technology | Image | Kind |
|------|-----------|-------|------|
| Frontend | React + Vite + Nginx | `akifmhd/frontend:1.1` | Deployment |
| Backend | Node.js + Express | `akifmhd/backend:1.0` | Deployment |
| Database | MongoDB 7.0 | `mongo:7.0` | StatefulSet |

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
│   ├── .env.development              # API URL for local dev
│   ├── .env.production               # API URL for production
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── k8s-manifest/                     # Kubernetes manifests
│   ├── namespace.yml
│   ├── ingress.yml
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
├── docker-compose.yml                # Local multi-container dev
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, Nginx |
| Backend | Node.js, Express, Mongoose, dotenv |
| Database | MongoDB 7.0 |
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
# → Backend running on port 5000
# → MongoDB connected

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

> If accessing from a VM, replace `localhost` with your VM IP and open firewall ports:
> ```bash
> sudo firewall-cmd --permanent --add-port=5173/tcp
> sudo firewall-cmd --permanent --add-port=5000/tcp
> sudo firewall-cmd --reload
> ```

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

## ☸️ Kubernetes Deployment (Kind)

### Prerequisites

- Docker installed
- Kind installed
- kubectl installed
- Nginx Ingress Controller installed on the cluster

---

### Step 1 — Create Kind cluster

```yaml
# kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
```

```bash
kind create cluster --config kind-config.yaml --name three-tier
```

---

### Step 2 — Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

---

### Step 3 — Build and push Docker images

```bash
# Backend
docker build -t your-username/backend:1.0 ./backend
docker push your-username/backend:1.0

# Frontend
docker build -t your-username/frontend:1.1 ./frontend
docker push your-username/frontend:1.1
```

> Update image names in `k8s-manifest/backend/backend-dep.yml` and `k8s-manifest/frontend/frontend-dep.yml`.

---

### Step 4 — Apply all manifests

```bash
# Namespace first
kubectl apply -f k8s-manifest/namespace.yml

# Database
kubectl apply -f k8s-manifest/database/

# Backend
kubectl apply -f k8s-manifest/backend/

# Frontend
kubectl apply -f k8s-manifest/frontend/

# Ingress
kubectl apply -f k8s-manifest/ingress.yml
```

---

### Step 5 — Add host entry

```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1   snake-game.com
```

---

### Step 6 — Verify everything is running

```bash
kubectl get all -n three-tier-dev
```

Expected output:
```
NAME                                       READY   STATUS    RESTARTS
pod/backend-dep-xxxxx                      1/1     Running   0
pod/frontend-deployment-xxxxx              1/1     Running   0
pod/mongodb-deployment-0                   1/1     Running   0

NAME                   TYPE        PORT(S)
service/backend-svc    ClusterIP   5000/TCP
service/frontend-svc   ClusterIP   80/TCP
service/mongodb-svc    ClusterIP   None
```

---

### Step 7 — Open the app

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
- **Auth source:** `admin`
- **Credentials:** injected via Kubernetes Secret (`mongo-sec`)
- **Storage:** 100Mi PVC mounted at `/data/db`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated primary key |
| `score` | Number | Player's final score |
| `createdAt` | Date | Auto-added by Mongoose |
| `updatedAt` | Date | Auto-added by Mongoose |

---

## 🔧 Kubernetes Resources Summary

| Resource | Name | Details |
|----------|------|---------|
| Namespace | `three-tier-dev` | Isolates all app resources |
| Deployment | `frontend-deployment` | Nginx serving React app (1 replica) |
| Deployment | `backend-dep` | Node.js API (1 replica) |
| StatefulSet | `mongodb-deployment` | MongoDB with stable identity and storage |
| Service | `frontend-svc` | ClusterIP — port 80 |
| Service | `backend-svc` | ClusterIP — port 5000 |
| Service | `mongodb-svc` | Headless (clusterIP: None) — port 27017 |
| ConfigMap | `backend-config` | Stores `MONGO_URI` and `PORT` |
| Secret | `mongo-sec` | Stores MongoDB root credentials |
| PVC | `mongodb-volume-claim` | Auto-created by StatefulSet (100Mi) |
| Ingress | `ingress` | Routes `/` → frontend, `/api` → backend |

---

## 🛡️ Security Features

| Feature | Applied To |
|---------|-----------|
| `seccompProfile: RuntimeDefault` | Frontend pod, Backend pod |
| `allowPrivilegeEscalation: false` | Frontend container, Backend container |
| `privileged: false` | Frontend container, Backend container |
| Credentials via Secret | MongoDB — never hardcoded |
| ConfigMap for non-sensitive config | Backend MONGO_URI, PORT |

---

## 📊 Resource Limits

| Tier | Memory Request | Memory Limit | CPU Request | CPU Limit |
|------|---------------|-------------|-------------|-----------|
| Frontend | 100Mi | 100Mi | 100m | 200m |
| Backend | 250Mi | 250Mi | 300m | 500m |
| MongoDB | 256Mi | 512Mi | 250m | 500m |

---

## 🔍 Health Checks

| Tier | Type | Endpoint | Initial Delay |
|------|------|----------|--------------|
| Frontend | HTTP GET | `/` port 80 | 10s readiness / 15s liveness |
| Backend | HTTP GET | `/health` port 5000 | 10s readiness / 15s liveness |
| MongoDB | exec `mongosh --eval "db.adminCommand('ping')"` | — | 15s readiness / 30s liveness |

---

## 🛑 Useful Commands

```bash
# Check pod status and which node they run on
kubectl get pods -n three-tier-dev -o wide

# Stream pod logs
kubectl logs -f deployment/backend-dep -n three-tier-dev
kubectl logs -f deployment/frontend-deployment -n three-tier-dev
kubectl logs -f statefulset/mongodb-deployment -n three-tier-dev

# Describe a pod for debugging
kubectl describe pod POD_NAME -n three-tier-dev

# Restart a deployment
kubectl rollout restart deployment/backend-dep -n three-tier-dev

# Port forward for quick testing
kubectl port-forward svc/frontend-svc 8080:80 -n three-tier-dev
kubectl port-forward svc/backend-svc 5000:5000 -n three-tier-dev

# Check PVC status
kubectl get pvc -n three-tier-dev

# Delete everything
kubectl delete namespace three-tier-dev

# Stop local dev processes
sudo kill $(sudo lsof -t -i :5000)
sudo kill $(sudo lsof -t -i :5173)
```

---

## 🔧 Common Modifications

| What to change | File | What to edit |
|----------------|------|-------------|
| Game speed | `frontend/src/hooks/useGame.js` | `const SPEED = 150` |
| Grid size | `frontend/src/hooks/useGame.js` | `const COLS` and `const ROWS` |
| Points per food | `frontend/src/hooks/useGame.js` | `setScore((s) => s + 10)` |
| Top scores shown | `backend/src/routes/scores.js` | `.limit(10)` |
| App colors | `frontend/src/App.css` | Edit hex values |
| MongoDB credentials | `k8s-manifest/database/mongo-secret.yml` | Base64-encoded values |
| Backend replicas | `k8s-manifest/backend/backend-dep.yml` | `replicas: 1` |
| MongoDB storage | `k8s-manifest/database/mongodb-dep.yml` | `storage: 100Mi` |

---

## 📄 License

MIT