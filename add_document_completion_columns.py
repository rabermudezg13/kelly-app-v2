"""
Add ob365_completed and i9_completed columns to info_sessions table
"""
import sqlite3
import os

# Path to database
DB_PATH = "kelly_app.db"

def add_columns():
    """Add new columns to info_sessions table"""
    print("🔧 Adding document completion columns to info_sessions table...")

    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return False

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(info_sessions)")
        columns = [col[1] for col in cursor.fetchall()]

        changes_made = False

        # Add ob365_completed if it doesn't exist
        if 'ob365_completed' not in columns:
            print("  Adding ob365_completed column...")
            cursor.execute("""
                ALTER TABLE info_sessions
                ADD COLUMN ob365_completed BOOLEAN DEFAULT 0
            """)
            changes_made = True
            print("  ✅ Added ob365_completed column")
        else:
            print("  ℹ️  ob365_completed column already exists")

        # Add i9_completed if it doesn't exist
        if 'i9_completed' not in columns:
            print("  Adding i9_completed column...")
            cursor.execute("""
                ALTER TABLE info_sessions
                ADD COLUMN i9_completed BOOLEAN DEFAULT 0
            """)
            changes_made = True
            print("  ✅ Added i9_completed column")
        else:
            print("  ℹ️  i9_completed column already exists")

        if changes_made:
            conn.commit()
            print("\n✅ Database migration completed successfully!")
        else:
            print("\n✅ Database already up to date - no changes needed")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = add_columns()
    if success:
        print("\n🎉 Migration successful! You can now restart the backend server.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
