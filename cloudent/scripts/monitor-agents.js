const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Simulate monitoring data collection
function generateRandomMonitoringData() {
  return {
    uptime: Math.random() * 24, // 0-24 hours
    avgExecTime: 50 + Math.random() * 200, // 50-250ms
    requestsCount: Math.floor(Math.random() * 1000) + 100, // 100-1100 requests
  };
}

async function monitorAgents() {
  try {
    console.log('🔍 Starting agent monitoring...');
    
    // Get all active agents
    const agents = await prisma.agent.findMany();
    
    console.log(`📊 Monitoring ${agents.length} agents`);
    
    for (const agent of agents) {
      const monitoringData = generateRandomMonitoringData();
      
      console.log(`📈 Monitoring ${agent.agentName}:`);
      console.log(`  - Uptime: ${monitoringData.uptime.toFixed(2)} hours`);
      console.log(`  - Avg Exec Time: ${monitoringData.avgExecTime.toFixed(2)}ms`);
      console.log(`  - Requests: ${monitoringData.requestsCount}`);
      
      // Send monitoring data to API
      const response = await fetch(`http://localhost:3000/api/monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          uptime: monitoringData.uptime,
          avgExecTime: monitoringData.avgExecTime,
          requestsCount: monitoringData.requestsCount,
        }),
      });
      
      if (response.ok) {
        console.log(`✅ Updated monitoring data for ${agent.agentName}`);
      } else {
        console.error(`❌ Failed to update monitoring data for ${agent.agentName}`);
      }
    }
    
    console.log('✅ Agent monitoring completed');
  } catch (error) {
    console.error('❌ Error monitoring agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run monitoring
monitorAgents();
