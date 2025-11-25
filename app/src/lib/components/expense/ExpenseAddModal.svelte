<script lang="ts">
	import { Modal, ExpenseForm, type ExpenseFormProps } from '$lib/components';
	import { openPayment } from '$lib/pdf';

	interface Props {
		open: boolean;
		onAdd: (expense: ExpenseFormProps) => any;
	}

	let { open = $bindable(false), onAdd }: Props = $props();

	let form = $state<ExpenseFormProps>({
		amount: 0,
		date: '',
		description: ''
	});

	$effect(() => {
		if (open) {
			form = {
				amount: 0,
				date: '',
				description: ''
			};
		}
	});

	function handleSave() {
		onAdd(form);
	}

	async function handleOpenPDF() {
		const data = await openPayment();
		if (!data) {
			return;
		}
		if (data.amount !== null) {
			form.amount = data.amount;
		}
		if (data.date !== null) {
		}
		// TODO
	}
</script>

<Modal bind:open title="Dodaj nowy wydatek" onSave={handleSave}>
	<ExpenseForm
		bind:amount={form.amount}
		bind:description={form.description}
		bind:date={form.date}
	/>
</Modal>
