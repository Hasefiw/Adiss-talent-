# 🚀 Git Deployment Guide - Plesk (No SSH Needed!)

**Deploy Addis Talent to Plesk using Git - The Easiest Way!**

---

## 📋 Table of Contents

1. [What You Need](#what-you-need)
2. [Step 1: Access Git Deployment in Plesk](#step-1-access-git-deployment-in-plesk)
3. [Step 2: Clone Repository](#step-2-clone-repository)
4. [Step 3: Create Database](#step-3-create-database)
5. [Step 4: Configure Environment](#step-4-configure-environment)
6. [Step 5: Install Dependencies](#step-5-install-dependencies)
7. [Step 6: Start Application](#step-6-start-application)
8. [Step 7: Test Your API](#step-7-test-your-api)
9. [Troubleshooting](#troubleshooting)

---

## ✅ What You Need

You only need:
- ✅ Plesk login (you already have this!)
- ✅ Your domain name
- ✅ Git deployment option in Plesk
- ✅ That's it!

---

## 🔑 Step 1: Access Git Deployment in Plesk

### **1.1: Login to Plesk**

1. Open browser and go to:
   ```
   https://your-domain.com:8443/
   ```
   OR
   ```
   https://your-server-ip:8443/
   ```

2. Enter your **username** and **password**

3. Click **Login**

### **1.2: Find Git Deployment Option**

Once logged in:

1. In left sidebar, click **Hosting & Subscriptions**

2. Select your **domain name**

3. Look for one of these sections:
   - **Git** (most common)
   - **Git Repository**
   - **Version Control**
   - **Developer Tools**

4. Click on the **Git** section

### **1.3: If You Don't See Git Option**

If Git is not visible:

1. Scroll down on the domain settings page
2. Look for **"Show more options"** or **"Additional options"**
3. Click to expand
4. Look for Git again

**If still not available:**
- Contact Ethio Telecom support
- Ask: "Can you enable Git deployment on my account?"
- They'll enable it (usually free)

---

## 📥 Step 2: Clone Repository

### **2.1: In Plesk Git Section**

1. Click on **Git** section in your domain settings

2. Look for button that says:
   - **"Clone Repository"**
   - **"Add Repository"**
   - **"New Repository"**

3. Click it

### **2.2: Enter Repository Details**

A form will appear. Fill in:

**Repository URL:**
```
https://github.com/Hasefiw/Adiss-talent-.git
```

**Branch:**
```
production-ready-refactor
```

**Path (where to clone):**
```
/home/yourdomainname/public_html/api
```

Or just leave default - Plesk will suggest one

### **2.3: Clone Options**

You might see options like:
- **Automatically deploy on commit** - Leave unchecked for now
- **Auto-update** - Leave unchecked for now

### **2.4: Click "Clone"**

Plask will download all your code from GitHub! ✅

⏳ **Wait 2-5 minutes** while it downloads

You'll see:
```
Cloning from: https://github.com/Hasefiw/Adiss-talent-.git
Branch: production-ready-refactor
Status: Completed ✓
```

---

## 🗄️ Step 3: Create Database

### **3.1: Go to Databases**

1. In Plesk sidebar, click **Databases**

2. Click **Add Database**

### **3.2: Fill Database Form**

**Database Name:**
```
adiss_talent
```

**Database Type:**
```
PostgreSQL (preferred) or MySQL
```

**Database User:**
```
adiss_user
```

**Password:**
```
Create a STRONG password and SAVE IT!
Example: MyS3cur3P@ssw0rd123!
```

### **3.3: Click "Create Database"**

Plask creates your database! ✅

### **3.4: Save Connection Info**

After creation, Plesk shows you:

```
Host: localhost
Port: 5432 (PostgreSQL) or 3306 (MySQL)
Database: adiss_talent
Username: adiss_user
Password: Your password
```

**IMPORTANT:** Save this information! You'll need it in Step 4.

---

## ⚙️ Step 4: Configure Environment

### **4.1: Go to File Manager**

1. In Plesk sidebar, click **File Manager**

2. Navigate to:
   ```
   /home/yourdomainname/public_html/api/
   ```
   (or wherever you cloned the repository)

### **4.2: Create .env File**

1. Look for `.env.example` file

2. Right-click → **Copy**

3. Name it: `.env`

4. Double-click `.env` to edit

### **4.3: Update Configuration**

Update the following values:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-domain.com,http://your-domain.com

# Database Configuration (from Step 3)
# For PostgreSQL:
DATABASE_URL=postgresql://adiss_user:YOUR_PASSWORD@localhost:5432/adiss_talent

# For MySQL (if you used MySQL):
# DATABASE_URL=mysql://adiss_user:YOUR_PASSWORD@localhost:3306/adiss_talent

# AI (Gemini) - Use test value for now
GEMINI_API_KEY=test-key-placeholder

# Payments (Telibir) - Use test value for now
TELIBIR_API_KEY=test-key-placeholder
TELIBIR_ACCOUNT=+251911381970

# Logging
LOG_LEVEL=info
```

**IMPORTANT Changes:**
- Replace `YOUR_PASSWORD` with database password from Step 3
- Replace `your-domain.com` with your actual domain
- Keep test API keys for now

### **4.4: Click "Save"**

✅ Configuration is saved!

---

## 📦 Step 5: Install Dependencies

Now Plesk needs to install your Node.js packages.

### **Option A: Using Plesk Terminal (If Available)**

1. In Plesk, look for **Terminal** or **Console**

2. If available, open it and run:
   ```bash
   cd /home/yourdomainname/public_html/api/
   npm install
   npm run build
   ```

### **Option B: Using Plesk Node.js Feature**

1. Go to **Hosting & Subscriptions**
2. Select your domain
3. Click **Node.js**
4. Plesk often auto-installs dependencies - check if already done

### **Option C: Contact Support**

If neither option works:

Email Ethio Telecom:
```
Subject: Need npm install on my Node.js app

Hello,

I've deployed a Node.js app to my Plesk hosting.
Can you please run these commands?

cd /home/yourdomainname/public_html/api/
npm install
npm run build

Thank you!
```

They can run it for you! (Usually free)

---

## 🚀 Step 6: Start Application

### **6.1: Check If Node.js is Enabled**

1. Go to **Hosting & Subscriptions**

2. Select your domain

3. Look for **Node.js** section

4. Make sure it shows:
   ```
   Node.js: Enabled ✓
   Version: 18 or higher
   Application Entry Point: src/index.js
   ```

5. If not enabled, click **Enable Node.js** and set it up

### **6.2: Plesk Auto-Starts Your App**

Once Node.js is enabled, Plesk automatically:

✅ Starts your application  
✅ Keeps it running  
✅ Restarts if it crashes  
✅ Restarts on server reboot  

You don't need to do anything! Plesk handles it. 🎉

### **6.3: Verify App is Running**

1. Wait **2-3 minutes** for Node.js to fully start

2. Check Node.js status in Plesk

3. You should see: **"Running" or "Active"** ✓

---

## 🧪 Step 7: Test Your API

### **7.1: Test from Browser**

Your API should be accessible at:

```
https://your-domain.com:3000/health
```

Or with subdomain:
```
https://api.your-domain.com/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-01T...",
  "database": "connected"
}
```

### **7.2: Test Other Endpoints**

Try these URLs in your browser:

**List Actors:**
```
https://your-domain.com:3000/api/actors
```

**API Root:**
```
https://your-domain.com:3000/api/
```

**Casting Calls:**
```
https://your-domain.com:3000/api/casting-calls
```

### **7.3: If You Get Port Error**

If you can't access port 3000:

**Solution 1: Use Plesk Reverse Proxy**

1. Go to **Apache & Nginx Settings**
2. Add reverse proxy:
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:3000/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```
3. Now access via:
   ```
   https://your-domain.com/api/health
   ```

---

## 🔧 Troubleshooting

### **Issue 1: "Application Not Starting"**

**Symptoms:** Node.js says "Stopped" or "Error"

**Fix:**
1. Check `.env` file - make sure it's configured correctly
2. Check database connection string is correct
3. Check database exists in Plesk Databases section
4. Restart Node.js in Plesk:
   - Go to Node.js section
   - Click **"Restart"**

### **Issue 2: "Database Connection Error"**

**Symptoms:** Getting error when API starts

**Fix:**
1. Verify database name: `adiss_talent`
2. Verify username: `adiss_user`
3. Verify password matches what you set
4. Check database host: should be `localhost`
5. Make sure database was created (Step 3)

**Test connection string:**
```
In Plesk, try this format:
postgresql://adiss_user:password@localhost:5432/adiss_talent
```

### **Issue 3: "Health Check Returns 500 Error"**

**Symptoms:** `/health` endpoint returns error

**Fix:**
1. Wait 5 minutes (app needs time to start)
2. Refresh browser (Ctrl+R or Cmd+R)
3. Check if database is running in Plesk
4. Restart Node.js application

### **Issue 4: "Port Already in Use"**

**Symptoms:** Error: "Port 3000 already in use"

**Fix:**
1. Change PORT in `.env` to:
   ```
   PORT=3001
   ```
2. Save `.env`
3. Restart Node.js in Plesk

### **Issue 5: "Git Clone Failed"**

**Symptoms:** Git deployment shows error

**Fix:**
1. Check internet connection is working
2. Verify GitHub repository URL is correct:
   ```
   https://github.com/Hasefiw/Adiss-talent-.git
   ```
3. Make sure branch exists:
   ```
   production-ready-refactor
   ```
4. Try cloning again
5. If still fails, contact Ethio Telecom support

### **Issue 6: "npm install Failed"**

**Symptoms:** Dependencies not installing

**Fix:**
1. Check Node.js version is 18+
2. Check disk space (might be full)
3. Try again
4. Contact Ethio Telecom support if persistent

---

## 📞 Getting Help

### **If Something Goes Wrong**

**Contact Ethio Telecom Support:**
```
Email: support@ethiotel.et
Phone: (check your hosting email)
```

**Tell them:**
```
"I deployed a Node.js application using Git to my Plesk hosting.
I need help with: [describe issue]

Domain: your-domain.com
Repository: https://github.com/Hasefiw/Adiss-talent-.git
Branch: production-ready-refactor

Thank you!"
```

### **Check Logs**

In Plesk, look for:
- **Node.js logs** - Hosting & Subscriptions → Node.js → Logs
- **Error logs** - File Manager → Logs folder
- **Access logs** - File Manager → Logs folder

---

## ✅ Verification Checklist

Before declaring success:

- [ ] Repository cloned successfully
- [ ] Database created
- [ ] `.env` file configured
- [ ] npm install completed (or Plesk did it)
- [ ] Node.js is enabled
- [ ] Node.js shows "Running" status
- [ ] Can access `/health` endpoint
- [ ] Health check returns `"status": "healthy"`
- [ ] Can access `/api/actors` endpoint
- [ ] All endpoints respond correctly

---

## 🎉 Success!

Your Addis Talent API is now live!

**Access your API at:**
```
https://your-domain.com:3000/
```

Or with reverse proxy:
```
https://your-domain.com/api/
```

---

## 🚀 Next Steps

### **Phase 1: Testing (Now)**
- ✅ Test all API endpoints
- ✅ Verify database works
- ✅ Check error handling

### **Phase 2: Configuration**
- [ ] Add real Gemini API key
- [ ] Add real Telibir API key
- [ ] Configure email notifications
- [ ] Set up SSL certificate

### **Phase 3: Frontend**
- [ ] Build React frontend
- [ ] Deploy to `/home/yourdomainname/public_html/app/`
- [ ] Configure reverse proxy for frontend
- [ ] Test full application

### **Phase 4: Production**
- [ ] Enable monitoring
- [ ] Set up backups
- [ ] Configure CDN
- [ ] Launch to users!

---

## 💡 Pro Tips

1. **Keep Backups** - Download your files regularly
2. **Monitor Logs** - Check logs weekly
3. **Update API Keys** - Replace test keys with real ones
4. **Monitor Traffic** - Watch for unusual activity
5. **Test Regularly** - Test API endpoints weekly

---

## 📝 Quick Reference

| What | Where | How |
|------|-------|-----|
| Clone Git | Hosting & Subscriptions → Git | Click Clone Repository |
| Create DB | Databases → Add Database | Fill form, click Create |
| Edit .env | File Manager → .env | Double-click to edit |
| Start App | Hosting & Subscriptions → Node.js | Enable Node.js |
| Test API | Browser | Visit https://your-domain.com:3000/health |
| View Logs | File Manager → Logs | Open log files |
| Get Help | Email/Phone | Contact Ethio Telecom |

---

**🎬 Made with ❤️ for African Talent**

*Last Updated: August 1, 2026*