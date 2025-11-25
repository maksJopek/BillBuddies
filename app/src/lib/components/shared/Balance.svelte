<script lang="ts">
	interface Props {
		amount: number;
		plusSign?: boolean;
	}

	let { amount, plusSign }: Props = $props();
</script>

<span class:pos={amount > 0} class:zero={amount === 0} class:neg={amount < 0}>
	{plusSign && amount > 0 ? '+' : ''}{amount.toFixed(2)}zł
</span>

<style>
	.pos {
		color: var(--success);
	}

	.zero {
		color: var(--gray);
	}

	.neg {
		color: var(--danger);
	}
</style>
