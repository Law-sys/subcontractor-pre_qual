<<<<<<< HEAD
<<<<<<< HEAD


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> c40cd7e (initial commit)
=======
# Tweet/Garot Subcontractor Portal
>>>>>>> b8df075 (updated emailjs to resend)

A modern, AI-powered subcontractor pre-qualification portal with **REAL OCR** document processing and **Resend email integration**.

## 🚀 Features

- **Real OCR Processing**: Uses tesseract.js for client-side document OCR
- **Certificate of Insurance Analysis**: Intelligent COI parsing and validation
- **Resend Email Integration**: Professional email notifications and invitations
- **Admin Portal**: Invite contractors and manage applications
- **Real-time Document Validation**: Instant feedback on uploaded documents
- **Responsive Design**: Works on desktop and mobile devices

## 📧 Email Configuration

This application uses **Resend** for email delivery. EmailJS has been completely removed.

### Setup Resend

1. Sign up at [Resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (required for production)
4. Update your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=your_verified_email@yourdomain.com

# Development/Testing
NEXT_PUBLIC_MOCK_AUTH=true
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Resend API key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## 📧 Email Templates

The application includes professionally designed email templates for:

1. **Contractor Invitations**
   - Company branding
   - Access code highlighting
   - Portal link
   - Feature overview

2. **Admin Notifications**
   - New application alerts
   - Application summary data
   - Next steps guidance

3. **Contractor Confirmations**
   - Application receipt confirmation
   - Status updates
   - Timeline information

## 🔐 Authentication

### Default Access Codes

**Admin Users** (ends with @tweetgarot.com):
- Email: `admin@tweetgarot.com`
- Email: `max.vanasten@tweetgarot.com`
- Access Code: `12345`

**Contractors**:
- Email: `contractor@example.com`
- Access Code: `12345`

### Admin Features

Administrators can:
- Invite new contractors via email
- View all submissions
- Manage access codes
- Send custom notifications

## 🎯 Usage

### For Contractors

1. Receive invitation email with access code
2. Visit portal and sign in with email + access code
3. Complete pre-qualification questionnaire
4. Upload required documents (COI, licenses, etc.)
5. Submit application and receive confirmation

### For Admins

1. Sign in with admin credentials
2. Click "Invite Contractor" to send invitations
3. Monitor applications and document uploads
4. Review OCR analysis results
5. Make qualification decisions

## 🔧 API Endpoints

- `POST /api/send-invitation` - Send contractor invitations
- `POST /api/notify-completion` - Send completion notifications

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── send-invitation/
│   │   └── notify-completion/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   └── InviteContractorModal.tsx
│   ├── AuthWrapper.tsx
│   ├── EnhancedFileUpload.tsx
│   └── ...
├── lib/
│   ├── email/
│   │   └── ResendService.ts
│   ├── auth/
│   │   └── mockAuth.ts
│   └── ocr/
│       └── CompleteOCRService.ts
└── types/
    ├── documents.ts
    └── common.ts
```

## 🧪 Development

### Email Testing

In development mode:
- Emails are sent via Resend API
- Success/failure notifications appear as browser alerts
- Check browser console for email delivery status

### OCR Testing

Upload sample documents to test:
- PDF certificates
- Image-based documents (JPG, PNG)
- Word documents

## 🚀 Deployment

### Environment Variables

Ensure these are set in production:

```bash
RESEND_API_KEY=your_production_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Domain Verification

For production email delivery:
1. Verify your domain in Resend dashboard
2. Add required DNS records
3. Test email delivery

## 📞 Support

For questions or support:
- Email: max.vanasten@tweetgarot.com
- Technical Issues: Check browser console for errors
- Email Issues: Verify Resend API key and domain settings

## 🔄 Recent Changes

- ✅ **Removed EmailJS** completely
- ✅ **Added Resend integration** with professional templates
- ✅ **Created API routes** for server-side email processing
- ✅ **Added admin invite functionality**
- ✅ **Improved error handling** and fallbacks
- ✅ **Enhanced email templates** with branding and styling

---

**Tweet/Garot Mechanical** - Professional Subcontractor Portal
