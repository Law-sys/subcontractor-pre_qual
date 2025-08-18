import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/lib/services/SubmissionService';
import { InvitationService } from '@/lib/services/InvitationService';
import { EnterpriseAIService } from '@/lib/analysis/EnterpriseAIService';
import { ResendService } from '@/lib/email/ResendService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    // Calculate analysis results
    const analysisResults = EnterpriseAIService.calculateContractorScore(formData);
    
    // Process documents data
    const documents = [];
    for (const [key, files] of Object.entries(formData)) {
      if (Array.isArray(files) && files.length > 0) {
        files.forEach((file: any, index: number) => {
          if (file && typeof file === 'object' && file.name) {
            documents.push({
              fileName: file.name,
              originalName: file.name,
              fileSize: file.size || 0,
              mimeType: file.type || 'application/octet-stream',
              documentType: key,
              uploadPath: null, // File upload handling would go here
              ocrResults: file.analysisResults?.ocrResults || null,
              coiAnalysis: file.analysisResults?.coiAnalysis || null,
              isValid: file.analysisResults?.isValid ?? true,
              confidence: file.analysisResults?.confidence || 0.0,
              points: file.analysisResults?.points || 0,
              maxPoints: file.analysisResults?.maxPoints || 10
            });
          }
        });
      }
    }

    // Create submission in database
    const submission = await SubmissionService.createSubmission({
      companyName: formData.companyLegalName || 'Unknown Company',
      submissionData: formData,
      analysisResults,
      overallScore: analysisResults.overallScore,
      qualification: analysisResults.qualification,
      userEmail,
      documents
    });

    // Mark invitation as used if it exists
    try {
      await InvitationService.markInvitationAsUsed(userEmail);
    } catch (error) {
      // Invitation might not exist, which is okay
      console.log('No invitation to mark as used for', userEmail);
    }

    // Send completion notifications
    try {
      await ResendService.sendNotificationEmail(
        'max.vanasten@tweetgarot.com',
        `New Subcontractor Application: ${submission.companyName}`,
        `
          <h3>New Pre-Qualification Application Received</h3>
          <p><strong>Company:</strong> ${submission.companyName}</p>
          <p><strong>Submitted by:</strong> ${userEmail}</p>
          <p><strong>Score:</strong> ${analysisResults.overallScore}/100</p>
          <p><strong>Qualification:</strong> ${analysisResults.qualification}</p>
          <p><strong>Submission ID:</strong> ${submission.id}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <h4>Next Steps:</h4>
            <ul>
              <li>Review application in the admin portal</li>
              <li>Verify uploaded documents</li>
              <li>Contact contractor if additional information is needed</li>
            </ul>
          </div>
        `,
        {
          submissionId: submission.id,
          companyName: submission.companyName,
          submitterEmail: userEmail,
          results: analysisResults,
          documentsCount: documents.length
        }
      );

      // Send confirmation to contractor
      await ResendService.sendNotificationEmail(
        userEmail,
        `Application Received - ${submission.companyName}`,
        `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #1C295B;">Application Successfully Submitted</h2>
            <p>Thank you for completing the Tweet/Garot Mechanical subcontractor pre-qualification questionnaire.</p>
            
            <div style="background: #f0f2f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1C295B; margin-top: 0;">Application Summary</h3>
              <p><strong>Company:</strong> ${submission.companyName}</p>
              <p><strong>Submission ID:</strong> ${submission.id}</p>
              <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Preliminary Score:</strong> ${analysisResults.overallScore}/100</p>
              <p><strong>Status:</strong> Under Review</p>
            </div>

            <h3>What Happens Next?</h3>
            <ol>
              <li>Our team will review your application and documents</li>
              <li>We may contact you for additional information or clarification</li>
              <li>You will receive notification of our decision within 5-7 business days</li>
              <li>If approved, you'll receive onboarding information and next steps</li>
            </ol>

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Questions?</strong> Contact us at <a href="mailto:max.vanasten@tweetgarot.com">max.vanasten@tweetgarot.com</a></p>
            </div>

            <p>Best regards,<br>
            <strong>Tweet/Garot Mechanical Team</strong></p>
          </div>
        `
      );

    } catch (emailError) {
      console.warn('Failed to send notification emails:', emailError);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      analysisResults,
      message: 'Submission saved successfully'
    });

  } catch (error: any) {
    console.error('Submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save submission', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '20');
    const status = searchParams.get('status') as any;
    const orderBy = (searchParams.get('orderBy') || 'newest') as 'newest' | 'oldest' | 'score';

    const submissions = await SubmissionService.getAllSubmissions({
      skip,
      take,
      status,
      orderBy
    });

    const stats = await SubmissionService.getSubmissionStats();

    return NextResponse.json({
      success: true,
      submissions,
      stats
    });

  } catch (error: any) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
