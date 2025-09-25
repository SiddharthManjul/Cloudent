require('dotenv').config({ path: '../.env.local' });
const { PrismaClient } = require('@prisma/client');
const { keccak256 } = require('js-sha3');

const prisma = new PrismaClient();

function hashReview(review) {
  const firstHash = keccak256(review);
  const secondHash = keccak256(firstHash);
  return `0x${secondHash}`;
}

function generateProofId() {
  return `proof-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

async function addMockData() {
  console.log('Adding mock data to the database...');

  try {
    // Mock wallet addresses
    const mockCreators = [
      '0x1234567890123456789012345678901234567890',
      '0xabcdef1234567890abcdef1234567890abcdef12',
      '0x9876543210987654321098765432109876543210',
    ];

    const mockUsers = [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
    ];

    // Create mock users and creators
    const allAddresses = [...mockCreators, ...mockUsers];
    const users = [];
    
    for (const address of allAddresses) {
      const user = await prisma.user.upsert({
        where: { address },
        update: {},
        create: {
          address,
          balance: Math.random() * 1000,
        },
      });
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create mock agents
    const mockAgents = [
      {
        name: 'GPT-4 Enhanced Assistant',
        description: 'Advanced AI assistant with enhanced reasoning capabilities, specialized in complex problem-solving and detailed analysis.',
        creator: mockCreators[0],
        keywords: ['AI', 'GPT-4', 'assistant', 'reasoning', 'analysis'],
        usageDetails: 'Excellent for research, writing, coding assistance, and complex problem-solving. Available 24/7 with high accuracy.',
      },
      {
        name: 'Financial Analysis Bot',
        description: 'Specialized AI agent for financial market analysis, trading insights, and investment recommendations.',
        creator: mockCreators[0],
        keywords: ['finance', 'trading', 'analysis', 'investment', 'market'],
        usageDetails: 'Provides real-time market analysis, risk assessment, and portfolio optimization recommendations.',
      },
      {
        name: 'Code Review Assistant',
        description: 'AI-powered code review agent that identifies bugs, suggests improvements, and ensures best practices.',
        creator: mockCreators[1],
        keywords: ['code', 'review', 'programming', 'debugging', 'optimization'],
        usageDetails: 'Supports multiple programming languages. Provides detailed feedback on code quality, security, and performance.',
      },
      {
        name: 'Medical Consultation AI',
        description: 'Healthcare-focused AI agent providing preliminary medical consultations and health information.',
        creator: mockCreators[1],
        keywords: ['medical', 'healthcare', 'consultation', 'diagnosis', 'health'],
        usageDetails: 'For preliminary consultations only. Not a replacement for professional medical advice.',
      },
      {
        name: 'Language Translation Pro',
        description: 'Multi-language translation agent with context awareness and cultural nuance understanding.',
        creator: mockCreators[2],
        keywords: ['translation', 'language', 'multilingual', 'communication', 'localization'],
        usageDetails: 'Supports 50+ languages with high accuracy. Maintains context and cultural sensitivity in translations.',
      },
      {
        name: 'Creative Writing Companion',
        description: 'AI writing assistant specializing in creative content, storytelling, and content generation.',
        creator: mockCreators[2],
        keywords: ['writing', 'creative', 'content', 'storytelling', 'copywriting'],
        usageDetails: 'Perfect for authors, marketers, and content creators. Helps with brainstorming, drafting, and editing.',
      },
    ];

    const agents = [];
    for (const agentData of mockAgents) {
      // Generate realistic monitoring data
      const uptimeData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 24) + 20); // 20-23 hours
      const execTimeData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50); // 50-250ms
      const requestsData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 500) + 100); // 100-600 requests

      const agent = await prisma.agent.create({
        data: {
          agentName: agentData.name,
          description: agentData.description,
          creator: agentData.creator,
          keywords: agentData.keywords,
          usageDetails: agentData.usageDetails,
          uptime: uptimeData.map(val => parseFloat(val.toString())),
          avgExecTime: execTimeData.map(val => parseFloat(val.toString())),
          requestsPerDay: requestsData,
          currentUptime: uptimeData.reduce((sum, val) => sum + val, 0) / uptimeData.length,
          currentAvgExec: execTimeData.reduce((sum, val) => sum + val, 0) / execTimeData.length,
          currentRequests: requestsData.reduce((sum, val) => sum + val, 0) / requestsData.length,
        },
      });
      agents.push(agent);
    }

    console.log(`Created ${agents.length} agents`);

    // Create mock reviews
    const reviewComments = [
      'Excellent AI agent! Very responsive and accurate.',
      'Good performance but could be faster.',
      'Outstanding results! Highly recommended.',
      'Average performance, works as expected.',
      'Exceptional quality and reliability.',
      'Fast and efficient, great for my needs.',
      'Could use some improvements but overall good.',
      'Amazing accuracy and detailed responses.',
      'Reliable and consistent performance.',
      'Great value for the service provided.',
    ];

    let reviewCount = 0;
    for (const agent of agents) {
      // Add 3-8 reviews per agent
      const numReviews = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numReviews; i++) {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
        
        const user = users.find(u => u.address === randomUser);
        if (user) {
          await prisma.review.create({
            data: {
              agentId: agent.id,
              userId: user.id,
              rating,
              content: randomComment,
              hash: hashReview(randomComment),
            },
          });
          reviewCount++;
        }
      }
    }

    console.log(`Created ${reviewCount} reviews`);

    // Create some user-agent relationships (employed agents)
    let employmentCount = 0;
    for (const user of users.slice(0, mockUsers.length)) { // Only regular users employ agents
      const numEmployed = Math.floor(Math.random() * 3) + 1; // Employ 1-3 agents
      const randomAgents = agents.sort(() => 0.5 - Math.random()).slice(0, numEmployed);
      
      for (const agent of randomAgents) {
        try {
          await prisma.userAgent.create({
            data: {
              userId: user.id,
              agentId: agent.id,
            },
          });
          employmentCount++;
        } catch (error) {
          // Skip if relationship already exists
        }
      }
    }

    console.log(`Created ${employmentCount} user-agent employment relationships`);

    // Create some sample proofs for agents
    let proofCount = 0;
    for (const agent of agents) {
      // Add 1-3 proofs per agent
      const numProofs = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numProofs; i++) {
        const reviews = await prisma.review.findMany({
          where: { agentId: agent.id },
          select: { hash: true },
        });

        await prisma.proof.create({
          data: {
            agentId: agent.id,
            proofId: generateProofId(),
            reviews: reviews.map(r => r.hash),
            agentUptime: agent.uptime.slice(-7), // Last 7 days
            avgExecTime: agent.avgExecTime.slice(-7),
            requestsPerDay: agent.requestsPerDay.slice(-7),
            zkVerifyTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            horizenTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            aggregationId: Math.floor(Math.random() * 10000),
            verified: Math.random() > 0.3, // 70% chance of being verified
            verifiedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
          },
        });
        proofCount++;
      }
    }

    console.log(`Created ${proofCount} proofs`);

    console.log('\n✅ Mock data added successfully!');
    console.log('\nMock Data Summary:');
    console.log(`📝 Users: ${users.length}`);
    console.log(`🤖 Agents: ${agents.length}`);
    console.log(`⭐ Reviews: ${reviewCount}`);
    console.log(`🔗 Employments: ${employmentCount}`);
    console.log(`🛡️ Proofs: ${proofCount}`);
    
    console.log('\nMock Creator Addresses:');
    mockCreators.forEach((addr, i) => {
      console.log(`Creator ${i + 1}: ${addr}`);
    });
    
    console.log('\nMock User Addresses:');
    mockUsers.forEach((addr, i) => {
      console.log(`User ${i + 1}: ${addr}`);
    });

  } catch (error) {
    console.error('Error adding mock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMockData();
