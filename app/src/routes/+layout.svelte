<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
