import { getDatabase } from '../database';
import { Idea, IdeaStatus } from '../../../packages/shared/src/types';
import { generateUUID } from '../../utils/uuid';
import { getCurrentISOString } from '../../utils/date';

export class IdeaRepository {
  async create(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const db = getDatabase();
    const id = generateUUID();
    const now = getCurrentISOString();

    await db.runAsync(
      `INSERT INTO ideas (
        id, title, created_at, updated_at, tags, status, summary, report_md, report_json, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        idea.title,
        now,
        now,
        JSON.stringify(idea.tags),
        idea.status,
        idea.summary,
        idea.reportMd,
        idea.reportJson ? JSON.stringify(idea.reportJson) : null,
        idea.syncedAt || null,
      ]
    );

    return {
      ...idea,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findAll(): Promise<Idea[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM ideas ORDER BY created_at DESC'
    );

    return rows.map(this.mapRowToIdea);
  }

  async findById(id: string): Promise<Idea | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM ideas WHERE id = ?',
      [id]
    );

    return row ? this.mapRowToIdea(row) : null;
  }

  async update(id: string, updates: Partial<Idea>): Promise<Idea> {
    const db = getDatabase();
    const now = getCurrentISOString();

    const setParts: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      setParts.push('title = ?');
      values.push(updates.title);
    }
    if (updates.tags !== undefined) {
      setParts.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.status !== undefined) {
      setParts.push('status = ?');
      values.push(updates.status);
    }
    if (updates.summary !== undefined) {
      setParts.push('summary = ?');
      values.push(updates.summary);
    }
    if (updates.reportMd !== undefined) {
      setParts.push('report_md = ?');
      values.push(updates.reportMd);
    }
    if (updates.reportJson !== undefined) {
      setParts.push('report_json = ?');
      values.push(updates.reportJson ? JSON.stringify(updates.reportJson) : null);
    }
    if (updates.syncedAt !== undefined) {
      setParts.push('synced_at = ?');
      values.push(updates.syncedAt);
    }

    setParts.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE ideas SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Idea with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM ideas WHERE id = ?', [id]);
  }

  async search(query: string): Promise<Idea[]> {
    const db = getDatabase();
    const searchTerm = `%${query.toLowerCase()}%`;
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM ideas 
       WHERE LOWER(title) LIKE ? OR LOWER(summary) LIKE ?
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm]
    );

    return rows.map(this.mapRowToIdea);
  }

  private mapRowToIdea(row: any): Idea {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags ? JSON.parse(row.tags) : [],
      status: row.status as IdeaStatus,
      summary: row.summary || '',
      reportMd: row.report_md || '',
      reportJson: row.report_json ? JSON.parse(row.report_json) : null,
      syncedAt: row.synced_at || null,
    };
  }
}
