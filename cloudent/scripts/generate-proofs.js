const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configuration
const CIRCUIT_DIR = '../reputation_circuit';
const CIRCUIT_WASM_PATH = path.join(CIRCUIT_DIR, 'build/cloudent_js/cloudent.wasm');
const CIRCUIT_ZKEY_PATH = path.join(CIRCUIT_DIR, 'build/cloudent.zkey');
const VERIFICATION_KEY_PATH = path.join(CIRCUIT_DIR, 'build/verification_key.json');

// Helper function to generate proof ID
function generateProofId(agentId, timestamp) {
  return crypto.createHash('sha256').update(`${agentId}-${timestamp}`).digest('hex');
}

// Helper function to calculate average
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// Helper function to calculate total
function calculateTotal(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Helper function to scale average rating
function scaleRating(averageRating) {
  return Math.round(averageRating * 100); // Scale 4.1 to 410
}

// Helper function to get review root hash (simplified - using merkle tree would be better)
function calculateReviewRootHash(reviewHashes) {
  if (reviewHashes.length === 0) return '0';
  
  // Simple hash of all review hashes concatenated
  const concatenated = reviewHashes.join('');
  const hash = crypto.createHash('sha256').update(concatenated).digest('hex');
  return BigInt('0x' + hash.substring(0, 16)).toString(); // Convert to decimal string
}

async function generateCircuitInput(agent, reviews) {
  try {
    console.log(`📊 Generating circuit input for ${agent.agentName}`);
    
    // Get the latest 20 reviews (circuit supports up to 20)
    const latestReviews = reviews.slice(0, 20);
    
    // Prepare ratings array (pad with zeros if less than 20)
    const ratings = Array(20).fill(0);
    latestReviews.forEach((review, index) => {
      ratings[index] = review.rating.toString();
    });
    
    // Prepare review hashes array (pad with zeros if less than 16)
    const reviewHashes = Array(16).fill('0');
    latestReviews.slice(0, 16).forEach((review, index) => {
      // Convert hash to a large number for the circuit
      const hashBigInt = BigInt(review.hash);
      reviewHashes[index] = hashBigInt.toString();
    });
    
    // Calculate averages and totals
    const actualReviews = latestReviews.filter(r => r.rating > 0);
    const averageRating = actualReviews.length > 0 
      ? actualReviews.reduce((sum, r) => sum + r.rating, 0) / actualReviews.length 
      : 0;
    
    const totalUptime = calculateTotal(agent.uptime);
    const avgExecTime = calculateAverage(agent.avgExecTime);
    const totalRequests = calculateTotal(agent.requestsPerDay);
    
    // Prepare circuit input
    const circuitInput = {
      ratings,
      reviewHashes,
      privateUptimeBps: Math.round(totalUptime * 100).toString(), // Convert hours to basis points
      privateAvgExecTimeMs: Math.round(avgExecTime).toString(),
      privateReqsPerDay: totalRequests.toString(),
      privateDeploymentCount: "1", // Simplified - could track actual deployments
      agentId: agent.id.slice(0, 10), // Use first 10 chars as numeric ID
      epochDay: Math.floor(Date.now() / (1000 * 60 * 60 * 24)).toString(), // Days since epoch
      numRatings: actualReviews.length.toString(),
      claimedUptimeBps: Math.round(totalUptime * 100).toString(),
      claimedAvgExecTimeMs: Math.round(avgExecTime).toString(),
      claimedReqsPerDay: totalRequests.toString(),
      claimedDeploymentCount: "1",
      avgScaled: scaleRating(averageRating).toString()
    };
    
    console.log(`  ✅ Circuit input generated:`);
    console.log(`    - Reviews: ${actualReviews.length}`);
    console.log(`    - Average Rating: ${averageRating.toFixed(2)} (scaled: ${circuitInput.avgScaled})`);
    console.log(`    - Total Uptime: ${totalUptime.toFixed(2)} hours`);
    console.log(`    - Avg Exec Time: ${avgExecTime.toFixed(2)}ms`);
    console.log(`    - Total Requests: ${totalRequests}`);
    
    return circuitInput;
  } catch (error) {
    console.error(`❌ Error generating circuit input for ${agent.agentName}:`, error);
    throw error;
  }
}

async function generateProofUsingCircuit(agentId, circuitInput) {
  try {
    console.log(`🔄 Generating proof for agent ${agentId}...`);
    
    // Create input file for the circuit
    const inputPath = path.join(CIRCUIT_DIR, `input_${agentId}.json`);
    fs.writeFileSync(inputPath, JSON.stringify(circuitInput, null, 2));
    
    // Import snarkjs dynamically (ES module)
    const snarkjs = await import('snarkjs');
    
    // Generate witness
    const wasmPath = path.resolve(CIRCUIT_WASM_PATH);
    const zkeyPath = path.resolve(CIRCUIT_ZKEY_PATH);
    
    console.log(`  📝 Generating witness...`);
    const { witness } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );
    
    console.log(`  🔧 Generating proof...`);
    const proof = await snarkjs.groth16.prove(zkeyPath, witness);
    
    // Extract public signals
    const publicSignals = [
      circuitInput.avgScaled,
      circuitInput.numRatings,
      calculateReviewRootHash(circuitInput.reviewHashes.filter(h => h !== '0')),
      circuitInput.claimedUptimeBps,
      circuitInput.claimedAvgExecTimeMs,
      circuitInput.claimedReqsPerDay,
      circuitInput.claimedDeploymentCount,
      circuitInput.agentId,
      circuitInput.epochDay
    ];
    
    // Clean up input file
    fs.unlinkSync(inputPath);
    
    console.log(`  ✅ Proof generated successfully`);
    
    return {
      proof,
      publicSignals
    };
    
  } catch (error) {
    console.error(`❌ Error generating proof:`, error);
    throw error;
  }
}

