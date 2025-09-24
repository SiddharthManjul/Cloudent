const { generateProofsForAllAgents } = require('./generate-proofs');

console.log('🧪 Testing proof generation...');
console.log('This will generate proofs for all registered agents');
console.log('Make sure you have:');
console.log('  1. API_KEY set in .env.local');
console.log('  2. Database connection configured');
console.log('  3. Circuit files built in ../reputation_circuit');

// Run proof generation
generateProofsForAllAgents()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
