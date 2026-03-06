# Database Migration Guide

This folder contains database migration scripts for managing schema changes across environments.

## Migration Structure

```
migrations/
├── README.md                    # This file
├── 001_initial_schema.sql      # Base schema creation
├── 002_add_indexes.sql         # Performance indexes
├── 003_add_constraints.sql     # Foreign key constraints
└── rollback/
    ├── 001_initial_schema.sql  # Rollback scripts
    ├── 002_add_indexes.sql
    └── 003_add_constraints.sql
```

## How to Run Migrations

### Using Supabase CLI
```bash
# Apply all pending migrations
supabase db push

# Reset database to latest migration
supabase db reset

# Generate new migration
supabase migration new migration_name
```

### Manual Execution
```bash
# Connect to your database
psql -h <host> -U postgres -d <database>

# Run migration file
\i migrations/001_initial_schema.sql
```

## Migration Best Practices

1. **Always create both UP and DOWN scripts** - Every migration should be reversible
2. **Test on staging first** - Never run migrations directly on production
3. **Backup before migrating** - Always backup production data
4. **Use transactions** - Wrap migrations in transactions when possible
5. **Document changes** - Add comments explaining what each migration does
6. **Version control** - Commit all migration files to git
7. **Sequential numbering** - Use sequential numbers (001, 002, 003...)

## Migration File Template

```sql
-- UP Migration
-- Description: What this migration does
-- Date: YYYY-MM-DD
-- Author: Your Name

BEGIN;

-- Your SQL statements here
ALTER TABLE users ADD COLUMN new_column text;

COMMIT;

-- DOWN Migration (rollback)
-- To rollback: Run the rollback script

BEGIN;

-- Reverse the changes
ALTER TABLE users DROP COLUMN new_column;

COMMIT;
```

## Current Schema Version

The current database schema is based on `public.sql` which contains:
- 287 tables
- All core user management tables
- Product and e-commerce tables
- AI services tables
- Analytics and logging tables

## Environment-Specific Notes

### Development
- Auto-migration enabled
- Can reset database anytime
- Test data seeding allowed

### Staging
- Manual migration approval required
- Must test rollback procedures
- Production-like data volume

### Production
- Change management approval required
- Maintenance window may be needed
- Full backup required before migration
- Rollback plan must be tested

## Support

For questions about migrations, contact the database team or check the Supabase documentation.
