#!/usr/bin/env python3
"""
Script para migrar datos de SQLite a PostgreSQL
Ejecutar después de que la base de datos PostgreSQL esté configurada en App Platform
"""
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import Base, SessionLocal
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
    visit as visit_model
)

load_dotenv()

def migrate_data():
    """Migrar datos de SQLite a PostgreSQL"""
    
    # SQLite (origen)
    sqlite_url = os.getenv("SQLITE_DATABASE_URL", "sqlite:///./kelly_app.db")
    sqlite_engine = create_engine(sqlite_url)
    sqlite_session = sessionmaker(bind=sqlite_engine)()
    
    # PostgreSQL (destino)
    postgres_url = os.getenv("DATABASE_URL")
    if not postgres_url:
        print("❌ Error: DATABASE_URL no está configurada")
        print("   Configura DATABASE_URL con la URL de PostgreSQL de App Platform")
        return
    
    if not postgres_url.startswith("postgresql") and not postgres_url.startswith("postgres"):
        print("❌ Error: DATABASE_URL no es una URL de PostgreSQL")
        return
    
    postgres_engine = create_engine(postgres_url)
    postgres_session = sessionmaker(bind=postgres_engine)()
    
    try:
        print("🔄 Creando tablas en PostgreSQL...")
        # Crear todas las tablas
        Base.metadata.create_all(bind=postgres_engine)
        print("✅ Tablas creadas")
        
        # Migrar datos tabla por tabla
        print("\n🔄 Migrando datos...")
        
        # Migrar usuarios
        try:
            users = sqlite_session.query(user_model.User).all()
            if users:
                print(f"   Migrando {len(users)} usuarios...")
                for user in users:
                    # Verificar si ya existe
                    existing = postgres_session.query(user_model.User).filter(
                        user_model.User.email == user.email
                    ).first()
                    if not existing:
                        postgres_session.add(user_model.User(
                            email=user.email,
                            password_hash=user.password_hash,
                            full_name=user.full_name,
                            role=user.role,
                            is_active=user.is_active,
                            created_at=user.created_at,
                            updated_at=user.updated_at
                        ))
                postgres_session.commit()
                print("   ✅ Usuarios migrados")
        except Exception as e:
            print(f"   ⚠️  Error migrando usuarios: {e}")
            postgres_session.rollback()
        
        # Migrar recruiters
        try:
            recruiters = sqlite_session.query(recruiter_model.Recruiter).all()
            if recruiters:
                print(f"   Migrando {len(recruiters)} recruiters...")
                for recruiter in recruiters:
                    existing = postgres_session.query(recruiter_model.Recruiter).filter(
                        recruiter_model.Recruiter.email == recruiter.email
                    ).first()
                    if not existing:
                        postgres_session.add(recruiter_model.Recruiter(
                            name=recruiter.name,
                            email=recruiter.email,
                            status=recruiter.status,
                            is_active=recruiter.is_active,
                            created_at=recruiter.created_at,
                            updated_at=recruiter.updated_at
                        ))
                postgres_session.commit()
                print("   ✅ Recruiters migrados")
        except Exception as e:
            print(f"   ⚠️  Error migrando recruiters: {e}")
            postgres_session.rollback()
        
        # Migrar info sessions
        try:
            sessions = sqlite_session.query(info_session_model.InfoSession).all()
            if sessions:
                print(f"   Migrando {len(sessions)} info sessions...")
                for session in sessions:
                    existing = postgres_session.query(info_session_model.InfoSession).filter(
                        info_session_model.InfoSession.id == session.id
                    ).first()
                    if not existing:
                        # Crear objeto con todos los campos
                        new_session = info_session_model.InfoSession(
                            first_name=session.first_name,
                            last_name=session.last_name,
                            email=session.email,
                            phone=session.phone,
                            zip_code=session.zip_code,
                            session_type=session.session_type,
                            time_slot=session.time_slot,
                            status=session.status,
                            is_in_exclusion_list=session.is_in_exclusion_list,
                            exclusion_warning_shown=session.exclusion_warning_shown,
                            assigned_recruiter_id=session.assigned_recruiter_id,
                            ob365_sent=session.ob365_sent,
                            i9_sent=session.i9_sent,
                            existing_i9=session.existing_i9,
                            ineligible=session.ineligible,
                            rejected=session.rejected,
                            drug_screen=session.drug_screen,
                            questions=session.questions,
                            started_at=session.started_at,
                            completed_at=session.completed_at,
                            duration_minutes=session.duration_minutes,
                            generated_row=session.generated_row,
                            question_1_response=getattr(session, 'question_1_response', None),
                            question_2_response=getattr(session, 'question_2_response', None),
                            question_3_response=getattr(session, 'question_3_response', None),
                            question_4_response=getattr(session, 'question_4_response', None),
                            created_at=session.created_at,
                            updated_at=session.updated_at
                        )
                        postgres_session.add(new_session)
                postgres_session.commit()
                print("   ✅ Info sessions migradas")
        except Exception as e:
            print(f"   ⚠️  Error migrando info sessions: {e}")
            postgres_session.rollback()
        
        # Migrar otras tablas según sea necesario
        # (new_hire_orientations, badges, fingerprints, etc.)
        
        print("\n✅ Migración completada!")
        print("\n📋 Verificar datos:")
        print(f"   Usuarios en PostgreSQL: {postgres_session.query(user_model.User).count()}")
        print(f"   Recruiters en PostgreSQL: {postgres_session.query(recruiter_model.Recruiter).count()}")
        print(f"   Info Sessions en PostgreSQL: {postgres_session.query(info_session_model.InfoSession).count()}")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
        postgres_session.rollback()
    finally:
        sqlite_session.close()
        postgres_session.close()

if __name__ == "__main__":
    print("🚀 Iniciando migración de SQLite a PostgreSQL...")
    print("")
    print("⚠️  IMPORTANTE:")
    print("   1. Asegúrate de tener DATABASE_URL configurada con la URL de PostgreSQL")
    print("   2. Haz backup de ambas bases de datos antes de migrar")
    print("   3. Este script NO elimina datos de SQLite")
    print("")
    response = input("¿Continuar? (yes/no): ")
    if response.lower() == "yes":
        migrate_data()
    else:
        print("❌ Migración cancelada")
