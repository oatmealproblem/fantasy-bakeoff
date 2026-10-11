const entities: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

export function html(strings: TemplateStringsArray, ...values: unknown[]) {
	return strings.reduce(
		(result, string, i) =>
			result +
			string +
			(i < values.length ? String(values[i]).replace(/[&<>"']/g, (c) => entities[c]!) : ''),
		''
	);
}
