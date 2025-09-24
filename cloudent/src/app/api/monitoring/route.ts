import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { calculateAverage, calculateTotal } from '../../../../lib/utils';

// POST /api/monitoring - Log monitoring data for agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, uptime, avgExecTime, requestsCount } = body;

    // Validate required fields
    if (!agentId || uptime === undefined || avgExecTime === undefined || requestsCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create monitoring log
    const monitoringLog = await prisma.monitoringLog.create({
      data: {
        agentId,
        uptime,
        avgExecTime,
        requestsCount,
      },
    });

    // Update agent's monitoring arrays and current values
    const updatedUptime = [...agent.uptime, uptime];
    const updatedAvgExecTime = [...agent.avgExecTime, avgExecTime];
    const updatedRequestsPerDay = [...agent.requestsPerDay, requestsCount];

    // Calculate current aggregated values
    const currentUptime = calculateTotal(updatedUptime);
    const currentAvgExec = calculateAverage(updatedAvgExecTime);
    const currentRequests = calculateTotal(updatedRequestsPerDay);

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        uptime: updatedUptime,
        avgExecTime: updatedAvgExecTime,
        requestsPerDay: updatedRequestsPerDay,
        currentUptime,
        currentAvgExec,
        currentRequests,
      },
    });

    return NextResponse.json({
      monitoringLog,
      agent: updatedAgent,
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to log monitoring data' },
      { status: 500 }
    );
  }
}

// GET /api/monitoring - Get monitoring data for an agent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const monitoringLogs = await prisma.monitoringLog.findMany({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json(monitoringLogs);
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
