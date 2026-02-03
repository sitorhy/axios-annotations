// 微信小程序
declare const wx: {
    setStorageSync: (key: string, data: any) => void;
    getStorageSync: (key: string) => any;
    removeStorageSync: (key: string) => void;
};
// 支付宝小程序
declare const my: {
    setStorageSync: (key: string, data: any) => void;
    getStorageSync: (key: string) => any;
    removeStorageSync: (key: string) => void;
};
// 字节小程序
declare const tt: {
    setStorageSync: (key: string, data: any) => void;
    getStorageSync: (key: string) => any;
    removeStorageSync: (key: string) => void;
};

export default class SessionStorage {
    _inMemoryStorage: Record<string, any> = {};

    async set(key: string, value: any) {
        if (window && window.sessionStorage) {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        } else if (wx && wx.setStorageSync) {
            wx.setStorageSync(key, value);
        } else if (my && my.setStorageSync) {
            my.setStorageSync(key, value);
        } else if (tt && tt.setStorageSync) {
            tt.setStorageSync(key, value);
        } else {
            // 使用内存环境
            this._inMemoryStorage[key] = value;
        }
    }

    async get(key: string): Promise<any> {
        if (window && window.sessionStorage) {
            const value = window.sessionStorage.getItem(key);
            return value ? JSON.parse(value) : value;
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

    async remove(key: string) {
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
