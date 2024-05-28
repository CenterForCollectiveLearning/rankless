<script lang="ts">
	import { fade } from 'svelte/transition';
	import { handleStore } from '$lib/tree-loading';

	import type * as tt from '$lib/tree-types';
	import * as tf from '$lib/tree-functions';
	import { formatNumber } from '$lib/text-format-util';
	import { MAX_LEVEL_COUNT } from '$lib/constants';

	import QuercusBranches from '$lib/components/QuercusBranches.svelte';
	import PathLevelInfoBox from '$lib/components/PathLevelInfoBox.svelte';
	import BrokenFittedText from '$lib/components/BrokenFittedText.svelte';
	import NumberSlider from '$lib/components/NumberSlider.svelte';
	import MidpathBar from '$lib/components/MidpathBar.svelte';
	import HeadControl from './HeadControl.svelte';

	const COMPLETE_YEAR = 2004;
	const POSSIBLE_YEAR_FILTERS = [2004, 2019, 2020, 2021, 2022, 2023];

	export let defaultQcSpecId: string | undefined;
	export let selectedQcRootId: string;
	export let rootType: string;
	export let attributeLabels: tt.AttributeLabels;
	export let fullQcSpecs: tt.QcSpecMap;
	export let removeHighlightUnhover = true;
	export let startSentence = 'Scholars at';
	export let specFilterYear = 2004;

	let selectedQcSpecId: string;
	let currentQcSpec: tt.QcSpec;

	let highlightedPath: tt.PathInTree = [];
	let selectedPath: tt.PathInTree = [];
	let expandControlInd: number | undefined;

	let innerHeight: number;
	let innerWidth: number;

	let defaultChildD1Rate = 0.3;

	let svgD2 = 100;
	let rootD2 = 25;
	let d2Offset = (svgD2 - rootD2) / 2.5;
	let sideBarD2 = 0;
	let controlPad = 3;

	let d1TopPadRate = 9;
	let d1BottomPadRate = 20;
	let headerRate = 11;
	let overHangRate = 0.05;

	let minimumChildWidth = 2.5;
	let showHoverInfo = true;
	let showSpecInfoHover = false;
	let showFilterHover = false;

	let levelOutSpecs: tt.LevelOutSpec[] = Array(MAX_LEVEL_COUNT)
		.fill(0)
		.map(() => {
			return {
				totalSize: 0,
				topOffset: 0,
				levelOptions: [],
				isVisible: false
			};
		});
	let controlSpecs: tt.ControlSpec[] = Array(MAX_LEVEL_COUNT)
		.fill(0)
		.map(() => {
			return { ...tf.DEFAULT_CONTROL_SPEC };
		});
	let maxOnOneLevel = 15;
	let globalControlShowN = tf.DEFAULT_CONTROL_SPEC.limit_n;
	let isGlobalSpecialization = true;
	let completeTree: tt.WeightedNode = { weight: 1, source_count: 1 };
	let selectionState: tt.BareNode = { children: {} };

	let rootAttributes: tt.AttributeLabel;

	let selectedBreakdowns = getDefaultBreakdowns(defaultQcSpecId, fullQcSpecs);

	$: filterSet = specFilterYear == COMPLETE_YEAR ? 'all' : `y-${specFilterYear}`;

	$: breakdownOptions = getBreakdownOptions(fullQcSpecs, rootType);
	$: childD1Rate = expandControlInd == undefined ? defaultChildD1Rate : 0.7;
	$: svgD1 = (innerHeight / innerWidth) * svgD2;
	$: d1ToPixels = (d1: number) => (d1 * innerHeight) / svgD1;
	$: d2ToPixels = (d2: number) => (d2 * innerWidth) / svgD2;
	$: dBasedStyle = getStyleMaker(d1ToPixels, d2ToPixels);
	$: d1PadSize = (d1TopPadRate * svgD1) / 100;

	$: headerShape = {
		height: (svgD1 * headerRate) / 100,
		width: rootD2,
		x: d2Offset + sideBarD2,
		y: (-svgD1 * headerRate) / 100
	};
	$: svgShape = {
		height: svgD1,
		width: svgD2,
		x: 0,
		y: (-(headerRate + d1TopPadRate) * svgD1) / 100
	};

	$: loadNewQc(selectedBreakdowns, selectedQcRootId, attributeLabels, filterSet);
	$: alignToGlobalShown(globalControlShowN);

	$: alignToGlobalControlSpec(isGlobalSpecialization);

	$: visibleTreeInfo = tf.deriveVisibleTree(
		completeTree,
		controlSpecs,
		selectionState,
		attributeLabels,
		currentQcSpec
	);

	$: updateLevelSpecs(
		visibleTreeInfo,
		svgD1 * (1 - (headerRate + d1BottomPadRate) / 100),
		expandControlInd,
		breakdownOptions,
		selectedBreakdowns
	);

	function getDefaultBreakdowns(qcId: string | undefined, qcOptions: tt.QcSpecMap) {
		if (qcId == undefined) {
			return [];
		}
		const out: tt.SelectedBreakdowns = [];
		const defaultQcSpec = qcOptions[qcId];
		for (let i = 0; i < MAX_LEVEL_COUNT; i++) {
			out.push(defaultQcSpec.bifurcations[i]?.description || '');
		}
		return out;
	}
	function getBreakdownOptions(allQcSpecs: tt.QcSpecMap, rootType: string) {
		let out: tt.BreakdownOptions = {};
		for (let [k, v] of Object.entries(allQcSpecs)) {
			if (v.root_entity_type == rootType) {
				fullQcSpecs[k] = v;
				let boObj = out;
				for (let bif of v.bifurcations) {
					const bDef = bif.description;
					if (!(bDef in boObj)) {
						boObj[bDef] = { children: {}, qcSpecs: [] };
					}
					boObj[bDef].qcSpecs.push(k);
					boObj = boObj[bDef].children;
				}
			}
		}
		return out;
	}
	function alignToGlobalShown(shown: number) {
		for (let i in controlSpecs) {
			controlSpecs[i].limit_n = shown;
		}
	}
	function alignToGlobalControlSpec(isSpec: boolean) {
		for (let i in controlSpecs) {
			controlSpecs[i].size_base = isSpec ? 'specialization' : 'volume';
		}
	}
	function loadNewQc(
		selectedBreakdowns: tt.SelectedBreakdowns,
		rootId: string | undefined,
		attributeLabels: tt.AttributeLabels,
		filterSet: string
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

		for (let i = breakdownMatchLevel; i < controlSpecs.length; i++) {
			controlSpecs[i].include = [];
		}

		rootAttributes = attributeLabels[rootType][selectedQcRootId];
		handleStore(`qc-builds/${filterSet}/${selectedQcSpecId}/${rootId}`, (obj: tt.WeightedNode) => {
			[completeTree, selectionState, currentQcSpec] = [
				obj,
				tf.intersectionTree(tf.pruneTree(selectionState, breakdownMatchLevel), obj),
				fullQcSpecs[selectedQcSpecId]
			];
		});
	}
	function updateLevelSpecs(
		tree: tt.TreeInfo,
		svgD1: number,
		expandedControlInd: number | undefined,
		breakdownOptions: tt.BreakdownOptions,
		selectedBreakdowns: tt.SelectedBreakdowns
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
	function selectNode(path: tt.PathInTree) {
		//console.log(commLog.join(';'));
		const leafId = path[path.length - 1];
		let parentToChange = tf.getNodeByPath(path.slice(0, path.length - 1), selectionState);
		if (parentToChange?.children === undefined) {
			return;
		}
		let isSelected = Object.keys(parentToChange.children).includes(leafId);
		if (isSelected) {
			delete parentToChange.children[leafId];
			selectedPath = tf.getSomePath(selectionState);
		} else {
			selectedPath = path;
			parentToChange.children[leafId] = {
				children: parentToChange.children[leafId]?.children || {}
			};
		}
		selectionState = selectionState;
	}
	function handleInteraction(event: CustomEvent<tt.TreeInteractionEvent>) {
		const path = event.detail.path;
		const action = event.detail.action;
		if (action == 'highlight') {
			highlightedPath = path;
			return;
		} else if (action == 'de-highlight') {
			if (removeHighlightUnhover) {
				highlightedPath = [];
			}
			return;
		}
		selectNode(path);
	}
	function getStyleMaker(d1Parser: (n: number) => number, d2Parser: (n: number) => number) {
		return (d1Obj: object, d2Obj: object, d1RateObj: object) => {
			return [
				[d1Obj || {}, d1Parser, 'px'],
				[d2Obj || {}, d2Parser, 'px'],
				[d1RateObj || {}, (x: number) => x, 'svh']
			]
				.map(([dObj, dParser, suffix]) =>
					Object.entries(dObj)
						.map(([k, v]) => `${k}: ${dParser(v)}${suffix};`)
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
		<QuercusBranches
			qcSpec={currentQcSpec}
			branchReachBack={(svgD1 * headerRate) / 100}
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
		<rect id="qc-header" {...headerShape} rx="0.4" />

		<BrokenFittedText
			height={headerShape.height * 0.7}
			width={headerShape.width * 0.8}
			text={rootAttributes?.name || ''}
			anchor={'middle'}
			bottomAligned={false}
			x={headerShape.x + headerShape.width / 2}
			y={headerShape.y + headerShape.height * 0.75}
			allowRotation={false}
		/>
	</svg>

	<div
		class="floater sentence-container"
		style={dBasedStyle({ top: 0 }, { left: 20, width: 60 }, { height: d1TopPadRate })}
	>
		<p id="sentence-starter">{startSentence}</p>
	</div>

	<div
		class="floater sentence-container"
		style={dBasedStyle(
			{},
			{ left: headerShape.x - headerShape.width / 2, width: headerShape.width * 2 },
			{ height: headerRate * 0.15, top: headerRate * 0.85 + d1TopPadRate }
		)}
	>
		<p id="num-stat-subtitle">
			({formatNumber(completeTree.source_count || 0, 0)} papers, {formatNumber(
				completeTree.weight || 0,
				0
			)} citations)
		</p>
	</div>

	<div
		class="floater"
		style={dBasedStyle(
			{ top: d1PadSize + headerShape.height * 0.5, height: 0 },
			{ left: controlPad, width: d2Offset * 0.82 },
			{}
		)}
	>
		<NumberSlider bind:value={globalControlShowN} min={1} max={maxOnOneLevel} />
	</div>
	<div
		class="floater"
		id="right-control"
		style={dBasedStyle(
			{ top: d1PadSize, height: headerShape.height },
			{ right: controlPad, width: 100 - headerShape.width - d2Offset - controlPad - controlPad },
			{}
		)}
	>
		<HeadControl bind:hoverToggle={showSpecInfoHover} bind:checked={isGlobalSpecialization}
			>Specialization
		</HeadControl>
		<HeadControl
			bind:hoverToggle={showFilterHover}
			interactText={false}
			checked={false}
			checkBox={false}
			>Since
			<select bind:value={specFilterYear}
				>{#each POSSIBLE_YEAR_FILTERS as y}
					<option>{y}</option>
				{/each}
			</select>
		</HeadControl>
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
			class="hoverover"
			style={dBasedStyle({}, { right: 2, width: 96 }, { bottom: 1, height: d1BottomPadRate / 2 })}
		>
			<PathLevelInfoBox
				path={highlightedPath}
				weightedRoot={completeTree}
				{attributeLabels}
				qcSpec={currentQcSpec}
				rootId={selectedQcRootId}
			/>
		</div>
	{/if}
	{#if showSpecInfoHover}
		<div
			class="floater hoverover"
			id="spec-hover"
			style={dBasedStyle(
				{ top: d1PadSize + headerShape.height },
				{ left: d2Offset + headerShape.width * 0.2, width: headerShape.width * 1.6 },
				{}
			)}
		>
			Specialization is calculated using the expected prevelance of a country, source, or concept,
			and comparing it to the one present in the current breakdown flow. If it is switched off, the
			sheer volume of citations is considered.
		</div>
	{/if}
	{#if showFilterHover}
		<div
			class="floater hoverover"
			id="spec-hover"
			style={dBasedStyle(
				{ top: d1PadSize + headerShape.height * 1.1 },
				{
					left: d2Offset + headerShape.width * 0.2,
					width: headerShape.width * 1.6
				},
				{}
			)}
		>
			Filter the underlying dataset to papers published in or after {specFilterYear}.
		</div>
	{/if}
{/if}

<style>
	#qc-header {
		fill: #ffffff90;
	}

	#header-bg {
		fill: var(--color-theme-darkgrey);
	}

	#right-control {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
	}

	#spec-hover {
		padding: 12px;
		font-size: 0.9rem;
	}

	#sentence-starter {
		font-size: min(1.5rem, 3.3vw);
		text-align: center;
	}

	#num-stat-subtitle {
		font-size: min(min(1.1rem, 1.9vw), 1.8svh);
		text-align: center;
	}

	.hoverover {
		position: fixed;
		transition: all 500ms;
		background-color: #ffffff;
		border: solid 1px var(--color-theme-darkblue);
		border-radius: 10px;
		box-shadow: 0 0 5px 5px var(--color-theme-lightblue);
		z-index: 13;
	}

	.sentence-container {
		display: flex;
		justify-content: center;
		align-items: center;
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
