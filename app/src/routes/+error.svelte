<script lang="ts">
	import { page } from '$app/state';
</script>

<main>
	<h1>Wystąpił błąd</h1>
	<h3>{page.status}</h3>
	<h2>{page.error!.message}</h2>
</main>

<style>
	main {
		width: 95%;
		margin: 2rem auto;
		text-align: center;
	}
	h3 {
		margin-block: 0.5rem 1.5rem;
		color: var(--gray);
	}
</style>
