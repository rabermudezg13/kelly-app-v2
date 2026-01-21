"""
Migration script to remove unused columns ob365_completed and i9_completed
from info_sessions table
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'kelly_app.db')

print(f"🔍 Connecting to database: {db_path}")

try:
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if columns exist
    cursor.execute("PRAGMA table_info(info_sessions)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]

    print(f"📋 Current columns in info_sessions table:")
    for col_name in column_names:
        print(f"   - {col_name}")

    # Check if the columns we want to remove exist
    has_ob365 = 'ob365_completed' in column_names
    has_i9 = 'i9_completed' in column_names

    if not has_ob365 and not has_i9:
        print("✅ Columns ob365_completed and i9_completed do not exist. Nothing to do.")
        conn.close()
        exit(0)

    if has_ob365 or has_i9:
        print(f"\n⚠️  Found columns to remove:")
        if has_ob365:
            print("   - ob365_completed")
        if has_i9:
            print("   - i9_completed")

        # SQLite doesn't support DROP COLUMN directly, so we need to:
        # 1. Create a new table without those columns
        # 2. Copy data from old table to new table
        # 3. Drop old table
        # 4. Rename new table to old table name

        print("\n🔧 Creating new table without unused columns...")

        # Get the current table schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='info_sessions'")
        create_table_sql = cursor.fetchone()[0]

        print(f"\n📝 Original table schema:")
        print(create_table_sql)

        # Create new table schema (removing the unwanted columns)
        new_columns = [col for col in column_names if col not in ['ob365_completed', 'i9_completed']]
        columns_str = ', '.join(new_columns)

        # Create a temporary table with the new schema
        cursor.execute(f"""
        CREATE TABLE info_sessions_new AS
        SELECT {columns_str}
        FROM info_sessions
        """)

        print(f"✅ Created temporary table with {len(new_columns)} columns")

        # Drop the old table
        print("🗑️  Dropping old table...")
        cursor.execute("DROP TABLE info_sessions")

        # Rename new table to original name
        print("✏️  Renaming new table to info_sessions...")
        cursor.execute("ALTER TABLE info_sessions_new RENAME TO info_sessions")

        # Commit the changes
        conn.commit()

        print("\n✅ Migration completed successfully!")
        print(f"📋 New columns in info_sessions table:")
        cursor.execute("PRAGMA table_info(info_sessions)")
        new_columns_info = cursor.fetchall()
        for col in new_columns_info:
            print(f"   - {col[1]}")

    conn.close()
    print("\n🎉 Done!")

except Exception as e:
    print(f"\n❌ Error during migration: {e}")
    if 'conn' in locals():
        conn.rollback()
        conn.close()
    raise
