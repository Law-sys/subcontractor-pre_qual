import { prisma } from '@/lib/prisma/client';

export class InvitationService {
  static generateAccessCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  }

  static async createInvitation({
    email,
    companyName,
    createdByEmail,
    expiresInDays = 30
  }: {
    email: string;
    companyName?: string;
    createdByEmail: string;
    expiresInDays?: number;
  }) {
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Find or create the admin user
    const adminUser = await prisma.user.upsert({
      where: { email: createdByEmail },
      update: {},
      create: { 
        email: createdByEmail, 
        isAdmin: createdByEmail.endsWith('@tweetgarot.com') 
      }
    });

    if (!adminUser.isAdmin) {
      throw new Error("Only administrators can send invitations");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email }
    });

    if (existingInvitation && !existingInvitation.isUsed && existingInvitation.expiresAt > new Date()) {
      throw new Error("An active invitation already exists for this email");
    }

    // Delete any existing invitation for this email
    if (existingInvitation) {
      await prisma.invitation.delete({
        where: { email }
      });
    }

    // Create new invitation
    const accessCode = this.generateAccessCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        accessCode,
        companyName,
        expiresAt,
        createdById: adminUser.id
      },
      include: {
        createdBy: {
          select: { email: true, isAdmin: true }
        }
      }
    });

    return invitation;
  }

  static async validateInvitation(email: string, accessCode: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { email }
    });

    if (!invitation) {
      return { valid: false, error: "No invitation found for this email" };
    }

    if (invitation.isUsed) {
      return { valid: false, error: "This invitation has already been used" };
    }

    if (invitation.expiresAt < new Date()) {
      return { valid: false, error: "This invitation has expired" };
    }

    if (invitation.accessCode !== accessCode.toUpperCase()) {
      return { valid: false, error: "Invalid access code" };
    }

    return { valid: true, invitation };
  }

  static async markInvitationAsUsed(email: string) {
    return prisma.invitation.update({
      where: { email },
      data: { isUsed: true }
    });
  }

  static async getAllInvitations(options: {
    skip?: number;
    take?: number;
    includeUsed?: boolean;
  } = {}) {
    const { skip = 0, take = 20, includeUsed = true } = options;

    return prisma.invitation.findMany({
      where: includeUsed ? {} : { isUsed: false },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { email: true }
        }
      }
    });
  }

  static async deleteInvitation(id: string) {
    return prisma.invitation.delete({
      where: { id }
    });
  }
}
