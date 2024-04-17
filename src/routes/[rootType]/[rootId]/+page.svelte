<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';

	import type {
		TreeInteractionEvent,
		QcSpecMap,
		QcSpec,
		AttributeLabels,
		AttributeLabel,
		BareNode,
		LevelOutSpec,
		ControlSpec,
		PathInTree,
		WeightedNode,
		SpecBaseOptions,
		BreakdownOptions,
		SelectedBreakdowns,
		TreeInfo
	} from '$lib/tree-types';
	import {
		getNodeByPath,
		DEFAULT_CONTROL_SPEC,
		deriveVisibleTree,
		getSomePath,
		pruneTree
	} from '$lib/tree-functions';

	import QuercusBranches from '$lib/components/QuercusBranches.svelte';
	import PathLevelInfoBox from '$lib/components/PathLevelInfoBox.svelte';
	import BrokenFittedText from '$lib/components/BrokenFittedText.svelte';
	import { fade } from 'svelte/transition';
	import { handleStore, mainPreload } from '$lib/tree-loading';
	import { MAX_LEVEL_COUNT } from '$lib/constants';
	import NumberSlider from '$lib/components/NumberSlider.svelte';
	import MidpathBar from '$lib/components/MidpathBar.svelte';

	let highlightedPath: PathInTree = [];
	let selectedPath: PathInTree = [];
	let expandControlInd: number | undefined;

	let innerHeight: number;
	let innerWidth: number;

	let defaultChildD1Rate = 0.3;

	let svgD2 = 100;
	let rootD2 = 25;
	let d2Offset = 39;
	let sideBarD2 = 0;

	let d1PadRate = 0.07;
	let overHangRate = 0.05;
	let headerRate = 0.11;
	let occupyRate = 0.85;

	let minimumChildWidth = 2.5;
	let showHoverInfo = true;

	let fullQcSpecs: QcSpecMap = {};
	let currentQcSpec: QcSpec;

	let specBaselineOptions: SpecBaseOptions = {};

	let selectedQcRootId: string;
	let selectedQcSpecId: string;
	let rootType: string;

	let attributeLabels: AttributeLabels = {};

	let levelOutSpecs: LevelOutSpec[] = Array(MAX_LEVEL_COUNT)
		.fill(0)
		.map(() => {
			return {
				totalSize: 0,
				topOffset: 0,
				levelOptions: [],
				isVisible: false
			};
		});
	let controlSpecs: ControlSpec[] = Array(MAX_LEVEL_COUNT)
		.fill(0)
		.map(() => {
			return { ...DEFAULT_CONTROL_SPEC };
		});
	let maxOnOneLevel = 15;
	let globalControlShowN = DEFAULT_CONTROL_SPEC.limit_n;
	let breakdownOptions: BreakdownOptions = {};
	let selectedBreakdowns: SelectedBreakdowns = [];
	let completeTree: WeightedNode = { weight: 1 };
	let selectionState: BareNode = { children: {} };

	let rootAttributes: AttributeLabel;

	$: childD1Rate = expandControlInd == undefined ? defaultChildD1Rate : 0.7;
	$: svgD1 = (innerHeight / innerWidth) * svgD2;
	$: d1ToPixels = (d1: number) => (d1 * innerHeight) / svgD1;
	$: d2ToPixels = (d2: number) => (d2 * innerWidth) / svgD2;
	$: dBasedStyle = getStyleMaker(d1ToPixels, d2ToPixels);
	$: d1PadSize = d1PadRate * svgD1;

	$: headerShape = {
		height: svgD1 * headerRate,
		width: rootD2,
		x: d2Offset + sideBarD2,
		y: -svgD1 * headerRate
	};
	$: headBarShape = {
		x: -svgD2 * 0.5,
		y: -svgD1 * headerRate,
		height: svgD1 * headerRate,
		width: 2 * svgD2
	};
	$: svgShape = {
		height: svgD1,
		width: svgD2,
		x: 0,
		y: -(headerRate + d1PadRate) * svgD1
	};

	$: loadNewQc(selectedBreakdowns, selectedQcRootId, attributeLabels);
	$: alignToGlobalShown(globalControlShowN);

	$: visibleTreeInfo = deriveVisibleTree(
		selectedQcRootId,
		completeTree,
		controlSpecs,
		selectionState,
		attributeLabels,
		currentQcSpec,
		specBaselineOptions
	);

	$: updateLevelSpecs(
		visibleTreeInfo,
		svgD1 * (1 - headerRate) * occupyRate,
		expandControlInd,
		breakdownOptions,
		selectedBreakdowns
	);

	onMount(() => {
		mainPreload().then(([aLabels, allQcSpecs, baseOptions]) => {
			let _OPTS = [{}, {}, {}, {}, {}];
			Object.entries(allQcSpecs || {}).map(([k, v]) => {
				if (v.root_entity_type == $page.params.rootType) {
					fullQcSpecs[k] = v;
					let boObj = breakdownOptions;
					for (let [i, bif] of v.bifurcations.entries()) {
						const bDef = bif.description;
						if (!(bDef in boObj)) {
							boObj[bDef] = { children: {}, qcSpecs: [] };
						}
						boObj[bDef].qcSpecs.push(k);
						boObj = boObj[bDef].children;
						_OPTS[i][bDef] = '';
					}
				}
			});
			console.log(_OPTS);

			specBaselineOptions = baseOptions;
			let defaultQcSpec = Object.values(fullQcSpecs)[5];
			for (let i = 0; i < MAX_LEVEL_COUNT; i++) {
				selectedBreakdowns.push(defaultQcSpec.bifurcations[i]?.description || '');
			}
			[attributeLabels, selectedBreakdowns, selectedQcRootId] = [
				aLabels || {},
				selectedBreakdowns,
				$page.params.rootId
			];
			rootType = $page.params.rootType;
		});
	});

	afterNavigate(() => {
		selectedQcRootId = $page.params.rootId;
		rootType = $page.params.rootType;
	});

	function alignToGlobalShown(shown: number) {
		for (let i in controlSpecs) {
			controlSpecs[i].limit_n = shown;
		}
	}

	function loadNewQc(
		selectedBreakdowns: SelectedBreakdowns,
		rootId: string | undefined,
		attributeLabels: AttributeLabels
	) {
		if (rootId == null) {
			return;
		}
		if (selectedBreakdowns.length == 0) {
			return;
		}
		let breakdownMatchLevel = 0;
		const newSelections = [];
		let bdKeys = breakdownOptions;
		let bdLevel;
		for (let selectedBD of selectedBreakdowns) {
			newSelections.push(selectedBD);
			// need to figure out what index changed, might get messed up...
			bdLevel = bdKeys[selectedBD];
			if (bdLevel === undefined) return;
			if (bdLevel.qcSpecs.includes(selectedQcSpecId)) {
				breakdownMatchLevel++;
			} else {
				break;
			}
			bdKeys = bdLevel.children;
		}
		selectedQcSpecId = bdLevel?.qcSpecs[0] || '';

		while (selectedBreakdowns.length > 0) {
			selectedBreakdowns.pop();
		}
		for (let bif of fullQcSpecs[selectedQcSpecId].bifurcations) {
			selectedBreakdowns.push(bif.description);
		}

		//iter breakdown selections, pick qc spec when only one option remains, fill rest of selected breakdowns
		//find depth upto breakdowns match with last qc
		//prune selection to that depth

		rootAttributes = attributeLabels[rootType][selectedQcRootId];

		handleStore(`qc-builds/${selectedQcSpecId}/${rootId}`, (obj: WeightedNode) => {
			[completeTree, selectionState, currentQcSpec] = [
				obj,
				pruneTree(selectionState, breakdownMatchLevel),
				fullQcSpecs[selectedQcSpecId]
			];
		});
	}
	function updateLevelSpecs(
		tree: TreeInfo,
		svgD1: number,
		expandedControlInd: number | undefined,
		breakdownOptions: BreakdownOptions,
		selectedBreakdowns: SelectedBreakdowns
	) {
		if (selectedBreakdowns.length == 0) return;
		let visibleLevelCount = 1;
		for (let meta of (tree.meta || []).slice(2)) {
			if (meta.totalNodes > 0) visibleLevelCount++;
		}
		let currentOptions = breakdownOptions;
		let topOffset = 0;
		const stepSize =
			expandedControlInd === undefined ? svgD1 / visibleLevelCount : svgD1 / visibleLevelCount / 2;
		for (let i = 0; i < MAX_LEVEL_COUNT; i++) {
			levelOutSpecs[i].totalSize = expandedControlInd == i ? svgD1 / 2 + stepSize : stepSize;
			levelOutSpecs[i].topOffset = topOffset;
			levelOutSpecs[i].levelOptions = Object.keys(currentOptions);
			levelOutSpecs[i].isVisible = i < visibleLevelCount;
			topOffset += levelOutSpecs[i].totalSize;
			if (i == visibleLevelCount - 1) topOffset += svgD1 / 2;
			currentOptions = currentOptions[selectedBreakdowns[i]]?.children || {};
		}
	}

	function selectNode(path: PathInTree) {
		//console.log(commLog.join(';'));
		const leafId = path[path.length - 1];
		let parentToChange = getNodeByPath(path.slice(0, path.length - 1), selectionState);
		if (parentToChange?.children === undefined) {
			return;
		}
		let isSelected = Object.keys(parentToChange.children).includes(leafId);
		if (isSelected) {
			delete parentToChange.children[leafId];
			selectedPath = getSomePath(selectionState);
		} else {
			selectedPath = path;
			parentToChange.children[leafId] = {
				children: parentToChange.children[leafId]?.children || {}
			};
		}
		selectionState = selectionState;
	}

	function handleInteraction(event: CustomEvent<TreeInteractionEvent>) {
		const path = event.detail.path;
		const action = event.detail.action;
		if (action == 'highlight') {
			highlightedPath = path;
			//[hoverLocation, highlightedPath] = [event.detail.topLeftCorner, path];
			return;
		} else if (action == 'de-highlight') {
			highlightedPath = [];
			return;
		}
		selectNode(path);
	}

	function getStyleMaker(d1Parser: (n: number) => number, d2Parser: (n: number) => number) {
		return (d1Obj: object, d2Obj: object) => {
			return [
				[d1Obj || {}, d1Parser],
				[d2Obj || {}, d2Parser]
			]
				.map(([dObj, dParser]) =>
					Object.entries(dObj)
						.map(([k, v]) => `${k}: ${dParser(v)}px;`)
						.join('')
				)
				.join('');
		};
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />
{#if !Object.values(svgShape).includes(NaN) && !Object.values(svgShape).includes(undefined)}
	<svg
		viewBox="{svgShape.x} {svgShape.y} {svgShape.width} {svgShape.height}"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect id="header-bg" fill-opacity={0.3} {...headBarShape} />

		<QuercusBranches
			qcSpec={currentQcSpec}
			branchReachBack={svgD1 * headerRate}
			d2Offset={d2Offset + sideBarD2}
			{rootD2}
			{attributeLabels}
			{visibleTreeInfo}
			{selectionState}
			{levelOutSpecs}
			treeD2={svgD2 - sideBarD2}
			treeD2Offset={sideBarD2}
			{childD1Rate}
			{overHangRate}
			childBaseSize={minimumChildWidth}
			on:ti={handleInteraction}
		/>
		<rect id="qc-header" {...headerShape} />

		<BrokenFittedText
			height={headerShape.height * 0.8}
			width={headerShape.width * 0.8}
			text={rootAttributes?.name || ''}
			anchor={'middle'}
			bottomAligned={false}
			x={headerShape.x + headerShape.width / 2}
			y={headerShape.y + headerShape.height * 0.9}
			allowRotation={false}
		/>
	</svg>

	<div
		class="floater head-sentence"
		style="top: 0px;{dBasedStyle({ left: 20, width: 60 }, { height: d1PadSize })}"
	>
		<p>Papers authored by scholars at</p>
	</div>

	<div
		class="floater"
		style={dBasedStyle({ top: d1PadSize + headerShape.height * 0.4 }, { left: 3 })}
	>
		<NumberSlider
			bind:value={globalControlShowN}
			min={1}
			max={maxOnOneLevel}
			width={d1ToPixels(d2Offset) * 0.6}
			sliderHeight={d1ToPixels(headerShape.height * 0.2)}
		/>
	</div>
	{#each levelOutSpecs || [] as levelSpec, index}
		<MidpathBar
			{index}
			{levelSpec}
			bind:selectedBreakdowns
			totalD1Offset={headerShape.height + d1PadSize}
			{dBasedStyle}
		/>
	{/each}
	{#if showHoverInfo && highlightedPath.length > 0}
		<div
			transition:fade={{ duration: 200 }}
			id="hover-info"
			style={dBasedStyle({ top: d1PadSize }, { right: 2, width: 30 })}
		>
			<PathLevelInfoBox
				path={highlightedPath}
				weightedRoot={completeTree}
				{specBaselineOptions}
				{attributeLabels}
				qcSpec={currentQcSpec}
				rootId={selectedQcRootId}
			/>
		</div>
	{/if}
{/if}

<style>
	#qc-header {
		stroke: var(--color-theme-darkgrey);
		stroke-width: 0.06;
		filter: drop-shadow(0.2px 0.2px 0.8px rgb(0 0 0 / 0.8));
		fill: var(--color-theme-white);
		opacity: 0.5;
	}

	#header-bg {
		fill: var(--color-theme-darkgrey);
	}

	#hover-info {
		position: fixed;
		transition: all 500ms;
		background-color: var(--color-theme-white);
		border: solid 2px var(--color-theme-darkgrey);
		border-radius: 10px;
		filter: drop-shadow(0.2px 0.2px 0.5px rgb(0 0 0 / 0.7));
		pointer-events: none;
	}

	.head-sentence {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.head-sentence > p {
		font-size: 1.8rem;
	}

	.floater {
		position: fixed;
	}

	svg {
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
	}
</style>
