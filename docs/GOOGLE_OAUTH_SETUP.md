# Google OAuth Setup Guide

This guide will help you set up Google OAuth for Surfer authentication.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Surfer Auth")
5. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, select your project
2. Go to "APIs & Services" > "Library"
3. Search for "Google+ API"
4. Click on it and click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "Internal" or "External" user type:
   - **Internal**: Only users in your organization can sign in
   - **External**: Anyone with a Google account can sign in
3. Click "Create"
4. Fill in the required information:
   - **App name**: Surfer
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Update" and then "Save and Continue"
9. Review and click "Back to Dashboard"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as application type
4. Enter a name (e.g., "Surfer Web Client")
5. Under "Authorized redirect URIs", add:
   - For local development: `http://localhost:8080/api/v1/auth/google/callback`
   - For production: `https://your-domain.com/api/v1/auth/google/callback`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 5. Configure Surfer

#### For Local Development

Edit your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
```

#### For Docker Compose

Edit `docker-compose.yml` environment variables or create a `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
```

#### For Kubernetes

Edit `k8s/deployment.yaml` and update the `surfer-secrets` Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: surfer-secrets
  namespace: surfer
type: Opaque
stringData:
  GOOGLE_CLIENT_ID: "your-client-id-here"
  GOOGLE_CLIENT_SECRET: "your-client-secret-here"
  GOOGLE_REDIRECT_URL: "https://your-domain.com/api/v1/auth/google/callback"
```

### 6. Test Authentication

1. Start Surfer application
2. Navigate to the login page
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen
5. After granting permissions, you'll be redirected back to Surfer

## Troubleshooting

### Error: redirect_uri_mismatch

This error occurs when the redirect URI in your request doesn't match any of the authorized redirect URIs.

**Solution**: Make sure the redirect URI in your configuration exactly matches what you configured in Google Cloud Console.

### Error: access_denied

The user denied the permission request.

**Solution**: Users need to grant permission for Surfer to access their email and profile information.

### Error: invalid_client

The OAuth client ID or secret is incorrect.

**Solution**: Verify that you copied the correct Client ID and Client Secret from Google Cloud Console.

## Security Best Practices

1. **Keep credentials secret**: Never commit OAuth credentials to version control
2. **Use HTTPS in production**: Always use HTTPS for the redirect URI in production
3. **Rotate credentials regularly**: Periodically regenerate client secrets
4. **Limit scope**: Only request the minimum scopes needed (email and profile)
5. **Restrict redirect URIs**: Only add redirect URIs you actually use

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
