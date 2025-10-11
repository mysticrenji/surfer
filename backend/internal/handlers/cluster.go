package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mysticrenji/surfer/backend/internal/k8s"
	"github.com/mysticrenji/surfer/backend/internal/models"
	"gorm.io/gorm"
)

type ClusterHandler struct {
	db *gorm.DB
}

func NewClusterHandler(db *gorm.DB) *ClusterHandler {
	return &ClusterHandler{db: db}
}

func (h *ClusterHandler) ListClusters(c *gin.Context) {
	var clusters []models.Cluster
	if err := h.db.Preload("Creator").Find(&clusters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clusters"})
		return
	}

	c.JSON(http.StatusOK, clusters)
}

func (h *ClusterHandler) GetCluster(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cluster ID"})
		return
	}

	var cluster models.Cluster
	if err := h.db.Preload("Creator").First(&cluster, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	c.JSON(http.StatusOK, cluster)
}

func (h *ClusterHandler) AddCluster(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		KubeConfig  string `json:"kubeconfig" binding:"required"`
		Context     string `json:"context"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cluster := models.Cluster{
		Name:        req.Name,
		Description: req.Description,
		KubeConfig:  req.KubeConfig,
		Context:     req.Context,
		CreatedBy:   userID.(uint),
	}

	if err := h.db.Create(&cluster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cluster"})
		return
	}

	c.JSON(http.StatusCreated, cluster)
}

func (h *ClusterHandler) UpdateCluster(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cluster ID"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		KubeConfig  string `json:"kubeconfig"`
		Context     string `json:"context"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.KubeConfig != "" {
		updates["kube_config"] = req.KubeConfig
	}
	if req.Context != "" {
		updates["context"] = req.Context
	}

	result := h.db.Model(&models.Cluster{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cluster"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cluster updated successfully"})
}

func (h *ClusterHandler) DeleteCluster(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cluster ID"})
		return
	}

	result := h.db.Delete(&models.Cluster{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cluster"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cluster deleted successfully"})
}

func (h *ClusterHandler) TestConnection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cluster ID"})
		return
	}

	var cluster models.Cluster
	if err := h.db.First(&cluster, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	client, err := k8s.NewClient(cluster.KubeConfig, cluster.Context)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to connect to cluster",
			"details": err.Error(),
		})
		return
	}

	version, err := client.GetVersion()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get cluster version",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "connected",
		"version": version,
	})
}
