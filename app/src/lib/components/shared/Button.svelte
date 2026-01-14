<script module lang="ts">
	export interface Props {
		children: Snippet;
		color?: 'primary' | 'neutral' | 'danger';
		fullWidth?: boolean;
		spacious?: boolean;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import './Button.css';

	let {
		children,
		color = 'primary',
		fullWidth,
		spacious,
		...props
	}: Props & HTMLButtonAttributes = $props();
</script>

<button {...props} class={['Button', color]} class:fullWidth class:spacious>
	{@render children()}
</button>
