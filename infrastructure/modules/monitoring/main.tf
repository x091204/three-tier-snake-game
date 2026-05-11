resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_namespace_v1" "three-tier-dev" {
  metadata {
    name = "three-tier-dev"
  }
}

terraform {
  required_providers {
    kubernetes = {
        source = "hashicorp/kubernetes"
    }
    helm = {
        source = "hashicorp/helm"
    }
  }
}

resource "helm_release" "monitoring" {
  name = "kube-prometheus-stack"
  namespace = kubernetes_namespace_v1.monitoring.metadata[0].name

  repository = "https://prometheus-community.github.io/helm-charts"
  chart = "kube-prometheus-stack"
  version = "56.21.0"

  timeout = 600
  create_namespace = false

  values = [
    yamlencode({
        grafana = {
            image = {
                tag = "13.0.1"
            }
            
            adminUser     = "admin"
            adminPassword = "admin"

            service = {
                type = "ClusterIP"
            }
        }

        prometheus = {
            service = {
                type = "ClusterIP"
            }
        }

        alertmanager = {
            service = {
                type = "ClusterIP"
            }
        }
    })
  ]
  depends_on = [
    kubernetes_namespace_v1.monitoring
  ]
}

resource "helm_release" "mongodb_exporter" {
  name       = "mongodb-exporter"
  namespace  = "three-tier-dev"

  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "prometheus-mongodb-exporter"
  version    = "4.22.0"

  values = [
    yamlencode({
      mongodb = {
        uri = "mongodb://username01:password01@mongodb-svc.three-tier-dev.svc.cluster.local:27017"
      }

      serviceMonitor = {
        enabled = true
        interval = "30s"
        scrapeTimeout = "10s"

        additionalLabels = {
          release = "monitoring"
        }
      }
    })
  ]
  depends_on = [
    kubernetes_namespace_v1.three-tier-dev
  ]
}