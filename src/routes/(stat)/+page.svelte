<script lang="ts">
	import { onMount } from 'svelte';

	import { INSTITUTION_TYPE } from '$lib/constants';
	import { mainPreload } from '$lib/tree-loading';
	import type * as tt from '$lib/tree-types';

	import introInstIds from '$lib/assets/data/intro-inst-ids.json';

	import FullQc from '$lib/components/FullQc.svelte';
	import TypeWriter from '$lib/components/TypeWriter.svelte';

	let defaultQcSpecId: string | undefined;
	let selectedQcRootId: string;
	let rootType: string = INSTITUTION_TYPE;
	let attributeLabels: tt.AttributeLabels;
	let fullQcSpecs: tt.QcSpecMap;

	function getRandElem(l: string[]) {
		return l[Math.floor(Math.random() * l.length)];
	}

	function iterQc(comb: boolean, ind: number) {
		if (comb) {
			// defaultQcSpecId = qcConfs[ind];
		}
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
	let texts = ['topics', 'geographies', 'publications', 'relationships'];

	let qcConfs = ['qc-1', 'qc-2', 'qc-3', 'qc-4'];
	let combThrough = true;

	let wordInd = 0;

	$: iterQc(combThrough, wordInd);
</script>

<div>
	<span id="tw-full">
		<span id="tw-1"> explore </span>
		<span id="tw-2">
			<TypeWriter {texts} speed={50} bind:wordInd />
		</span>
	</span>
</div>

{#if ![selectedQcRootId, rootType, attributeLabels, fullQcSpecs, defaultQcSpecId].includes(undefined)}
	<FullQc
		startSentence={''}
		{selectedQcRootId}
		{defaultQcSpecId}
		{rootType}
		{fullQcSpecs}
		{attributeLabels}
	/>
{/if}

<style>
	div {
		position: fixed;
		top: 0px;
		height: 7svh;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	#tw-full {
		width: min(290px, 60vw);
		font-size: min(1.4rem, 4vw);
		left: 20vw;
	}

	#tw-2 {
		background-color: var(--color-theme-darkblue);
		color: var(--color-theme-white);
	}
</style>
