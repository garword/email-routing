import { NextRequest, NextResponse } from 'next/server';

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

// Helper function to get Cloudflare Account ID
async function getCloudflareAccountId(): Promise<string> {
  try {
    // Try to get from API config endpoint
    const configResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/config`);
    if (configResponse.ok) {
      const configData = await configResponse.json();
      if (configData.success && configData.config.accountId) {
        return configData.config.accountId;
      }
    }
  } catch (error) {
    console.error('Error fetching API config:', error);
  }
  
  // Fallback to default account ID
  return "cd83bf9065a6d97b76cf390d8b1ae1ed";
}

export async function GET() {
  try {
    const cloudflareApiToken = await getCloudflareApiToken();
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones?status=active&per_page=50`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      zones: data.result || []
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}