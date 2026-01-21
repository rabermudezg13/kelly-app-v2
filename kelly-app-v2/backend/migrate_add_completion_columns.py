"""
Add ob365_completed and i9_completed columns to info_sessions table
Works with both SQLite and PostgreSQL
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kelly_app.db")

def add_columns():
    """Add new columns to info_sessions table"""
    print("🔧 Adding document completion columns to info_sessions table...")
    print(f"   Database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'SQLite'}")

    try:
        # Create engine
        engine = create_engine(DATABASE_URL)

        # Check if columns already exist
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('info_sessions')]

        changes_made = False

        with engine.connect() as conn:
            # Add ob365_completed if it doesn't exist
            if 'ob365_completed' not in columns:
                print("  Adding ob365_completed column...")
                if 'postgresql' in DATABASE_URL:
                    conn.execute(text("""
                        ALTER TABLE info_sessions
                        ADD COLUMN ob365_completed BOOLEAN DEFAULT FALSE
                    """))
                else:
                    conn.execute(text("""
                        ALTER TABLE info_sessions
                        ADD COLUMN ob365_completed BOOLEAN DEFAULT 0
                    """))
                conn.commit()
                changes_made = True
                print("  ✅ Added ob365_completed column")
            else:
                print("  ℹ️  ob365_completed column already exists")

            # Add i9_completed if it doesn't exist
            if 'i9_completed' not in columns:
                print("  Adding i9_completed column...")
                if 'postgresql' in DATABASE_URL:
                    conn.execute(text("""
                        ALTER TABLE info_sessions
                        ADD COLUMN i9_completed BOOLEAN DEFAULT FALSE
                    """))
                else:
                    conn.execute(text("""
                        ALTER TABLE info_sessions
                        ADD COLUMN i9_completed BOOLEAN DEFAULT 0
                    """))
                conn.commit()
                changes_made = True
                print("  ✅ Added i9_completed column")
            else:
                print("  ℹ️  i9_completed column already exists")

        if changes_made:
            print("\n✅ Database migration completed successfully!")
        else:
            print("\n✅ Database already up to date - no changes needed")

        return True

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = add_columns()
    if success:
        print("\n🎉 Migration successful!")
        sys.exit(0)
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)
