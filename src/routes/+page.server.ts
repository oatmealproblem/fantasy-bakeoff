import type { PageServerLoad } from './$types';
import { eq, inArray } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { game, player, response, round } from '#lib/server/db/schema.ts';
import { parse_recent_surveys, recent_surveys_cookie } from '#lib/server/recent_surveys.ts';

export const load: PageServerLoad = ({ cookies, locals }) => {
	const tokens = parse_recent_surveys(cookies.get(recent_surveys_cookie));
	if (tokens.length === 0) return { recent_surveys: [] };

	const rows = db
		.select({
			token: response.id,
			game_name: game.name,
			round_name: round.name,
			player_name: player.name
		})
		.from(response)
		.innerJoin(round, eq(round.id, response.round_id))
		.innerJoin(player, eq(player.id, response.player_id))
		.innerJoin(game, eq(game.id, round.game_id))
		.where(inArray(response.id, tokens))
		.all();

	return {
		recent_surveys: tokens.flatMap((token) => rows.filter((row) => row.token === token))
	};
};
