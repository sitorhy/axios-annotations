import {isNullOrEmpty} from "../../core/common";

export default class SessionHistory {
    static HistorySize = 10;

    _history = new Array(SessionHistory.HistorySize);
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
        this._history[this._position % SessionHistory.HistorySize] = {
            access_token: access_token || accessToken || token,
            refresh_token: refresh_token || refreshToken,
            invalid: false
        };
        this._position %= SessionHistory.HistorySize;
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
        const {refresh_token, refreshToken} = session;
        const matching = this._history.find(s => {
            if (s) {
                return (s.refresh_token || s.refreshToken) === (refresh_token || refreshToken);
            }
            return false;
        });
        if (matching) {
            matching.invalid = true;
        }
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