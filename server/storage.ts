import { type TextEntry, type InsertTextEntry } from "@shared/schema";
import { pool } from './db';

export interface IStorage {
  saveTextEntry(entry: InsertTextEntry): Promise<TextEntry>;
  getTextEntryById(id: number): Promise<TextEntry | undefined>;
  getRecentTextEntries(limit: number): Promise<TextEntry[]>;
}

export class PostgresStorage implements IStorage {
  async saveTextEntry(insertEntry: InsertTextEntry): Promise<TextEntry> {
    try {
      // Calculate change count
      const changeCount = insertEntry.changes ? insertEntry.changes.length : 0;
      
      // Insert entry using SQL query
      const result = await pool.query(
        `INSERT INTO text_entries (
          original_text, humanized_text, changes, change_count, writing_style, formality_level
         ) VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, original_text as "originalText", humanized_text as "humanizedText", 
                  changes, change_count as "changeCount", writing_style as "writingStyle", 
                  formality_level as "formalityLevel"`,
        [
          insertEntry.originalText,
          insertEntry.humanizedText,
          JSON.stringify(insertEntry.changes || []), // Ensure changes is a valid JSON
          changeCount,
          insertEntry.writingStyle || null,
          insertEntry.formalityLevel || null
        ]
      );
      
      // Return the first row from the result
      return result.rows[0];
    } catch (error) {
      console.error('Error saving text entry:', error);
      throw error;
    }
  }

  async getTextEntryById(id: number): Promise<TextEntry | undefined> {
    try {
      const result = await pool.query(
        `SELECT id, original_text as "originalText", humanized_text as "humanizedText", 
                changes, change_count as "changeCount", writing_style as "writingStyle",
                formality_level as "formalityLevel"
         FROM text_entries 
         WHERE id = $1 
         LIMIT 1`,
        [id]
      );
      
      // Return undefined if no rows are found
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting text entry by ID:', error);
      throw error;
    }
  }

  async getRecentTextEntries(limit: number): Promise<TextEntry[]> {
    try {
      const result = await pool.query(
        `SELECT id, original_text as "originalText", humanized_text as "humanizedText", 
                changes, change_count as "changeCount", writing_style as "writingStyle",
                formality_level as "formalityLevel"
         FROM text_entries 
         ORDER BY id DESC 
         LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting recent text entries:', error);
      throw error;
    }
  }
}

export const storage = new PostgresStorage();
