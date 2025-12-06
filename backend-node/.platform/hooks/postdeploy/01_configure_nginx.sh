#!/bin/bash

# Remove default nginx config that shows the sample app
rm -f /etc/nginx/conf.d/elasticbeanstalk/*.conf

# Create our custom proxy configuration
cat > /etc/nginx/conf.d/elasticbeanstalk/00_application.conf <<'EOF'
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

# Reload nginx
systemctl reload nginx
