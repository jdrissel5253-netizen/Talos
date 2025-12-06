#!/bin/bash
set -e

cd /home/ec2-user

# Wait for user data script to complete
sleep 120

# Download and extract code
aws s3 cp s3://talos-hvac-frontend-1759612745/ec2-deploy/talos-backend.zip .
unzip -o talos-backend.zip

# Install dependencies
npm install --production

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
USE_POSTGRES=true
DB_HOST=YOUR_DB_HOST_HERE
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_DB_PASSWORD_HERE
DB_SSL=true
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE
JWT_SECRET=YOUR_JWT_SECRET_HERE
PORT=8080
EOF

# Start with PM2
pm2 start server.js --name talos-backend
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | sudo bash

echo "Deployment complete! Backend running on port 8080"
