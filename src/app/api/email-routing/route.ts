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

// GET - List all email routing
export async function GET() {
  try {
    const emails = await db.emailRouting.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      emails
    });
  } catch (error) {
    console.error('Error fetching email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new email routing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zoneId, aliasPart, destinationEmail } = body;

    if (!zoneId || !aliasPart || !destinationEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: zoneId, aliasPart, destinationEmail'
      }, { status: 400 });
    }

    // Get zone details
    const cloudflareApiToken = await getCloudflareApiToken();
    const zoneResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!zoneResponse.ok) {
      throw new Error(`Failed to get zone details: ${zoneResponse.status} ${zoneResponse.statusText}`);
    }

    const zoneData = await zoneResponse.json();
    const zoneName = zoneData.result.name;
    const fullEmail = `${aliasPart}@${zoneName}`;

    // Create email routing rule
    const routingResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          matchers: [
            {
              type: "literal",
              field: "to",
              value: fullEmail
            }
          ],
          actions: [
            {
              type: "forward",
              value: [destinationEmail]
            }
          ],
          name: `Auto-generated via Email Manager`
        })
      }
    );

    if (!routingResponse.ok) {
      const errorData = await routingResponse.json();
      throw new Error(`Failed to create routing rule: ${errorData.message || routingResponse.statusText}`);
    }

    const routingData = await routingResponse.json();
    const ruleId = routingData.result.id;

    // Save to database
    const newEmailRouting = await db.emailRouting.create({
      data: {
        zoneId,
        zoneName,
        aliasPart,
        fullEmail,
        ruleId,
        destination: destinationEmail,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      email: newEmailRouting
    });
  } catch (error) {
    console.error('Error creating email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}