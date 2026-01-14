<script lang="ts">
	import { page } from '$app/state';
	import { appLoadRetry } from '$lib/state';
	import { Button, ButtonLink, AlertCircleIcon } from '$lib/components';
</script>

{#if page.status === 404}
	<main>
		{#if page.route.id === '/(main)/room/[id]'}
			<h1>Pokój nie istnieje</h1>
		{:else}
			<h1>Strona nie istnieje</h1>
		{/if}
		<ButtonLink href="/">Powrót</ButtonLink>
	</main>
{:else}
	<main>
		<div class="alert">
			<AlertCircleIcon size="large" />
		</div>
		<h1>Coś poszło nie tak</h1>
		<Button color="neutral" onclick={appLoadRetry}>Spróbuj ponownie</Button>
	</main>
{/if}

<style>
	main {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;
	}

	.alert {
		color: #f8a5a5;
	}

	h1 {
		font-size: 2rem;
		letter-spacing: 0.5px;
	}

	@media (max-width: 480px) {
		h1 {
			font-size: 1.75rem;
		}
	}
</style>
