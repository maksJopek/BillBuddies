<script lang="ts">
	import { Modal, RoomForm } from '$lib/components';
	import { findRoom } from '$lib/state';

	interface Props {
		open: boolean;
		id: string;
		onEdit: (name: string) => any;
		onDelete: () => any;
	}

	let { open = $bindable(false), id, onEdit, onDelete }: Props = $props();

	let name = $state('');

	$effect(() => {
		const r = findRoom(id);
		if (r) {
			name = r.name;
		}
	});

	function handleSave() {
		onEdit(name);
	}

	function handleCancel() {
		onDelete();
	}
</script>

<Modal
	bind:open
	title="Edytuj pokój"
	cancelText="Usuń"
	cancelDanger
	onSave={handleSave}
	onCancel={handleCancel}
>
	<RoomForm bind:name />
</Modal>
