# MongoDB Database Schema for Tweet/Garot Subcontractor Portal

## 🏗️ Database Structure

### Database: `tweetgarot-portal`

## 📋 Collections

### 1. **users**
```javascript
{
  _id: ObjectId,
  email: String (required, unique, lowercase),
  isAdmin: Boolean (default: false),
  accessCode: String (required, uppercase),
  createdAt: Date (default: now),
  lastLoginAt: Date (optional),
  isActive: Boolean (default: true),
  profile: {
    companyName: String,
    firstName: String,
    lastName: String,
    phone: String
  },
  updatedAt: Date
}
```

**Indexes:**
- `email: 1`
- `isAdmin: 1` 
- `createdAt: -1`

### 2. **invitations**
```javascript
{
  _id: ObjectId,
  email: String (required, lowercase),
  accessCode: String (required, unique, uppercase),
  companyName: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date (default: now),
  expiresAt: Date (default: +30 days),
  isUsed: Boolean (default: false),
  usedAt: Date (optional),
  updatedAt: Date
}
```

**Indexes:**
- `email: 1`
- `accessCode: 1`
- `createdBy: 1`
- `expiresAt: 1`
- `isUsed: 1`

### 3. **submissions**
```javascript
{
  _id: ObjectId,
  submittedBy: ObjectId (ref: User),
  companyName: String (required),
  formData: Mixed (JSON object with form responses),
  results: {
    overallScore: Number,
    qualification: String,
    qualificationDescription: String,
    categoryScores: Mixed,
    recommendations: [String],
    processingTime: Number,
    aiModel: String
  },
  documents: [{
    fileName: String,
    fileSize: Number,
    documentType: String,
    uploadedAt: Date,
    analysisResults: Mixed,
    ocrResults: Mixed,
    coiAnalysis: Mixed
  }],
  status: String (enum: ['pending_review', 'approved', 'rejected', 'requires_additional_info']),
  reviewedBy: ObjectId (ref: User, optional),
  reviewedAt: Date (optional),
  reviewNotes: String (optional),
  submittedAt: Date (default: now),
  updatedAt: Date
}
```

**Indexes:**
- `submittedBy: 1`
- `status: 1`
- `submittedAt: -1`
- `companyName: 1`

## 🔧 Database Operations

### User Management
- `createUser(userData)` - Create new user
- `findUserByEmail(email)` - Find user by email
- `findUserById(id)` - Find user by ID
- `updateUserLogin(email)` - Update last login time
- `getAllUsers(limit, skip)` - Get all users with pagination
- `updateUser(id, updates)` - Update user data

### Invitation Management
- `createInvitation(invitationData)` - Create new invitation
- `findInvitationByEmail(email)` - Find active invitation by email
- `findInvitationByCode(accessCode)` - Find invitation by access code
- `markInvitationAsUsed(id)` - Mark invitation as used
- `getActiveInvitations(limit, skip)` - Get active invitations
- `getAllInvitations(limit, skip)` - Get all invitations
- `generateUniqueAccessCode()` - Generate unique 6-character code

### Submission Management
- `createSubmission(submissionData)` - Save new submission
- `findSubmissionById(id)` - Get submission by ID
- `getSubmissionsByUser(userId, limit, skip)` - Get user's submissions
- `getAllSubmissions(filters, limit, skip)` - Get all submissions with filters
- `updateSubmissionStatus(id, status, reviewedBy, notes)` - Update review status
- `getSubmissionStats()` - Get aggregate statistics
- `searchSubmissions(query, limit)` - Full-text search

### Utility Operations
- `cleanup()` - Remove expired invitations
- Database health checks
- Connection management

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signin` - User authentication
- `GET /api/admin/database` - Database health check
- `POST /api/admin/database` - Database initialization

### Invitations
- `GET /api/admin/invitations` - Get all invitations
- `POST /api/send-invitation` - Send new invitation

### Submissions
- `POST /api/submissions` - Save submission
- `GET /api/submissions` - Get submissions (with user/admin filtering)
- `GET /api/admin/submissions` - Admin submission management

### Notifications
- `POST /api/notify-completion` - Send completion notification

## 🔒 Default Admin Users

The system automatically creates these admin accounts:
- `admin@tweetgarot.com` (access code: `12345`)
- `manager@tweetgarot.com` (access code: `12345`)
- `supervisor@tweetgarot.com` (access code: `12345`)
- `max.vanasten@tweetgarot.com` (access code: `12345`)

## 📊 Current Configuration

**Environment Variables:**
- `MONGODB_URI`: `mongodb://localhost:27017/tweetgarot-portal`
- `DB_NAME`: `tweetgarot-portal`
- `NEXT_PUBLIC_MOCK_AUTH`: `false` (uses real MongoDB)

**Dependencies:**
- `mongodb@6.8.0` - MongoDB Node.js driver
- `mongoose@8.7.3` - MongoDB object modeling
- `resend@6.0.1` - Email service

## 🎯 Ready Features

✅ **Complete User Management**
✅ **Invitation System with Email Integration**
✅ **Document Upload & OCR Processing**
✅ **Form Submission Storage**
✅ **Admin Review & Approval Workflow**
✅ **Search & Filtering**
✅ **Analytics & Reporting**
✅ **Database Health Monitoring**
✅ **Automatic Cleanup Tasks**
