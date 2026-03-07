/* eslint-disable sort-keys-fix/sort-keys-fix */
import { index, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';
import { users } from './user';

export const picbedImages = pgTable(
  'picbed_images',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('picbedImages'))
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    url: text('url').notNull(),
    name: text('name').notNull(),
    size: integer('size').notNull(),
    fileType: varchar('file_type', { length: 255 }).notNull(),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    userIdIdx: index('picbed_images_user_id_idx').on(table.userId),
  }),
);

export type NewPicbedImage = typeof picbedImages.$inferInsert;
export type PicbedImageItem = typeof picbedImages.$inferSelect;
