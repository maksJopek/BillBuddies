<script lang="ts">
	import { pdfShare, appState } from '$lib/state';
	import {
		Modal,
		ExpenseForm,
		type ExpenseFormProps,
		Button
	} from '$lib/components';
	import { extractPayment, openPayment, type PaymentData } from '$lib/pdf';

	interface Props {
		open: boolean;
		onAdd: (expense: ExpenseFormProps) => any;
	}

	let { open = $bindable(false), onAdd }: Props = $props();

	let form = $state<ExpenseFormProps>({
		amount: 0,
		description: '',
		date: ''
	});

	let pdfInput = $state<HTMLInputElement | null>(null);

	const isPDFShare = $derived(pdfShare.roomId !== null);

	$effect(() => {
		if (open) {
			form = {
				amount: 0,
				date: '',
				description: ''
			};
		}
	});

	$effect(() => {
		if (isPDFShare) {
			const data = pdfShare.data;
			if (data.amount !== null) {
				form.amount = data.amount;
			}
			if (data.date !== null) {
				form.date = data.date;
			}
		}
	});

	function handleSave() {
		if (isPDFShare) {
			pdfShare.roomId = null;
			pdfShare.data = { amount: null, date: null };
		}
		onAdd(form);
	}

	function handlePDFData(data: PaymentData | null) {
		if (!data) {
			return;
		}
		if (data.amount !== null) {
			form.amount = data.amount;
		}
		if (data.date !== null) {
			form.date = data.date;
		}
	}

	async function handlePDFInputChange() {
		const files = pdfInput!.files;
		if (!files) {
			return;
		}
		const buffer = new Uint8Array(await files[0].arrayBuffer());
		const data = await extractPayment(buffer);
		handlePDFData(data);
	}

	async function handleOpenPDF() {
		if (appState.tauri) {
			const data = await openPayment();
			handlePDFData(data);
		} else {
			pdfInput!.click();
		}
	}
</script>

<Modal bind:open title="Dodaj nowy wydatek" onSave={handleSave}>
	<ExpenseForm
		bind:amount={form.amount}
		bind:description={form.description}
		bind:date={form.date}
	/>
	{#if !appState.tauri}
		<input
			bind:this={pdfInput}
			type="file"
			accept="application/pdf"
			onchange={handlePDFInputChange}
		/>
	{/if}
	{#if !isPDFShare}
		<Button color="neutral" type="button" onclick={handleOpenPDF}>
			Open PDF
		</Button>
	{/if}
</Modal>

<style>
	input[type='file'] {
		display: none;
	}
</style>
