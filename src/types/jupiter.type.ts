export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
  restrictIntermediateTokens?: boolean;
}

export interface JupiterSwapParams {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: string;
  dynamicComputeUnitLimit?: boolean;
  prioritizationFeeLamports?: number;
  asLegacyTransaction?: boolean;
  useSharedAccounts?: boolean;
  feeAccount?: string;
  trackingAccount?: string;
  computeUnitPriceMicroLamports?: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: {
    computeBudget: {
      microLamports: number;
      estimatedFee: number;
    };
  };
  dynamicSlippageReport?: any;
  simulationError?: any;
}

export interface JupiterSendTransactionParams {
  serializedTransaction: string;
  rpcEndpoint?: string;
  maxRetries?: number;
  skipPreflight?: boolean;
  preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
  encoding?: 'base64' | 'base58';
}

export interface JupiterTransactionResult {
  signature: string;
  confirmed: boolean;
  blockHeight?: number;
  slot?: number;
  confirmationStatus?: 'processed' | 'confirmed' | 'finalized';
  err?: any;
}

export interface SolanaWalletConfig {
  publicKey: string;
  privateKey: string;
}
