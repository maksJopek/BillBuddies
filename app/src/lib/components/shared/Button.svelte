<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import './Button.css';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		color?: 'primary' | 'neutral' | 'danger';
		fullWidth?: boolean;
	}

	let { children, color = 'primary', fullWidth, ...props }: Props = $props();
</script>

<button {...props} class={['Button', color]} class:fullWidth>
	{@render children()}
</button>
