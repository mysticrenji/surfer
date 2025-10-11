# Helm Repository Guide

This guide explains how to use the Surfer Helm repository to install and manage Surfer without cloning the repository.

## Overview

Surfer provides an official Helm chart repository hosted on GitHub Pages. This allows you to install and manage Surfer directly from the repository URL without needing to clone the source code.

**Repository URL:** `https://mysticrenji.github.io/surfer/charts`

## Benefits

Using the Helm repository provides several advantages:

- ✅ **No Cloning Required** - Install directly from the URL
- ✅ **Automatic Updates** - Use `helm repo update` to get the latest charts
- ✅ **Version Management** - Easily install specific versions
- ✅ **Pre-built Images** - Uses Docker images from GitHub Container Registry
- ✅ **Production Ready** - Charts are tested and validated before publishing
- ✅ **Simple Workflow** - Standard Helm repository operations

## Quick Start

### 1. Add the Repository

```bash
helm repo add surfer https://mysticrenji.github.io/surfer/charts
```

### 2. Update Repository Cache

```bash
helm repo update
```

### 3. Install Surfer

```bash
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET" \
  --set ingress.hosts[0].host="surfer.yourdomain.com"
```

## Repository Operations

### Search for Charts

```bash
# Search for all Surfer charts
helm search repo surfer

# Search for specific versions
helm search repo surfer --versions

# Get detailed information
helm search repo surfer --versions --output yaml
```

Example output:
```
NAME           CHART VERSION  APP VERSION  DESCRIPTION
surfer/surfer  1.0.0         1.0.0        A Kubernetes Management UI with Google SSO...
```

### Show Chart Information

```bash
# Show chart metadata
helm show chart surfer/surfer

# Show all configurable values
helm show values surfer/surfer

# Show the chart README
helm show readme surfer/surfer

# Show all information
helm show all surfer/surfer
```

### List Installed Releases

```bash
# List all releases in all namespaces
helm list --all-namespaces

# List releases in the surfer namespace
helm list --namespace surfer
```

## Installation Methods

### Method 1: Simple Installation

For quick testing with minimal configuration:

```bash
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET"
```

### Method 2: Installation with Custom Values

For production deployments:

```bash
# Download default values
helm show values surfer/surfer > my-values.yaml

# Edit my-values.yaml with your configuration
nano my-values.yaml

# Install with custom values
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --values my-values.yaml
```

### Method 3: Installation with Specific Version

Install a specific chart version:

```bash
# List available versions
helm search repo surfer --versions

# Install specific version
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --version 1.0.0 \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET"
```

### Method 4: Dry Run Installation

Test the installation without actually deploying:

```bash
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --dry-run \
  --debug \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET"
```

## Upgrading

### Update Repository and Upgrade

```bash
# Update the Helm repository to get the latest charts
helm repo update

# Upgrade to the latest version
helm upgrade surfer surfer/surfer --namespace surfer

# Upgrade with custom values
helm upgrade surfer surfer/surfer \
  --namespace surfer \
  --values my-values.yaml
```

### Upgrade to Specific Version

```bash
helm upgrade surfer surfer/surfer \
  --namespace surfer \
  --version 1.1.0
```

### Upgrade with Rollback on Failure

```bash
helm upgrade surfer surfer/surfer \
  --namespace surfer \
  --atomic \
  --timeout 10m
```

## Rolling Back

If an upgrade causes issues, you can roll back:

```bash
# View release history
helm history surfer --namespace surfer

# Roll back to previous version
helm rollback surfer --namespace surfer

# Roll back to specific revision
helm rollback surfer 2 --namespace surfer
```

## Uninstalling

```bash
# Uninstall the release
helm uninstall surfer --namespace surfer

# Uninstall and delete the namespace
helm uninstall surfer --namespace surfer
kubectl delete namespace surfer
```

## Repository Management

### List Repositories

```bash
helm repo list
```

### Update All Repositories

```bash
helm repo update
```

### Remove Repository

```bash
helm repo remove surfer
```

### Re-add Repository

```bash
helm repo add surfer https://mysticrenji.github.io/surfer/charts
helm repo update
```

## Troubleshooting

### Repository Not Found

If you get a "repository not found" error:

```bash
# Remove and re-add the repository
helm repo remove surfer
helm repo add surfer https://mysticrenji.github.io/surfer/charts
helm repo update
```

### Chart Version Not Available

If a specific version is not available:

```bash
# List all available versions
helm search repo surfer --versions

# Update repository cache
helm repo update

# Try again
helm search repo surfer --versions
```

### Installation Failures

