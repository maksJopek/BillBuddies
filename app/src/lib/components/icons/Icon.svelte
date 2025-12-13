<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		viewBox?: string;
		strokeWidth?: string;
		fill?: string;
	}

	let {
		children,
		viewBox = '0 0 24 24',
		strokeWidth = '2px',
		fill = 'none'
	}: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	{viewBox}
	style:stroke-width={strokeWidth}
	style:fill>{@render children()}</svg
>

<style>
	svg {
		width: 24px;
		height: 24px;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
