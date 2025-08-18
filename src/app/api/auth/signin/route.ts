import { NextRequest, NextResponse } from 'next/server';
import { mongoAuth } from '@/lib/auth/mongoAuth';

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

    const result = await mongoAuth.signInWithEmail(email, accessCode);

    return NextResponse.json({
      success: true,
      user: result.user
    });

  } catch (error: any) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sign in failed' },
      { status: 401 }
    );
  }
}
