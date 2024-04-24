import { getEntityKind, getNodeByPath } from './tree-functions';

import type { QcSpec, PathInTree, AttributeLabels, WeightedNode } from './tree-types'


export function getSpecMetricObject(
    weightedRoot: WeightedNode,
    path: PathInTree,
    qcSpec: QcSpec,
    attributeLabels: AttributeLabels
): { nodeDivisor: number, nodeRate: number, baselineRate: number, specMetric: number } {


    const node = getNodeByPath(path, weightedRoot);
    const onLevel = path.length - 1;
    const childId = path[onLevel]

    let relevantParent = getNodeByPath(path.slice(0, -1), weightedRoot);
    let siblingCount = 1;;

    const entityKind = getEntityKind(path, qcSpec);
    const finalResolver = qcSpec.bifurcations[onLevel].resolver_id;

    for (let i = onLevel - 1; i > 0; i--) {
        siblingCount = siblingCount * Object.keys(relevantParent?.children || {}).length;
        if (qcSpec.bifurcations[i].resolver_id == finalResolver) {
            relevantParent = getNodeByPath(path.slice(0, i - 1), weightedRoot);
        } else {
            break
        }
    }

    const normalizerEps = 1 / siblingCount
    const nodeDivisor = relevantParent?.weight || 0;
    const baselineRate: number = attributeLabels[entityKind][childId]?.specBaseline || 0
    const nodeRate = (node?.weight || 0) / nodeDivisor

    return {
        nodeRate, nodeDivisor, baselineRate, specMetric: (nodeRate + normalizerEps) / (baselineRate + normalizerEps)
    }
}



