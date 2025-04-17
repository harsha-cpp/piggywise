# Deployment Checklist for PiggyWise

## Pre-Deployment Steps

### 1. Database Setup with Neon
- [ ] Sign up for a Neon account at https://neon.tech
- [ ] Create a new project in Neon
- [ ] Create a PostgreSQL database
- [ ] Obtain the database connection string
- [ ] Update `.env.production` with the actual Neon connection string
- [ ] Test the database connection locally using:
  ```bash
  # Export the production env vars temporarily
  export $(grep -v '^#' .env.production | xargs)
  npx prisma db pull
  ```

### 2. Update Schema for Neon Compatibility
- [x] Add `directUrl` to Prisma schema
- [ ] Deploy schema to Neon:
  ```bash
  # Using your production env variables
  npx prisma migrate deploy
  # OR
  npx prisma db push
  ```

### 3. Production Environment Variables
- [ ] Update `.env.production` with:
  - [ ] Real Neon connection strings (DATABASE_URL and DIRECT_URL)
  - [ ] Production NEXTAUTH_URL 
  - [ ] Verify all other environment variables

## Vercel Deployment

### 1. Connect to Vercel
- [ ] Install Vercel CLI (if not using the dashboard)
  ```bash
  npm i -g vercel
  ```
- [ ] Login to Vercel
  ```bash
  vercel login
  ```
- [ ] Link to existing project or create a new one
  ```bash
  vercel link
  ```

### 2. Configure Project in Vercel
- [ ] Set up all environment variables in Vercel project settings
- [ ] Configure build settings:
  - Build Command: `prisma generate && next build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 3. Deploy to Vercel
- [ ] Deploy using CLI
  ```bash
  vercel --prod
  ```
- [ ] Or deploy using GitHub integration through Vercel dashboard

### 4. Post-Deployment Checks
- [ ] Verify login/authentication works
- [ ] Check database connections
- [ ] Test all major functionality
- [ ] Verify environment variables are properly loaded

## Database Migration Strategy

### Migrating Data to Neon (if needed)
- [ ] Export data from local database:
  ```bash
  pg_dump -U postgres -d piggywise > piggywise_data.sql
  ```
- [ ] Import data to Neon:
  ```bash
  # For smaller databases
  psql -h [neon-hostname].neon.tech -U [username] -d [database-name] < piggywise_data.sql
  # OR using the Neon console to import
  ```

## Important Notes
1. When using connection pooling for serverless environments, ensure:
   ```
   DATABASE_URL="postgresql://[username]:[password]@[pooler-hostname].neon.tech/[database-name]?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://[username]:[password]@[hostname].neon.tech/[database-name]?sslmode=require"
   ```

2. For schema changes, always use `DIRECT_URL` which bypasses the connection pooler

3. Do not store real credentials in version control system

4. Set up automatic database backups in Neon 