async function verifyProofWithZkVerify(proof, publicSignals) {
  try {
    console.log(`  🔄 Verifying proof with zkVerify...`);
    
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error('API_KEY not found in environment variables');
    }
    
    const API_URL = 'https://relayer-api.horizenlabs.io/api/v1';
    
    // Check if verification key is registered (simplified - in production, cache this)
    let vkHash;
    try {
      const vKey = JSON.parse(fs.readFileSync(path.resolve(VERIFICATION_KEY_PATH), 'utf8'));
      
      const regParams = {
        "proofType": "groth16",
        "proofOptions": {
          "library": "snarkjs",
          "curve": "bn128"
        },
        "vk": vKey
      };
      
      const regResponse = await axios.post(`${API_URL}/register-vk/${API_KEY}`, regParams);
      vkHash = regResponse.data.vkHash || regResponse.data.meta?.vkHash;
    } catch (error) {
      // If registration fails because already registered, extract hash from error
      if (error.response?.data?.meta?.vkHash) {
        vkHash = error.response.data.meta.vkHash;
        console.log(`    📋 Using existing verification key hash: ${vkHash}`);
      } else {
        throw error;
      }
    }
    
    // Submit proof for verification
    const params = {
      "proofType": "groth16",
      "vkRegistered": true,
      "chainId": 845320009, // Horizen testnet
      "proofOptions": {
        "library": "snarkjs",
        "curve": "bn128"
      },
      "proofData": {
        "proof": proof,
        "publicSignals": publicSignals,
        "vk": vkHash
      }
    };
    
    console.log(`    📤 Submitting proof to zkVerify...`);
    const submitResponse = await axios.post(`${API_URL}/submit-proof/${API_KEY}`, params);
    
    if (submitResponse.data.optimisticVerify !== "success") {
      throw new Error('Optimistic verification failed');
    }
    
    const jobId = submitResponse.data.jobId;
    console.log(`    ✅ Proof submitted successfully! Job ID: ${jobId}`);
    
    // Wait for aggregation
    console.log(`    ⏳ Waiting for aggregation...`);
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts with 30 second intervals = 10 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      try {
        const statusResponse = await axios.get(`${API_URL}/job-status/${API_KEY}/${jobId}`);
        const status = statusResponse.data.status;
        
        console.log(`    📈 Job status: ${status}`);
        
        if (status === "Aggregated") {
          console.log(`    🎉 Proof aggregated successfully!`);
          return {
            jobId,
            zkVerifyTxHash: statusResponse.data.txHash,
            horizenTxHash: statusResponse.data.aggregationDetails?.receipt,
            aggregationId: statusResponse.data.aggregationId,
            verified: true
          };
        } else if (status === "Failed") {
          throw new Error('Proof verification failed');
        }
        
        attempts++;
      } catch (statusError) {
        console.error(`    ❌ Error checking status:`, statusError.message);
        attempts++;
      }
    }
    
    // If we get here, verification didn't complete in time
    console.log(`    ⏰ Verification taking longer than expected, continuing with job ID: ${jobId}`);
    return {
      jobId,
      verified: false
    };
    
  } catch (error) {
    console.error(`    ❌ Error verifying with zkVerify:`, error.message);
    throw error;
  }
}

