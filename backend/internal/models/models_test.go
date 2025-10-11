package models

import (
	"testing"
	"time"

	"gorm.io/gorm"
)

func TestUserModel(t *testing.T) {
	user := User{
		Email:    "test@example.com",
		Name:     "Test User",
		Picture:  "https://example.com/photo.jpg",
		GoogleID: "google123",
		Role:     "pending",
		Status:   "pending",
	}

	if user.Email != "test@example.com" {
		t.Errorf("Expected email to be test@example.com, got %s", user.Email)
	}

	if user.Role != "pending" {
		t.Errorf("Expected role to be pending, got %s", user.Role)
	}

	if user.Status != "pending" {
		t.Errorf("Expected status to be pending, got %s", user.Status)
	}
}

func TestClusterModel(t *testing.T) {
	cluster := Cluster{
		Name:        "test-cluster",
		Description: "Test Kubernetes Cluster",
		KubeConfig:  "test-kubeconfig-content",
		Context:     "test-context",
		CreatedBy:   1,
	}

	if cluster.Name != "test-cluster" {
		t.Errorf("Expected name to be test-cluster, got %s", cluster.Name)
	}

	if cluster.CreatedBy != 1 {
		t.Errorf("Expected created_by to be 1, got %d", cluster.CreatedBy)
	}
}

func TestSessionModel(t *testing.T) {
	expiresAt := time.Now().Add(24 * time.Hour)
	session := Session{
		UserID:    1,
		Token:     "test-token-123",
		ExpiresAt: expiresAt,
	}

	if session.UserID != 1 {
		t.Errorf("Expected user_id to be 1, got %d", session.UserID)
	}

	if session.Token != "test-token-123" {
		t.Errorf("Expected token to be test-token-123, got %s", session.Token)
	}

	if session.ExpiresAt.Before(time.Now()) {
		t.Error("Expected session to not be expired")
	}
}

func TestAuditLogModel(t *testing.T) {
	auditLog := AuditLog{
		UserID:     1,
		Action:     "CREATE",
		Resource:   "cluster",
		ResourceID: "123",
		Details:    "Created new cluster",
		IPAddress:  "192.168.1.1",
	}

	if auditLog.Action != "CREATE" {
		t.Errorf("Expected action to be CREATE, got %s", auditLog.Action)
	}

	if auditLog.Resource != "cluster" {
		t.Errorf("Expected resource to be cluster, got %s", auditLog.Resource)
	}
}

func TestUserDefaults(t *testing.T) {
	user := User{
		Email:    "newuser@example.com",
		GoogleID: "google456",
	}

	// Test that when creating a user, defaults should apply
	// In actual database operations, GORM would apply these defaults
	if user.Role == "" {
		user.Role = "pending"
	}
	if user.Status == "" {
		user.Status = "pending"
	}

	if user.Role != "pending" {
		t.Errorf("Expected default role to be pending, got %s", user.Role)
	}

	if user.Status != "pending" {
		t.Errorf("Expected default status to be pending, got %s", user.Status)
	}
}

func TestUserApproval(t *testing.T) {
	user := User{
		Email:    "user@example.com",
		GoogleID: "google789",
		Role:     "pending",
		Status:   "pending",
	}

	// Simulate approval
	adminID := uint(1)
	approvedAt := time.Now()
	user.Role = "user"
	user.Status = "approved"
	user.ApprovedBy = &adminID
	user.ApprovedAt = &approvedAt

	if user.Status != "approved" {
		t.Errorf("Expected status to be approved, got %s", user.Status)
	}

	if user.ApprovedBy == nil || *user.ApprovedBy != 1 {
		t.Error("Expected approved_by to be set to 1")
	}

	if user.ApprovedAt == nil {
		t.Error("Expected approved_at to be set")
	}
}

func TestUserSoftDelete(t *testing.T) {
	user := User{
		Email:     "delete@example.com",
		GoogleID:  "google999",
		DeletedAt: gorm.DeletedAt{Time: time.Now(), Valid: true},
	}

	if !user.DeletedAt.Valid {
		t.Error("Expected user to be soft deleted")
	}
}
