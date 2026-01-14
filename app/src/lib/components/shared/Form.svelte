<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface Props {
		children: Snippet;
		saveText?: string;
		cancelText?: string;
		cancelDanger?: boolean;
		onSave?: () => any;
		onCancel?: () => any;
	}
</script>

<script lang="ts">
	import { Button } from '$lib/components';

	let {
		children,
		saveText = 'Zapisz',
		cancelText = 'Anuluj',
		cancelDanger,
		onSave,
		onCancel
	}: Props = $props();

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		onSave?.();
	}
</script>

<form onsubmit={handleSave}>
	{@render children()}
	<div class="buttons">
		<Button
			fullWidth
			type="button"
			onclick={onCancel}
			color={cancelDanger ? 'danger' : 'neutral'}
		>
			{cancelText}
		</Button>
		<Button fullWidth type="submit">{saveText}</Button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
