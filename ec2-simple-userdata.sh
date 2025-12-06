#!/bin/bash
dnf install -y nodejs npm unzip
cd /home/ec2-user
aws s3 cp s3://talos-hvac-frontend-1759612745/ec2-deploy/talos-backend.zip .
unzip -o talos-backend.zip
chown -R ec2-user:ec2-user /home/ec2-user
aws s3 cp s3://talos-hvac-frontend-1759612745/ec2-deploy/deploy-backend.sh .
chmod +x deploy-backend.sh
./deploy-backend.sh > /var/log/talos-deploy.log 2>&1
