# Surfer Project Summary

## What is Surfer?

Surfer is a modern, self-hosted Kubernetes management UI that allows you to visualize and manage multiple Kubernetes clusters from a single interface. It features Google SSO authentication and an admin approval system for secure access control.

## Key Features

### 🔐 Security First
- **Google OAuth2 Authentication**: Secure login using your Google account
- **Admin Approval Workflow**: New users require admin approval before accessing the system
- **Role-Based Access Control**: Separate permissions for users and administrators
- **JWT Token Management**: Secure session handling with expiring tokens
- **Encrypted Storage**: Kubeconfig files stored securely in the database

### 🎯 Multi-Cluster Management
- **Connect Multiple Clusters**: Add and manage multiple Kubernetes clusters from one interface
- **Real-time Resource Viewing**: View pods, deployments, services, and namespaces
- **Cluster Health Monitoring**: Test cluster connections and view version information
- **Namespace Selection**: Switch between namespaces seamlessly

### 🚀 Easy Deployment
- **Self-Hosted**: Deploy in your own Kubernetes cluster or using Docker Compose
- **Kubernetes Native**: Built to run on Kubernetes with proper RBAC
- **Docker Support**: Quick start with Docker Compose for development
- **Production Ready**: Complete Kubernetes manifests with Ingress, Services, and Secrets

### 💻 Modern Technology Stack
- **Backend**: Go 1.21+ with Gin framework, GORM, and Kubernetes client-go
- **Frontend**: React 18 with TypeScript, Material-UI components
- **Database**: PostgreSQL 15 for data persistence
- **Container**: Docker and Kubernetes ready

## Project Structure

```
surfer/
├── backend/              # Go backend application
│   ├── cmd/             # Application entry point
│   └── internal/        # Internal packages
│       ├── auth/        # Authentication logic
│       ├── database/    # Database connection
│       ├── handlers/    # HTTP handlers
│       ├── k8s/         # Kubernetes client
│       ├── middleware/  # HTTP middleware
│       └── models/      # Data models
├── frontend/            # React frontend application
│   ├── public/          # Static files
│   └── src/            # Source code
│       ├── components/  # Reusable components
│       ├── context/     # React context
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── types/       # TypeScript types
├── k8s/                 # Kubernetes manifests
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── docker-compose.yml   # Docker Compose config
├── Dockerfile.backend   # Backend Docker image
├── Dockerfile.frontend  # Frontend Docker image
└── Makefile            # Common commands
```

## Quick Start

### Using Quick Start Script (Recommended)

```bash
# Clone the repository
git clone https://github.com/mysticrenji/surfer.git
cd surfer

# Run the quick start script
./scripts/quickstart.sh
```

The script will:
1. Check prerequisites (Docker, Docker Compose)
2. Create and help configure `.env` file
3. Build Docker images
4. Start all services
5. Provide next steps

### Manual Setup

See the detailed guides in the `docs/` directory:
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Local development setup
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment guide
- [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) - OAuth configuration

## What's Included

### Backend Components

1. **Authentication System**
   - Google OAuth2 integration
   - JWT token generation and validation
   - Session management

2. **User Management**
   - User CRUD operations
   - Admin approval workflow
   - Role management (user/admin)

3. **Cluster Management**
   - Add/edit/delete clusters
   - Store kubeconfig securely
   - Test cluster connections

4. **Kubernetes Operations**
   - List namespaces, pods, deployments, services
   - View pod logs
   - Delete resources
   - Multi-cluster support

5. **Database Layer**
   - PostgreSQL integration with GORM
   - Automatic migrations
   - Models for users, clusters, sessions, audit logs

### Frontend Components

1. **Authentication Pages**
   - Login page with Google SSO button
   - Pending approval page
   - Protected route wrapper

2. **Dashboard**
   - Cluster overview cards
   - Quick access to cluster resources
   - Add cluster functionality

3. **Admin Panel**
   - View pending user approvals
   - Approve/reject users
   - Manage user roles

4. **Cluster Details**
   - Tabbed interface for resources
   - Namespace selector
   - Resource tables with status indicators

5. **Navigation**
   - Responsive navbar
   - User profile menu
   - Role-based menu items

### Infrastructure Components

1. **Docker Setup**
   - Multi-stage builds for optimization
   - Backend Dockerfile (Go Alpine)
   - Frontend Dockerfile (Nginx Alpine)
   - Docker Compose for local development

