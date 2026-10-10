export function parse_bakers(html: string) {
	const bakers: { name: string; picture_url: string }[] = [];

	for (const [, article] of html.matchAll(
		/<article class="featured-block">([\s\S]*?)<\/article>/g
	)) {
		const name = article.match(/<h3>([^<]+)<\/h3>/)?.[1]?.trim();
		const picture_url = article.match(/<img[^>]*\bsrc="([^"]+)"/)?.[1];

		if (name && picture_url) bakers.push({ name, picture_url });
	}

	return bakers;
}
