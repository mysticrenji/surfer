# GitHub Actions CI/CD Guide

This guide explains the GitHub Actions workflows configured for Surfer, including building Docker images, running tests, and creating releases.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Docker Image Building](#docker-image-building)
- [Testing](#testing)
- [Release Process](#release-process)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

Surfer uses GitHub Actions for continuous integration and deployment with three main workflows:

1. **Build and Push** - Builds and pushes Docker images to GitHub Container Registry
2. **Test Suite** - Runs backend and frontend tests with coverage reports
3. **Release** - Creates releases and publishes Helm charts

All workflows are located in `.github/workflows/`.

## Workflows

### 1. Build and Push Docker Images

**File**: `.github/workflows/build-and-push.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Tags matching `v*` pattern

**What it does**:
- Builds backend and frontend Docker images
- Pushes images to GitHub Container Registry (ghcr.io)
- Creates multi-architecture images (amd64, arm64)
- Uses Docker layer caching for faster builds
- Tags images with semantic versions

**Image Tags**:
- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `develop` - Latest build from develop branch
- `v1.0.0` - Semantic version tags
- `pr-123` - Pull request builds
- `main-abc1234` - Commit SHA tags

**Example workflow run**:
```bash
# Triggered on push to main
ghcr.io/mysticrenji/surfer-backend:latest
ghcr.io/mysticrenji/surfer-backend:main
ghcr.io/mysticrenji/surfer-backend:main-abc1234

# Triggered on tag v1.0.0
ghcr.io/mysticrenji/surfer-backend:v1.0.0
ghcr.io/mysticrenji/surfer-backend:1.0
ghcr.io/mysticrenji/surfer-backend:1
ghcr.io/mysticrenji/surfer-backend:latest
```

### 2. Test Suite

**File**: `.github/workflows/test.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs**:

#### Backend Tests
- Sets up Go 1.21
- Downloads dependencies
- Runs unit tests with race detection
- Generates coverage reports
- Uploads coverage to Codecov
- Uploads coverage HTML artifact

#### Frontend Tests
- Sets up Node.js 18
- Installs dependencies with npm
- Runs React tests with coverage
- Uploads coverage to Codecov

#### Backend Linting
- Runs golangci-lint for code quality

#### Frontend Linting  
- Runs ESLint if configured

#### Security Scanning
- Runs Trivy vulnerability scanner
- Uploads results to GitHub Security tab

**Test Results**:
- View in Actions tab
- Download coverage reports as artifacts
- Check coverage trends in Codecov

### 3. Release Workflow

**File**: `.github/workflows/release.yml`

**Triggers**:
- Push tags matching `v*` (e.g., v1.0.0)

**Jobs**:

#### Create Release
- Packages Helm chart
- Generates changelog from commits
- Creates GitHub release
- Attaches Helm chart package

#### Publish Helm Chart
- Packages Helm chart
- Updates Helm repository index
- Publishes to gh-pages branch
- Makes chart available via Helm repo

#### Update Docker Images
- Triggers Docker image builds with version tags

**Creating a Release**:
```bash
# Tag a new version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Workflow automatically:
# 1. Builds and pushes Docker images
# 2. Packages Helm chart
# 3. Creates GitHub release
# 4. Publishes Helm chart to repository
```

## Docker Image Building

### Using GitHub Container Registry

The images are automatically pushed to GitHub Container Registry:

```bash
# Backend image
ghcr.io/mysticrenji/surfer-backend:latest

# Frontend image
ghcr.io/mysticrenji/surfer-frontend:latest
```

### Pulling Images

Public images can be pulled without authentication:

```bash
docker pull ghcr.io/mysticrenji/surfer-backend:latest
docker pull ghcr.io/mysticrenji/surfer-frontend:latest
```

For private repositories, authenticate first:

```bash
# Create a Personal Access Token (PAT) with `read:packages` scope
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/mysticrenji/surfer-backend:latest
```

### Using Images in Kubernetes

Update your Helm values or Kubernetes manifests:

```yaml
# helm values
backend:
  image:
    repository: ghcr.io/mysticrenji/surfer-backend
    tag: v1.0.0
    pullPolicy: IfNotPresent

frontend:
  image:
    repository: ghcr.io/mysticrenji/surfer-frontend
    tag: v1.0.0
    pullPolicy: IfNotPresent
```

For private images, create an image pull secret:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=your-email@example.com \
  --namespace=surfer
```

Update Helm values:

```yaml
imagePullSecrets:
  - name: ghcr-secret
```

### Local Development

Build images locally for testing:

```bash
# Backend
docker build -t surfer-backend:dev -f Dockerfile.backend .

# Frontend
docker build -t surfer-frontend:dev -f Dockerfile.frontend .

# Run locally with docker-compose
docker-compose up
```

## Testing

### Running Tests Locally

#### Backend Tests

```bash
cd backend

# Run all tests
go test ./internal/... -v

# Run with coverage
go test ./internal/... -cover

# Run with race detection
go test ./internal/... -race

# Generate HTML coverage report
go test ./internal/... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

#### Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run tests in watch mode
npm test -- --watch
```

### Viewing Test Results

#### In GitHub Actions

1. Go to repository → Actions tab
2. Select "Test Suite" workflow
3. Click on a workflow run
4. View job details and logs
5. Download coverage artifacts

#### Coverage Reports

- **Codecov**: Integrated for coverage tracking
- **Artifacts**: Download HTML reports from Actions
- **Pull Requests**: Coverage comments on PRs

### Adding New Tests

#### Backend Test Example

```go
// backend/internal/mypackage/mypackage_test.go
package mypackage

import "testing"

func TestMyFunction(t *testing.T) {
    result := MyFunction("input")
    expected := "expected output"
    
    if result != expected {
        t.Errorf("Expected %s, got %s", expected, result)
    }
}
```

#### Frontend Test Example

```typescript
// frontend/src/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component', () => {
    render(<MyComponent />);
    const element = screen.getByText(/my component/i);
    expect(element).toBeInTheDocument();
});
```

## Release Process

### Creating a New Release

#### 1. Prepare Release

```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Update version in Chart.yaml
# Update CHANGELOG.md with release notes
# Commit changes
git add .
git commit -m "Prepare release v1.0.0"
git push origin main
```

#### 2. Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0

Features:
- Feature 1
- Feature 2

Bug Fixes:
- Fix 1
- Fix 2"

# Push tag
git push origin v1.0.0
```

#### 3. Automatic Actions

The workflow automatically:
1. Builds Docker images with version tags
2. Packages Helm chart
3. Creates GitHub release
4. Attaches Helm package
5. Publishes to Helm repository

#### 4. Verify Release

```bash
# Check GitHub releases
https://github.com/mysticrenji/surfer/releases

# Verify Docker images
docker pull ghcr.io/mysticrenji/surfer-backend:v1.0.0
docker pull ghcr.io/mysticrenji/surfer-frontend:v1.0.0

# Verify Helm chart
helm repo add surfer https://mysticrenji.github.io/surfer
helm search repo surfer
```

### Semantic Versioning

Follow semantic versioning (semver) for releases:

- **MAJOR** version (v2.0.0): Breaking changes
- **MINOR** version (v1.1.0): New features, backward compatible
- **PATCH** version (v1.0.1): Bug fixes, backward compatible

Examples:
```bash
# Major release (breaking changes)
git tag -a v2.0.0 -m "Major release: Breaking API changes"

# Minor release (new features)
git tag -a v1.1.0 -m "Minor release: New cluster management features"

# Patch release (bug fixes)
git tag -a v1.0.1 -m "Patch release: Fix authentication bug"
```

### Pre-releases

For beta or release candidate versions:

```bash
# Beta release
git tag -a v1.0.0-beta.1 -m "Beta release"

# Release candidate
git tag -a v1.0.0-rc.1 -m "Release candidate"
```

## Configuration

### GitHub Secrets

No additional secrets needed for public repositories. GITHUB_TOKEN is automatically provided.

For private repositories or additional features:

1. Go to repository Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `CODECOV_TOKEN`: For Codecov integration (optional)
   - `DOCKER_USERNAME`: For custom Docker registry (optional)
   - `DOCKER_PASSWORD`: For custom Docker registry (optional)

### Workflow Permissions

Ensure GitHub Actions has necessary permissions:

1. Settings → Actions → General
2. Workflow permissions: "Read and write permissions"
3. Enable: "Allow GitHub Actions to create and approve pull requests"

### Branch Protection

Recommended branch protection rules for `main`:

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass (select test workflows)
   - Require branches to be up to date
   - Include administrators

## Troubleshooting

### Build Failures

#### Docker Build Fails

```yaml
# Check Dockerfile syntax
docker build -t test -f Dockerfile.backend .

# Common issues:
# - Missing files in context
# - Invalid Go module dependencies
# - npm install failures
```

#### Permission Denied

```bash
# Ensure GITHUB_TOKEN has correct permissions
# Check Settings → Actions → General → Workflow permissions
```

### Test Failures

#### Backend Tests Fail

```bash
# Run tests locally to debug
cd backend
go test ./internal/... -v

# Check for:
# - Import errors
# - Database connection issues (use mock for tests)
# - Race conditions
```

#### Frontend Tests Fail

```bash
# Run tests locally
cd frontend
npm test -- --verbose

# Check for:
# - Missing test setup
# - Async timing issues
# - Missing mocks
```

### Release Issues

#### Tag Push Doesn't Trigger Workflow

```bash
# Ensure tag matches pattern
git tag -l  # List tags
git push origin v1.0.0  # Push specific tag

# Check workflow triggers in .github/workflows/release.yml
```

#### Helm Chart Publishing Fails

```bash
# Ensure gh-pages branch exists
git checkout --orphan gh-pages
git rm -rf .
git commit --allow-empty -m "Initialize gh-pages"
git push origin gh-pages

# Enable GitHub Pages
# Settings → Pages → Source: gh-pages branch
```

### Image Pull Issues

#### Authentication Required

```bash
# For private repos, authenticate
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Or use image pull secret in Kubernetes
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --namespace=surfer
```

#### Image Not Found

```bash
# Check image exists
docker pull ghcr.io/mysticrenji/surfer-backend:latest

# Verify workflow completed successfully
# Check Actions tab for build status

# Check package visibility
# Settings → Packages → Change visibility if needed
```

## Best Practices

### 1. Always Run Tests Before Pushing

```bash
# Backend
cd backend && go test ./internal/... -v

# Frontend
cd frontend && npm test
```

### 2. Use Feature Branches

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### 3. Review Workflow Results

- Check Actions tab after push
- Review test coverage
- Verify Docker images built correctly

### 4. Keep Dependencies Updated

```bash
# Backend
go get -u ./...
go mod tidy

# Frontend
npm update
npm audit fix
```

### 5. Monitor Security Alerts

- Review Trivy scan results
- Check Dependabot alerts
- Update vulnerable dependencies

## CI/CD Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Developer                             │
│                                                             │
│  git push → Branch: main/develop                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│            GitHub Actions: Test Suite                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Backend     │  │  Frontend    │  │   Security   │     │
│  │   Tests      │  │    Tests     │  │   Scanning   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│      GitHub Actions: Build and Push Docker Images           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Backend    │  │  Frontend    │                        │
│  │    Image     │  │    Image     │                        │
│  └──────────────┘  └──────────────┘                        │
│         │                  │                                 │
│         └──────────┬───────┘                                │
│                    ▼                                         │
│          GitHub Container Registry                          │
│  ghcr.io/mysticrenji/surfer-backend:latest                 │
│  ghcr.io/mysticrenji/surfer-frontend:latest                │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ (On Tag Push: v*)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│          GitHub Actions: Release                             │
│                                                              │
│  1. Package Helm Chart                                      │
│  2. Create GitHub Release                                   │
│  3. Publish Helm Chart to gh-pages                          │
│  4. Trigger Docker Builds with Version Tags                 │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                    Deployment                                │
│                                                              │
│  Helm Install/Upgrade → Kubernetes Cluster                  │
└──────────────────────────────────────────────────────────────┘
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Helm Documentation](https://helm.sh/docs/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Codecov Documentation](https://docs.codecov.com/)

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/mysticrenji/surfer/issues
- **GitHub Discussions**: https://github.com/mysticrenji/surfer/discussions
- **Documentation**: https://github.com/mysticrenji/surfer/tree/main/docs
