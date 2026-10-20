import { expect, test } from 'vitest';
import {
	eliminated_contestants,
	latest_prediction,
	missing_survey_answers,
	survey_status,
	type PredictionPick,
	type SurveyRound,
	type SurveyRole
} from './surveys.ts';

const round: SurveyRound = {
	is_finale: false,
	allow_finale_prediction: false,
	expected_number_sent_home: 1
};

const sel = (...roles: SurveyRole[]) => roles.map((role, i) => ({ role, contestant_id: `c${i}` }));

test('no answers is no status', () => {
	expect(survey_status(round, [])).toBe('no');
});

test('some answers is partial', () => {
	expect(survey_status(round, sel('star_baker'))).toBe('partial');
});

test('all required answers is yes', () => {
	expect(survey_status(round, sel('star_baker', 'sent_home', 'technical_challenge_first'))).toBe(
		'yes'
	);
});

test('sent home must match expected count', () => {
	const double = { ...round, expected_number_sent_home: 2 };
	expect(survey_status(double, sel('star_baker', 'sent_home', 'technical_challenge_first'))).toBe(
		'partial'
	);
	expect(
		survey_status(double, sel('star_baker', 'sent_home', 'sent_home', 'technical_challenge_first'))
	).toBe('yes');
});

test('finale skips star baker and sent home', () => {
	const finale = { ...round, is_finale: true };
	expect(survey_status(finale, sel('technical_challenge_first'))).toBe('yes');
	expect(missing_survey_answers(finale, sel('technical_challenge_first'))).toEqual([]);
});

test('finale prediction needs a winner and two finalists', () => {
	const prediction = { ...round, is_finale: true, allow_finale_prediction: true };
	expect(survey_status(prediction, sel('technical_challenge_first', 'winner', 'finalist'))).toBe(
		'partial'
	);
	expect(
		survey_status(prediction, sel('technical_challenge_first', 'winner', 'finalist', 'finalist'))
	).toBe('yes');
});

test('bonus question answers are optional', () => {
	expect(survey_status(round, sel('star_baker', 'sent_home', 'technical_challenge_first'))).toBe(
		'yes'
	);
	expect(
		survey_status(
			round,
			sel('star_baker', 'sent_home', 'technical_challenge_first', 'bonus_question_answer')
		)
	).toBe('yes');
});

test('eliminated contestants are those sent home in earlier rounds', () => {
	const rounds = [
		{ id: 'r1', number: 1 },
		{ id: 'r2', number: 2 },
		{ id: 'r3', number: 3 }
	];
	const answers = [
		{ round_id: 'r1', role: 'sent_home', contestant_id: 'a' },
		{ round_id: 'r1', role: 'sent_home_discussed', contestant_id: 'b' },
		{ round_id: 'r2', role: 'sent_home', contestant_id: 'c' },
		{ round_id: 'r3', role: 'sent_home', contestant_id: 'd' }
	];

	expect([...eliminated_contestants(rounds, answers, 1)]).toEqual([]);
	expect([...eliminated_contestants(rounds, answers, 2)]).toEqual(['a']);
	expect([...eliminated_contestants(rounds, answers, 3)]).toEqual(['a', 'c']);
});

test('latest_prediction uses only the most recent round and returns null without picks', () => {
	const picks: PredictionPick[] = [
		{ round_number: 1, round_name: 'Round 1', role: 'winner', name: 'A' },
		{ round_number: 1, round_name: 'Round 1', role: 'finalist', name: 'B' },
		{ round_number: 2, round_name: 'Round 2', role: 'winner', name: 'C' },
		{ round_number: 2, round_name: 'Round 2', role: 'finalist', name: 'D' },
		{ round_number: 2, round_name: 'Round 2', role: 'finalist', name: 'E' }
	];

	expect(latest_prediction(picks)).toEqual({
		round_name: 'Round 2',
		winner: 'C',
		finalists: ['D', 'E']
	});
	expect(latest_prediction([])).toBeNull();
});
