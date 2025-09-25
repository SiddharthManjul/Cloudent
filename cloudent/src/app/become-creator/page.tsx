'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Crown, Bot, Shield, DollarSign, TrendingUp, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BecomeCreator() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBecomeCreator = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      // Create a placeholder agent to mark user as creator
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: `${address.slice(0, 8)}'s First Agent`,
          description: 'This is a placeholder agent to register as a creator. You can edit or delete this later.',
          creator: address,
          keywords: ['placeholder'],
          usageDetails: 'This is a placeholder agent. Please register your actual AI agent.',
        }),
      });

      if (response.ok) {
        const agent = await response.json();
        toast.success('Welcome to Cloudent Creators! You can now register AI agents.');
        
        // Delete the placeholder agent immediately
        await fetch(`/api/agents/${agent.id}?creator=${address}`, {
          method: 'DELETE',
        });
        
        router.push('/register-agent');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register as creator');
      }
    } catch (error) {
      console.error('Error becoming creator:', error);
      toast.error('Failed to register as creator');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to become a creator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Become a Creator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Cloudent creator community and start monetizing your AI agents with verifiable reputation
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle>Earn Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monetize your AI agents and earn from every deployment and usage
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Verifiable Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build trust with cryptographically verifiable performance metrics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access detailed analytics and performance insights for your agents
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* What You Get */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              What You Get as a Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Creator Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive dashboard to manage all your AI agents
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Agent Registration</h4>
                    <p className="text-sm text-muted-foreground">
                      List unlimited AI agents on the marketplace
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Performance Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time monitoring of agent performance and uptime
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Zero-Knowledge Proofs</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated proof generation for reputation verification
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Revenue Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed earnings and usage statistics
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Blockchain Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      On-chain proof verification on Horizen testnet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Creating?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join thousands of creators who are already earning from their AI agents with verifiable reputation.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleBecomeCreator}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                {loading ? 'Registering...' : 'Become a Creator Now'}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Free to join • No monthly fees • Instant approval
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Creator Requirements */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Creator Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Connected crypto wallet (any supported wallet)</li>
            <li>• Willingness to have your agents monitored for performance</li>
            <li>• Commitment to providing accurate agent descriptions</li>
            <li>• Agreement to zkVerify proof generation and verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