2. **Kubernetes Manifests**
   - Complete deployment configuration
   - RBAC setup with ServiceAccount
   - Secrets and ConfigMaps
   - Ingress with TLS support
   - PostgreSQL with persistent storage

3. **Development Tools**
   - Makefile with common commands
   - Quick start script
   - Environment templates
   - Git ignore configuration

## Documentation

Comprehensive documentation is provided in the `docs/` directory:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture and design
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)**: Development setup and guidelines
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Deployment strategies and production setup
- **[GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)**: Step-by-step OAuth configuration
- **[README.md](README.md)**: Main project documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines

## API Endpoints

### Authentication
- `GET /api/v1/auth/google/login` - Get Google OAuth URL
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/logout` - Logout

### Users (Authenticated)
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users` - List users

### Admin (Admin Only)
- `GET /api/v1/admin/pending-users` - Get pending approvals
- `POST /api/v1/admin/approve-user/:id` - Approve user
- `POST /api/v1/admin/reject-user/:id` - Reject user
- `PUT /api/v1/admin/users/:id/role` - Update user role

### Clusters (Authenticated)
- `GET /api/v1/clusters` - List clusters
- `POST /api/v1/clusters` - Add cluster
- `GET /api/v1/clusters/:id` - Get cluster
- `PUT /api/v1/clusters/:id` - Update cluster
- `DELETE /api/v1/clusters/:id` - Delete cluster
- `POST /api/v1/clusters/:id/test` - Test connection

### Kubernetes Resources (Authenticated)
- `GET /api/v1/k8s/clusters/:clusterId/namespaces` - List namespaces
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:ns/pods` - List pods
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:ns/deployments` - List deployments
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:ns/services` - List services
- `GET /api/v1/k8s/clusters/:clusterId/namespaces/:ns/pods/:pod/logs` - Get logs
- `DELETE /api/v1/k8s/clusters/:clusterId/namespaces/:ns/pods/:pod` - Delete pod

## Technology Decisions

### Why Go for Backend?
- Excellent Kubernetes client library (client-go)
- Strong performance and concurrency support
- Easy deployment with single binary
- Good standard library for HTTP and networking

### Why React for Frontend?
- Large ecosystem and community
- Excellent TypeScript support
- Material-UI for professional components
- Rich tooling and development experience

### Why PostgreSQL?
- Reliable and mature RDBMS
- Good performance for relational data
- Strong ACID compliance
- Wide support and tooling

### Why Docker & Kubernetes?
- Container-native deployment
- Easy scaling and orchestration
- Self-hosting capability
- Industry standard for cloud-native apps

## Security Considerations

1. **Authentication**: OAuth2 with Google, JWT tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Secrets Management**: Kubernetes Secrets, encrypted storage
4. **Network Security**: HTTPS, CORS configuration
5. **Database Security**: Parameterized queries, prepared statements
6. **Audit Logging**: Track user actions and changes

## Future Enhancements

Potential features for future development:

1. **Enhanced Resource Management**
   - Create and edit resources via UI
   - YAML editor with validation
   - Helm chart deployment

2. **Advanced Features**
   - WebSocket for real-time updates
   - Terminal access to pods
   - Resource usage graphs
   - Log streaming and search

3. **Multi-tenancy**
   - Organization support
   - Team management
   - Resource quotas per team

4. **Integrations**
   - Slack/Teams notifications
   - Prometheus metrics export
   - Grafana dashboard embedding
   - GitOps workflows

## Inspiration

This project was inspired by:
- [Plural](https://github.com/pluralsh/plural) - Multi-cluster management
- [Lens](https://k8slens.dev/) - Kubernetes IDE
- [Rancher](https://rancher.com/) - Multi-cluster management platform

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Support and Contribution

- **Issues**: Report bugs or request features via GitHub Issues
- **Pull Requests**: Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Documentation**: Help improve docs by submitting PRs

## Acknowledgments

- Built with [Gin](https://gin-gonic.com/), [React](https://react.dev/), and [Material-UI](https://mui.com/)
- Uses [Kubernetes client-go](https://github.com/kubernetes/client-go)
- Inspired by the Kubernetes community

---

**Note**: This is a v1.0 implementation providing core functionality for Kubernetes cluster management with Google SSO authentication and admin approval. Future versions will add more advanced features and integrations.
