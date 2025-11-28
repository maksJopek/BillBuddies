<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import './IconButton.css';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		'aria-label': string;
	}

	let { children, ...props }: Props = $props();
</script>

<button {...props} class="IconButton">
	{@render children()}
</button>
