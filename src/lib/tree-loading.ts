import { STORE_URL } from "./constants";
import type { AttributeLabelsRaw, QcSpecMap } from "./tree-types";

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
    return Promise.all([arResp, qcSpecResp])
}

