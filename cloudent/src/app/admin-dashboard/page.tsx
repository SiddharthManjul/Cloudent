'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Shield, 
  Users, 
  Bot, 
  TrendingUp, 
  FileCheck,
  Crown,
  Activity,
  BarChart3,
  ExternalLink,
  Clock
} from 'lucide-react';
import { formatAddress, formatDuration } from '../../../lib/utils';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalProofs: number;
  totalVerifiedProofs: number;
  totalAdmins: number;
}

interface AgentSummary {
  id: string;
  agentName: string;
  creator: string;
  uptime: number;
  isVerified: boolean;
  userCount: number;
  lastProofDate?: string;
}

export default function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      // Check admin status first
      const profileResponse = await fetch(`/api/users/profile/${address}`);
      const profile = await profileResponse.json();
      
      if (!profile.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }
      
      setIsAdmin(true);

      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch all agents for overview
      const agentsResponse = await fetch('/api/admin/agents');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, [address, router]);

  useEffect(() => {
    if (isConnected && address) {
      fetchAdminData();
    } else {
      router.push('/');
    }
  }, [isConnected, address, fetchAdminData, router]);

  const handleGenerateProofForAgent = async (agentId: string, agentName: string) => {
    try {
      toast.success(`Initiating proof generation for ${agentName}...`);
      // This could trigger the proof generation workflow
      // For now, we'll just show a success message
      // In a real implementation, you'd call the proof generation API
    } catch (error) {
      console.error('Error generating proof:', error);
      toast.error('Failed to generate proof');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have admin privileges to access this page.</p>
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
          <div className="flex items-center gap-4 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            System administration and oversight for Xerion Marketplace platform
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proofs</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProofs}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Proofs</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVerifiedProofs}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Admins</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Agents Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              All Agents Overview
            </CardTitle>
            <CardDescription>
              Monitor and manage all agents on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{agent.agentName}</h3>
                      {agent.isVerified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <Shield className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Creator: {formatAddress(agent.creator)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(agent.uptime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {agent.userCount} users
                      </span>
                      {agent.lastProofDate && (
                        <span>Last proof: {new Date(agent.lastProofDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateProofForAgent(agent.id, agent.agentName)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Generate Proof
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/agents/${agent.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No agents found on the platform yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                View System Logs
              </Button>
              <Button className="w-full" variant="outline">
                Manage Users
              </Button>
              <Button className="w-full" variant="outline">
                Export Data
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Proof Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Generate All Proofs
              </Button>
              <Button className="w-full" variant="outline">
                Verify Pending Proofs
              </Button>
              <Button className="w-full" variant="outline">
                Proof Analytics
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Usage Statistics
              </Button>
              <Button className="w-full" variant="outline">
                Performance Metrics
              </Button>
              <Button className="w-full" variant="outline">
                Revenue Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
