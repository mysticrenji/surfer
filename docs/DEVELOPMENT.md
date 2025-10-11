# Development Guide

This guide provides detailed information for developers working on Surfer.

## Development Setup

### Backend Development

1. **Install Go 1.21+**
   ```bash
   # On Ubuntu/Debian
   wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
   sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
   export PATH=$PATH:/usr/local/go/bin
   ```

2. **Setup PostgreSQL**
   ```bash
   # Using Docker
   docker run --name surfer-postgres -e POSTGRES_PASSWORD=surfer -e POSTGRES_USER=surfer -e POSTGRES_DB=surfer -p 5432:5432 -d postgres:15-alpine
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install Dependencies**
   ```bash
   cd backend
   go mod download
   ```

5. **Run Backend**
   ```bash
   go run cmd/main.go
   ```

### Frontend Development

1. **Install Node.js 18+**
   ```bash
   # On Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure API URL**
   ```bash
   # Create .env.local
   echo "REACT_APP_API_URL=http://localhost:8080/api/v1" > .env.local
   ```

4. **Run Frontend**
   ```bash
   npm start
   ```

## Project Structure

```
surfer/
├── backend/
│   ├── cmd/
│   │   └── main.go              # Application entry point
│   ├── internal/
│   │   ├── auth/                # Authentication logic
│   │   ├── database/            # Database connection and migrations
│   │   ├── handlers/            # HTTP request handlers
│   │   ├── k8s/                 # Kubernetes client wrapper
│   │   ├── middleware/          # HTTP middleware
│   │   └── models/              # Data models
│   └── config/                  # Configuration files
├── frontend/
│   ├── public/                  # Static files
│   └── src/
│       ├── components/          # Reusable React components
│       ├── context/             # React context providers
│       ├── pages/               # Page components
│       ├── services/            # API service layer
│       └── types/               # TypeScript type definitions
├── k8s/                         # Kubernetes manifests
├── docs/                        # Documentation
├── Dockerfile.backend           # Backend Docker image
├── Dockerfile.frontend          # Frontend Docker image
├── docker-compose.yml           # Local development with Docker
└── Makefile                     # Common commands
```

## Adding New Features

### Adding a New API Endpoint

1. **Define Model** (if needed)
   ```go
   // backend/internal/models/models.go
   type NewResource struct {
       ID        uint      `gorm:"primarykey" json:"id"`
       Name      string    `json:"name"`
       CreatedAt time.Time `json:"created_at"`
   }
   ```

2. **Create Handler**
   ```go
   // backend/internal/handlers/resource.go
   type ResourceHandler struct {
       db *gorm.DB
   }

   func NewResourceHandler(db *gorm.DB) *ResourceHandler {
       return &ResourceHandler{db: db}
   }

   func (h *ResourceHandler) List(c *gin.Context) {
       // Implementation
   }
   ```

3. **Register Route**
   ```go
   // backend/cmd/main.go
   resourceHandler := handlers.NewResourceHandler(db)
   protected.GET("/resources", resourceHandler.List)
   ```

### Adding a New Frontend Page

1. **Create Page Component**
   ```typescript
   // frontend/src/pages/NewPage.tsx
   import React from 'react';
   import Navbar from '../components/Navbar';

   const NewPage: React.FC = () => {
       return (
           <>
               <Navbar />
               {/* Page content */}
           </>
       );
   };

   export default NewPage;
   ```

2. **Add Route**
   ```typescript
   // frontend/src/App.tsx
   <Route
       path="/new-page"
       element={
           <ProtectedRoute>
               <NewPage />
           </ProtectedRoute>
       }
   />
   ```

3. **Create Service Functions** (if needed)
   ```typescript
   // frontend/src/services/index.ts
   export const resourceService = {
       getResources: async () => {
           const response = await api.get('/resources');
           return response.data;
       },
   };
   ```

## Testing

### Backend Tests

```bash
# Run all tests
cd backend
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests for specific package
go test ./internal/auth/...
```

### Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- NewPage.test.tsx
```

## Code Style

### Backend (Go)

- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Run `golint` for linting

```bash
# Format code
go fmt ./...

# Run linter
golint ./...
```

### Frontend (TypeScript/React)

- Follow [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- Use ESLint and Prettier

```bash
# Format code
npm run format

# Run linter
npm run lint
```

## Database Migrations

Surfer uses GORM's AutoMigrate for database migrations. When you add or modify models:

1. Update the model in `backend/internal/models/models.go`
2. Update the migration in `backend/internal/database/database.go`
3. Restart the backend - migrations run automatically on startup

For manual migration control, you can create custom migration scripts.

## Debugging

### Backend Debugging

1. **Using Delve**
   ```bash
   # Install delve
   go install github.com/go-delve/delve/cmd/dlv@latest

   # Run with debugger
   dlv debug ./backend/cmd/main.go
   ```

2. **Enable Verbose Logging**
   ```go
   // Set Gin to debug mode
   gin.SetMode(gin.DebugMode)
   ```

### Frontend Debugging

1. **React Developer Tools**
   - Install Chrome/Firefox extension
   - Inspect component hierarchy and state

2. **Browser DevTools**
   - Console for logs
   - Network tab for API requests
   - React tab for component inspection

## Performance Optimization

### Backend

- Use connection pooling for database
- Cache frequently accessed data
- Implement pagination for large datasets
- Use goroutines for concurrent operations

### Frontend

- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize bundle size
- Use virtualization for large lists

## Security Considerations

1. **Never commit secrets**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Validate input**
   - Use Gin's binding validation
   - Sanitize user input

3. **Secure database queries**
   - Use GORM's parameterized queries
   - Avoid raw SQL when possible

4. **Implement rate limiting**
   - Protect against brute force
   - Use middleware for rate limiting

5. **HTTPS in production**
   - Use TLS certificates
   - Redirect HTTP to HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Run linters and tests
6. Submit a pull request

## Troubleshooting

### Backend won't start

- Check PostgreSQL is running
- Verify environment variables are set
- Check port 8080 is not in use

### Frontend won't start

- Clear node_modules and reinstall
- Check Node.js version
- Verify backend is running

### Database connection issues

- Verify PostgreSQL credentials
- Check database exists
- Ensure PostgreSQL is accepting connections

### OAuth errors

- Verify Google OAuth credentials
- Check redirect URI matches exactly
- Ensure OAuth consent screen is configured
