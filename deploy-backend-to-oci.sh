#!/bin/bash

# Elucidate Chess Backend Deployment to OCI
# Adapted from crooked-finger deployment script
#
# Usage: ./deploy-backend-to-oci.sh
# Requires OCI_SERVER_IP environment variable to be set
#
# Example: export OCI_SERVER_IP=123.45.67.89 && ./deploy-backend-to-oci.sh

set -e  # Exit on any error

# Configuration
PROJECT_NAME="elucidate-chess"
BACKEND_SERVICE_NAME="elucidate-chess-backend"
DB_SERVICE_NAME="elucidate-chess-db"
REMOTE_DEPLOY_DIR="/opt/$PROJECT_NAME"
BACKUP_DIR="/opt/backups/$PROJECT_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if OCI server IP is provided via environment variable
if [ -z "$OCI_SERVER_IP" ]; then
    print_error "OCI_SERVER_IP environment variable is required"
    echo ""
    echo "Usage:"
    echo "  export OCI_SERVER_IP=123.45.67.89"
    echo "  ./deploy-backend-to-oci.sh"
    echo ""
    echo "Or in one command:"
    echo "  OCI_SERVER_IP=123.45.67.89 ./deploy-backend-to-oci.sh"
    exit 1
fi

SSH_USER="ubuntu"  # Change if your OCI instance uses different user
SSH_KEY="$HOME/.ssh/id_rsa"  # Change if your SSH key is elsewhere

print_status "Starting deployment of $PROJECT_NAME backend to OCI server: $OCI_SERVER_IP"

# Verify SSH connection
print_status "Testing SSH connection to $OCI_SERVER_IP..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$OCI_SERVER_IP" "echo 'SSH connection successful'"; then
    print_error "Cannot connect to OCI server. Please check:"
    echo "1. Server IP address is correct"
    echo "2. SSH key is correctly configured"
    echo "3. Security group allows SSH (port 22)"
    echo "4. Instance is running"
    exit 1
fi

print_success "SSH connection verified"

