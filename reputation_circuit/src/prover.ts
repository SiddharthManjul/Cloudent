import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";

export interface CircuitInput {
  // Private inputs (not revealed in proof)
  ratings: string[];
  reviewHashes: string[];
  privateUptimeBps: string;
  privateAvgExecTimeMs: string;
  privateReqsPerDay: string;
  privateDeploymentCount: string;
  
  // Public inputs (revealed in proof)
  agentId: string;
  epochDay: string;
  numRatings: string;
  claimedUptimeBps: string;
  claimedAvgExecTimeMs: string;
  claimedReqsPerDay: string;
  claimedDeploymentCount: string;
  avgScaled: string;
}

export interface ProofOutput {
  proof: any;
  publicSignals: string[];
}

export class CloudentProver {
  private circuitWasmPath: string;
  private circuitZkeyPath: string;
  private verificationKeyPath: string;

  constructor(
    wasmPath: string = "./build/cloudent_js/cloudent.wasm",
    zkeyPath: string = "./build/cloudent.zkey",
    vkeyPath: string = "./build/verification_key.json"
  ) {
    this.circuitWasmPath = path.resolve(wasmPath);
    this.circuitZkeyPath = path.resolve(zkeyPath);
    this.verificationKeyPath = path.resolve(vkeyPath);
  }

  /**
   * Generate a proof for the AI Agent Reputation circuit
   */
  async generateProof(input: CircuitInput): Promise<ProofOutput> {
    try {
      console.log("🔄 Generating witness...");
      
      // Since witness already exists, read it from file
      console.log("🔄 Reading existing witness...");
      const witnessBuffer = fs.readFileSync("./witness.wtns");

      console.log("🔄 Generating proof...");
      
      // Generate proof using Groth16
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        this.circuitZkeyPath,
        witnessBuffer
      );

      console.log("✅ Proof generated successfully!");
      console.log("📊 Public outputs:");
      console.log("  - Average Rating (scaled):", publicSignals[0]);
      console.log("  - Verified Number of Ratings:", publicSignals[1]);
      console.log("  - Review Root Hash:", publicSignals[2]);
      console.log("  - Uptime BPS:", publicSignals[3]);
      console.log("  - Average Execution Time (ms):", publicSignals[4]);
      console.log("  - Requests per Day:", publicSignals[5]);
      console.log("  - Deployment Count:", publicSignals[6]);
      console.log("  - Verified Agent ID:", publicSignals[7]);
      console.log("  - Verified Epoch Day:", publicSignals[8]);

      return { proof, publicSignals };
    } catch (error) {
      console.error("❌ Error generating proof:", error);
      throw error;
    }
  }

  /**
   * Verify a proof
   */
  async verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      console.log("🔄 Verifying proof...");
      
      const vKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, "utf8"));
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      if (isValid) {
        console.log("✅ Proof verification successful!");
      } else {
        console.log("❌ Proof verification failed!");
      }
      
      return isValid;
    } catch (error) {
      console.error("❌ Error verifying proof:", error);
      return false;
    }
  }

  /**
   * Save proof and public signals to files
   */
  async saveProofToFiles(
    proof: any,
    publicSignals: string[],
    proofPath: string = "./proof.json",
    publicPath: string = "./public.json"
  ): Promise<void> {
    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));
    console.log(`💾 Proof saved to: ${proofPath}`);
    console.log(`💾 Public signals saved to: ${publicPath}`);
  }

  /**
   * Generate Solidity verifier call parameters
   */
  generateSolidityCall(proof: any, publicSignals: string[]): string {
    // Format proof and public signals for Solidity verifier
    const pi_a = [proof.pi_a[0], proof.pi_a[1]];
    const pi_b = [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]];
    const pi_c = [proof.pi_c[0], proof.pi_c[1]];
    
    const calldata = `["${pi_a[0]}", "${pi_a[1]}"], [["${pi_b[0][0]}", "${pi_b[0][1]}"],["${pi_b[1][0]}", "${pi_b[1][1]}"]], ["${pi_c[0]}", "${pi_c[1]}"], [${publicSignals.map(s => `"${s}"`).join(", ")}]`;
    
    return `[${calldata}]`;
  }
}

// CLI interface
async function main() {
  const inputFile = process.argv[2] || "./input.json";
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.log("Usage: npm run prove [input-file.json]");
    process.exit(1);
  }

  try {
    // Load input
    const input: CircuitInput = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    
    // Generate output filenames based on input filename
    const inputBaseName = path.basename(inputFile, '.json');
    const proofFile = inputBaseName === 'input' ? './proof.json' : `./proof${inputBaseName.replace('input', '')}.json`;
    const publicFile = inputBaseName === 'input' ? './public.json' : `./public${inputBaseName.replace('input', '')}.json`;
    const calldataFile = inputBaseName === 'input' ? './calldata.txt' : `./calldata${inputBaseName.replace('input', '')}.txt`;
    
    console.log(`📂 Input file: ${inputFile}`);
    console.log(`📂 Output files will be: ${proofFile}, ${publicFile}, ${calldataFile}`);
    
    // Initialize prover
    const prover = new CloudentProver();
    
    // Generate proof
    const { proof, publicSignals } = await prover.generateProof(input);
    
    // Save proof files
    await prover.saveProofToFiles(proof, publicSignals, proofFile, publicFile);
    
    // Verify proof
    const isValid = await prover.verifyProof(proof, publicSignals);
    
    if (isValid) {
      console.log("\n🎉 Proof generation and verification complete!");
      
      // Generate Solidity call data
      const calldata = prover.generateSolidityCall(proof, publicSignals);
      console.log("\n📋 Solidity verifier call data:");
      console.log(calldata);
      
      // Save calldata
      fs.writeFileSync(calldataFile, calldata);
      console.log(`💾 Calldata saved to: ${calldataFile}`);
    }
    
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default CloudentProver;
