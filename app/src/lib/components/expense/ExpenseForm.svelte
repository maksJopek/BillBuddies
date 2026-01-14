<script module lang="ts">
	export interface SubmitProps {
		amount: number;
		description: string;
		date: string;
	}

	export interface Props {
		amount: number | null;
		description: string;
		date: string;
	}
</script>

<script lang="ts">
	import { Input } from '$lib/components';

	let {
		amount = $bindable(null),
		description = $bindable(''),
		date = $bindable('')
	}: Props = $props();
</script>

<Input
	label="Wartość (zł)"
	name="amount"
	type="number"
	placeholder="0.00"
	step="0.01"
	min="0.01"
	required
	bind:value={amount}
/>
<Input
	label="Opis wydatku"
	name="description"
	type="text"
	placeholder="Wydatek"
	required
	bind:value={description}
/>
<Input
	label="Data"
	name="date"
	type="datetime-local"
	required
	bind:value={date}
/>
