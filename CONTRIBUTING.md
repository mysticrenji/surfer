# Contributing to Surfer

Thank you for your interest in contributing to Surfer! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, versions, etc.)
- Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please:

- Check if the feature already exists or is requested
- Create a detailed issue describing the feature
- Explain the use case and benefits
- Consider potential implementation approaches

### Submitting Changes

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR-USERNAME/surfer.git
   cd surfer
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

   Follow commit message conventions:
   - `feat: Add new feature`
   - `fix: Fix bug description`
   - `docs: Update documentation`
   - `test: Add tests`
   - `refactor: Refactor code`
   - `style: Format code`

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill in the PR template
   - Link related issues

## Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

Quick start:

```bash
# Backend
cd backend
go mod download
go run cmd/main.go

# Frontend
cd frontend
npm install
npm start
```

## Code Style Guidelines

### Go (Backend)

- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Run `golint` before committing
- Add comments for exported functions
- Keep functions small and focused
- Use meaningful variable names

Example:
```go
// GetUser retrieves a user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    
    var user models.User
    if err := h.db.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    
    c.JSON(http.StatusOK, user)
}
```

### TypeScript/React (Frontend)

- Follow [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- Use functional components with hooks
- Use TypeScript for type safety
- Keep components small and reusable
- Use meaningful prop names

Example:
```typescript
interface UserCardProps {
  user: User;
  onEdit?: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2">{user.email}</Typography>
        {onEdit && (
          <Button onClick={() => onEdit(user.id)}>Edit</Button>
        )}
      </CardContent>
    </Card>
  );
};
```

## Testing Guidelines

### Backend Tests

```go
func TestGetUser(t *testing.T) {
    // Setup
    db, mock, err := sqlmock.New()
    if err != nil {
        t.Fatalf("Failed to create mock: %v", err)
    }
    defer db.Close()
    
    // Test logic
    // ...
    
    // Assertions
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("Unfulfilled expectations: %v", err)
    }
}
```

### Frontend Tests

```typescript
describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' };
    render(<UserCard user={user} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
```

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests pass
- [ ] No linting errors
- [ ] Commit messages are clear
- [ ] PR description is complete

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
```

## Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Linters check code style
   - Build verification

2. **Code Review**
   - Maintainers review code
   - Feedback and suggestions
   - Request changes if needed

3. **Approval**
   - At least one approval required
   - All comments resolved
   - CI checks passing

4. **Merge**
   - Squash and merge by maintainers
   - Delete branch after merge

## Areas for Contribution

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- Simple bug fixes
- UI enhancements
- Test coverage

### Help Wanted

Issues labeled `help-wanted`:
- New features
- Performance improvements
- Complex bug fixes
- Architecture improvements

### Priority Areas

Current priority areas:
- Multi-cluster management improvements
- Enhanced RBAC features
- Dashboard visualizations
- Performance optimization
- Test coverage
- Documentation

## Community

### Getting Help

- GitHub Issues: Bug reports and feature requests
- Discussions: Questions and general discussion
- Documentation: Check docs/ directory

### Communication

- Be respectful and inclusive
- Provide constructive feedback
- Help others when possible
- Share knowledge and experiences

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributor graph

Thank you for contributing to Surfer! 🏄
