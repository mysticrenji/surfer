package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mysticrenji/surfer/backend/internal/k8s"
	"github.com/mysticrenji/surfer/backend/internal/models"
	"gorm.io/gorm"
)

type K8sHandler struct {
	db *gorm.DB
}

func NewK8sHandler(db *gorm.DB) *K8sHandler {
	return &K8sHandler{db: db}
}

func (h *K8sHandler) getClusterClient(c *gin.Context) (*k8s.Client, error) {
	clusterID, err := strconv.ParseUint(c.Param("clusterId"), 10, 32)
	if err != nil {
		return nil, err
	}

	var cluster models.Cluster
	if err := h.db.First(&cluster, clusterID).Error; err != nil {
		return nil, err
	}

	return k8s.NewClient(cluster.KubeConfig, cluster.Context)
}

func (h *K8sHandler) ListNamespaces(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespaces, err := client.ListNamespaces()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list namespaces"})
		return
	}

	c.JSON(http.StatusOK, namespaces)
}

func (h *K8sHandler) ListPods(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespace := c.Param("namespace")
	pods, err := client.ListPods(namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list pods"})
		return
	}

	c.JSON(http.StatusOK, pods)
}

func (h *K8sHandler) ListDeployments(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespace := c.Param("namespace")
	deployments, err := client.ListDeployments(namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list deployments"})
		return
	}

	c.JSON(http.StatusOK, deployments)
}

func (h *K8sHandler) ListServices(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespace := c.Param("namespace")
	services, err := client.ListServices(namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list services"})
		return
	}

	c.JSON(http.StatusOK, services)
}

func (h *K8sHandler) GetPodLogs(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespace := c.Param("namespace")
	podName := c.Param("pod")
	
	// Get optional query parameters
	tailLines := int64(100)
	if tail := c.Query("tail"); tail != "" {
		if lines, err := strconv.ParseInt(tail, 10, 64); err == nil {
			tailLines = lines
		}
	}

	logs, err := client.GetPodLogs(namespace, podName, tailLines)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pod logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

func (h *K8sHandler) DeletePod(c *gin.Context) {
	client, err := h.getClusterClient(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get cluster client"})
		return
	}

	namespace := c.Param("namespace")
	podName := c.Param("pod")

	if err := client.DeletePod(namespace, podName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pod"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pod deleted successfully"})
}
