import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to get Cloudflare API token
async function getCloudflareApiToken(): Promise<string> {
  try {
    // Try to get from API config endpoint
    const configResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/config`);
    if (configResponse.ok) {
      const configData = await configResponse.json();
      if (configData.success && configData.config.cloudflareApiToken) {
        return configData.config.cloudflareApiToken;
      }
    }
  } catch (error) {
    console.error('Error fetching API config:', error);
  }
  
  // Fallback to default token
  return "DaUhMVKy4ZEMwwG3UF9kPdF7L4DtzYp65HZlf4Sl";
}

// DELETE - Delete email routing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ruleId } = body;

    if (!ruleId) {
      return NextResponse.json({
        success: false,
        error: 'Missing ruleId'
      }, { status: 400 });
    }

    // Get email routing details first
    const emailRouting = await db.emailRouting.findUnique({
      where: { id }
    });

    if (!emailRouting) {
      return NextResponse.json({
        success: false,
        error: 'Email routing not found'
      }, { status: 404 });
    }

    // Delete from Cloudflare API
    const cloudflareApiToken = await getCloudflareApiToken();
    const deleteResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${emailRouting.zoneId}/email/routing/rules/${ruleId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`Failed to delete routing rule: ${errorData.message || deleteResponse.statusText}`);
    }

    // Delete from database
    await db.emailRouting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Email routing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}