# Praxis

> **Tell it about your day. It figures out the rest.**

A behavior and habit tracker powered by natural language AI.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS v3 + Vite |
| Backend | Java 21 + Spring Boot 3.2 |
| Database | MySQL 8.4 |
| ORM | Spring Data JPA (Hibernate) |
| Auth | Spring Security (session-based) |
| AI | Google Gemini 1.5 Flash (REST API) |
| Voice | Web Speech API (Chrome) |
| Charts | Chart.js 4 + react-chartjs-2 |

---

## Prerequisites

- **Java 21** — `java -version`
- **Maven 3.9.6** — downloaded to `C:\tools\apache-maven-3.9.6`
- **MySQL 8.4** — installed via winget
- **Node.js 18+** — for the frontend

---

## Setup

### 1. Start MySQL Service
Open **Services** (Win+R → `services.msc`) → start **MySQL84**.

Or via PowerShell (run as Administrator):
```powershell
Start-Service MySQL84
```

### 2. Create the Database
```powershell
# MySQL shell (password is blank by default after winget install, or set during install)
mysql -u root -p
```
```sql
CREATE DATABASE IF NOT EXISTS praxis_db;
EXIT;
```

### 3. Configure the Backend

Edit [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties):

```properties
# Set your MySQL password (default: root)
spring.datasource.password=root

# Add your Gemini API Key from https://aistudio.google.com/app/apikey
gemini.api.key=YOUR_GEMINI_KEY_HERE
```

### 4. Run the Backend
```powershell
cd backend
C:\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
Backend starts at **http://localhost:5000**  
Tables are auto-created in MySQL on first run.

### 5. Run the Frontend
```powershell
cd frontend
npm install   # (already done)
npm run dev
```
Frontend at **http://localhost:5173**

---

## Usage

1. Open **http://localhost:5173** in Chrome
2. Register → Log your day → Check Habits → Set Goals → Dashboard → Insights

---

## Project Structure

```
PRAXIS/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/praxis/
│       ├── PraxisApplication.java
│       ├── config/        SecurityConfig, WebConfig (CORS)
│       ├── model/         User, DailyLog, Habit, HabitCompletion, WeeklyGoal, MomentumScore
│       ├── repository/    Spring Data JPA repositories
│       ├── dto/           AuthRequest, LogRequest, HabitRequest, GoalRequest
│       ├── service/       UserService, GeminiService, LogService, HabitService,
│       │                  GoalService, InsightService, MomentumService
│       └── controller/    AuthController, LogController, HabitController,
│                          GoalController, InsightController
└── frontend/
    └── src/
        ├── pages/         Login, Register, Dashboard, LogEntry, Habits, Goals
        ├── components/    MomentumScore, ActivityChart, StreakCalendar, etc.
        ├── api/client.js  All API calls
        └── context/       AuthContext
```

---

## API Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | Yes |
| GET | /api/auth/me | — |
| POST | /api/logs | Yes |
| GET | /api/logs?days=7 | Yes |
| GET | /api/logs/today | Yes |
| GET | /api/habits | Yes |
| POST | /api/habits | Yes |
| PUT | /api/habits/{id} | Yes |
| GET | /api/habits/suggestions | Yes |
| GET | /api/habits/completions?days=30 | Yes |
| GET | /api/goals/current | Yes |
| POST | /api/goals | Yes |
| GET | /api/goals/history | Yes |
| POST | /api/goals/complete-week | Yes |
| POST | /api/insights/analyze | Yes |
| GET | /api/insights/momentum-history | Yes |
