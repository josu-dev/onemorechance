import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const decks = sqliteTable(
    'decks',
    {
        id: text('id').primaryKey(),
        type: text('type', { enum: ['CHOOSE', 'COMPLETE'] }).notNull(),
        name: text('name').notNull(),
        description: text('description').notNull(),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
        updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (decks) => ({
        idIdx: uniqueIndex('decks_id_idx').on(decks.id),
        nameIdx: index('decks_name_idx').on(decks.name),
        descriptionIdx: index('decks_description_idx').on(decks.description),
    })
);

export const deckRelations = relations(decks, ({ many }) => ({
    sentences: many(sentences),
    options: many(options),
}));

export const sentences = sqliteTable(
    'sentences',
    {
        id: text('id').primaryKey(),
        text: text('text').notNull(),
        deckId: text('deck_id').notNull().references(() => decks.id),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (sentences) => ({
        idIdx: uniqueIndex('sentences_id_idx').on(sentences.id),
        textIdx: index('sentences_text_idx').on(sentences.text),
        deckIdIdx: index('sentences_deck_id_idx').on(sentences.deckId),
    })
);

export const sentenceRelations = relations(sentences, ({ one }) => ({
    deck: one(decks, {
        fields: [sentences.deckId],
        references: [decks.id],
    })
}));

export const options = sqliteTable(
    'options',
    {
        id: text('id').primaryKey(),
        text: text('text').notNull(),
        deckId: text('deck_id').notNull().references(() => decks.id),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (options) => ({
        idIdx: uniqueIndex('options_id_idx').on(options.id),
        textIdx: index('options_text_idx').on(options.text),
        deckIdIdx: index('options_deck_id_idx').on(options.deckId),
    })
);

export const optionRelations = relations(options, ({ one }) => ({
    deck: one(decks, {
        fields: [options.deckId],
        references: [decks.id],
    })
}));


export const schema = {
    decks,
    deckRelations,
    sentences,
    sentenceRelations,
    options,
    optionRelations,
};
