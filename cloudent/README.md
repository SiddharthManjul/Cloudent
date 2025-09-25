# Xerion Marketplace - AI Agent Marketplace

Xerion Marketplace is the first AI agent marketplace with cryptographically verifiable reputation powered by zero-knowledge proofs. Built on Horizen testnet with zkVerify integration.

## Features

- 🤖 **AI Agent Discovery**: Browse and deploy AI agents with verified performance metrics
- 🔐 **Zero-Knowledge Proofs**: Cryptographically verifiable reputation using Circom circuits
- 🌐 **Blockchain Integration**: Proof verification on zkVerify and Horizen testnet
- 👛 **Wallet Authentication**: Seamless wallet integration with RainbowKit
- 📊 **Real-time Monitoring**: Continuous tracking of agent performance metrics
- 💰 **Creator Monetization**: Earn from your AI agents with transparent revenue sharing
- ⭐ **Review System**: User reviews with double keccak256 hashing for integrity

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Blockchain**: Horizen Testnet, zkVerify, Wagmi, RainbowKit
- **Zero-Knowledge**: Circom, snarkjs, Groth16 proofs
- **Database**: PostgreSQL with Prisma ORM
- **Monitoring**: Node.js cron jobs for automated data collection

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- zkVerify API key (contact Horizen Labs)
- Wallet Connect Project ID

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

Create a \`.env.local\` file:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cloudent"
DIRECT_URL="postgresql://username:password@localhost:5432/cloudent"

# zkVerify API
API_KEY="your_zkverify_api_key_here"

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_wallet_connect_project_id"

# Horizen Testnet
NEXT_PUBLIC_HORIZEN_CHAIN_ID="845320009"
NEXT_PUBLIC_HORIZEN_RPC_URL="https://gobi-testnet.horizenlabs.io/ethv1"
NEXT_PUBLIC_HORIZEN_EXPLORER_URL="https://gobi.explorer.horizenlabs.io"

# Circuit Configuration
CIRCUIT_WASM_PATH="../reputation_circuit/build/cloudent_js/cloudent.wasm"
CIRCUIT_ZKEY_PATH="../reputation_circuit/build/cloudent.zkey"
VERIFICATION_KEY_PATH="../reputation_circuit/build/verification_key.json"
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio
npm run db:studio
\`\`\`

### 4. Build Reputation Circuit

\`\`\`bash
cd ../reputation_circuit
npm install
npm run setup
npm run compile
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

\`\`\`
cloudent/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── marketplace/        # Agent marketplace page
│   │   ├── register-agent/     # Agent registration page
│   │   ├── agents/[id]/        # Individual agent pages
│   │   ├── dashboard/          # User dashboard
│   │   ├── creator-dashboard/  # Creator dashboard
│   │   └── api/               # API routes
│   │       ├── agents/        # Agent CRUD operations
│   │       ├── reviews/       # Review management
│   │       ├── monitoring/    # Agent monitoring data
│   │       ├── users/         # User statistics
│   │       └── creators/      # Creator statistics
├── components/                 # Reusable UI components
├── lib/                       # Utility functions and configurations
├── prisma/                    # Database schema and migrations
├── scripts/                   # Automation scripts
│   ├── monitor-agents.js      # Agent monitoring script
│   ├── generate-proofs.js     # Proof generation script
│   ├── scheduler.js           # Cron job scheduler
│   └── test-proof-generation.js # Test script
└── public/                    # Static assets
\`\`\`

## Database Schema

### Core Models

- **User**: Wallet addresses, balances, join dates
- **Agent**: AI agent information, creator, performance metrics
- **Proof**: Zero-knowledge proofs with verification data
- **Review**: User reviews with double-hashed content
- **UserAgent**: Many-to-many relationship for employed agents
- **MonitoringLog**: Historical performance data

### Key Features

- **Array Storage**: Historical data stored as arrays for uptime, execution time, requests
- **Automatic Aggregation**: Current values calculated from historical arrays
- **Hash Integrity**: Reviews hashed with double keccak256
- **Proof Tracking**: Complete audit trail of proof generation and verification

## API Routes

### Agents
- \`GET /api/agents\` - List all agents (with creator filter)
- \`POST /api/agents\` - Create new agent
- \`GET /api/agents/[id]\` - Get agent details
- \`PUT /api/agents/[id]\` - Update agent (creator only)
- \`DELETE /api/agents/[id]\` - Delete agent (creator only)

### Reviews
- \`GET /api/reviews?agentId=[id]\` - Get agent reviews
- \`POST /api/reviews\` - Create review (auto-hashed)

### Monitoring
- \`POST /api/monitoring\` - Log monitoring data
- \`GET /api/monitoring?agentId=[id]\` - Get monitoring history

### Users & Creators
- \`GET /api/users/[address]/agents\` - User's employed agents
- \`GET /api/users/[address]/stats\` - User statistics
- \`GET /api/creators/[address]/stats\` - Creator statistics

## Automation Scripts

### Monitor Agents
\`\`\`bash
npm run monitor
\`\`\`
Collects simulated monitoring data for all agents every 15 minutes.

### Generate Proofs
\`\`\`bash
npm run generate-proofs
\`\`\`
Generates zero-knowledge proofs for all agents and verifies on zkVerify.

### Run Scheduler
\`\`\`bash
npm run scheduler
\`\`\`
Runs automated monitoring (every 15 min) and proof generation (daily at midnight).

### Test Proof Generation
\`\`\`bash
npm run test-proofs
\`\`\`
Test proof generation for debugging purposes.

## Zero-Knowledge Proof System

### Circuit Design
- **Inputs**: Agent metrics, reviews, performance data
- **Public Outputs**: Verified metrics without revealing sensitive data
- **Constraints**: Ensures data integrity and proper calculations

### Proof Generation Flow
1. **Data Collection**: Monitoring scripts collect agent metrics
2. **Circuit Input**: Format data for Circom circuit
3. **Proof Generation**: Create Groth16 proof using snarkjs
4. **zkVerify Submission**: Submit proof to zkVerify relayer
5. **Horizen Aggregation**: Wait for aggregation on Horizen testnet
6. **Database Update**: Store verification results and transaction hashes

### Verification
- **On-chain**: Proofs verified on zkVerify blockchain
- **Aggregation**: Batched and aggregated on Horizen testnet
- **Explorer Links**: Direct links to transaction verification
- **Audit Trail**: Complete history of all verifications

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- zkVerify API key
- Wallet Connect project ID
- Circuit file paths

### Database Migration
\`\`\`bash
npm run db:migrate
\`\`\`

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Scheduler Setup
Set up the scheduler as a background service:
\`\`\`bash
npm run scheduler
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Considerations

- **Wallet Security**: Never store private keys, use secure wallet connections
- **API Security**: Validate all inputs, use proper authentication
- **Circuit Security**: Carefully review circuit constraints
- **Database Security**: Use parameterized queries, validate addresses

## Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **zkVerify**: Contact Horizen Labs for API key and support
- **Circuit**: Refer to reputation_circuit/README.md for circuit details

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the future of AI agent marketplaces with verifiable reputation.