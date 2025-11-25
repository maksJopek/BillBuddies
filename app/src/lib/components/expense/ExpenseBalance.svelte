<script lang="ts">
	import { findUser } from '$lib/state';
	import { Balance } from '$lib/components';

	interface Entry {
		from: string;
		to: string;
		amount: number;
	}

	interface Props {
		roomId: string;
		data: Entry[];
	}

	let { roomId, data }: Props = $props();

	let resolved: Entry[] = $derived.by(() =>
		data.map(({ from, to, amount }) => ({
			from: findUser(roomId, from)!.name,
			to: findUser(roomId, to)!.name,
			amount
		}))
	);
</script>

<div class="balance">
	{#each resolved as e}
		<div class="entry">
			<span>{e.from}</span>
			<span>→</span>
			<span>{e.to}</span>
			<span class="flex"></span>
			<Balance amount={e.amount} plusSign />
		</div>
	{/each}
</div>

<style>
	.balance {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: var(--surface);
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		padding: 0.75rem;
		gap: 0.5rem;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.flex {
		flex: 1;
	}
</style>
