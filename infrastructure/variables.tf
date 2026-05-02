variable "region" {
  description = "The name of the region"
  type = string
}

variable "vpc_name" {
  description = "VPC name"
  type = string
}

variable "vpc_cidr" {
  description = "VPC CIDR vlues"
  type = string
}

variable "subnets" {
  description = "List of subnets"
  type = list(object({
    name = string
    cidr_block = string
    availability_zone = string
  }))
}

variable "cluster_name" {
  description = "the name of the Kubernetes cluster"
  type = string
}

variable "node_group_name" {
  description = "name for node group"
  type = string
}

variable "instance_type" {
  description = "instance type for worker nodes"
  type = list(string)
}

variable "capacity_type" {
  description = "ON_DEMAND or SPOT"
  type = string
}

variable "desired_size" {
  description = "desired size of worker nodes"
  type = number
}

variable "min_size" {
  description = "minimum size for the worker nodes"
  type = number
}

variable "max_size" {
  description = "maximum size for the worker nodes"
  type = number
}

variable "disk_size" {
  type = number
}

variable "repositories" {
  type = list(string)
}