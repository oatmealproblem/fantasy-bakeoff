export type SurveyRound = {
	is_finale: boolean;
	allow_finale_prediction: boolean;
	expected_number_sent_home: number | null;
};

export type SurveyRole =
	| 'star_baker'
	| 'sent_home'
	| 'technical_challenge_first'
	| 'bonus_question_answer'
	| 'winner'
	| 'finalist';

export type SurveySelection = { role: SurveyRole; contestant_id: string };

export function eliminated_contestants(
	rounds: { id: string; number: number }[],
	answers: { round_id: string; role: string; contestant_id: string }[],
	round_number: number
): Set<string> {
	const earlier = new Set(rounds.filter((r) => r.number < round_number).map((r) => r.id));
	return new Set(
		answers
			.filter((a) => earlier.has(a.round_id) && a.role === 'sent_home')
			.map((a) => a.contestant_id)
	);
}

export function missing_survey_answers(
	round: SurveyRound,
	selections: SurveySelection[]
): SurveyRole[] {
	const count = (role: SurveyRole) => selections.filter((s) => s.role === role).length;
	const missing: SurveyRole[] = [];

	if (!round.is_finale) {
		if (count('star_baker') === 0) missing.push('star_baker');
		if (count('sent_home') !== (round.expected_number_sent_home ?? 1)) missing.push('sent_home');
	}

	if (count('technical_challenge_first') === 0) missing.push('technical_challenge_first');

	if (round.allow_finale_prediction) {
		if (count('winner') === 0) missing.push('winner');
		if (count('finalist') !== 2) missing.push('finalist');
	}

	return missing;
}

export function survey_status(
	round: SurveyRound,
	selections: SurveySelection[]
): 'no' | 'partial' | 'yes' {
	if (selections.length === 0) return 'no';
	return missing_survey_answers(round, selections).length === 0 ? 'yes' : 'partial';
}

export type PredictionPick = {
	round_number: number;
	round_name: string;
	role: string;
	name: string;
};

export function latest_prediction(picks: PredictionPick[]) {
	if (picks.length === 0) return null;

	const round_number = Math.max(...picks.map((p) => p.round_number));
	const latest = picks.filter((p) => p.round_number === round_number);

	return {
		round_name: latest[0].round_name,
		winner: latest.find((p) => p.role === 'winner')?.name ?? null,
		finalists: latest.filter((p) => p.role === 'finalist').map((p) => p.name)
	};
}
