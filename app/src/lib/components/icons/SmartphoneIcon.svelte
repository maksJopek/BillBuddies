<script lang="ts">
	import { Icon, type IconProps } from '$lib/components';

	let { size }: IconProps = $props();
</script>

<Icon {size}>
	<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
	<line x1="12" y1="18" x2="12.01" y2="18"></line>
</Icon>
