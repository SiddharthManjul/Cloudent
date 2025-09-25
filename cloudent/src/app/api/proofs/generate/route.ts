import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { inputData } = await request.json();

    if (!inputData) {
      return NextResponse.json({ error: 'Missing input data' }, { status: 400 });
    }

    console.log('📊 Received input data:', inputData);

    // Create temporary directory for this proof generation
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'temp_proofs', `proof_${timestamp}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const inputFilePath = path.join(tempDir, 'input.json');
    const proofFilePath = path.join(tempDir, 'proof.json');
    const publicFilePath = path.join(tempDir, 'public.json');
    const witnessFilePath = path.join(tempDir, 'witness.wtns');

    try {
      // Write input data to file
      fs.writeFileSync(inputFilePath, JSON.stringify(inputData, null, 2));

      // Circuit paths
      const circuitWasmPath = path.resolve(process.cwd(), '../reputation_circuit/build/cloudent_js/cloudent.wasm');
      const circuitZkeyPath = path.resolve(process.cwd(), '../reputation_circuit/build/cloudent.zkey');
      const generateWitnessPath = path.resolve(process.cwd(), '../reputation_circuit/build/cloudent_js/generate_witness.js');
      const vkeyPath = path.resolve(process.cwd(), '../reputation_circuit/build/verification_key.json');

      // Check if required files exist
      console.log('🔍 Checking circuit files...');
      if (!fs.existsSync(circuitWasmPath)) {
        throw new Error(`Circuit WASM file not found: ${circuitWasmPath}`);
      }
      if (!fs.existsSync(circuitZkeyPath)) {
        throw new Error(`Circuit ZKEY file not found: ${circuitZkeyPath}`);
      }
      if (!fs.existsSync(generateWitnessPath)) {
        throw new Error(`Generate witness script not found: ${generateWitnessPath}`);
      }
      if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}`);
      }
      console.log('✅ All circuit files found');

      // Generate witness
      console.log('🔧 Generating witness...');
      try {
        const witnessOutput = execSync(`node "${generateWitnessPath}" "${circuitWasmPath}" "${inputFilePath}" "${witnessFilePath}"`, {
          cwd: tempDir,
          encoding: 'utf8'
        });
        console.log('✅ Witness generated successfully');
        if (witnessOutput.trim()) {
          console.log('Witness output:', witnessOutput);
        }
      } catch (witnessError) {
        console.error('❌ Witness generation failed:', witnessError);
        throw new Error(`Witness generation failed: ${witnessError}`);
      }

      // Generate proof
      console.log('🔐 Generating zero-knowledge proof...');
      try {
        const proofOutput = execSync(`snarkjs groth16 prove "${circuitZkeyPath}" "${witnessFilePath}" "${proofFilePath}" "${publicFilePath}"`, {
          cwd: tempDir,
          encoding: 'utf8'
        });
        console.log('✅ Proof generated successfully');
        if (proofOutput.trim()) {
          console.log('Proof output:', proofOutput);
        }
      } catch (proofError) {
        console.error('❌ Proof generation failed:', proofError);
        throw new Error(`Proof generation failed: ${proofError}`);
      }

      // Check if output files exist
      if (!fs.existsSync(proofFilePath)) {
        throw new Error('Proof file was not generated');
      }
      if (!fs.existsSync(publicFilePath)) {
        throw new Error('Public signals file was not generated');
      }

      // Read generated files
      console.log('📖 Reading generated proof files...');
      const proof = JSON.parse(fs.readFileSync(proofFilePath, 'utf8'));
      const publicSignals = JSON.parse(fs.readFileSync(publicFilePath, 'utf8'));
      const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

      console.log('🎉 Proof generation completed successfully!');

      return NextResponse.json({
        success: true,
        proof,
        publicSignals,
        vKey,
      });

    } finally {
      // Clean up temporary files
      try {
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (fs.existsSync(proofFilePath)) fs.unlinkSync(proofFilePath);
        if (fs.existsSync(publicFilePath)) fs.unlinkSync(publicFilePath);
        if (fs.existsSync(witnessFilePath)) fs.unlinkSync(witnessFilePath);
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary files:', cleanupError);
      }
    }

  } catch (error: unknown) {
    console.error('Error generating proof:', error);
    return NextResponse.json({ 
      error: 'Failed to generate proof', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
