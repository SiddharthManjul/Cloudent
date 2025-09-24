import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";

export class CloudentVerifier {
  private verificationKeyPath: string;

  constructor(vkeyPath: string = "./build/verification_key.json") {
    this.verificationKeyPath = path.resolve(vkeyPath);
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
    
    switch (command) {
      case "files":
        const proofFile = process.argv[3] || "./proof.json";
        const publicFile = process.argv[4] || "./public.json";
        isValid = await verifier.verifyFromFiles(proofFile, publicFile);
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
        console.log("  npm run verify                    # Verify from proof.json and public.json");
        console.log("  npm run verify files [proof] [public]  # Verify from custom files");
        console.log("  npm run verify calldata [file]         # Verify from calldata file");
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
