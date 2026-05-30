# Hostinger Deployment - Boltfy Form Builder

## Prerequisites
- Hostinger Web Hosting account (Premium or Business recommended)
- Access to hPanel (Hostinger's control panel)
- FTP client (FileZilla) or use Hostinger's File Manager

---

## Method 1: Using Hostinger File Manager (Easiest)

### Step 1: Build Your Application
Run this command in your project folder:
```bash
npm run build
```
This creates a `dist` folder with your production files.

### Step 2: Create .htaccess File
The `.htaccess` file (already created in dist folder) is essential for React routing.

### Step 3: Upload to Hostinger

1. **Login to hPanel**: Go to https://hpanel.hostinger.com
2. **Navigate to File Manager**: Click "File Manager" in your dashboard
3. **Open public_html folder**: This is your website's root directory
4. **Delete existing files** (if any): Remove default index.html files
5. **Upload dist contents**:
   - Click "Upload"
   - Select ALL files from your local `dist` folder
   - Upload them directly to `public_html`
   - **Important**: Upload the CONTENTS of `dist`, not the folder itself

### Step 4: Update Environment Variables

Since Hostinger doesn't support server-side env vars for static sites, your env vars are already bundled in the build. 

**For production, update your `.env` before building:**
```env
VITE_APP_URL="https://yourdomain.com"
```

Then rebuild: `npm run build`

---

## Method 2: Using FTP (FileZilla)

### Step 1: Get FTP Credentials
1. Login to hPanel
2. Go to **Files** → **FTP Accounts**
3. Note your:
   - FTP Host (ftp.yourdomain.com)
   - Username
   - Password
   - Port (usually 21)

### Step 2: Connect with FileZilla
1. Download FileZilla: https://filezilla-project.org
2. Open FileZilla
3. Enter your credentials:
   - Host: ftp.yourdomain.com
   - Username: your_ftp_username
   - Password: your_ftp_password
   - Port: 21
4. Click "Quickconnect"

### Step 3: Upload Files
1. Navigate to `public_html` on the remote side (right panel)
2. Navigate to your `dist` folder on the local side (left panel)
3. Select all files in `dist` and drag them to `public_html`
4. Wait for upload to complete

---

## Method 3: Using Git (Advanced)

If you want automatic deployments:

### Step 1: Enable Git in hPanel
1. Go to **Advanced** → **Git**
2. Create a new repository
3. Clone URL will be provided

### Step 2: Add Hostinger as Remote
```bash
git remote add hostinger ssh://your-username@yourdomain.com/home/username/public_html
git push hostinger main
```

Note: This deploys source code, you'll need to build on server or set up CI/CD.

---

## Post-Deployment Checklist

### ✅ 1. Test Your Website
Visit https://yourdomain.com and verify:
- [ ] Homepage loads correctly
- [ ] Navigation works (React Router)
- [ ] Login/Signup works
- [ ] Forms can be created
- [ ] Form submissions work

### ✅ 2. Enable SSL/HTTPS
1. In hPanel, go to **Security** → **SSL**
2. Click "Setup" for free Let's Encrypt SSL
3. Wait for activation (up to 24 hours)

### ✅ 3. Update Supabase Settings
In your Supabase project dashboard:
1. Go to **Settings** → **Authentication**
2. Add your domain to "Site URL": `https://yourdomain.com`
3. Add to "Redirect URLs":
   - `https://yourdomain.com`
   - `https://yourdomain.com/dashboard`

### ✅ 4. Update Resend Settings (for Email)
In Resend dashboard:
1. Add and verify your domain
2. Update "From" email if needed

---

## Troubleshooting

### 404 Error on Page Refresh
If you get 404 when refreshing pages, make sure `.htaccess` is uploaded:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Blank White Page
- Check browser console for errors
- Ensure all files uploaded correctly
- Verify paths in index.html

### Supabase Connection Issues
- Check your Supabase URL is correct
- Verify API keys are properly set
- Check Supabase project is active

---

## Folder Structure After Upload

Your `public_html` should look like:
```
public_html/
├── .htaccess
├── index.html
├── icon.png
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... other assets
└── ... other files
```

---

## Need Help?

- Hostinger Support: https://www.hostinger.com/cpanel-login
- Supabase Docs: https://supabase.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
