'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@radix-ui/react-dropdown-menu';
import { User, Bot, Settings } from 'lucide-react';

export function Header() {
  const { address, isConnected } = useAccount();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Cloudent</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/register-agent" className="text-sm font-medium hover:text-primary transition-colors">
              Register Agent
            </Link>
            {isConnected && (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/creator-dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Creator Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border rounded-md shadow-lg p-1">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                      <User className="h-4 w-4" />
                      <span>User Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/creator-dashboard" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                      <Bot className="h-4 w-4" />
                      <span>Creator Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
