#!/bin/bash
set -ex

cd /home/ec2-user

# Install dependencies
sudo -u ec2-user npm install --production

# Install PM2
npm install -g pm2

# Create .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DB_HOST=talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=talos_db
DB_USER=talos_admin
DB_PASSWORD=TalosAdmin2024!Secure
EOF

chown ec2-user:ec2-user .env

# Start with PM2
sudo -u ec2-user bash -c 'cd /home/ec2-user && pm2 delete all || true && pm2 start server.js --name talos-backend && pm2 save'

# Setup PM2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user -n
systemctl enable pm2-ec2-user
systemctl start pm2-ec2-user

echo "Backend deployed successfully!"
