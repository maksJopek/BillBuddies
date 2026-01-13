<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import './Button.css';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		color?: 'primary' | 'neutral' | 'danger';
		fullWidth?: boolean;
		class?: string;
	}

	let {
		children,
		color = 'primary',
		fullWidth,
		class: className,
		...props
	}: Props = $props();
</script>

<button {...props} class={['Button', color, className]} class:fullWidth>
	{@render children()}
</button>
