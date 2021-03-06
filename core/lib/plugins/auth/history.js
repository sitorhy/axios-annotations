import {isNullOrEmpty} from "../../core/common";

export default class SessionHistory {
    _history = new Array(10);
    _position = 0;
    _size = 0;

    get size() {
        return this._size;
    }

    add(session) {
        if (Object.keys(session).every(i => isNullOrEmpty(session[i]))) {
            return;
        }
        const {access_token, accessToken, token, refresh_token, refreshToken} = session;
        this._history[this._position] = Object.assign({}, session, {
            access_token: access_token || accessToken || token,
            refresh_token: refresh_token || refreshToken,
            invalid: false
        });
        this._position++;
        this._position %= this._history.length;
        this._size = this._history.reduce((s, i) => i ? s + 1 : s, 0);
    }

    check(jwt) {
        return this._history.some(session => {
            if (session) {
                const {access_token, accessToken, token} = session;
                return (access_token || accessToken || token) === jwt;
            }
            return false;
        });
    }

    deprecate(session) {
        let position = 0;
        const {refresh_token, refreshToken} = session;
        const matching = this._history.find((s, i) => {
            position = i;
            if (s) {
                return (s.refresh_token || s.refreshToken) === (refresh_token || refreshToken);
            }
            return false;
        });
        if (matching) {
            matching.invalid = true;
            const first = this._history[0];
            this._history[0] = this._history[position];
            this._history[position] = first;
        }
    }

    clean() {
        for (let i = 0; i < this._history.length; ++i) {
            const s = this._history[i];
            if (s && s.invalid) {
                this._history[i] = null;
            }
        }
        this._size = this._history.reduce((s, i) => i ? s + 1 : s, 0);
    }

    isDeprecated(session) {
        return this._history.some(s => {
            if (s) {
                const {refresh_token, refreshToken} = session;
                if (refresh_token || refreshToken) {
                    return (s.refresh_token || s.refreshToken) === (refresh_token || refreshToken) && s.invalid;
                }
            }
            return false;
        })
    }
}