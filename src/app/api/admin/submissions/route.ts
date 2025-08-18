import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database/DatabaseService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status') || undefined;
    const companyName = searchParams.get('companyName') || undefined;
    const submittedAfter = searchParams.get('submittedAfter') 
      ? new Date(searchParams.get('submittedAfter')!) 
      : undefined;
    const submittedBefore = searchParams.get('submittedBefore') 
      ? new Date(searchParams.get('submittedBefore')!) 
      : undefined;

    const submissions = await DatabaseService.getAllSubmissions(
      {
        status,
        companyName,
        submittedAfter,
        submittedBefore
      },
      limit,
      skip
    );

    const stats = await DatabaseService.getSubmissionStats();

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        stats,
        pagination: {
          limit,
          skip,
          hasMore: submissions.length === limit
        }
      }
    });

  } catch (error: any) {
    console.error('Admin submissions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, status, reviewNotes, reviewerId } = body;

    if (!submissionId || !status || !reviewerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedSubmission = await DatabaseService.updateSubmissionStatus(
      submissionId,
      status,
      reviewerId,
      reviewNotes
    );

    if (!updatedSubmission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSubmission
    });

  } catch (error: any) {
    console.error('Admin update submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
