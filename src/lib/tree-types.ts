export type OMap<T> = Record<string, T>;
export type PathInTree = string[];
export type TreeGen<T> = T & { children?: OMap<TreeGen<T>> };

export type SelectionOption = {
    name: string;
    id: string;
    rootType: string;
    meta?: OMap<string>;
};

export type QcSpec = {
    root_entity_type: string;
    bifurcations: Bifurcation[];
};

export type Bifurcation = {
    attribute_kind: string;
    resolver_id: string;
    description: string;
    source_side: boolean;
};


export type QcSpecMap = OMap<QcSpec>;

export type AttributeLabel = { name: string; spec_baselines: OMap<number>; meta: OMap<string> };
export type AttributeLabels = OMap<OMap<AttributeLabel>>;


export type BareNode = TreeGen<object>;
export type WeightedNode = TreeGen<{ weight: number, source_count: number, top_source: [number, number] }>;
export type NamedNode = TreeGen<{ weight: number; name: string }>;
export type EmbeddedNode = TreeGen<{
    weight: number,
    name: string,
    totalOffsetOnLevel: OffsetInfo
    childrenSumWeight: number;
    totalOffsetAmongSiblings: OffsetInfo;
    isSelected: boolean;
    scaleEnds: { min: number; max: number; mid: number };
}>;


export type OffsetInfo = { rank: number; weight: number };

export type InteractionKind = 'toggle-select' | 'highlight' | 'de-highlight';
type SizeBaseKind = 'volume' | 'specialization';

export type TreeInteractionEvent = { path: PathInTree; action: InteractionKind, topLeftCorner: { x: number, y: number } };


export type DerivedLevelInfo = { totalWeight: number; totalNodes: number };

export type TreeInfo = { tree: EmbeddedNode; meta: DerivedLevelInfo[] };
export type ControlSpec = { exclude: string[]; include: string[]; limit_n: number; show_top: boolean; size_base: SizeBaseKind };

export type BreakdownOptions = OMap<{ children: BreakdownOptions, qcSpecs: string[] }>;
export type SelectedBreakdowns = string[];
export type LevelOutSpec = { totalSize: number; topOffset: number, isVisible: boolean, levelOptions: string[] };

