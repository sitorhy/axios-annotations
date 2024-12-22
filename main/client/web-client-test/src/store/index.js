import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import {combineReducers} from "redux";

import basic from "./modules/basic";
import auth from "./modules/auth";

const store = createStore(combineReducers({
    basic,
    auth
}), applyMiddleware(thunkMiddleware));

export default store;