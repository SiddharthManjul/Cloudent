import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { hashReview, isValidAddress } from '../../../../lib/utils';

// GET /api/reviews - Get reviews for an agent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, userId, content, rating } = body;

    // Validate required fields
    if (!agentId || !userId || !content || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate user address
    if (!isValidAddress(userId)) {
      return NextResponse.json(
        { error: 'Invalid user address' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { address: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { address: userId },
      });
    }

    // Generate hash for the review
    const reviewHash = hashReview(content);

    // Create review
    const review = await prisma.review.create({
      data: {
        agentId,
        userId,
        content,
        rating,
        hash: reviewHash,
      },
    });

    // Update the agent's proof with the new review hash
    // Find the latest proof for this agent
    const latestProof = await prisma.proof.findFirst({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestProof) {
      // Add the new review hash to the existing reviews array
      const updatedReviews = [...latestProof.reviews, reviewHash];
      
      await prisma.proof.update({
        where: { id: latestProof.id },
        data: {
          reviews: updatedReviews,
        },
      });
    } else {
      // Create a new proof if none exists
      const proofId = generateProofId(agentId, Date.now());
      await prisma.proof.create({
        data: {
          agentId,
          proofId,
          reviews: [reviewHash],
        },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
