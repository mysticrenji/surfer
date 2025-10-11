package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mysticrenji/surfer/backend/internal/auth"
	"github.com/mysticrenji/surfer/backend/internal/database"
	"github.com/mysticrenji/surfer/backend/internal/handlers"
	"github.com/mysticrenji/surfer/backend/internal/middleware"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize auth service
	authService := auth.NewAuthService()

	// Initialize handlers
	userHandler := handlers.NewUserHandler(db)
	clusterHandler := handlers.NewClusterHandler(db)
	k8sHandler := handlers.NewK8sHandler(db)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORS())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.GET("/google/login", authService.HandleGoogleLogin)
			auth.GET("/google/callback", authService.HandleGoogleCallback)
			auth.POST("/logout", authService.HandleLogout)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthRequired())
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/me", userHandler.GetCurrentUser)
				users.GET("", userHandler.ListUsers)
			}

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminRequired())
			{
				admin.GET("/pending-users", userHandler.GetPendingUsers)
				admin.POST("/approve-user/:id", userHandler.ApproveUser)
				admin.POST("/reject-user/:id", userHandler.RejectUser)
				admin.PUT("/users/:id/role", userHandler.UpdateUserRole)
			}

			// Cluster routes
			clusters := protected.Group("/clusters")
			{
				clusters.GET("", clusterHandler.ListClusters)
				clusters.POST("", clusterHandler.AddCluster)
				clusters.GET("/:id", clusterHandler.GetCluster)
				clusters.PUT("/:id", clusterHandler.UpdateCluster)
				clusters.DELETE("/:id", clusterHandler.DeleteCluster)
				clusters.POST("/:id/test", clusterHandler.TestConnection)
			}

			// Kubernetes resource routes
			k8s := protected.Group("/k8s")
			{
				k8s.GET("/clusters/:clusterId/namespaces", k8sHandler.ListNamespaces)
				k8s.GET("/clusters/:clusterId/namespaces/:namespace/pods", k8sHandler.ListPods)
				k8s.GET("/clusters/:clusterId/namespaces/:namespace/deployments", k8sHandler.ListDeployments)
				k8s.GET("/clusters/:clusterId/namespaces/:namespace/services", k8sHandler.ListServices)
				k8s.GET("/clusters/:clusterId/namespaces/:namespace/pods/:pod/logs", k8sHandler.GetPodLogs)
				k8s.DELETE("/clusters/:clusterId/namespaces/:namespace/pods/:pod", k8sHandler.DeletePod)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
