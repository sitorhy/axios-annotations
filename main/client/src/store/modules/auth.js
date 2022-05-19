import {v4 as uuid} from "uuid";

function initChannel() {
    const arr = [];
    for (let i = 0; i < 20; ++i) {
        arr.push({
            id: uuid(),
            marker: "",
            status: "pending",
            error: null
        });
    }
    return arr;
}

export default function (state = {
    results: {
        channel1_1: [],
        channel2_1: [],
        channel1_2: [],
        channel2_2: []
    },
    access_token: "",
    refresh_token: ""
}, action) {
    switch (action.type) {
        case "CLEAR": {
            return Object.assign({}, state, {
                results: {
                    channel1_1: initChannel(),
                    channel2_1: initChannel(),
                    channel1_2: initChannel(),
                    channel2_2: initChannel()
                }
            });
        }
        case "COMMIT_CHANNEL_ITEM": {
            const {id, marker, channel, error, status} = action;
            const {[channel]: arr} = state.results;
            const item = arr.find(i => i.id === id);
            if (marker) {
                item.marker = marker;
            }
            if (error) {
                item.error = error;
            }
            if (status) {
                item.status = status;
            }
            return Object.assign({}, state, {
                results: {
                    ...state.results,
                    [channel]: [...arr]
                }
            });
        }
        default:
            return state;
    }
}