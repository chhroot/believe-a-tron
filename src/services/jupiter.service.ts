import { JupiterQuoteParams, JupiterQuoteResponse, JupiterSwapParams, JupiterSwapResponse } from "../types/jupiter.type";
import { SolanaService } from "./solana.service";

  
export class JupiterService {
  private static readonly BASE_URL = 'https://lite-api.jup.ag/swap/v1';
  
  static async getQuote(params: JupiterQuoteParams): Promise<JupiterQuoteResponse> {
    const {
      inputMint,
      outputMint,
      amount,
      slippageBps = 50,
      restrictIntermediateTokens = true
    } = params;

    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps.toString(),
      restrictIntermediateTokens: restrictIntermediateTokens.toString()
    });

    const url = `${this.BASE_URL}/quote?${queryParams.toString()}`;
    
    console.log(`🔍 Getting Jupiter quote: ${url}`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
      }
      
      const quoteData: JupiterQuoteResponse = await response.json();
      
      console.log(`✅ Jupiter quote received:`);
      console.log(`   Input: ${quoteData.inAmount} (${quoteData.inputMint})`);
      console.log(`   Output: ${quoteData.outAmount} (${quoteData.outputMint})`);
      console.log(`   Price Impact: ${quoteData.priceImpactPct}%`);
      console.log(`   Route: ${quoteData.routePlan[0]?.swapInfo.label || 'Unknown'}`);
      
      return quoteData;
    } catch (error) {
      console.error('❌ Failed to get Jupiter quote:', error);
      throw error;
    }
  }

  static async buildSwapTransaction(params: JupiterSwapParams): Promise<JupiterSwapResponse> {
    const {
      quoteResponse,
      userPublicKey,
      dynamicComputeUnitLimit = true,
      prioritizationFeeLamports = 'auto',
      asLegacyTransaction = false,
      useSharedAccounts = true,
      feeAccount,
      trackingAccount,
      computeUnitPriceMicroLamports
    } = params;

    const swapRequestBody = {
      quoteResponse,
      userPublicKey,
      dynamicComputeUnitLimit,
      prioritizationFeeLamports,
      asLegacyTransaction,
      useSharedAccounts,
      ...(feeAccount && { feeAccount }),
      ...(trackingAccount && { trackingAccount }),
      ...(computeUnitPriceMicroLamports && { computeUnitPriceMicroLamports })
    };

    const url = `${this.BASE_URL}/swap`;
    
    console.log(`🔨 Building Jupiter swap transaction...`);
    console.log(`   User: ${userPublicKey}`);
    console.log(`   Input: ${quoteResponse.inAmount} ${quoteResponse.inputMint}`);
    console.log(`   Output: ${quoteResponse.outAmount} ${quoteResponse.outputMint}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapRequestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jupiter Swap API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const swapData: JupiterSwapResponse = await response.json();
      
      console.log(`✅ Jupiter swap transaction built:`);
      console.log(`   Transaction size: ${swapData.swapTransaction.length} characters`);
      console.log(`   Compute unit limit: ${swapData.computeUnitLimit}`);
      console.log(`   Priority fee: ${swapData.prioritizationFeeLamports} lamports`);
      console.log(`   Valid until block: ${swapData.lastValidBlockHeight}`);
      
      return swapData;
    } catch (error) {
      console.error('❌ Failed to build Jupiter swap transaction:', error);
      throw error;
    }
  }

  static async getQuoteAndBuildSwap(
    quoteParams: JupiterQuoteParams, 
    userPublicKey: string,
    swapOptions?: Partial<Omit<JupiterSwapParams, 'quoteResponse' | 'userPublicKey'>>
  ): Promise<{ quote: JupiterQuoteResponse; swap: JupiterSwapResponse }> {
    
    console.log(`🚀 Getting quote and building swap transaction...`);
    
    const quote = await this.getQuote(quoteParams);
    const swap = await this.buildSwapTransaction({
      quoteResponse: quote,
      userPublicKey,
      ...swapOptions
    });
    
    return { quote, swap };
  }

  static async executeSwap(
    quoteParams: JupiterQuoteParams,
    solanaService: SolanaService,
    swapOptions?: Partial<Omit<JupiterSwapParams, 'quoteResponse' | 'userPublicKey'>>
  ): Promise<{
    quote: JupiterQuoteResponse;
    swap: JupiterSwapResponse;
    signature: string;
    confirmed: boolean;
  }> {
    
    console.log(`🚀 Executing complete Jupiter swap...`);
    
    try {
      const quote = await this.getQuote(quoteParams);
      
      const swap = await this.buildSwapTransaction({
        quoteResponse: quote,
        userPublicKey: solanaService.getPublicKey(),
        ...swapOptions
      });
      
      const { signature, confirmed } = await solanaService.signSendAndConfirm(
        swap.swapTransaction
      );
      
      console.log(`✅ Swap execution complete!`);
      console.log(`   Signature: ${signature}`);
      console.log(`   Confirmed: ${confirmed ? 'YES' : 'NO'}`);
      
      return { quote, swap, signature, confirmed };
      
    } catch (error) {
      console.error('❌ Failed to execute Jupiter swap:', error);
      throw error;
    }
  }

  static async getSwapEstimate(
    inputToken: string,
    outputToken: string,
    inputAmount: string
  ): Promise<{
    estimatedOutput: string;
    priceImpact: string;
    route: string;
  }> {
    const quote = await this.getQuote({
      inputMint: inputToken,
      outputMint: outputToken,
      amount: inputAmount,
      slippageBps: 50,
    });

    return {
      estimatedOutput: quote.outAmount,
      priceImpact: quote.priceImpactPct,
      route: quote.routePlan[0]?.swapInfo.label || 'Unknown'
    };
  }
}