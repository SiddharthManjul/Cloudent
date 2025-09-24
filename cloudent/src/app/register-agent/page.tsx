'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Bot, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterAgent() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  
  const [formData, setFormData] = useState({
    agentName: '',
    description: '',
    usageDetails: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords(prev => [...prev, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.agentName || !formData.description || !formData.usageDetails) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creator: address,
          keywords,
        }),
      });

      if (response.ok) {
        const agent = await response.json();
        toast.success('Agent registered successfully!');
        router.push(`/agents/${agent.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register agent');
      }
    } catch (error) {
      console.error('Error registering agent:', error);
      toast.error('Failed to register agent');
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
            Please connect your wallet to register an AI agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            <Bot className="h-10 w-10 text-primary" />
            Register AI Agent
          </h1>
          <p className="text-xl text-muted-foreground">
            List your AI agent on the marketplace with verifiable reputation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>
              Provide details about your AI agent. Once registered, the system will automatically monitor its performance metrics.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <label htmlFor="agentName" className="text-sm font-medium">
                  Agent Name *
                </label>
                <Input
                  id="agentName"
                  name="agentName"
                  placeholder="Enter your agent's name"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your agent does and its capabilities"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label htmlFor="keywords" className="text-sm font-medium">
                  Keywords/Categories
                </label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    placeholder="Add a keyword and press Enter"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                  />
                  <Button type="button" onClick={addKeyword} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Usage Details */}
              <div className="space-y-2">
                <label htmlFor="usageDetails" className="text-sm font-medium">
                  Usage Instructions *
                </label>
                <Textarea
                  id="usageDetails"
                  name="usageDetails"
                  placeholder="Provide detailed instructions on how to use your AI agent"
                  value={formData.usageDetails}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              {/* Creator Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Creator Information</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Wallet Address:</strong> {address}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will be recorded as the creator and you'll receive earnings from your agent.
                </p>
              </div>

              {/* Monitoring Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Automatic Monitoring</h4>
                <p className="text-sm text-blue-800">
                  Once registered, your agent will be automatically monitored for:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-1 space-y-1">
                  <li>Uptime and availability</li>
                  <li>Average execution time</li>
                  <li>Daily request count</li>
                  <li>User reviews and ratings</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  Zero-knowledge proofs will be generated daily at midnight to verify these metrics on-chain.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Registering...' : 'Register Agent'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
