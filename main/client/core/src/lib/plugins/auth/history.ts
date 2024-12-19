import {isNullOrEmpty} from "../../core/common.js";

/**
 * 缓存过期会话，判断请求是否过期
 */
export default class SessionHistory {
    // store up to 10 sessions, include expired or not
    _history: (Record<string, any> | null)[] = new Array(10);
    // next session storage location
    _position: number = 0;
    _size: number = 0;

    get size(): number {
        return this._size;
    }

    // store primary keys for session
    add(session: Record<string, any>): void {
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

    // session exist or not
    check(jwt: string): boolean {
        return this._history.some(session => {
            if (session) {
                const {access_token, accessToken, token} = session;
                return (access_token || accessToken || token) === jwt;
            }
            return false;
        });
    }

    // mark the session expired
    deprecate(session: Record<string, any>): void {
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

    // remove expired sessions
    clean(): void {
        for (let i = 0; i < this._history.length; ++i) {
            const s = this._history[i];
            if (s && s.invalid) {
                this._history[i] = null;
            }
        }
        this._size = this._history.reduce((s, i) => i ? s + 1 : s, 0);
    }

    // is the session expired
    isDeprecated(session: Record<string, any>): boolean {
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