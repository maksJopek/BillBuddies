<script lang="ts">
	import { paymentShare } from '$lib/state';
	import {
		FormModal,
		ExpenseForm,
		type ExpenseFormProps,
		type ExpenseFormSubmitProps,
		Button
	} from '$lib/components';
	import { extractPayment, openPayment, type PaymentData } from '$lib/pdf';
	import { IS_TAURI } from '$lib/constants';

	interface Props {
		open: boolean;
		onAdd: (expense: ExpenseFormSubmitProps) => any;
	}

	let { open = $bindable(false), onAdd }: Props = $props();

	const getEmptyForm = () => ({
		amount: null,
		description: '',
		date: new Date().toISOString().slice(0, -8)
	});

	let form = $state<ExpenseFormProps>(getEmptyForm());
	let pdfInput = $state<HTMLInputElement | null>(null);

	const isPaymentShare = $derived(paymentShare.roomId !== null);

	$effect(() => {
		if (open) {
			form = getEmptyForm();
		}
	});

	$effect(() => {
		if (isPaymentShare) {
			const data = paymentShare.data;
			if (data.amount !== null) {
				form.amount = data.amount;
			}
			if (data.date !== null) {
				form.date = data.date;
			}
		}
	});

	function handleSave() {
		if (isPaymentShare) {
			paymentShare.roomId = null;
			paymentShare.data = { amount: null, date: null };
		}
		onAdd(form as ExpenseFormSubmitProps);
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
		if (IS_TAURI) {
			const data = await openPayment();
			handlePDFData(data);
		} else {
			pdfInput!.click();
		}
	}
</script>

<FormModal bind:open title="Dodaj nowy wydatek" onSave={handleSave}>
	<ExpenseForm
		bind:amount={form.amount}
		bind:description={form.description}
		bind:date={form.date}
	/>
	{#if !IS_TAURI}
		<input
			bind:this={pdfInput}
			type="file"
			accept="application/pdf"
			onchange={handlePDFInputChange}
		/>
	{/if}
	{#if !isPaymentShare}
		<Button color="neutral" type="button" onclick={handleOpenPDF}>
			Open PDF
		</Button>
	{/if}
</FormModal>

<style>
	input[type='file'] {
		display: none;
	}
</style>
