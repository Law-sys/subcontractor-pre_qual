import { NextRequest, NextResponse } from 'next/server';
import { mongoAuth } from '@/lib/auth/mongoAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, results, documents, userId } = body;

    if (!formData || !results || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set current user for saving submission
    mongoAuth.currentUser = { id: userId };

    const submission = await mongoAuth.saveSubmission(formData, results, documents);

    return NextResponse.json({
      success: true,
      data: submission
    });

  } catch (error: any) {
    console.error('Save submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const submissions = await mongoAuth.getSubmissions(userId || undefined, limit, skip);

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        pagination: {
          limit,
          skip,
          hasMore: submissions.length === limit
        }
      }
    });

  } catch (error: any) {
    console.error('Get submissions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
