#!/bin/bash
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting Talos backend deployment..."

# Update and install Node.js
sudo yum update -y
sudo yum install -y nodejs npm unzip

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/talos-backend
cd /home/ec2-user/talos-backend

# Download code from S3
aws s3 cp s3://talos-hvac-frontend-1759612745/ec2-deploy/talos-backend.zip .
unzip -o talos-backend.zip
rm talos-backend.zip

# Install dependencies
npm install --production

# Create .env file
cat > .env << 'ENVEOF'
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
ENVEOF

# Fix permissions
chown -R ec2-user:ec2-user /home/ec2-user/talos-backend

# Start app as ec2-user
sudo -u ec2-user bash << 'USEREOF'
cd /home/ec2-user/talos-backend
pm2 start server.js --name talos-backend
pm2 save
USEREOF

# Setup PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user

echo "Deployment complete!"
