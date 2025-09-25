import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';
import { isValidAddress } from '../../../../../../lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // Get user with created agents count
    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        _count: {
          select: {
            createdAgents: true,
          },
        },
      },
    });

    if (!user) {
      // Return default user data for new addresses
      return NextResponse.json({
        address,
        isAdmin: false,
        createdAgentsCount: 0,
        isNewUser: true,
      });
    }

    return NextResponse.json({
      id: user.id,
      address: user.address,
      isAdmin: user.isAdmin,
      createdAgentsCount: user._count.createdAgents,
      balance: user.balance,
      joinedAt: user.joinedAt,
      lastActive: user.lastActive,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
