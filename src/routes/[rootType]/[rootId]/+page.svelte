<script lang="ts">
	import {onMount} from 'svelte';
	import {page} from '$app/stores';
	import {afterNavigate} from '$app/navigation';
	import {mainPreload} from '$lib/tree-loading';

	import type * as tt from '$lib/tree-types';

	import FullQc from '$lib/components/FullQc.svelte';

	let defaultQcSpecId: string = 'qc-3';
	let selectedQcRootId: string;
	let rootType: string;
	let attributeLabels: tt.AttributeLabels;
	let fullQcSpecs: tt.QcSpecMap;
	let filterSet = 'all';

	onMount(() => {
		mainPreload().then(([aLabels, allQcSpecs]) => {
			[fullQcSpecs, attributeLabels, selectedQcRootId, rootType] = [
				allQcSpecs || {},
				aLabels || {},
				getIdFromSemantic(aLabels || {}, $page.params.rootType, $page.params.rootId),
				$page.params.rootType
			];
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
			filterSet = `y-${rawFilter}`;
			console.log('set!', filterSet);
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

{#if ![selectedQcRootId, rootType, attributeLabels, fullQcSpecs, defaultQcSpecId].includes(undefined)}
<FullQc {selectedQcRootId} {rootType} {attributeLabels} {fullQcSpecs} {defaultQcSpecId} {filterSet} />
{/if}
