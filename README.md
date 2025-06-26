# cst8922-demo

## Before we start

> [!Note] 
> All the resources used in this demo are free or provide free tier.

Make sure you have the following resources ready:
- Node.js (version >= v20.18.3)
- Valid Azure subscription ([AKS](https://learn.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-portal?tabs=azure-cli) will be required in this demo)
- Github Account
- Github Copilot access
- Docker + Docker Hub account
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

### Create `Dockerfile`
First, we want github copilot to create a `Dockerfile` for us.

prompt:
```
Path: ./Dockerfile

Generate a multi-stage Dockerfile for a Node.js Express application.

Use a minimal base image, like `node:18-alpine`.

The application's main files (app.js, package.json, package-lock.json) and the 'public' directory are located directly in the root of the repository.

Ensure the build process correctly copies 'package.json' and 'package-lock.json' first to leverage Docker layer caching for dependencies.
Then, copy the rest of the application code including the 'public' directory.

Set the working directory inside the container appropriately so 'npm start' can find 'package.json'.

The app listens on port 3000.
The application starts with `npm start`.

Ensure the final image is compatible with `linux/amd64` architecture, as it will be deployed to AKS, preventing "exec format error".

After creation, execute command to build the image, create a container that runs the nodeapp with reasonable name.
```

Once we verified it's working, we can push this image to Dockerhub.
First, tag the image:
```
docker tag nodeapp:latest <docker_hub_name>/cst8922-demo:latest
```

Then, push the image to the hub:
```
docker push <docker_hub_name>/cst8922-demo:latest
```

You can verify if your image is pushed to dockerhub by using command 
```
docker search <docker_hub_name>/cst8922-demo
```

### Create CICD pipeline

Second, we want github copilot to help use create CICD pipeline. Before we start, make sure you configure these followings at Github repository > Settings > Security(tab) > Secrets and variables:

- Secrets:
    - `DOCKER_USERNAME`
    - `DOCKER_PASSWORD`:
    we will create a personal token from 
    [Docker Account Center](https://app.docker.com/settings/account-information),
    Go to Personal Access tokens > Generate new token to obtain one`
    - `KUBE_CONFIG_DATA`:
    we will use the command `kubectl config view --minify --flatten --context=<context_name> | base64` to get it

prmopt:
```
Path: ./.github/workflows/ci-deploy.yml

GitHub Actions workflow for Continuous Integration and Deployment of a Node.js app.

This workflow should:
1. Trigger on pushes to the `main` branch.
2. Define two jobs: `build-and-push-image` and `deploy-to-aks`.

The `build-and-push-image` job should:
- Run on `ubuntu-latest`.
- Checkout the code.
- Set up Node.js 18.x.
- Install application dependencies from `package.json`.
- Define an environment variable `DOCKER_IMAGE_REPO` at the workflow level. This variable should automatically combine the `secrets.DOCKER_USERNAME` with the current GitHub repository's name (`github.event.repository.name`). For example, if your Docker Hub username is `myuser` and your GitHub repository is `my-awesome-app`, the `DOCKER_IMAGE_REPO` should resolve to `myuser/my-awesome-app`.
- Log in to Docker Hub using GitHub Secrets for `DOCKER_USERNAME` and `DOCKER_PASSWORD`.
- Build a Docker image using the Dockerfile in the root directory. **Ensure the build command specifies `--platform linux/amd64` for AKS compatibility.** Use the dynamically generated `DOCKER_IMAGE_REPO` variable for the image name, tagged with the GitHub run number and 'latest'.
- Push the Docker image to Docker Hub, again using the `DOCKER_IMAGE_REPO` variable and both tags.
- Export the `github.run_number` as an environment variable `IMAGE_TAG`. **This `IMAGE_TAG` must be defined as an output of the `build-and-push-image` job** so it can be accessed by the `deploy-to-aks` job.

The `deploy-to-aks` job should:
- Depend on `build-and-push-image`.
- Run on `ubuntu-latest`.
- Checkout the code.
- Set up `kubectl` using `azure/setup-kubectl@v4`.
- Set up the Kubeconfig: **Create the `$HOME/.kube` directory if it doesn't exist (`mkdir -p $HOME/.kube`),** then decode the `KUBE_CONFIG_DATA` secret into `$HOME/.kube/config`, and **set file permissions to `chmod 600 $HOME/.kube/config`**.
- Update the image tag in the Kubernetes deployment manifest located at `kubernetes/deployment.yaml`. It should use the `DOCKER_IMAGE_REPO` variable and the `IMAGE_TAG` exported as an output from the previous job. Ensure the `sed` command correctly substitutes the full image name, addressing any potential issues with comments on the image line.
- Apply the Kubernetes manifests. **Only `kubernetes/deployment.yaml` needs to be applied, as it contains both the Deployment and Service resources (separated by `---`).**
```

### Create k8s config files

prompt
```
Path: ./kubernetes/deployment.yaml

Generate Kubernetes YAML manifests for a Node.js web application.

This should include:
1. A Kubernetes Deployment for the application.
   - The image for the container should be generic enough to be replaced by the CI/CD pipeline, representing `your-dockerhub-username/your-docker-image-name:latest`. (Copilot should generate a placeholder like `zeelu1/cst8922-demo:latest` or similar, which your pipeline's `sed` command will replace).
   - The container should listen on port 3000.
   - Ensure the deployment has 1 replica.
   - Include placeholder comments for future addition of liveness and readiness probes.
   - Include placeholder comments for future addition of resource requests and limits (CPU and Memory).

2. A Kubernetes Service of type LoadBalancer to expose the application externally.
   - It should target the pods created by the Deployment on port 3000.
   - The service should also expose port 80 externally, mapping to container port 3000.
```

Now we have all those files, we can try to make change to the text in our static web app!

Once the change is commmited, wait for a couple minutes, the change will applied.

## Part 4: Copilot fixes missing probe

prompt
```
Our server deployment is currently exhibiting critical performance issues, specifically experiencing inconsistent and unpredictable periods of complete unresponsiveness (appearing offline) leading to frequent container restarts, alongside significant and intermittent delays in processing requests, often resulting in timeouts. This degraded availability and high latency are severely impacting user experience and causing our health probes to consistently fail, indicating underlying inefficiencies or resource bottlenecks in the current deployment configuration.
```
prompt_2
```
I noticed you add liveness probe, please modify my server code to align with the probes, and do not change any existing logic.
```

