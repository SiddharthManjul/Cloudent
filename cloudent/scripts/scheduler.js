const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🕒 Xerion Marketplace Scheduler Started');
console.log('📅 Setting up cron jobs...');

// Monitor agents every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('\n⏰ Running agent monitoring...');
  const monitorScript = path.join(__dirname, 'monitor-agents.js');
  
  exec(`node ${monitorScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Monitoring error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Monitoring stderr: ${stderr}`);
    }
    console.log(stdout);
  });
});

// Generate proofs every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('\n🌙 Running daily proof generation at midnight...');
  const proofScript = path.join(__dirname, 'generate-proofs.js');
  
  exec(`node ${proofScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Proof generation error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Proof generation stderr: ${stderr}`);
    }
    console.log(stdout);
  });
});

// Keep the scheduler running
console.log('✅ Scheduler is running...');
console.log('📊 Agent monitoring: Every 15 minutes');
console.log('🔐 Proof generation: Daily at midnight');
console.log('🛑 Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Scheduler stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Scheduler terminated');
  process.exit(0);
});
