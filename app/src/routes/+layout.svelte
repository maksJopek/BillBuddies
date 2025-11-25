<script lang="ts">
	import { onMount } from 'svelte';
	import { SettingsModal, IconButton, SettingsIcon } from '$lib/components';
	import { editAccount, loadData } from '$lib/state';
	import '../app.css';

	let { children } = $props();

	let settingsModal = $state(false);

	function handleOpenSettings() {
		settingsModal = true;
	}

	function handleChangeSettings(username: string) {
		editAccount({ name: username });
		settingsModal = false;
	}

	onMount(loadData);
</script>

<div class="app">
	<header>
		<a href="/">BillBuddies</a>
		<IconButton aria-label="settings" onclick={handleOpenSettings}>
			<SettingsIcon />
		</IconButton>
	</header>
	<main>
		{@render children()}
	</main>
</div>

<SettingsModal bind:open={settingsModal} onChange={handleChangeSettings} />

<style>
	.app {
		height: 100vh;
		width: 100%;
		background-color: var(--background);
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #1f1f1f;
	}

	a {
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		outline: none;
		border-radius: var(--border-radius);
		background-color: transparent;
		padding: 0.5rem;
		transition: background-color 0.2s ease;
	}

	a:hover,
	a:focus-visible {
		background-color: var(--background-hover);
	}

	main {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		margin-inline: auto;
		width: 100%;
		max-width: 832px;
		gap: 2rem;
		padding: 1rem;
	}
</style>
