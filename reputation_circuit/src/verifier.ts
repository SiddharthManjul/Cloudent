import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export class CloudentVerifier {
  private verificationKeyPath: string;
  private apiUrl: string = "https://relayer-api.horizenlabs.io/api/v1";
  private apiKey: string;
  private vkHashCachePath: string = "./zkverify-vkey.json";

  constructor(vkeyPath: string = "./build/verification_key.json") {
    this.verificationKeyPath = path.resolve(vkeyPath);
    this.apiKey = process.env.API_KEY || "";
    
    if (!this.apiKey) {
      console.warn("⚠️  API_KEY not found in environment variables. zkVerify verification will not be available.");
    }
  }

  /**
   * Register verification key with zkVerify relayer service
   */
  private async registerVerificationKey(): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API_KEY is required for zkVerify verification");
    }

    // Check if verification key hash is already cached
    if (fs.existsSync(this.vkHashCachePath)) {
      const cached = JSON.parse(fs.readFileSync(this.vkHashCachePath, "utf8"));
      const vkHash = cached.vkHash || cached.meta?.vkHash;
      if (vkHash) {
        console.log("📋 Using cached verification key hash:", vkHash);
        return vkHash;
      }
    }

    try {
      console.log("🔄 Registering verification key with zkVerify...");
      
      const vKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, "utf8"));
      
      const regParams = {
        "proofType": "groth16",
        "proofOptions": {
          "library": "snarkjs",
          "curve": "bn128"
        },
        "vk": vKey
      };

      const response = await axios.post(`${this.apiUrl}/register-vk/${this.apiKey}`, regParams);
      
      // Cache the verification key hash
      fs.writeFileSync(this.vkHashCachePath, JSON.stringify(response.data));
      
      const vkHash = response.data.vkHash || response.data.meta?.vkHash;
      console.log("✅ Verification key registered with hash:", vkHash);
      
      return vkHash;
    } catch (error: any) {
      const errorData = error.response?.data;
      
      // Handle case where verification key is already registered
      if (errorData?.code === 'REGISTER_VK_FAILED' && 
          errorData?.message?.includes('already registered') && 
          errorData?.meta?.vkHash) {
        
        const vkHash = errorData.meta.vkHash;
        console.log("📋 Verification key already registered with hash:", vkHash);
        
        // Cache the verification key hash for future use
        const cacheData = {
          vkHash: vkHash,
          message: "Already registered",
          registeredAt: new Date().toISOString()
        };
        fs.writeFileSync(this.vkHashCachePath, JSON.stringify(cacheData));
        
        return vkHash;
      }
      
      console.error("❌ Error registering verification key:", errorData || error.message);
      throw error;
    }
  }

  /**
   * Submit proof to zkVerify for verification
   */
  async verifyWithZkVerify(
    proof: any, 
    publicSignals: string[], 
    chainId: number = 11155111,
    waitForFinalization: boolean = true
  ): Promise<{ success: boolean; jobId?: string; txHash?: string; blockHash?: string }> {
    if (!this.apiKey) {
      throw new Error("API_KEY is required for zkVerify verification");
    }

    try {
      console.log("🔄 Verifying proof with zkVerify...");
      console.log("📊 Public signals to verify:");
      console.log("  - Average Rating (scaled):", publicSignals[0]);
      console.log("  - Verified Number of Ratings:", publicSignals[1]);
      console.log("  - Review Root Hash:", publicSignals[2]);
      console.log("  - Uptime BPS:", publicSignals[3]);
      console.log("  - Average Execution Time (ms):", publicSignals[4]);
      console.log("  - Requests per Day:", publicSignals[5]);
      console.log("  - Deployment Count:", publicSignals[6]);
      console.log("  - Verified Agent ID:", publicSignals[7]);
      console.log("  - Verified Epoch Day:", publicSignals[8]);

      // Register verification key and get hash
      const vkHash = await this.registerVerificationKey();

      // Submit proof for verification
      const params = {
        "proofType": "groth16",
        "vkRegistered": true,
        "chainId": chainId,
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

      console.log("📤 Submitting proof to zkVerify...");
      const submitResponse = await axios.post(`${this.apiUrl}/submit-proof/${this.apiKey}`, params);
      
      if (submitResponse.data.optimisticVerify !== "success") {
        console.error("❌ Optimistic verification failed");
        return { success: false };
      }

      console.log("✅ Optimistic verification successful!");
      console.log("🔍 Job ID:", submitResponse.data.jobId);

      if (!waitForFinalization) {
        return { 
          success: true, 
          jobId: submitResponse.data.jobId 
        };
      }

      // Wait for finalization
      console.log("⏳ Waiting for proof to be finalized on zkVerify...");
      return await this.waitForFinalization(submitResponse.data.jobId);

    } catch (error: any) {
      console.error("❌ Error verifying with zkVerify:", error.response?.data || error.message);
      return { success: false };
    }
  }

  /**
   * Wait for proof verification to be finalized
   */
  private async waitForFinalization(jobId: string): Promise<{ success: boolean; jobId: string; txHash?: string; blockHash?: string }> {
    while (true) {
      try {
        const statusResponse = await axios.get(`${this.apiUrl}/job-status/${this.apiKey}/${jobId}`);
        const status = statusResponse.data.status;
        
        console.log("📈 Job status:", status);
        
        if (status === "Finalized") {
          console.log("🎉 Proof verification finalized on zkVerify!");
          console.log("📜 Transaction hash:", statusResponse.data.txHash);
          console.log("🔗 Block hash:", statusResponse.data.blockHash);
          
          return {
            success: true,
            jobId: jobId,
            txHash: statusResponse.data.txHash,
            blockHash: statusResponse.data.blockHash
          };
        } else if (status === "Failed") {
          console.error("❌ Proof verification failed on zkVerify");
          return { success: false, jobId: jobId };
        }
        
        // Wait 5 seconds before checking again
        console.log("⏳ Waiting 5 seconds before checking status again...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error: any) {
        console.error("❌ Error checking job status:", error.response?.data || error.message);
        return { success: false, jobId: jobId };
      }
    }
  }

  /**
   * Verify a proof from files using zkVerify
   */
  async verifyFromFilesWithZkVerify(
    proofPath: string = "./proof.json",
    publicPath: string = "./public.json",
    chainId: number = 11155111,
    waitForFinalization: boolean = true
  ): Promise<{ success: boolean; jobId?: string; txHash?: string; blockHash?: string }> {
    try {
      console.log("🔄 Loading proof and public signals from files for zkVerify verification...");
      
      const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
      const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));
      
      return await this.verifyWithZkVerify(proof, publicSignals, chainId, waitForFinalization);
    } catch (error: any) {
      console.error("❌ Error loading files for zkVerify verification:", error.message);
      return { success: false };
    }
  }

  /**
   * Verify a proof from files
   */
  async verifyFromFiles(
    proofPath: string = "./proof.json",
    publicPath: string = "./public.json"
  ): Promise<boolean> {
    try {
      console.log("🔄 Loading proof and public signals from files...");
      
      const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
      const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));
      
      return await this.verify(proof, publicSignals);
    } catch (error) {
      console.error("❌ Error loading files:", error);
      return false;
    }
  }

  /**
   * Verify a proof directly
   */
  async verify(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      console.log("🔄 Verifying proof...");
      console.log("📊 Public signals to verify:");
      console.log("  - Average Rating (scaled):", publicSignals[0]);
      console.log("  - Verified Number of Ratings:", publicSignals[1]);
      console.log("  - Review Root Hash:", publicSignals[2]);
      console.log("  - Uptime BPS:", publicSignals[3]);
      console.log("  - Average Execution Time (ms):", publicSignals[4]);
      console.log("  - Requests per Day:", publicSignals[5]);
      console.log("  - Deployment Count:", publicSignals[6]);
      console.log("  - Verified Agent ID:", publicSignals[7]);
      console.log("  - Verified Epoch Day:", publicSignals[8]);
      
      const vKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, "utf8"));
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      if (isValid) {
        console.log("✅ Proof verification successful!");
        console.log("🎉 The AI agent's reputation metrics are cryptographically verified!");
      } else {
        console.log("❌ Proof verification failed!");
        console.log("⚠️  The proof is invalid or tampered with!");
      }
      
      return isValid;
    } catch (error) {
      console.error("❌ Error verifying proof:", error);
      return false;
    }
  }

  /**
   * Verify proof using Solidity calldata format
   */
  async verifyCalldata(calldata: string): Promise<boolean> {
    try {
      console.log("🔄 Parsing Solidity calldata...");
      
      // Parse calldata back to proof and public signals
      // This is a simplified parser - in production, use proper calldata parsing
      const parsed = this.parseCalldata(calldata);
      
      return await this.verify(parsed.proof, parsed.publicSignals);
    } catch (error) {
      console.error("❌ Error parsing calldata:", error);
      return false;
    }
  }

  private parseCalldata(calldata: string): { proof: any; publicSignals: string[] } {
    // This is a simplified implementation
    // In production, use proper ABI decoding
    throw new Error("Calldata parsing not implemented - use proof.json and public.json files");
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || "files";
  
  const verifier = new CloudentVerifier();
  
  try {
    let isValid = false;
    let result: any;
    
    switch (command) {
      case "files":
        const proofFile = process.argv[3] || "./proof.json";
        const publicFile = process.argv[4] || "./public.json";
        isValid = await verifier.verifyFromFiles(proofFile, publicFile);
        break;
        
      case "zkverify":
        const zkProofFile = process.argv[3] || "./proof.json";
        const zkPublicFile = process.argv[4] || "./public.json";
        const chainId = process.argv[5] ? parseInt(process.argv[5]) : 11155111;
        const waitForFinalization = process.argv[6] !== "false";
        
        result = await verifier.verifyFromFilesWithZkVerify(
          zkProofFile, 
          zkPublicFile, 
          chainId, 
          waitForFinalization
        );
        isValid = result.success;
        
        if (result.success && result.txHash) {
          console.log("\n🎉 zkVerify verification completed successfully!");
          console.log(`📜 Transaction: ${result.txHash}`);
          console.log(`🔗 Block: ${result.blockHash}`);
        }
        break;
        
      case "calldata":
        const calldataFile = process.argv[3] || "./calldata.txt";
        if (!fs.existsSync(calldataFile)) {
          console.error(`❌ Calldata file not found: ${calldataFile}`);
          process.exit(1);
        }
        const calldata = fs.readFileSync(calldataFile, "utf8").trim();
        isValid = await verifier.verifyCalldata(calldata);
        break;
        
      default:
        console.log("Usage:");
        console.log("  npm run verify                         # Verify locally from proof.json and public.json");
        console.log("  npm run verify files [proof] [public]  # Verify locally from custom files");
        console.log("  npm run verify zkverify [proof] [public] [chainId] [wait] # Verify on zkVerify");
        console.log("  npm run verify calldata [file]         # Verify from calldata file");
        console.log("");
        console.log("zkVerify options:");
        console.log("  chainId: Target chain ID (default: 11155111 for Sepolia)");
        console.log("  wait: Whether to wait for finalization (default: true, set to 'false' to skip)");
        process.exit(1);
    }
    
    process.exit(isValid ? 0 : 1);
    
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default CloudentVerifier;
