import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { isValidAddress } from '../../../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { address },
      include: {
        _count: {
          select: { createdAgents: true },
        },
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { address },
        include: {
          _count: {
            select: { createdAgents: true },
          },
        },
      });
    }

    // Mark user as creator (we'll consider anyone who has registered as a creator)
    // You could add a separate creator flag to the User model if needed

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        address: user.address,
        isCreator: true,
        agentsCount: user._count.createdAgents,
      },
    });
  } catch (error) {
    console.error('Error registering creator:', error);
    return NextResponse.json({ error: 'Failed to register creator' }, { status: 500 });
  }
}
