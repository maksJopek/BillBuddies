<script lang="ts">
	import {
		FormModal,
		ExpenseForm,
		type ExpenseFormProps
	} from '$lib/components';
	import { findExpense } from '$lib/state';

	interface Props {
		open: boolean;
		roomId: string;
		id: string;
		onEdit: (expense: ExpenseFormProps) => any;
		onDelete: () => any;
	}

	let {
		open = $bindable(false),
		roomId,
		id,
		onEdit,
		onDelete
	}: Props = $props();

	let form = $state<ExpenseFormProps>({
		amount: 0,
		date: '',
		description: ''
	});

	$effect(() => {
		const e = findExpense(roomId, id);
		if (e) {
			form.amount = e.amount;
			form.description = e.description;
			form.date = e.date;
		}
	});

	function handleSave() {
		onEdit(form);
	}

	function handleCancel() {
		onDelete();
	}
</script>

<FormModal
	bind:open
	title="Edytuj wydatek"
	cancelText="Usuń"
	cancelDanger
	onSave={handleSave}
	onCancel={handleCancel}
>
	<ExpenseForm
		bind:amount={form.amount}
		bind:description={form.description}
		bind:date={form.date}
	/>
</FormModal>
