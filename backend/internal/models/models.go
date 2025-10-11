package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	Email         string         `gorm:"unique;not null" json:"email"`
	Name          string         `json:"name"`
	Picture       string         `json:"picture"`
	GoogleID      string         `gorm:"unique;not null" json:"google_id"`
	Role          string         `gorm:"default:'pending'" json:"role"` // pending, user, admin
	Status        string         `gorm:"default:'pending'" json:"status"` // pending, approved, rejected
	ApprovedBy    *uint          `json:"approved_by,omitempty"`
	ApprovedAt    *time.Time     `json:"approved_at,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Cluster represents a Kubernetes cluster configuration
type Cluster struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	KubeConfig  string         `gorm:"type:text;not null" json:"-"` // Encrypted kubeconfig
	Context     string         `json:"context"`
	CreatedBy   uint           `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Creator     User           `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// Session represents a user session
type Session struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Token     string    `gorm:"unique;not null" json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID         uint      `gorm:"primarykey" json:"id"`
	UserID     uint      `json:"user_id"`
	Action     string    `json:"action"`
	Resource   string    `json:"resource"`
	ResourceID string    `json:"resource_id"`
	Details    string    `gorm:"type:text" json:"details"`
	IPAddress  string    `json:"ip_address"`
	CreatedAt  time.Time `json:"created_at"`
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
