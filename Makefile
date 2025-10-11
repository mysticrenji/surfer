.PHONY: help build run test clean docker-build docker-run k8s-deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
install: ## Install dependencies
	cd backend && go mod download
	cd frontend && npm install

run-backend: ## Run backend locally
	cd backend && go run cmd/main.go

run-frontend: ## Run frontend locally
	cd frontend && npm start

dev: ## Run both backend and frontend (requires two terminals)
	@echo "Run 'make run-backend' in one terminal and 'make run-frontend' in another"

# Testing
test-backend: ## Run backend tests
	cd backend && go test ./...

test-frontend: ## Run frontend tests
	cd frontend && npm test

test: test-backend test-frontend ## Run all tests

# Building
build-backend: ## Build backend binary
	cd backend && CGO_ENABLED=0 go build -o ../bin/surfer-backend cmd/main.go

build-frontend: ## Build frontend for production
	cd frontend && npm run build

build: build-backend build-frontend ## Build both backend and frontend

# Docker
docker-build: ## Build Docker images
	docker build -f Dockerfile.backend -t surfer-backend:latest .
	docker build -f Dockerfile.frontend -t surfer-frontend:latest .

docker-push: ## Push Docker images (requires Docker Hub login)
	docker push surfer-backend:latest
	docker push surfer-frontend:latest

docker-run: ## Run with docker-compose
	docker-compose up -d

docker-stop: ## Stop docker-compose
	docker-compose down

docker-logs: ## View docker-compose logs
	docker-compose logs -f

# Kubernetes
k8s-deploy: ## Deploy to Kubernetes
	kubectl apply -f k8s/deployment.yaml

k8s-delete: ## Delete Kubernetes deployment
	kubectl delete -f k8s/deployment.yaml

k8s-status: ## Check Kubernetes deployment status
	kubectl get all -n surfer

k8s-logs-backend: ## View backend logs in Kubernetes
	kubectl logs -n surfer -l app=surfer-backend -f

k8s-logs-frontend: ## View frontend logs in Kubernetes
	kubectl logs -n surfer -l app=surfer-frontend -f

# Cleanup
clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf frontend/build/
	rm -rf frontend/node_modules/
	rm -rf backend/vendor/

# Database
db-migrate: ## Run database migrations
	cd backend && go run cmd/main.go

# Environment
setup-env: ## Setup environment files
	cp .env.example .env
	@echo "Please edit .env file with your configuration"
