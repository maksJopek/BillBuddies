<script lang="ts">
	import { appState, findRoom } from '$lib/state';
	import { Balance } from '$lib/components';

	interface Entry {
		from: string;
		to: string;
		amount: number;
		own: boolean;
	}

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	const room = $derived(findRoom(roomId));
	const currentUserId = $derived(appState.account.id);

	let resolved = $derived.by(() => {
		let wholeSum = 0;
		let userSums: Record<string, number> = {};

		for (const userId in room.users) {
			userSums[userId] = 0;
		}

		for (const expense of room.expenses) {
			userSums[expense.paidBy] += expense.amount;
			wholeSum += expense.amount;
		}

		const avgSum = wholeSum / Object.keys(userSums).length;

		function* getMaxEntry() {
			for (let i = 0; true; i++) {
				const maxSum = Math.max(...Object.values(userSums));
				const maxUser = Object.entries(userSums).find(
					([_, sum]) => sum === maxSum
				)![0];

				const minSum = Math.min(...Object.values(userSums));
				const minUser = Object.entries(userSums).find(
					([_, sum]) => sum === minSum
				)![0];

				let toReturn = avgSum - minSum;
				if (maxSum - avgSum < toReturn) {
					toReturn = maxSum - avgSum;
				}

				if (toReturn === 0) {
					if (i === 0) {
						yield null;
					}
					return;
				}

				userSums[maxUser] -= toReturn;
				userSums[minUser] += toReturn;

				if (minUser === currentUserId) {
					toReturn *= -1;
				}

				yield {
					from: minUser,
					to: maxUser,
					amount: toReturn,
					own: maxUser === currentUserId || minUser === currentUserId
				} as Entry;
			}
		}

		return getMaxEntry();
	});
</script>

<div class="balance">
	{#each resolved as e}
		<div class="entry">
			{#if e === null}
				<span>Wszyscy wydali po równo</span>
			{:else}
				<span>{room.users[e.from]}</span>
				<span>→</span>
				<span>{room.users[e.to]}</span>
				<span class="flex"></span>
				<Balance amount={e.amount} plusSign={e.own} noColor={!e.own} />
			{/if}
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
</style>
