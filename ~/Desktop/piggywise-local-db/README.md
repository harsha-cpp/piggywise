# PiggyWise Database Configuration

This folder contains environment configuration templates for both local development and production deployment.

## Local Development

The `.env.local` file contains the configuration for connecting to a local PostgreSQL database. To use this configuration:

1. Copy the `.env.local` file to your PiggyWise project root directory
2. Rename it to `.env` (overwriting the existing one if necessary)
3. Ensure your local PostgreSQL server is running with the specified credentials

```bash
cp .env.local /path/to/piggywise/.env
```

## Production Deployment with Neon

For production deployment with Neon:

1. Sign up for a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the `.env.production.template` file to your project
4. Fill in the actual values:
   - Replace the placeholders in the Neon connection string
   - Update the NextAuth secret and URL
   - Update other API keys and configuration values
5. Rename the file to `.env` in your production environment

### Neon Connection String Format

The format for Neon database connection strings is:

```
postgresql://[username]:[password]@[hostname].neon.tech/[database-name]?sslmode=require
```

Example:
```
postgresql://johndoe:mypassword@ep-cool-snow-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Important Notes

- Never commit sensitive environment variables to version control
- Set up proper environment variables in your deployment platform
- Consider using a service like Vercel for easy environment configuration 