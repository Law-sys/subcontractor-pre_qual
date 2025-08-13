import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/email/ResendService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessCode, companyName, portalUrl } = body;

    if (!email || !accessCode) {
      return NextResponse.json(
        { success: false, error: 'Email and access code are required' },
        { status: 400 }
      );
    }

    const result = await ResendService.sendInvitationEmail(
      email,
      accessCode,
      companyName || '',
      portalUrl || ''
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Invitation email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
