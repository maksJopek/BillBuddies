<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		saveText?: string;
		cancelText?: string;
		oncancel?: (e: MouseEvent) => Promise<void> | void;
		onsave?: (e: SubmitEvent) => Promise<void> | void;
	}

	let {
		open = $bindable(false),
		title,
		children,
		saveText = 'Dodaj',
		cancelText = 'Cofnij',
		oncancel,
		onsave
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (open) {
			dialog!.showModal();
		} else {
			dialog!.close();
		}
	});

	async function handleClose(e: MouseEvent) {
		await oncancel?.(e);
		open = false;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		await onsave?.(e);
		open = false;
	}
</script>

<dialog bind:this={dialog}>
	<h2>{title}</h2>
	<form onsubmit={handleSubmit}>
		{@render children()}
		<div class="dialog-buttons">
			<button type="button" class="cancel" onclick={handleClose}>{cancelText}</button>
			<button type="submit">{saveText}</button>
		</div>
	</form>
</dialog>

<style>
	dialog {
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background-color: var(--bg-dark);
		padding: 1.5rem;
		width: 90%;
		max-width: 400px;
		top: 25%;
		margin-inline: auto;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}

	h2 {
		margin-bottom: 1rem;
	}

	.dialog-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.dialog-buttons button {
		flex: 1;
		padding: 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background: var(--primary);
		color: white;
	}

	.dialog-buttons .cancel {
		background: var(--cancel-btn-bg, transparent);
		border: 2px solid var(--border);
		color: inherit;
	}
</style>
