"""
Add kelly_representative column to events table
"""
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kelly_app.db")

def add_kelly_representative_column():
    engine = create_engine(DATABASE_URL)
    is_postgres = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

    with engine.connect() as conn:
        try:
            # Check if column already exists
            if is_postgres:
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name='events' AND column_name='kelly_representative'
                """))
            else:
                # SQLite check
                result = conn.execute(text("""
                    PRAGMA table_info(events)
                """))
                columns = [row[1] for row in result.fetchall()]
                if 'kelly_representative' in columns:
                    print("Column 'kelly_representative' already exists in 'events' table")
                    return

            if is_postgres and result.fetchone():
                print("Column 'kelly_representative' already exists in 'events' table")
                return

            # Add the column
            conn.execute(text("""
                ALTER TABLE events
                ADD COLUMN kelly_representative VARCHAR(255)
            """))
            conn.commit()
            print("✅ Successfully added 'kelly_representative' column to 'events' table")

        except Exception as e:
            print(f"❌ Error adding column: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    add_kelly_representative_column()
