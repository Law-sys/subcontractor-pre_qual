import mongoose, { Document, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  email: string;
  isAdmin: boolean;
  accessCode: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  profile: {
    companyName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

// Invitation Interface
export interface IInvitation extends Document {
  email: string;
  accessCode: string;
  companyName: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
}

// Submission Interface
export interface ISubmission extends Document {
  submittedBy: mongoose.Types.ObjectId;
  companyName: string;
  formData: Record<string, any>;
  results: {
    overallScore: number;
    qualification: string;
    qualificationDescription: string;
    categoryScores: Record<string, number>;
    recommendations: string[];
    processingTime: number;
    aiModel: string;
  };
  documents: Array<{
    fileName: string;
    fileSize: number;
    documentType: string;
    uploadedAt: Date;
    analysisResults?: Record<string, any>;
    ocrResults?: Record<string, any>;
    coiAnalysis?: Record<string, any>;
  }>;
  status: 'pending_review' | 'approved' | 'rejected' | 'requires_additional_info';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  submittedAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  accessCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    companyName: String,
    firstName: String,
    lastName: String,
    phone: String
  }
}, {
  timestamps: true
});

// Invitation Schema
const InvitationSchema = new Schema<IInvitation>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  accessCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Submission Schema
const SubmissionSchema = new Schema<ISubmission>({
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  formData: {
    type: Schema.Types.Mixed,
    required: true
  },
  results: {
    overallScore: { type: Number, required: true },
    qualification: { type: String, required: true },
    qualificationDescription: { type: String, required: true },
    categoryScores: { type: Schema.Types.Mixed, required: true },
    recommendations: [String],
    processingTime: Number,
    aiModel: String
  },
  documents: [{
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    documentType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    analysisResults: Schema.Types.Mixed,
    ocrResults: Schema.Types.Mixed,
    coiAnalysis: Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected', 'requires_additional_info'],
    default: 'pending_review'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ createdAt: -1 });

InvitationSchema.index({ email: 1 });
InvitationSchema.index({ accessCode: 1 });
InvitationSchema.index({ createdBy: 1 });
InvitationSchema.index({ expiresAt: 1 });
InvitationSchema.index({ isUsed: 1 });

SubmissionSchema.index({ submittedBy: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ submittedAt: -1 });
SubmissionSchema.index({ companyName: 1 });

// Create models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);
export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
