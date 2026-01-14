<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface Props {
		children: Snippet;
		open: boolean;
		title: string;
	}
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';

	let { open = $bindable(false), title, children }: Props = $props();

	const dialogAttachment: Attachment<HTMLDialogElement> = (dialog) => {
		dialog.showModal();
	};
</script>

{#if open}
	<dialog {@attach dialogAttachment}>
		<h2>{title}</h2>
		{@render children()}
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
</style>
