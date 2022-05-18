import config from "../../core/test/basic-config";

export default function (state = {
    baseURL: config.baseURL,
    result: {}
}, action) {
    switch (action.type) {
        case "SET_RESULT": {
            return Object.assign({}, state, {
                result: action.payload
            });
        }
        default:
            return state;
    }
}