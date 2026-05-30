# ⚡ Boltfy Form Builder

**Boltfy** is a modern, premium, drag-and-drop form builder that allows creators and businesses to build beautiful forms, manage subscribers, orchestrate email campaigns, and track real-time analytics. Built with Vite, React, TypeScript, Tailwind CSS, and powered by Supabase.

---

## ✨ Features

- **📊 Dashboard Analytics**: View real-time form submissions, response rates, and conversion metrics.
- **📝 Drag & Drop Form Builder**: Add, edit, remove, and reorder fields (text inputs, textareas, checkboxes, buttons, etc.).
- **🔐 Secure Authentication**: Integrated user registration, login, and secure session management powered by Supabase Auth.
- **🏷️ Subscriber Management**: CRUD operations for form respondents, categorizing them as active or unsubscribed.
- **📧 Campaigns & Broadcasts**: Compose and send newsletters/broadcasts directly to active subscribers.
- **🎨 Email Templates Editor**: Design responsive email layouts using a drag-and-drop builder with predefined content blocks.
- **🖥️ Responsive Layout**: Sidebar navigation collapses cleanly, adapting layouts perfectly for both desktop and mobile viewports.

---

## 🏗️ Architecture & Directory Structure

```
form-flow-main/
├── src/
│   ├── components/       # Reusable components
│   │   ├── auth/         # Login, Signup, ProtectedRoute components
│   │   ├── dashboard/    # Analytics charts and summaries
│   │   ├── forms/        # Form editors and preview panels
│   │   ├── layout/       # Sidebar, Footer, Header, BrandLogo, and SEO wrappers
│   │   ├── templates/    # Email builder drag-and-drop block editors
│   │   └── ui/           # Radix-ui + Shadcn primitive UI widgets
│   ├── contexts/         # React Contexts (AuthContext for user state)
│   ├── hooks/            # Custom hooks (e.g. use-toast)
│   ├── integrations/     # Third-party API client hooks (Supabase type declarations)
│   ├── lib/              # Utility helper libraries (cn, security checks)
│   ├── pages/            # Application screens (routed in App.tsx)
│   ├── App.tsx           # Router layout and global context providers
│   └── main.tsx          # Application entrypoint
├── index.html            # Core HTML template with SEO configurations
├── tailwind.config.ts    # Design tokens, colors, transitions
└── vite.config.ts        # Bundler configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the project with the following environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Email Sending Service (Resend API)
VITE_RESEND_API_KEY="your-resend-api-key"

# App URL Configuration
VITE_APP_URL="http://localhost:8081" # Or your production domain
```

---

## 🗄️ Database Setup (Supabase)

To support the features in Boltfy, ensure the following tables exist in your Supabase database:

1. **`custom_forms`**: Holds the schema and configuration for user-created forms.
2. **`form_submissions`**: Stores responses/inputs gathered from forms.
3. **`subscribers`**: Contact details for respondents who opt in.
4. **`campaigns`**: Records email newsletters/broadcast metadata and status.
5. **`email_templates`**: Saves drag-and-drop block schemas for email layout templates.

---

## 🚀 Local Development Setup

Follow these steps to run the application locally:

### 1. Clone the project
```bash
git clone git@github.com:hemoyt/boltfy.git
cd boltfy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
The application will launch on your configured local port (typically `http://localhost:8080` or `http://localhost:8081`).

---

## 📦 Production Build & Deployment

To prepare the application for production deployment:

```bash
npm run build
```
This builds and compiles static assets into the `/dist` directory.

### 🌐 Deploying to Hostinger (hPanel / FTP)

1. **Build the project**: Run `npm run build` locally.
2. **Access Hostinger hPanel**: Log in and open the **File Manager** for your domain.
3. **Upload Files**: Copy the contents of the `dist/` directory (including `.htaccess`) and drop them directly inside the `public_html/` folder.
4. **Setup redirect rules**: Ensure the `.htaccess` file is present in the root folder to handle React Router client-side routing:
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

### ☁️ Deploying to Vercel / Netlify

1. Connect your GitHub repository to Vercel/Netlify.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add your environment variables (VITE_SUPABASE_URL, etc.) in the platform dashboard.
4. Deploy!

---

## 🤝 Contribution Guidelines
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/awesome-feature`.
3. Make changes and run type checks: `npx tsc --noEmit`.
4. Commit and push: `git push origin feature/awesome-feature`.
5. Open a Pull Request.
