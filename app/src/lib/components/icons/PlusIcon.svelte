<script lang="ts">
	import { Icon, type IconProps } from '$lib/components';

	let { size }: IconProps = $props();
</script>

<Icon {size}>
	<line x1="12" y1="5" x2="12" y2="19"></line>
	<line x1="5" y1="12" x2="19" y2="12"></line>
</Icon>
