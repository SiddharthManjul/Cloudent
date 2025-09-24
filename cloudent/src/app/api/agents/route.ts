import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { hashReview, generateProofId, isValidAddress } from '../../../../lib/utils';

// GET /api/agents - Get all agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    
    const whereClause = creator ? { creator } : {};
    
    const agents = await prisma.agent.findMany({
      where: whereClause,
      include: {
        creatorUser: {
          select: {
            address: true,
          },
        },
        proofs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            verified: true,
            zkVerifyTxHash: true,
            horizenTxHash: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { dateOfStart: 'desc' },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentName, description, creator, keywords, usageDetails } = body;

    // Validate required fields
    if (!agentName || !description || !creator || !usageDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate creator address
    if (!isValidAddress(creator)) {
      return NextResponse.json(
        { error: 'Invalid creator address' },
        { status: 400 }
      );
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { address: creator },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { address: creator },
      });
    }

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        agentName,
        description,
        creator,
        keywords: keywords || [],
        usageDetails,
      },
      include: {
        creatorUser: {
          select: {
            address: true,
          },
        },
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
