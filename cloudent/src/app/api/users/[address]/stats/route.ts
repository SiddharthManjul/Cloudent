import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

// GET /api/users/[address]/stats - Get user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    // Get user with employed agents
    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        employedAgents: true,
      },
    });

    if (!user) {
      // Return default stats for new users
      return NextResponse.json({
        totalAgentsEmployed: 0,
        totalSpent: 0,
        averageRating: 0,
        reviewsGiven: 0,
      });
    }

    // Get user's reviews
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
    });

    // Calculate stats
    const totalAgentsEmployed = user.employedAgents.length;
    const totalSpent = 0; // TODO: Calculate based on actual usage/payments
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    const reviewsGiven = reviews.length;

    return NextResponse.json({
      totalAgentsEmployed,
      totalSpent,
      averageRating,
      reviewsGiven,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
