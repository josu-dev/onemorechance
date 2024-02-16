import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { DECK_TYPE, ROOM_STATUS } from '../src/shared/constants.ts';


/**
 * Remember to update related types in the shared folder 
 * See: ../src/shared/types.ts
 */
export const decks = sqliteTable(
    'decks',
    {
        id: text('id').primaryKey(),
        type: text('type', { enum: [DECK_TYPE.COMPLETE, DECK_TYPE.SELECT] }).notNull(),
        name: text('name').notNull(),
        description: text('description').notNull(),
        userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
        updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (decks) => ({
        idIdx: uniqueIndex('decks_id_idx').on(decks.id),
        nameIdx: index('decks_name_idx').on(decks.name),
        descriptionIdx: index('decks_description_idx').on(decks.description),
        userIdIdx: index('decks_user_id_idx').on(decks.userId),
    })
);

export const deckRelations = relations(decks, ({ one, many }) => ({
    sentences: many(sentences),
    options: many(options),
    user: one(users, {
        fields: [decks.userId],
        references: [users.id],
    }),
}));

export const sentences = sqliteTable(
    'sentences',
    {
        id: text('id').primaryKey(),
        text: text('text').notNull(),
        deckId: text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
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
        deckId: text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
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


/**
 * Remember to update related types in the shared folder 
 * See: ../src/shared/types.ts
 */
export const users = sqliteTable(
    'users',
    {
        id: text('id').primaryKey(),
        name: text('name').notNull(),
        gamesPlayed: integer('games_played').notNull().default(0),
        gamesWon: integer('games_won').notNull().default(0),
        scoreLastGame: integer('score_last_game').notNull().default(0),
        scoreLifetime: integer('score_lifetime').notNull().default(0),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
        updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (users) => ({
        idIdx: uniqueIndex('player_id_idx').on(users.id),
        nameIdx: index('player_name_idx').on(users.name),
    })
);

export const userRelations = relations(users, ({ many }) => ({
    rooms: many(rooms),
    decks: many(decks),
}));

export const rooms = sqliteTable(
    'rooms',
    {
        id: text('id').primaryKey(),
        name: text('name').notNull(),
        status: text('status', {
            enum: [
                ROOM_STATUS.CLOSED,
                ROOM_STATUS.GAME_ON,
                ROOM_STATUS.WAITING
            ]
        }).notNull().default(ROOM_STATUS.WAITING),
        hostId: text('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        playersCount: integer('players_count').notNull().default(0),
        playersMax: integer('players_max').notNull(),
        createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
        updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    },
    (rooms) => ({
        idIdx: uniqueIndex('room_id_idx').on(rooms.id),
        nameIdx: index('room_name_idx').on(rooms.name),
        hostIdIdx: index('room_host_id_idx').on(rooms.hostId),
    })
);

export const roomRelations = relations(rooms, ({ one }) => ({
    host: one(users, {
        fields: [rooms.hostId],
        references: [users.id],
    }),
}));
