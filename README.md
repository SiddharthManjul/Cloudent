# Xerion Marketplace - AI Agent Marketplace with Verifiable Reputation

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?logo=postgresql)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://typescriptlang.org/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-1.3.0-FF6B6B)](https://rainbowkit.com/)

## 🚀 Overview

Xerion Marketplace is the first decentralized AI agent marketplace with cryptographically verifiable reputation powered by zero-knowledge proofs. Built on Horizen testnet with zkVerify integration, it enables transparent and trustworthy AI interactions through blockchain technology.

### 🎯 Key Features

- 🤖 **AI Agent Discovery**: Browse and deploy AI agents with verified performance metrics
- 🔐 **Zero-Knowledge Proofs**: Cryptographically verifiable reputation using Circom circuits
- 🌐 **Blockchain Integration**: Proof verification on zkVerify and Horizen testnet
- 👛 **Wallet Authentication**: Seamless wallet integration with RainbowKit
- 📊 **Real-time Monitoring**: Agent performance tracking and analytics
- 🛡️ **Admin System**: Comprehensive platform administration and oversight
- 💰 **Creator Economy**: Monetization opportunities for AI agent creators

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Hooks and Context API
- **Wallet Integration**: RainbowKit + Wagmi + Viem
- **UI Components**: Radix UI primitives with custom styling

### Backend
- **API Routes**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Wallet-based authentication
- **File Storage**: Local file system for circuit files

### Zero-Knowledge Proof System
- **Circuit**: Circom-based reputation verification circuit
- **Proof Generation**: Groth16 proofs using snarkjs
- **Verification**: zkVerify relayer service integration
- **Aggregation**: Horizen testnet blockchain integration

### Database Schema
- **Users**: Wallet addresses, balances, admin roles
- **Agents**: AI agent metadata, performance metrics, creator info
- **Proofs**: ZK proof records with verification status
- **Reviews**: User reviews with cryptographic hashes
- **UserAgent**: Agent deployment relationships

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Prisma**: Database ORM and migrations
- **PostgreSQL**: Primary database
- **Tailwind CSS**: Utility-first CSS framework

### Blockchain & Crypto
- **RainbowKit**: Wallet connection UI
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **Circom**: Zero-knowledge proof circuits
- **snarkjs**: JavaScript library for ZK proofs

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Node-cron**: Scheduled tasks
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **Zod**: Schema validation

## 📋 Prerequisites

Before running the project locally, ensure you have:

- **Node.js**: Version 18.x or higher
- **pnpm**: Package manager (recommended) or npm
- **PostgreSQL**: Database server
- **Git**: Version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Cloudent
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the `cloudent` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/xerion_marketplace"
DIRECT_URL="postgresql://username:password@localhost:5432/xerion_marketplace"

# Wallet Connection
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_walletconnect_project_id"
NEXT_PUBLIC_APP_NAME="Xerion Marketplace"

# zkVerify Integration
ZKVERIFY_API_URL="https://relayer-api.horizenlabs.io/api/v1"
API_KEY="your_zkverify_api_key"

# Security
ENCRYPTION_KEY="your_32_character_encryption_key"

# Horizen Explorer
NEXT_PUBLIC_HORIZEN_EXPLORER_URL="https://explorer.horizen.io/"
```

### 4. Database Setup

```bash
cd cloudent

# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Seed with mock data (optional)
pnpm run add-mock-data
```

### 5. Circuit Setup

The zero-knowledge proof circuit files should be in the `reputation_circuit/build` directory:

```bash
# Ensure circuit files exist
ls reputation_circuit/build/
# Should include: cloudent.wasm, cloudent.zkey, verification_key.json, etc.
```

### 6. Start Development Server

```bash
cd cloudent
pnpm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Cloudent/
├── cloudent/                          # Next.js application
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── api/                   # API routes
│   │   │   ├── agents/                # Agent pages
│   │   │   ├── dashboard/             # User dashboard
│   │   │   ├── marketplace/           # Agent marketplace
│   │   │   └── ...
│   │   └── components/                # React components
│   ├── lib/                           # Utilities and configurations
│   ├── prisma/                        # Database schema and migrations
│   ├── scripts/                       # Automation scripts
│   └── public/                        # Static assets
├── reputation_circuit/                # Zero-knowledge proof circuit
│   ├── circuits/                      # Circom circuit files
│   ├── build/                         # Compiled circuit artifacts
│   ├── src/                           # Circuit utilities
│   └── scripts/                       # Circuit setup scripts
└── README.md                          # This file
```

## 🔧 Available Scripts

### Development
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

### Database
```bash
pnpm run db:push      # Push schema changes to database
pnpm run db:migrate   # Run database migrations
```

### Proof Generation
```bash
pnpm run generate-proofs    # Generate proofs for all agents
pnpm run monitor           # Monitor agent metrics
pnpm run scheduler         # Start automated tasks
pnpm run test-proofs       # Test proof generation
```

### Admin
```bash
pnpm run register-admin    # Register admin address
pnpm run add-mock-data     # Add sample data
```

## 🎮 Usage Guide

### For Users
1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Browse Marketplace**: Explore available AI agents
3. **Deploy Agents**: Deploy agents to your dashboard
4. **Leave Reviews**: Rate and review agent performance

### For Creators
1. **Become Creator**: Register as a creator
2. **Register Agents**: Add your AI agents to the marketplace
3. **Monitor Performance**: Track agent metrics and user feedback
4. **Generate Proofs**: Create ZK proofs for reputation verification

### For Admins
1. **Admin Dashboard**: Access comprehensive platform oversight
2. **Generate Proofs**: Create proofs for any agent
3. **System Management**: Monitor platform health and user activity

## 🔐 Security Features

- **Wallet Authentication**: No traditional login required
- **Zero-Knowledge Proofs**: Cryptographically verifiable reputation
- **Role-Based Access**: Admin, creator, and user permissions
- **Encrypted Storage**: Sensitive data encryption
- **Audit Trail**: Complete transaction and proof history

## 🌐 Blockchain Integration

### Horizen Testnet
- **Chain ID**: 845320009
- **RPC URL**: https://horizen-rpc-testnet.appchain.base.org
- **Explorer**: https://explorer.horizen.io/

### zkVerify Integration
- **API**: https://relayer-api.horizenlabs.io/api/v1
- **Features**: Optimistic verification and proof aggregation
- **Workflow**: Submit → Verify → Aggregate → Store

## 📊 Monitoring & Analytics

### Agent Metrics
- **Uptime**: Real-time availability tracking
- **Performance**: Average execution time monitoring
- **Usage**: Daily request volume analysis
- **Reviews**: User feedback and rating aggregation

### Platform Analytics
- **User Activity**: Dashboard views and interactions
- **Agent Deployment**: Usage patterns and trends
- **Proof Generation**: Verification success rates
- **Revenue Tracking**: Creator earnings and platform fees

## 🚀 Deployment

### Production Build
```bash
pnpm run build
```

### Environment Variables
Ensure all production environment variables are configured:
- Database connection strings
- API keys for zkVerify
- Wallet Connect project ID
- Encryption keys

### Database Migration
```bash
pnpm prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Horizen Labs**: For zkVerify relayer service
- **RainbowKit**: For wallet connection UI
- **Next.js Team**: For the excellent React framework
- **Prisma**: For the database ORM
- **Circom**: For zero-knowledge proof circuits

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `cloudent/README.md`

## 🔮 Roadmap

- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] API marketplace integration
- [ ] Enhanced proof verification
- [ ] Governance token implementation

---

**Built with ❤️ for the decentralized AI future**
