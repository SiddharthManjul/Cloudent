'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import Link from 'next/link';
import { 
  Bot, Clock, Zap, Shield, Wallet, 
  Calendar, ExternalLink, Plus, Edit, Trash2,
  DollarSign, Users, Star
} from 'lucide-react';
import { formatAddress, formatDuration } from '../../../lib/utils';
import toast from 'react-hot-toast';

interface CreatorStats {
  totalAgents: number;
  totalEarnings: number;
  totalUsers: number;
  averageRating: number;
}

interface CreatedAgent {
  id: string;
  agentName: string;
  description: string;
  keywords: string[];
  dateOfStart: string;
  currentUptime: number;
  currentAvgExec: number;
  currentRequests: number;
  proofs: Array<{
    verified: boolean;
    zkVerifyTxHash: string | null;
    horizenTxHash: string | null;
    verifiedAt: string | null;
  }>;
  _count: {
    users: number;
  };
}

export default function CreatorDashboard() {
  const { address, isConnected } = useAccount();
  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalAgents: 0,
    totalEarnings: 0,
    totalUsers: 0,
    averageRating: 0,
  });
  const [createdAgents, setCreatedAgents] = useState<CreatedAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreatorData = useCallback(async () => {
    try {
      // Fetch creator's agents
      const agentsResponse = await fetch(`/api/agents?creator=${address}`);
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setCreatedAgents(agentsData);
      }

      // Fetch creator stats
      const statsResponse = await fetch(`/api/creators/${address}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCreatorStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchCreatorData();
    }
  }, [isConnected, address, fetchCreatorData]);

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agentId}?creator=${address}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Agent deleted successfully');
        fetchCreatorData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to access your creator dashboard.
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
              <h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {formatAddress(address!)}
              </p>
            </div>
            <Button asChild>
              <Link href="/register-agent">
                <Plus className="h-4 w-4 mr-2" />
                Register New Agent
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
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-3xl font-bold">{creatorStats.totalAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold">${creatorStats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{creatorStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-3xl font-bold">{creatorStats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Created Agents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Your AI Agents
                </CardTitle>
                <CardDescription>
                  Manage your registered AI agents
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
                ) : createdAgents.length > 0 ? (
                  <div className="space-y-4">
                    {createdAgents.map((agent) => {
                      const latestProof = agent.proofs[0];
                      const isVerified = latestProof?.verified || false;
                      
                      return (
                        <div key={agent.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                              
                              {/* Keywords */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {agent.keywords.slice(0, 3).map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {agent.keywords.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{agent.keywords.length - 3}
                                  </span>
                                )}
                              </div>
                              
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
                                  <Users className="h-3 w-3" />
                                  {agent._count.users} users
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(agent.dateOfStart).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/agents/${agent.id}`}>View</Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
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
                    <h3 className="text-lg font-semibold mb-2">No Agents Created</h3>
                    <p className="text-muted-foreground mb-4">
                      Start earning by registering your first AI agent
                    </p>
                    <Button asChild>
                      <Link href="/register-agent">Register Agent</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Creator Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-mono text-sm">{formatAddress(address!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Earnings</span>
                  <span className="font-medium">${creatorStats.totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Agents</span>
                  <span className="font-medium">{createdAgents.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/register-agent">
                    <Plus className="h-4 w-4 mr-2" />
                    Register New Agent
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard">User Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium">{creatorStats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Rating</span>
                    <span className="font-medium">
                      {creatorStats.averageRating > 0 ? `${creatorStats.averageRating.toFixed(1)}/5` : 'No ratings yet'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified Agents</span>
                    <span className="font-medium">
                      {createdAgents.filter(a => a.proofs.some(p => p.verified)).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {createdAgents.length > 0 ? (
                    <>
                      <div className="text-sm">
                        <p className="font-medium">Latest Agent</p>
                        <p className="text-muted-foreground">{createdAgents[0].agentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(createdAgents[0].dateOfStart).toLocaleDateString()}
                        </p>
                      </div>
                      {createdAgents[0].proofs.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium">
                            {createdAgents[0].proofs[0].verified ? 'Proof Verified' : 'Proof Pending'}
                          </p>
                          <p className="text-muted-foreground">{createdAgents[0].agentName}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No activity yet. Register your first agent to get started!
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
