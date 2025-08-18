import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/email/ResendService';
import { InvitationService } from '@/lib/services/InvitationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, createdByEmail } = body;

    if (!email || !createdByEmail) {
      return NextResponse.json(
        { success: false, error: 'Email and creator email are required' },
        { status: 400 }
      );
    }

    // Create invitation in database
    const invitation = await InvitationService.createInvitation({
      email,
      companyName,
      createdByEmail
    });

    // Send invitation email
    const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (request.headers.get('origin') || 'http://localhost:3000');
    
    const result = await ResendService.sendInvitationEmail(
      email,
      invitation.accessCode,
      companyName || '',
      portalUrl
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        invitationId: invitation.id,
        accessCode: invitation.accessCode,
        messageId: result.messageId,
        message: 'Invitation created and email sent successfully'
      });
    } else {
      // If email fails, still return success since invitation was created
      return NextResponse.json({
        success: true,
        invitationId: invitation.id,
        accessCode: invitation.accessCode,
        warning: `Invitation created but email failed: ${result.error}`,
        message: 'Invitation created but email delivery failed'
      });
    }

  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
