<script lang="ts">
	import { Modal, RoomForm, type RoomFormProps } from '$lib/components';
	import { findRoom } from '$lib/state';

	interface Props {
		open: boolean;
		id: string;
		onEdit: (room: RoomFormProps) => any;
		onDelete: () => any;
	}

	let { open = $bindable(false), id, onEdit, onDelete }: Props = $props();

	let form = $state<RoomFormProps>({ name: '' });

	$effect(() => {
		const r = findRoom(id);
		if (r) {
			form.name = r.name;
		}
	});

	function handleSave() {
		onEdit(form);
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
	<RoomForm bind:name={form.name} />
</Modal>
