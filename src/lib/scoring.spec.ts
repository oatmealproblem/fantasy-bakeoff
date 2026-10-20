import { expect, test } from 'vitest';
import {
	round_answers,
	score_breakdown,
	score_game,
	type ScoringAnswer,
	type ScoringRound
} from './scoring.ts';

const weekly = (id: string, number: number): ScoringRound => ({
	id,
	number,
	is_finale: false,
	allow_finale_prediction: false
});

const prediction_round = (id: string, number: number): ScoringRound => ({
	id,
	number,
	is_finale: false,
	allow_finale_prediction: true
});

const finale = (id: string, number: number): ScoringRound => ({
	id,
	number,
	is_finale: true,
	allow_finale_prediction: false
});

test('scores correct star baker and sent home', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1'],
		[
			{ round_id: 'r1', role: 'star_baker', contestant_id: 'a' },
			{ round_id: 'r1', role: 'sent_home', contestant_id: 'b' }
		],
		[{ id: 'resp1', player_id: 'p1', round_id: 'r1' }],
		[
			{ response_id: 'resp1', role: 'star_baker', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'sent_home', contestant_id: 'b' }
		]
	);
	expect(scores[0].total).toBe(6);
});

test('penalises star baker guessed as sent home and vice versa', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1'],
		[
			{ round_id: 'r1', role: 'star_baker', contestant_id: 'a' },
			{ round_id: 'r1', role: 'sent_home', contestant_id: 'b' }
		],
		[{ id: 'resp1', player_id: 'p1', round_id: 'r1' }],
		[
			{ response_id: 'resp1', role: 'star_baker', contestant_id: 'b' },
			{ response_id: 'resp1', role: 'sent_home', contestant_id: 'a' }
		]
	);
	expect(scores[0].total).toBe(-2);
});

test('scores discussed bakers for guesses', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1'],
		[
			{ round_id: 'r1', role: 'star_baker_discussed', contestant_id: 'a' },
			{ round_id: 'r1', role: 'sent_home_discussed', contestant_id: 'b' }
		],
		[{ id: 'resp1', player_id: 'p1', round_id: 'r1' }],
		[
			{ response_id: 'resp1', role: 'star_baker', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'sent_home', contestant_id: 'b' }
		]
	);
	expect(scores[0].total).toBe(2);
});

test('does not stack discussed points on the actual role for the same contestant', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1', 'p2'],
		[
			{ round_id: 'r1', role: 'star_baker', contestant_id: 'a' },
			{ round_id: 'r1', role: 'star_baker_discussed', contestant_id: 'a' },
			{ round_id: 'r1', role: 'sent_home', contestant_id: 'b' },
			{ round_id: 'r1', role: 'sent_home_discussed', contestant_id: 'b' },
			{ round_id: 'r1', role: 'star_baker_discussed', contestant_id: 'c' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p2', round_id: 'r1' }
		],
		[
			{ response_id: 'resp1', role: 'star_baker', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'sent_home', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'star_baker', contestant_id: 'c' }
		]
	);
	expect(scores[0].total).toBe(6);
	expect(scores[1].total).toBe(1);
});

test('scores technical challenge placements against the predicted first', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1', 'p2', 'p3'],
		[
			{ round_id: 'r1', role: 'technical_challenge_first', contestant_id: 'a' },
			{ round_id: 'r1', role: 'technical_challenge_second', contestant_id: 'b' },
			{ round_id: 'r1', role: 'technical_challenge_third', contestant_id: 'c' },
			{ round_id: 'r1', role: 'technical_challenge_last', contestant_id: 'd' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p2', round_id: 'r1' },
			{ id: 'resp3', player_id: 'p3', round_id: 'r1' }
		],
		[
			{ response_id: 'resp1', role: 'technical_challenge_first', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'technical_challenge_first', contestant_id: 'd' },
			{ response_id: 'resp3', role: 'technical_challenge_first', contestant_id: 'a' }
		]
	);
	expect(scores.map((s) => s.total)).toEqual([1, -1, 2]);
});

test('scores every correct bonus question answer', () => {
	const scores = score_game(
		[weekly('r1', 1)],
		['p1'],
		[
			{ round_id: 'r1', role: 'bonus_question_answer', contestant_id: 'a' },
			{ round_id: 'r1', role: 'bonus_question_answer', contestant_id: 'b' }
		],
		[{ id: 'resp1', player_id: 'p1', round_id: 'r1' }],
		[{ response_id: 'resp1', role: 'bonus_question_answer', contestant_id: 'a' }]
	);
	expect(scores[0].total).toBe(2);
});

