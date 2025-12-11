<script lang="ts">
	import {
		paymentShare,
		appState,
		addExpense,
		deleteExpense,
		editExpense
	} from '$lib/state';
	import {
		ExpenseBalance,
		Button,
		ExpenseCard,
		ExpenseAddModal,
		ExpenseEditModal,
		type ExpenseFormProps,
		PlusIcon,
		IconLink,
		ArrowLeftIcon,
		List
	} from '$lib/components';

	let { data } = $props();

	let expenseAddModalOpen = $state(false);
	let expenseEditModalOpen = $state(false);
	let expenseEditModalId = $state('');

	const roomId = $derived(data.room.id);

	$effect(() => {
		if (paymentShare.roomId === roomId) {
			expenseAddModalOpen = true;
		}
	});

	function handleOpenExpenseAddModal() {
		expenseAddModalOpen = true;
	}

	async function handleAddExpense(expense: ExpenseFormProps) {
		await addExpense(roomId, {
			...expense,
			paidBy: appState.account.id
		});
		expenseAddModalOpen = false;
	}

	function handleOpenExpenseEditModal(id: string) {
		expenseEditModalOpen = true;
		expenseEditModalId = id;
	}

	async function handleEditExpense(expense: ExpenseFormProps) {
		await editExpense(roomId, expenseEditModalId, expense);
	}

	async function handleDeleteExpense() {
		await deleteExpense(roomId, expenseEditModalId);
	}
</script>

<div class="top">
	<IconLink href="/" aria-label="go back">
		<ArrowLeftIcon />
	</IconLink>
	<h1>{data.room.name}</h1>
	<div class="flex"></div>
	<Button onclick={handleOpenExpenseAddModal}>
		<PlusIcon />
		<span>Nowy wydatek</span>
	</Button>
</div>
{#if data.room.expenses.length >= 2}
	<ExpenseBalance {roomId} />
{/if}
<List>
	{#each data.room.expenses as expense}
		<ExpenseCard
			{roomId}
			{expense}
			onEdit={() => handleOpenExpenseEditModal(expense.id)}
		/>
	{/each}
</List>

<ExpenseAddModal bind:open={expenseAddModalOpen} onAdd={handleAddExpense} />

<ExpenseEditModal
	bind:open={expenseEditModalOpen}
	{roomId}
	id={expenseEditModalId}
	onEdit={handleEditExpense}
	onDelete={handleDeleteExpense}
/>

<style>
	.top {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.flex {
		flex: 1;
	}
</style>
