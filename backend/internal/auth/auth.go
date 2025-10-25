package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthService struct {
	config *oauth2.Config
	states map[string]time.Time
	mutex  sync.RWMutex
}

type GoogleUser struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService() *AuthService {
	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	authService := &AuthService{
		config: config,
		states: make(map[string]time.Time),
		mutex:  sync.RWMutex{},
	}

	// Start cleanup goroutine for expired states
	go authService.cleanupExpiredStates()

	return authService
}

func (a *AuthService) HandleGoogleLogin(c *gin.Context) {
	state := generateRandomState()
	url := a.config.AuthCodeURL(state)

	// Store state in memory with expiration (5 minutes)
	a.mutex.Lock()
	a.states[state] = time.Now().Add(5 * time.Minute)
	a.mutex.Unlock()

	// Also store in cookie for backward compatibility
	c.SetCookie("oauth_state", state, 300, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})
}

func (a *AuthService) HandleGoogleCallback(c *gin.Context) {
	// Verify state using in-memory store
	state := c.Query("state")
	if state == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing state parameter"})
		return
	}

	// Check if state exists and is not expired
	a.mutex.RLock()
	expiration, exists := a.states[state]
	a.mutex.RUnlock()

	if !exists || time.Now().After(expiration) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired state"})
		return
	}

	// Remove the used state
	a.mutex.Lock()
	delete(a.states, state)
	a.mutex.Unlock()

	// Exchange code for token
	code := c.Query("code")
	token, err := a.config.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Get user info
	client := a.config.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// TODO: Store or update user in database and create session
	// For now, return user info
	c.JSON(http.StatusOK, gin.H{
		"user": googleUser,
		"message": "Authentication successful. Please wait for admin approval.",
	})
}

func (a *AuthService) HandleLogout(c *gin.Context) {
	// Clear authentication cookie
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func GenerateToken(userID uint, email, role string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-this"
	}

	return token.SignedString([]byte(secret))
}

func ValidateToken(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-this"
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// cleanupExpiredStates periodically removes expired states from memory
func (a *AuthService) cleanupExpiredStates() {
	ticker := time.NewTicker(5 * time.Minute) // Clean up every 5 minutes
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		a.mutex.Lock()
		for state, expiration := range a.states {
			if now.After(expiration) {
				delete(a.states, state)
			}
		}
		a.mutex.Unlock()
	}
}

func generateRandomState() string {
	// In production, use a cryptographically secure random generator
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
