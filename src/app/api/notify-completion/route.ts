import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/email/ResendService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, submitterEmail, results, formData } = body;

    // Send notification to admin
    const adminEmails = ['max.vanasten@tweetgarot.com'];
    const adminNotifications = adminEmails.map(async (adminEmail) => {
      return await ResendService.sendNotificationEmail(
        adminEmail,
        `New Subcontractor Application: ${companyName || 'Unknown Company'}`,
        `
          <h3>New Pre-Qualification Application Received</h3>
          <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
          <p><strong>Submitted by:</strong> ${submitterEmail}</p>
          <p><strong>Score:</strong> ${results?.overallScore || 'N/A'}/100</p>
          <p><strong>Qualification:</strong> ${results?.qualification || 'N/A'}</p>
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
          companyName,
          submitterEmail,
          results,
          submissionTime: new Date().toISOString()
        }
      );
    });

    // Send confirmation to contractor
    const contractorConfirmation = await ResendService.sendNotificationEmail(
      submitterEmail,
      `Application Received - ${companyName || 'Pre-Qualification'}`,
      `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #1C295B;">Application Successfully Submitted</h2>
          <p>Thank you for completing the Tweet/Garot Mechanical subcontractor pre-qualification questionnaire.</p>
          
          <div style="background: #f0f2f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1C295B; margin-top: 0;">Application Summary</h3>
            <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Preliminary Score:</strong> ${results?.overallScore || 'Processing'}/100</p>
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

    // Wait for all emails to complete
    const [adminResults, contractorResult] = await Promise.all([
      Promise.all(adminNotifications),
      contractorConfirmation
    ]);

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
      results: {
        admin: adminResults,
        contractor: contractorResult
      }
    });

  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
