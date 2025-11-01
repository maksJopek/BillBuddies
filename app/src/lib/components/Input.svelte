<script lang="ts">
	let { label, value = $bindable(), ...inputProps } = $props();
</script>

<label>
	{label}
	<input bind:value {...inputProps} />
</label>

<style>
	label {
		margin-top: 1rem;
		display: grid;
		gap: 0.5rem;
	}

	input {
		padding: 0.75rem;
		border: 2px solid var(--border);
		border-radius: 0.5rem;
		background: var(--bg-hover);
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: var(--primary);
	}
</style>
