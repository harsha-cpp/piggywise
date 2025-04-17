# Vercel Deployment Instructions for PiggyWise

## Prerequisites
- GitHub account (for connecting repository to Vercel)
- Vercel account (sign up at https://vercel.com)
- Repository pushed to GitHub

## Step 1: Connect Your Repository to Vercel

1. Log in to Vercel (https://vercel.com)
2. Click "Add New..." and select "Project"
3. Import your GitHub repository containing the PiggyWise project
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `prisma generate && next build`
   - Output Directory: .next

## Step 2: Configure Environment Variables

Add the following environment variables (copy from `.env.production`):

```
DATABASE_URL="postgresql://neondb_owner:npg_BMSk6cPCb5Rq@ep-lingering-night-a15hf4pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_BMSk6cPCb5Rq@ep-lingering-night-a15hf4pi.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="iQkGi+5pApz6pRE+cjDIc8xkbZdxw7M+l+X0D3I7xdY="
NEXTAUTH_URL="https://piggywise.vercel.app"
RESEND_API_KEY="re_Ji8saSQP_4kJWnNyR6q9VGPLuabL5bqQU"
RESEND_FROM_EMAIL="onboarding@resend.dev"
CLOUDINARY_CLOUD_NAME=dwxsrko1g
CLOUDINARY_API_KEY=764797368616464
CLOUDINARY_API_SECRET=XZfmiizy5E3SwlCTXtXtwWfKXGk
ADMIN_EMAILS=parent@test.com
```

Note: Make sure to update the `NEXTAUTH_URL` to match your Vercel deployment URL once it's deployed.

## Step 3: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete

## Step 4: Verify Deployment

1. Click the deployment URL to open your application
2. Test the following functionality:
   - User registration/login
   - Parent and child dashboards
   - Module creation and assignment
   - Task creation and completion
   - Database connections through the app

## Step 5: Configure Custom Domain (Optional)

1. Go to the "Domains" section of your project settings
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update the `NEXTAUTH_URL` environment variable to your custom domain

## Troubleshooting

If you encounter database connection issues:
1. Verify that the Neon connection strings are correct
2. Check that the database is accessible (not behind a firewall)
3. Ensure the Prisma schema matches the database schema

If you encounter build errors:
1. Check the build logs for specific error messages
2. Verify that all dependencies are correctly installed
3. Check for any NextAuth configuration issues

## Updating Your Deployment

For future updates:
1. Push changes to your GitHub repository
2. Vercel will automatically detect changes and redeploy
3. If you've made schema changes, you may need to apply them to the production database:
   ```bash
   # Temporarily use production env vars
   cp .env.production .env
   npx prisma db push
   # Restore local env vars
   mv .env.local .env
   ``` 