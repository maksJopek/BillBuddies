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
		if (amount === 0) {
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
		color: #43df7d;
	}

	.zero {
		color: #c7c7c7;
	}

	.neg {
		color: #f9b4b4;
	}
</style>
