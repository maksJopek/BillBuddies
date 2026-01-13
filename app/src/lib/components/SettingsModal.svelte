<script lang="ts">
	import { Input, Modal, Button } from '$lib/components';
	import { ACCOUNT_EXPORT_HASH_PARAM } from '$lib/constants';
	import { appState } from '$lib/state';
	import { exportData } from '$lib/state/storage';

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

	async function exportAccount() {
		const url = `${import.meta.env.VITE_WEB_URL}#${ACCOUNT_EXPORT_HASH_PARAM}=${exportData()}`;
		await navigator.clipboard.writeText(url);
	}
</script>

<Modal bind:open title="Ustawienia" onSave={handleSave}>
	<Input
		label="Twoja nazwa"
		type="text"
		placeholder="Bob"
		bind:value={username}
	/>
	<Button onclick={exportAccount}>Eksportuj konto</Button>
</Modal>
