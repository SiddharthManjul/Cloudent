import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

// GET /api/creators/[address]/stats - Get creator statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    // Get creator's agents
    const agents = await prisma.agent.findMany({
      where: { creator: params.address },
      include: {
        users: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Get reviews for creator's agents
    const agentIds = agents.map(agent => agent.id);
    const reviews = await prisma.review.findMany({
      where: {
        agentId: {
          in: agentIds,
        },
      },
    });

    // Calculate stats
    const totalAgents = agents.length;
    const totalEarnings = 0; // TODO: Calculate based on actual usage/payments
    const totalUsers = agents.reduce((sum, agent) => sum + agent._count.users, 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      totalAgents,
      totalEarnings,
      totalUsers,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator stats' },
      { status: 500 }
    );
  }
}
