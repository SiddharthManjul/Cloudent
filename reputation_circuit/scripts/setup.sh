#!/bin/bash

# Cloudent Circuit Trusted Setup Script
# Based on: https://docs.circom.io/getting-started/proving-circuits/

set -e

CIRCUIT_NAME="cloudent"
BUILD_DIR="./build"
PTAU_DIR="./ptau"

echo "🚀 Starting Cloudent Circuit Trusted Setup..."

# Create directories
mkdir -p $BUILD_DIR
mkdir -p $PTAU_DIR

# Step 1: Powers of Tau Ceremony
echo "📡 Step 1: Starting Powers of Tau ceremony..."

if [ ! -f "$PTAU_DIR/pot12_0000.ptau" ]; then
    echo "🔄 Generating initial powers of tau..."
    snarkjs powersoftau new bn128 12 $PTAU_DIR/pot12_0000.ptau -v
else
    echo "✅ Initial powers of tau already exists"
fi

if [ ! -f "$PTAU_DIR/pot12_0001.ptau" ]; then
    echo "🔄 Contributing to powers of tau..."
    snarkjs powersoftau contribute $PTAU_DIR/pot12_0000.ptau $PTAU_DIR/pot12_0001.ptau --name="First contribution" -v
else
    echo "✅ Powers of tau contribution already exists"
fi

if [ ! -f "$PTAU_DIR/pot12_final.ptau" ]; then
    echo "🔄 Preparing phase 2..."
    snarkjs powersoftau prepare phase2 $PTAU_DIR/pot12_0001.ptau $PTAU_DIR/pot12_final.ptau -v
else
    echo "✅ Phase 2 preparation already complete"
fi

# Step 2: Circuit-specific setup
echo "🔧 Step 2: Circuit-specific setup..."

if [ ! -f "$BUILD_DIR/${CIRCUIT_NAME}.r1cs" ]; then
    echo "❌ Circuit not compiled! Please run: npm run compile"
    exit 1
fi

if [ ! -f "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" ]; then
    echo "🔄 Generating initial zkey..."
    snarkjs groth16 setup $BUILD_DIR/${CIRCUIT_NAME}.r1cs $PTAU_DIR/pot12_final.ptau $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey
else
    echo "✅ Initial zkey already exists"
fi

if [ ! -f "$BUILD_DIR/${CIRCUIT_NAME}_0001.zkey" ]; then
    echo "🔄 Contributing to phase 2..."
    snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_0001.zkey --name="1st Contributor" -v
else
    echo "✅ Phase 2 contribution already exists"
fi

# Create final zkey
if [ ! -f "$BUILD_DIR/${CIRCUIT_NAME}.zkey" ]; then
    echo "🔄 Creating final zkey..."
    cp $BUILD_DIR/${CIRCUIT_NAME}_0001.zkey $BUILD_DIR/${CIRCUIT_NAME}.zkey
else
    echo "✅ Final zkey already exists"
fi

# Step 3: Export verification key
echo "🔑 Step 3: Exporting verification key..."

if [ ! -f "$BUILD_DIR/verification_key.json" ]; then
    echo "🔄 Exporting verification key..."
    snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}.zkey $BUILD_DIR/verification_key.json
else
    echo "✅ Verification key already exported"
fi

# Step 4: Generate Solidity verifier
echo "📄 Step 4: Generating Solidity verifier..."

if [ ! -f "$BUILD_DIR/verifier.sol" ]; then
    echo "🔄 Generating Solidity verifier..."
    snarkjs zkey export solidityverifier $BUILD_DIR/${CIRCUIT_NAME}.zkey $BUILD_DIR/verifier.sol
else
    echo "✅ Solidity verifier already exists"
fi

# Step 5: Circuit info
echo "📊 Step 5: Circuit information..."
snarkjs info -r $BUILD_DIR/${CIRCUIT_NAME}.r1cs

echo ""
echo "🎉 Trusted setup complete!"
echo ""
echo "Generated files:"
echo "  📁 $BUILD_DIR/${CIRCUIT_NAME}.zkey - Proving key"
echo "  📁 $BUILD_DIR/verification_key.json - Verification key"
echo "  📁 $BUILD_DIR/verifier.sol - Solidity verifier contract"
echo ""
echo "Next steps:"
echo "  1. Generate proof: npm run prove"
echo "  2. Verify proof: npm run verify"
echo "  3. Deploy verifier.sol to blockchain for on-chain verification"
