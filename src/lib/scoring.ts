export type RoundRole =
	| 'star_baker'
	| 'star_baker_discussed'
	| 'sent_home'
	| 'sent_home_discussed'
	| 'technical_challenge_first'
	| 'technical_challenge_second'
	| 'technical_challenge_third'
	| 'technical_challenge_last'
	| 'bonus_question_answer'
	| 'winner'
	| 'finalist';

export type ScoringRound = {
	id: string;
	number: number;
	is_finale: boolean;
	allow_finale_prediction: boolean;
};

export type ScoringAnswer = { round_id: string; role: RoundRole; contestant_id: string };
export type ScoringResponse = { id: string; player_id: string; round_id: string };
export type ScoringPrediction = { response_id: string; role: string; contestant_id: string };

export type PlayerScore = {
	player_id: string;
	total: number;
	by_round: Record<string, number>;
};

export type ScoreItem = {
	kind: string;
	points: number;
	contestant_id: string;
};

export type RoundBreakdown = {
	round_id: string;
	items: ScoreItem[];
	total: number;
};

export type RoundAnswerFields = {
	star_baker?: string;
	star_baker_discussed?: string[];
	sent_home?: string[];
	sent_home_discussed?: string[];
	technical_challenge_first?: string;
	technical_challenge_second?: string;
	technical_challenge_third?: string;
	technical_challenge_last?: string;
	bonus_question_answers?: string[];
	winner?: string;
	finalist?: string[];
};

export function round_answers(
	round: { id: string; is_finale: boolean; bonus_question: string | null },
	fields: RoundAnswerFields
): ScoringAnswer[] {
	const answers: ScoringAnswer[] = [];
	const add = (role: RoundRole, contestant_id: string | undefined) => {
		if (contestant_id) answers.push({ round_id: round.id, role, contestant_id });
	};

	if (!round.is_finale) {
		add('star_baker', fields.star_baker);
		for (const id of fields.star_baker_discussed ?? []) add('star_baker_discussed', id);
		for (const id of fields.sent_home ?? []) add('sent_home', id);
		for (const id of fields.sent_home_discussed ?? []) add('sent_home_discussed', id);
	}

	add('technical_challenge_first', fields.technical_challenge_first);
	add('technical_challenge_second', fields.technical_challenge_second);
	add('technical_challenge_third', fields.technical_challenge_third);
	add('technical_challenge_last', fields.technical_challenge_last);

	if (round.bonus_question) {
		for (const id of fields.bonus_question_answers ?? []) add('bonus_question_answer', id);
	}

	if (round.is_finale) {
		add('winner', fields.winner);
		for (const id of fields.finalist ?? []) add('finalist', id);
	}

	return answers;
}

const sum = (items: ScoreItem[]) => items.reduce((total, item) => total + item.points, 0);

export function score_game(
	rounds: ScoringRound[],
	player_ids: string[],
	answers: ScoringAnswer[],
	responses: ScoringResponse[],
	predictions: ScoringPrediction[]
): PlayerScore[] {
	return player_ids.map((player_id) => {
		const by_round: Record<string, number> = {};
		let total = 0;

		for (const round of score_breakdown(rounds, player_id, answers, responses, predictions)) {
			by_round[round.round_id] = round.total;
			total += round.total;
		}

		return { player_id, total, by_round };
	});
}

export function score_breakdown(
	rounds: ScoringRound[],
	player_id: string,
	answers: ScoringAnswer[],
	responses: ScoringResponse[],
	predictions: ScoringPrediction[]
): RoundBreakdown[] {
	const predictions_by_response = new Map<string, ScoringPrediction[]>();
	for (const prediction of predictions) {
		const list = predictions_by_response.get(prediction.response_id) ?? [];
		list.push(prediction);
		predictions_by_response.set(prediction.response_id, list);
	}

	const sorted_rounds = [...rounds].sort((a, b) => a.number - b.number);
	const prediction_rounds = sorted_rounds.filter((r) => r.allow_finale_prediction);

	return sorted_rounds.map((round) => {
		const round_answers = answers.filter((a) => a.round_id === round.id);
		const response = responses.find((r) => r.round_id === round.id && r.player_id === player_id);
		const preds = response ? (predictions_by_response.get(response.id) ?? []) : [];
		const items = round.is_finale
			? score_technical(round_answers, preds)
			: score_weekly(round_answers, preds);

		if (round.is_finale) {
			const actual_winner = round_answers.find((a) => a.role === 'winner')?.contestant_id;
			const actual_finalists = round_answers
				.filter((a) => a.role === 'finalist')
				.map((a) => a.contestant_id);

			const player_predictions = prediction_rounds.flatMap((r) => {
				const prediction_response = responses.find(
					(x) => x.round_id === r.id && x.player_id === player_id
				);
				if (!prediction_response) return [];
				const prediction_preds = predictions_by_response.get(prediction_response.id) ?? [];
				const winner = prediction_preds.find((p) => p.role === 'winner')?.contestant_id ?? null;
				const finalists = prediction_preds
					.filter((p) => p.role === 'finalist')
					.map((p) => p.contestant_id);
				if (!winner && finalists.length === 0) return [];
				return [{ winner, finalists }];
			});

			items.push(...score_finale_prediction(actual_winner, actual_finalists, player_predictions));
		}

		return { round_id: round.id, items, total: sum(items) };
	});
}

