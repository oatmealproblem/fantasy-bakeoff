import { expect, test } from 'vitest';
import { parse_recent_surveys } from './recent_surveys.ts';

test('recent surveys parse only a list of tokens', () => {
	expect(parse_recent_surveys(undefined)).toEqual([]);
	expect(parse_recent_surveys('not json')).toEqual([]);
	expect(parse_recent_surveys('{"token":"a"}')).toEqual([]);
	expect(parse_recent_surveys('["a",2,null,"b"]')).toEqual([]);
	expect(parse_recent_surveys('["a","b","c","d","e","f"]')).toEqual(['a', 'b', 'c', 'd', 'e']);
});
