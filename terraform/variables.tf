variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "cst8922_demo"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "Canada Central"
}

variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "cst8922_demo"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the cluster"
  type        = string
  default     = "1.31.8"
}

variable "node_count" {
  description = "Number of nodes in the default node pool"
  type        = number
  default     = 1
}

variable "vm_size" {
  description = "Size of the VM for the node pool"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "dns_prefix" {
  description = "DNS name prefix for the AKS cluster"
  type        = string
  default     = "cst8922-lab-demo"
}

variable "max_pods" {
  description = "Maximum number of pods per node"
  type        = number
  default     = 110
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "Demo"
    Project     = "CST8922 Demo"
    Owner       = "AI-Augmented DevOps"
  }
} 