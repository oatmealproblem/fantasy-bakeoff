import { expect, test } from 'vitest';
import { html } from './html.ts';

test('keeps literal markup intact', () => {
	expect(html`<a href="${'https://x.test/?a=1&b=2'}">link</a>`).toBe(
		'<a href="https://x.test/?a=1&amp;b=2">link</a>'
	);
});

test('escapes interpolated values', () => {
	expect(html`${'<script>alert("x")</script> & \'quotes\''}`).toBe(
		'&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quotes&#39;'
	);
});

test('handles adjacent and numeric values', () => {
	expect(html`${'a'}${1}${'b'}`).toBe('a1b');
});
