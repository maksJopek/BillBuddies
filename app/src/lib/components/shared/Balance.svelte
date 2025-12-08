<script lang="ts">
	interface Props {
		amount: number;
		plusSign?: boolean;
		noColor?: boolean;
	}

	let { amount, plusSign, noColor }: Props = $props();
	const spanClass = $derived.by(() => {
		if (noColor === true) {
			return 'zero';
		}
		return amount > 0 ? 'pos' : 'neg';
	});
</script>

<span class={spanClass}>
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
