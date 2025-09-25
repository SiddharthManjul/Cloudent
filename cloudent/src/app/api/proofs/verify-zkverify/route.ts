import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
// import { prisma } from '../../../../../lib/db';

const ZKVERIFY_API_URL = process.env.ZKVERIFY_API_URL || 'https://relayer-api.horizenlabs.io/api/v1';
const API_KEY = process.env.API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { agentId, proof, publicSignals, chainId = 845320009 } = await request.json();

    if (!API_KEY) {
      return NextResponse.json({ error: 'zkVerify API key not configured' }, { status: 500 });
    }

    if (!agentId || !proof || !publicSignals) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Get verification key
    const verificationKeyPath = path.resolve(process.cwd(), '../reputation_circuit/build/verification_key.json');
    if (!fs.existsSync(verificationKeyPath)) {
      return NextResponse.json({ error: 'Verification key not found' }, { status: 500 });
    }

    const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));

    // Check for cached verification key hash
    let vkHash;
    const vkHashCachePath = path.join(process.cwd(), 'zkverify-vkey.json');
    
    if (fs.existsSync(vkHashCachePath)) {
      const cached = JSON.parse(fs.readFileSync(vkHashCachePath, 'utf8'));
      vkHash = cached.vkHash || cached.meta?.vkHash;
      console.log("📋 Using cached verification key hash:", vkHash);
    }

    // Register verification key if not cached
    if (!vkHash) {
      try {
        console.log("🔄 Registering verification key with zkVerify...");
        const regParams = {
          "proofType": "groth16",
          "proofOptions": { "library": "snarkjs", "curve": "bn128" },
          "vk": vKey
        };
        
        const regResponse = await axios.post(`${ZKVERIFY_API_URL}/register-vk/${API_KEY}`, regParams);
        fs.writeFileSync(vkHashCachePath, JSON.stringify(regResponse.data));
        vkHash = regResponse.data.vkHash || regResponse.data.meta?.vkHash;
        console.log("✅ Verification key registered with hash:", vkHash);
      } catch (error: unknown) {
        const errorData = (error as { response?: { data?: { code?: string; message?: string; meta?: { vkHash?: string } } } })?.response?.data;
        if (errorData?.code === 'REGISTER_VK_FAILED' && errorData?.message?.includes('already registered') && errorData?.meta?.vkHash) {
          vkHash = errorData.meta.vkHash;
          console.log("📋 Verification key already registered with hash:", vkHash);
          fs.writeFileSync(vkHashCachePath, JSON.stringify({ 
            vkHash: vkHash, 
            message: "Already registered", 
            registeredAt: new Date().toISOString() 
          }));
        } else {
          console.error("❌ Error registering verification key:", errorData || (error instanceof Error ? error.message : 'Unknown error'));
          return NextResponse.json({ 
            error: 'Failed to register verification key', 
            details: errorData || (error instanceof Error ? error.message : 'Unknown error') 
          }, { status: 500 });
        }
      }
    }

    // Submit proof for verification and aggregation
    try {
      console.log("📤 Submitting proof to zkVerify for aggregation...");
      const submitParams = {
        "proofType": "groth16",
        "vkRegistered": true,
        "chainId": chainId,
        "proofOptions": { "library": "snarkjs", "curve": "bn128" },
        "proofData": {
          "proof": proof,
          "publicSignals": publicSignals,
          "vk": vkHash
        }
      };

      const submitResponse = await axios.post(`${ZKVERIFY_API_URL}/submit-proof/${API_KEY}`, submitParams);

      if (submitResponse.data.optimisticVerify !== "success") {
        console.error("❌ Optimistic verification failed");
        return NextResponse.json({ error: 'Optimistic verification failed' }, { status: 400 });
      }

      console.log("✅ Optimistic verification successful!");
      console.log("🔍 Job ID:", submitResponse.data.jobId);

      return NextResponse.json({
        success: true,
        jobId: submitResponse.data.jobId,
        optimisticVerify: submitResponse.data.optimisticVerify,
      });

    } catch (error: unknown) {
      console.error("❌ Error submitting proof to zkVerify:", (error as { response?: { data?: Record<string, unknown> } })?.response?.data || (error instanceof Error ? error.message : 'Unknown error'));
      return NextResponse.json({ 
        error: 'Failed to submit proof to zkVerify', 
        details: (error as { response?: { data?: Record<string, unknown> } })?.response?.data || (error instanceof Error ? error.message : 'Unknown error') 
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in zkVerify verification:', error);
    return NextResponse.json({ 
      error: 'Failed to verify proof with zkVerify', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
