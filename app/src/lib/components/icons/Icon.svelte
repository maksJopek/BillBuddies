<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
	>{@render children()}</svg
>

<style>
	svg {
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
