package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/mysticrenji/surfer/backend/internal/auth"
)

func TestCORS(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORS())

	router.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected Access-Control-Allow-Origin to be *")
	}

	if w.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Error("Expected Access-Control-Allow-Credentials to be true")
	}
}

func TestCORSOptions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORS())

	router.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("OPTIONS", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 204 {
		t.Errorf("Expected status code 204 for OPTIONS, got %d", w.Code)
	}
}

func TestAuthRequiredNoToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthRequired())

	router.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestAuthRequiredInvalidFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthRequired())

	router.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "InvalidToken")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestAuthRequiredInvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthRequired())

	router.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestAuthRequiredValidToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthRequired())

	router.GET("/protected", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		email, _ := c.Get("user_email")
		role, _ := c.Get("user_role")
		c.JSON(200, gin.H{
			"user_id": userID,
			"email":   email,
			"role":    role,
		})
	})

	// Generate valid token
	token, _ := auth.GenerateToken(1, "test@example.com", "user")

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestAdminRequiredNotAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Mock auth context
	router.Use(func(c *gin.Context) {
		c.Set("user_id", uint(1))
		c.Set("user_email", "user@example.com")
		c.Set("user_role", "user")
		c.Next()
	})

	router.Use(AdminRequired())

	router.GET("/admin", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/admin", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("Expected status code %d, got %d", http.StatusForbidden, w.Code)
	}
}

func TestAdminRequiredIsAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Mock auth context with admin role
	router.Use(func(c *gin.Context) {
		c.Set("user_id", uint(1))
		c.Set("user_email", "admin@example.com")
		c.Set("user_role", "admin")
		c.Next()
	})

	router.Use(AdminRequired())

	router.GET("/admin", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/admin", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestAdminRequiredNoRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Mock auth context without role
	router.Use(func(c *gin.Context) {
		c.Set("user_id", uint(1))
		c.Set("user_email", "user@example.com")
		c.Next()
	})

	router.Use(AdminRequired())

	router.GET("/admin", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	req, _ := http.NewRequest("GET", "/admin", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("Expected status code %d, got %d", http.StatusForbidden, w.Code)
	}
}
