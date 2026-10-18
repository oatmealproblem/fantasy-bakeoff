import { expect, it } from 'vitest';
import { createAttachmentKey } from 'svelte/attachments';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';
import CardForm from './CardForm.svelte';

it('applies attachment props passed through to the form', async () => {
	let attached = false;
	const key = createAttachmentKey();

	const { container } = render(CardForm, {
		props: {
			[key]: () => {
				attached = true;
			},
			children: createRawSnippet(() => ({ render: () => '<span>content</span>' }))
		}
	});

	const form = container.querySelector('form');
	expect(form).not.toBeNull();
	expect(attached).toBe(true);
	expect(form!.className).toContain('card-form');
});
