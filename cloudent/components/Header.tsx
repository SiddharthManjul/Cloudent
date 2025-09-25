'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@radix-ui/react-dropdown-menu';
import { User, Bot, Settings, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'user' | 'creator' | 'admin' | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      // Check user role by fetching user data
      fetch(`/api/users/profile/${address}`)
        .then(res => res.json())
        .then(user => {
          if (user.isAdmin) {
            setUserRole('admin');
          } else if (user.createdAgentsCount > 0) {
            setUserRole('creator');
          } else {
            setUserRole('user');
          }
        })
        .catch(() => setUserRole('user'));
    } else {
      setUserRole(null);
    }
  }, [isConnected, address]);

  const isActivePage = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

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
            <Link 
              href="/marketplace" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                isActivePage('/marketplace') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:text-primary hover:bg-accent'
              }`}
            >
              Marketplace
            </Link>
            
            {isConnected && (userRole === 'creator' || userRole === 'admin') && (
              <Link 
                href="/register-agent" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActivePage('/register-agent') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
              >
                Register Agent
              </Link>
            )}
            
            {isConnected && userRole === 'admin' && (
              <Link 
                href="/admin-dashboard" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActivePage('/admin-dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            
            {isConnected && userRole === 'user' && (
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActivePage('/dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
              >
                Dashboard
              </Link>
            )}
            
            {isConnected && (userRole === 'creator' || userRole === 'admin') && (
              <Link 
                href="/creator-dashboard" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActivePage('/creator-dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
              >
                Creator Dashboard
              </Link>
            )}
            
            {isConnected && userRole === 'user' && (
              <Link 
                href="/become-creator" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md flex items-center gap-1 ${
                  isActivePage('/become-creator') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
              >
                <Crown className="h-4 w-4" />
                Become Creator
              </Link>
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
                  {userRole === 'user' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                        <User className="h-4 w-4" />
                        <span>User Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'creator' && (
                    <DropdownMenuItem asChild>
                      <Link href="/creator-dashboard" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                        <Bot className="h-4 w-4" />
                        <span>Creator Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'user' && (
                    <DropdownMenuItem asChild>
                      <Link href="/become-creator" className="flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                        <Crown className="h-4 w-4" />
                        <span>Become Creator</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
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
