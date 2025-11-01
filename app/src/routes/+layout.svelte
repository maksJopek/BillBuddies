<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';
	import { settings, setUserName } from '$lib/states/settings.svelte';
	import { loadData } from '$lib/states/data.svelte';

	let { children } = $props();

	loadData();

	let showSettings = $state(false);
	let userName = $state('');
	onMount(() => (userName = settings.user.name));

	function openSettings() {
		showSettings = true;
	}

	function saveSettings() {
		setUserName(userName);
		showSettings = false;
	}
</script>

<div class="app">
	<header>
		<h2>
			<a href="/">BillBuddies</a>
		</h2>
		<button onclick={openSettings}>
			<img src="/settings.svg" alt="settings" />
		</button>
	</header>
	{@render children()}
</div>

<Modal bind:open={showSettings} title="Ustawienia" onsave={saveSettings}>
	<Input label="Twoja nazwa" type="text" bind:value={userName} placeholder="Wpisz swoją nazwę" />
</Modal>

<style>
	.app {
		height: 100vh;
		width: 100%;
		background-color: var(--global-bg);
		display: flex;
		flex-direction: column;
	}

	a {
		text-decoration: none;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #1f1f1f;
		background-color: var(--global-bg);
	}

	button img {
		height: 2.5rem;
	}
</style>