# Install Docker on OCI instance if not installed
print_status "Checking Docker installation on OCI instance..."
DOCKER_VERSION=$(ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1" || echo "")

if [ -z "$DOCKER_VERSION" ]; then
    print_status "Installing Docker on OCI instance..."
    ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" << 'EOF'
    # Update package index
    sudo apt-get update

    # Install packages to allow apt to use a repository over HTTPS
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    # Set up the stable repository
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    # Update the apt package index
    sudo apt-get update

    # Install the latest version of Docker CE
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Add user to docker group
    sudo usermod -aG docker ubuntu

    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
EOF
    print_success "Docker installation completed"
else
    print_success "Docker already installed (version: $DOCKER_VERSION)"
fi

# Create deployment directory structure
print_status "Creating deployment directory structure..."
ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" << EOF
    sudo mkdir -p $REMOTE_DEPLOY_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo chown -R $SSH_USER:$SSH_USER $REMOTE_DEPLOY_DIR
    sudo chown -R $SSH_USER:$SSH_USER $BACKUP_DIR
EOF

print_success "Deployment directories created"

# Backup existing deployment if it exists
print_status "Checking for existing deployment..."
if ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "[ -d '$REMOTE_DEPLOY_DIR/apps' ]"; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    print_warning "Existing deployment found, creating backup..."
    ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "cp -r $REMOTE_DEPLOY_DIR $BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    print_success "Backup created at $BACKUP_DIR/backup_$BACKUP_TIMESTAMP"

    # Stop existing services
    print_status "Stopping existing services..."
    ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml down || true"
fi

# Sync files to OCI instance
print_status "Syncing application files to OCI instance..."
rsync -avz --delete -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.venv' \
    --exclude='.DS_Store' \
    --exclude='logs/' \
    --exclude='.env' \
    --exclude='apps/web' \
    ./ "$SSH_USER@$OCI_SERVER_IP:$REMOTE_DEPLOY_DIR/"

print_success "Files synced successfully"

# Create production environment file if it doesn't exist
print_status "Setting up production environment file..."
if ! ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "[ -f '$REMOTE_DEPLOY_DIR/apps/api/.env' ]"; then
    print_warning "Production .env file not found, creating from template..."
    ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" << EOF
        cp $REMOTE_DEPLOY_DIR/apps/api/.env.production $REMOTE_DEPLOY_DIR/apps/api/.env
        echo ""
        echo "⚠️  IMPORTANT: Please update the following values in $REMOTE_DEPLOY_DIR/apps/api/.env:"
        echo "   - SECRET_KEY (generate a secure secret key)"
        echo "   - ADMIN_SECRET (generate a secure admin secret)"
        echo "   - GEMINI_API_KEY (your Gemini API key)"
        echo "   - OPENROUTER_API_KEY (your OpenRouter API key)"
        echo ""
        echo "Edit the file with: nano $REMOTE_DEPLOY_DIR/apps/api/.env"
EOF
else
    print_success "Production .env file already exists"
fi

# Build and start services
print_status "Building and starting Docker services..."
ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" << EOF
    cd $REMOTE_DEPLOY_DIR

    # Build the backend image
    docker-compose -f docker-compose.backend.yml build backend

    # Start the services
    docker-compose -f docker-compose.backend.yml up -d

    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30
EOF

print_success "Docker services started"

# Verify deployment
print_status "Verifying deployment..."
HEALTH_CHECK_URL="http://$OCI_SERVER_IP:8002/chess/health"
MAX_RETRIES=12
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_success "Health check passed! Backend is responding."
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            print_error "Health check failed after $MAX_RETRIES attempts"
            echo ""
            echo "Troubleshooting steps:"
            echo "1. Check service status: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml ps'"
            echo "2. Check logs: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml logs'"
            echo "3. Verify environment variables are correctly set"
            exit 1
        else
            print_status "Health check attempt $RETRY_COUNT/$MAX_RETRIES - waiting 10 seconds..."
            sleep 10
        fi
    fi
done

# Configure firewall (if needed)
print_status "Checking firewall configuration..."
ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" << 'EOF'
    # Check if UFW is active
    if sudo ufw status | grep -q "Status: active"; then
        echo "UFW is active, checking rules..."

        # Allow HTTP (80) and HTTPS (443) if not already allowed
        sudo ufw allow 80/tcp || echo "Port 80 already allowed or failed to add"
        sudo ufw allow 443/tcp || echo "Port 443 already allowed or failed to add"

        # Allow backend port (8002)
        sudo ufw allow 8002/tcp || echo "Port 8002 already allowed or failed to add"

        echo "Firewall rules updated"
    else
        echo "UFW is not active or not available"
    fi
EOF

print_success "Firewall configuration completed"

# Display deployment summary
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   🌐 Backend URL: http://$OCI_SERVER_IP:8002"
echo "   🏥 Health Check: http://$OCI_SERVER_IP:8002/chess/health"
echo "   🔗 GraphQL: http://$OCI_SERVER_IP:8002/chess/graphql"
echo "   📊 Database: PostgreSQL on port 5434"
echo ""
echo "📝 Next Steps:"
echo "   1. Update environment variables: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'nano $REMOTE_DEPLOY_DIR/apps/api/.env'"
echo "   2. Run database migrations: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR/apps/api && source ../venv/bin/activate && alembic upgrade head'"
echo "   3. Test the GraphQL playground at the URL above"
echo "   4. Monitor logs: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml logs -f'"
echo ""
echo "🔧 Useful Commands:"
echo "   Check status: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml ps'"
echo "   View logs: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml logs'"
echo "   Restart services: ssh -i $SSH_KEY $SSH_USER@$OCI_SERVER_IP 'cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml restart'"
echo ""
print_success "Elucidate Chess backend is now running on OCI! 🚀"