test('scores an unchanged correct finale prediction at 5 total', () => {
	const scores = score_game(
		[prediction_round('r1', 1), finale('r2', 2)],
		['p1'],
		[
			{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'b' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'c' },
			{ round_id: 'r2', role: 'technical_challenge_first', contestant_id: 't' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p1', round_id: 'r2' }
		],
		[
			{ response_id: 'resp1', role: 'winner', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'c' },
			{ response_id: 'resp2', role: 'technical_challenge_first', contestant_id: 't' }
		]
	);
	expect(scores[0].total).toBe(13);
});

test('scores a changed but correct finale prediction at 3', () => {
	const scores = score_game(
		[prediction_round('r1', 1), { ...prediction_round('r2', 2), is_finale: true }],
		['p1'],
		[
			{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'b' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'c' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p1', round_id: 'r2' }
		],
		[
			{ response_id: 'resp1', role: 'winner', contestant_id: 'x' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'c' },
			{ response_id: 'resp2', role: 'winner', contestant_id: 'a' },
			{ response_id: 'resp2', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'finalist', contestant_id: 'c' }
		]
	);
	expect(scores[0].total).toBe(9);
});

test('scores the winner as a finalist when it was only picked as one', () => {
	const scores = score_game(
		[prediction_round('r1', 1), finale('r2', 2)],
		['p1'],
		[
			{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'b' }
		],
		[{ id: 'resp1', player_id: 'p1', round_id: 'r1' }],
		[
			{ response_id: 'resp1', role: 'winner', contestant_id: 'x' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'b' }
		]
	);
	expect(scores[0].total).toBe(6);
});

test('ignores a winner prediction that was changed away', () => {
	const scores = score_game(
		[prediction_round('r1', 1), { ...prediction_round('r2', 2), is_finale: true }],
		['p1'],
		[
			{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'b' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p1', round_id: 'r2' }
		],
		[
			{ response_id: 'resp1', role: 'winner', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'winner', contestant_id: 'x' },
			{ response_id: 'resp2', role: 'finalist', contestant_id: 'b' }
		]
	);
	expect(scores[0].total).toBe(3);
});

test('does not score a finalist dropped from the latest prediction', () => {
	const scores = score_game(
		[prediction_round('r1', 1), { ...prediction_round('r2', 2), is_finale: true }],
		['p1'],
		[
			{ round_id: 'r2', role: 'winner', contestant_id: 'w' },
			{ round_id: 'r2', role: 'finalist', contestant_id: 'a' }
		],
		[
			{ id: 'resp1', player_id: 'p1', round_id: 'r1' },
			{ id: 'resp2', player_id: 'p1', round_id: 'r2' }
		],
		[
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'a' },
			{ response_id: 'resp1', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'finalist', contestant_id: 'b' },
			{ response_id: 'resp2', role: 'finalist', contestant_id: 'c' }
		]
	);
	expect(scores[0].total).toBe(0);
});

test('breaks down where points came from', () => {
	const rounds = [weekly('r1', 1), finale('r2', 2)];
	const answers: ScoringAnswer[] = [
		{ round_id: 'r1', role: 'star_baker', contestant_id: 'a' },
		{ round_id: 'r1', role: 'sent_home', contestant_id: 'b' },
		{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
		{ round_id: 'r2', role: 'finalist', contestant_id: 'b' }
	];
	const responses = [{ id: 'resp1', player_id: 'p1', round_id: 'r1' }];
	const predictions = [
		{ response_id: 'resp1', role: 'sent_home', contestant_id: 'a' },
		{ response_id: 'resp1', role: 'star_baker', contestant_id: 'b' }
	];

	expect(score_breakdown(rounds, 'p1', answers, responses, predictions)).toEqual([
		{
			round_id: 'r1',
			items: [
				{ kind: 'star_baker_as_sent_home', contestant_id: 'a', points: -1 },
				{ kind: 'sent_home_as_star_baker', contestant_id: 'b', points: -1 }
			],
			total: -2
		},
		{ round_id: 'r2', items: [], total: 0 }
	]);
});

test('round_answers collects weekly roles including multiple bonus answers', () => {
	const answers = round_answers(
		{ id: 'r1', is_finale: false, bonus_question: 'Who cries?' },
		{
			star_baker: 'a',
			star_baker_discussed: ['b'],
			sent_home: ['c', 'd'],
			sent_home_discussed: ['e'],
			technical_challenge_first: 'f',
			technical_challenge_second: 'g',
			technical_challenge_third: 'h',
			technical_challenge_last: 'i',
			bonus_question_answers: ['j', 'k'],
			winner: 'ignored',
			finalist: ['ignored']
		}
	);
	expect(answers).toEqual([
		{ round_id: 'r1', role: 'star_baker', contestant_id: 'a' },
		{ round_id: 'r1', role: 'star_baker_discussed', contestant_id: 'b' },
		{ round_id: 'r1', role: 'sent_home', contestant_id: 'c' },
		{ round_id: 'r1', role: 'sent_home', contestant_id: 'd' },
		{ round_id: 'r1', role: 'sent_home_discussed', contestant_id: 'e' },
		{ round_id: 'r1', role: 'technical_challenge_first', contestant_id: 'f' },
		{ round_id: 'r1', role: 'technical_challenge_second', contestant_id: 'g' },
		{ round_id: 'r1', role: 'technical_challenge_third', contestant_id: 'h' },
		{ round_id: 'r1', role: 'technical_challenge_last', contestant_id: 'i' },
		{ round_id: 'r1', role: 'bonus_question_answer', contestant_id: 'j' },
		{ round_id: 'r1', role: 'bonus_question_answer', contestant_id: 'k' }
	]);
});

test('round_answers skips weekly roles on finale and allows no bonus answers', () => {
	const answers = round_answers(
		{ id: 'r2', is_finale: true, bonus_question: 'Who cries?' },
		{
			star_baker: 'ignored',
			sent_home: ['ignored'],
			technical_challenge_first: 'f',
			bonus_question_answers: [],
			winner: 'a',
			finalist: ['b', 'c']
		}
	);
	expect(answers).toEqual([
		{ round_id: 'r2', role: 'technical_challenge_first', contestant_id: 'f' },
		{ round_id: 'r2', role: 'winner', contestant_id: 'a' },
		{ round_id: 'r2', role: 'finalist', contestant_id: 'b' },
		{ round_id: 'r2', role: 'finalist', contestant_id: 'c' }
	]);
});
