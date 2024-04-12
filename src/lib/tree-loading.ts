import { STORE_URL, type EntityType } from "./constants";
import { IGNORED_BASES, specBaseKindToStr } from "./metric-calculation";
import type { AttributeLabelsRaw, QcSpecMap, SomeSpecBaselineMap } from "./tree-types";

export function handleStore<T, R>(endPoint: string, fun: (o: T) => R) {
    return fetch(`${STORE_URL}/${endPoint.replace('+', '%2B')}.json.gz`).then((res) => {
        return res.json().then((jsv) => {
            return fun(jsv);
        }).catch(() => {
            console.error(endPoint)
        });
    });
}

export function mainPreload() {


    const arResp = handleStore('attribute-statics', (jsv: AttributeLabelsRaw) => {
        for (let k of Object.keys(jsv)) {
            for (let k2 of Object.keys(jsv[k])) {
                try {
                    jsv[k][k2].meta = JSON.parse(jsv[k][k2].meta)
                } catch { }
            }
        }
        return jsv
    });

    const qcSpecResp = handleStore('qc-specs', (qcSpecs: QcSpecMap) => {
        return qcSpecs
    });

    const specResp = handleStore('available-rca-baselines', (jsv: { baselines: [string, EntityType, string, string][] }) => {
        const specEntriyResps = []
        for (const [rootTypeId, target, basis, hierarchy] of jsv.baselines) {
            const basisName = specBaseKindToStr(rootTypeId, target, basis, hierarchy);
            if (IGNORED_BASES.includes(basisName)) continue;
            specEntriyResps.push(handleStore(`rca-baselines/${basisName}`, (o: SomeSpecBaselineMap) => {
                return [basisName, o];
            }))
        }

        return Promise.all(specEntriyResps).then(Object.fromEntries)
    });

    return Promise.all([
        arResp, qcSpecResp, specResp
    ])
}


