<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import './Button.css';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet;
		href: string;
		color?: 'primary' | 'neutral' | 'danger';
	}

	let { children, color = 'neutral', ...props }: Props = $props();
</script>

<a {...props} class={['Button', color]}>
	{@render children()}
</a>
