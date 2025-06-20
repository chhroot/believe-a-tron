import { readFileSync } from 'fs';
import { join } from 'path';
import { TokensConfig, HandleTokenMapping } from '../types/tokens.type';

const TOKENS_FILE_PATH = join(__dirname, '../data/tokens.json');

export function loadTokensFromFile(): TokensConfig {
  try {
    const tokensData = readFileSync(TOKENS_FILE_PATH, 'utf-8');
    return JSON.parse(tokensData) as TokensConfig;
  } catch (error) {
    console.error('Error loading tokens.json:', error);
    throw new Error('Failed to load tokens configuration');
  }
}

export function getHandleTokenMappings(): HandleTokenMapping[] {
  const tokensConfig = loadTokensFromFile();
  
  return Object.entries(tokensConfig).map(([handle, tokenData]) => ({
    handle,
    tokenData
  }));
}

export function getHandles(): string[] {
  const tokensConfig = loadTokensFromFile();
  return Object.keys(tokensConfig);
}

export function getTokenDataForHandle(handle: string): TokensConfig[string] | null {
  const tokensConfig = loadTokensFromFile();
  return tokensConfig[handle] || null;
}

export function hasTokenForHandle(handle: string): boolean {
  const tokensConfig = loadTokensFromFile();
  return handle in tokensConfig;
} 