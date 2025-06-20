export interface TokenData {
  symbol: string;
  address: string;
}

export interface TokensConfig {
  [handle: string]: TokenData;
}

export interface HandleTokenMapping {
  handle: string;
  tokenData: TokenData;
} 