import { AS_PATH, STORE_URL } from "./constants";
import type { AttributeLabels } from "./tree-types";

export function handleStore<T, R>(endPoint: string, fun: (o: T) => R) {
    let headers = { 'ngrok-skip-browser-warning': '1' }
    // let headers = {}
    return fetch(`${STORE_URL}/${endPoint.replace('+', '%2B')}.json.gz`, { headers }).then((res) => {
        return res.json().then((jsv) => {
            return fun(jsv);
        }).catch((e) => {
            console.error("error ar", endPoint, e)
        });
    });
}

export function handleLabels(fun: (o: AttributeLabels) => void) {
    handleStore(AS_PATH, fun);
}

