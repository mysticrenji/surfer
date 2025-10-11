# Surfer Architecture

This document describes the architecture of Surfer, a Kubernetes management UI.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                      (React Frontend)                        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      Ingress Controller                       │
│                     (nginx-ingress)                          │
└─────────┬───────────────────────────────────────────────────┘
          │
          ├──────────────┬──────────────────────────────────┐
          │              │                                   │
┌─────────▼──────┐  ┌───▼──────────────┐  ┌────────────────▼──┐
│   Frontend     │  │  Backend API     │  │   PostgreSQL      │
│   (React/      │  │  (Go/Gin)        │  │   Database        │
│    Nginx)      │  │                  │  │                   │
│                │  │  - Auth          │  │  - Users          │
│  - UI Views    │  │  - Handlers      │  │  - Clusters       │
│  - Routing     │  │  - Middleware    │  │  - Sessions       │
│  - State Mgmt  │  │  - K8s Client    │  │  - Audit Logs     │
└────────────────┘  └──────────────────┘  └───────────────────┘
                           │
                           │ Kubernetes API
                           │
         ┌─────────────────┴─────────────────┐
         │                                    │
┌────────▼──────────┐            ┌───────────▼────────┐
│  Cluster 1        │            │  Cluster 2...N     │
│  (K8s API)        │            │  (K8s API)         │
│                   │            │                    │
│  - Namespaces     │            │  - Namespaces      │
│  - Pods           │            │  - Pods            │
│  - Deployments    │            │  - Deployments     │
│  - Services       │            │  - Services        │
└───────────────────┘            └────────────────────┘
```

## Component Details

### Frontend (React + TypeScript)

**Technology Stack:**
- React 18 with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls
- React Context for state management

**Key Components:**
- `AuthContext`: Manages authentication state
- `ProtectedRoute`: Route guard for authenticated pages
- `Navbar`: Navigation bar with user menu
- Pages: Login, Dashboard, Admin, Cluster Details

**Responsibilities:**
- User interface and interaction
- Client-side routing
- State management
- API communication
- Form validation

### Backend (Go + Gin)

**Technology Stack:**
- Go 1.21+
- Gin web framework
- GORM for database ORM
- JWT for authentication
- OAuth2 for Google SSO
- client-go for Kubernetes

**Modules:**

1. **Auth Module** (`internal/auth`)
   - Google OAuth2 integration
   - JWT token generation/validation
   - Session management

2. **Handlers** (`internal/handlers`)
   - User management
   - Cluster operations
   - Kubernetes resource queries

3. **Middleware** (`internal/middleware`)
   - Authentication verification
   - Admin role checking
   - CORS handling

4. **K8s Client** (`internal/k8s`)
   - Kubernetes API interaction
   - Multi-cluster support
   - Resource queries

5. **Models** (`internal/models`)
   - User model
   - Cluster model
   - Session model
   - Audit log model

6. **Database** (`internal/database`)
   - PostgreSQL connection
   - Schema migrations
   - Connection pooling

### Database (PostgreSQL)

**Schema:**

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture VARCHAR(255),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'pending',
    status VARCHAR(50) DEFAULT 'pending',
    approved_by INTEGER,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Clusters table
CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    kube_config TEXT NOT NULL,
    context VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    resource_id VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Authentication Flow

```
1. User clicks "Sign in with Google"
   │
   ▼
2. Frontend calls /api/v1/auth/google/login
   │
   ▼
3. Backend returns Google OAuth URL
   │
   ▼
4. Frontend redirects to Google OAuth
   │
   ▼
5. User authenticates with Google
   │
   ▼
6. Google redirects to /api/v1/auth/google/callback
   │
   ▼
7. Backend:
   - Exchanges code for token
   - Gets user info from Google
   - Creates/updates user in DB
   - Generates JWT token
   │
   ▼
8. Backend returns JWT token
   │
   ▼
9. Frontend stores token in localStorage
   │
   ▼
10. If user status is 'pending':
    - Show pending approval page
    Else if status is 'approved':
    - Redirect to dashboard
