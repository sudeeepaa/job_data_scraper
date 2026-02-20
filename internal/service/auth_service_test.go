package service

import (
	"context"
	"testing"

	"github.com/samuelshine/job-data-scraper/internal/database"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
)

func setupAuthService(t *testing.T) (*AuthService, *repository.UserRepo) {
	t.Helper()
	db, err := database.NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("failed to create test database: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	userRepo := repository.NewUserRepo(db)
	authService := NewAuthService(userRepo, "test-secret-key-for-jwt")
	return authService, userRepo
}

func TestAuthService_RegisterAndLogin(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	// Register
	resp, err := auth.Register(ctx, domain.RegisterRequest{
		Email:    "user@example.com",
		Password: "password123",
		Name:     "Test User",
	})
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	if resp.Token == "" {
		t.Error("expected token, got empty")
	}
	if resp.User.Email != "user@example.com" {
		t.Errorf("email = %q, want %q", resp.User.Email, "user@example.com")
	}
	if resp.User.Name != "Test User" {
		t.Errorf("name = %q, want %q", resp.User.Name, "Test User")
	}

	// Login with same credentials
	loginResp, err := auth.Login(ctx, domain.LoginRequest{
		Email:    "user@example.com",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}
	if loginResp.Token == "" {
		t.Error("expected login token, got empty")
	}
	if loginResp.User.ID != resp.User.ID {
		t.Errorf("user IDs don't match: %q != %q", loginResp.User.ID, resp.User.ID)
	}
}

func TestAuthService_RegisterDuplicate(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	req := domain.RegisterRequest{
		Email: "dup@example.com", Password: "password123", Name: "User",
	}

	_, err := auth.Register(ctx, req)
	if err != nil {
		t.Fatalf("first Register failed: %v", err)
	}

	_, err = auth.Register(ctx, req)
	if err == nil {
		t.Error("expected error for duplicate registration")
	}
	if err != ErrEmailTaken {
		t.Errorf("error = %v, want ErrEmailTaken", err)
	}
}

func TestAuthService_LoginWrongPassword(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	// Register
	auth.Register(ctx, domain.RegisterRequest{
		Email: "user@example.com", Password: "correct", Name: "User",
	})

	// Login with wrong password
	_, err := auth.Login(ctx, domain.LoginRequest{
		Email: "user@example.com", Password: "wrong",
	})
	if err == nil {
		t.Error("expected error for wrong password")
	}
	if err != ErrInvalidCredentials {
		t.Errorf("error = %v, want ErrInvalidCredentials", err)
	}
}

func TestAuthService_LoginNonexistent(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	_, err := auth.Login(ctx, domain.LoginRequest{
		Email: "nobody@example.com", Password: "password",
	})
	if err == nil {
		t.Error("expected error for nonexistent user")
	}
	if err != ErrInvalidCredentials {
		t.Errorf("error = %v, want ErrInvalidCredentials", err)
	}
}

func TestAuthService_Validation(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	// Invalid email
	_, err := auth.Register(ctx, domain.RegisterRequest{
		Email: "not-an-email", Password: "password123", Name: "User",
	})
	if err != ErrInvalidEmail {
		t.Errorf("invalid email: error = %v, want ErrInvalidEmail", err)
	}

	// Weak password
	_, err = auth.Register(ctx, domain.RegisterRequest{
		Email: "user@example.com", Password: "short", Name: "User",
	})
	if err != ErrWeakPassword {
		t.Errorf("weak password: error = %v, want ErrWeakPassword", err)
	}
}

func TestAuthService_GetUserByID(t *testing.T) {
	auth, _ := setupAuthService(t)
	ctx := context.Background()

	resp, _ := auth.Register(ctx, domain.RegisterRequest{
		Email: "user@example.com", Password: "password123", Name: "User",
	})

	user, err := auth.GetUserByID(ctx, resp.User.ID)
	if err != nil {
		t.Fatalf("GetUserByID failed: %v", err)
	}
	if user == nil {
		t.Fatal("GetUserByID returned nil")
	}
	if user.Email != "user@example.com" {
		t.Errorf("email = %q, want %q", user.Email, "user@example.com")
	}
}
