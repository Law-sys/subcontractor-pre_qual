import { connectToDatabase } from './connection';
import { User, Invitation, Submission, IUser, IInvitation, ISubmission } from './models';
import mongoose from 'mongoose';

export class DatabaseService {
  // Initialize database connection
  static async connect() {
    await connectToDatabase();
  }

  // User Management
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    await this.connect();
    const user = new User(userData);
    return await user.save();
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    await this.connect();
    return await User.findOne({ email: email.toLowerCase() }).exec();
  }

  static async findUserById(id: string): Promise<IUser | null> {
    await this.connect();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findById(id).exec();
  }

  static async updateUserLogin(email: string): Promise<void> {
    await this.connect();
    await User.updateOne(
      { email: email.toLowerCase() },
      { lastLoginAt: new Date() }
    ).exec();
  }

  static async getAllUsers(limit = 50, skip = 0): Promise<IUser[]> {
    await this.connect();
    return await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  static async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    await this.connect();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  // Invitation Management
  static async createInvitation(invitationData: Partial<IInvitation>): Promise<IInvitation> {
    await this.connect();
    const invitation = new Invitation(invitationData);
    return await invitation.save();
  }

  static async findInvitationByEmail(email: string): Promise<IInvitation | null> {
    await this.connect();
    return await Invitation.findOne({ 
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).exec();
  }

  static async findInvitationByCode(accessCode: string): Promise<IInvitation | null> {
    await this.connect();
    return await Invitation.findOne({ 
      accessCode: accessCode.toUpperCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).exec();
  }

  static async markInvitationAsUsed(id: string): Promise<void> {
    await this.connect();
    await Invitation.updateOne(
      { _id: id },
      { 
        isUsed: true, 
        usedAt: new Date() 
      }
    ).exec();
  }

  static async getActiveInvitations(limit = 50, skip = 0): Promise<IInvitation[]> {
    await this.connect();
    return await Invitation.find({
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  static async getAllInvitations(limit = 50, skip = 0): Promise<IInvitation[]> {
    await this.connect();
    return await Invitation.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  // Submission Management
  static async createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission> {
    await this.connect();
    const submission = new Submission(submissionData);
    return await submission.save();
  }

  static async findSubmissionById(id: string): Promise<ISubmission | null> {
    await this.connect();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Submission.findById(id)
      .populate('submittedBy', 'email profile.companyName')
      .populate('reviewedBy', 'email')
      .exec();
  }

  static async getSubmissionsByUser(userId: string, limit = 20, skip = 0): Promise<ISubmission[]> {
    await this.connect();
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return await Submission.find({ submittedBy: userId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  static async getAllSubmissions(
    filters: {
      status?: string;
      companyName?: string;
      submittedAfter?: Date;
      submittedBefore?: Date;
    } = {},
    limit = 50, 
    skip = 0
  ): Promise<ISubmission[]> {
    await this.connect();
    
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.companyName) {
      query.companyName = { $regex: filters.companyName, $options: 'i' };
    }
    
    if (filters.submittedAfter || filters.submittedBefore) {
      query.submittedAt = {};
      if (filters.submittedAfter) {
        query.submittedAt.$gte = filters.submittedAfter;
      }
      if (filters.submittedBefore) {
        query.submittedAt.$lte = filters.submittedBefore;
      }
    }

    return await Submission.find(query)
      .populate('submittedBy', 'email profile.companyName')
      .populate('reviewedBy', 'email')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  static async updateSubmissionStatus(
    id: string, 
    status: ISubmission['status'], 
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<ISubmission | null> {
    await this.connect();
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewedBy)) {
      return null;
    }
    
    return await Submission.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes
      },
      { new: true }
    )
      .populate('submittedBy', 'email profile.companyName')
      .populate('reviewedBy', 'email')
      .exec();
  }

  static async getSubmissionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    requiresInfo: number;
    avgScore: number;
  }> {
    await this.connect();
    
    const [stats] = await Submission.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          requiresInfo: {
            $sum: { $cond: [{ $eq: ['$status', 'requires_additional_info'] }, 1, 0] }
          },
          avgScore: { $avg: '$results.overallScore' }
        }
      }
    ]);

    return {
      total: stats?.total || 0,
      pending: stats?.pending || 0,
      approved: stats?.approved || 0,
      rejected: stats?.rejected || 0,
      requiresInfo: stats?.requiresInfo || 0,
      avgScore: stats?.avgScore ? Math.round(stats.avgScore * 100) / 100 : 0
    };
  }

  // Utility Methods
  static async generateUniqueAccessCode(): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code: string;
    let exists: boolean;
    
    do {
      code = Array.from({ length: 6 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
      
      exists = !!(await this.findInvitationByCode(code));
    } while (exists);
    
    return code;
  }

  static async cleanup(): Promise<void> {
    // Remove expired invitations
    await this.connect();
    const result = await Invitation.deleteMany({
      expiresAt: { $lt: new Date() },
      isUsed: false
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} expired invitations`);
  }

  // Search functionality
  static async searchSubmissions(query: string, limit = 20): Promise<ISubmission[]> {
    await this.connect();
    
    return await Submission.find({
      $or: [
        { companyName: { $regex: query, $options: 'i' } },
        { 'formData.companyLegalName': { $regex: query, $options: 'i' } },
        { 'formData.primaryContact': { $regex: query, $options: 'i' } }
      ]
    })
      .populate('submittedBy', 'email profile.companyName')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .exec();
  }
}
