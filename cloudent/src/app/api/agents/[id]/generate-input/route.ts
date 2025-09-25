import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get agent and employment data
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get reviews separately
    const reviews = await prisma.review.findMany({
      where: { agentId: id },
      select: {
        hash: true,
        rating: true,
      },
    });

    // Prepare circuit input data - circuit expects 20 ratings and 16 review hashes
    const ratings = Array(20).fill("0");
    const reviewHashes = Array(16).fill("0");

    // Fill with actual review data (max 20 ratings, max 16 review hashes)
    reviews.forEach((review, index) => {
      if (index < 20) {
        ratings[index] = review.rating.toString();
      }
      if (index < 16) {
        // Convert hex hash to decimal string that circuit expects
        // Take first 32 chars of hex and convert to decimal, then pad to 80 chars
        const hexHash = review.hash.replace('0x', '');
        const decimalHash = BigInt('0x' + hexHash.substring(0, 32)).toString();
        reviewHashes[index] = decimalHash.padStart(80, '0');
      }
    });

    const totalUptime = agent.uptime.reduce((sum, val) => sum + val, 0);
    const totalAvgExecTime = agent.avgExecTime.reduce((sum, val) => sum + val, 0);
    const totalRequests = agent.requestsPerDay.reduce((sum, val) => sum + val, 0);
    const employmentCount = agent.users.length;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Convert agent ID to numeric format for circuit
    // We'll use a hash of the agent ID to create a numeric representation
    const agentIdHash = agent.id.split('').reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) & 0xfffff; // Keep it within reasonable bounds
    }, 0);

    const inputData = {
      ratings,
      reviewHashes,
      privateUptimeBps: totalUptime.toString(),
      privateAvgExecTimeMs: totalAvgExecTime.toString(),
      privateReqsPerDay: totalRequests.toString(),
      privateDeploymentCount: employmentCount.toString(),
      agentId: agentIdHash.toString(),
      epochDay: Math.floor(Date.now() / (1000 * 60 * 60 * 24)).toString(),
      numRatings: reviews.length.toString(),
      claimedUptimeBps: totalUptime.toString(),
      claimedAvgExecTimeMs: totalAvgExecTime.toString(),
      claimedReqsPerDay: totalRequests.toString(),
      claimedDeploymentCount: employmentCount.toString(),
      avgScaled: Math.floor(avgRating * 100).toString(),
    };

    return NextResponse.json({
      inputData,
      agentInfo: {
        name: agent.agentName,
        id: agent.id,
        agentId: agent.id,
        reviewsCount: reviews.length,
        employmentCount,
        totalUptime,
        totalRequests,
        avgRating: avgRating.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error generating input data:', error);
    return NextResponse.json({ error: 'Failed to generate input data' }, { status: 500 });
  }
}
