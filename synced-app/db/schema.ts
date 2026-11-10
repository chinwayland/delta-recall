import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const progress = sqliteTable('recall_progress', {
  userId: text('user_id').primaryKey(),
  state: text('state').notNull(),
  revision: integer('revision').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
