# Cloudent AI Agent Reputation Circuit

A zero-knowledge proof system for verifying AI agent reputation metrics without revealing private performance data.

## Features

- **Rating Validation**: Cryptographically verify user ratings (1-5 stars) without revealing individual ratings
- **Performance Metrics**: Prove uptime, execution time, request volume, and deployment count without exposing private data
- **Review Commitment**: Generate cryptographic commitments for review authenticity
- **Solidity Integration**: Generate on-chain verifier contracts for blockchain deployment

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Circuit

```bash
npm run compile
```

### 3. Run Trusted Setup

```bash
npm run setup
```

### 4. Generate Proof

```bash
npm run prove
```

### 5. Verify Proof

```bash
npm run verify
```

## Circuit Inputs

### Private Inputs (Hidden from verifiers)
- `ratings[20]`: Array of user ratings (1-5, padded with zeros)
- `reviewHashes[16]`: Cryptographic hashes of reviews
- `privateUptimeBps`: Actual uptime in basis points (0-10000)
- `privateAvgExecTimeMs`: Actual average execution time in milliseconds
- `privateReqsPerDay`: Actual requests per day
- `privateDeploymentCount`: Actual number of deployments

### Public Inputs (Revealed in proof)
- `agentId`: Unique identifier for the AI agent
- `epochDay`: Time period identifier
- `numRatings`: Number of valid ratings (≤20)
- `claimedUptimeBps`: Claimed uptime (must match private)
- `claimedAvgExecTimeMs`: Claimed execution time (must match private)
- `claimedReqsPerDay`: Claimed requests per day (must match private)
- `claimedDeploymentCount`: Claimed deployment count (must match private)
- `avgScaled`: Pre-computed average rating * 100

## Public Outputs

The circuit produces these verified outputs:
1. `avgRatingScaled`: Cryptographically verified average rating (scaled by 100)
2. `verifiedNumRatings`: Verified number of ratings
3. `reviewRoot`: Merkle root of review hashes
4. `uptimeBps`: Verified uptime in basis points
5. `avgExecTimeMs`: Verified average execution time
6. `reqsPerDay`: Verified requests per day
7. `deploymentCount`: Verified deployment count
8. `verifiedAgentId`: Agent identifier
9. `verifiedEpochDay`: Time period identifier

## Commands Reference

### Development Commands

```bash
# Compile the circuit
npm run compile

# Run trusted setup (one-time)
npm run setup

# Generate proof with default input.json
npm run prove

# Generate proof with custom input
npm run prove:input custom-input.json

# Verify generated proof
npm run verify

# Generate witness file
npm run witness

# Clean all generated files
npm run clean

# Full test pipeline
npm run test
```

### Advanced Usage

```bash
# Development mode with ts-node
npm run dev

# Build TypeScript
npm run build

# Manual witness generation
node build/cloudent_js/generate_witness.js build/cloudent_js/cloudent.wasm input.json witness.wtns

# Manual proof generation
snarkjs groth16 prove build/cloudent.zkey witness.wtns proof.json public.json

# Manual verification
snarkjs groth16 verify build/verification_key.json public.json proof.json
```

## File Structure

```
reputation_circuit/
├── circuits/
│   └── cloudent.circom          # Main circuit definition
├── src/
│   ├── prover.ts               # Proof generation logic
│   └── verifier.ts             # Proof verification logic
├── scripts/
│   └── setup.sh                # Trusted setup automation
├── build/                      # Generated circuit files
│   ├── cloudent.r1cs          # Constraint system
│   ├── cloudent.zkey          # Proving key
│   ├── verification_key.json   # Verification key
│   ├── verifier.sol           # Solidity verifier
│   └── cloudent_js/           # WebAssembly files
├── ptau/                      # Powers of tau files
├── input.json                 # Sample input data
├── proof.json                 # Generated proof
├── public.json               # Public signals
└── calldata.txt              # Solidity calldata
```

## Input Format

Create an `input.json` file with your data:

```json
{
  "ratings": ["4", "5", "3", "4", "5", "0", "0", ...],
  "reviewHashes": ["123...", "456...", "0", ...],
  "privateUptimeBps": "9850",
  "privateAvgExecTimeMs": "150",
  "privateReqsPerDay": "1250",
  "privateDeploymentCount": "3",
  "agentId": "42001",
  "epochDay": "18900",
  "numRatings": "5",
  "claimedUptimeBps": "9850",
  "claimedAvgExecTimeMs": "150",
  "claimedReqsPerDay": "1250",
  "claimedDeploymentCount": "3",
  "avgScaled": "410"
}
```

## Blockchain Integration

After generating proofs, deploy the Solidity verifier:

1. Deploy `build/verifier.sol` to your blockchain
2. Use the generated `calldata.txt` to call the verifier
3. The verifier returns `true` for valid proofs

## Security Considerations

- **Trusted Setup**: The ceremony in `scripts/setup.sh` creates the cryptographic parameters
- **Circuit Constraints**: All inputs are validated within the circuit
- **Zero-Knowledge**: Private inputs remain hidden while proving their validity
- **Soundness**: Invalid proofs cannot be generated without breaking cryptographic assumptions

## References

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs Library](https://github.com/iden3/snarkjs)
- [Groth16 Protocol](https://eprint.iacr.org/2016/260.pdf)

