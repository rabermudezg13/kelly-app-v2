"""
Script para crear o actualizar el usuario de Rodrigo Bermudez
"""
from app.database import SessionLocal
from app.models.user import User

def crear_usuario_rodrigo():
    db = SessionLocal()
    try:
        email = "rodrigo.bermudez@kellyeducation.com"
        password = "S@nti4go13"  # Usar la misma contraseña por defecto
        full_name = "Rodrigo Bermudez"
        role = "recruiter"  # O "staff" o "admin" según necesites
        
        print("=" * 60)
        print("🔍 VERIFICANDO USUARIO")
        print("=" * 60)
        
        # Buscar usuario existente
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print(f"✅ Usuario encontrado: {email}")
            print(f"   Nombre: {existing_user.full_name}")
            print(f"   Rol: {existing_user.role}")
            print(f"   Activo: {existing_user.is_active}")
            
            # Actualizar contraseña y asegurar que esté activo
            print(f"\n🔄 Actualizando contraseña y estado...")
            existing_user.password_hash = User.hash_password(password)
            existing_user.is_active = True
            existing_user.full_name = full_name
            existing_user.role = role
            db.commit()
            db.refresh(existing_user)
            
            # Verificar que la contraseña funciona
            print(f"\n🔐 Verificando contraseña...")
            if existing_user.verify_password(password):
                print(f"✅ Contraseña verificada correctamente")
            else:
                print(f"❌ ERROR: La contraseña no se puede verificar")
                raise Exception("Password verification failed")
            
            print(f"\n✅ Usuario actualizado exitosamente")
        else:
            print(f"ℹ️  Usuario no encontrado. Creando nuevo usuario...")
            
            # Crear nuevo usuario
            password_hash = User.hash_password(password)
            print(f"✅ Hash de contraseña generado")
            
            new_user = User(
                email=email,
                password_hash=password_hash,
                full_name=full_name,
                role=role,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Verificar que la contraseña funciona
            print(f"\n🔐 Verificando contraseña...")
            if new_user.verify_password(password):
                print(f"✅ Contraseña verificada correctamente")
            else:
                print(f"❌ ERROR: La contraseña no se puede verificar")
                raise Exception("Password verification failed")
            
            print(f"\n✅ Usuario creado exitosamente")
        
        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO")
        print("=" * 60)
        print(f"\n📝 Credenciales para login:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Rol: {role}")
        print(f"\n🚀 Ahora puedes hacer login con estas credenciales.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    crear_usuario_rodrigo()
