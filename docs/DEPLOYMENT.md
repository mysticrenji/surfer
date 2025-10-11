# Deployment Guide

This guide covers different deployment strategies for Surfer.

## Table of Contents

- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Considerations](#production-considerations)

## Docker Compose Deployment

Docker Compose is the easiest way to deploy Surfer for small teams or testing.

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mysticrenji/surfer.git
   cd surfer
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services**
   ```bash
   docker-compose up -d
   ```

4. **Check status**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080

### Updating

```bash
# Pull latest changes
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

## Kubernetes Deployment

Kubernetes deployment is recommended for production environments.

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Ingress controller installed
- cert-manager (optional, for TLS)

### Steps

#### 1. Configure Secrets

Edit `k8s/deployment.yaml` and update the `surfer-secrets` Secret with your actual values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: surfer-secrets
  namespace: surfer
type: Opaque
stringData:
  GOOGLE_CLIENT_ID: "your-actual-client-id"
  GOOGLE_CLIENT_SECRET: "your-actual-client-secret"
  GOOGLE_REDIRECT_URL: "https://surfer.yourdomain.com/api/v1/auth/google/callback"
  JWT_SECRET: "generate-a-secure-random-string-here"
  DB_PASSWORD: "generate-a-secure-password-here"
```

**Security Note**: For production, use external secret management like:
- [External Secrets Operator](https://external-secrets.io/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- Cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)

#### 2. Update Ingress Configuration

Edit `k8s/deployment.yaml` and update the Ingress host:

```yaml
spec:
  rules:
    - host: surfer.yourdomain.com  # Change this
```

#### 3. Build Docker Images

```bash
# Build backend
docker build -f Dockerfile.backend -t surfer-backend:v1.0.0 .

# Build frontend
docker build -f Dockerfile.frontend -t surfer-frontend:v1.0.0 .

# Tag for your registry
docker tag surfer-backend:v1.0.0 your-registry/surfer-backend:v1.0.0
docker tag surfer-frontend:v1.0.0 your-registry/surfer-frontend:v1.0.0

# Push to registry
docker push your-registry/surfer-backend:v1.0.0
docker push your-registry/surfer-frontend:v1.0.0
```

Update image references in `k8s/deployment.yaml`:

```yaml
spec:
  containers:
    - name: backend
      image: your-registry/surfer-backend:v1.0.0
```

#### 4. Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get all -n surfer

# Check pods
kubectl get pods -n surfer

# View logs
kubectl logs -n surfer -l app=surfer-backend
kubectl logs -n surfer -l app=surfer-frontend
```

#### 5. Configure DNS

Point your domain to the Ingress controller's external IP:

```bash
# Get ingress IP
kubectl get ingress -n surfer

# Create DNS A record
# surfer.yourdomain.com -> <INGRESS_IP>
```

#### 6. Setup TLS (Optional but Recommended)

If using cert-manager:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: surfer-ingress
  namespace: surfer
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - surfer.yourdomain.com
      secretName: surfer-tls
  rules:
    - host: surfer.yourdomain.com
      # ... rest of ingress config
```

### Monitoring

#### View Application Logs

```bash
# Backend logs
kubectl logs -n surfer -l app=surfer-backend -f

# Frontend logs
kubectl logs -n surfer -l app=surfer-frontend -f

# Database logs
kubectl logs -n surfer -l app=postgres -f
```

#### Check Resource Usage

```bash
# Pod resources
kubectl top pods -n surfer

# Node resources
kubectl top nodes
```

### Scaling

```bash
# Scale backend
kubectl scale deployment surfer-backend -n surfer --replicas=3

# Scale frontend
kubectl scale deployment surfer-frontend -n surfer --replicas=3
```

### Updating

```bash
# Build new images with new version tag
docker build -f Dockerfile.backend -t your-registry/surfer-backend:v1.0.1 .
docker push your-registry/surfer-backend:v1.0.1

# Update deployment
kubectl set image deployment/surfer-backend -n surfer backend=your-registry/surfer-backend:v1.0.1

# Check rollout status
kubectl rollout status deployment/surfer-backend -n surfer

# Rollback if needed
kubectl rollout undo deployment/surfer-backend -n surfer
```

## Production Considerations

### High Availability

1. **Database**
   - Use managed PostgreSQL (AWS RDS, GCP Cloud SQL, Azure Database)
   - Or setup PostgreSQL with replication
   - Regular backups

2. **Application**
   - Run multiple replicas (3+ recommended)
   - Use pod anti-affinity to distribute across nodes
   - Configure health checks

3. **Load Balancing**
   - Use cloud load balancers
   - Configure session affinity if needed

### Security

1. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: surfer-backend-policy
     namespace: surfer
   spec:
     podSelector:
       matchLabels:
         app: surfer-backend
     policyTypes:
       - Ingress
       - Egress
     ingress:
       - from:
           - podSelector:
               matchLabels:
                 app: surfer-frontend
         ports:
           - protocol: TCP
             port: 8080
   ```

2. **Pod Security Policies**
   - Use restricted security contexts
   - Run as non-root user
   - Read-only root filesystem

3. **RBAC**
   - Principle of least privilege
   - Separate service accounts
   - Regular access reviews

### Monitoring and Alerting

1. **Prometheus + Grafana**
   - Monitor application metrics
   - Track resource usage
   - Create dashboards

2. **Logging**
   - Use ELK stack or similar
   - Centralized log aggregation
   - Log retention policies

3. **Alerting**
   - Set up alerts for critical issues
   - Monitor error rates
   - Track response times

### Backup and Recovery

1. **Database Backups**
   ```bash
   # Automated backups
   kubectl create cronjob postgres-backup \
     --image=postgres:15-alpine \
     --schedule="0 2 * * *" \
     -- /bin/sh -c "pg_dump -h postgres -U surfer surfer > /backup/surfer-$(date +%Y%m%d).sql"
   ```

2. **Disaster Recovery Plan**
   - Document recovery procedures
   - Test recovery regularly
   - Keep backups in multiple locations

### Performance Optimization

1. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

2. **Database Optimization**
   - Add indexes for common queries
   - Connection pooling
   - Query optimization

3. **Resource Limits**
   ```yaml
   resources:
     requests:
       memory: "256Mi"
       cpu: "100m"
     limits:
       memory: "512Mi"
       cpu: "500m"
   ```

### Cost Optimization

1. **Right-sizing**
   - Monitor actual resource usage
   - Adjust resource requests/limits
   - Use node auto-scaling

2. **Storage**
   - Use appropriate storage classes
   - Implement data lifecycle policies
   - Clean up old logs and backups

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod -n surfer <pod-name>

# Check events
kubectl get events -n surfer --sort-by='.lastTimestamp'

# Check logs
kubectl logs -n surfer <pod-name>
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -- psql -h postgres.surfer.svc.cluster.local -U surfer

# Check database pod
kubectl logs -n surfer -l app=postgres
```

### Ingress Not Working

```bash
# Check ingress
kubectl describe ingress -n surfer surfer-ingress

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### SSL/TLS Issues

```bash
# Check certificate
kubectl describe certificate -n surfer surfer-tls

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

## Migration Guide

### From Docker Compose to Kubernetes

1. Export database
2. Build and push Docker images
3. Deploy to Kubernetes
4. Import database
5. Update DNS
6. Test application
7. Switch traffic

### Database Migration

```bash
# Export from old system
pg_dump -h old-host -U surfer surfer > surfer-backup.sql

# Import to new system
kubectl exec -it postgres-pod -n surfer -- psql -U surfer surfer < surfer-backup.sql
```
