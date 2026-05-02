output "cluster_name" {
  value = modules.eks.cluster_name
}

output "cluster_endpoint" {
  value = modules.eks.cluster_endpoints
}

output "ecr_urls" {
  value = modules.ecr.repository_urls
}