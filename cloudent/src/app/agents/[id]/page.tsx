'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Header } from '../../../../components/Header';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import { 
  Bot, Clock, Zap, TrendingUp, Shield, ExternalLink, Star, 
  Calendar, User, MessageCircle, BarChart3
} from 'lucide-react';
import { formatAddress, formatDuration } from '../../../../lib/utils';
import ProofGenerator from '../../../../components/ProofGenerator';
import toast from 'react-hot-toast';

interface AgentDetails {
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
    id: string;
    proofId: string;
    verified: boolean;
    zkVerifyTxHash: string | null;
    horizenTxHash: string | null;
    aggregationId: number | null;
    verifiedAt: string | null;
    createdAt: string;
  }>;
  users: Array<{
    user: {
      address: string;
    };
    startedAt: string;
  }>;
  _count: {
    users: number;
  };
}

interface Review {
  id: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: string;
}

export default function AgentPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    content: '',
    rating: 5,
  });
  const [showProofGenerator, setShowProofGenerator] = useState(false);
  const [isDeployLoading, setIsDeployLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAgent = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      } else {
        toast.error('Agent not found');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error('Failed to fetch agent details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?agentId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchAgent();
      fetchReviews();
    }
  }, [params.id, fetchAgent, fetchReviews]);

  useEffect(() => {
    if (isConnected && address) {
      // Check if user is admin
      fetch(`/api/users/profile/${address}`)
        .then(res => res.json())
        .then(user => {
          setIsAdmin(user.isAdmin || false);
        })
        .catch(() => setIsAdmin(false));
    }
  }, [isConnected, address]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to leave a review');
      return;
    }

    if (!reviewForm.content.trim()) {
      toast.error('Please write a review');
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: params.id,
          userId: address,
          content: reviewForm.content,
          rating: reviewForm.rating,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setReviewForm({ content: '', rating: 5 });
        setShowReviewForm(false);
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeployAgent = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to deploy this agent');
      return;
    }

    setIsDeployLoading(true);

    try {
      const response = await fetch('/api/user-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent?.id,
          userAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Agent deployed successfully!');
        fetchAgent(); // Refresh agent data
      } else {
        const error = await response.json();
        if (error.error === 'Agent already deployed by this user') {
          toast.error('You have already deployed this agent');
        } else {
          toast.error(error.error || 'Failed to deploy agent');
        }
      }
    } catch (error) {
      console.error('Error deploying agent:', error);
      toast.error('Failed to deploy agent');
    } finally {
      setIsDeployLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground">
                The agent you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const latestProof = agent.proofs[0];
  const isVerified = latestProof?.verified || false;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{agent.agentName}</h1>
                {isVerified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <Shield className="h-4 w-4" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Created by {formatAddress(agent.creator)}
                <Calendar className="h-4 w-4 ml-4" />
                {new Date(agent.dateOfStart).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDeployAgent} 
                disabled={isDeployLoading || !isConnected}
              >
                {isDeployLoading ? 'Deploying...' : 'Deploy Agent'}
              </Button>
                  {isConnected && (address === agent.creator || isAdmin) && (
                    <Button variant="outline" onClick={() => setShowProofGenerator(!showProofGenerator)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Generate Proof {isAdmin && address !== agent.creator && '(Admin)'}
                    </Button>
                  )}
              {isConnected && address !== agent.creator && (
                <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              )}
            </div>
          </div>
        </div>

            {/* Proof Generator */}
            {showProofGenerator && isConnected && (address === agent.creator || isAdmin) && (
          <div className="mb-8">
            <ProofGenerator 
              agentId={agent.id} 
              agentName={agent.agentName}
              onProofGenerated={(proof) => {
                console.log('Proof generated:', proof);
                setShowProofGenerator(false);
                fetchAgent(); // Refresh to show new proof
                toast.success('Proof generated and saved!');
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                    {agent.usageDetails}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDuration(agent.currentUptime)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Uptime</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {agent.currentAvgExec.toFixed(0)}ms
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {agent.currentRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">Requests/Day</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Bot className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {agent._count.users}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification History */}
            {agent.proofs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verification History
                  </CardTitle>
                  <CardDescription>
                    Zero-knowledge proofs generated and verified on-chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agent.proofs.slice(0, 5).map((proof) => (
                      <div key={proof.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${proof.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">{proof.verified ? 'Verified' : 'Pending'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(proof.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {proof.aggregationId && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              ID: {proof.aggregationId}
                            </span>
                          )}
                          {proof.horizenTxHash && (
                            <a
                              href={`https://horizen-explorer-testnet.appchain.base.org/tx/${proof.horizenTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </span>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className={`w-8 h-8 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <Star className="w-full h-full fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Review</label>
                        <Textarea
                          placeholder="Share your experience with this agent..."
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={reviewLoading}>
                          {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatAddress(review.userId)}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.content}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to review this agent!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-medium">{agent._count.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">{averageRating.toFixed(1)}/5</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {agent.keywords.length === 0 && (
                    <span className="text-muted-foreground text-sm">No categories specified</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Verification */}
            {latestProof && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${latestProof.verified ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className="text-sm">
                      {latestProof.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {latestProof.verifiedAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(latestProof.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                  {latestProof.aggregationId && (
                    <p className="text-xs text-muted-foreground">
                      Aggregation ID: {latestProof.aggregationId}
                    </p>
                  )}
                  {latestProof.horizenTxHash && (
                    <a
                      href={`https://horizen-explorer-testnet.appchain.base.org/tx/${latestProof.horizenTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
