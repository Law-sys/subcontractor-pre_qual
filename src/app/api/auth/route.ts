import { NextRequest, NextResponse } from 'next/server';
import { InvitationService } from '@/lib/services/InvitationService';
import { UserService } from '@/lib/services/UserService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessCode } = body;

    if (!email || !accessCode) {
      return NextResponse.json(
        { success: false, error: 'Email and access code are required' },
        { status: 400 }
      );
    }

    // Check if it's an admin user with the default code
    if (email.endsWith('@tweetgarot.com') && accessCode === '12345') {
      const user = await UserService.findOrCreateUser(email);
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    }

    // Validate invitation
    const validation = await InvitationService.validateInvitation(email, accessCode);
    
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 401 }
      );
    }

    // Create/find user
    const user = await UserService.findOrCreateUser(email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      invitation: {
        companyName: validation.invitation?.companyName
      }
    });

  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await UserService.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        recentSubmissions: user.submissions,
        pendingInvitations: user.invitations
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
