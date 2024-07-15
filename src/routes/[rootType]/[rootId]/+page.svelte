<script lang="ts">
	import {onMount} from 'svelte';
	import {page} from '$app/stores';
	import {afterNavigate} from '$app/navigation';
	import {handleLabels} from '$lib/tree-loading';

	import type * as tt from '$lib/tree-types';

	import FullQc from '$lib/components/FullQc.svelte';
	import {APP_NAME} from '$lib/constants';

	import fullQcSpecs from '$lib/assets/data/qc-specs.json';
	import rootSpecs from '$lib/assets/data/root-basics.json';

	let defaultQcSpecId: string;
	let selectedQcRootId: string;
	let rootType: string;
	let attributeLabels: tt.AttributeLabels;
	let specFilterYear = 2019;
	let startSentence: string;
	let rootName: string = '';

	$: titleExtension = rootName.length > 0 ? ` - ${rootName}` : '';

	onMount(() => {
		handleLabels((aLabels) => {
			[attributeLabels, selectedQcRootId, rootType] = [
				aLabels || {},
				getIdFromSemantic(aLabels || {}, $page.params.rootType, $page.params.rootId),
				$page.params.rootType
			];
			let rSpec = rootSpecs.filter((v) => v.entity_type == rootType)[0];

			[defaultQcSpecId, startSentence] = [rSpec.default_tree, rSpec.start_sentence];
		});
	});

	afterNavigate(() => {
		let tmpRootType = $page.params.rootType;
		let parsedId = getIdFromSemantic(attributeLabels || {}, tmpRootType, $page.params.rootId);

		if (selectedQcRootId != parsedId || rootType != tmpRootType) {
			let rSpec = rootSpecs.filter((v) => v.entity_type == tmpRootType)[0];
			[selectedQcRootId, rootType, defaultQcSpecId, startSentence] = [
				parsedId,
				$page.params.rootType,
				rSpec.default_tree,
				rSpec.start_sentence
			];
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

{#if ![selectedQcRootId, rootType, attributeLabels, fullQcSpecs, defaultQcSpecId, startSentence].includes(undefined)}
<FullQc bind:rootName {selectedQcRootId} {rootType} {attributeLabels} {fullQcSpecs} {defaultQcSpecId} {specFilterYear}
	{startSentence} removeHighlightUnhover={false} />
{/if}
