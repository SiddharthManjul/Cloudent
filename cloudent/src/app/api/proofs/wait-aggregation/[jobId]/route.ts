import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../../../../../lib/db';
import { generateProofId } from '../../../../../../lib/utils';

const ZKVERIFY_API_URL = process.env.ZKVERIFY_API_URL || 'https://relayer-api.horizenlabs.io/api/v1';
const API_KEY = process.env.API_KEY;

export async function POST(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const { agentId } = await request.json();

    if (!API_KEY) {
      return NextResponse.json({ error: 'zkVerify API key not configured' }, { status: 500 });
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    console.log("⏳ Waiting for proof to be aggregated on zkVerify...");
    
    // Poll for aggregation status
    let attempts = 0;
    const maxAttempts = 15; // 5 minutes total (20s * 15)
    
    while (attempts < maxAttempts) {
      try {
        const statusResponse = await axios.get(`${ZKVERIFY_API_URL}/job-status/${API_KEY}/${jobId}`);
        const status = statusResponse.data.status;
        console.log("📈 Job status:", status);

        if (status === "Aggregated") {
          console.log("🎉 Proof successfully aggregated on zkVerify!");
          
          const zkVerifyTxHash = statusResponse.data.txHash;
          const zkVerifyBlockHash = statusResponse.data.blockHash;
          const aggregationId = statusResponse.data.aggregationId;
          const aggregationDetails = statusResponse.data.aggregationDetails;
          
          console.log("\n🔗 zkVerify Blockchain:");
          console.log("  📜 Transaction hash:", zkVerifyTxHash);
          console.log("  🔗 Block hash:", zkVerifyBlockHash);
          console.log("  🔢 Aggregation ID:", aggregationId);

          let horizenReceiptHash = null;
          let horizenBlockHash = null;

          if (aggregationDetails && aggregationDetails.receipt) {
            horizenReceiptHash = aggregationDetails.receipt;
            horizenBlockHash = aggregationDetails.receiptBlockHash;
            
            console.log("\n🌐 Horizen Testnet:");
            console.log("  📜 Receipt hash:", horizenReceiptHash);
            console.log("  🔗 Receipt block hash:", horizenBlockHash);
            console.log("  🌳 Merkle root:", aggregationDetails.root);
            console.log("  🍃 Leaf:", aggregationDetails.leaf);
            console.log("  📍 Leaf index:", aggregationDetails.leafIndex);
            console.log("  📊 Number of leaves:", aggregationDetails.numberOfLeaves);
          }

          // Save aggregation details
          const aggregationData = {
            ...aggregationDetails,
            aggregationId: aggregationId,
            statement: statusResponse.data.statement,
            txHash: zkVerifyTxHash,
            blockHash: zkVerifyBlockHash
          };
          
          const aggregationFilePath = path.join(process.cwd(), 'temp_proofs', 'aggregation.json');
          fs.mkdirSync(path.dirname(aggregationFilePath), { recursive: true });
          fs.writeFileSync(aggregationFilePath, JSON.stringify(aggregationData, null, 2));
          console.log("\n💾 Aggregation details saved to aggregation.json");

          // Save proof to database if agentId provided
          if (agentId) {
            try {
              const agent = await prisma.agent.findUnique({
                where: { id: agentId },
              });

              if (agent) {
                // Get reviews separately
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
                    zkVerifyTxHash: zkVerifyTxHash,
                    horizenTxHash: horizenReceiptHash,
                    aggregationId: aggregationId,
                    verified: true,
                    verifiedAt: new Date(),
                  },
                });
                console.log("💾 Proof saved to database");
              }
            } catch (dbError) {
              console.error("Warning: Failed to save proof to database:", dbError);
              // Don't fail the request if DB save fails
            }
          }

          return NextResponse.json({
            success: true,
            jobId: jobId,
            zkVerifyTxHash: zkVerifyTxHash,
            zkVerifyBlockHash: zkVerifyBlockHash,
            aggregationId: aggregationId,
            horizenReceiptHash: horizenReceiptHash,
            horizenBlockHash: horizenBlockHash,
            aggregationDetails: aggregationDetails,
          });

        } else if (status === "Failed") {
          console.error("❌ Proof verification failed on zkVerify");
          return NextResponse.json({ 
            success: false, 
            jobId: jobId, 
            error: 'Proof verification failed' 
          }, { status: 400 });
        }

        // Still processing, wait before next check
        console.log("⏳ Still processing... waiting 20 seconds before next check");
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
        attempts++;

      } catch (error: unknown) {
        console.error("❌ Error checking job status:", (error as { response?: { data?: Record<string, unknown> } })?.response?.data || (error instanceof Error ? error.message : 'Unknown error'));
        
        if (attempts >= maxAttempts - 1) {
          return NextResponse.json({ 
            success: false, 
            jobId: jobId, 
            error: 'Timeout waiting for aggregation',
            details: (error as { response?: { data?: Record<string, unknown> } })?.response?.data || (error instanceof Error ? error.message : 'Unknown error') 
          }, { status: 408 });
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 20000));
        attempts++;
      }
    }

    // Timeout reached
    return NextResponse.json({ 
      success: false, 
      jobId: jobId, 
      error: 'Timeout waiting for aggregation - proof may still be processing' 
    }, { status: 408 });

  } catch (error: unknown) {
    console.error('Error waiting for aggregation:', error);
    return NextResponse.json({ 
      error: 'Failed to wait for aggregation', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
