import TestService from "./basic-service";

export default async function testUnit() {
    const service = new TestService();
    const results = {};

    try {
        const res = await service.hello("world");
        Object.assign(results, {
            "/hello": res.data
        });
    } catch (e) {
        Object.assign(results, {
            "/hello": e.message
        });
    }

    try {
        const res = await service.postMessage("hello", window.navigator.userAgent);
        Object.assign(results, {
            "/postMessage": res.data
        });
    } catch (e) {
        Object.assign(results, {
            "/postMessage": e.message
        });
    }

    try {
        const res = await service.postJSON("hello world");
        Object.assign(results, {
            "/postJSON": res.data.message
        });
    } catch (e) {
        Object.assign(results, {
            "/postJSON": e.message
        });
    }

    try {
        const res = await service.baiduHome();
        Object.assign(results, {
            "/pic": res.data
        });
    } catch (e) {
        Object.assign(results, {
            "/pic": e.message
        });
    }

    return results;
}