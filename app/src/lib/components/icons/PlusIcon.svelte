<script lang="ts">
	import { Icon } from '$lib/components';

	interface Props {
		size?: number;
	}

	let { size }: Props = $props();
</script>

<Icon {size}>
	<line x1="12" y1="5" x2="12" y2="19"></line>
	<line x1="5" y1="12" x2="19" y2="12"></line>
</Icon>
