# 🐍 Three-Tier Snake Game

A fully functional Snake Game built as a production-ready **three-tier microservices application** with JWT authentication, a complete DevSecOps CI/CD pipeline, containerized with Docker, and deployed on AWS EKS using Terraform and Helm. Includes full observability with Prometheus and Grafana.

---

## 📐 Architecture

```
                        ┌──────────────────────────────────────────────────┐
                        │              AWS EKS Cluster                      │
                        │              Namespace: three-tier-dev            │
                        │                                                   │
                        │   ┌─────────────────────────┐                    │
  Browser               │   │      Ingress (Nginx)     │                   │
  ──────────────────────┼──►│  snake-game.com          │                   │
                        │   └──────┬──────┬────────────┘                   │
                        │          │      │       │                         │
                        │    /     │  /api│  /auth│                         │
                        │    ▼        ▼       ▼                             │
                        │  frontend  backend  auth-svc                     │
                        │  :80       :5000    :4000                         │
                        │                │        │                         │
                        │           mongodb-svc (Headless)                 │
                        │                │                                  │
                        │           MongoDB (StatefulSet)                  │
                        │                │                                  │
                        │            PVC gp2 (100Mi)                       │
                        │                                                   │
                        │   ┌─────────────────────────┐                    │
                        │   │  Namespace: monitoring   │                    │
                        │   │  Prometheus + Grafana    │                    │
                        │   │  kube-prometheus-stack   │                    │
                        │   └─────────────────────────┘                    │
                        └──────────────────────────────────────────────────┘

Cluster: provisioned by Terraform — VPC, EKS, node groups, IAM, OIDC, ECR
```

---

## 🔄 CI/CD Pipeline

Three independent Jenkins pipelines — frontend, backend, auth-service.

```
GitHub Push (branch selectable via parameter)
         │
         ▼
Clean Workspace → Clone Repo → SonarQube Analysis → Quality Gate
         │
         ▼
Build Docker Image → Trivy Scan (HTML report + gate) → Push to AWS ECR
```

| Stage | What it does |
|-------|-------------|
| Clean workspace | Wipes Jenkins workspace |
| Clone repo | Pulls selected branch from GitHub |
| SonarQube analysis | Scans source code for bugs and vulnerabilities |
| Quality gate | Waits for SonarQube result — marks unstable if failed |
| Build Docker image | Builds image from Dockerfile |
| Trivy scan | Generates HTML report (exit 0) then gates on HIGH/CRITICAL (exit 1) |
| Push to ECR | Authenticates via IAM role — no hardcoded credentials |
| Post | Archives Trivy report, prunes old images, cleans workspace |

**Image tag format:** `1.0.BUILD_NUMBER`

**Jenkins EC2 IAM policies required:**
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- Custom inline: `eks:DescribeCluster`, `eks:ListClusters`, `eks:AccessKubernetesApi`

---

## 🎮 What the App Does

- Snake game on a 20×20 grid controlled with arrow keys
- Register and login with a username and password
- Score increases by 10 points per food eaten
- Score automatically saved to MongoDB with your username on game over
- Leaderboard shows top 10 highest scores with player names
- Leaderboard refreshes automatically after every game
- About page with project info, tech stack, and author details
- Session persists on page refresh via sessionStorage

---

## 🗂️ Project Structure

