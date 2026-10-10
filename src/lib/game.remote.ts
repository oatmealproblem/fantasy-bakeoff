import { error, invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { parse_bakers } from '#lib/server/bakers.ts';
import { db } from '#lib/server/db/index.ts';
import { contestant, game, player } from '#lib/server/db/schema.ts';

function require_user() {
	const user = getRequestEvent().locals.user;
	if (!user) error(401, 'Sign in to continue');
	return user;
}

function require_game(id: string) {
	const row = db
		.select()
		.from(game)
		.where(and(eq(game.id, id), eq(game.created_by_id, require_user().id)))
		.get();
	if (!row) error(404, 'Game not found');
	return row;
}

function require_player(id: string) {
	const row = db.select().from(player).where(eq(player.id, id)).get();
	if (!row) error(404, 'Player not found');
	require_game(row.game_id);
	return row;
}

function require_contestant(id: string) {
	const row = db.select().from(contestant).where(eq(contestant.id, id)).get();
	if (!row) error(404, 'Contestant not found');
	require_game(row.game_id);
	return row;
}

export const get_games = query(() =>
	db
		.select()
		.from(game)
		.where(eq(game.created_by_id, require_user().id))
		.orderBy(desc(game.created_at))
		.all()
);

export const get_game = query(z.string(), (id) => {
	const row = require_game(id);

	return {
		...row,
		players: db.select().from(player).where(eq(player.game_id, id)).orderBy(asc(player.name)).all(),
		contestants: db
			.select()
			.from(contestant)
			.where(eq(contestant.game_id, id))
			.orderBy(asc(contestant.name))
			.all()
	};
});

const game_name = z.string().trim().min(1, 'Enter a game name');

export const create_game = form(z.object({ name: game_name }), ({ name }) => {
	const row = db
		.insert(game)
		.values({ name, created_by_id: require_user().id })
		.returning({ id: game.id })
		.get();

	redirect(303, `/games/${row.id}`);
});

export const update_game = form(z.object({ id: z.string(), name: game_name }), ({ id, name }) => {
	require_game(id);
	db.update(game).set({ name }).where(eq(game.id, id)).run();
});

export const delete_game = form(z.object({ id: z.string() }), ({ id }) => {
	require_game(id);
	db.delete(game).where(eq(game.id, id)).run();
	redirect(303, '/');
});

const player_fields = {
	name: z.string().trim().min(1, 'Enter a name'),
	phone: z
		.string()
		.trim()
		.transform((v) => v || null),
	email: z
		.string()
		.trim()
		.transform((v) => v || null)
};

export const add_player = form(
	z.object({ game_id: z.string(), ...player_fields }),
	({ game_id, ...values }) => {
		require_game(game_id);
		db.insert(player)
			.values({ game_id, ...values })
			.run();
	}
);

export const update_player = form(
	z.object({ id: z.string(), ...player_fields }),
	({ id, ...values }) => {
		require_player(id);
		db.update(player).set(values).where(eq(player.id, id)).run();
	}
);

export const delete_player = form(z.object({ id: z.string() }), ({ id }) => {
	require_player(id);
	db.delete(player).where(eq(player.id, id)).run();
});

const contestant_fields = {
	name: z.string().trim().min(1, 'Enter a name'),
	picture_url: z.string().trim().default('')
};

export const add_contestant = form(
	z.object({ game_id: z.string(), ...contestant_fields }),
	({ game_id, ...values }) => {
		require_game(game_id);
		db.insert(contestant)
			.values({ game_id, ...values })
			.run();
	}
);

export const update_contestant = form(
	z.object({ id: z.string(), ...contestant_fields }),
	({ id, ...values }) => {
		require_contestant(id);
		db.update(contestant).set(values).where(eq(contestant.id, id)).run();
	}
);

export const delete_contestant = form(z.object({ id: z.string() }), ({ id }) => {
	require_contestant(id);
	db.delete(contestant).where(eq(contestant.id, id)).run();
});

export const import_contestants = form(
	z.object({ game_id: z.string(), series: z.number().int().min(1).max(20) }),
	async ({ game_id, series }) => {
		require_game(game_id);

		const response = await fetch(
			`https://thegreatbritishbakeoff.co.uk/bakers/series-${series}`
		).catch(() => null);

		if (!response?.ok) invalid(`Could not load series ${series} from the Bake Off website`);

		const bakers = parse_bakers(await response.text());
		if (bakers.length === 0) invalid(`No contestants found for series ${series}`);

		const existing = new Set(
			db
				.select({ name: contestant.name })
				.from(contestant)
				.where(eq(contestant.game_id, game_id))
				.all()
				.map((c) => c.name)
		);

		const rows = bakers
			.filter((baker) => !existing.has(baker.name))
			.map((baker) => ({ ...baker, game_id }));

		if (rows.length > 0) db.insert(contestant).values(rows).run();

		return { imported: rows.length };
	}
);
