<script lang="ts">
	import type {
		AttributeLabels,
		NamedNode,
		PathInTree,
		QcSpec,
		WeightedNode
	} from '$lib/tree-types';
	import {formatNumber} from '$lib/text-format-util';
	import {getNodeByPath, getChildName} from '$lib/tree-functions';
	import {getSpecMetricObject} from '$lib/metric-calculation';

	export let rootId: string;
	export let path: PathInTree;
	export let qcSpec: QcSpec;
	export let attributeLabels: AttributeLabels;
	export let weightedRoot: WeightedNode;

	function getNodes(path: PathInTree, weightedRoot: WeightedNode): NamedNode[] {
		if (qcSpec?.root_entity_type === undefined) {
			return [];
		}
		const nodes = [
			{...weightedRoot, name: attributeLabels[qcSpec.root_entity_type][rootId].name}
		];
		for (let i = 0; i < path.length; i++) {
			const parentPath = path.slice(0, i + 1);
			const pNode = getNodeByPath(parentPath, weightedRoot);
			const name = getChildName(parentPath, attributeLabels, qcSpec);
			nodes.push({...(pNode || {weight: 0}), name});
		}
		return nodes;
	}

	function getVolumeInfo(leaf: WeightedNode, parent: WeightedNode) {
		const num = leaf?.weight || 0;
		const comparison = (parent?.weight || 0) / Object.keys(parent?.children || {}).length;
		const rate = num / comparison;
		return {num, comparison, rate, desc: getDesc(rate)};
	}

	function getDesc(rate: number) {
		let desc = 'Average';
		if (rate > 1.2) {
			desc = 'High';
		} else if (rate < 0.75) {
			desc = 'Low';
		}
		return desc;
	}

	$: pathNodes = getNodes(path || [], weightedRoot);

	$: parent = pathNodes[pathNodes.length - 2];
	$: leaf = pathNodes[pathNodes.length - 1];

	$: volumeInfo = getVolumeInfo(leaf, parent);
	$: specInfo = getSpecMetricObject(weightedRoot, path, qcSpec, attributeLabels);
</script>

{#if path != undefined}
<div class="box-container">
	<h2>{leaf.name}</h2>
	<p>{getDesc(specInfo.specMetric)} Specialization</p>
	<p>
		{formatNumber(volumeInfo.num)} ({(specInfo.nodeRate * 100).toFixed(2)}%) citation{#if volumeInfo.num >
		1}s{/if}
	</p>
</div>
{/if}

<style>
	h2 {
		text-align: center;
		padding: 15px;
		font-size: min(1.1rem, 2vw);
	}

	h2,
	h3 {
		margin: 0px;
		text-align: center;
	}

	p {
		text-align: center;
		font-size: min(1rem, 2vw);
	}

	h3,
	p {
		padding-left: 20px;
	}

	.box-container {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		height: 100%;
	}
</style>
