<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { mainPreload } from '$lib/tree-loading';

	import type * as tt from '$lib/tree-types';

	import FullQc from '$lib/components/FullQc.svelte';
	import { APP_NAME } from '$lib/constants';

	let defaultQcSpecId: string = 'qc-3';
	let selectedQcRootId: string;
	let rootType: string;
	let attributeLabels: tt.AttributeLabels;
	let fullQcSpecs: tt.QcSpecMap;
	let specFilterYear = 2019;

	let titleExtension = '';

	onMount(() => {
		mainPreload().then(([aLabels, allQcSpecs]) => {
			[fullQcSpecs, attributeLabels, selectedQcRootId, rootType] = [
				allQcSpecs || {},
				aLabels || {},
				getIdFromSemantic(aLabels || {}, $page.params.rootType, $page.params.rootId),
				$page.params.rootType
			];
			let name = attributeLabels[rootType][selectedQcRootId]?.name;
			if (name) {
				titleExtension = ` - ${name}`;
			}
		});
	});

	afterNavigate(() => {
		let parsedId = getIdFromSemantic(
			attributeLabels || {},
			$page.params.rootType,
			$page.params.rootId
		);
		if (selectedQcRootId != parsedId || rootType != $page.params.rootType) {
			selectedQcRootId = parsedId;
			rootType = $page.params.rootType;
		}
		const rawFilter = $page.url.searchParams.get('filter');
		if (rawFilter) {
			specFilterYear = parseInt(rawFilter);
		}
	});

	function getIdFromSemantic(labels: tt.AttributeLabels, entityType: string, semanticId: string) {
		for (const [k, v] of Object.entries(labels[entityType] || {})) {
			if (semanticId == v.meta.semantic_id || '') {
				return k;
			}
		}
		return '0';
	}
</script>

<svelte:head>
	<title>{APP_NAME}{titleExtension}</title>
</svelte:head>

{#if ![selectedQcRootId, rootType, attributeLabels, fullQcSpecs, defaultQcSpecId].includes(undefined)}
	<FullQc
		{selectedQcRootId}
		{rootType}
		{attributeLabels}
		{fullQcSpecs}
		{defaultQcSpecId}
		{specFilterYear}
		removeHighlightUnhover={false}
	/>
{/if}
