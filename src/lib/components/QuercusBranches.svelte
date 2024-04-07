<script lang="ts">
	import { fade } from 'svelte/transition';
	import type {
		EmbeddedNode,
		TreeInfo,
		OffsetInfo,
		LevelVisual,
		AttributeLabels,
		QcSpec,
		BareNode
	} from '$lib/tree-types';
	import { getNodeByPath } from '$lib/tree-functions';
	import BrokenFittedText from './BrokenFittedText.svelte';
	import { getColor } from '$lib/style-util';
	import { getDispatch, treeInteract } from '$lib/tree-events';
	import { flipIf, getHorizolntalSankeyPath, getSankeyPath } from '$lib/visual-util';

	export let qcSpec: QcSpec;
	export let attributeLabels: AttributeLabels;
	export let visibleTreeInfo: TreeInfo;
	export let selectionState: BareNode;
	export let levelVisuals: LevelVisual = [];
	export let pathInCompleteTree: string[] = [];

	//export let treeVizKind: TreeVizKind = 'verticalRectangle';

	export let isWideScreen: boolean;
	export let branchReachBack = 0;
	export let rootD2 = 30;
	export let treeD2 = 70;
	export let childD1Rate = 0.2;
	export let overHangRate = 0.05;
	export let preStraightRate = 0.05;
	export let treeD2Offset = 0;

	export let childBaseSize = 2.9;

	export let linkSurfaceRate = 0.8;
	export let childrenInternalMargin = 0.9;

	export let parentSideMargin = 0.8;
	//export let childSideMargin = 3.8; TODO

	//only internally passed
	export let d2Offset = (treeD2 - rootD2) / 2 + treeD2Offset;

	const dispatch = getDispatch();
	const defO = (n: number | undefined) => (n === undefined ? 0 : n);

	$: onLevel = pathInCompleteTree.length;
	$: childLevel = onLevel + 1;

	$: visibleNode = getNodeByPath(pathInCompleteTree, visibleTreeInfo.tree);
	$: nChildren = Object.keys(visibleNode?.children || {}).length;

	$: currentLevelViz = levelVisuals[onLevel];
	$: nChildLevelNodes = visibleTreeInfo.meta[childLevel]?.totalNodes || 0;

	$: d1Offset = defO(currentLevelViz?.topOffset);
	$: [pathLength, childD1, preStraightSize, overHangSize] = [
		1 - childD1Rate - preStraightRate - overHangRate,
		childD1Rate,
		preStraightRate,
		overHangRate
	].map((x) => defO(currentLevelViz?.totalSize * x));
	$: pD1Start = d1Offset + preStraightSize;
	$: branchD1End = pD1Start + pathLength;
	$: childrenD1Offset = branchD1End + childD1;
	$: downWardStart = branchReachBack + preStraightSize;

	$: centralLinkSourceWidth = rootD2 - 2 * parentSideMargin;
	$: linkInternalMargin =
		(centralLinkSourceWidth * (1 - linkSurfaceRate)) / (nChildren > 1 ? nChildren - 1 : 1);

	$: minimumLinkSurface = (centralLinkSourceWidth * linkSurfaceRate) / (nChildren * 1.8);

	$: divisibleChildSpace =
		treeD2 - childBaseSize * nChildLevelNodes - childrenInternalMargin * (nChildLevelNodes - 1);

	function parseChild(childId: string, childNode: EmbeddedNode) {
		const cachedProps = {
			pathInCompleteTree: [...pathInCompleteTree, childId],
			...getLeftOffsetAndWidth(
				treeD2Offset,
				childNode.weight,
				childNode?.totalOffsetOnLevel,
				childBaseSize,
				divisibleChildSpace,
				visibleTreeInfo.meta[childLevel]?.totalWeight || 1,
				childrenInternalMargin
			)
		};

		const linkSourceSetup = getLeftOffsetAndWidth(
			d2Offset + parentSideMargin,
			childNode.weight,
			childNode?.totalOffsetAmongSiblings,
			minimumLinkSurface,
			centralLinkSourceWidth * (nChildren > 1 ? linkSurfaceRate : 1) -
				minimumLinkSurface * nChildren,
			visibleNode?.childrenSumWeight || 1,
			linkInternalMargin
		);

		const lSize = {
			parent: linkSourceSetup.rootD2,
			child: cachedProps.rootD2
		};

		const d1Size = childD1 + (childNode.isSelected ? overHangSize : 0);
		const cTop = {
			x: linkSourceSetup.d2Offset,
			y: pD1Start
		};
		const cBot = {
			x: cachedProps.d2Offset,
			y: branchD1End
		};

		let linkPath = '';
		if (isWideScreen) {
			linkPath = getSankeyPath(cTop, cBot, lSize, d1Size, downWardStart);
		} else {
			linkPath = getHorizolntalSankeyPath(
				{ x: cTop.y, y: cTop.x },
				{ x: cBot.y, y: cBot.x },
				lSize,
				d1Size,
				downWardStart
			);
		}
		const textShape = flipIf(
			{
				x: cachedProps.d2Offset + lSize.child * 0.18,
				y: childrenD1Offset - childD1 * 0.05,
				height: childD1 * 0.9,
				width: lSize.child * 0.64
			},
			!isWideScreen
		);
		const hoverShape = flipIf(
			{
				x: cachedProps.d2Offset,
				y: branchD1End,
				height: childD1,
				width: lSize.child
			},
			!isWideScreen
		);
		return {
			id: childId,
			cachedProps,
			vizInfo: {
				linkPath,
				d2Size: lSize.child,
				colorStr: getColor(childNode.scaleEnds.mid),
				strId: cachedProps.pathInCompleteTree.join('-')
			},
			childNode,
			textShape,
			hoverShape
		};
	}

	function getLeftOffsetAndWidth(
		baseOffset: number,
		weight: number,
		totalOffset: OffsetInfo | undefined,
		baseSize: number,
		divisibleSpace: number,
		totalWeight: number,
		internalMargin: number
	) {
		const fDiv = (x: number | undefined) => (divisibleSpace * (x || 0)) / totalWeight;
		const rootD2 = baseSize + fDiv(weight);
		const d2Offset =
			baseOffset +
			(totalOffset?.rank || 0) * (baseSize + internalMargin) +
			fDiv(totalOffset?.weight);
		return { rootD2, d2Offset };
	}

	function getParsedChildren(visibleNode: EmbeddedNode | undefined, _: object, __: boolean) {
		return Object.entries(visibleNode?.children || {}).map(([id, child]) => parseChild(id, child));
	}

	$: parsedChildren = getParsedChildren(visibleNode, currentLevelViz, isWideScreen);
