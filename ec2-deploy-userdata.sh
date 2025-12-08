#!/bin/bash
set -e

# Update system
yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# Install PM2 globally
npm install -g pm2

# Clone the repository
cd /home/ec2-user
git clone https://github.com/jdrissel5253-netizen/Talos.git talos-backend
cd talos-backend/backend-node

# Install dependencies
npm install --production

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8081
ANTHROPIC_API_KEY=YOUR_API_KEY_REPLACE_THIS
JWT_SECRET=your-jwt-secret-replace-this
EOF

# Fix permissions
chown -R ec2-user:ec2-user /home/ec2-user/talos-backend

# Start with PM2 as ec2-user
sudo -u ec2-user pm2 start server.js --name talos-backend
sudo -u ec2-user pm2 save
sudo -u ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Configure PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "Talos backend deployed successfully!"
