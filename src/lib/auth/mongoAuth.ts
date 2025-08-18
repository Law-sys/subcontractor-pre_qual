/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseService } from '../database/DatabaseService';
import { ResendService } from '../email/ResendService';

// Default admin users for initial setup
const DEFAULT_ADMINS = [
  "admin@tweetgarot.com",
  "manager@tweetgarot.com", 
  "supervisor@tweetgarot.com",
  "max.vanasten@tweetgarot.com",
];

export const mongoAuth = {
  currentUser: null as any,

  async initializeDefaultUsers() {
    try {
      // Create default admin users if they don't exist
      for (const email of DEFAULT_ADMINS) {
        const existingUser = await DatabaseService.findUserByEmail(email);
        if (!existingUser) {
          await DatabaseService.createUser({
            email,
            isAdmin: true,
            accessCode: "12345", // Default code for admins
            profile: {
              companyName: "Tweet/Garot Mechanical"
            }
          });
          console.log(`✅ Created default admin: ${email}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
    }
  },

  generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  },

  async sendInvitationEmail(email: string, code: string, companyName = "") {
    const portalUrl = typeof window !== "undefined" ? window.location.origin : "";

    try {
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          accessCode: code,
          companyName,
          portalUrl
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Invitation email sent successfully:', result.messageId);
        if (typeof window !== "undefined" && process.env.NODE_ENV === 'development') {
          alert(`📧 Invitation email sent to: ${email}\nAccess Code: ${code}`);
        }
        return true;
      } else {
        console.warn('❌ Email sending failed:', result.error);
        if (typeof window !== "undefined") {
          alert(`📧 Email would be sent to: ${email}\nAccess Code: ${code}\nURL: ${portalUrl}\n\nError: ${result.error}\n\nNote: Make sure RESEND_API_KEY is configured.`);
        }
        return false;
      }
    } catch (e: any) {
      console.warn("API request error:", e);
      if (typeof window !== "undefined") {
        alert(`📧 Email simulation -> ${email}\nAccess Code: ${code}\nURL: ${portalUrl}\n\nConfigure Resend API to send real emails.\nError: ${e.message}`);
      }
      return false;
    }
  },

  async inviteContractor(email: string, companyName = "", createdById: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email");
    }

    try {
      // Check if there's already an active invitation
      const existingInvitation = await DatabaseService.findInvitationByEmail(email);
      if (existingInvitation) {
        throw new Error("Already invited and pending");
      }

      // Check if user already exists
      const existingUser = await DatabaseService.findUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Generate unique access code
      const code = await DatabaseService.generateUniqueAccessCode();

      // Create invitation in database
      const invitation = await DatabaseService.createInvitation({
        email: email.toLowerCase(),
        accessCode: code,
        companyName: companyName || "",
        createdBy: createdById as any
      });

      // Send email
      await this.sendInvitationEmail(email, code, companyName);

      return { email, code, id: invitation._id };
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  },

  async signInWithEmail(email: string, accessCode: string) {
    await new Promise(r => setTimeout(r, 500)); // Simulate network delay
    
    try {
      const emailLower = email.toLowerCase();
      const codeUpper = accessCode.toUpperCase();

      // First check if this is an existing user
      let user = await DatabaseService.findUserByEmail(emailLower);
      
      if (user) {
        // Existing user - validate access code
        if (user.accessCode === codeUpper) {
          // Update last login
          await DatabaseService.updateUserLogin(emailLower);
          this.currentUser = {
            id: user._id.toString(),
            email: user.email,
            uid: user._id.toString(),
            isAdmin: user.isAdmin,
            profile: user.profile
          };
          return { user: this.currentUser };
        } else {
          throw new Error("Invalid access code");
        }
      }

      // Check if this is a valid invitation
      const invitation = await DatabaseService.findInvitationByEmail(emailLower);
      if (invitation && invitation.accessCode === codeUpper) {
        // Create new user from invitation
        const newUser = await DatabaseService.createUser({
          email: emailLower,
          accessCode: codeUpper,
          isAdmin: false,
          profile: {
            companyName: invitation.companyName
          }
        });

        // Mark invitation as used
        await DatabaseService.markInvitationAsUsed(invitation._id.toString());

        this.currentUser = {
          id: newUser._id.toString(),
          email: newUser.email,
          uid: newUser._id.toString(),
          isAdmin: newUser.isAdmin,
          profile: newUser.profile
        };

        return { user: this.currentUser };
      }

      throw new Error("Invalid email or access code");
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    this.currentUser = null;
  },

  async saveSubmission(formData: any, results: any, documents: any[] = []) {
    if (!this.currentUser) {
      throw new Error("No user authenticated");
    }

    try {
      const submission = await DatabaseService.createSubmission({
        submittedBy: this.currentUser.id,
        companyName: formData.companyLegalName || formData.companyName || "Unknown Company",
        formData,
        results,
        documents: documents.map(doc => ({
          fileName: doc.fileName || "unknown",
          fileSize: doc.fileSize || 0,
          documentType: doc.documentType || "general",
          analysisResults: doc.analysisResults,
          ocrResults: doc.ocrResults,
          coiAnalysis: doc.coiAnalysis
        })),
        status: 'pending_review'
      });

      return submission;
    } catch (error: any) {
      console.error('Error saving submission:', error);
      throw error;
    }
  },

  async getSubmissions(userId?: string, limit = 20, skip = 0) {
    try {
      if (userId) {
        return await DatabaseService.getSubmissionsByUser(userId, limit, skip);
      } else {
        return await DatabaseService.getAllSubmissions({}, limit, skip);
      }
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  },

  async getSubmissionStats() {
    try {
      return await DatabaseService.getSubmissionStats();
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        requiresInfo: 0,
        avgScore: 0
      };
    }
  },

  async updateSubmissionStatus(submissionId: string, status: string, reviewNotes?: string) {
    if (!this.currentUser || !this.currentUser.isAdmin) {
      throw new Error("Admin access required");
    }

    try {
      return await DatabaseService.updateSubmissionStatus(
        submissionId,
        status as any,
        this.currentUser.id,
        reviewNotes
      );
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  },

  async searchSubmissions(query: string, limit = 20) {
    try {
      return await DatabaseService.searchSubmissions(query, limit);
    } catch (error) {
      console.error('Error searching submissions:', error);
      return [];
    }
  },

  async getInvitations(limit = 50, skip = 0) {
    try {
      return await DatabaseService.getAllInvitations(limit, skip);
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  },

  async cleanup() {
    try {
      await DatabaseService.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
};
