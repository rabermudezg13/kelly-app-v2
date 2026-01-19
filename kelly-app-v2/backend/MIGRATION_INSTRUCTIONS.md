# Migration Instructions for Railway (Production)

## Adding kelly_representative column to events table

After deploying the code to Railway, you need to run the migration script to add the `kelly_representative` column to the `events` table.

### Steps:

1. **SSH into Railway container** (or use Railway CLI):
   ```bash
   railway run bash
   ```

2. **Run the migration script**:
   ```bash
   python add_kelly_representative_column.py
   ```

3. **Verify the migration**:
   The script will output:
   - `✅ Successfully added 'kelly_representative' column to 'events' table` - if successful
   - `Column 'kelly_representative' already exists in 'events' table` - if already migrated

### What the migration does:

- Checks if the `kelly_representative` column already exists
- If not, adds the column as `VARCHAR(255)` (nullable)
- Works with both SQLite (development) and PostgreSQL (production)
- Safe to run multiple times (idempotent)

### Alternative: Manual SQL

If you prefer to run SQL directly in Railway's PostgreSQL console:

```sql
ALTER TABLE events
ADD COLUMN IF NOT EXISTS kelly_representative VARCHAR(255);
```

---

**Note**: This migration is safe and non-destructive. It only adds a new nullable column and does not modify existing data.
