import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database/DatabaseService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const invitations = await DatabaseService.getAllInvitations(limit, skip);

    return NextResponse.json({
      success: true,
      data: {
        invitations,
        pagination: {
          limit,
          skip,
          hasMore: invitations.length === limit
        }
      }
    });

  } catch (error: any) {
    console.error('Admin invitations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, createdBy } = body;

    if (!email || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Email and createdBy are required' },
        { status: 400 }
      );
    }

    // Generate unique access code
    const accessCode = await DatabaseService.generateUniqueAccessCode();

    // Create invitation
    const invitation = await DatabaseService.createInvitation({
      email: email.toLowerCase(),
      accessCode,
      companyName: companyName || '',
      createdBy
    });

    return NextResponse.json({
      success: true,
      data: {
        invitation,
        accessCode
      }
    });

  } catch (error: any) {
    console.error('Create invitation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
