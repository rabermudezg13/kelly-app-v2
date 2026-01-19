"""
Check if kelly_representative column exists in events table
"""
from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kelly_app.db")

def check_migration_status():
    engine = create_engine(DATABASE_URL)
    is_postgres = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

    print(f"Database URL: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    print(f"Database type: {'PostgreSQL' if is_postgres else 'SQLite'}")
    print()

    with engine.connect() as conn:
        try:
            if is_postgres:
                result = conn.execute(text("""
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_name='events'
                    ORDER BY ordinal_position
                """))
                columns = [(row[0], row[1]) for row in result.fetchall()]
            else:
                result = conn.execute(text("PRAGMA table_info(events)"))
                columns = [(row[1], row[2]) for row in result.fetchall()]

            print("Events table columns:")
            for col_name, col_type in columns:
                marker = "✅" if col_name == "kelly_representative" else "  "
                print(f"{marker} {col_name}: {col_type}")

            print()
            if 'kelly_representative' in [c[0] for c in columns]:
                print("✅ Migration completed: kelly_representative column exists")
                print("   You can now use the Event management feature!")
            else:
                print("❌ Migration needed: kelly_representative column NOT found")
                print("   Run: python add_kelly_representative_column.py")

        except Exception as e:
            print(f"❌ Error checking migration status: {e}")
            raise

if __name__ == "__main__":
    check_migration_status()
