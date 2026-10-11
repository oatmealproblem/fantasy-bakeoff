import { error, invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { and, asc, desc, eq, inArray, max } from 'drizzle-orm';
import { z } from 'zod';
import { parse_bakers } from '#lib/server/bakers.ts';
import { db } from '#lib/server/db/index.ts';
import {
	contestant,
	game,
	player,
	response,
	response_contestant,
	round,
	round_contestant
} from '#lib/server/db/schema.ts';
import { round_answers, score_breakdown, score_game, type RoundRole } from '#lib/scoring.ts';
import {
	eliminated_contestants,
	missing_survey_answers,
	survey_status,
	type SurveyRole,
	type SurveySelection
} from '#lib/server/surveys.ts';

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

function require_round(id: string) {
	const row = db.select().from(round).where(eq(round.id, id)).get();
	if (!row) error(404, 'Round not found');
	require_game(row.game_id);
	return row;
}

function eligible_contestants(game_id: string, round_number: number) {
	const rounds = db
		.select({ id: round.id, number: round.number })
		.from(round)
		.where(eq(round.game_id, game_id))
		.all();

	const round_ids = rounds.map((r) => r.id);

	const answers = round_ids.length
		? db.select().from(round_contestant).where(inArray(round_contestant.round_id, round_ids)).all()
		: [];

	const eliminated = eliminated_contestants(rounds, answers, round_number);

	return db
		.select()
		.from(contestant)
		.where(eq(contestant.game_id, game_id))
		.orderBy(asc(contestant.name))
		.all()
		.filter((c) => !eliminated.has(c.id));
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

	const players = db
		.select()
		.from(player)
		.where(eq(player.game_id, id))
		.orderBy(asc(player.name))
		.all();

	const rounds = db
		.select()
		.from(round)
		.where(eq(round.game_id, id))
		.orderBy(asc(round.number))
		.all();

	const responses = rounds.length
		? db
				.select()
				.from(response)
				.where(
					inArray(
						response.round_id,
						rounds.map((r) => r.id)
					)
				)
				.all()
		: [];

	const selections = responses.length
		? db
				.select()
				.from(response_contestant)
				.where(
					inArray(
						response_contestant.response_id,
						responses.map((r) => r.id)
					)
				)
				.all()
		: [];

	return {
		...row,
		players,
		contestants: db
			.select()
			.from(contestant)
			.where(eq(contestant.game_id, id))
			.orderBy(asc(contestant.name))
			.all(),
		rounds: rounds.map((r) => ({
			...r,
			surveys: players.map((p) => {
				const match = responses.find((x) => x.round_id === r.id && x.player_id === p.id);
				return {
					player_id: p.id,
					token: match?.id ?? null,
					player_name: p.name,
					status: match
						? survey_status(
								r,
								selections.filter((s) => s.response_id === match.id)
							)
						: ('no' as const)
				};
			})
		}))
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

const round_fields = {
	name: z.string().trim().min(1, 'Enter a round name'),
	bonus_question: z
		.string()
		.trim()
		.transform((v) => v || null),
	allow_finale_prediction: z.boolean().default(false),
	is_finale: z.boolean().default(false),
	expected_number_sent_home: z.number().int().min(1).default(1),
	response_deadline: z
		.string()
		.trim()
		.transform((v) => (v ? new Date(`${v}Z`) : null))
		.refine((v) => v === null || !Number.isNaN(v.getTime()), 'Enter a valid deadline')
};

function round_values(fields: {
	name: string;
	bonus_question: string | null;
	allow_finale_prediction: boolean;
	is_finale: boolean;
	expected_number_sent_home: number;
	response_deadline: Date | null;
}) {
	return {
		name: fields.name,
		bonus_question: fields.bonus_question,
		allow_finale_prediction: fields.allow_finale_prediction,
		is_finale: fields.is_finale,
		expected_number_sent_home: fields.is_finale ? null : fields.expected_number_sent_home,
		response_deadline: fields.response_deadline
	};
}

export const add_round = form(
	z.object({ game_id: z.string(), ...round_fields }),
	({ game_id, ...fields }) => {
		require_game(game_id);

		const number =
			(db
				.select({ number: max(round.number) })
				.from(round)
				.where(eq(round.game_id, game_id))
				.get()?.number ?? 0) + 1;

		db.insert(round)
			.values({ game_id, number, ...round_values(fields) })
			.run();
	}
);

export const update_round = form(
	z.object({ id: z.string(), ...round_fields }),
	({ id, ...fields }) => {
		require_round(id);
		db.update(round).set(round_values(fields)).where(eq(round.id, id)).run();
	}
);

export const delete_round = form(z.object({ id: z.string() }), ({ id }) => {
	require_round(id);
	db.delete(round).where(eq(round.id, id)).run();
});

export const release_surveys = form(z.object({ round_id: z.string() }), ({ round_id }) => {
	const row = require_round(round_id);

	const players = db
		.select({ id: player.id })
		.from(player)
		.where(eq(player.game_id, row.game_id))
		.all();

	const existing = new Set(
		db
			.select({ player_id: response.player_id })
			.from(response)
			.where(eq(response.round_id, round_id))
			.all()
			.map((r) => r.player_id)
	);

	const rows = players
		.filter((p) => !existing.has(p.id))
		.map((p) => ({ round_id, player_id: p.id }));

	if (rows.length > 0) db.insert(response).values(rows).run();

	return { released: rows.length };
});

function find_survey(token: string) {
	const row = db
		.select({ response, round, player, game })
		.from(response)
		.innerJoin(round, eq(round.id, response.round_id))
		.innerJoin(player, eq(player.id, response.player_id))
		.innerJoin(game, eq(game.id, round.game_id))
		.where(eq(response.id, token))
		.get();

	if (!row) error(404, 'Survey not found');
	return row;
}

function deadline_passed(deadline: Date | null) {
	return deadline !== null && Date.now() > deadline.getTime();
}

function survey_answers(response_id: string) {
	const rows = db
		.select()
		.from(response_contestant)
		.where(eq(response_contestant.response_id, response_id))
		.all();

	const ids = (role: string) => rows.filter((r) => r.role === role).map((r) => r.contestant_id);

	return {
		star_baker: ids('star_baker')[0] ?? null,
		sent_home: ids('sent_home'),
		technical_challenge_first: ids('technical_challenge_first')[0] ?? null,
		winner: ids('winner')[0] ?? null,
		finalists: ids('finalist'),
		bonus_question_answers: ids('bonus_question_answer')
	};
}

function round_scored(round_id: string) {
	return (
		db
			.select({ id: round_contestant.contestant_id })
			.from(round_contestant)
			.where(eq(round_contestant.round_id, round_id))
			.limit(1)
			.get() !== undefined
	);
}

export const get_survey = query(z.string(), (token) => {
	const { response: row, round: round_row, player, game: game_row } = find_survey(token);
	const user = getRequestEvent().locals.user;
	const closed = deadline_passed(round_row.response_deadline);
	const scored = round_scored(round_row.id);

	return {
		player_name: player.name,
		round: {
			name: round_row.name,
			number: round_row.number,
			bonus_question: round_row.bonus_question,
			allow_finale_prediction: round_row.allow_finale_prediction,
			is_finale: round_row.is_finale,
			expected_number_sent_home: round_row.expected_number_sent_home,
			response_deadline: round_row.response_deadline
		},
		contestants: eligible_contestants(game_row.id, round_row.number).map((c) => ({
			id: c.id,
			name: c.name
		})),
		answers: survey_answers(row.id),
		deadline_passed: closed,
		scored,
		can_edit: user?.id === game_row.created_by_id || (!closed && !scored)
	};
});

export const get_survey_results = query(z.string(), (token) => {
	const { player: player_row, round: round_row, game: game_row } = find_survey(token);

	const players = db
		.select()
		.from(player)
		.where(eq(player.game_id, game_row.id))
		.orderBy(asc(player.name))
		.all();

	const rounds = db
		.select({
			id: round.id,
			number: round.number,
			name: round.name,
			is_finale: round.is_finale,
			allow_finale_prediction: round.allow_finale_prediction
		})
		.from(round)
		.where(eq(round.game_id, game_row.id))
		.orderBy(asc(round.number))
		.all();

	const round_ids = rounds.map((r) => r.id);

	const answers = round_ids.length
		? db.select().from(round_contestant).where(inArray(round_contestant.round_id, round_ids)).all()
		: [];

	const responses = round_ids.length
		? db.select().from(response).where(inArray(response.round_id, round_ids)).all()
		: [];

	const response_ids = responses.map((r) => r.id);

	const predictions = response_ids.length
		? db
				.select()
				.from(response_contestant)
				.where(inArray(response_contestant.response_id, response_ids))
				.all()
		: [];

	const scores = score_game(
		rounds,
		players.map((p) => p.id),
		answers,
		responses,
		predictions
	)
		.map((score) => ({
			...score,
			player_name: players.find((p) => p.id === score.player_id)?.name ?? ''
		}))
		.sort((a, b) => b.total - a.total);

	return {
		player_id: player_row.id,
		player_name: player_row.name,
		round: { id: round_row.id, number: round_row.number, name: round_row.name },
		rounds,
		contestants: db
			.select({ id: contestant.id, name: contestant.name })
			.from(contestant)
			.where(eq(contestant.game_id, game_row.id))
			.orderBy(asc(contestant.name))
			.all(),
		scored: round_scored(round_row.id),
		breakdown: score_breakdown(rounds, player_row.id, answers, responses, predictions).find(
			(r) => r.round_id === round_row.id
		),
		scores
	};
});

const survey_fields = z.object({
	token: z.string(),
	star_baker: z.string().optional(),
	sent_home: z.array(z.string()).default([]),
	sent_home_single: z.string().optional(),
	technical_challenge_first: z.string().optional(),
	winner: z.string().optional(),
	finalists: z.array(z.string()).default([]),
	bonus_question_answer: z.string().optional()
});

const missing_messages: Record<string, string> = {
	star_baker: 'Select a star baker',
	sent_home: 'Select the right number of bakers to send home',
	technical_challenge_first: 'Select who came first in the technical challenge',
	winner: 'Select a winner',
	finalist: 'Select 2 finalists'
};

export const save_survey = form(survey_fields, (data) => {
	const { response: row, round: round_row, game: game_row } = find_survey(data.token);
	const user = getRequestEvent().locals.user;

	if (
		user?.id !== game_row.created_by_id &&
		(deadline_passed(round_row.response_deadline) || round_scored(round_row.id))
	) {
		error(403, 'This survey has closed');
	}

	const valid_ids = new Set(eligible_contestants(game_row.id, round_row.number).map((c) => c.id));

	const selections: SurveySelection[] = [];
	const add = (role: SurveyRole, contestant_id: string | undefined) => {
		if (!contestant_id) return;
		if (!valid_ids.has(contestant_id)) invalid('Invalid contestant selection');
		selections.push({ role, contestant_id });
	};

	if (!round_row.is_finale) {
		add('star_baker', data.star_baker);
		const sent_home = data.sent_home_single ? [data.sent_home_single] : data.sent_home;
		for (const id of sent_home) add('sent_home', id);
	}

	add('technical_challenge_first', data.technical_challenge_first);

	if (round_row.allow_finale_prediction) {
		add('winner', data.winner);
		for (const id of data.finalists) add('finalist', id);
	}

	if (round_row.bonus_question) {
		add('bonus_question_answer', data.bonus_question_answer);
	}

	const missing = missing_survey_answers(round_row, selections);
	if (missing.length > 0) invalid(...missing.map((role) => missing_messages[role]));

	if (round_row.allow_finale_prediction && data.winner && data.finalists.includes(data.winner)) {
		invalid('The winner cannot also be one of the finalists');
	}

	db.transaction((tx) => {
		tx.delete(response_contestant).where(eq(response_contestant.response_id, row.id)).run();
		if (selections.length > 0) {
			tx.insert(response_contestant)
				.values(selections.map((s) => ({ response_id: row.id, ...s })))
				.run();
		}
	});

	return { saved: true };
});

export const get_round_scoring = query(
	z.object({ game_id: z.string(), round_id: z.string() }),
	({ game_id, round_id }) => {
		require_game(game_id);

		const round_row = db
			.select()
			.from(round)
			.where(and(eq(round.id, round_id), eq(round.game_id, game_id)))
			.get();
		if (!round_row) error(404, 'Round not found');

		const players = db
			.select()
			.from(player)
			.where(eq(player.game_id, game_id))
			.orderBy(asc(player.name))
			.all();

		const rounds = db
			.select({
				id: round.id,
				number: round.number,
				is_finale: round.is_finale,
				allow_finale_prediction: round.allow_finale_prediction
			})
			.from(round)
			.where(eq(round.game_id, game_id))
			.orderBy(asc(round.number))
			.all();

		const round_ids = rounds.map((r) => r.id);

		const answers = round_ids.length
			? db
					.select()
					.from(round_contestant)
					.where(inArray(round_contestant.round_id, round_ids))
					.all()
			: [];

		const responses = round_ids.length
			? db.select().from(response).where(inArray(response.round_id, round_ids)).all()
			: [];

		const response_ids = responses.map((r) => r.id);

		const predictions = response_ids.length
			? db
					.select()
					.from(response_contestant)
					.where(inArray(response_contestant.response_id, response_ids))
					.all()
			: [];

		const saved = answers.filter((a) => a.round_id === round_id);
		const pick = (role: RoundRole) => saved.find((a) => a.role === role)?.contestant_id;
		const picks = (role: RoundRole) =>
			saved.filter((a) => a.role === role).map((a) => a.contestant_id);

		return {
			round: round_row,
			players,
			contestants: eligible_contestants(game_id, round_row.number),
			rounds,
			answers,
			responses,
			predictions,
			saved: {
				star_baker: pick('star_baker'),
				star_baker_discussed: picks('star_baker_discussed'),
				sent_home: picks('sent_home'),
				sent_home_discussed: picks('sent_home_discussed'),
				technical_challenge_first: pick('technical_challenge_first'),
				technical_challenge_second: pick('technical_challenge_second'),
				technical_challenge_third: pick('technical_challenge_third'),
				technical_challenge_last: pick('technical_challenge_last'),
				bonus_question_answers: picks('bonus_question_answer'),
				winner: pick('winner'),
				finalist: picks('finalist')
			}
		};
	}
);

const answer_fields = z.object({
	round_id: z.string(),
	star_baker: z.string().optional(),
	star_baker_discussed: z.array(z.string()).default([]),
	sent_home: z.array(z.string()).default([]),
	sent_home_discussed: z.array(z.string()).default([]),
	technical_challenge_first: z.string().optional(),
	technical_challenge_second: z.string().optional(),
	technical_challenge_third: z.string().optional(),
	technical_challenge_last: z.string().optional(),
	bonus_question_answers: z.array(z.string()).default([]),
	winner: z.string().optional(),
	finalist: z.array(z.string()).default([])
});

export const save_round_answers = form(answer_fields, (data) => {
	const round_row = require_round(data.round_id);

	const valid_ids = new Set(
		eligible_contestants(round_row.game_id, round_row.number).map((c) => c.id)
	);

	const rows = round_answers(round_row, data);

	for (const row of rows) {
		if (!valid_ids.has(row.contestant_id)) invalid('Invalid contestant selection');
	}

	db.transaction((tx) => {
		tx.delete(round_contestant).where(eq(round_contestant.round_id, round_row.id)).run();
		if (rows.length > 0) {
			tx.insert(round_contestant).values(rows).run();
		}
	});

	return { saved: true };
});
