export interface BotStats {
  tweetsProcessed: number;
  tokensAnalyzed: number;
  purchasesMade: number;
  lastRun: Date | null;
  errors: number;
  uptime: number;
}

export interface BotStatus {
  isRunning: boolean;
  isPaused: boolean;
  monitoredHandles: string[];
  stats: BotStats;
}
