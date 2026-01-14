<script lang="ts">
	import {
		Modal,
		Form,
		type ModalProps,
		type FormProps
	} from '$lib/components';

	interface Props extends ModalProps, FormProps {}

	let {
		open = $bindable(false),
		title,
		onSave,
		onCancel,
		...props
	}: Props = $props();

	async function handleSave() {
		await onSave?.();
		open = false;
	}

	async function handleCancel() {
		await onCancel?.();
		open = false;
	}
</script>

<Modal {open} {title}>
	<Form {...props} onSave={handleSave} onCancel={handleCancel} />
</Modal>
