# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a **three-tier application** — designed from the ground up for Kubernetes deployment.

---

## 🏗️ Architecture

```
┌─────────────────┐     REST API      ┌─────────────────┐     Mongoose      ┌─────────────────┐
│                 │ ────────────────▶ │                 │ ────────────────▶ │                 │
│   React.js      │                   │   Node.js       │                   │   MongoDB       │
│   Frontend      │ ◀──────────────── │   Backend       │ ◀──────────────── │   Database      │
│   Port 3000     │                   │   Port 5000     │                   │   Port 27017    │
│                 │                   │                 │                   │                 │
└─────────────────┘                   └─────────────────┘                   └─────────────────┘
     Tier 1                                Tier 2                                Tier 3
```

Each tier runs as its own independent service — exactly how Kubernetes expects it.

---

## 🎮 Features

- Snake game on a 20x20 grid controlled with arrow keys
- Score increases by 10 points per food eaten
- Score is automatically saved to MongoDB after every game
- Live scoreboard showing top 10 highest scores
- Scoreboard refreshes automatically after each game
- `/health` endpoint on backend for Kubernetes liveness probe

---

## 🗂️ Project Structure

```
three-tier-snake-game/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── models/
│   │   │   └── Score.js           # Mongoose schema
│   │   ├── routes/
│   │   │   └── scores.js          # POST and GET endpoints
│   │   └── server.js              # Express entry point
│   ├── .env                       # Local env vars (never commit)
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx           # Game grid renderer
│   │   │   └── Scoreboard.jsx     # Top 10 scores table
│   │   ├── hooks/
│   │   │   └── useGame.js         # All game logic
│   │   ├── App.jsx                # Root component
│   │   ├── App.css                # All styles
│   │   ├── api.js                 # All HTTP calls
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.development           # API URL for local dev
│   ├── .env.production            # API URL for Kubernetes
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
│
└── .gitignore
```

---

## ⚙️ Tech Stack

|Tier|Technology|Port|
|---|---|---|
|Frontend|React.js + Vite|5173 (dev) / 80 (prod)|
|Backend|Node.js + Express|5000|
|Database|MongoDB|27017|

---

## 🚀 Running Locally

### Prerequisites

- Node.js v20+
- MongoDB v7+

### 1. Install and start MongoDB

```bash
# Fedora / RHEL
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

sudo dnf install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

Expected output:

```
Backend running on port 5000
MongoDB connected
```

### 3. Start the frontend

Open a new terminal tab, then:

```bash
cd frontend
npm install
npm run dev
```

Expected output:

```
VITE ready in 178ms
Local: http://localhost:5173/
```

### 4. Open in browser

```
http://localhost:5173
```

If you are on a VM and accessing from a host machine:

```bash
# Open firewall ports on the VM
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

Then update `frontend/.env.development`:

```
VITE_API_URL=http://YOUR_VM_IP:5000
```

---

## 🌍 Environment Variables

### Backend — `backend/.env`

```env
MONGO_URI=mongodb://localhost:27017/snakegame
PORT=5000
```

### Frontend — `frontend/.env.development`

```env
VITE_API_URL=http://localhost:5000
```

### Frontend — `frontend/.env.production`

```env
VITE_API_URL=http://YOUR_BACKEND_SERVICE_URL
```

> In Kubernetes, `.env` files are replaced by **ConfigMaps** and **Secrets**. The code reads from `process.env.*` and `import.meta.env.*` — it does not care where the values come from. No code changes needed.

---

## 📡 API Reference

|Method|Endpoint|Body|Description|
|---|---|---|---|
|GET|`/health`|none|Kubernetes liveness probe|
|POST|`/api/scores`|`{ score: Number }`|Save a new score|
|GET|`/api/scores`|none|Get top 10 scores|

---

## 🗄️ Database Schema

Collection: `scores`

|Field|Type|Description|
|---|---|---|
|`_id`|ObjectId|Auto-generated primary key|
|`score`|Number|Player's final score|
|`createdAt`|Date|Auto-added by Mongoose|
|`updatedAt`|Date|Auto-added by Mongoose|

---

## 🐳 Docker

No Dockerfile needed for MongoDB — use the official image directly.

### Build images

```bash
# Backend
docker build -t your-username/snake-backend:v1 ./backend

# Frontend
docker build -t your-username/snake-frontend:v1 ./frontend
```

### Push to registry

```bash
docker push your-username/snake-backend:v1
docker push your-username/snake-frontend:v1
```

---

## ☸️ Kubernetes

This app was designed for Kubernetes from the start. Key points for the DevOps engineer:

|What|Detail|
|---|---|
|Backend env vars|Inject `MONGO_URI` and `PORT` via ConfigMap|
|MongoDB password|Store in a Secret if auth is enabled|
|Frontend API URL|Set `VITE_API_URL` as a build arg pointing to backend Service|
|Health check|`GET /health` returns `{ status: 'ok' }` — use as `livenessProbe`|
|MongoDB data|Mount a `PersistentVolumeClaim` to `/data/db`|
|Scaling|Frontend and backend are stateless — safe to scale replicas|
|MongoDB service name|Use `mongo-service` — backend MONGO_URI becomes `mongodb://mongo-service:27017/snakegame`|

### Suggested resources

```
Frontend  → Deployment + Service (NodePort)
Backend   → Deployment + Service (ClusterIP)
MongoDB   → Deployment + Service (ClusterIP) + PersistentVolumeClaim
           + ConfigMap (MONGO_URI) + Secret (password if needed)
```

---

## 🛑 Stopping the App

```bash
# Kill by port
sudo kill $(sudo lsof -t -i :5000)
sudo kill $(sudo lsof -t -i :5173)

# Or kill all node processes
pkill -f node
```

---

## 🔧 Common Modifications

|What to change|Where|What to edit|
|---|---|---|
|Game speed|`frontend/src/hooks/useGame.js`|`const SPEED = 150` (lower = faster)|
|Grid size|`frontend/src/hooks/useGame.js`|`const COLS = 20` and `const ROWS = 20`|
|Points per food|`frontend/src/hooks/useGame.js`|`setScore((s) => s + 10)`|
|Number of top scores|`backend/src/routes/scores.js`|`.limit(10)`|
|Colors|`frontend/src/App.css`|Edit hex color values|
|App title|`frontend/index.html` + `frontend/src/App.jsx`|`<title>` and `<h1>` tags|


## 📄 License

MIT