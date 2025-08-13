#!/bin/bash
# Development setup script for Tweet/Garot Subcontractor Portal

echo "🚀 Setting up Tweet/Garot Subcontractor Portal..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "⚙️ Creating .env.local file..."
  cat > .env.local << EOF
# EmailJS Configuration (replace with your actual values)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Development/Testing
NEXT_PUBLIC_MOCK_AUTH=true
EOF
fi

# Build Tailwind CSS
echo "🎨 Building Tailwind CSS..."
npx tailwindcss build -i ./src/app/globals.css -o ./public/styles.css

echo "✅ Setup complete!"
echo ""
echo "🔐 Login Credentials:"
echo "   Email: admin@tweetgarot.com"
echo "   Access Code: 12345"
echo ""
echo "   Email: contractor@example.com"
echo "   Access Code: 12345"
echo ""
echo "🏃‍♂️ Run 'npm run dev' to start the development server"