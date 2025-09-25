'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import Link from 'next/link';
import { 
  Bot, Clock, Zap, TrendingUp, Shield, Wallet, 
  Calendar, Activity, ExternalLink, Plus 
} from 'lucide-react';
import { formatAddress, formatDuration } from '../../../lib/utils';

interface UserStats {
  totalAgentsEmployed: number;
  totalSpent: number;
  averageRating: number;
  reviewsGiven: number;
}

interface EmployedAgent {
  id: string;
  agentId: string;
  startedAt: string;
  agent: {
    id: string;
    agentName: string;
    description: string;
    creator: string;
    currentUptime: number;
    currentAvgExec: number;
    currentRequests: number;
    proofs: Array<{
      verified: boolean;
      zkVerifyTxHash: string | null;
      horizenTxHash: string | null;
      verifiedAt: string | null;
    }>;
  };
}

export default function UserDashboard() {
  const { address, isConnected } = useAccount();
  const [userStats, setUserStats] = useState<UserStats>({
    totalAgentsEmployed: 0,
    totalSpent: 0,
    averageRating: 0,
    reviewsGiven: 0,
  });
  const [employedAgents, setEmployedAgents] = useState<EmployedAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      // Fetch user's employed agents
      const agentsResponse = await fetch(`/api/users/${address}/agents`);
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setEmployedAgents(agentsData);
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/users/${address}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    }
  }, [isConnected, address, fetchUserData]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {formatAddress(address!)}
              </p>
            </div>
            <Button asChild>
              <Link href="/marketplace">
                <Plus className="h-4 w-4 mr-2" />
                Employ New Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Agents Employed</p>
                  <p className="text-3xl font-bold">{userStats.totalAgentsEmployed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Wallet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold">${userStats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating Given</p>
                  <p className="text-3xl font-bold">{userStats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Reviews Given</p>
                  <p className="text-3xl font-bold">{userStats.reviewsGiven}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employed Agents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Your Employed Agents
                </CardTitle>
                <CardDescription>
                  AI agents you&apos;re currently using
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                          <div className="h-8 w-20 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : employedAgents.length > 0 ? (
                  <div className="space-y-4">
                    {employedAgents.map((employment) => {
                      const agent = employment.agent;
                      const latestProof = agent.proofs[0];
                      const isVerified = latestProof?.verified || false;
                      
                      return (
                        <div key={employment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{agent.agentName}</h3>
                                {isVerified && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {agent.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(agent.currentUptime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {agent.currentAvgExec.toFixed(0)}ms
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Since {new Date(employment.startedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/agents/${agent.id}`}>View</Link>
                              </Button>
                              <Button size="sm">
                                Manage
                              </Button>
                            </div>
                          </div>
                          
                          {isVerified && latestProof && (
                            <div className="mt-3 p-2 bg-green-50 rounded flex items-center justify-between">
                              <span className="text-xs text-green-800">
                                ✓ Verified on {new Date(latestProof.verifiedAt!).toLocaleDateString()}
                              </span>
                              {latestProof.horizenTxHash && (
                                <a
                                  href={`https://horizen-explorer-testnet.appchain.base.org/${latestProof.horizenTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Agents Employed</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by employing an AI agent from the marketplace
                    </p>
                    <Button asChild>
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-mono text-sm">{formatAddress(address!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">Today</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/marketplace">Browse Agents</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/register-agent">Register Your Agent</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/creator-dashboard">Creator Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Joined Xerion Marketplace</p>
                    <p className="text-muted-foreground">Today</p>
                  </div>
                  {employedAgents.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">Employed {employedAgents[0].agent.agentName}</p>
                      <p className="text-muted-foreground">
                        {new Date(employedAgents[0].startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
