import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// GET /api/agents/[id] - Get agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        creatorUser: {
          select: {
            address: true,
          },
        },
        proofs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            proofId: true,
            verified: true,
            zkVerifyTxHash: true,
            horizenTxHash: true,
            aggregationId: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                address: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { agentName, description, keywords, usageDetails, creator } = body;

    // Check if agent exists and user is the creator
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (existingAgent.creator !== creator) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        agentName,
        description,
        keywords,
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

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator address required' },
        { status: 400 }
      );
    }

    // Check if agent exists and user is the creator
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (existingAgent.creator !== creator) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.agent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
