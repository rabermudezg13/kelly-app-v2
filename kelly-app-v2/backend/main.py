"""
Kelly Education Front Desk - Backend API
FastAPI application running on port 3026
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

from app.api import info_session, admin, announcements, info_session_config, new_hire_orientation_config, new_hire_orientation, recruiter, auth, visits, exclusion_list, row_template, chr, statistics, event, meet_greet
from app.database import engine, Base, SessionLocal
from app.services.user_service import initialize_default_admin
import sqlite3
from pathlib import Path

# Import all models to ensure they are registered with SQLAlchemy BEFORE create_all
# Note: We import models with different names to avoid conflicts with API routers
from app.models import (
    user as user_model,
    info_session as info_session_model,
    recruiter as recruiter_model,
    announcement as announcement_model,
    info_session_config as info_session_config_model,
    new_hire_orientation_config as new_hire_orientation_config_model,
    exclusion_list as exclusion_list_model,
    row_template as row_template_model,
    chr as chr_model,
    visit as visit_model,
    event as event_model
)

# Create database tables (models must be imported first)
Base.metadata.create_all(bind=engine)

# Ensure generated_row and question response fields exist in info_sessions table (migration)
# Only run SQLite migrations if using SQLite
try:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./kelly_app.db")
    if "sqlite" in database_url.lower():
        db_path = Path(__file__).parent / "kelly_app.db"
        if db_path.exists():
            conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(info_sessions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add generated_row if missing
        if 'generated_row' not in columns:
            print("📝 Agregando campo 'generated_row' a la tabla info_sessions...")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN generated_row TEXT")
            conn.commit()
            print("✅ Campo 'generated_row' agregado exitosamente")
        
        # Ensure steps column exists in new_hire_orientation_config table (migration)
        try:
            cursor.execute("PRAGMA table_info(new_hire_orientation_config)")
            nho_columns = [col[1] for col in cursor.fetchall()]
            
            if 'steps' not in nho_columns:
                print("📝 Agregando campo 'steps' a la tabla new_hire_orientation_config...")
                cursor.execute("ALTER TABLE new_hire_orientation_config ADD COLUMN steps TEXT")
                conn.commit()
                print("✅ Campo 'steps' agregado exitosamente")
        except Exception as e:
            print(f"⚠️  Warning: Could not add steps field to new_hire_orientation_config: {e}")
        
        # Ensure process_status, badge_status, missing_steps, started_at, completed_at, duration_minutes columns exist in new_hire_orientations table (migration)
        try:
            cursor.execute("PRAGMA table_info(new_hire_orientations)")
            nho_orientations_columns = [col[1] for col in cursor.fetchall()]
            
            new_fields = [
                ('process_status', 'TEXT'),
                ('badge_status', 'TEXT'),
                ('missing_steps', 'TEXT'),
                ('started_at', 'DATETIME'),
                ('completed_at', 'DATETIME'),
                ('duration_minutes', 'INTEGER')
            ]
            
            for field_name, field_type in new_fields:
                if field_name not in nho_orientations_columns:
                    print(f"📝 Agregando campo '{field_name}' a la tabla new_hire_orientations...")
                    cursor.execute(f"ALTER TABLE new_hire_orientations ADD COLUMN {field_name} {field_type}")
                    conn.commit()
                    print(f"✅ Campo '{field_name}' agregado exitosamente")
        except Exception as e:
            print(f"⚠️  Warning: Could not add fields to new_hire_orientations: {e}")
        
        # Add question response fields if missing
        if 'question_1_response' not in columns:
            print("📝 Agregando campos de respuestas de preguntas a la tabla info_sessions...")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN question_1_response TEXT")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN question_2_response TEXT")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN question_3_response TEXT")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN question_4_response TEXT")
            conn.commit()
            print("✅ Campos de respuestas de preguntas agregados exitosamente")
        elif 'question_4_response' not in columns:
            print("📝 Agregando campo question_4_response a la tabla info_sessions...")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN question_4_response TEXT")
            conn.commit()
            print("✅ Campo question_4_response agregado exitosamente")
        
            conn.close()
    else:
        # PostgreSQL - las tablas se crean automáticamente con Base.metadata.create_all
        # pero necesitamos agregar columnas nuevas manualmente
        print("📊 Usando PostgreSQL - verificando migraciones...")
        from sqlalchemy import text, inspect
        with engine.connect() as conn:
            inspector = inspect(engine)
            # Migration: add subparty_suggestion to meet_greets
            if 'meet_greets' in inspector.get_table_names():
                mg_columns = [col['name'] for col in inspector.get_columns('meet_greets')]
                if 'subparty_suggestion' not in mg_columns:
                    print("📝 Adding 'subparty_suggestion' column to meet_greets...")
                    conn.execute(text("ALTER TABLE meet_greets ADD COLUMN subparty_suggestion TEXT"))
                    conn.commit()
                    print("✅ Column 'subparty_suggestion' added successfully")
except Exception as e:
    print(f"⚠️  Warning: Could not add fields: {e}")
    print("   The fields will be added automatically on next database creation.")

# Initialize default admin user (non-blocking)
try:
    db = SessionLocal()
    try:
        initialize_default_admin(db)
    finally:
        db.close()
except Exception as e:
    print(f"⚠️  Warning: Could not initialize admin user: {e}")
    print("   You can create the admin user manually later or fix the database.")

app = FastAPI(
    title="Kelly Education Front Desk API",
    description="Backend API for Kelly Education Miami Dade Front Desk",
    version="2.0.0"
)

# CORS configuration - AGGRESSIVE FIX for Railway
print("="*80)
print("🔧 RAILWAY DEPLOYMENT v3: AGGRESSIVE CORS CONFIGURATION")
print("="*80)

# Add CORS middleware - MUST be before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Additional middleware to ensure CORS headers are always present
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class ForceCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            from fastapi.responses import Response
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "false",
                    "Access-Control-Max-Age": "3600",
                }
            )

        try:
            response = await call_next(request)
        except Exception as e:
            # Even on errors, return CORS headers
            print(f"⚠️ Exception in middleware: {e}")
            from fastapi.responses import JSONResponse
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "false",
                }
            )
            return response

        # Force CORS headers on ALL responses (including errors)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "false"
        return response

app.add_middleware(ForceCORSMiddleware)
print("✅ CORS configured: allow_origins=['*'] + Force CORS with OPTIONS handler")
print("   📝 Allowing: https://kelly-app-v2.vercel.app and all origins")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(info_session.router, prefix="/api/info-session", tags=["Info Session"])
app.include_router(visits.router, prefix="/api/visits", tags=["Visits"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(info_session_config.router, prefix="/api/info-session-config", tags=["Info Session Config"])
app.include_router(new_hire_orientation_config.router, prefix="/api/new-hire-orientation-config", tags=["New Hire Orientation Config"])
app.include_router(new_hire_orientation.router, prefix="/api/new-hire-orientation", tags=["New Hire Orientation"])
app.include_router(recruiter.router, prefix="/api/recruiter", tags=["Recruiter"])
app.include_router(exclusion_list.router, prefix="/api/exclusion-list", tags=["Exclusion List"])
app.include_router(row_template.router, prefix="/api/row-template", tags=["Row Template"])
app.include_router(chr.router, prefix="/api/chr", tags=["CHR"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(event.router, prefix="/api/event", tags=["Event"])
app.include_router(meet_greet.router, prefix="/api/meet-greet", tags=["Meet & Greet"])

@app.get("/")
async def root():
    return {"message": "Kelly Education Front Desk API v2.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3026, reload=True)

