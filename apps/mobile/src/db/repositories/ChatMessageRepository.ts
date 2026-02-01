import { getDatabase } from '../database';
import { ChatMessage } from '../../../packages/shared/src/types';
import { generateUUID } from '../../utils/uuid';
import { getCurrentISOString } from '../../utils/date';

export class ChatMessageRepository {
  async create(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const db = getDatabase();
    const id = generateUUID();
    const timestamp = getCurrentISOString();

    await db.runAsync(
      `INSERT INTO chat_messages (id, idea_id, role, content, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [id, message.ideaId, message.role, message.content, timestamp]
    );

    return {
      ...message,
      id,
      timestamp,
    };
  }

  async findByIdeaId(ideaId: string): Promise<ChatMessage[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM chat_messages WHERE idea_id = ? ORDER BY timestamp ASC',
      [ideaId]
    );

    return rows.map(this.mapRowToMessage);
  }

  async deleteByIdeaId(ideaId: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM chat_messages WHERE idea_id = ?', [ideaId]);
  }

  private mapRowToMessage(row: any): ChatMessage {
    return {
      id: row.id,
      ideaId: row.idea_id,
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      timestamp: row.timestamp,
    };
  }
}
