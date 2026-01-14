<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { ButtonProps } from '$lib/components';
	import './Button.css';

	let {
		children,
		color = 'primary',
		fullWidth,
		spacious,
		...props
	}: ButtonProps & HTMLAnchorAttributes = $props();
</script>

<a {...props} class={['Button', color]} class:fullWidth class:spacious>
	{@render children()}
</a>
