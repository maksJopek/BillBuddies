<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';
	import { addExpense, deleteExpense, type Expense } from '$lib/states/data.svelte';
	import { settings } from '$lib/states/settings.svelte';

	let { data } = $props();

	let newModalShown = $state(false);
	let newExpense = $state<Expense>({} as Expense);

	let showEditModal = $state(false);
	let editedExpense = $state<Expense>({} as Expense);

	function showNewModal() {
		newExpense = {} as Expense;
		newModalShown = true;
	}
	async function saveNewExpense() {
		const amount = parseFloat(newExpense.amount as unknown as string);
		if (newExpense.desc && !isNaN(amount) && amount > 0) {
			await addExpense(data.room.id, {
				desc: newExpense.desc,
				amount: amount,
				paidBy: settings.user.id,
				date: new Date().toISOString().split('T')[0]
			});
			newModalShown = false;
			newExpense = {} as Expense;
		}
	}

	function openEditModal(e: Event, expense: Expense) {
		e.preventDefault();
		editedExpense = expense;
		showEditModal = true;
	}

	async function handleDeleteExpense() {
		await deleteExpense(data.room.id, editedExpense!.id);
	}
</script>

<div class="top">
	<a href="/" aria-label="go back">
		<img src="/left-arrow.svg" alt="arrow to the left" style="width: 1.75rem;" />
	</a>
	<h2>{data.room?.name || 'Loading...'}</h2>
	<button onclick={showNewModal}>+</button>
</div>

<div class="balance">
	<div>
		<span>John</span>
		<span>→</span>
		<span>You</span>
		<span class="pos">+45.50zł</span>
	</div>
	<div>
		<span>You</span>
		<span>→</span>
		<span>Sarah</span>
		<span class="neg">-23.00zł</span>
	</div>
	<div>
		<span>Sarah</span>
		<span>→</span>
		<span>Mike</span>
		<span class="neutral">12.50zł</span>
	</div>
</div>

<main>
	{#each data.room?.expenses || [] as e}
		<button class="exp" oncontextmenu={(event) => openEditModal(event, e)}>
			<div>
				<div>{e.desc}</div>
				<div class="meta">{data.room.userNames[e.paidBy]} · {e.date}</div>
			</div>
			<div>{e.amount.toFixed(2)}zł</div>
		</button>
	{/each}
</main>

<Modal bind:open={newModalShown} title="New Expense" onsave={saveNewExpense}>
	<Input
		label="Opis wydatku"
		type="text"
		bind:value={newExpense.desc}
		placeholder="Wydatek"
		required
	/>
	<Input
		label="Wartość (zł)"
		type="number"
		bind:value={newExpense.amount}
		placeholder="0,00"
		step="0.01"
		min="0.01"
		required
	/>
</Modal>

<Modal
	bind:open={showEditModal}
	title="Edytuj wydatek"
	saveText="Zapisz"
	cancelText="Usuń"
	oncancel={handleDeleteExpense}
	--cancel-btn-bg="var(--red)"
>
	<Input
		label="Nazwa wydatku"
		type="text"
		bind:value={editedExpense.desc}
		placeholder="Wydatek"
		required
	/>
	<Input
		label="Wartość (zł)"
		type="number"
		bind:value={editedExpense.amount}
		placeholder="0,00"
		step="0.01"
		min="0.01"
		required
	/>
</Modal>

<style>
	.top {
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
	}
	.top > a {
		width: 2.5rem;
	}
	.top > button {
		border-radius: 100%;
		padding: 0;
		width: 2.5rem;
		line-height: 2.5rem;
		font-size: 2rem;
	}

	.top > h2 {
		flex: 1;
		font-size: 1.25rem;
	}

	button {
		background: var(--primary);
	}

	.balance {
		margin: 0.75rem 1rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-dark);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
	}
	.balance > div {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
		margin-block: 0.5rem;
	}
	.balance > div:hover {
		background: var(--bg-hover);
	}
	.balance > div span:last-child {
		margin-left: auto;
		font-weight: 600;
	}
	.neutral {
		color: var(--gray);
	}
	.pos {
		color: var(--green);
	}
	.neg {
		color: var(--red);
	}

	main {
		margin: 0.75rem 1rem;
		overflow-y: auto;
		display: grid;
		gap: 0.5rem;
	}

	.exp {
		background: var(--bg-dark);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
	}
	.exp:hover {
		border-color: var(--primary);
	}

	.meta {
		font-size: 0.75rem;
		color: var(--gray);
		margin-top: 0.75rem;
	}
</style>
