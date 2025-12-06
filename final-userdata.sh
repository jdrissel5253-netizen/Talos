#!/bin/bash
# Install Node.js
dnf install -y nodejs npm unzip

# Download and extract backend
cd /home/ec2-user
aws s3 cp s3://talos-hvac-frontend-1759612745/ec2-deploy/talos-backend.zip .
unzip -o talos-backend.zip
chown -R ec2-user:ec2-user /home/ec2-user

# Install dependencies as root (will be owned by ec2-user)
cd /home/ec2-user
su - ec2-user -c 'cd /home/ec2-user && npm install --production'

# Install PM2
npm install -g pm2

# Create .env
cat > /home/ec2-user/.env << 'ENVEOF'
NODE_ENV=production
PORT=8080
DB_HOST=talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=talos_db
DB_USER=talos_admin
DB_PASSWORD=TalosAdmin2024!Secure
ENVEOF

chown ec2-user:ec2-user /home/ec2-user/.env

# Start with PM2 as ec2-user
su - ec2-user -c 'cd /home/ec2-user && pm2 start server.js --name talos-backend && pm2 save'

# Setup startup
env PATH=$PATH:/usr/bin /usr/local/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user
