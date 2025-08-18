import { prisma } from '@/lib/prisma/client';

export class UserService {
  static async findOrCreateUser(email: string) {
    const isAdmin = email.endsWith('@tweetgarot.com');
    
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: { 
        email, 
        isAdmin 
      }
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            overallScore: true,
            qualification: true,
            status: true,
            createdAt: true
          }
        },
        invitations: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  static async getAllUsers(options: {
    skip?: number;
    take?: number;
    adminsOnly?: boolean;
  } = {}) {
    const { skip = 0, take = 20, adminsOnly = false } = options;

    return prisma.user.findMany({
      where: adminsOnly ? { isAdmin: true } : {},
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            submissions: true,
            invitations: true
          }
        }
      }
    });
  }

  static async updateUserAdminStatus(userId: string, isAdmin: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isAdmin }
    });
  }

  static async getUserStats() {
    const [totalUsers, adminUsers, contractorUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({ where: { isAdmin: false } })
    ]);

    return {
      total: totalUsers,
      admins: adminUsers,
      contractors: contractorUsers
    };
  }
}
