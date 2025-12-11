<script lang="ts">
	import { Modal, RoomForm } from '$lib/components';

	interface Props {
		open: boolean;
		onCreate: (name: string) => any;
	}

	let { open = $bindable(false), onCreate }: Props = $props();

	let name = $state('');

	$effect(() => {
		if (open) {
			name = '';
		}
	});

	function handleSave() {
		onCreate(name);
	}
</script>

<Modal bind:open title="Stwórz nowy pokój" onSave={handleSave}>
	<RoomForm bind:name />
</Modal>