```

## Authorization Flow

```
User Request
   │
   ▼
AuthRequired Middleware
   │
   ├─ No token? ──> Return 401
   │
   ├─ Invalid token? ──> Return 401
   │
   ▼
Extract user info from JWT
   │
   ▼
Check user status
   │
   ├─ Status != 'approved' ──> Return 403
   │
   ▼
AdminRequired Middleware (if admin route)
   │
   ├─ Role != 'admin' ──> Return 403
   │
   ▼
Proceed to handler
```

## Kubernetes Interaction Flow

```
1. User selects cluster
   │
   ▼
2. Frontend calls /api/v1/k8s/clusters/{id}/...
   │
   ▼
3. Backend:
   - Retrieves cluster config from DB
   - Creates Kubernetes client
   - Calls Kubernetes API
   - Returns formatted data
   │
   ▼
4. Frontend displays resources
```

## Security Architecture

### Authentication Layers

1. **Google OAuth2**
   - Verifies user identity
   - Provides email and profile

2. **JWT Tokens**
   - Contains user ID, email, role
   - Signed with secret key
   - Expires in 24 hours

3. **Admin Approval**
   - New users start as 'pending'
   - Admin must approve access
   - Only approved users can access app

### Authorization Layers

1. **Role-Based Access Control**
   - User role: Can view and manage clusters
   - Admin role: Can approve users + all user permissions

2. **Kubernetes RBAC**
   - ServiceAccount with ClusterRole
   - Permissions for cluster operations
   - Principle of least privilege

### Data Security

1. **Encryption**
   - HTTPS for all communication
   - Kubeconfig stored encrypted in DB
   - Secrets managed via Kubernetes Secrets

2. **Network Security**
   - CORS configured
   - Private database network
   - Ingress TLS termination

## Scalability Considerations

### Horizontal Scaling

- **Frontend**: Stateless, can scale infinitely
- **Backend**: Stateless (except sessions), can scale
- **Database**: Use read replicas for read-heavy ops

### Performance Optimization

1. **Caching**
   - Cache cluster metadata
   - Cache user sessions
   - Implement Redis for distributed cache

2. **Connection Pooling**
   - Database connection pool
   - Kubernetes client pooling
   - HTTP client pooling

3. **Async Operations**
   - Background jobs for long operations
   - Webhook notifications
   - Event streaming

## Monitoring and Observability

### Metrics

- API request rates and latencies
- Database query performance
- Kubernetes API call metrics
- User activity metrics

### Logging

- Structured logging (JSON)
- Request/response logging
- Error logging with stack traces
- Audit logging for security events

### Health Checks

- `/health` endpoint for liveness
- Database connectivity check
- Kubernetes API connectivity check

## Deployment Architecture

### Kubernetes Deployment

```
Namespace: surfer
│
├── Deployments:
│   ├── surfer-backend (2+ replicas)
│   ├── surfer-frontend (2+ replicas)
│   └── postgres (1 replica with PVC)
│
├── Services:
│   ├── surfer-backend (ClusterIP)
│   ├── surfer-frontend (ClusterIP)
│   └── postgres (ClusterIP)
│
├── Ingress:
│   └── surfer-ingress (Routes traffic)
│
├── Secrets:
│   └── surfer-secrets (OAuth, JWT, DB creds)
│
├── ConfigMaps:
│   └── surfer-config (App configuration)
│
└── RBAC:
    ├── ServiceAccount: surfer
    ├── ClusterRole: surfer-cluster-role
    └── ClusterRoleBinding: surfer-cluster-role-binding
```

## Future Enhancements

1. **Multi-tenancy**
   - Organization support
   - Team management
   - Resource quotas per team

2. **Advanced Features**
   - Resource creation/editing
   - Helm chart deployment
   - Log aggregation
   - Terminal access to pods

3. **Integrations**
   - Slack notifications
   - Prometheus metrics
   - Grafana dashboards
   - CI/CD webhooks

4. **Scalability**
   - Redis for session storage
   - Event-driven architecture
   - Microservices split
   - GraphQL API
