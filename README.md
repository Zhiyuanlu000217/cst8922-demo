# Step 1: Part 1: Create simple CI/CD pipeline and kubernetes deployment

In this step, we have a basic server to serve the static html file. We will ask copilot to automatically create essesntial files and pipelines to help us deploy this app on AKS.

We will follow the instructions below, using the prompts, first we will examine the deployment, and finally we will make small commits to test the pipelines.

> [!Note]
> The created Dockerfile, kubernetes configs and pipeline doesnt exist, if you wish to see the result, please check my [working repo](https://github.com/Zhiyuanlu000217/cst8922-demo/tree/main-cp)

## Create `Dockerfile`
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

## Create CICD pipeline

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

## Create k8s config files

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

Now we have all those files, we can try to make change to the text in our static web app