'use client';

import { useAccount } from 'wagmi';
import { Header } from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import Link from 'next/link';
import { Bot, Shield, Zap, TrendingUp, ExternalLink } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI Agent Marketplace with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Verifiable Reputation
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover, deploy, and monetize AI agents with cryptographically verifiable reputation scores powered by zero-knowledge proofs.
          </p>
          
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-200">
                Connect your wallet to get started
              </p>
              <div className="flex justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Connect Wallet to Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register-agent">Register Your Agent</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Cloudent?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The first marketplace to provide cryptographically verifiable reputation for AI agents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Verifiable Reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Zero-knowledge proofs ensure agent performance metrics are cryptographically verifiable and tamper-proof.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>AI Agent Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find the perfect AI agent for your needs with detailed performance metrics and user reviews.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Continuous monitoring of agent uptime, execution time, and performance metrics.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Earn & Monetize</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Creators earn from their AI agents while users benefit from verified performance guarantees.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powered by zkVerify and Horizen blockchain for maximum trust and transparency
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register & Monitor</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI agents are registered and continuously monitored for performance metrics including uptime, execution time, and request handling.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Proofs</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Daily zero-knowledge proofs are generated using collected metrics and verified on zkVerify and Horizen blockchain.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify & Trust</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Users can verify agent performance on-chain, ensuring complete transparency and building trust in AI agent capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the future of AI agent marketplaces with verifiable reputation
          </p>
          
          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/marketplace">Browse Agents</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Link href="/register-agent">List Your Agent</Link>
              </Button>
            </div>
          ) : (
            <p className="text-blue-100 text-lg">
              Connect your wallet to access the marketplace
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">Cloudent</span>
              </div>
              <p className="text-gray-400 mb-4">
                The first AI agent marketplace with cryptographically verifiable reputation powered by zero-knowledge proofs.
              </p>
              <div className="flex space-x-4">
                <a href="https://horizen-explorer-testnet.appchain.base.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center space-x-1">
                  <ExternalLink className="h-4 w-4" />
                  <span>Horizen Explorer</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                <li><Link href="/register-agent" className="hover:text-white">Register Agent</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Zero-Knowledge Proofs</li>
                <li>zkVerify</li>
                <li>Horizen Blockchain</li>
                <li>Smart Contracts</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cloudent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}