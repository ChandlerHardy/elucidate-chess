#!/bin/bash

# Elucidate Chess Backend Restart Utility
# Quick restart script for running on OCI instance
#
# Usage: ./restart-backend.sh
# Requires OCI_SERVER_IP environment variable to be set
#
# Example: export OCI_SERVER_IP=123.45.67.89 && ./restart-backend.sh

set -e

# Configuration
PROJECT_NAME="elucidate-chess"
REMOTE_DEPLOY_DIR="/opt/$PROJECT_NAME"
SSH_USER="ubuntu"
SSH_KEY="$HOME/.ssh/id_rsa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "  ./restart-backend.sh"
    echo ""
    echo "Or in one command:"
    echo "  OCI_SERVER_IP=123.45.67.89 ./restart-backend.sh"
    exit 1
fi

print_status "Restarting $PROJECT_NAME backend on $OCI_SERVER_IP"

# Test SSH connection
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$OCI_SERVER_IP" "echo 'SSH connection successful'"; then
    print_error "Cannot connect to OCI server"
    exit 1
fi

print_status "Checking current service status..."
ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml ps"

print_status "Restarting backend services..."
ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml restart backend"

print_status "Waiting for services to restart..."
sleep 15

# Verify health
print_status "Checking service health..."
HEALTH_CHECK_URL="http://$OCI_SERVER_IP:8002/chess/health"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_success "Backend restarted successfully! Health check passed."
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            print_error "Health check failed after restart. Checking logs..."
            ssh -i "$SSH_KEY" "$SSH_USER@$OCI_SERVER_IP" "cd $REMOTE_DEPLOY_DIR && docker-compose -f docker-compose.backend.yml logs --tail=50 backend"
            exit 1
        else
            print_status "Health check attempt $RETRY_COUNT/$MAX_RETRIES - waiting 5 seconds..."
            sleep 5
        fi
    fi
done

print_success "🎉 $PROJECT_NAME backend restarted successfully!"
echo ""
echo "📋 Service Status:"
echo "   🌐 Backend: http://$OCI_SERVER_IP:8002"
echo "   🏥 Health: http://$OCI_SERVER_IP:8002/chess/health"
echo "   🔗 GraphQL: http://$OCI_SERVER_IP:8002/chess/graphql"