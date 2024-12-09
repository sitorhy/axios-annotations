import config from "./heavy-config";

import Service from "../core/service";
import RequestConfig from "../decorator/request-config";
import RequestMapping from "../decorator/request-mapping";
import RequestHeader from "../decorator/request-header";
import AbortSource, {AbortControllerAdapter} from "../decorator/abort-source";
import axios from "axios";

export const testAbortController = new AbortController();

export const AbortManager = {

    _controller: null,
    _cancelTokenAdapter: null,

    get() {
        return AbortManager._controller;
    },

    create() {
        AbortManager._controller = new AbortController();
        return AbortManager._controller;
    },

    createCancelToken() {
        AbortManager._cancelTokenAdapter = new AbortControllerAdapter(axios.CancelToken);
        return AbortManager._cancelTokenAdapter;
    },

    getCancelToken() {
        return AbortManager._cancelTokenAdapter;
    }

}

@RequestConfig(config)
@RequestMapping("/heavy")
export default class AuthTestService extends Service {

    @RequestMapping("/time", "GET")
    @RequestHeader("Content-Type", "text/plain")
    /*
    @RequestConfig(() => {
        return {
            signal: testAbortController.signal
        }
    })*/
    @AbortSource(testAbortController)
    //@AbortSource(() => testAbortController)
    getTimeByAnnotation() {
        return {};
    }


    getTimeByFunction() {
        return this.requestWith("GET", "/time")
            .abort(AbortManager.create).send();
    }

    @RequestMapping("/time", "GET")
    @RequestHeader("Content-Type", "text/plain")
    @AbortSource(AbortManager.createCancelToken)
    cancelTokenTest() {
        return {};
    }
}
