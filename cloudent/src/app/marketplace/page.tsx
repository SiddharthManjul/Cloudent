'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';
import { Bot, Clock, Zap, TrendingUp, Shield, Search, ExternalLink } from 'lucide-react';
import { formatAddress, formatDuration } from '../../../lib/utils';

interface Agent {
  id: string;
  agentName: string;
  description: string;
  creator: string;
  keywords: string[];
  usageDetails: string;
  dateOfStart: string;
  currentUptime: number;
  currentAvgExec: number;
  currentRequests: number;
  creatorUser: {
    address: string;
  };
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

export default function Marketplace() {
  const { isConnected } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKeyword = !selectedKeyword || agent.keywords.includes(selectedKeyword);
    return matchesSearch && matchesKeyword;
  });

  const allKeywords = Array.from(new Set(agents.flatMap(agent => agent.keywords)));

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to access the marketplace.
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
          <h1 className="text-4xl font-bold mb-4">AI Agent Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Discover AI agents with verifiable reputation and proven performance
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">All Categories</option>
              {allKeywords.map(keyword => (
                <option key={keyword} value={keyword}>{keyword}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified Agents</p>
                  <p className="text-2xl font-bold">
                    {agents.filter(a => a.proofs.some(p => p.verified)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {agents.reduce((sum, a) => sum + a._count.users, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Uptime</p>
                  <p className="text-2xl font-bold">
                    {agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.currentUptime, 0) / agents.length) : 0}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const latestProof = agent.proofs[0];
              const isVerified = latestProof?.verified || false;
              
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{agent.agentName}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          by {formatAddress(agent.creator)}
                        </CardDescription>
                      </div>
                      {isVerified && (
                        <Shield className="h-5 w-5 text-green-600" title="Verified Agent" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-3">{agent.description}</p>
                    
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
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
                          +{agent.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDuration(agent.currentUptime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        <span>{agent.currentAvgExec.toFixed(0)}ms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>{agent.currentRequests} req/day</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Bot className="h-3 w-3 text-muted-foreground" />
                        <span>{agent._count.users} users</span>
                      </div>
                    </div>
                    
                    {/* Verification Status */}
                    {isVerified && latestProof && (
                      <div className="p-2 bg-green-50 rounded-md">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-800 font-medium">
                            ✓ Verified on {new Date(latestProof.verifiedAt!).toLocaleDateString()}
                          </span>
                          {latestProof.horizenTxHash && (
                            <a
                              href={`https://gobi.explorer.horizenlabs.io/tx/${latestProof.horizenTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/agents/${agent.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Deploy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedKeyword
                ? 'Try adjusting your search criteria.'
                : 'Be the first to register an AI agent!'}
            </p>
            {!searchTerm && !selectedKeyword && (
              <Button asChild className="mt-4">
                <Link href="/register-agent">Register Agent</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
