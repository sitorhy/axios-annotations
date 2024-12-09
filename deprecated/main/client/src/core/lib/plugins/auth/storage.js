export default class SessionStorage {
    _inMemoryStorage = {};

    async set(key, value) {
        if (window && window.sessionStorage) {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        } else if (wx && wx.setStorageSync) {
            wx.setStorageSync(key, value);
        } else if (my && my.setStorageSync) {
            my.setStorageSync(key, value);
        } else if (tt && tt.setStorageSync) {
            tt.setStorageSync(key, value);
        } else {
            this._inMemoryStorage[key] = value;
        }
    }

    async get(key) {
        if (window && window.sessionStorage) {
            const value = window.sessionStorage.getItem(key);
            return JSON.parse(value);
        } else if (wx && wx.getStorageSync) {
            return wx.getStorageSync(key);
        } else if (my && my.getStorageSync) {
            return my.getStorageSync(key);
        } else if (tt && tt.getStorageSync) {
            return tt.getStorageSync(key);
        } else {
            return this._inMemoryStorage[key];
        }
    }

    async remove(key) {
        if (window && window.sessionStorage) {
            window.sessionStorage.removeItem(key);
        } else if (wx && wx.removeStorageSync) {
            wx.removeStorageSync(key);
        } else if (my && my.removeStorageSync) {
            my.removeStorageSync(key);
        } else if (tt && tt.removeStorageSync) {
            tt.removeStorageSync(key);
        } else {
            delete this._inMemoryStorage[key];
        }
    }
}
