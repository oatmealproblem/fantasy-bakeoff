import { expect, test } from 'vitest';
import { parse_bakers } from './bakers.ts';

const html = `
<article class="featured-block">
	<a href="https://thegreatbritishbakeoff.co.uk/bakers/alvin/" title="Alvin">
		<div class="image-container">
			<img width="450" height="450" src="https://thegreatbritishbakeoff.co.uk/wp-content/uploads/2015/07/s6_1_450-450x450.jpg" alt="Alvin" />
		</div>
		<div class="details"><h3>Alvin</h3></div>
	</a>
</article>
<article class="featured-block">
	<a href="https://thegreatbritishbakeoff.co.uk/bakers/nadiya/" title="Nadiya">
		<div class="image-container">
			<img width="450" height="450" src="https://thegreatbritishbakeoff.co.uk/wp-content/uploads/2015/07/s6_12_450-450x450.jpg" alt="Nadiya" />
		</div>
		<div class="details"><h3>Nadiya</h3></div>
	</a>
</article>
<article class="featured-block">
	<a href="https://thegreatbritishbakeoff.co.uk/bakers/broken/" title="Broken">
		<div class="details"><h3>Broken</h3></div>
	</a>
</article>
`;

test('parses bakers from a series page', () => {
	expect(parse_bakers(html)).toEqual([
		{
			name: 'Alvin',
			picture_url:
				'https://thegreatbritishbakeoff.co.uk/wp-content/uploads/2015/07/s6_1_450-450x450.jpg'
		},
		{
			name: 'Nadiya',
			picture_url:
				'https://thegreatbritishbakeoff.co.uk/wp-content/uploads/2015/07/s6_12_450-450x450.jpg'
		}
	]);
});

test('returns nothing for pages without bakers', () => {
	expect(parse_bakers('<html><body><p>nope</p></body></html>')).toEqual([]);
});
