<script lang="ts">
	import { onMount } from 'svelte';

	import { INSTITUTION_TYPE } from '$lib/constants';
	import { mainPreload } from '$lib/tree-loading';
	import type * as tt from '$lib/tree-types';

	import introInstIds from '$lib/assets/data/intro-inst-ids.json';

	import FullQc from '$lib/components/FullQc.svelte';

	let defaultQcSpecId: string | undefined;
	let selectedQcRootId: string;
	let rootType: string = INSTITUTION_TYPE;
	let attributeLabels: tt.AttributeLabels;
	let fullQcSpecs: tt.QcSpecMap;

	function getRandElem(l: string[]) {
		return l[Math.floor(Math.random() * l.length)];
	}

	onMount(() => {
		selectedQcRootId = getRandElem(introInstIds);
		mainPreload().then(([aLabels, allQcSpecs]) => {
			[defaultQcSpecId, fullQcSpecs, attributeLabels] = [
				getRandElem(Object.keys(allQcSpecs || {})),
				allQcSpecs || {},
				aLabels || {}
			];
		});
	});
</script>

{#if ![selectedQcRootId, rootType, attributeLabels, fullQcSpecs, defaultQcSpecId].includes(undefined)}
	<FullQc {selectedQcRootId} {defaultQcSpecId} {rootType} {fullQcSpecs} {attributeLabels} />
{/if}
