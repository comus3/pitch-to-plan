import { getDatabase } from './database';
import { DATABASE_VERSION } from '../../../packages/shared/src/constants';

export async function runMigrations(): Promise<void> {
  const db = getDatabase();

  // Create schema_metadata table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_metadata (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  // Get current version
  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_metadata ORDER BY version DESC LIMIT 1'
  );

  const currentVersion = result?.version || 0;

  // Run migrations sequentially
  if (currentVersion < 1) {
    await migrateToV1(db);
    await db.runAsync(
      'INSERT INTO schema_metadata (version, applied_at) VALUES (?, ?)',
      [1, new Date().toISOString()]
    );
  }

  // Future migrations can be added here
  // if (currentVersion < 2) {
  //   await migrateToV2(db);
  //   ...
  // }
}

async function migrateToV1(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags TEXT,
      status TEXT NOT NULL,
      summary TEXT,
      report_md TEXT,
      report_json TEXT,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      idea_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_idea_id ON chat_messages(idea_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
  `);
}
