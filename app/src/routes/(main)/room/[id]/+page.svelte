<script lang="ts">
	import {
		paymentShare,
		appState,
		addExpense,
		deleteExpense,
		editExpense,
		shareRoom
	} from '$lib/state';
	import {
		ExpenseBalance,
		Button,
		ExpenseCard,
		ExpenseAddModal,
		ExpenseEditModal,
		type ExpenseFormSubmitProps,
		PlusIcon,
		IconLink,
		IconButton,
		ArrowLeftIcon,
		ShareIcon
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

	async function handleAddExpense(expense: ExpenseFormSubmitProps) {
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

	async function handleEditExpense(expense: ExpenseFormSubmitProps) {
		await editExpense(roomId, expenseEditModalId, expense);
	}

	async function handleDeleteExpense() {
		await deleteExpense(roomId, expenseEditModalId);
	}

	async function handleShareRoom() {
		await shareRoom(roomId);
	}
</script>

<div class="top">
	<IconLink href="/" aria-label="go back">
		<ArrowLeftIcon />
	</IconLink>
	<h1 class="flex">{data.room.name}</h1>
	<IconButton aria-label="share" onclick={handleShareRoom}>
		<ShareIcon />
	</IconButton>
	<Button onclick={handleOpenExpenseAddModal}>
		<PlusIcon />
		<span>Nowy wydatek</span>
	</Button>
</div>
{#if Object.keys(data.room.users).length >= 2}
	<ExpenseBalance {roomId} />
{/if}
<ul>
	{#each data.room.expenses as expense}
		<ExpenseCard
			{roomId}
			{expense}
			onEdit={() => handleOpenExpenseEditModal(expense.id)}
		/>
	{/each}
</ul>

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

	ul {
		gap: 1rem;
	}
</style>
