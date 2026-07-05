interface CloudflareEnv {
  DB: D1Database;
  GAME_ASSETS: R2Bucket;
  SCAN_QUEUE: Queue<ScanQueueMessage>;
  ASSETS: Fetcher;
  APP_ORIGIN: string;
  GAME_ORIGIN: string;
  AUTH_MODE: string;
  SESSION_SECRET?: string;
}

interface ScanQueueMessage {
  jobId: string;
  gameId: string;
  url: string;
  requestedBy: string;
}
