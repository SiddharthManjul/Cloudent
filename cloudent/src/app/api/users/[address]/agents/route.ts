import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

// GET /api/users/[address]/agents - Get user's employed agents
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const userAgents = await prisma.userAgent.findMany({
      where: {
        user: {
          address: params.address,
        },
      },
      include: {
        agent: {
          include: {
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
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json(userAgents);
  } catch (error) {
    console.error('Error fetching user agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user agents' },
      { status: 500 }
    );
  }
}
