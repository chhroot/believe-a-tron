import { Connection, Keypair, VersionedTransaction, sendAndConfirmTransaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export class SolanaService {
  private connection: Connection;
  private wallet: Keypair;

  constructor(rpcEndpoint: string, privateKeyBase58: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.wallet = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
  }

  static createFromEnv(): SolanaService {
    const rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY environment variable is required');
    }

    return new SolanaService(rpcEndpoint, privateKey);
  }

  getPublicKey(): string {
    return this.wallet.publicKey.toBase58();
  }

  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / 1e9;
  }

  async signAndSendTransaction(serializedTransaction: string): Promise<string> {
    try {
      console.log('🔏 Signing and sending transaction...');
      
      const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);
      
      transaction.sign([this.wallet]);
      
      console.log('✍️ Transaction signed, sending to network...');
      
      const signature = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      console.log(`📡 Transaction sent with signature: ${signature}`);
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to sign and send transaction:', error);
      throw error;
    }
  }

  async confirmTransaction(signature: string, commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): Promise<boolean> {
    try {
      console.log(`⏳ Confirming transaction ${signature}...`);
      
      const confirmation = await this.connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        console.error('❌ Transaction failed:', confirmation.value.err);
        return false;
      }
      
      console.log(`✅ Transaction confirmed: ${signature}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to confirm transaction:', error);
      return false;
    }
  }

  async signSendAndConfirm(serializedTransaction: string): Promise<{ signature: string; confirmed: boolean }> {
    const signature = await this.signAndSendTransaction(serializedTransaction);
    const confirmed = await this.confirmTransaction(signature);
    
    return { signature, confirmed };
  }
}