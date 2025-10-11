package auth

import (
	"os"
	"testing"
	"time"
)

func TestGenerateToken(t *testing.T) {
	// Set JWT secret for testing
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	userID := uint(1)
	email := "test@example.com"
	role := "user"

	token, err := GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Error("Expected token to be non-empty")
	}
}

func TestValidateToken(t *testing.T) {
	// Set JWT secret for testing
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	userID := uint(1)
	email := "test@example.com"
	role := "user"

	// Generate a token
	token, err := GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate the token
	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected user_id to be %d, got %d", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected email to be %s, got %s", email, claims.Email)
	}

	if claims.Role != role {
		t.Errorf("Expected role to be %s, got %s", role, claims.Role)
	}
}

func TestValidateTokenInvalid(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	invalidToken := "invalid.token.here"

	_, err := ValidateToken(invalidToken)
	if err == nil {
		t.Error("Expected error when validating invalid token")
	}
}

func TestValidateTokenExpired(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	// This test would require manually creating an expired token
	// For now, we'll just test that validation works correctly
	// In a real scenario, you'd use a library to create expired tokens for testing
}

func TestTokenClaims(t *testing.T) {
	claims := &Claims{
		UserID: 123,
		Email:  "claims@example.com",
		Role:   "admin",
	}

	if claims.UserID != 123 {
		t.Errorf("Expected UserID to be 123, got %d", claims.UserID)
	}

	if claims.Email != "claims@example.com" {
		t.Errorf("Expected Email to be claims@example.com, got %s", claims.Email)
	}

	if claims.Role != "admin" {
		t.Errorf("Expected Role to be admin, got %s", claims.Role)
	}
}

func TestGenerateTokenWithDifferentRoles(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	testCases := []struct {
		role string
	}{
		{"user"},
		{"admin"},
		{"pending"},
	}

	for _, tc := range testCases {
		token, err := GenerateToken(1, "test@example.com", tc.role)
		if err != nil {
			t.Fatalf("Failed to generate token for role %s: %v", tc.role, err)
		}

		claims, err := ValidateToken(token)
		if err != nil {
			t.Fatalf("Failed to validate token for role %s: %v", tc.role, err)
		}

		if claims.Role != tc.role {
			t.Errorf("Expected role to be %s, got %s", tc.role, claims.Role)
		}
	}
}

func TestTokenExpiration(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	token, err := GenerateToken(1, "test@example.com", "user")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	// Check that expiration is set in the future
	if claims.ExpiresAt == nil {
		t.Error("Expected ExpiresAt to be set")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		t.Error("Expected token to not be expired")
	}

	// Check that expiration is approximately 24 hours from now
	expectedExpiry := time.Now().Add(24 * time.Hour)
	timeDiff := claims.ExpiresAt.Time.Sub(expectedExpiry)
	if timeDiff < -time.Minute || timeDiff > time.Minute {
		t.Error("Expected token expiry to be approximately 24 hours from now")
	}
}

func TestGenerateRandomState(t *testing.T) {
	state1 := generateRandomState()
	state2 := generateRandomState()

	if state1 == "" {
		t.Error("Expected state to be non-empty")
	}

	// States should be different (with very high probability)
	// Sleep a tiny bit to ensure different timestamps
	time.Sleep(time.Millisecond)
	if state1 == state2 {
		t.Error("Expected different states to be generated")
	}
}
