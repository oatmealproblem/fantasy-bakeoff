import { relations, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => nanoid());

const created_at = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull();

export const task = sqliteTable('task', {
	id: id(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const game = sqliteTable('game', {
	id: id(),
	name: text('name').notNull(),
	created_by_id: text('created_by_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	created_at: created_at()
});

export const contestant = sqliteTable(
	'contestant',
	{
		id: id(),
		game_id: text('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		picture_url: text('picture_url').notNull()
	},
	(t) => [index('contestant_game_id_idx').on(t.game_id)]
);

export const player = sqliteTable(
	'player',
	{
		id: id(),
		game_id: text('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		email: text('email')
	},
	(t) => [index('player_game_id_idx').on(t.game_id)]
);

export const round = sqliteTable(
	'round',
	{
		id: id(),
		game_id: text('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		number: integer('number').notNull(),
		name: text('name').notNull(),
		bonus_question: text('bonus_question'),
		allow_finale_prediction: integer('allow_finale_prediction', { mode: 'boolean' })
			.notNull()
			.default(false),
		is_finale: integer('is_finale', { mode: 'boolean' }).notNull().default(false),
		expected_number_sent_home: integer('expected_number_sent_home'),
		response_deadline: integer('response_deadline', { mode: 'timestamp_ms' })
	},
	(t) => [index('round_game_id_idx').on(t.game_id)]
);

export const round_contestant = sqliteTable(
	'round_contestant',
	{
		round_id: text('round_id')
			.notNull()
			.references(() => round.id, { onDelete: 'cascade' }),
		contestant_id: text('contestant_id')
			.notNull()
			.references(() => contestant.id, { onDelete: 'cascade' }),
		role: text('role', {
			enum: [
				'star_baker',
				'star_baker_discussed',
				'technical_challenge_first',
				'technical_challenge_second',
				'technical_challenge_third',
				'technical_challenge_last',
				'sent_home',
				'sent_home_discussed',
				'bonus_question_answer',
				'winner',
				'finalist'
			]
		}).notNull()
	},
	(t) => [
		primaryKey({ columns: [t.round_id, t.contestant_id, t.role] }),
		index('round_contestant_contestant_id_idx').on(t.contestant_id)
	]
);

export const response = sqliteTable(
	'response',
	{
		id: id(),
		player_id: text('player_id')
			.notNull()
			.references(() => player.id, { onDelete: 'cascade' }),
		round_id: text('round_id')
			.notNull()
			.references(() => round.id, { onDelete: 'cascade' })
	},
	(t) => [
		uniqueIndex('response_player_id_round_id_idx').on(t.player_id, t.round_id),
		index('response_round_id_idx').on(t.round_id)
	]
);

export const response_contestant = sqliteTable(
	'response_contestant',
	{
		response_id: text('response_id')
			.notNull()
			.references(() => response.id, { onDelete: 'cascade' }),
		contestant_id: text('contestant_id')
			.notNull()
			.references(() => contestant.id, { onDelete: 'cascade' }),
		role: text('role', {
			enum: [
				'star_baker',
				'sent_home',
				'technical_challenge_first',
				'bonus_question_answer',
				'winner',
				'finalist'
			]
		}).notNull()
	},
	(t) => [
		primaryKey({ columns: [t.response_id, t.contestant_id, t.role] }),
		index('response_contestant_contestant_id_idx').on(t.contestant_id)
	]
);

export const game_relations = relations(game, ({ one, many }) => ({
	created_by: one(user, { fields: [game.created_by_id], references: [user.id] }),
	contestants: many(contestant),
	players: many(player),
	rounds: many(round)
}));

export const contestant_relations = relations(contestant, ({ one, many }) => ({
	game: one(game, { fields: [contestant.game_id], references: [game.id] }),
	round_contestants: many(round_contestant),
	response_contestants: many(response_contestant)
}));

export const player_relations = relations(player, ({ one, many }) => ({
	game: one(game, { fields: [player.game_id], references: [game.id] }),
	responses: many(response)
}));

export const round_relations = relations(round, ({ one, many }) => ({
	game: one(game, { fields: [round.game_id], references: [game.id] }),
	contestants: many(round_contestant),
	responses: many(response)
}));

export const round_contestant_relations = relations(round_contestant, ({ one }) => ({
	round: one(round, { fields: [round_contestant.round_id], references: [round.id] }),
	contestant: one(contestant, {
		fields: [round_contestant.contestant_id],
		references: [contestant.id]
	})
}));

export const response_relations = relations(response, ({ one, many }) => ({
	player: one(player, { fields: [response.player_id], references: [player.id] }),
	round: one(round, { fields: [response.round_id], references: [round.id] }),
	contestants: many(response_contestant)
}));

export const response_contestant_relations = relations(response_contestant, ({ one }) => ({
	response: one(response, { fields: [response_contestant.response_id], references: [response.id] }),
	contestant: one(contestant, {
		fields: [response_contestant.contestant_id],
		references: [contestant.id]
	})
}));

export * from './auth.schema';
