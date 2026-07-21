# 🎬 Addis Talent - African Casting Platform

**A cutting-edge digital casting platform connecting African actors with casting directors and production companies.**

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- **Actor Profiles**: Complete actor portfolios with headshots, videos, and skills
- **Casting Calls**: Create and manage audition opportunities
- **Applications**: Track actor applications with status management
- **AI-Powered Tools**:
  - 🎭 Monologue Script Generator
  - 📝 Audition Pitch Writer
  - 📊 Bio Optimizer & Critique
  - 🎯 Role Compatibility Matcher
  - 🎬 Role Builder from Concepts
  - 🏆 Coaching Tips & Practice Exercises
- **Premium Membership**: Actor verification and premium features
- **Payment Integration**: Secure payment processing via Telibir

### Technical Features
- ✅ Production-ready error handling
- ✅ Comprehensive request validation
- ✅ Rate limiting on all endpoints
- ✅ CORS & security headers
- ✅ Structured logging
- ✅ Health check endpoint
- ✅ Graceful shutdown handling
- ✅ TypeScript strict mode

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini 2.0 Flash API
- **Logging**: Structured JSON logging

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components with ErrorBoundary
- **State Management**: React Context API / Redux (optional)

### DevOps & Deployment
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Cloud**: AWS / Heroku (configurable)

---

## 📁 Project Structure

```
Adiss-talent-/
├── src/
│   ├── db/
│   │   ├── index.ts              # Database connection
│   │   ├── schema.ts             # Drizzle ORM schema
│   │   └── health.ts             # Health check utility
│   ├── middleware/
│   │   ├── errorHandler.ts       # Error handling & async wrapper
│   │   ├── cors.ts               # CORS & security headers
│   │   ├── validation.ts         # Request validation
│   │   └── rateLimiter.ts        # Rate limiting
│   ├── routes/
│   │   ├── actors.ts             # Actor CRUD operations
│   │   ├── castingCalls.ts       # Casting calls management
│   │   ├── applications.ts       # Application tracking
│   │   ├── ai.ts                 # AI-powered endpoints
│   │   └── payments.ts           # Payment processing
│   ├── utils/
│   │   ├── env.ts                # Environment validation
│   │   ├── errors.ts             # Custom error types
│   │   ├── logger.ts             # Structured logging
│   │   └── validation.ts         # Input validators
│   ├── server.ts                 # Express app setup
│   └── index.ts                  # Entry point
├── public/
│   └── index.html
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── App.tsx
│   ��   └── main.tsx
│   └── vite.config.ts
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── tsconfig.json                 # TypeScript config (strict mode)
├── package.json
├── docker-compose.yml            # Local dev environment
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Docker (optional, for containerized setup)
- Google Gemini API Key
- Telibir API credentials

### Clone Repository

```bash
git clone https://github.com/Hasefiw/Adiss-talent-.git
cd Adiss-talent-
npm install
```

---

## 🔐 Environment Setup

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/adiss_talent

# AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Payments (Telibir)
TELIBIR_API_KEY=your_telibir_api_key_here
TELIBIR_ACCOUNT=+251911381970

# Logging
LOG_LEVEL=debug
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

### Actor Endpoints
```
GET    /api/actors              # List all actors
GET    /api/actors/:id          # Get single actor
POST   /api/actors              # Create/update actor
DELETE /api/actors/:id          # Delete actor
```

### Casting Calls Endpoints
```
GET    /api/casting-calls       # List all casting calls
GET    /api/casting-calls/:id   # Get single casting call
POST   /api/casting-calls       # Create/update casting call
DELETE /api/casting-calls/:id   # Delete casting call
```

### Applications Endpoints
```
GET    /api/applications        # List all applications
GET    /api/applications/:id    # Get single application
POST   /api/applications        # Create/update application
PUT    /api/applications/:id/status  # Update application status
DELETE /api/applications/:id    # Delete application
```

### AI Endpoints (Rate Limited: 10/min)
```
POST   /api/ai/monologue       # Generate monologue script
POST   /api/ai/pitch           # Write audition pitch
POST   /api/ai/critique-bio    # Critique & optimize bio
POST   /api/ai/match-analysis  # Analyze role compatibility
POST   /api/ai/role-builder    # Build roles from concept
POST   /api/ai/coaching-tips   # Generate coaching tips
```

### Payment Endpoints
```
GET    /api/payments           # List all payment requests
POST   /api/payments           # Submit payment request
PUT    /api/payments/:id/status     # Update payment status
DELETE /api/payments/:id       # Delete payment request
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 🗄️ Database Setup

### Initialize Database

```bash
# Create database
creatdb adiss_talent

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### Database Schema

The database includes tables for:
- **actors**: Actor profiles and portfolio info
- **castingCalls**: Audition opportunities
- **applications**: Actor applications with status
- **paymentRequests**: Payment tracking
- **roles**: Specific roles within casting calls

---

## 🌐 Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create adiss-talent-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_db_url
heroku config:set GEMINI_API_KEY=your_key

# Deploy
git push heroku main
```

### AWS Deployment

1. Push Docker image to ECR
2. Deploy via ECS or Elastic Beanstalk
3. Configure RDS PostgreSQL
4. Set environment variables in AWS Secrets Manager

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint/Prettier configuration
- Write unit tests for critical functions
- Maintain 80%+ test coverage

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@addistalent.com
- Discord: [Join our community](https://discord.gg/addistalent)

---

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Telibir for payment processing
- The amazing African acting community

---

**Made with ❤️ in Africa**
