<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		small?: boolean;
	}

	let { children, small }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class:small>
	{@render children()}
</svg>

<style>
	svg {
		width: 24px;
		height: 24px;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2px;
		fill: none;
	}

	.small {
		width: 20px;
		height: 20px;
	}
</style>
