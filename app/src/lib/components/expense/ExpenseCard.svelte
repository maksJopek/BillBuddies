<script lang="ts">
	import { appState, findUser, type Expense } from '$lib/state';

	interface Props {
		roomId: string;
		expense: Expense;
		onEdit: () => any;
	}

	let { roomId, expense, onEdit }: Props = $props();

	function formatTimePart(n: number) {
		if (n > 9) {
			return `${n}`;
		}
		return `0${n}`;
	}

	function formatDate(date: Date) {
		const months = [
			'Sty',
			'Lut',
			'Mar',
			'Kwi',
			'Maj',
			'Cze',
			'Lip',
			'Sie',
			'Wrz',
			'Paź',
			'Lis',
			'Gru'
		];
		const d = `${date.getDate()} ${months[date.getMonth()]}`;
		const t = `${formatTimePart(date.getHours())}:${formatTimePart(date.getMinutes())}`;
		return `${d} ${t}`;
	}

	let meta = $derived.by(() => {
		let result = '';
		const u = findUser(roomId, expense.paidBy);
		if (u) {
			result += `${u.name} · `;
		}
		result += formatDate(new Date(expense.date));
		return result;
	});

	function handleContextMenu(e: Event) {
		e.preventDefault();
		onEdit();
	}
</script>

<li oncontextmenu={handleContextMenu}>
	<div class="details">
		<span>{expense.description}</span>
		<span class="meta">{meta}</span>
	</div>
	<div>{expense.amount.toFixed(2)}zł</div>
</li>

<style>
	li {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--surface);
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		padding: 0.75rem;
	}

	.details {
		display: flex;
		flex-direction: column;
	}

	.meta {
		margin-top: 0.375rem;
		font-size: 0.875rem;
		color: var(--gray);
	}
</style>
