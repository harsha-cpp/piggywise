# Setting Up Prisma with Neon for Production

## Prisma Configuration for Neon

When using Neon with Prisma, a few additional settings may be needed in your `prisma/schema.prisma` file to ensure proper connection handling.

### 1. Check your datasource configuration

Ensure your Prisma schema has the following configuration:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for direct connections to Neon
}
```

For Neon specifically, you might want to add the `directUrl` option to handle connection pooling properly.

### 2. Environment Variables for Neon

In your production environment, set these variables:

```
DATABASE_URL="postgresql://[username]:[password]@[hostname].neon.tech/[database-name]?sslmode=require"
DIRECT_URL="postgresql://[username]:[password]@[hostname].neon.tech/[database-name]?sslmode=require"
```

### 3. Update Prisma Client Generation

Make sure to generate the Prisma client after updating your schema:

```bash
npx prisma generate
```

### 4. Deploy Database Schema

When you're ready to deploy your schema to Neon:

```bash
npx prisma db push
```

Or if you're using migrations:

```bash
npx prisma migrate deploy
```

## Connection Pooling Considerations

Neon provides connection pooling to handle multiple concurrent connections efficiently. In serverless environments like Vercel, this is particularly important.

For optimal performance, consider adding a connection pooler like PgBouncer:

```
DATABASE_URL="postgresql://[username]:[password]@[pooler-hostname].neon.tech/[database-name]?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://[username]:[password]@[hostname].neon.tech/[database-name]?sslmode=require"
```

The `DIRECT_URL` is used for migrations and schema changes, which need a direct connection, while `DATABASE_URL` with pooling is used for regular application queries.

## Testing the Connection

Before deployment, test your Neon connection:

```bash
npx prisma db pull
```

If this successfully retrieves your schema, your connection is working properly. 