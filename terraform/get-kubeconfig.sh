#!/bin/bash

# Get AKS credentials using Terraform outputs
echo "Getting AKS credentials for cluster: $(terraform output -raw aks_cluster_name)"
az aks get-credentials \
  --resource-group $(terraform output -raw resource_group_name) \
  --name $(terraform output -raw aks_cluster_name) \
  --overwrite-existing

echo "Kubectl context configured successfully!"
echo "Current context: $(kubectl config current-context)" 