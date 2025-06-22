# cst8922-demo

## Before we start

> [!Note] 
> All the resources used in this demo are free or provide free tier.

Make sure you have the following resources ready:
- Node.js (version >= v20.18.3)
- Valid Azure subscription (AKS will be required in this demo)
- Github Account
- Github Copilot access
- VSCode + [Copilot Plugin](https://code.visualstudio.com/docs/copilot/setup)
- kubernetes (we are using v1.32.2)
- Azure CLI (use command `az account show` to make sure you are logged in)
- Terraform (Optional)

Here's a quick walk-through for our github repository, which we will merge them one by one during the demo.

### Branches
- `Main`:
    includes a basic node.js server, that serves simple static web page

- `anti_pattern_example`:
    includes a demo feature that has anti-pattern codes like `SELECT *`

- `deprecated_example`:
    add a few deprecated dependencies to `Main` branch's node.js app.

- `missing_probe_example`:
    Server code will be modified to create certain issues, such as exit at certain point, delayed start, etc.

- `performance_opt_example`:
    a new endpoint will be added, that contains an algorithm will create concurrent issue.


### File structure
At the end of demo, you will expect a file structure looks like below:

```
cst8922-demo/
├── .github/                               
│   └── workflows/                         # GitHub Actions
│       ├── ci-deploy.yml                  # Main CI/CD pipeline: build, push to AKS, deploy
│       └── pr-checks.yml                  # Pull Request checks: AI code review, vuln scans, policy enforcement
│
├── public/                            
│   └── index.html                     # The main HTML page for the web app
│── app.js                             # App entry
│
├── policies/                              # Directory for Policy-as-Code definitions (e.g., for OPA/Conftest)
│   └── rego/                              # Rego policies for Open Policy Agent (OPA)
│       ├── no_select_star.rego            # Policy to detect 'SELECT *' anti-pattern
│       ├── no_vulnerable_deps.rego        # (Optional, if using OPA for dep checks) Policy to flag specific vulnerable dependencies
│       └── k8s_resilience_security.rego   # Policies for K8s best practices: requiring probes, resource limits, non-root user, etc.
│   └── conftest.toml                      # (Optional) Conftest configuration if using it to test Rego policies
│
├── kubernetes/                            # Kubernetes manifest files for deployment
│   ├── deployment.yaml                    
│   └── service.yaml                       
│
├── Dockerfile                             
├── package.json                           
├── package-lock.json                      
└── README.md        
```

### Project set up: Create AKS Cluster

You can create AKS Cluster either via Azure portal, or the provided terraform config files. The basic configuration are listed below:

- Region: Canada Central
- Kubernetes version: 1.31.8
- Cluster preset configuration: Dev/Test
- Avaliable Zones: None
- AKS pricing tier: Free
- Automatic upgrade: None
- Node security channel type: None 
- Node pool:
    - 1 master node with:
        - Ubuntu Linux
        - Standard_D2s_v3
        - No Avaliable zones
        - Manual Scale with 1 node + 110 max pods per node

To create with terraform, do following:

- `cd terraform`
- `terraform init`
- `terraform plan`
- `terraform apply -auto-approve` - this might take a while, in my case, 
- At this step, you have to options:
    - go to azure portal > kuberenetes services > connect, and grab the command "Download cluster credentials"
    - Or, you can use the provided bash under terraform folder, make it executable by `chmod +x get-kubeconfig.sh`, and then run it by `./get-kubeconfig.sh`

    Either way will add the context to kubernets, then use command `kubectl config use-context <your_aks_context>` to switch to the context, you can verify by checking the namespaces using command `kubectl get ns`, it will show `default`, `kube-node-lease`, `kube-public` and `kube-system`.

Now, we are ready for part 1!

> [!Warning]
> Regardless you are going to finish this or not, always remember delete your azure resources created.

## Part 1: Create simple CI/CD pipeline and kubernetes deployment


