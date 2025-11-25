<script lang="ts">
	import { page } from '$app/state';
</script>

<div>
	<h1>Wystąpił błąd</h1>
	<p class="message">{page.error!.message}</p>
	<p class="code">{page.status}</p>
</div>

<style>
	div {
		text-align: center;
		margin-top: 25%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.code {
		color: var(--gray);
	}
</style>
