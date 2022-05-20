import {v4 as uuid} from "uuid";

const CHANNEL_SIZE = 5;

function initChannel() {
    const arr = [];
    for (let i = 0; i < CHANNEL_SIZE; ++i) {
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
    access_tokens: [],
    refresh_tokens: []
}, action) {

    switch (action.type) {
        case "SET_ACCESS_TOKEN": {
            return Object.assign({}, state, {
                access_tokens: [].concat(state.access_tokens).concat(action.access_tokens)
            });
        }
        case "SET_REFRESH_TOKEN": {
            return Object.assign({}, state, {
                refresh_tokens: [].concat(state.refresh_tokens).concat(action.refresh_tokens)
            });
        }
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