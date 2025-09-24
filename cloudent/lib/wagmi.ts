import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// Horizen Testnet Configuration
const horizenTestnet = {
  id: 845320009,
  name: 'Horizen Testnet',
  network: 'horizen-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test ZEN',
    symbol: 'tZEN',
  },
  rpcUrls: {
    default: {
      http: ['https://gobi-testnet.horizenlabs.io/ethv1'],
    },
    public: {
      http: ['https://gobi-testnet.horizenlabs.io/ethv1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Horizen Explorer',
      url: 'https://gobi.explorer.horizenlabs.io',
    },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Cloudent',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [horizenTestnet, sepolia, mainnet],
  transports: {
    [horizenTestnet.id]: http('https://gobi-testnet.horizenlabs.io/ethv1'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

export { horizenTestnet };
