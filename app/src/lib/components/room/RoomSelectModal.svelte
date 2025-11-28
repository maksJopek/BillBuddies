<script lang="ts">
	import { appState } from '$lib/state';
	import { Modal, Select } from '$lib/components';
	import { formatDatePretty } from '$lib/date';
	import type { PaymentData } from '$lib/pdf';

	interface Props {
		open: boolean;
		payment?: PaymentData;
		onSelect: (id: string) => any;
	}

	let { open = $bindable(false), payment, onSelect }: Props = $props();

	let id = $state('');

	function handleSave() {
		onSelect(id);
	}
</script>

<Modal bind:open title="Wybierz pokój" saveText="Wybierz" onSave={handleSave}>
	{#if payment}
		<div class="payment">
			{#if payment.amount !== null}
				<p><b>Wartość:{' '}</b>{payment.amount}zł</p>
			{/if}
			{#if payment.date !== null}
				<p><b>Data:{' '}</b>{formatDatePretty(new Date(payment.date))}</p>
			{/if}
		</div>
	{/if}
	<Select bind:value={id} label="Nazwa pokoju">
		{#each appState.rooms as room}
			<option value={room.id}>{room.name}</option>
		{/each}
	</Select>
</Modal>

<style>
	.payment {
		background-color: var(--surface-hover);
		border-radius: var(--border-radius);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	option {
		background-color: var(--surface);
		color: inherit;
	}
</style>
