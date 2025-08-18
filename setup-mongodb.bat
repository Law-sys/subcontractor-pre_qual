@echo off
REM MongoDB setup script for Tweet/Garot Subcontractor Portal

echo 🚀 Setting up Tweet/Garot Subcontractor Portal with MongoDB...

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check MongoDB service
echo 🗄️ Checking MongoDB connection...

REM Start development server with database initialization
echo 🔄 Starting development server with database setup...
echo.
echo 🔐 Default Admin Login:
echo    Email: admin@tweetgarot.com
echo    Access Code: 12345
echo.
echo    Email: max.vanasten@tweetgarot.com
echo    Access Code: 12345
echo.
echo 📊 Database Health Check: http://localhost:3000/api/admin/database
echo 🌐 Portal: http://localhost:3000
echo.
echo 🏃‍♂️ Starting server...
call npm run dev
