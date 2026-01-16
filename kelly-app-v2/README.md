# Kelly App v2.0 - Education Front Desk Management System

A comprehensive management system for Kelly Education's front desk operations, including Info Sessions, New Hire Orientations, CHR cases, visitor tracking, and more.

## ✨ Features

- **Info Sessions Management**: Track and manage candidate info sessions with automated workflows
- **New Hire Orientations**: Streamline the onboarding process for new hires
- **CHR Case Tracking**: Manage Criminal History Record cases and submissions
- **Visitor Management**: Track badges, fingerprints, and team visits
- **Recruiter Dashboard**: Assign and track sessions for recruiters
- **Exclusion List**: Check candidates against an exclusion list
- **Statistics & Analytics**: Comprehensive dashboard with activity metrics
- **User Management**: Role-based access control (Admin/Recruiter)
- **Customizable Templates**: Create custom row templates for data entry

## 🛠️ Technology Stack

### Frontend (Port 3025)
- **React 18** with TypeScript - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend (Port 3026)
- **FastAPI** (Python) - High-performance REST API
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Production database (SQLite for development)
- **JWT Authentication** - Secure token-based auth
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
kelly-app-v2/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── models/    # Database models
│   │   ├── services/  # Business logic
│   │   └── database.py
│   ├── main.py        # Application entry point
│   ├── requirements.txt
│   └── railway.json   # Railway deployment config
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── railway.json   # Railway deployment config
└── railway.json       # Root Railway config
```

## 🚀 Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or use SQLite for development)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the backend
python -m uvicorn main:app --reload --port 3026
```

Backend will be available at http://localhost:3026
API documentation: http://localhost:3026/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (optional for local dev)
cp .env.example .env

# Run the frontend
npm run dev
```

Frontend will be available at http://localhost:3025

### Default Admin Credentials

After first run, log in with:
- Email: `admin@example.com` (configurable in backend `.env`)
- Password: `change-this-password` (configurable in backend `.env`)

⚠️ **Important**: Change these credentials in production!

## ☁️ Deployment to Railway

See **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** for detailed deployment instructions.

### Quick Deploy Steps

1. Create a new project on Railway
2. Add PostgreSQL database service
3. Deploy backend service from `backend/` directory
4. Deploy frontend service from `frontend/` directory
5. Configure environment variables for each service
6. Done! 🚀

## 🔐 Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
CORS_ORIGINS=https://your-frontend.com
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.railway.app/api
```

## 📚 API Documentation

Interactive API documentation is automatically generated:

- Local: http://localhost:3026/docs
- Production: https://your-backend.railway.app/docs

## 🔍 Key Features Implemented

### Info Session Management
- ✅ ZIP code field for candidate tracking
- ✅ Exclusion list verification with alerts
- ✅ Welcome screen with requirements
- ✅ Step-by-step checklist workflow
- ✅ Staff dashboard for monitoring

### Admin Features
- ✅ Editable announcements and welcome messages
- ✅ User management with role-based access
- ✅ Exclusion list upload and management
- ✅ Custom row template builder
- ✅ Configuration management

### Visitor Tracking
- ✅ Badge registration
- ✅ Fingerprint tracking
- ✅ Team visit logging
- ✅ Real-time status updates

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- Environment variable configuration
- Role-based access control

## 🐛 Common Issues

### Backend won't start
- Verify Python 3.9+ is installed
- Check DATABASE_URL in .env
- Ensure all dependencies are installed

### Frontend can't connect
- Verify VITE_API_URL (or auto-detection will use localhost:3026)
- Check CORS_ORIGINS in backend .env includes frontend URL
- Ensure backend is running

### Database errors
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Review backend logs

## 📄 License

Proprietary - Kelly Education Services

## 💬 Support

For support, contact the development team or create an issue in the repository.

---

**Built with ❤️ for Kelly Education**



