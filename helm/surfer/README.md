# Surfer Helm Chart

This Helm chart deploys Surfer - a Kubernetes Management UI with Google SSO and Admin Approval.

## Prerequisites

- Kubernetes 1.21+
- Helm 3.0+
- Google OAuth2 credentials
- (Optional) cert-manager for TLS certificates

## Installation

### Quick Start

1. Add the Helm repository (if published):
```bash
helm repo add surfer https://mysticrenji.github.io/surfer
helm repo update
```

2. Install the chart:
```bash
helm install surfer surfer/surfer \
  --namespace surfer \
  --create-namespace \
  --set secrets.googleClientId="YOUR_CLIENT_ID" \
  --set secrets.googleClientSecret="YOUR_CLIENT_SECRET" \
  --set secrets.googleRedirectUrl="https://your-domain.com/api/v1/auth/google/callback" \
  --set secrets.jwtSecret="your-random-jwt-secret" \
  --set ingress.hosts[0].host="your-domain.com"
```

### Local Installation

If you have the chart source code:

```bash
cd helm
helm install surfer ./surfer \
  --namespace surfer \
  --create-namespace \
  --values ./surfer/values.yaml
```

### Install with custom values

Create a `custom-values.yaml` file:

```yaml
secrets:
  googleClientId: "YOUR_CLIENT_ID"
  googleClientSecret: "YOUR_CLIENT_SECRET"
  googleRedirectUrl: "https://surfer.example.com/api/v1/auth/google/callback"
  jwtSecret: "change-this-to-a-random-secret"
  dbPassword: "secure-database-password"

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

backend:
  replicaCount: 3

frontend:
  replicaCount: 3
```

Then install:

```bash
helm install surfer ./surfer -f custom-values.yaml --namespace surfer --create-namespace
```

## Configuration

The following table lists the configurable parameters of the Surfer chart and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Namespace to deploy resources | `surfer` |

### Backend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend replicas | `2` |
| `backend.image.repository` | Backend image repository | `ghcr.io/mysticrenji/surfer-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `backend.service.type` | Service type | `ClusterIP` |
| `backend.service.port` | Service port | `8080` |
| `backend.resources.limits.cpu` | CPU limit | `500m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |

### Frontend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.image.repository` | Frontend image repository | `ghcr.io/mysticrenji/surfer-frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `frontend.service.type` | Service type | `ClusterIP` |
| `frontend.service.port` | Service port | `80` |

### PostgreSQL Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Enable PostgreSQL deployment | `true` |
| `postgresql.image.repository` | PostgreSQL image repository | `postgres` |
| `postgresql.image.tag` | PostgreSQL image tag | `15-alpine` |
| `postgresql.persistence.enabled` | Enable persistence | `true` |
| `postgresql.persistence.size` | Storage size | `5Gi` |
| `postgresql.auth.database` | Database name | `surfer` |
| `postgresql.auth.username` | Database username | `surfer` |
| `postgresql.auth.password` | Database password | `surfer` |

### Secrets Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `secrets.googleClientId` | Google OAuth Client ID | `your-google-client-id` |
| `secrets.googleClientSecret` | Google OAuth Client Secret | `your-google-client-secret` |
| `secrets.googleRedirectUrl` | Google OAuth Redirect URL | `https://surfer.example.com/api/v1/auth/google/callback` |
| `secrets.jwtSecret` | JWT signing secret | `change-this-jwt-secret-in-production` |
| `secrets.dbPassword` | Database password | `surfer` |

### Ingress Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hosts[0].host` | Hostname | `surfer.example.com` |
| `ingress.tls[0].secretName` | TLS secret name | `surfer-tls` |

### RBAC Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `rbac.create` | Create RBAC resources | `true` |
| `serviceAccount.create` | Create service account | `true` |
| `serviceAccount.name` | Service account name | `surfer` |

## Upgrading

To upgrade an existing release:

```bash
helm upgrade surfer ./surfer --namespace surfer
```

## Uninstalling

To uninstall/delete the `surfer` deployment:

```bash
helm uninstall surfer --namespace surfer
```

This command removes all the Kubernetes components associated with the chart and deletes the release.

## Google OAuth Setup

Before using Surfer, you must set up Google OAuth2 credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret
7. Use these values in your Helm installation

See the [Google OAuth Setup Guide](../../docs/GOOGLE_OAUTH_SETUP.md) for detailed instructions.

## Persistence

The chart creates a PersistentVolumeClaim for PostgreSQL data. To use a specific storage class:

```yaml
postgresql:
  persistence:
    storageClass: "fast-ssd"
```

## Security Considerations

1. **Change default secrets** - Never use default passwords in production
2. **Enable TLS** - Use cert-manager to issue TLS certificates
3. **Network Policies** - Consider adding NetworkPolicy resources
4. **RBAC** - Review and adjust RBAC rules as needed
5. **Regular Updates** - Keep images up to date

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n surfer
```

### View logs
```bash
# Backend logs
kubectl logs -f deployment/surfer-backend -n surfer

# Frontend logs
kubectl logs -f deployment/surfer-frontend -n surfer

# PostgreSQL logs
kubectl logs -f deployment/surfer-postgres -n surfer
```

### Test database connection
```bash
kubectl exec -it deployment/surfer-backend -n surfer -- env | grep DB_
```

### Access the application locally
```bash
kubectl port-forward svc/surfer-frontend 3000:80 -n surfer
# Open http://localhost:3000
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/mysticrenji/surfer/issues
- Documentation: https://github.com/mysticrenji/surfer/tree/main/docs
