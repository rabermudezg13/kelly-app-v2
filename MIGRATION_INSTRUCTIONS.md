# Database Migration Instructions

## Migration: Add Document Completion Columns

This migration adds two new columns to the `info_sessions` table:
- `ob365_completed`: Tracks when applicant completes OB365 form
- `i9_completed`: Tracks when applicant completes I-9 form

### For Local Development (SQLite)

```bash
cd kelly-app-v2/backend
python migrate_add_completion_columns.py
```

### For Production (Railway/Render with PostgreSQL)

**Option 1: Via Railway CLI**
```bash
railway run python migrate_add_completion_columns.py
```

**Option 2: Via Render Shell**
```bash
python migrate_add_completion_columns.py
```

**Option 3: Manual SQL (if needed)**

For PostgreSQL:
```sql
ALTER TABLE info_sessions ADD COLUMN ob365_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE info_sessions ADD COLUMN i9_completed BOOLEAN DEFAULT FALSE;
```

For SQLite:
```sql
ALTER TABLE info_sessions ADD COLUMN ob365_completed BOOLEAN DEFAULT 0;
ALTER TABLE info_sessions ADD COLUMN i9_completed BOOLEAN DEFAULT 0;
```

### Verification

After running the migration, restart your backend server. The registration endpoint should now work without errors.

To verify the columns were added:
```python
from app.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('info_sessions')]
print('ob365_completed' in columns)  # Should print True
print('i9_completed' in columns)     # Should print True
```

### Troubleshooting

If you see "Internal Server Error" when registering:
1. Check that the migration ran successfully
2. Restart the backend server
3. Check the logs for any column-related errors
4. Verify DATABASE_URL environment variable is set correctly
