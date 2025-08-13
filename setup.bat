@echo off
REM Development setup script for Tweet/Garot Subcontractor Portal

echo 🚀 Setting up Tweet/Garot Subcontractor Portal...

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env.local exists
if not exist .env.local (
  echo ⚙️ Creating .env.local file...
  (
    echo # EmailJS Configuration (replace with your actual values)
    echo NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
    echo NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id  
    echo NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
    echo.
    echo # Development/Testing
    echo NEXT_PUBLIC_MOCK_AUTH=true
  ) > .env.local
)

echo ✅ Setup complete!
echo.
echo 🔐 Login Credentials:
echo    Email: admin@tweetgarot.com
echo    Access Code: 12345
echo.
echo    Email: contractor@example.com  
echo    Access Code: 12345
echo.
echo 🏃‍♂️ Run 'npm run dev' to start the development server
pause