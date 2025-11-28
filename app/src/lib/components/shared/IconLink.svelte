<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import './IconButton.css';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet;
		href: string;
		'aria-label': string;
	}

	let { children, ...props }: Props = $props();
</script>

<a {...props} class="IconButton">
	{@render children()}
</a>