```
three-tier-snake-game/
│
├── frontend/                           # React + Vite
│   ├── src/
│   │   ├── components/                 # GameBoard, Scoreboard
│   │   ├── context/AuthContext.jsx     # JWT auth state (sessionStorage)
│   │   ├── hooks/useGame.js            # All snake game logic
│   │   ├── pages/                      # Login, Register, GamePage, About
│   │   ├── App.jsx                     # Routes + protected routes
│   │   └── api.js                      # All HTTP calls
│   ├── nginx.conf                      # Gzip, caching, security headers
│   ├── .env.development
│   ├── .env.docker                     # For Docker Compose builds
│   ├── .env.production                 # For Kubernetes builds (/api, /auth)
│   └── Dockerfile                      # Multi-stage: Node build → Nginx
│
├── backend/                            # Node.js + Express
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js          # JWT verification
│   │   ├── models/Score.js             # score + username + userId
│   │   ├── routes/scores.js            # POST (auth) and GET
│   │   └── server.js                   # /health + /metrics (prom-client)
│   ├── .env.docker
│   ├── .trivyignore
│   └── Dockerfile
│
├── auth-service/                       # JWT Auth Microservice
│   ├── src/
│   │   ├── models/User.js              # username + bcrypt password
│   │   ├── routes/auth.js              # /register /login /verify /health
│   │   └── server.js                   # /metrics (prom-client)
│   ├── .env.docker
│   ├── .trivyignore
│   └── Dockerfile
│
├── helm-chart/                         # Helm chart
│   └── three-tier-snake-game/
│       ├── Chart.yaml
│       ├── values.yaml                 # ECR images, gp2 storage, tags
│       └── templates/
│           ├── frontend-dep.yml
│           ├── frontend-svc.yml
│           ├── backend-dep.yml
│           ├── backend-svc.yml
│           ├── backend-configmap.yml
│           ├── auth-dep.yml
│           ├── auth-svc.yml
│           ├── auth-configmap.yml
│           ├── mongodb-dep.yml         # StatefulSet
│           ├── mongo-svc.yml           # Headless
│           ├── mongo-secret.yml
│           └── ingress.yml
│
├── k8s-manifest/                       # Raw manifests + Kustomize
│   ├── kustomization.yaml              # Apply everything with one command
│   ├── namespace.yml
│   ├── ingress.yml
│   ├── frontend/
│   ├── backend/
│   ├── auth-service/
│   ├── database/
│   └── monitoring/
│       ├── backend-servicemonitor.yml
│       ├── auth-servicemonitor.yml
│       └── grafana-dashboard.yml       # Custom dashboard ConfigMap
│
├── infrastructure/                     # Terraform
│   ├── main.tf                         # Module calls
│   ├── variables.tf
│   ├── output.tf
│   ├── provider.tf                     # AWS + Helm + Kubernetes providers
│   ├── monitoring.tf                   # kube-prometheus-stack Helm release
│   ├── terraform.tfvars
│   └── modules/
│       ├── vpc/                        # VPC, subnets, IGW, routes
│       ├── eks/                        # EKS cluster, node group, IAM, OIDC
│       ├── ecr/                        # ECR repositories
│       └── monitoring/                 # kube-prometheus-stack
│
├── jenkins-pipeline/                   # Jenkinsfiles
│   ├── frontend/Jenkinsfile
│   ├── backend/Jenkinsfile
│   └── auth-service/Jenkinsfile
│
├── monitoring/                         # Local monitoring config
│   ├── prometheus/prometheus.yml       # Scrape configs
│   └── grafana/provisioning/          # Grafana datasource + dashboard
│
├── docker-compose.yml                  # Full local stack with monitoring
└── z-documentation/
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios, Nginx |
| Backend | Node.js, Express, Mongoose, JWT, prom-client |
| Auth Service | Node.js, Express, bcryptjs, JWT, prom-client |
| Database | MongoDB 7.0 |
| Monitoring | Prometheus, Grafana, mongodb-exporter, prom-client |
| CI/CD | Jenkins, SonarQube, Trivy |
| Image Registry | AWS ECR |
| Container | Docker |
| Orchestration | Kubernetes (EKS / Kind) |
| Package Manager | Helm |
| Infrastructure | Terraform |
| Ingress | Nginx Ingress Controller |
| Persistence | EBS gp2 PVC via StatefulSet (100Mi) |

---

## 📊 Observability

### Metrics exposed

Both backend and auth-service expose `/metrics` using `prom-client`:
- Default Node.js metrics (CPU, memory, event loop lag, heap)
- Custom HTTP metrics (request rate, error rate, latency histograms, active requests)
- Custom app metrics (scores saved, login attempts by status)

### Grafana dashboard panels

| Row | Panels |
|-----|--------|
| Overview | Request/sec, Error rate, Latency (p50/p75/p95/p99), Active requests, CPU, Memory |
| Backend | Request rate, Latency, Error rate |
| Auth Service | Request rate, Latency, Error rate |
| Database | MongoDB status, Current connections, Memory usage, Uptime |

### Local monitoring (Docker Compose)

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| Grafana | http://localhost:3000 (admin/admin) |
| Prometheus | http://localhost:9090 |
| MongoDB Exporter | http://localhost:9216/metrics |

### Kubernetes monitoring

Prometheus and Grafana are installed via Terraform using `kube-prometheus-stack`. ServiceMonitors scrape backend and auth-service automatically via label `monitoring: enabled`.

Apply custom dashboards and ServiceMonitors:
```bash
kubectl apply -k k8s-manifest/
```

---

## ☁️ Infrastructure — Terraform

### What it provisions

| Resource | Details |
|---------|---------|
| VPC | `10.1.0.0/16` across 3 AZs (ap-south-1a/b/c) |
| EKS Cluster | Managed Kubernetes |
| Node Group | `m7i-flex.large`, ON_DEMAND, min 1 / desired 1 / max 2, 30GB |
| IAM Roles | Cluster role + node group role |
| OIDC Provider | For IRSA (IAM Roles for Service Accounts) |
| EBS CSI Driver | For PVC support with gp2 storage |
| ECR Repositories | `frontend`, `backend`, `auth-service` |
| kube-prometheus-stack | Prometheus + Grafana + Alertmanager (Helm) |

### Usage

```bash
cd infrastructure
terraform init
terraform plan
terraform apply    # ~15 minutes
terraform destroy  # when done — saves AWS credits
```

### `terraform.tfvars`

```hcl
region          = "ap-south-1"
vpc_name        = "EKS-demo-vpc"
vpc_cidr        = "10.1.0.0/16"
cluster_name    = "eks_cluster"
node_group_name = "eks-node-group"
instance_type   = ["m7i-flex.large"]
capacity_type   = "ON_DEMAND"
desired_size    = 1
min_size        = 1
max_size        = 2
disk_size       = 30
repositories    = ["frontend", "backend", "auth-service"]
```

---

## 🚀 Running Locally

### Option 1 — Docker Compose (with monitoring)

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:5000 |
| Auth Service | http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

Requires `backend/.env.docker` and `auth-service/.env.docker`.

### Option 2 — Kind cluster (local Kubernetes)

```bash
# Create cluster
kind create cluster --config k8s-manifest/cluster.yml --name three-tier