type Prediction = { winner: string | null; finalists: string[] };

function picks(prediction: Prediction) {
	return new Set([...(prediction.winner ? [prediction.winner] : []), ...prediction.finalists]);
}

function score_finale_prediction(
	actual_winner: string | undefined,
	actual_finalists: string[],
	predictions: Prediction[]
): ScoreItem[] {
	if (predictions.length === 0) return [];

	const original = predictions[0];
	const latest = predictions[predictions.length - 1];
	const items: ScoreItem[] = [];

	const actual = new Set([...(actual_winner ? [actual_winner] : []), ...actual_finalists]);
	const original_picks = picks(original);
	const latest_picks = picks(latest);

	for (const finalist of actual) {
		if (!latest_picks.has(finalist)) continue;

		const winner_correct =
			actual_winner !== undefined && finalist === actual_winner && latest.winner === actual_winner;

		if (winner_correct) {
			items.push({
				kind: 'winner',
				contestant_id: finalist,
				points: predictions.every((p) => p.winner === actual_winner) ? 5 : 3
			});
		} else if (original_picks.has(finalist)) {
			items.push({ kind: 'finalist', contestant_id: finalist, points: 3 });
		} else if (latest_picks.has(finalist)) {
			items.push({ kind: 'finalist', contestant_id: finalist, points: 1 });
		}
	}

	return items;
}

function score_weekly(answers: ScoringAnswer[], preds: ScoringPrediction[]): ScoreItem[] {
	const items: ScoreItem[] = [];
	const star_baker = preds.filter((p) => p.role === 'star_baker').map((p) => p.contestant_id);
	const sent_home = preds.filter((p) => p.role === 'sent_home').map((p) => p.contestant_id);
	const actual_star_baker = answers
		.filter((a) => a.role === 'star_baker')
		.map((a) => a.contestant_id);
	const actual_sent_home = answers
		.filter((a) => a.role === 'sent_home')
		.map((a) => a.contestant_id);

	for (const answer of answers) {
		switch (answer.role) {
			case 'star_baker':
				if (star_baker.includes(answer.contestant_id)) {
					items.push({ kind: 'star_baker', contestant_id: answer.contestant_id, points: 3 });
				}
				if (sent_home.includes(answer.contestant_id)) {
					items.push({
						kind: 'star_baker_as_sent_home',
						contestant_id: answer.contestant_id,
						points: -1
					});
				}
				break;
			case 'star_baker_discussed':
				if (
					!actual_star_baker.includes(answer.contestant_id) &&
					star_baker.includes(answer.contestant_id)
				) {
					items.push({
						kind: 'star_baker_discussed',
						contestant_id: answer.contestant_id,
						points: 1
					});
				}
				break;
			case 'sent_home':
				if (sent_home.includes(answer.contestant_id)) {
					items.push({ kind: 'sent_home', contestant_id: answer.contestant_id, points: 3 });
				}
				if (star_baker.includes(answer.contestant_id)) {
					items.push({
						kind: 'sent_home_as_star_baker',
						contestant_id: answer.contestant_id,
						points: -1
					});
				}
				break;
			case 'sent_home_discussed':
				if (
					!actual_sent_home.includes(answer.contestant_id) &&
					sent_home.includes(answer.contestant_id)
				) {
					items.push({
						kind: 'sent_home_discussed',
						contestant_id: answer.contestant_id,
						points: 1
					});
				}
				break;
		}
	}

	return [...items, ...score_technical(answers, preds)];
}

function score_technical(answers: ScoringAnswer[], preds: ScoringPrediction[]): ScoreItem[] {
	const items: ScoreItem[] = [];
	const first = preds
		.filter((p) => p.role === 'technical_challenge_first')
		.map((p) => p.contestant_id);
	const bonus = preds.filter((p) => p.role === 'bonus_question_answer').map((p) => p.contestant_id);

	for (const answer of answers) {
		switch (answer.role) {
			case 'technical_challenge_first':
				if (first.includes(answer.contestant_id)) {
					items.push({
						kind: 'technical_challenge_first',
						contestant_id: answer.contestant_id,
						points: 2
					});
				}
				break;
			case 'technical_challenge_second':
			case 'technical_challenge_third':
				if (first.includes(answer.contestant_id)) {
					items.push({
						kind: answer.role,
						contestant_id: answer.contestant_id,
						points: 1
					});
				}
				break;
			case 'technical_challenge_last':
				if (first.includes(answer.contestant_id)) {
					items.push({
						kind: 'technical_challenge_last',
						contestant_id: answer.contestant_id,
						points: -1
					});
				}
				break;
			case 'bonus_question_answer':
				if (bonus.includes(answer.contestant_id)) {
					items.push({
						kind: 'bonus_question_answer',
						contestant_id: answer.contestant_id,
						points: 2
					});
				}
				break;
		}
	}

	return items;
}
