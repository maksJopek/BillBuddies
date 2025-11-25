<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<ul>{@render children()}</ul>

<style>
	ul {
		list-style-type: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