```bash
# Check Helm release status
helm status surfer --namespace surfer

# View detailed information
helm get all surfer --namespace surfer

# Check pod status
kubectl get pods -n surfer

# View logs
kubectl logs -l app=surfer-backend -n surfer
```

### Cannot Pull Images

If pods cannot pull Docker images:

```bash
# Check if images are accessible
docker pull ghcr.io/mysticrenji/surfer-backend:latest
docker pull ghcr.io/mysticrenji/surfer-frontend:latest

# If private, create image pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  --namespace surfer

# Update values to use the secret
helm upgrade surfer surfer/surfer \
  --namespace surfer \
  --set imagePullSecrets[0].name=ghcr-secret
```

## Advanced Usage

### Template Rendering

View the Kubernetes manifests that will be created:

```bash
helm template surfer surfer/surfer \
  --namespace surfer \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET" \
  > rendered-manifests.yaml
```

### Dependency Management

```bash
# Update chart dependencies
helm dependency update surfer/surfer

# List dependencies
helm dependency list surfer/surfer
```

### Chart Validation

```bash
# Validate chart syntax
helm lint surfer/surfer

# Validate with custom values
helm lint surfer/surfer --values my-values.yaml
```

## Continuous Deployment

### Using Helm in CI/CD

Example GitHub Actions workflow:

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Set up Helm
        uses: azure/setup-helm@v3
        with:
          version: latest

      - name: Add Helm repository
        run: |
          helm repo add surfer https://mysticrenji.github.io/surfer/charts
          helm repo update

      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install surfer surfer/surfer \
            --namespace surfer \
            --create-namespace \
            --set secrets.googleClientId="${{ secrets.GOOGLE_CLIENT_ID }}" \
            --set secrets.googleClientSecret="${{ secrets.GOOGLE_CLIENT_SECRET }}" \
            --set ingress.hosts[0].host="surfer.example.com" \
            --atomic \
            --timeout 10m
```

### Using ArgoCD

Example ArgoCD Application manifest:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: surfer
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://mysticrenji.github.io/surfer/charts
    chart: surfer
    targetRevision: 1.0.0
    helm:
      values: |
        secrets:
          googleClientId: "YOUR_CLIENT_ID"
          googleClientSecret: "YOUR_CLIENT_SECRET"
        ingress:
          enabled: true
          hosts:
            - host: surfer.example.com
  destination:
    server: https://kubernetes.default.svc
    namespace: surfer
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Using Flux CD

Example HelmRelease manifest:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: surfer
  namespace: surfer
spec:
  interval: 5m
  chart:
    spec:
      chart: surfer
      version: '1.0.0'
      sourceRef:
        kind: HelmRepository
        name: surfer
        namespace: flux-system
  values:
    secrets:
      googleClientId: "YOUR_CLIENT_ID"
      googleClientSecret: "YOUR_CLIENT_SECRET"
    ingress:
      enabled: true
      hosts:
        - host: surfer.example.com
```

## Best Practices

1. **Always specify versions in production**
   ```bash
   helm install surfer surfer/surfer --version 1.0.0
   ```

2. **Use custom values files for configuration**
   ```bash
   helm install surfer surfer/surfer --values production-values.yaml
   ```

3. **Test upgrades with dry-run first**
   ```bash
   helm upgrade surfer surfer/surfer --dry-run --debug
   ```

4. **Enable atomic upgrades for safety**
   ```bash
   helm upgrade surfer surfer/surfer --atomic --timeout 10m
   ```

5. **Keep repository cache updated**
   ```bash
   helm repo update
   ```

6. **Use namespaces for isolation**
   ```bash
   helm install surfer surfer/surfer --namespace production --create-namespace
   ```

7. **Back up your values files**
   ```bash
   helm get values surfer --namespace surfer > backup-values.yaml
   ```

## Support

For issues and questions:

- **Documentation**: [GitHub Repository](https://github.com/mysticrenji/surfer)
- **Helm Guide**: [Helm Deployment Guide](./HELM_DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/mysticrenji/surfer/issues)
- **Repository**: [Helm Charts](https://mysticrenji.github.io/surfer/charts)

## Repository Publishing

The Helm repository is automatically published via GitHub Actions when a new version tag is created:

1. Tag a new release: `git tag -a v1.0.0 -m "Release v1.0.0"`
2. Push the tag: `git push origin v1.0.0`
3. GitHub Actions automatically:
   - Packages the Helm chart
   - Creates a GitHub release
   - Publishes to the Helm repository at `gh-pages` branch
   - Updates the repository index

The chart becomes available within minutes at:
`https://mysticrenji.github.io/surfer/charts`
