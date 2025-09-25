import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

export async function GET() {
  try {
    // Verify admin access (you might want to add proper authentication here)
    // For now, we'll just return the stats without strict auth check
    // In production, you should verify the admin token/session

    // Get total counts
    const [totalUsers, totalAgents, totalProofs, totalVerifiedProofs, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.agent.count(),
      prisma.proof.count(),
      prisma.proof.count({ where: { verified: true } }),
      prisma.user.count({ where: { isAdmin: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalAgents,
      totalProofs,
      totalVerifiedProofs,
      totalAdmins,
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
