<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'id'> {
		label: string;
	}

	const uid = $props.id();

	let { label, value = $bindable(), ...props }: Props = $props();
</script>

<div>
	<label for={uid}>{label}</label>
	<input id={uid} bind:value autocomplete="off" {...props} />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.25px;
	}

	input {
		color-scheme: dark;
		padding: 0.75rem;
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s ease;
		background-color: transparent;
	}

	input:hover,
	input:focus-visible {
		border-color: var(--primary-hover);
	}
</style>
