<script module lang="ts">
	export interface Props {
		size?: 'small' | 'medium' | 'large';
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, size = 'medium' }: Props & { children: Snippet } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class={size}>
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

	svg.large {
		width: 40px;
		height: 40px;
	}

	svg.medium {
		width: 24px;
		height: 24px;
	}

	svg.small {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 480px) {
		svg.large {
			width: 32px;
			height: 32px;
		}

		svg.medium {
			width: 20px;
			height: 20px;
		}

		svg.small {
			width: 18px;
			height: 18px;
		}
	}
</style>
