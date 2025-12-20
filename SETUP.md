# Kreeate Setup Guide

## 🎉 Overview

Your issue creator has been transformed into a **multi-user public application** with GitHub OAuth authentication! Users can now sign in with their GitHub accounts and create issues in their own repositories.

---

## 📋 What Was Implemented

### Phase 1: Database Setup
- ✅ Installed Drizzle ORM, NextAuth, and Neon PostgreSQL driver
- ✅ Created database schema with auth tables and user preferences
- ✅ Configured Drizzle client and migration setup

### Phase 2: Authentication
- ✅ Configured NextAuth.js v5 with GitHub OAuth provider
- ✅ Created API route handlers for authentication
- ✅ Added TypeScript type definitions for sessions

### Phase 3: API Routes
- ✅ Created `/api/repos` - fetches user's GitHub repositories
- ✅ Created `/api/preferences` - fetches/stores user preferences
- ✅ Updated `/api/submit` - creates issues with user's token in selected repo

### Phase 4: UI Components
- ✅ Created auth components (sign-in, sign-out, user profile)
- ✅ Created repository selector with dropdown + manual input modes
- ✅ Updated main page with authentication flow

---

## 🚀 Initial Setup (Required Steps)

### 1. Set Up Neon Database

1. Go to [https://neon.tech](https://neon.tech)
2. Create a new project (free tier is fine for development)
3. Copy your connection string
4. Save it for the environment variables step

### 2. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Kreeate` (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy your **Client ID**
6. Generate a new **Client Secret** and copy it

### 3. Configure Environment Variables

Create `.env.local` in your project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret_here"

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# OpenRouter (your existing key)
OPENROUTER_API_KEY="your_existing_openrouter_key"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

```bash
# Generate migration files from schema
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the sign-in page!

---

## 📖 How It Works

### User Flow

1. **User visits the app** → Sees sign-in page with GitHub button
2. **Signs in with GitHub** → OAuth flow, grants `repo` scope for full access
3. **Selects a repository** → 
   - **Dropdown mode**: Shows list of their accessible repos
   - **Manual mode**: Type `owner/repo-name` format
4. **Creates an issue** → 
   - Describes the bug/feature
   - AI generates formatted issue
   - User reviews and edits
   - Submits to selected repo
5. **Last repo is remembered** → Next time, their last selection is pre-filled

### Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─ NextAuth.js (Session Management)
       │  └─ GitHub OAuth
       │
       ├─ /api/generate (OpenRouter AI)
       │
       ├─ /api/repos (Fetch user's repos)
       │
       ├─ /api/preferences (User settings)
       │
       └─ /api/submit (Create GitHub issue)
          └─ Uses user's OAuth token
```

---

## 🔑 Key Features

- **GitHub OAuth authentication** with NextAuth.js
- **Per-user access tokens** (no more hardcoded credentials!)
- **Repository selection** with dropdown + manual input fallback
- **Last repo memory** (stored in PostgreSQL database)
- **User profile display** with avatar and sign-out
- **Full type safety** with TypeScript
- **Error handling** for auth, API calls, and repo access
- **Responsive design** (mobile-friendly)

---

## 🗄️ Database Schema

The application uses these tables:

### Auth Tables (NextAuth.js)
- **users** - User profiles (id, name, email, image, emailVerified)
- **accounts** - OAuth connections (includes GitHub access_token)
- **sessions** - User sessions (sessionToken, expires)
- **verification_tokens** - Email verification tokens
- **authenticators** - WebAuthn/Passkey support

### Custom Tables
- **user_preferences** - Stores last selected repository per user

---

## 🔒 Security Features

- ✅ **Access tokens stored securely** in database (never exposed to client)
- ✅ **Sessions validated** on every API request
- ✅ **CSRF protection** via NextAuth
- ✅ **Repository access validation** before issue creation
- ✅ **Environment variables** properly separated from code
- ✅ **OAuth scope**: `repo` for full access (public and private repos)

---

## 🗑️ Environment Variables to Remove

You can now **delete these** from your `.env` file (no longer needed):

- ~~`GITHUB_TOKEN`~~ - Now per-user via OAuth
- ~~`GITHUB_OWNER`~~ - Now selected by user
- ~~`GITHUB_REPO`~~ - Now selected by user

Keep only:
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `GITHUB_ID`
- ✅ `GITHUB_SECRET`
- ✅ `OPENROUTER_API_KEY`

---

## 🐛 Troubleshooting

### "Unauthorized" Error

**Symptoms**: Can't sign in or API requests fail with 401

**Solutions**:
- Check `.env.local` has all required variables
- Verify `NEXTAUTH_SECRET` is generated (run `openssl rand -base64 32`)
- Confirm GitHub OAuth app callback URL matches: `http://localhost:3000/api/auth/callback/github`
- Restart development server after changing env variables

### Database Connection Error

**Symptoms**: Error connecting to database

**Solutions**:
- Verify `DATABASE_URL` from Neon is correct
- Check the connection string includes `?sslmode=require`
- Ensure you ran migrations: `npx drizzle-kit migrate`
- Test connection in Neon dashboard

### GitHub OAuth Not Working

**Symptoms**: OAuth redirect fails or shows error

**Solutions**:
- Verify `GITHUB_ID` and `GITHUB_SECRET` are correct
- Check callback URL in GitHub OAuth app settings
- Ensure `NEXTAUTH_URL` matches your current URL (http://localhost:3000)
- Make sure you're using the OAuth App (not GitHub App)

### "Failed to fetch repositories"

**Symptoms**: Repository dropdown shows error

**Solutions**:
- Check your GitHub OAuth token has `repo` scope
- Try signing out and signing in again
- Verify the user has access to at least one repository
- Check browser console for detailed error messages

### Migration Errors

**Symptoms**: `npx drizzle-kit migrate` fails

**Solutions**:
- Ensure `DATABASE_URL` is set correctly
- Check database is accessible from your machine
- Try: `npx drizzle-kit push` to sync schema directly
- Verify Neon database is active (free tier doesn't sleep)

---

## 🚢 Deploying to Production

### 1. Prepare GitHub OAuth App for Production

1. Go to your GitHub OAuth App settings
2. Update or add the production callback URL:
   ```
   https://yourdomain.com/api/auth/callback/github
   ```
3. You can have both localhost and production URLs

### 2. Set Up Production Database

Option A: Use Neon production database
- Create a new Neon project for production
- Or use the same project with a different database

Option B: Use existing Neon database
- Same database as dev is fine for small apps
- Consider separate databases for production best practices

### 3. Configure Deployment Platform

#### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables in **Settings → Environment Variables**:
   ```env
   DATABASE_URL="your_production_neon_url"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="generate_new_secret_for_production"
   GITHUB_ID="your_github_client_id"
   GITHUB_SECRET="your_github_client_secret"
   OPENROUTER_API_KEY="your_openrouter_key"
   ```
3. Deploy!

#### Netlify

1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in **Site settings → Environment variables**
5. Deploy!

### 4. Run Migrations on Production Database

```bash
# Point to production database
DATABASE_URL="your_production_url" npx drizzle-kit migrate
```

Or use Drizzle Studio:
```bash
npx drizzle-kit studio
```

### 5. Test Production Deployment

1. Visit your production URL
2. Sign in with GitHub
3. Test creating an issue
4. Verify issue appears in selected repository

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate database migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio

# Check types
npx tsc --noEmit

# Lint code
npm run lint
```

---

## 📂 Project Structure

```
ftb-kreeate/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handlers
│   │   ├── generate/route.ts            # AI generation
│   │   ├── repos/route.ts               # Fetch user repos
│   │   ├── preferences/route.ts         # User preferences
│   │   └── submit/route.ts              # Create GitHub issue
│   ├── layout.tsx                       # Root layout with providers
│   └── page.tsx                         # Main page with auth
├── components/
│   ├── auth/
│   │   ├── sign-in-button.tsx          # GitHub sign-in
│   │   ├── sign-out-button.tsx         # Sign out
│   │   └── user-profile.tsx            # User info display
│   ├── repo-selector.tsx               # Repository picker
│   ├── providers.tsx                   # SessionProvider wrapper
│   └── ui/                             # shadcn components
├── drizzle/
│   ├── schema.ts                       # Database schema
│   └── migrations/                     # Auto-generated migrations
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── db.ts                           # Drizzle client
│   └── utils.ts                        # Utilities
├── types/
│   └── github.ts                       # GitHub API types
├── drizzle.config.ts                   # Drizzle configuration
├── .env.local.example                  # Environment template
└── SETUP.md                            # This file
```

---

## 🎯 What Changed From Original

### Removed
- ❌ Hardcoded `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` environment variables
- ❌ Direct GitHub API calls without user authentication
- ❌ Single repository limitation

### Added
- ✅ NextAuth.js integration with GitHub OAuth
- ✅ Drizzle ORM + Neon PostgreSQL database
- ✅ User authentication flow with sign-in/sign-out
- ✅ Repository selection UI (dropdown + manual input)
- ✅ User preferences storage (remember last repo)
- ✅ Auth components and session providers
- ✅ Per-user access token management
- ✅ Multi-repository support

---

## 🔄 Updating the Application

### Adding New Features

1. Update database schema in `drizzle/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Apply migration: `npx drizzle-kit migrate`
4. Update API routes and components as needed

### Updating Dependencies

```bash
# Update all dependencies
npm update

# Update specific package
npm update next-auth

# Check for outdated packages
npm outdated
```

---

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 💡 Tips

- **Use Drizzle Studio** to visualize and manage your database: `npx drizzle-kit studio`
- **Test OAuth locally** before deploying to production
- **Keep separate databases** for development and production
- **Rotate secrets regularly** for production environments
- **Monitor Neon usage** on free tier (500MB storage, 100 hours compute/month)

---

## ❓ FAQ

**Q: Can users create issues in private repositories?**  
A: Yes! The `repo` OAuth scope grants access to both public and private repositories.

**Q: How many users can the app support?**  
A: Unlimited! Each user authenticates with their own GitHub account.

**Q: Is user data secure?**  
A: Yes. Access tokens are stored encrypted in the database and never exposed to the client.

**Q: Can I customize the priority labels?**  
A: Yes! Edit `PRIORITY_LABELS` array in `app/page.tsx`.

**Q: How do I add more OAuth providers?**  
A: Add them to the `providers` array in `lib/auth.ts` (e.g., Google, Discord).

**Q: What if a user's GitHub token expires?**  
A: GitHub OAuth tokens don't expire by default. If needed, implement token refresh in `lib/auth.ts`.

---

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review environment variables
3. Check browser console for errors
4. Review server logs
5. Verify database migrations are applied

---

**Happy Coding! 🚀**
