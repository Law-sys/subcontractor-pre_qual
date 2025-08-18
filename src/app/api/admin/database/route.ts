import { NextRequest, NextResponse } from 'next/server';
import { DatabaseInit } from '@/lib/database/init';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = await DatabaseInit.getHealthCheck();
    
    if (healthCheck.status === 'healthy') {
      return NextResponse.json({
        success: true,
        ...healthCheck
      });
    } else {
      return NextResponse.json({
        success: false,
        ...healthCheck
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize/reset database
    const result = await DatabaseInit.initializeDatabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
