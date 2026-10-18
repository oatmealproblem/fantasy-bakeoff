<script lang="ts">
	let {
		caption,
		columns,
		rows
	}: { caption?: string; columns: string[]; rows: (string | number)[][] } = $props();
</script>

<table class="table">
	{#if caption}<caption>{caption}</caption>{/if}
	<thead>
		<tr>
			{#each columns as column, i (i)}
				<th>{column}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each rows as row, i (i)}
			<tr>
				{#each row as cell, j (j)}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.table {
		width: 100%;
		border: 1px solid var(--tertiary);
		border-collapse: collapse;
		background: var(--surface-alt);
	}

	.table caption {
		padding-block: 0.5rem;
		font-size: 0.875rem;
		text-align: left;
	}

	.table th {
		padding: 0.5rem 0.75rem;
		border-block-end: 2px solid var(--tertiary);
		color: var(--primary);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-align: left;
		text-transform: uppercase;
	}

	.table td {
		padding: 0.5rem 0.75rem;
		border-block-end: 1px solid var(--tertiary);
	}

	.table tbody tr:last-child td {
		border-block-end: 0;
	}
</style>
