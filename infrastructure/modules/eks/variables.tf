variable "cluster_name" {
  description = "Name of the EKS cluster"
  type = string
}

variable "subnet_ids" {
  description = "List of all subnet ids where nodes will be deployed"
  type = list(string)
}

variable "node_group_name" {
  description = "EKS node group name"
  type = string
}

variable "instance_types" {
  description = "List of EC2 instance type for worker nodes"
  type = list(string)
}

variable "capacity_type" {
  description = "type of capacity for nodes (ON_DEMAND or SPOT)"
  type = string
  default = "ON_DEMAND"
}

variable "desired_size" {
  description = "Desired number of worker nodes"
  type = number
}

variable "min_size" {
  description = "Minimum number of worker nodes"
  type = number
}
variable "max_size" {
  description = "maximum number of worker nodes"
  type = number
}

variable "disk_size" {
  description = "Disk size for worker nodes in GiB"
  type = number
  default = 20
}