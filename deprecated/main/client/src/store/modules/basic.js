export default function (state = {
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