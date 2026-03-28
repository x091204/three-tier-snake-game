# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a production-ready three-tier application, containerized with Docker, and deployed on Kubernetes.

---

## 📐 Architecture

```
                        ┌─────────────────────────────────────┐
                        │         Kubernetes Cluster           │
                        │         Namespace: three-tier-dev    │
                        │                                      │
  Browser ──► Ingress ──►  frontend-svc  ──►  frontend pod    │
              (80 / api)                                       │
                        │  backend-svc   ──►  backend pod(x2) │
                        │                        │             │
                        │  mongodb-svc   ──►  mongodb pod      │
                        │                        │             │
                        │                     PVC (1Gi)        │
                        └─────────────────────────────────────┘
```

| Tier | Technology | Image | Replicas |
|------|-----------|-------|----------|
| Frontend | React + Vite + Nginx | `akifmhd/frontend:1.1` | 1 |
| Backend | Node.js + Express | `akifmhd/backend:1.0` | 2 |
| Database | MongoDB 7.0 | `mongo:7.0` | 1 |

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
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js            # MongoDB connection
│   │   ├── models/Score.js         # Mongoose schema
│   │   ├── routes/scores.js        # POST and GET endpoints
│   │   └── server.js               # Express entry point
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env                        # Local dev only — never commit
│   └── package.json
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx            # Game grid renderer
│   │   │   └── Scoreboard.jsx      # Top 10 scores table
│   │   ├── hooks/
│   │   │   └── useGame.js          # All game logic
│   │   ├── App.jsx                 # Root component
│   │   ├── App.css                 # All styling
│   │   ├── api.js                  # All HTTP calls
│   │   └── main.jsx                # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.development            # API URL for local dev
│   ├── .env.production             # API URL for production
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── k8s-manifest/                   # Kubernetes manifests
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
│       ├── mongodb-dep.yml
│       ├── mongo-svc.yml
│       ├── mongo-secret.yml
│       └── pvc.yml
│
├── docker-compose.yml              # Local multi-container dev
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios |
| Backend | Node.js, Express, Mongoose, dotenv |
| Database | MongoDB 7.0 |
| Container | Docker |
| Orchestration | Kubernetes |
| Ingress | Kubernetes Ingress (snake-game.com) |
| Persistence | PersistentVolumeClaim (1Gi) |

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

> If accessing from a VM, replace `localhost` with your VM's IP address and open the firewall ports:
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

> Make sure `backend/.env` exists before running compose.

---

## ☸️ Kubernetes Deployment

### Prerequisites

- A running Kubernetes cluster
- `kubectl` configured and connected to the cluster
- Docker images built and pushed to a registry
- An Ingress controller installed on the cluster

---

### Step 1 — Build and push Docker images

```bash
# Backend
docker build -t your-username/backend:1.0 ./backend
docker push your-username/backend:1.0

# Frontend
docker build -t your-username/frontend:1.1 ./frontend
docker push your-username/frontend:1.1
```

> Update the image names in `k8s-manifest/backend/backend-dep.yml` and `k8s-manifest/frontend/frontend-dep.yml` to match your registry.

---

### Step 2 — Create the namespace

```bash
kubectl apply -f k8s-manifest/namespace.yml
```

---

### Step 3 — Create the MongoDB secret

```bash
kubectl apply -f k8s-manifest/database/mongo-secret.yml
```

> The secret stores MongoDB credentials as base64-encoded values. Update them before applying if needed.

---

### Step 4 — Apply all manifests

```bash
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

### Step 5 — Verify everything is running

```bash
kubectl get all -n three-tier-dev
```

Expected output:
```
NAME                                       READY   STATUS    RESTARTS
pod/backend-dep-xxxxx                      1/1     Running   0
pod/backend-dep-xxxxx                      1/1     Running   0
pod/frontend-deployment-xxxxx              1/1     Running   0
pod/mongodb-deployment-xxxxx               1/1     Running   0

NAME                   TYPE        CLUSTER-IP    PORT(S)
service/backend-svc    ClusterIP   10.x.x.x      5000/TCP
service/frontend-svc   ClusterIP   10.x.x.x      80/TCP
service/mongodb-svc    ClusterIP   10.x.x.x      27017/TCP
```

---

### Step 6 — Access the app

Add this to your `/etc/hosts` file (or configure DNS):

```
YOUR_CLUSTER_IP   snake-game.com
```

Then open your browser:

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

- **Database name:** `snakegame`
- **Collection:** `scores`
- **Auth source:** `admin`
- **Credentials:** injected via Kubernetes Secret (`mongo-sec`)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated primary key |
| `score` | Number | Player's final score |
| `createdAt` | Date | Auto-added by Mongoose |
| `updatedAt` | Date | Auto-added by Mongoose |

---

## 🔧 Kubernetes Resources Summary

| Resource | Name | Purpose |
|----------|------|---------|
| Namespace | `three-tier-dev` | Isolates all app resources |
| Deployment | `frontend-deployment` | Runs the React/Nginx frontend (1 replica) |
| Deployment | `backend-dep` | Runs the Node.js API (2 replicas) |
| Deployment | `mongodb-deployment` | Runs MongoDB (1 replica) |
| Service | `frontend-svc` | Internal ClusterIP — frontend |
| Service | `backend-svc` | Internal ClusterIP — backend |
| Service | `mongodb-svc` | Internal ClusterIP — MongoDB |
| ConfigMap | `backend-config` | Stores `MONGO_URI` and `PORT` |
| Secret | `mongo-sec` | Stores MongoDB root credentials |
| PVC | `mongodb-volume-claim` | Persistent storage (1Gi) for MongoDB data |
| Ingress | `ingress` | Routes `/` → frontend, `/api` → backend |

---

## 🛑 Useful Commands

```bash
# Check pod status
kubectl get pods -n three-tier-dev

# Stream pod logs
kubectl logs -f deployment/backend-dep -n three-tier-dev
kubectl logs -f deployment/frontend-deployment -n three-tier-dev
kubectl logs -f deployment/mongodb-deployment -n three-tier-dev

# Restart a deployment
kubectl rollout restart deployment/backend-dep -n three-tier-dev

# Delete all resources
kubectl delete namespace three-tier-dev

# Stop local dev processes
sudo kill $(sudo lsof -t -i :5000)
sudo kill $(sudo lsof -t -i :5173)
```

---

## 🔧 Common Modifications

| What to change | File | What to edit |
|----------------|------|-------------|
| Game speed | `frontend/src/hooks/useGame.js` | `const SPEED = 150` (lower = faster) |
| Grid size | `frontend/src/hooks/useGame.js` | `const COLS` and `const ROWS` |
| Points per food | `frontend/src/hooks/useGame.js` | `setScore((s) => s + 10)` |
| Top scores shown | `backend/src/routes/scores.js` | `.limit(10)` |
| App colors | `frontend/src/App.css` | Edit hex color values |
| MongoDB credentials | `k8s-manifest/database/mongo-secret.yml` | Base64-encoded values |
| Backend replicas | `k8s-manifest/backend/backend-dep.yml` | `replicas: 2` |

---

## 📄 License

MIT