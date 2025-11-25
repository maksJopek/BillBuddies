<script lang="ts">
	import { Modal, RoomForm, type RoomFormProps } from '$lib/components';

	interface Props {
		open: boolean;
		onCreate: (room: RoomFormProps) => any;
	}

	let { open = $bindable(false), onCreate }: Props = $props();

	let form = $state<RoomFormProps>({ name: '' });

	$effect(() => {
		if (open) {
			form.name = '';
		}
	});

	function handleSave() {
		onCreate(form);
	}
</script>

<Modal bind:open title="Stwórz nowy pokój" onSave={handleSave}>
	<RoomForm bind:name={form.name} />
</Modal>
