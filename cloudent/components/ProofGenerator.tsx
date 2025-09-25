'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProofGeneratorProps {
  agentId: string;
  agentName: string;
  onProofGenerated?: (proof: ProofResult) => void;
}

interface ProofResult {
  success: boolean;
  jobId?: string;
  zkVerifyTxHash?: string;
  zkVerifyBlockHash?: string;
  aggregationId?: number;
  horizenReceiptHash?: string;
  horizenBlockHash?: string;
}

export default function ProofGenerator({ agentId, agentName, onProofGenerated }: ProofGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateProof = async () => {
    setIsGenerating(true);
    setProofResult(null);
    setLogs([]);
    
    try {
      addLog('🚀 Starting proof generation process...');
      
      // 1. Generate input data for the circuit
      addLog('📊 Generating circuit input data...');
      const inputResponse = await fetch(`/api/agents/${agentId}/generate-input`);
      
      if (!inputResponse.ok) {
        throw new Error('Failed to generate circuit input');
      }
      
      const inputData = await inputResponse.json();
      addLog('✅ Circuit input data generated');
      
      // 2. Generate proof using the circuit (via backend)
      addLog('🔄 Generating zero-knowledge proof...');
      const proofResponse = await fetch('/api/proofs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputData: inputData.inputData,
        }),
      });
      
      if (!proofResponse.ok) {
        throw new Error('Failed to generate proof');
      }
      
      const proofData = await proofResponse.json();
      addLog('✅ Zero-knowledge proof generated successfully');
      
      // 3. Submit to zkVerify for verification and aggregation
      addLog('📤 Submitting proof to zkVerify...');
      const verifyResponse = await fetch('/api/proofs/verify-zkverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          proof: proofData.proof,
          publicSignals: proofData.publicSignals,
          chainId: parseInt(process.env.NEXT_PUBLIC_HORIZEN_CHAIN_ID || '845320009'),
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Failed to submit proof to zkVerify');
      }
      
      const verifyData = await verifyResponse.json();
      addLog(`✅ Proof submitted to zkVerify. Job ID: ${verifyData.jobId}`);
      
      // 4. Wait for aggregation
      addLog('⏳ Waiting for proof aggregation on zkVerify...');
      const aggregationResponse = await fetch(`/api/proofs/wait-aggregation/${verifyData.jobId}`, {
        method: 'POST',
      });
      
      if (!aggregationResponse.ok) {
        throw new Error('Failed during aggregation process');
      }
      
      const aggregationData = await aggregationResponse.json();
      
      if (aggregationData.success) {
        addLog('🎉 Proof successfully aggregated on zkVerify!');
        addLog(`🔗 zkVerify Transaction: ${aggregationData.zkVerifyTxHash}`);
        addLog(`🌐 Horizen Receipt: ${aggregationData.horizenReceiptHash}`);
        
        const result: ProofResult = {
          success: true,
          jobId: aggregationData.jobId,
          zkVerifyTxHash: aggregationData.zkVerifyTxHash,
          zkVerifyBlockHash: aggregationData.zkVerifyBlockHash,
          aggregationId: aggregationData.aggregationId,
          horizenReceiptHash: aggregationData.horizenReceiptHash,
          horizenBlockHash: aggregationData.horizenBlockHash,
        };
        
        setProofResult(result);
        onProofGenerated?.(result);
        toast.success('Proof generated and verified successfully!');
      } else {
        throw new Error('Proof aggregation failed');
      }
      
    } catch (error: unknown) {
      console.error('Error generating proof:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
      setProofResult({ success: false });
      toast.error(`Failed to generate proof: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getExplorerUrl = (hash: string, type: 'zkverify' | 'horizen') => {
    if (type === 'horizen') {
      const baseUrl = process.env.NEXT_PUBLIC_HORIZEN_EXPLORER_URL || 'https://horizen-explorer-testnet.appchain.base.org/';
      return `${baseUrl}/tx/${hash}`;
    }
    // zkVerify explorer URL would go here
    return '#';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Generate ZK Proof for {agentName}
        </CardTitle>
        <CardDescription>
          Generate and verify a zero-knowledge proof for this agent&apos;s reputation metrics on zkVerify and Horizen testnet.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Generate Button */}
        <Button
          onClick={generateProof}
          disabled={isGenerating}
          size="lg"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Proof...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Generate & Verify Proof
            </>
          )}
        </Button>

        {/* Progress Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Process Log:</h4>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-3 max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {proofResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {proofResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className="font-semibold">
                {proofResult.success ? 'Proof Generation Successful!' : 'Proof Generation Failed'}
              </h4>
            </div>

            {proofResult.success && (
              <div className="space-y-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div>
                  <h5 className="font-medium text-sm">zkVerify Blockchain:</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Transaction: {proofResult.zkVerifyTxHash?.substring(0, 10)}...{proofResult.zkVerifyTxHash?.substring(-8)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Aggregation ID: {proofResult.aggregationId}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm">Horizen Testnet:</h5>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receipt: {proofResult.horizenReceiptHash?.substring(0, 10)}...{proofResult.horizenReceiptHash?.substring(-8)}
                    </p>
                    {proofResult.horizenReceiptHash && (
                      <a
                        href={getExplorerUrl(proofResult.horizenReceiptHash, 'horizen')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    This proof cryptographically verifies the agent&apos;s performance metrics and reputation data.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="font-medium mb-1">About ZK Proof Generation:</p>
          <ul className="space-y-1">
            <li>• Generates cryptographic proof of agent performance metrics</li>
            <li>• Verifies proof optimistically on zkVerify relayer</li>
            <li>• Aggregates proof on Horizen testnet for on-chain verification</li>
            <li>• Process typically takes 1-3 minutes to complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
