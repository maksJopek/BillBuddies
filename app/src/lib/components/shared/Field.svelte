<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label: string;
		children: Snippet;
	}

	let { id, label, children }: Props = $props();
</script>

<div>
	<label for={id}>{label}</label>
	{@render children()}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.25px;
	}
</style>
