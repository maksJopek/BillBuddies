<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		color?: 'primary' | 'neutral' | 'danger';
		fullWidth?: boolean;
	}

	let { children, color = 'primary', fullWidth, ...props }: Props = $props();
</script>

<button {...props} class={color} class:fullWidth>
	{@render children()}
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 4px;
		outline: none;
		border: none;
		transition: background-color 0.2s ease;
		cursor: pointer;
		letter-spacing: 0.25px;
		font-size: 1rem;
		font-weight: 500;
	}

	.primary {
		background-color: var(--primary);
	}

	.primary:hover,
	.primary:focus-visible {
		background-color: var(--primary-hover);
	}

	.neutral {
		border: 2px solid var(--border);
		background-color: transparent;
	}

	.neutral:hover,
	.neutral:focus-visible {
		background-color: var(--background-hover);
	}

	.danger {
		background-color: var(--danger);
	}

	.danger:hover,
	.danger:focus-visible {
		background-color: var(--danger-hover);
	}

	.fullWidth {
		width: 100%;
	}
</style>
