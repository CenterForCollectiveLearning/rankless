<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';

	import type {
		TreeInteractionEvent,
		QcSpecMap,
		QcSpec,
		SelectionOption,
		AttributeLabels,
		BareNode,
		ControlSpec,
		PathInTree,
		WeightedNode,
		OMap,
		SpecBaseOptions
	} from '$lib/tree-types';
	import {
		getNodeByPath,
		getLevelVisuals,
		DEFAULT_CONTROL_SPEC,
		deriveVisibleTree,
		getSomePath
	} from '$lib/tree-functions';

	import QuercusBranches from '$lib/components/QuercusBranches.svelte';
	import PathLevelInfoBox from '$lib/components/PathLevelInfoBox.svelte';
	import ControlInterface from '$lib/components/ControlInterface.svelte';
	import BrokenFittedText from '$lib/components/BrokenFittedText.svelte';
	import { fade } from 'svelte/transition';
	import { handleStore, mainPreload } from '$lib/tree-loading';
	import { flipIf } from '$lib/visual-util';

	const COMMS: OMap<(s: string) => void> = {
		ce: (e) => expandControlLevel(parseInt(e)),
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
	let sideBarD2 = 17;
	let childD1Rate = defaultChildD1Rate;

	let overHangRate = 0.05;
	$: d1PadRate = isWideScreen ? 0.03 : 0;
	$: headerRate = isWideScreen ? 0.12 : 0.02;
	let occupyRate = 0.85;

	let minimumChildWidth = 2.5;

	let showHoverInfo = true;

	let hoverHeight = 12.5;
	let hoverWidth = 40;

	let foreignScales = 0.05;

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

	let fullQcSpecs: QcSpecMap = {};
	let specOptions: SelectionOption[] = [];
	let selectedQcSpecId: string;
	let currentQcSpec: QcSpec;

	let specBaselineOptions: SpecBaseOptions = {};

	let qcRootOptions: SelectionOption[];
	let selectedQcRootOption: SelectionOption;

	let attributeLabels: AttributeLabels = {};

	let controlSpecs: ControlSpec[] = [DEFAULT_CONTROL_SPEC];
	let completeTree: WeightedNode = { weight: 1 };
	let selectionState: BareNode = { children: {} };

	let hoverLocation = { x: 0, y: 0 };

	$: loadNewQc(selectedQcSpecId, selectedQcRootOption?.id);

	const toSelOpt = (entry: [string, QcSpec]) => ({ id: entry[0], name: entry[1].title });

	onMount(() => {
		handleStore('root-descriptions', (jsv: OMap<SelectionOption[]>) => {
			qcRootOptions = jsv[$page.params.rootType];
			selectedQcRootOption = qcRootOptions.filter((x) => x.id == $page.params.rootId)[0];
		});

		mainPreload().then(([aLabels, allQcSpecs, baseOptions]) => {
			Object.entries(allQcSpecs).map(([k, v]) => {
				if (v.root_entity_type == $page.params.rootType) {
					fullQcSpecs[k] = v;
				}
			});
			specOptions = Object.entries(fullQcSpecs).map(toSelOpt);
			selectedQcSpecId = specOptions[0].id;

			if (aLabels != undefined) {
				attributeLabels = aLabels;
			}
			specBaselineOptions = baseOptions;

			runEventSequence($page.url.searchParams.get('e') || '');
		});
	});

	afterNavigate(() => {
		if (selectedQcRootOption?.id != $page?.params.rootId) {
			selectedQcRootOption = qcRootOptions?.filter((x) => x.id == $page.params.rootId)[0];
		}
	});

	function loadNewQc(specId: string | undefined, rootId: string | undefined) {
		if (specId == null || rootId == null) {
			return;
		}

		// goto(`${base}/view/${rootId}${$page.url.search}`);
		handleStore(`qc-builds/${specId}/${rootId}`, (obj: WeightedNode) => {
			[completeTree, selectionState, currentQcSpec, controlSpecs] = [
				obj,
				{ children: {} },
				fullQcSpecs[selectedQcSpecId],
				getEmptyLevelSpecs(specId, rootId)
			];
		});
	}

	function getHighlightedBoxBase(
		highlightedPath: PathInTree,
		showHoverInfo: boolean,
		hoverLocation: { x: number; y: number }
	) {
		return showHoverInfo && highlightedPath.length > 0
			? { node: getNodeByPath(highlightedPath, visibleTreeInfo.tree), position: hoverLocation }
			: undefined;
	}
	function formatFilter(s: string, pcRootId: any) {
		let regexp = new RegExp('\\{pc_id\\}', 'gi');
		return s.replace(regexp, pcRootId);
	}
	function getEmptyLevelSpecs(specId: string, pcRootId: string) {
		const out = [];
		for (var bf of fullQcSpecs[specId].bifurcations) {
			out.push({
				...DEFAULT_CONTROL_SPEC,
				...JSON.parse(formatFilter(bf.control_format_str, pcRootId))
			});
		}
		return out;
	}

	$: visibleTreeInfo = deriveVisibleTree(
		selectedQcRootOption?.id,
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
		expandControlInd
	);

	$: highlightedBoxBase = getHighlightedBoxBase(highlightedPath, showHoverInfo, hoverLocation);

	function expandControlLevel(ind: number) {
		if (ind == expandControlInd) {
			expandControlInd = undefined;
			childD1Rate = defaultChildD1Rate;
		} else {
			expandControlInd = ind;
			childD1Rate = 0.5;
		}
	}

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
			[hoverLocation, highlightedPath] = [event.detail.topLeftCorner, path];
			return;
		} else if (action == 'de-highlight') {
			highlightedPath = [];
			return;
		}
		selectNode(path);
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svg
	viewBox="{sizes.svg.x} {sizes.svg.y} {sizes.svg.width} {sizes.svg.height}"
	xmlns="http://www.w3.org/2000/svg"
>
	{#if isWideScreen}
		<rect id="header-bg" fill-opacity={0.3} {...sizes.headBar} />
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
			bind:expandedIndex={expandControlInd}
			{attributeLabels}
			bind:controlSpecs
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
	{#if highlightedBoxBase != undefined}
		<g
			transition:fade={{ duration: 100 }}
			style="--x-off:{highlightedBoxBase.position.x - hoverWidth}px; --y-off:{highlightedBoxBase
				.position.y - hoverHeight}px"
		>
			<rect
				id="hover-rect"
				height={hoverHeight}
				width={hoverWidth}
				fill="var(--color-theme-white)"
				fill-opacity="0.85"
				stroke="black"
				stroke-width="0.1px"
				rx="0.2"
			/>
			<foreignObject
				height={hoverHeight / foreignScales}
				width={hoverWidth / foreignScales}
				transform="scale({foreignScales},{foreignScales})"
			>
				<PathLevelInfoBox
					path={highlightedPath}
					weightedRoot={completeTree}
					{specBaselineOptions}
					{attributeLabels}
					qcSpec={currentQcSpec}
					rootId={selectedQcRootOption?.id}
				/>
			</foreignObject>
		</g>
	{/if}
	{#if isWideScreen}
		<BrokenFittedText
			height={sizes.header.height * 0.8}
			width={sizes.header.width * 0.8}
			text={selectedQcRootOption?.name || ''}
			anchor={'middle'}
			x={sizes.header.x + sizes.header.width / 2}
			y={sizes.header.y + sizes.header.height * 0.9}
			allowRotation={false}
		/>
	{/if}
</svg>

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

	svg {
		width: 100%;
		height: 98%;
	}
</style>
