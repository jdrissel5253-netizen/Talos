# Talos Platform - AWS Deployment Guide

## 🎯 What to Tell Claude for AWS Deployment

**Simple command:**
```
"Deploy the Talos backend to AWS using the simplest method that will work.
The code is fixed and working locally - just needs proper cloud deployment."
```

## 📋 Current Status

### ✅ What's Ready
- **Backend Code**: Fixed and tested locally at `C:\Users\13019\talos-website\backend-node`
- **Frontend Code**: Built and ready at `C:\Users\13019\talos-website\frontend`
- **Database**: PostgreSQL RDS running at `talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com`
- **S3 Bucket**: `talos-hvac-frontend-1759612745`
- **Dependencies**: `better-sqlite3` is now optional (production uses PostgreSQL only)

### ⚠️ Known Issues (Solved in Code)
- ✅ **Fixed**: SQLite native compilation issue - moved to optional dependencies
- ✅ **Working**: Local development uses SQLite, production uses PostgreSQL
- ✅ **Tested**: Backend runs perfectly on Windows

## 🚀 Recommended AWS Deployment Approaches (in order)

### Option 1: AWS App Runner (RECOMMENDED - Easiest)
- Zero infrastructure management
- Direct deploy from code
- Automatic scaling
- ~5-10 minutes to deploy

### Option 2: Railway/Render (Alternative - Even Easier)
- Not AWS, but works immediately
- Free tier available
- GitHub integration
- ~3 minutes to deploy

### Option 3: EC2 with Proper Setup
- Use Amazon Linux 2023
- Install build tools: `sudo dnf install -y gcc-c++ make python3`
- Deploy with PM2 for process management
- Requires SSH access for debugging

### Option 4: Elastic Beanstalk (Skip for now)
- Had Nginx proxy issues on AL2023
- Code works, platform has configuration challenges
- Can revisit later

## 📦 What's in the Deployment Package

```
backend-node/
├── package.json          # Fixed: better-sqlite3 is optional
├── server.js             # Main app entry
├── config/
│   ├── database.js       # Auto-switches SQLite/PostgreSQL
│   └── database-pg.js    # PostgreSQL config for RDS
├── routes/               # API endpoints
├── services/             # Business logic
└── .env (create on server with):
    NODE_ENV=production
    PORT=8080
    DB_HOST=talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com
    DB_PORT=5432
    DB_NAME=talos_db
    DB_USER=talos_admin
    DB_PASSWORD=TalosAdmin2024!Secure
```

## 🔑 Key Files Changed Today

1. **package.json** - Moved `better-sqlite3` to `optionalDependencies`
2. **config/database.js** - Auto-detects production and uses PostgreSQL
3. **Frontend config.ts** - Points to localhost for dev, EB for production

## 🛠️ AWS Resources Already Created

```yaml
Database:
  Type: PostgreSQL RDS
  Endpoint: talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com
  Status: Available

Storage:
  Bucket: talos-hvac-frontend-1759612745
  Purpose: Frontend hosting and deployment packages

Networking:
  Security Group: sg-0a3757aa941729e72 (talos-backend-sg)
  Ports: 22, 80, 8080 open

IAM:
  Role: talos-ec2-role (with S3 and SSM access)
  Profile: talos-ec2-profile
```

## 🧪 Testing Checklist After Deployment

```bash
# 1. Test health endpoint
curl http://YOUR-BACKEND-URL/api/health

# 2. Test root endpoint
curl http://YOUR-BACKEND-URL/

# 3. Test specific API
curl http://YOUR-BACKEND-URL/api/resume/upload

# Expected responses should be JSON, not HTML
```

## 🐛 If Deployment Fails

**Check these in order:**

1. **Is it returning HTML instead of JSON?**
   - Nginx proxy issue
   - Solution: Try App Runner or different platform

2. **npm install failing?**
   - Missing build tools
   - Solution: `sudo dnf install -y gcc-c++ make python3`

3. **Module not found errors?**
   - Dependencies didn't install
   - Solution: Run `npm install --production` manually

4. **Database connection errors?**
   - Check .env file exists with correct RDS credentials
   - Verify security group allows EC2 → RDS connection

## 📝 Quick Start Script for Claude

Save this for next time:

```
Hi Claude,

I need to deploy my Talos backend to AWS. Last time we had issues with:
1. Elastic Beanstalk Nginx proxy not working
2. EC2 user data scripts failing
3. better-sqlite3 compilation issues

We fixed the code (better-sqlite3 is now optional). The app works perfectly locally.

Please use the simplest AWS deployment method (App Runner, Railway, or properly configured EC2).

Location: C:\Users\13019\talos-website\backend-node
Database: Already running (PostgreSQL RDS)
Goal: Get the backend accessible at a public URL

Let me know what approach you recommend before starting.
```

## 💡 Lessons Learned

1. **Platform matters**: Same code, different deployment results
2. **Native modules**: Optional dependencies prevent deployment blockers
3. **Configuration over complexity**: Simple Node.js deployment > over-engineered setup
4. **Debugging blind**: Cloud init logs with encoding issues = big time sink
5. **Local first**: Get it working locally, then deploy (we did this!)

---

**Created**: October 5, 2025
**Status**: Local development working ✅ | AWS deployment pending
**Next Step**: Use App Runner or Railway for quick cloud deployment