# Install Nginx Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Start cloud-provider-kind for external IP (separate terminal)
sudo cloud-provider-kind

# Get external IP and update /etc/hosts
EXTERNAL_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$EXTERNAL_IP snake-game.com" | sudo tee -a /etc/hosts

# Apply all manifests with Kustomize
kubectl apply -k k8s-manifest/

# Access
http://snake-game.com
```

---

## ☸️ Kubernetes Deployment — EKS

### Prerequisites

- Terraform applied (`terraform apply`)
- AWS CLI configured
- kubectl and Helm installed

### Connect kubectl

```bash
aws eks update-kubeconfig --name eks_cluster --region ap-south-1
```

### Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.1/deploy/static/provider/aws/deploy.yaml
```

### Deploy with Helm

```bash
helm install snake-game ./helm-chart/three-tier-snake-game \
  --namespace three-tier-dev \
  --create-namespace
```

### Apply monitoring manifests

```bash
kubectl apply -k k8s-manifest/
```

### Get app URL

```bash
kubectl get ingress -n three-tier-dev
```

### Access Grafana

```bash
kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring
# http://localhost:3000 — admin / prom-operator
```

---

## 🎯 Helm Reference

```bash
# Install
helm install snake-game ./helm-chart/three-tier-snake-game

# Upgrade with new image
helm upgrade snake-game ./helm-chart/three-tier-snake-game \
  --set backend.tag=1.0.5

# Change storage class (Kind vs EKS)
--set mongodb.storageClassName=standard   # Kind
--set mongodb.storageClassName=gp2        # EKS

# Rollback
helm rollback snake-game 1

# Uninstall
helm uninstall snake-game
```

---

## 📡 API Reference

### Backend

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Liveness probe |
| GET | `/metrics` | No | Prometheus metrics |
| POST | `/api/scores` | JWT | Save score |
| GET | `/api/scores` | No | Top 10 scores |

### Auth Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Liveness probe |
| GET | `/metrics` | No | Prometheus metrics |
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login — returns JWT |
| GET | `/auth/verify` | JWT | Verify token |

---

## 🔐 JWT Auth Flow

```
Register/Login → Auth Service → MongoDB (users)
                             ← JWT token (7 day expiry)

Save Score → Backend validates JWT using shared JWT_SECRET
           → Extracts username from token payload
           → Saves score + username to MongoDB

Backend never calls Auth Service again after login.
JWT_SECRET must be identical in both services — stored in mongo-sec Secret.
```

---

## 🗄️ Database

- **Name:** `snakegame`
- **Storage:** EBS gp2 PVC (100Mi) via StatefulSet volumeClaimTemplates
- **Credentials:** Kubernetes Secret `mongo-sec`

| Collection | Fields |
|-----------|--------|
| `scores` | score, username, userId, createdAt |
| `users` | username, password (bcrypt 10 rounds), createdAt |

---

## 🔧 Kubernetes Resources

