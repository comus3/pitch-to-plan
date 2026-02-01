// Sync-related types

export interface SyncStatus {
  lastSync: string | null;
  pending: number;
  isSyncing: boolean;
}

export interface SyncConflict {
  ideaId: string;
  localVersion: number;
  remoteVersion: number;
  localData: unknown;
  remoteData: unknown;
}
