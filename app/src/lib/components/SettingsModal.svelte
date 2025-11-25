<script lang="ts">
	import { Input, Modal } from '$lib/components';
	import { appState } from '$lib/state';

	interface Props {
		open: boolean;
		onChange: (username: string) => any;
	}

	let { open = $bindable(false), onChange }: Props = $props();

	let username = $state('');

	$effect(() => {
		username = appState.account.name;
	});

	function handleSave() {
		onChange(username);
	}
</script>

<Modal bind:open title="Ustawienia" onSave={handleSave}>
	<Input
		label="Twoja nazwa"
		type="text"
		placeholder="Bob"
		bind:value={username}
	/>
</Modal>
