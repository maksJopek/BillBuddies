<script lang="ts">
	import { appState } from '$lib/state';
	import { FormModal, Select } from '$lib/components';

	interface Props {
		open: boolean;
		onSelect: (id: string) => any;
		onCancel: () => any;
	}

	let { open = $bindable(false), onSelect, onCancel }: Props = $props();

	let id = $state('');

	function handleSave() {
		onSelect(id);
	}
</script>

<FormModal
	bind:open
	title="Wybierz pokój"
	saveText="Wybierz"
	onSave={handleSave}
	{onCancel}
>
	<Select bind:value={id} label="Nazwa pokoju">
		{#each appState.rooms as room}
			<option value={room.id}>{room.name}</option>
		{/each}
	</Select>
</FormModal>

<style>
	option {
		background-color: var(--surface);
		color: inherit;
	}
</style>