async function generateProofsForAllAgents() {
  try {
    console.log('🚀 Starting proof generation for all agents...');
    console.log(`📅 ${new Date().toISOString()}`);
    
    // Get all agents
    const agents = await prisma.agent.findMany({
      include: {
        proofs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`🤖 Found ${agents.length} agents to process`);
    
    for (const agent of agents) {
      try {
        console.log(`\n🔄 Processing ${agent.agentName} (${agent.id})`);
        
        // Get reviews for this agent
        const reviews = await prisma.review.findMany({
          where: { agentId: agent.id },
          orderBy: { createdAt: 'desc' }
        });
        
        console.log(`  📝 Found ${reviews.length} reviews`);
        
        // Generate circuit input
        const circuitInput = await generateCircuitInput(agent, reviews);
        
        // Generate proof
        const { proof, publicSignals } = await generateProofUsingCircuit(agent.id, circuitInput);
        
        // Verify with zkVerify
        const verificationResult = await verifyProofWithZkVerify(proof, publicSignals);
        
        // Create or update proof record
        const proofId = generateProofId(agent.id, Date.now());
        
        const proofData = {
          agentId: agent.id,
          proofId,
          reviews: reviews.map(r => r.hash),
          agentUptime: agent.uptime,
          avgExecTime: agent.avgExecTime,
          requestsPerDay: agent.requestsPerDay,
          zkVerifyTxHash: verificationResult.zkVerifyTxHash,
          horizenTxHash: verificationResult.horizenTxHash,
          aggregationId: verificationResult.aggregationId,
          verified: verificationResult.verified,
          verifiedAt: verificationResult.verified ? new Date() : null
        };
        
        const savedProof = await prisma.proof.create({
          data: proofData
        });
        
        console.log(`  ✅ Proof saved with ID: ${savedProof.id}`);
        
        if (verificationResult.verified) {
          console.log(`  🎉 Verification completed for ${agent.agentName}!`);
          console.log(`    - zkVerify TX: ${verificationResult.zkVerifyTxHash}`);
          console.log(`    - Horizen TX: ${verificationResult.horizenTxHash}`);
          console.log(`    - Aggregation ID: ${verificationResult.aggregationId}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing agent ${agent.agentName}:`, error.message);
        // Continue with next agent
      }
    }
    
    console.log('\n🎉 Proof generation completed for all agents!');
    
  } catch (error) {
    console.error('❌ Fatal error in proof generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this script is run directly
if (require.main === module) {
  generateProofsForAllAgents();
}

module.exports = {
  generateProofsForAllAgents,
  generateCircuitInput,
  generateProofUsingCircuit,
  verifyProofWithZkVerify
};
