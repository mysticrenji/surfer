# 🏄 Surfer - Kubernetes Management UI

A modern, self-hosted web application for managing multiple Kubernetes clusters in a single pane of glass with Google SSO authentication and admin approval workflow.

## Features

- 🔐 **Google SSO Authentication** - Secure login using Google OAuth2
- 👥 **Admin Approval System** - Admins can approve/reject user access
- 🎯 **Multi-Cluster Management** - Connect and manage multiple Kubernetes clusters
- 📊 **Resource Visualization** - View pods, deployments, services, and more
- 🚀 **Self-Hosted** - Deploy in your own Kubernetes cluster
- 🌐 **Accessible Anywhere** - Web-based UI accessible from any browser
- 🔒 **Role-Based Access Control** - User and admin roles with different permissions

## Architecture

### Backend
- **Go** with Gin framework
- **PostgreSQL** for data persistence
- **Kubernetes client-go** for cluster interactions
- **JWT** for session management
- **OAuth2** for Google SSO

### Frontend
- **React** with TypeScript
- **Material-UI** for modern UI components
- **React Router** for navigation
- **Axios** for API communication

## Quick Start

### Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (for containerized deployment)
- Kubernetes cluster (for production deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mysticrenji/surfer.git
   cd surfer
   ```

2. **Setup Google OAuth2**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:8080/api/v1/auth/google/callback`
   - Copy Client ID and Client Secret

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google OAuth credentials
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Manual Setup

#### Backend Setup

```bash
# Install dependencies
cd backend
go mod download

# Run database migrations (PostgreSQL should be running)
go run cmd/main.go

# The backend will start on port 8080
```

#### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# The frontend will start on port 3000
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Ingress controller (e.g., nginx-ingress)

### Deployment Steps

1. **Update Kubernetes secrets**
   
   Edit `k8s/deployment.yaml` and update the following in the `surfer-secrets` Secret:
   ```yaml
   GOOGLE_CLIENT_ID: "your-google-client-id"
   GOOGLE_CLIENT_SECRET: "your-google-client-secret"
   GOOGLE_REDIRECT_URL: "https://your-domain.com/api/v1/auth/google/callback"
   JWT_SECRET: "your-secure-jwt-secret"
   ```

2. **Update Ingress host**
   
   Edit `k8s/deployment.yaml` and update the Ingress host:
   ```yaml
   spec:
     rules:
       - host: surfer.your-domain.com
   ```

3. **Build Docker images**
   ```bash
   # Build backend
   docker build -f Dockerfile.backend -t surfer-backend:latest .
   
   # Build frontend
   docker build -f Dockerfile.frontend -t surfer-frontend:latest .
   ```

4. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```

5. **Verify deployment**
   ```bash
   kubectl get pods -n surfer
   kubectl get ingress -n surfer
   ```

## Configuration

### Environment Variables

#### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 8080 |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth Client Secret | - |
| GOOGLE_REDIRECT_URL | OAuth callback URL | - |
| JWT_SECRET | Secret for JWT token signing | - |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | PostgreSQL username | surfer |
| DB_PASSWORD | PostgreSQL password | surfer |
| DB_NAME | PostgreSQL database name | surfer |

#### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8080/api/v1 |

## Usage

### First Time Setup

1. **Login with Google**
   - Navigate to the application URL
   - Click "Sign in with Google"
   - Authenticate with your Google account

2. **Wait for Admin Approval**
   - After first login, your account will be in "pending" status
   - Contact your administrator to approve your account

3. **Admin Creates First User** (Bootstrap)
   - For the first admin user, manually update the database:
   ```sql
   UPDATE users SET role='admin', status='approved' WHERE email='admin@example.com';
   ```

### Managing Clusters

1. **Add a Cluster**
   - Click "Add Cluster" button
   - Provide cluster name and description
   - Paste your kubeconfig content
   - Specify context name (optional)
   - Click "Add" to save

2. **View Cluster Resources**
   - Click on a cluster card
   - Select namespace from dropdown
   - Browse Pods, Deployments, and Services tabs
   - View resource details and logs

### Admin Functions

Admins have access to additional features:

1. **Approve Users**
   - Navigate to Admin Panel
   - View pending user requests
   - Click "Approve" or "Reject" for each user

2. **Manage User Roles**
   - View all users
   - Update user roles (user/admin)
   - Revoke access if needed

## API Documentation

### Authentication Endpoints

- `GET /api/v1/auth/google/login` - Get Google OAuth login URL
- `GET /api/v1/auth/google/callback` - OAuth callback handler
- `POST /api/v1/auth/logout` - Logout user

### User Endpoints (Authenticated)

- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users` - List all users

### Admin Endpoints (Admin Only)

- `GET /api/v1/admin/pending-users` - Get pending user approvals
- `POST /api/v1/admin/approve-user/:id` - Approve user
- `POST /api/v1/admin/reject-user/:id` - Reject user
- `PUT /api/v1/admin/users/:id/role` - Update user role

### Cluster Endpoints (Authenticated)

- `GET /api/v1/clusters` - List clusters
- `POST /api/v1/clusters` - Add cluster
- `GET /api/v1/clusters/:id` - Get cluster details
- `PUT /api/v1/clusters/:id` - Update cluster
- `DELETE /api/v1/clusters/:id` - Delete cluster
- `POST /api/v1/clusters/:id/test` - Test cluster connection

### Kubernetes Resource Endpoints (Authenticated)

- `GET /api/v1/k8s/clusters/:clusterId/namespaces` - List namespaces
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:namespace/pods` - List pods
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:namespace/deployments` - List deployments
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:namespace/services` - List services
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:namespace/pods/:pod/logs` - Get pod logs
- `DELETE /api/v1/k8s/clusters/:clusterId/namespaces/:namespace/pods/:pod` - Delete pod

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to version control
   - Use Kubernetes Secrets or external secret managers
   - Rotate JWT secrets regularly

2. **Kubeconfig Storage**
   - Kubeconfig files are stored encrypted in the database
   - Consider using service accounts with limited permissions
   - Implement kubeconfig rotation policies

3. **Network Security**
   - Use HTTPS in production
   - Configure appropriate CORS settings
   - Implement rate limiting

4. **RBAC**
   - Follow principle of least privilege
   - Regularly review user permissions
   - Audit admin actions

## Troubleshooting

### Backend Issues

- **Database connection failed**: Check PostgreSQL is running and credentials are correct
- **OAuth error**: Verify Google OAuth credentials and redirect URL
- **Kubeconfig error**: Ensure kubeconfig format is valid

### Frontend Issues

- **API connection failed**: Check backend is running and API URL is correct
- **Login redirect fails**: Verify OAuth redirect URL matches configuration

### Kubernetes Deployment Issues

- **Pods not starting**: Check logs with `kubectl logs -n surfer <pod-name>`
- **Ingress not working**: Verify ingress controller is installed and configured
- **Database persistence**: Ensure PVC is bound correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Plural](https://github.com/pluralsh/plural)
- Built with [Gin](https://github.com/gin-gonic/gin) and [React](https://reactjs.org/)
- Uses [Kubernetes client-go](https://github.com/kubernetes/client-go)

## Support

For issues, questions, or contributions, please open an issue on GitHub.
