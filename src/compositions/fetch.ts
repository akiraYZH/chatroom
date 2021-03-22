import { fetchInterface } from "../types/types";
import * as config from "../../server/config.json";

const _fetch: fetchInterface=  (api, data) => {
    let path = process.env.NODE_ENV === config.ENV.DEV ? config.ENV.DEV_URL : config.ENV.PRO_URL;
    return fetch(path + api, data);
}

export default _fetch;