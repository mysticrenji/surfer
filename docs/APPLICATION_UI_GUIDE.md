# Surfer Application UI Guide

This document provides a visual walkthrough of the Surfer Kubernetes Management UI application, including screenshots and detailed cluster configuration instructions.

## Table of Contents

1. [Login Screen](#1-login-screen)
2. [Pending Approval](#2-pending-approval-screen)
3. [Dashboard](#3-dashboard---cluster-overview)
4. [Add Cluster Configuration](#4-add-cluster-configuration)
5. [Cluster Resources View](#5-cluster-resources-view)
6. [Admin Panel](#6-admin-panel---user-approvals)
7. [Cluster Configuration Workflow](#7-cluster-configuration-workflow)
8. [Example Kubeconfig](#8-example-kubeconfig-structure)
9. [Security Notes](#9-security-notes)

---

## Complete Application UI Walkthrough

![Surfer Application UI](https://github.com/user-attachments/assets/41e53860-6251-4beb-b9a2-b9810e903910)

*The complete UI walkthrough showing all screens from login to cluster management*

---

## 1. Login Screen

**Purpose:** Secure authentication using Google SSO

**Features:**
- Clean, intuitive interface
- Google OAuth2 integration
- Single-click authentication

**User Experience:**
1. User visits the application
2. Sees the Surfer logo and description
3. Clicks "Sign in with Google" button
4. Redirected to Google authentication
5. Upon successful authentication, redirected back to the app

---

## 2. Pending Approval Screen

**Purpose:** Inform users that their account requires administrator approval

**Features:**
- Clear status message
- Instructions for next steps
- Professional waiting state UI

**User Experience:**
- First-time users see this screen after initial Google login
- Status remains until administrator approves the account
- Users are informed to check back later

**Admin Action Required:**
- Administrators must approve the user via the Admin Panel
- Once approved, users gain full access to the application

---

## 3. Dashboard - Cluster Overview

**Purpose:** Central hub for viewing and managing all connected Kubernetes clusters

**Features:**
- Navigation bar with user profile and menu
- Grid layout of cluster cards
- Quick access to cluster resources
- "Add Cluster" button for adding new clusters

**Cluster Cards Display:**
- Cluster name (e.g., "Production Cluster")
- Description (e.g., "AWS EKS - US East")
- Status indicator (Running/Stopped)
- Context name
- Click-to-access functionality

**Navigation Options:**
- Clusters: View all clusters
- Admin Panel: (Admin only) Manage users
- User Profile: Current user information
- Logout: Sign out of the application

---

## 4. Add Cluster Configuration

**Purpose:** Add new Kubernetes clusters to Surfer for management

### Form Fields:

#### 1. Cluster Name (Required)
- **Description:** A friendly, descriptive name for your cluster
- **Example:** "Production EKS Cluster", "Staging GKE", "Dev Minikube"
- **Best Practice:** Use names that clearly identify the cluster's purpose and location

#### 2. Description (Optional)
- **Description:** Additional details about the cluster
- **Example:** "Main production environment on AWS", "Staging environment for testing"
- **Best Practice:** Include environment type, cloud provider, or region information

#### 3. Kubeconfig (Required)
- **Description:** The complete kubeconfig YAML content
- **Format:** Valid Kubernetes kubeconfig file
- **Security:** Stored encrypted in the database
- **Source:** Obtained from cloud provider or local kubectl configuration

#### 4. Context Name (Optional)
- **Description:** Specific context to use from the kubeconfig
- **Example:** "prod-context", "staging-cluster"
- **Default:** Uses current-context from kubeconfig if not specified

### Action Buttons:

- **Add Cluster:** Save the cluster configuration
- **Test Connection:** Verify connectivity before saving
- **Cancel:** Discard changes and return to dashboard

### Validation:
- Kubeconfig format is validated
- Connection test ensures cluster is reachable
- Duplicate cluster names are prevented

---

## 5. Cluster Resources View

**Purpose:** Browse and manage resources within a specific Kubernetes cluster

### Features:

#### Namespace Selector
- Dropdown to switch between namespaces
- Shows all available namespaces in the cluster
- Default namespaces: default, kube-system, etc.

#### Resource Tabs
- **Pods:** View running pods
- **Deployments:** View deployment status
- **Services:** View exposed services

#### Pod Table (Example)
Shows detailed information for each pod:

| Column | Description | Example |
|--------|-------------|---------|
| Name | Pod identifier | nginx-deployment-7d64b8d9f5-4j2xk |
| Status | Running state | Running, Pending, Failed |
| IP | Pod IP address | 10.244.0.12 |
| Age | Time since creation | 2d, 5h, 30m |
| Actions | Available operations | View Logs, Delete |

#### Available Actions:
- **📋 View Logs:** Open pod logs viewer
- **🗑️ Delete:** Remove the pod (with confirmation)

### Navigation:
- Back button to return to dashboard
- Current cluster name displayed in header

---

## 6. Admin Panel - User Approvals

**Purpose:** Manage user access and permissions (Admin-only feature)

### Features:

#### Pending User Approvals Table

| Column | Description |
|--------|-------------|
| Name | User's full name from Google |
| Email | User's email address |
| Status | Current approval status (Pending) |
| Created | Date of registration |
| Actions | Approve or Reject buttons |

#### Admin Actions:
- **✓ Approve:** Grant user access with default "user" role
- **✗ Reject:** Deny access to the application

### Workflow:
1. User signs in with Google for the first time
2. Account created with "pending" status
3. Admin sees user in pending approvals table
4. Admin reviews and approves/rejects
5. User gains access (if approved) or remains blocked (if rejected)

### Role Management:
- Initial approval grants "user" role
- Admins can later upgrade users to "admin" role
- Admin role required to access this panel

---

## 7. Cluster Configuration Workflow

### Step-by-Step Guide

#### Step 1: Obtain Kubeconfig

Get your kubeconfig file from your Kubernetes cluster provider:

**For AWS EKS:**
```bash
aws eks update-kubeconfig --name my-cluster --region us-east-1
```

**For Google GKE:**
```bash
gcloud container clusters get-credentials my-cluster --region us-central1
```

**For Azure AKS:**
```bash
az aks get-credentials --resource-group my-rg --name my-cluster
```

**For Local Clusters (Minikube, Kind, etc.):**
```bash
kubectl config view --raw
```

#### Step 2: Copy Kubeconfig Content

**View your kubeconfig:**
```bash
cat ~/.kube/config
```

**For a specific cluster (recommended for security):**
```bash
kubectl config view --minify --raw
```

**Copy the entire YAML output** - from `apiVersion: v1` to the end

#### Step 3: Navigate to Add Cluster

1. Log into Surfer application
2. Go to Dashboard
3. Click the **"Add Cluster"** button in the top-right corner

#### Step 4: Fill in Cluster Details

1. **Cluster Name:** Enter a descriptive name
   - Example: "Production EKS Cluster"
   
2. **Description:** (Optional) Add context
   - Example: "Main production environment on AWS US-East-1"

3. **Kubeconfig:** Paste the entire kubeconfig YAML content
   - Ensure complete YAML structure is included
   - Check for no truncation or formatting issues

4. **Context Name:** (Optional) Specify the context
   - Found in kubeconfig under `contexts[].name`
   - If omitted, uses `current-context` from kubeconfig

#### Step 5: Test Connection

**Before saving, click "Test Connection" to:**
- Verify kubeconfig is valid
- Ensure cluster is reachable
- Check authentication works
- Retrieve cluster version information

**Expected Response:**
```json
{
  "status": "connected",
  "version": "v1.28.2"
}
```

#### Step 6: Save and Access

1. Click **"Add Cluster"** button to save
2. Return to dashboard automatically
3. New cluster card appears in the dashboard
4. Click the cluster card to access resources

---

## 8. Example Kubeconfig Structure

### Complete Kubeconfig Format

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCVENDQWUy...
    server: https://api.production.example.com:6443
  name: production-cluster
contexts:
- context:
    cluster: production-cluster
    namespace: default
    user: production-admin
  name: prod-context
current-context: prod-context
preferences: {}
users:
- name: production-admin
  user:
    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURJVENDQWdt...
    client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFB...
```

### Key Components Explained

#### 1. Clusters Section
```yaml
clusters:
- cluster:
    certificate-authority-data: <base64-encoded-ca-cert>
    server: https://api-server-url:6443
  name: cluster-name
```
- **certificate-authority-data:** CA certificate for TLS verification
- **server:** Kubernetes API server endpoint
- **name:** Identifier for this cluster

#### 2. Contexts Section
```yaml
contexts:
- context:
    cluster: cluster-name
    namespace: default
    user: user-name
  name: context-name
```
- **cluster:** References a cluster from the clusters section
- **user:** References a user from the users section
- **namespace:** Default namespace for operations
- **name:** Identifier for this context combination

#### 3. Users Section
```yaml
users:
- name: user-name
  user:
    client-certificate-data: <base64-encoded-cert>
    client-key-data: <base64-encoded-key>
    # OR
    token: <bearer-token>
```
- **client-certificate-data:** Client certificate for authentication
- **client-key-data:** Private key for the certificate
- **token:** Bearer token for authentication (alternative to certs)

#### 4. Current Context
```yaml
current-context: context-name
```
- Specifies which context is active by default

---

## 9. Security Notes

### ⚠️ Security Best Practices

#### Data Protection
- **Kubeconfig Encryption:** All kubeconfig files are stored encrypted in the PostgreSQL database
- **TLS/HTTPS:** Use HTTPS in production for all communications
- **Secrets Management:** Never commit kubeconfig files to version control

#### Access Control
- **Service Accounts:** Use service accounts with limited RBAC permissions instead of admin credentials
- **Least Privilege:** Grant minimum necessary permissions for Surfer operations
- **Regular Audits:** Review and rotate credentials regularly
- **Audit Logging:** All operations are logged for security tracking

#### RBAC Configuration
- **Read-Only Preferred:** For viewing resources, use read-only service accounts
- **Namespace Scoping:** Limit access to specific namespaces when possible
- **Time-Limited Tokens:** Use tokens with expiration for temporary access

### 💡 Recommended RBAC Setup

Create a dedicated service account for Surfer with appropriate permissions:

```bash
# Create a read-only service account for Surfer
kubectl create serviceaccount surfer-reader -n kube-system

# Create ClusterRole with read permissions
kubectl create clusterrole surfer-reader \
  --verb=get,list,watch \
  --resource=pods,deployments,services,namespaces

# Bind the role to the service account
kubectl create clusterrolebinding surfer-reader-binding \
  --clusterrole=surfer-reader \
  --serviceaccount=kube-system:surfer-reader

# Get the service account token
kubectl create token surfer-reader -n kube-system --duration=8760h
```

### For Production Environments

#### Minimal Permissions ClusterRole
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: surfer-minimal
rules:
- apiGroups: [""]
  resources: ["namespaces", "pods", "services"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "statefulsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]
```

#### Network Security
- **Firewall Rules:** Restrict access to Kubernetes API servers
- **VPN/Private Networks:** Access clusters through secure networks
- **IP Whitelisting:** Limit API server access to known IPs

---

## Troubleshooting

### Common Issues

#### 1. "Failed to connect to cluster"
**Possible Causes:**
- Invalid kubeconfig format
- Cluster API server unreachable
- Expired credentials
- Network connectivity issues

**Solutions:**
- Verify kubeconfig with `kubectl config view`
- Test connectivity with `kubectl get nodes`
- Check firewall rules and network access
- Regenerate credentials if expired

#### 2. "Invalid context"
**Possible Causes:**
- Context name doesn't exist in kubeconfig
- Typo in context name

**Solutions:**
- List available contexts: `kubectl config get-contexts`
- Verify context name matches exactly
- Use current-context if unsure

#### 3. "Permission denied"
**Possible Causes:**
- Insufficient RBAC permissions
- Service account lacks necessary roles
- Token expired

**Solutions:**
- Check RBAC permissions: `kubectl auth can-i list pods`
- Verify ClusterRoleBinding exists
- Regenerate service account token

#### 4. "User pending approval"
**Possible Causes:**
- Admin hasn't approved the account yet
- First-time login

**Solutions:**
- Wait for admin approval
- Contact your administrator
- Check Admin Panel if you have admin access

---

## Additional Resources

### Documentation Links
- [Main README](../README.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)

### External Resources
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Configuration](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)
- [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Google OAuth2](https://developers.google.com/identity/protocols/oauth2)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Documentation](../README.md)
3. Open an issue on GitHub

---

*Last Updated: October 11, 2024*
