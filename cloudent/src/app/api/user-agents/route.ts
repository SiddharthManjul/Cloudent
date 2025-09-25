import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { isValidAddress } from '../../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { agentId, userAddress } = await request.json();

    if (!isValidAddress(userAddress)) {
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Ensure user exists or create new user
    const user = await prisma.user.upsert({
      where: { address: userAddress },
      update: {},
      create: { address: userAddress },
    });

    // Check if user has already deployed this agent
    const existingDeployment = await prisma.userAgent.findUnique({
      where: {
        userId_agentId: {
          userId: user.id,
          agentId: agent.id,
        },
      },
    });

    if (existingDeployment) {
      return NextResponse.json({ error: 'Agent already deployed by this user' }, { status: 400 });
    }

    // Create deployment relationship
    const deployment = await prisma.userAgent.create({
      data: {
        userId: user.id,
        agentId: agent.id,
      },
    });

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.userId + deployment.agentId,
        agentId: deployment.agentId,
        userId: deployment.userId,
        employedAt: deployment.startedAt,
      },
    });

  } catch (error) {
    console.error('Error deploying agent:', error);
    return NextResponse.json({ error: 'Failed to deploy agent' }, { status: 500 });
  }
}
