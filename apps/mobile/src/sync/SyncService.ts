// Cloud sync service interface (stubbed for v0.1-v0.2)
// Real implementation will be added in v0.3+

export interface SyncService {
  syncIdeas(): Promise<void>;
  syncIdea(ideaId: string): Promise<void>;
  getSyncStatus(): Promise<{ lastSync: string | null; pending: number }>;
}

export class StubSyncService implements SyncService {
  async syncIdeas(): Promise<void> {
    // Stub implementation - returns immediately
    // Real implementation in v0.3+
    return Promise.resolve();
  }

  async syncIdea(ideaId: string): Promise<void> {
    // Stub implementation - returns immediately
    // Real implementation in v0.3+
    return Promise.resolve();
  }

  async getSyncStatus(): Promise<{ lastSync: string | null; pending: number }> {
    // Stub implementation - returns empty status
    // Real implementation in v0.3+
    return {
      lastSync: null,
      pending: 0,
    };
  }
}
