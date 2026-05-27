@echo off
echo ===============================================
echo  PRAXIS - Full Stack Startup Script
echo ===============================================
echo.

REM ── 1. Kill any old MySQL ──────────────────────
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM ── 2. Start MySQL in the background ───────────
echo [1/3] Starting MySQL 8.4...
start "MySQL" /MIN "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\my.ini" --console

REM ── 3. Wait for MySQL to bind port 3306 ────────
echo     Waiting for MySQL to start...
:WAIT_MYSQL
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 goto WAIT_MYSQL
echo     MySQL is ready!

REM ── 4. Create database if needed ───────────────
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS praxis_db;" 2>nul
echo     Database 'praxis_db' ensured.

REM ── 5. Start Spring Boot backend ───────────────
echo.
echo [2/3] Starting Spring Boot backend on port 5000...
start "Praxis Backend" /MIN cmd /c "cd /d P:\project\PRAXIS\backend && C:\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

REM ── 6. Wait for backend ────────────────────────
echo     Waiting for backend to start (this takes ~30 seconds)...
:WAIT_BACKEND
timeout /t 3 /nobreak >nul
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 goto WAIT_BACKEND
echo     Backend is ready on http://localhost:5000 !

REM ── 7. Start Frontend ──────────────────────────
echo.
echo [3/3] Starting React frontend on port 5173...
start "Praxis Frontend" cmd /c "cd /d P:\project\PRAXIS\frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ===============================================
echo  All services started!
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:5000
echo ===============================================
echo  (Close this window to keep services running)
echo  (MySQL, Backend, and Frontend run in their)
echo  (own windows - close those to stop them)
echo ===============================================
pause
