output "repository_urls" {
  value = {
    for repo in aws_aws_ecr_repository.repos :
    repo.name => repository_url
  }
}