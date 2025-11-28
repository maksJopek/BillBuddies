<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { Button } from '$lib/components';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		saveText?: string;
		cancelText?: string;
		cancelDanger?: boolean;
		onSave?: (e: SubmitEvent) => any;
		onCancel?: (e: MouseEvent) => any;
	}

	let {
		open = $bindable(false),
		title,
		children,
		saveText = 'Zapisz',
		cancelText = 'Anuluj',
		cancelDanger,
		onSave,
		onCancel
	}: Props = $props();

	const dialogAttachment: Attachment<HTMLDialogElement> = (dialog) => {
		dialog.showModal();
	};

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		await onSave?.(e);
		open = false;
	}

	async function handleCancel(e: MouseEvent) {
		await onCancel?.(e);
		open = false;
	}
</script>

{#if open}
	<dialog {@attach dialogAttachment}>
		<h2>{title}</h2>
		<form onsubmit={handleSave}>
			{@render children()}
			<div class="buttons">
				<Button
					fullWidth
					type="button"
					onclick={handleCancel}
					color={cancelDanger ? 'danger' : 'neutral'}
				>
					{cancelText}
				</Button>
				<Button fullWidth type="submit">{saveText}</Button>
			</div>
		</form>
	</dialog>
{/if}

<style>
	dialog {
		color: inherit;
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		background-color: var(--surface);
		padding: 1.5rem;
		width: 90%;
		max-width: 400px;
		margin: auto;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}

	h2 {
		margin-bottom: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
