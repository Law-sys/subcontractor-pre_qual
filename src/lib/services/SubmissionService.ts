import { prisma } from '@/lib/prisma/client';
import { Prisma, SubmissionStatus } from '@prisma/client';

export class SubmissionService {
  static async createSubmission({
    companyName,
    submissionData,
    analysisResults,
    overallScore,
    qualification,
    userEmail,
    documents = []
  }: {
    companyName: string;
    submissionData: any;
    analysisResults: any;
    overallScore: number;
    qualification: string;
    userEmail: string;
    documents?: any[];
  }) {
    // First, find or create the user
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { 
        email: userEmail,
        isAdmin: userEmail.endsWith('@tweetgarot.com')
      }
    });

    // Create the submission with documents
    const submission = await prisma.submission.create({
      data: {
        companyName,
        submissionData,
        analysisResults,
        overallScore,
        qualification,
        submittedById: user.id,
        documents: {
          create: documents.map(doc => ({
            fileName: doc.fileName || 'unknown',
            originalName: doc.originalName || doc.fileName || 'unknown',
            fileSize: doc.fileSize || 0,
            mimeType: doc.mimeType || 'application/octet-stream',
            documentType: doc.documentType || 'general',
            uploadPath: doc.uploadPath,
            ocrResults: doc.ocrResults,
            coiAnalysis: doc.coiAnalysis,
            isValid: doc.isValid ?? true,
            confidence: doc.confidence || 0.0,
            points: doc.points || 0,
            maxPoints: doc.maxPoints || 10
          }))
        }
      },
      include: {
        submittedBy: true,
        documents: true
      }
    });

    return submission;
  }

  static async getSubmissionById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        submittedBy: true,
        documents: true
      }
    });
  }

  static async getAllSubmissions(options: {
    skip?: number;
    take?: number;
    status?: SubmissionStatus;
    orderBy?: 'newest' | 'oldest' | 'score';
  } = {}) {
    const { skip = 0, take = 20, status, orderBy = 'newest' } = options;

    const orderByClause = {
      newest: { createdAt: 'desc' as const },
      oldest: { createdAt: 'asc' as const },
      score: { overallScore: 'desc' as const }
    }[orderBy];

    return prisma.submission.findMany({
      where: status ? { status } : undefined,
      skip,
      take,
      orderBy: orderByClause,
      include: {
        submittedBy: {
          select: { email: true, isAdmin: true }
        },
        documents: {
          select: { 
            id: true, 
            fileName: true, 
            documentType: true, 
            isValid: true, 
            confidence: true 
          }
        }
      }
    });
  }

  static async updateSubmissionStatus(id: string, status: SubmissionStatus) {
    return prisma.submission.update({
      where: { id },
      data: { status },
      include: {
        submittedBy: true,
        documents: true
      }
    });
  }

  static async getSubmissionStats() {
    const [total, pending, qualified, conditional, notQualified] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.submission.count({ where: { status: 'QUALIFIED' } }),
      prisma.submission.count({ where: { status: 'CONDITIONAL' } }),
      prisma.submission.count({ where: { status: 'NOT_QUALIFIED' } })
    ]);

    const averageScore = await prisma.submission.aggregate({
      _avg: { overallScore: true }
    });

    return {
      total,
      pending,
      qualified,
      conditional,
      notQualified,
      averageScore: Math.round(averageScore._avg.overallScore || 0)
    };
  }
}