| Resource | Name | Details |
|----------|------|---------|
| Namespace | `three-tier-dev` | App resources |
| Namespace | `monitoring` | Prometheus + Grafana |
| Deployment | `frontend-deployment` | Nginx + React |
| Deployment | `backend-dep` | Node.js API |
| Deployment | `auth-dep` | Auth microservice |
| StatefulSet | `mongodb-deployment` | MongoDB |
| Service | `frontend-svc` | ClusterIP — port 80 |
| Service | `backend-svc` | ClusterIP — port 5000 |
| Service | `auth-svc` | ClusterIP — port 4000 |
| Service | `mongodb-svc` | Headless — port 27017 |
| ConfigMap | `backend-config` | MONGO_URI, PORT |
| ConfigMap | `auth-config` | MONGO_URI, PORT |
| Secret | `mongo-sec` | MongoDB credentials + JWT_SECRET |
| PVC | `mongodb-volume-claim` | Auto-created by StatefulSet |
| Ingress | `ingress` | / → frontend, /api → backend, /auth → auth |
| ServiceMonitor | `backend-monitor` | Prometheus scrape config |
| ServiceMonitor | `auth-monitor` | Prometheus scrape config |
| ConfigMap | `grafana-dashboard` | Custom dashboard JSON |

---

## 🛡️ Security

| Feature | Applied To |
|---------|-----------|
| SonarQube analysis + quality gate | All three pipelines |
| Trivy image scanning HIGH/CRITICAL | All three pipelines |
| `.trivyignore` with documented CVEs | Backend, Auth service |
| bcrypt password hashing (10 rounds) | Auth service |
| JWT token auth (7d expiry) | Auth + Backend |
| `seccompProfile: RuntimeDefault` | All pods |
| `allowPrivilegeEscalation: false` | All containers |
| `privileged: false` | All containers |
| Credentials via Kubernetes Secret | MongoDB + JWT |
| IAM role on Jenkins EC2 | No hardcoded AWS keys |
| ECR for image storage | No Docker Hub in production |

---

## 📊 Resource Limits

| Tier | Mem Request | Mem Limit | CPU Request | CPU Limit |
|------|------------|-----------|-------------|-----------|
| Frontend | 100Mi | 100Mi | 100m | 200m |
| Backend | 250Mi | 250Mi | 300m | 500m |
| Auth Service | 250Mi | 250Mi | 300m | 500m |
| MongoDB | 256Mi | 512Mi | 250m | 500m |

---

## 🔍 Health Checks

| Tier | Type | Path | Readiness | Liveness |
|------|------|------|-----------|---------|
| Frontend | HTTP GET | `/` port 80 | 10s | 15s |
| Backend | HTTP GET | `/health` port 5000 | 10s | 15s |
| Auth Service | HTTP GET | `/health` port 4000 | 10s | 15s |
| MongoDB | exec mongosh ping | — | 30s (5 retries) | 60s |

---

## 🛑 Useful Commands

```bash
# Check everything
kubectl get all -n three-tier-dev
kubectl get all -n monitoring

# Stream logs
kubectl logs -f deployment/backend-dep -n three-tier-dev
kubectl logs -f deployment/auth-dep -n three-tier-dev
kubectl logs -f statefulset/mongodb-deployment -n three-tier-dev

# Restart deployment
kubectl rollout restart deployment/backend-dep -n three-tier-dev

# Apply with Kustomize
kubectl apply -k k8s-manifest/

# Helm status
helm status snake-game
helm history snake-game

# Port forward Grafana
kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring

# Port forward Prometheus
kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring

# Delete app
helm uninstall snake-game
kubectl delete namespace three-tier-dev

# Destroy AWS infra (save credits)
cd infrastructure && terraform destroy
```

---

## 🔧 Common Modifications

| What | File | Edit |
|------|------|------|
| Image tags | `helm-chart/.../values.yaml` | `frontend.tag`, `backend.tag`, `auth.tag` |
| Storage class | `helm-chart/.../values.yaml` | `mongodb.storageClassName` |
| Game speed | `frontend/src/hooks/useGame.js` | `const SPEED = 150` |
| Grid size | `frontend/src/hooks/useGame.js` | `const COLS`, `const ROWS` |
| Points per food | `frontend/src/hooks/useGame.js` | `setScore((s) => s + 10)` |
| Top scores | `backend/src/routes/scores.js` | `.limit(10)` |
| JWT expiry | `auth-service/src/routes/auth.js` | `expiresIn: '7d'` |
| EKS node count | `infrastructure/terraform.tfvars` | `desired_size`, `max_size` |
| EKS instance type | `infrastructure/terraform.tfvars` | `instance_type` |

---

## 📄 License

MIT
