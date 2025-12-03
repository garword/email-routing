import { NextRequest, NextResponse } from 'next/server';

// GET - Get API configuration
export async function GET() {
  try {
    // In a real app, you would get this from a secure database
    // For demo purposes, we'll return the default configuration
    const defaultConfig = {
      cloudflareApiToken: "DaUhMVKy4ZEMwwG3UF9kPdF7L4DtzYp65HZlf4Sl",
      accountId: "cd83bf9065a6d97b76cf390d8b1ae1ed",
      d1Database: "ba9f6de9-78cf-4e21-93c3-cc1c1a14e18f",
      workerApi: "gNM_ATjIHt7sjRBCRjJEwwHTq5p2jRJQcVUJr305",
      kvStorage: "fc9664c85b18483392ceffe43293ca12"
    };

    return NextResponse.json({
      success: true,
      config: defaultConfig
    });
  } catch (error) {
    console.error('Error fetching API configuration:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Save API configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cloudflareApiToken, accountId, d1Database, workerApi, kvStorage } = body;

    // Validate required fields
    if (!cloudflareApiToken || !accountId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: cloudflareApiToken, accountId'
      }, { status: 400 });
    }

    // In a real app, you would save this to a secure database
    // For demo purposes, we'll just return success
    console.log('API Configuration saved:', {
      cloudflareApiToken: cloudflareApiToken.substring(0, 10) + '...',
      accountId,
      d1Database,
      workerApi,
      kvStorage
    });

    return NextResponse.json({
      success: true,
      message: 'API configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving API configuration:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}