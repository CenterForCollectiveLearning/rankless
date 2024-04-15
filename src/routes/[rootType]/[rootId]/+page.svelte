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
		ControlSpec,
		PathInTree,
		WeightedNode,
		OMap,
		SpecBaseOptions,
		BreakdownOptions,
		SelectedBreakdowns
	} from '$lib/tree-types';
	import {
		getNodeByPath,
		getLevelVisuals,
		DEFAULT_CONTROL_SPEC,
		deriveVisibleTree,
		getSomePath,
		pruneTree
	} from '$lib/tree-functions';

	import QuercusBranches from '$lib/components/QuercusBranches.svelte';
	import PathLevelInfoBox from '$lib/components/PathLevelInfoBox.svelte';
	import ControlInterface from '$lib/components/ControlInterface.svelte';
	import BrokenFittedText from '$lib/components/BrokenFittedText.svelte';
	import { fade } from 'svelte/transition';
	import { handleStore, mainPreload } from '$lib/tree-loading';
	import { flipIf } from '$lib/visual-util';
	import { MAX_LEVEL_COUNT } from '$lib/constants';
	import NumberSlider from '$lib/components/NumberSlider.svelte';

	const COMMS: OMap<(s: string) => void> = {
		//ce: (e) => expandControlLevel(parseInt(e)),
		se: (e) => selectNode(e.split('-')),
		sp: (e) => {
			const i = parseInt(e);
			if (i < controlSpecs.length) {
				controlSpecs[i].size_base = 'specialization';
			}
		},
		qc: (e) => {
			if (Object.keys(fullQcSpecs).includes(e)) {
				selectedQcSpecId = e;
			}
		},
		mi: (e) => {
			const i = parseInt(e.slice(0, 1));
			if (i < controlSpecs.length) {
				controlSpecs[i].include = e.slice(1).split(',');
			}
		}
	};

	async function runEventSequence(evSeqString: string) {
		if (evSeqString.length == 0) return;
		for (const evDesc of evSeqString.split(';')) {
			const evKey = evDesc.slice(0, 2);
			const evParams = evDesc.slice(2);
			// console.log('parsed comm', evKey, evParams);
			if (evKey == 'sl') {
				await new Promise((r) => setTimeout(r, parseFloat(evParams) * 1000));
			} else {
				const comm = COMMS[evKey];
				if (comm != undefined) {
					comm(evParams);
				}
			}
		}
	}

	let commLog: string[] = [];

	let highlightedPath: PathInTree = [];
	let selectedPath: PathInTree = [];
	let expandControlInd: number | undefined;

	let innerHeight: number;
	let innerWidth: number;
	$: isWideScreen = innerHeight < innerWidth * 1.2;

	let defaultChildD1Rate = 0.3;

	let svgD2 = 100;
	let rootD2 = 25;
	let d2Offset = 19;
	// $: sideBarD2 = expandControlInd == undefined ? 17 : 29;
	let sideBarD2 = 17;
	$: childD1Rate = expandControlInd == undefined ? defaultChildD1Rate : 0.7;

	let overHangRate = 0.05;
	$: d1PadRate = isWideScreen ? 0.03 : 0;
	$: headerRate = isWideScreen ? 0.12 : 0.02;
	let occupyRate = 0.85;

	let minimumChildWidth = 2.5;
	let showHoverInfo = true;
	let foreignScales = 0.07;

	function getSizes(isWideScreen: boolean, innerWidth: number, innerHeight: number) {
		let svgD1;

		if (isWideScreen) {
			svgD1 = ((innerHeight - 70) / innerWidth) * svgD2;
		} else {
			svgD1 = (innerWidth / (innerHeight - 70)) * svgD2;
		}

		let header = flipIf(
			{
				height: svgD1 * headerRate,
				width: rootD2,
				x: d2Offset + sideBarD2,
				y: -svgD1 * headerRate
			},
			!isWideScreen
		);

		let headBar = {
			x: -svgD2 * 0.5,
			y: -svgD1 * headerRate,
			height: svgD1 * headerRate,
			width: 2 * svgD2
		};
		let svg = flipIf(
			{
				height: svgD1,
				width: svgD2,
				x: 0,
				y: -(headerRate + d1PadRate) * svgD1
			},
			!isWideScreen
		);

		return { svgD1, svg, header, headBar };
	}

	$: sizes = getSizes(isWideScreen, innerWidth, innerHeight);
	$: hoverShape = flipIf(
		{
			x: svgD2 - 35,
			y: -headerRate * 0.9 * sizes.svgD1,
			width: 30,
			height: sizes.svgD1 * 0.32
		},
		!isWideScreen
	);

	let fullQcSpecs: QcSpecMap = {};
	let currentQcSpec: QcSpec;

	let specBaselineOptions: SpecBaseOptions = {};

	let selectedQcRootId: string;
	let selectedQcSpecId: string;
	let rootType: string;

	let attributeLabels: AttributeLabels = {};

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
	$: loadNewQc(selectedBreakdowns, selectedQcRootId, attributeLabels);
	$: alignToGlobalShown(globalControlShowN);

	onMount(() => {
		mainPreload().then(([aLabels, allQcSpecs, baseOptions]) => {
			Object.entries(allQcSpecs || {}).map(([k, v]) => {
				if (v.root_entity_type == $page.params.rootType) {
					fullQcSpecs[k] = v;
					let boObj = breakdownOptions;
					for (let bif of v.bifurcations) {
						const bDef = bif.description;
						if (!(bDef in boObj)) {
							boObj[bDef] = { children: {}, qcSpecs: [] };
						}
						boObj[bDef].qcSpecs.push(k);
						boObj = boObj[bDef].children;
					}
				}
			});

			specBaselineOptions = baseOptions;
			let defaultQcSpec = Object.values(fullQcSpecs)[2];
			for (let i = 0; i < MAX_LEVEL_COUNT; i++) {
				selectedBreakdowns.push(defaultQcSpec.bifurcations[i]?.description || '');
			}
			[attributeLabels, selectedBreakdowns, selectedQcRootId] = [
				aLabels || {},
				selectedBreakdowns,
				$page.params.rootId
			];
			rootType = $page.params.rootType;
			runEventSequence($page.url.searchParams.get('e') || '');
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
		selectedQcSpecId = bdLevel?.qcSpecs[0];

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

	$: visibleTreeInfo = deriveVisibleTree(
		selectedQcRootId,
		completeTree,
		controlSpecs,
		selectionState,
		attributeLabels,
		currentQcSpec,
		specBaselineOptions
	);
	$: levelVisuals = getLevelVisuals(
		visibleTreeInfo,
		sizes.svgD1 * (1 - headerRate) * occupyRate,
		expandControlInd,
		breakdownOptions,
		selectedBreakdowns
	);

	function selectNode(path: PathInTree) {
		commLog.push(`se${path.join('-')}`);
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
</script>

<svelte:window bind:innerWidth bind:innerHeight />
{#if innerHeight != undefined && innerHeight != undefined}
	<svg
		viewBox="{sizes.svg.x} {sizes.svg.y} {sizes.svg.width} {sizes.svg.height}"
		xmlns="http://www.w3.org/2000/svg"
	>
		{#if isWideScreen}
			<rect id="header-bg" fill-opacity={0.3} {...sizes.headBar} />
			<foreignObject
				x="10"
				y={(-sizes.header.height / 1.25) * (1 / 0.07)}
				height="200"
				width="400"
				style="transform: matrix({0.07}, 0, 0, {0.07}, 0, 0)"
			>
				<NumberSlider bind:value={globalControlShowN} min={1} max={maxOnOneLevel} width={320} />
			</foreignObject>
		{/if}
		<rect id="qc-header" {...sizes.header} />

		{#each levelVisuals || [] as lVis, index}
			<ControlInterface
				{lVis}
				{index}
				{childD1Rate}
				{overHangRate}
				{sideBarD2}
				{svgD2}
				{isWideScreen}
				{currentQcSpec}
				{attributeLabels}
				{maxOnOneLevel}
				bind:expandedIndex={expandControlInd}
				bind:controlSpecs
				bind:selectedBreakdowns
			/>
		{/each}

		<QuercusBranches
			qcSpec={currentQcSpec}
			branchReachBack={sizes.svgD1 * headerRate}
			d2Offset={d2Offset + sideBarD2}
			{rootD2}
			{attributeLabels}
			{visibleTreeInfo}
			{selectionState}
			{levelVisuals}
			treeD2={svgD2 - sideBarD2 - 2}
			treeD2Offset={sideBarD2 + 2}
			{childD1Rate}
			{overHangRate}
			childBaseSize={minimumChildWidth}
			on:ti={handleInteraction}
			{isWideScreen}
		/>
		{#if showHoverInfo && highlightedPath.length > 0}
			<g
				transition:fade={{ duration: 100 }}
				style="--x-off:{hoverShape.x}px; --y-off:{hoverShape.y}px"
				id="hover-g"
			>
				<rect
					id="hover-rect"
					height={hoverShape.height}
					width={hoverShape.width}
					fill="var(--color-theme-white)"
					fill-opacity="0.85"
					stroke="black"
					stroke-width="0.1px"
					rx="0.2"
				/>
				<foreignObject
					height={hoverShape.height / foreignScales}
					width={hoverShape.width / foreignScales}
					transform="scale({foreignScales},{foreignScales})"
				>
					<PathLevelInfoBox
						path={highlightedPath}
						weightedRoot={completeTree}
						{specBaselineOptions}
						{attributeLabels}
						{isWideScreen}
						qcSpec={currentQcSpec}
						rootId={selectedQcRootId}
					/>
				</foreignObject>
			</g>
		{/if}
		{#if isWideScreen}
			<BrokenFittedText
				height={sizes.header.height * 0.8}
				width={sizes.header.width * 0.8}
				text={rootAttributes?.name || ''}
				anchor={'middle'}
				x={sizes.header.x + sizes.header.width / 2}
				y={sizes.header.y + sizes.header.height * 0.9}
				allowRotation={false}
			/>
		{/if}
	</svg>
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

	#hover-rect {
		filter: drop-shadow(0.2px 0.2px 0.5px rgb(0 0 0 / 0.7));
	}

	#hover-g {
		pointer-events: none;
	}

	svg {
		width: 100%;
		height: 98%;
	}
</style>
