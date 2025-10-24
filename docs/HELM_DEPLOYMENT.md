# Helm Chart Deployment Guide

This guide explains how to deploy Surfer using the Helm chart for self-hosting in a Kubernetes cluster.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Installation Methods](#installation-methods)
- [Post-Installation](#post-installation)
- [Upgrading](#upgrading)
- [Uninstalling](#uninstalling)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Prerequisites

Before installing Surfer with Helm, ensure you have:

1. **Kubernetes Cluster** (v1.21+)
   - Local: Minikube, Kind, k3s, Docker Desktop
   - Cloud: EKS, GKE, AKS, or any managed Kubernetes service

2. **Helm 3.0+**
   ```bash
   # Install Helm
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

   # Verify installation
   helm version
   ```

3. **kubectl** configured to access your cluster
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```

4. **Google OAuth2 Credentials**
   - See [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
   - Client ID and Client Secret required

5. **(Optional) cert-manager** for TLS certificates
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

6. **(Optional) Ingress Controller** (nginx recommended)
   ```bash
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm install nginx-ingress ingress-nginx/ingress-nginx
   ```

## Quick Start

### Method 1: Install from Helm Repository (Recommended)

This is the **easiest and recommended method** for production deployments. No need to clone the repository!

```bash
# Add the Surfer Helm repository
helm repo add surfer https://mysticrenji.github.io/surfer/charts

# Update Helm repositories
helm repo update

# Search for available charts
helm search repo surfer

# Install Surfer with minimal configuration
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --set secrets.googleClientId="YOUR_GOOGLE_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_GOOGLE_CLIENT_SECRET" \
  --set ingress.hosts[0].host="surfer.yourdomain.com"
```

**Advantages:**
- ✅ No repository cloning required
- ✅ Automatic updates with `helm repo update`
- ✅ Easy version management
- ✅ Uses pre-built Docker images from GitHub Container Registry

### Method 2: Install from Helm Repository with Custom Values

For more control over the configuration:

```bash
# Add the Helm repository
helm repo add surfer https://mysticrenji.github.io/surfer/charts
helm repo update

# Download default values for customization
helm show values surfer/surfer > my-values.yaml

# Edit my-values.yaml with your configurations
nano my-values.yaml

# Install with custom values
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --values my-values.yaml
```

### Method 3: Install from Cloned Repository

If you want to customize the chart or use local development:

```bash
# Clone the repository
git clone https://github.com/mysticrenji/surfer.git
cd surfer

# Create custom values file
cat > my-values.yaml <<EOF
secrets:
  googleClientId: "YOUR_GOOGLE_CLIENT_ID"
  googleClientSecret: "YOUR_GOOGLE_CLIENT_SECRET"
  googleRedirectUrl: "https://surfer.yourdomain.com/api/v1/auth/google/callback"
  jwtSecret: "$(openssl rand -base64 32)"
  dbPassword: "$(openssl rand -base64 16)"

ingress:
  enabled: true
  hosts:
    - host: surfer.yourdomain.com
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend
  tls:
    - secretName: surfer-tls
      hosts:
        - surfer.yourdomain.com

backend:
  image:
    repository: ghcr.io/mysticrenji/surfer-backend
    tag: latest

frontend:
  image:
    repository: ghcr.io/mysticrenji/surfer-frontend
    tag: latest
EOF

# Install the chart
helm install surfer ./helm/surfer \
  --namespace surfer \
  --create-namespace \
  --values my-values.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=surfer -n surfer --timeout=300s

# Check the deployment
kubectl get all -n surfer
```

### Method 2: Development/Local Deployment

For local development with locally built images:

```bash
# Build Docker images locally
docker build -t surfer-backend:latest -f Dockerfile.backend .
docker build -t surfer-frontend:latest -f Dockerfile.frontend .

# If using Minikube, load images
minikube image load surfer-backend:latest
minikube image load surfer-frontend:latest

# Install with local images
helm install surfer ./helm/surfer \
  --namespace surfer \
  --create-namespace \
  --set backend.image.repository=surfer-backend \
  --set backend.image.tag=latest \
  --set backend.image.pullPolicy=Never \
  --set frontend.image.repository=surfer-frontend \
  --set frontend.image.tag=latest \
  --set frontend.image.pullPolicy=Never \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET"
```

## Configuration

### Essential Configuration

The following parameters **must** be configured before deployment:

#### Google OAuth Credentials

```yaml
secrets:
  googleClientId: "your-google-oauth-client-id"
  googleClientSecret: "your-google-oauth-client-secret"
  googleRedirectUrl: "https://your-domain.com/api/v1/auth/google/callback"
```

#### Security Secrets

```yaml
secrets:
  jwtSecret: "generate-a-random-32-character-secret"
  dbPassword: "secure-database-password"
```

Generate secure secrets:
```bash
# JWT Secret (32 bytes, base64 encoded)
openssl rand -base64 32

# Database Password (16 bytes, base64 encoded)
openssl rand -base64 16
```

#### Ingress/Domain Configuration

```yaml
ingress:
  enabled: true
  hosts:
    - host: surfer.example.com
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend
```

### Common Configuration Options

#### Scaling

```yaml
backend:
  replicaCount: 3  # Scale backend

frontend:
  replicaCount: 3  # Scale frontend
```

#### Resource Limits

```yaml
backend:
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi

frontend:
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 200m
      memory: 256Mi
```

#### Storage

```yaml
postgresql:
  persistence:
    enabled: true
    size: 10Gi
    storageClass: "fast-ssd"  # Use your storage class
```

#### TLS/HTTPS

```yaml
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  tls:
    - secretName: surfer-tls
      hosts:
        - surfer.example.com
```

## Installation Methods

### Method A: Installation with Values File

Create a comprehensive `values.yaml`:

```yaml
# values-production.yaml
global:
  namespace: surfer

secrets:
  googleClientId: "YOUR_CLIENT_ID"
  googleClientSecret: "YOUR_CLIENT_SECRET"
  googleRedirectUrl: "https://surfer.example.com/api/v1/auth/google/callback"
  jwtSecret: "your-secure-jwt-secret"
  dbPassword: "your-secure-db-password"

backend:
  replicaCount: 2
  image:
    repository: ghcr.io/mysticrenji/surfer-backend
    tag: "v1.0.0"
  resources:
    limits:
      cpu: 500m
      memory: 512Mi

frontend:
  replicaCount: 2
  image:
    repository: ghcr.io/mysticrenji/surfer-frontend
    tag: "v1.0.0"

postgresql:
  persistence:
    enabled: true
    size: 5Gi

ingress:
  enabled: true
  hosts:
    - host: surfer.example.com
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend
  tls:
    - secretName: surfer-tls
      hosts:
        - surfer.example.com
```

Install:
```bash
helm install surfer ./helm/surfer -f values-production.yaml --namespace surfer --create-namespace
```

### Method B: Installation with CLI Flags

```bash
helm install surfer ./helm/surfer \
  --namespace surfer \
  --create-namespace \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET" \
  --set secrets.googleRedirectUrl="https://surfer.example.com/api/v1/auth/google/callback" \
  --set secrets.jwtSecret="your-jwt-secret" \
  --set ingress.hosts[0].host="surfer.example.com" \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3
```

### Method C: Installation from Helm Repository (Future)

Once published:
```bash
helm repo add surfer https://mysticrenji.github.io/surfer
helm repo update
helm install surfer surfer/surfer -f my-values.yaml
```

## Post-Installation

### 1. Verify Deployment

```bash
# Check all resources
kubectl get all -n surfer

# Check pod status
kubectl get pods -n surfer

# Expected output:
# NAME                                 READY   STATUS    RESTARTS   AGE
# surfer-backend-xxx                   1/1     Running   0          2m
# surfer-frontend-xxx                  1/1     Running   0          2m
# surfer-postgres-xxx                  1/1     Running   0          2m
```

### 2. Access the Application

#### With Ingress

Access via your configured domain:
```
https://surfer.example.com
```

#### Without Ingress (Port Forwarding)

```bash
# Forward frontend
kubectl port-forward -n surfer svc/surfer-frontend 3000:80

# Access at http://localhost:3000
```

### 3. Initial Setup

1. **Access the application** via browser
2. **Click "Sign in with Google"**
3. **First user is auto-approved** as admin
4. **Add your first cluster:**
   - Navigate to Dashboard
   - Click "Add Cluster"
   - Provide cluster name, description, and kubeconfig
   - Test connection
   - Save

### 4. Configure Additional Users

As admin:
1. Go to Admin Panel
2. View pending users
3. Approve or reject user requests

## Upgrading

### Upgrade to New Version

```bash
# Update values if needed
helm upgrade surfer ./helm/surfer \
  --namespace surfer \
  --values my-values.yaml

# With specific version
helm upgrade surfer ./helm/surfer \
  --namespace surfer \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0
```

### Rollback

```bash
# List releases
helm history surfer -n surfer

# Rollback to previous version
helm rollback surfer -n surfer

# Rollback to specific revision
helm rollback surfer 2 -n surfer
```

## Uninstalling

### Remove the Release

```bash
# Uninstall Surfer
helm uninstall surfer --namespace surfer

# Delete namespace (optional)
kubectl delete namespace surfer
```

### Clean Up Persistent Data

```bash
# List PVCs
kubectl get pvc -n surfer

# Delete PVCs (this will delete all data!)
kubectl delete pvc -n surfer --all
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n surfer

# Describe pod for events
kubectl describe pod <pod-name> -n surfer

# Check logs
kubectl logs <pod-name> -n surfer
```

### Backend Connection Issues

```bash
# Check backend logs
kubectl logs -f deployment/surfer-backend -n surfer

# Check environment variables
kubectl exec -it deployment/surfer-backend -n surfer -- env | grep -E "DB_|GOOGLE_"

# Test database connection
kubectl exec -it deployment/surfer-postgres -n surfer -- psql -U surfer -d surfer -c "SELECT version();"
```

### Ingress Not Working

```bash
# Check ingress
kubectl get ingress -n surfer

# Describe ingress
kubectl describe ingress surfer -n surfer

# Check ingress controller logs
kubectl logs -f -n ingress-nginx deployment/nginx-ingress-controller
```

### Google OAuth Errors

Common issues:
1. **Redirect URI mismatch** - Ensure it matches exactly in Google Console
2. **Invalid credentials** - Verify Client ID and Secret
3. **Domain not authorized** - Add domain to authorized domains in Google Console

Debug:
```bash
# Check secrets
kubectl get secret surfer-secrets -n surfer -o yaml

# Decode secret value
kubectl get secret surfer-secrets -n surfer -o jsonpath='{.data.GOOGLE_CLIENT_ID}' | base64 -d
```

### Database Issues

```bash
# Check database pod
kubectl logs -f deployment/surfer-postgres -n surfer

# Connect to database
kubectl exec -it deployment/surfer-postgres -n surfer -- psql -U surfer -d surfer

# Inside psql:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
```

## Advanced Configuration

### High Availability Setup

```yaml
backend:
  replicaCount: 3
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/component
                  operator: In
                  values:
                    - backend
            topologyKey: kubernetes.io/hostname

frontend:
  replicaCount: 3
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/component
                  operator: In
                  values:
                    - frontend
            topologyKey: kubernetes.io/hostname
```

### External PostgreSQL

To use an external PostgreSQL database:

```yaml
postgresql:
  enabled: false  # Disable bundled PostgreSQL

secrets:
  dbHost: "external-postgres.example.com"
  dbPort: "5432"
  dbUser: "surfer"
  dbPassword: "secure-password"
  dbName: "surfer"
  dbSslMode: "require"
```

### Custom RBAC Rules

Modify RBAC rules to limit permissions:

```yaml
rbac:
  create: true
  rules:
    - apiGroups: [""]
      resources: ["namespaces", "pods"]
      verbs: ["get", "list", "watch"]
    - apiGroups: ["apps"]
      resources: ["deployments"]
      verbs: ["get", "list", "watch"]
```

### Network Policies

Add network policies for enhanced security:

```yaml
# Create network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: surfer-network-policy
  namespace: surfer
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: surfer
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
        - protocol: TCP
          port: 80
  egress:
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: database
      ports:
        - protocol: TCP
          port: 5432
```

Apply:
```bash
kubectl apply -f network-policy.yaml
```

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Application UI Guide](./APPLICATION_UI_GUIDE.md)
- [GitHub Repository](https://github.com/mysticrenji/surfer)

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/mysticrenji/surfer/issues
- **Documentation**: https://github.com/mysticrenji/surfer/tree/main/docs
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
