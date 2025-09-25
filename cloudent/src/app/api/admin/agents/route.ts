import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

export async function GET() {
  try {
    // Verify admin access (you might want to add proper authentication here)
    // For now, we'll just return the data without strict auth check
    // In production, you should verify the admin token/session

    // Get all agents with related data
    const agents = await prisma.agent.findMany({
      include: {
        users: true,
        proofs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { dateOfStart: 'desc' },
    });

    const agentSummaries = agents.map(agent => {
      const latestProof = agent.proofs[0];
      const totalUptime = agent.uptime.reduce((sum, val) => sum + val, 0);
      
      return {
        id: agent.id,
        agentName: agent.agentName,
        creator: agent.creator,
        uptime: totalUptime,
        isVerified: latestProof?.verified || false,
        userCount: agent._count.users,
        lastProofDate: latestProof?.createdAt || null,
        dateOfStart: agent.dateOfStart,
        currentAvgExec: agent.currentAvgExec,
        currentRequests: agent.currentRequests,
      };
    });

    return NextResponse.json(agentSummaries);

  } catch (error) {
    console.error('Error fetching admin agents:', error);
    return NextResponse.json({ error: 'Failed to fetch admin agents' }, { status: 500 });
  }
}
