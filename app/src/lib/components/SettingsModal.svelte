<script lang="ts">
	import { Input, Modal } from '$lib/components';
	import { appState } from '$lib/state';
	import { exportStorage } from '$lib/state/storage';
	import Button from './shared/Button.svelte';

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
		const url = import.meta.env.VITE_WEB_URL + '#oldAccount=' + exportStorage();
		await navigator.clipboard.writeText(url);
		appState.showToast(
			'Link skopiowany, otwórz go na nowym urządzeniu aby zaimportować konto'
		);
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