</script>

{#each parsedChildren as { id, cachedProps, vizInfo, childNode, textShape, hoverShape } (id)}
	<defs>
		<linearGradient id="path-grad-{vizInfo.strId}" gradientTransform="rotate(90)">
			{#each [[0, 5], [20, 15], [50, 25]] as [offsetPct, opaPct]}
				<stop
					offset="{offsetPct}%"
					stop-opacity={childNode.isSelected ? '80%' : `${opaPct}%`}
					stop-color={vizInfo.colorStr}
				/>
			{/each}
		</linearGradient>
	</defs>

	<path
		transition:fade={{ duration: 300 }}
		d={vizInfo.linkPath}
		fill="url('#path-grad-{vizInfo.strId}')"
	/>

	<BrokenFittedText text={childNode.name} {...textShape} />

	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<rect
		{...hoverShape}
		fill-opacity="0"
		on:mouseover={treeInteract(
			dispatch,
			'highlight',
			cachedProps.pathInCompleteTree,
			hoverShape.x,
			hoverShape.y
		)}
		on:mouseleave={treeInteract(dispatch, 'de-highlight', cachedProps.pathInCompleteTree, 0, 0)}
		on:click={treeInteract(dispatch, 'toggle-select', cachedProps.pathInCompleteTree, 0, 0)}
	/>

	{#if childNode.children}
		<svelte:self
			{...cachedProps}
			{isWideScreen}
			{qcSpec}
			{attributeLabels}
			{visibleTreeInfo}
			{selectionState}
			{levelVisuals}
			{treeD2}
			{treeD2Offset}
			{childD1Rate}
			{overHangRate}
			{preStraightRate}
			{childBaseSize}
			{linkSurfaceRate}
			{childrenInternalMargin}
			parentSideMargin={0}
			on:ti
		/>
	{/if}
{/each}

<style>
	path,
	rect,
	stop {
		transition: 0.8s;
	}
</style>
